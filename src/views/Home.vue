<template>
  <div class="app" :class="{ 'board-open': boardPanelOpen, 'simple-mode': !isAuthenticated }">
    <!-- 사이드바 -->
    <Sidebar
      v-if="isAuthenticated"
      :collapsed="sidebarCollapsed"
      :chatHistoryItems="chatHistoryItems"
      :workflowItems="workflowItems"
      :activeMenu="activeMenu"
      @toggle-sidebar="toggleSidebar"
      @new-chat="newChat"
      @select-chat="selectChatHistory"
      @select-workflow="selectWorkflow"
      @show-dropdown="showDropdown"
      @rename-item="renameItem"
      @delete-item="deleteItem"
    />

    <!-- 메인 컨텐츠 -->
    <div class="main-content" :style="{ marginRight: (isAuthenticated && workflowPanelOpen) ? workflowPanelWidth + 'px' : '0px' }">
      <!-- 헤더 -->
      <Header
        :isConnected="isBackendConnected"
        :backendStatus="backendStatus"
        :isAuthenticated="isAuthenticated"
        @go-to-board="goToBoard"
        @go-to-login="goToLogin"
        @logout="handleLogout"
        @retry-connection="checkBackendConnection"
      />
      
      <!-- 라우터 뷰 (Chat 컴포넌트가 여기에 렌더링) -->
      <router-view 
        :messages="messages"
        :inputText="inputText"
        :showWelcome="showWelcome"
        :isDragging="isDragging"
        :uploadedFiles="uploadedFiles"
        @send-message="sendMessage"
        @handle-keydown="handleKeydown"
        @handle-file-upload="handleFileUpload"
        @handle-drag-enter="handleDragEnter"
        @handle-drag-over="handleDragOver"
        @handle-drag-leave="handleDragLeave"
        @handle-drop="handleDrop"
        @update:input-text="inputText = $event"
        @remove-uploaded-file="removeUploadedFile"
      />
    </div>

    <!-- 워크플로우 패널 -->
    <WorkflowPanel
      v-if="isAuthenticated && workflowPanelOpen"
      :selectedWorkflow="selectedWorkflow"
      :workflowPanelWidth="workflowPanelWidth"
      @close-panel="closeWorkflowPanel"
      @start-resize="startResize"
    />

    <!-- 게시판 패널 -->
    <BoardPanel
      :isOpen="boardPanelOpen"
      @close="closeBoardPanel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.ts'
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'
import WorkflowPanel from '@/components/WorkflowPanel.vue'
import BoardPanel from '@/components/BoardPanel.vue'
import { useChatManagement } from '@/composables/useChatManagement'
import { useWorkflowManagement } from '@/composables/useWorkflowManagement'
import type { ChatHistoryItem, WorkflowItem } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

// 인증 상태
const isAuthenticated = computed(() => authStore.isAuthenticated)

// 상태 관리
const { 
  messages,
  inputText,
  showWelcome,
  chatHistoryItems,
  currentChatId,
  uploadedFiles,
  isDragging,
  isBackendConnected,
  backendStatus,
  sendMessage,
  newChat,
  selectChatHistory,
  handleKeydown,
  handleFileUpload,
  handleDragEnter,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  removeUploadedFile,
  checkBackendConnection
} = useChatManagement()

const {
  workflowItems,
  workflowPanelOpen,
  selectedWorkflow,
  workflowPanelWidth,
  selectWorkflow,
  closeWorkflowPanel,
  startResize
} = useWorkflowManagement()

// UI 상태
const sidebarCollapsed = ref(false)
const activeMenu = ref<string | null>(null)
const boardPanelOpen = ref(false)

// UI 메서드
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const showDropdown = (itemId: string | number, type: string, event: Event) => {
  event.stopPropagation()
  const menuKey = type + '-' + itemId
  
  if (activeMenu.value === menuKey) {
    activeMenu.value = null
  } else {
    activeMenu.value = menuKey
    
    nextTick(() => {
      const button = (event.target as HTMLElement).closest('.item-menu-btn') as HTMLElement
      const dropdown = button?.parentElement?.querySelector('.dropdown-menu') as HTMLElement
      if (button && dropdown) {
        const rect = button.getBoundingClientRect()
        dropdown.style.top = rect.top + 'px'
        dropdown.style.left = (rect.right + 8) + 'px'
      }
    })
  }
}

const renameItem = (item: ChatHistoryItem | WorkflowItem) => {
  const newName = prompt('새로운 이름을 입력하세요:', item.title)
  if (newName && newName.trim()) {
    item.title = newName.trim()
  }
  activeMenu.value = null
}

const deleteItem = (itemId: number, type: string) => {
  if (confirm('정말로 삭제하시겠습니까?')) {
    if (type === 'workflow') {
      const index = workflowItems.value.findIndex(item => item.id === itemId)
      if (index > -1) workflowItems.value.splice(index, 1)
    } else if (type === 'chat') {
      const index = chatHistoryItems.value.findIndex(item => item.id === itemId)
      if (index > -1) chatHistoryItems.value.splice(index, 1)
      if (currentChatId.value === itemId) {
        newChat()
      }
    }
  }
  activeMenu.value = null
}

// 헤더 액션
const goToBoard = () => {
  router.push('/board')
}

const closeBoardPanel = () => {
  boardPanelOpen.value = false
}

const goToLogin = () => {
  router.push('/login')
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}

// 글로벌 이벤트
const handleGlobalKeydown = (event: KeyboardEvent) => {
  if (event.ctrlKey && event.shiftKey && event.key === 'O') {
    event.preventDefault()
    newChat()
  }
}

const closeDropdown = () => {
  activeMenu.value = null
}

let connectionInterval: number

onMounted(async () => {
  document.addEventListener('keydown', handleGlobalKeydown)
  document.addEventListener('click', closeDropdown)
  
  // 인증 상태 확인
  await authStore.checkAuthStatus()
  
  // 백엔드 연결 확인
  checkBackendConnection()
  // 5초마다 연결 확인
  connectionInterval = setInterval(checkBackendConnection, 5000)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
  document.removeEventListener('click', closeDropdown)
  if (connectionInterval) {
    clearInterval(connectionInterval)
  }
})
</script>

<style>
@import '@/assets/styles/main.css';

.app {
  display: flex;
  height: 100vh;
}

/* 간단 모드 (로그인하지 않은 상태) */
.app.simple-mode .main-content {
  margin-left: 0;
  width: 100%;
}

/* 게시판이 열렸을 때 채팅창 스타일 조정 */
.app.board-open .main-content {
  filter: blur(2px);
  pointer-events: none;
}

.app.board-open .sidebar {
  filter: blur(2px);
  pointer-events: none;
}

.app.board-open .workflow-panel {
  filter: blur(2px);
  pointer-events: none;
}
</style>
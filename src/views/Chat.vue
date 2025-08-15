<template>
  <div class="app" :class="{ 'board-open': boardPanelOpen }">
    <!-- 사이드바 -->
    <Sidebar
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
    <div class="main-content" :style="{ marginRight: workflowPanelOpen ? workflowPanelWidth + 'px' : '0px' }">
      <!-- 헤더 -->
      <Header
        :isConnected="isBackendConnected"
        :backendStatus="backendStatus"
        @download-json="downloadJsonFile"
        @go-to-board="goToBoard"
        @go-to-login="goToLogin"
        @retry-connection="checkBackendConnection"
      />
      
      <!-- 채팅 영역 -->
      <ChatArea
        :showWelcome="showWelcome"
        :messages="messages"
        :inputText="inputText"
        :isDragging="isDragging"
        :uploadedFiles="uploadedFiles"
        :formatFileSize="formatFileSize"
        :getFileIcon="getFileIcon"
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
      v-if="workflowPanelOpen"
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
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'
import ChatArea from '@/components/ChatArea.vue'
import WorkflowPanel from '@/components/WorkflowPanel.vue'
import BoardPanel from '@/components/BoardPanel.vue'
import { useChatManagement } from '@/composables/useChatManagement'
import { useWorkflowManagement } from '@/composables/useWorkflowManagement'
import type { ChatHistoryItem, WorkflowItem } from '@/types'

const router = useRouter()

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
  useExamplePrompt,
  handleKeydown,
  handleFileUpload,
  handleDragEnter,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  removeUploadedFile,
  formatFileSize,
  getFileIcon,
  checkBackendConnection
} = useChatManagement()

const {
  workflowItems,
  workflowPanelOpen,
  selectedWorkflow,
  workflowPanelWidth,
  isResizing,
  selectWorkflow,
  closeWorkflowPanel,
  startResize,
  downloadJsonFile
} = useWorkflowManagement()


// UI 상태
const sidebarCollapsed = ref(false)
const activeMenu = ref<string | null>(null)
const boardPanelOpen = ref(false)

// 채팅 컴포넌트 워크플로우 처리

// UI 메서드
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const showDropdown = (itemId: number, type: string, event: Event) => {
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

const renameItem = (item: ChatHistoryItem | WorkflowItem, type: string) => {
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
  window.location.href = 'login.html'
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

let connectionInterval: NodeJS.Timeout

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
  document.addEventListener('click', closeDropdown)
  
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
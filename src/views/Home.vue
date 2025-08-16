<template>
  <div class="app" :class="{ 'board-open': boardPanelOpen, 'simple-mode': !isAuthenticated }">
    <!-- 사이드바 -->
    <Sidebar
      v-if="isAuthenticated"
      :collapsed="sidebarCollapsed"
      :chatHistoryItems="chatHistoryItems"
      @toggle-sidebar="toggleSidebar"
      @new-chat="newChat"
      @new-project="handleNewProject"
      @select-chat="selectChatHistory"
      @select-workflow="handleSelectWorkflow"
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
      @close-panel="closeWorkflowPanelGlobally"
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
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.ts'
import Sidebar from '@/views/Sidebar.vue'
import Header from '@/components/Header.vue'
import WorkflowPanel from '@/components/WorkflowPanel.vue'
import BoardPanel from '@/components/BoardPanel.vue'
import { useChatManagement } from '@/composables/useChatManagement'
import { useWorkflowManagement } from '@/composables/useWorkflowManagement'
import { initializeWorkflowSelection, closeWorkflowPanelGlobally } from '@/utils/workflowSelection'
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
  startResize
} = useWorkflowManagement()

// UI 상태
const sidebarCollapsed = ref(false)
const boardPanelOpen = ref(false)

// UI 메서드
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const handleSelectWorkflow = (workflow: any) => {
  // 워크플로우 선택 시 패널 열기
  selectWorkflow(workflow)
}

const handleNewProject = () => {
  console.log('새 프로젝트 생성')
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


let connectionInterval: number

onMounted(async () => {
  document.addEventListener('keydown', handleGlobalKeydown)
  
  // 워크플로우 선택 상태 초기화
  initializeWorkflowSelection()
  
  // 인증 상태 확인
  await authStore.checkAuthStatus()
  
  // 백엔드 연결 확인
  checkBackendConnection()
  // 5초마다 연결 확인
  connectionInterval = setInterval(checkBackendConnection, 5000)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
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
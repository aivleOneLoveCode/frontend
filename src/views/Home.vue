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
import { useChatStore } from '@/stores/chat.ts'
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'
import WorkflowPanel from '@/components/WorkflowPanel.vue'
import BoardPanel from '@/components/BoardPanel.vue'
import { FileUploadService, type UploadedFile } from '@/services/fileUpload'
import type { ChatHistoryItem, WorkflowItem } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const chatStore = useChatStore()

// 인증 상태
const isAuthenticated = computed(() => authStore.isAuthenticated)

// 채팅 관련 상태
const inputText = ref('')
const isDragging = ref(false)
const isBackendConnected = ref(false)
const backendStatus = ref('연결 중...')

// Computed properties
const messages = computed(() => chatStore.currentMessages)
const showWelcome = computed(() => messages.value.length === 0)
const uploadedFiles = computed(() => chatStore.uploadedFiles)
const chatHistoryItems = computed(() => 
  chatStore.sessions.map(session => ({
    id: session.session_id,
    title: session.title,
    active: session.active
  }))
)

// 워크플로우 관련 (임시로 빈 상태)
const workflowItems = ref<WorkflowItem[]>([])
const selectedWorkflow = ref<WorkflowItem | null>(null)
const workflowPanelOpen = ref(false)
const workflowPanelWidth = ref(400)

// UI 상태
const sidebarCollapsed = ref(false)
const activeMenu = ref<string | null>(null)
const boardPanelOpen = ref(false)

// 채팅 기능
const sendMessage = async () => {
  console.log('🚨 [Home.vue] sendMessage 함수 호출됨!')
  console.log('🚨 [Home.vue] inputText:', inputText.value)
  console.log('🚨 [Home.vue] uploadedFiles:', uploadedFiles.value)
  
  if (!inputText.value.trim() && uploadedFiles.value.length === 0) return
  if (!chatStore.canSendMessage) return

  try {
    console.log('🚨 [Home.vue] chatStore.sendMessage 호출 전')
    await chatStore.sendMessage(inputText.value, uploadedFiles.value)
    console.log('🚨 [Home.vue] chatStore.sendMessage 호출 후')
    inputText.value = ''
  } catch (error) {
    console.error('메시지 전송 실패:', error)
  }
}

const newChat = () => {
  chatStore.startNewChat()
  inputText.value = ''
}

const selectChatHistory = (chatId: string) => {
  chatStore.selectSession(chatId)
}

// 파일 처리
const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files) return

  for (const file of Array.from(input.files)) {
    try {
      if (FileUploadService.isSupportedFileType(file)) {
        const processedFile = await FileUploadService.processUploadedFile(file)
        chatStore.addUploadedFile(processedFile)
      } else {
        alert('지원하지 않는 파일 형식입니다.')
      }
    } catch (error) {
      console.error('파일 처리 오류:', error)
      alert('파일 처리 중 오류가 발생했습니다.')
    }
  }
  
  // 입력 초기화
  input.value = ''
}

const handleDragEnter = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = true
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
}

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault()
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const x = event.clientX
  const y = event.clientY
  
  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    isDragging.value = false
  }
}

const handleDrop = async (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
  
  const files = event.dataTransfer?.files
  if (!files) return

  for (const file of Array.from(files)) {
    try {
      if (FileUploadService.isSupportedFileType(file)) {
        const processedFile = await FileUploadService.processUploadedFile(file)
        chatStore.addUploadedFile(processedFile)
      } else {
        alert(`지원하지 않는 파일 형식입니다: ${file.name}`)
      }
    } catch (error) {
      console.error('파일 처리 오류:', error)
      alert(`파일 처리 중 오류가 발생했습니다: ${file.name}`)
    }
  }
}

const removeUploadedFile = (index: number) => {
  chatStore.removeUploadedFile(index)
}

const handleKeydown = (event: KeyboardEvent) => {
  console.log('🚨 [Home.vue] handleKeydown 호출됨! key:', event.key)
  if (event.key === 'Enter') {
    if (event.shiftKey) {
      // Shift+Enter: 줄바꿈 (기본 동작)
      console.log('🚨 [Home.vue] Shift+Enter 감지 - 줄바꿈')
      return
    } else {
      // Enter: 메시지 전송
      console.log('🚨 [Home.vue] Enter 감지 - sendMessage 호출!')
      event.preventDefault()
      sendMessage()
    }
  }
}

// 백엔드 연결 확인
const checkBackendConnection = async () => {
  try {
    const connected = await chatStore.checkBackendConnection()
    isBackendConnected.value = connected
    backendStatus.value = connected ? '연결됨' : '연결 실패'
  } catch (error) {
    isBackendConnected.value = false
    backendStatus.value = '연결 실패'
  }
}

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

const renameItem = async (item: ChatHistoryItem | WorkflowItem) => {
  const newName = prompt('새로운 이름을 입력하세요:', item.title)
  if (newName && newName.trim()) {
    try {
      if ('session_id' in item) {
        // 세션 이름 변경
        await chatStore.updateSessionTitle(item.id as string, newName.trim())
      }
    } catch (error) {
      console.error('이름 변경 실패:', error)
      alert('이름 변경에 실패했습니다.')
    }
  }
  activeMenu.value = null
}

const deleteItem = async (itemId: number | string, type: string) => {
  if (confirm('정말로 삭제하시겠습니까?')) {
    try {
      if (type === 'chat') {
        await chatStore.deleteSession(itemId as string)
      }
    } catch (error) {
      console.error('삭제 실패:', error)
      alert('삭제에 실패했습니다.')
    }
  }
  activeMenu.value = null
}

// 워크플로우 관련 (임시)
const selectWorkflow = (workflow: WorkflowItem) => {
  selectedWorkflow.value = workflow
  workflowPanelOpen.value = true
}

const closeWorkflowPanel = () => {
  workflowPanelOpen.value = false
  selectedWorkflow.value = null
}

const startResize = () => {
  // 리사이즈 로직 (임시)
}

// 헤더 액션
const goToBoard = () => {
  router.push('/board')
}

const goToLogin = () => {
  router.push('/login')
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('로그아웃 실패:', error)
  }
}

const closeBoardPanel = () => {
  boardPanelOpen.value = false
}

// 컴포넌트 마운트
onMounted(async () => {
  if (isAuthenticated.value) {
    await chatStore.loadSessions()
    await checkBackendConnection()
  }
})

// 클린업
onUnmounted(() => {
  // 필요시 정리 작업
})
</script>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  background: var(--bg-color);
  color: var(--text-color);
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  transition: margin-right 0.2s ease;
}

.simple-mode .main-content {
  margin-left: 0;
}

.board-open .main-content {
  margin-right: 300px;
}

@media (max-width: 768px) {
  .app {
    flex-direction: column;
  }
  
  .main-content {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
}
</style>
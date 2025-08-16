<template>
  <div class="app" :class="{ 'board-open': boardPanelOpen, 'simple-mode': !isAuthenticated }">
    <!-- 사이드바 -->
    <Sidebar
      v-if="isAuthenticated"
      :collapsed="sidebarCollapsed"
      @toggle-sidebar="toggleSidebar"
      @new-project="handleNewProject"
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
      <router-view />
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
import { useChatStore } from '@/stores/chat.ts'
import Sidebar from '@/views/Sidebar.vue'
import Header from '@/components/Header.vue'
import WorkflowPanel from '@/components/WorkflowPanel.vue'
import BoardPanel from '@/components/BoardPanel.vue'
import { initializeWorkflowSelection, closeWorkflowPanelGlobally, globalSelectedWorkflow, globalWorkflowPanelOpen } from '@/utils/workflowSelection'
import type { WorkflowItem } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const chatStore = useChatStore() // 백엔드 연결 확인용

// 인증 상태
const isAuthenticated = computed(() => authStore.isAuthenticated)

// 백엔드 연결 상태
const isBackendConnected = ref(false)
const backendStatus = ref('연결 중...')


// 워크플로우 관련 상태 - 글로벌 상태와 연동
const selectedWorkflow = globalSelectedWorkflow
const workflowPanelOpen = globalWorkflowPanelOpen
const workflowPanelWidth = ref(400)

// UI 상태
const sidebarCollapsed = ref(false)
const boardPanelOpen = ref(false)
const activeMenu = ref<string | null>(null)

// Connection interval 관리
let connectionInterval: number | null = null



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


// 워크플로우 관련 메서드 - 글로벌 함수 사용
const handleSelectWorkflow = (workflow: any) => {
  // 글로벌 상태가 이미 관리되므로 추가 처리 불필요
  console.log('워크플로우 선택됨:', workflow.name)
}


const startResize = () => {
  // 리사이즈 로직 구현 필요
  console.log('워크플로우 패널 리사이즈')
}

const handleNewProject = () => {
  console.log('새 프로젝트 생성')
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

// 전역 키보드 이벤트 처리
const handleGlobalKeydown = (event: KeyboardEvent) => {
  // ESC 키로 메뉴 닫기
  if (event.key === 'Escape') {
    activeMenu.value = null
  }
}

// 컴포넌트 마운트
onMounted(async () => {
  document.addEventListener('keydown', handleGlobalKeydown)
  
  // 워크플로우 선택 상태 초기화
  initializeWorkflowSelection()
  
  // 인증 상태 확인
  await authStore.checkAuthStatus()
  
  
  // 백엔드 연결 확인 (1회만)
  await checkBackendConnection()
})

// 클린업
onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
  if (connectionInterval) {
    clearInterval(connectionInterval)
  }
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
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
    <div class="main-content" :style="{ marginRight: (isAuthenticated && workflowPanelOpen) ? workflowStore.workflowPanelWidth + 'px' : '0px' }">
      <!-- 헤더 -->
      <Header
        :connectionStatus="isBackendConnected"
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
      :selectedWorkflow="selectedWorkflow as WorkflowItem"
      :workflowPanelWidth="workflowStore.workflowPanelWidth"
      @close-panel="workflowStore.closeWorkflowPanel"
      @start-resize="startResize"
    />

    <!-- 게시판 패널 -->
    <BoardPanel
      :isOpen="boardPanelOpen"
      :buttonRect="boardButtonRect"
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
import { useWorkflowStore } from '@/stores/workflow'
import type { WorkflowItem } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const chatStore = useChatStore() // 백엔드 연결 확인용
const workflowStore = useWorkflowStore()

// 인증 상태
const isAuthenticated = computed(() => authStore.isAuthenticated)

// 백엔드 연결 상태
const isBackendConnected = ref(false)
const backendStatus = ref('연결 중...')


// 워크플로우 관련 상태 - 스토어 기반
const selectedWorkflow = computed(() => workflowStore.selectedWorkflow)
const workflowPanelOpen = computed(() => workflowStore.isWorkflowPanelOpen)
// 화면 크기에 따른 기본 패널 너비 계산
const getDefaultPanelWidth = () => {
  const screenWidth = window.innerWidth
  
  if (screenWidth < 768) {
    // 모바일: 화면의 90% (최소 300px)
    return Math.max(screenWidth * 0.9, 300)
  } else if (screenWidth < 1024) {
    // 태블릿: 화면의 60% (최소 400px, 최대 600px)
    return Math.min(Math.max(screenWidth * 0.6, 400), 600)
  } else if (screenWidth < 1440) {
    // 작은 데스크톱: 화면의 45% (최소 500px, 최대 700px)
    return Math.min(Math.max(screenWidth * 0.45, 500), 700)
  } else {
    // 큰 데스크톱: 화면의 40% (최소 600px, 최대 1000px)
    return Math.min(Math.max(screenWidth * 0.4, 600), 1000)
  }
}

// 패널 너비는 스토어에서 관리


// UI 상태
const sidebarCollapsed = ref(false)
const boardPanelOpen = ref(false)
const boardButtonRect = ref<DOMRect | null>(null)
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
}


const startResize = (event: MouseEvent) => {
  const startX = event.clientX
  const startWidth = workflowStore.workflowPanelWidth
  
  const handleMouseMove = (e: MouseEvent) => {
    const deltaX = startX - e.clientX // 왼쪽으로 드래그하면 증가
    const screenWidth = window.innerWidth
    
    // 화면 크기에 따른 동적 최소/최대값
    const minWidth = screenWidth < 768 ? 250 : 350
    const maxWidth = Math.min(screenWidth * 0.8, 1200) // 화면의 80% 또는 1200px 중 작은 값
    
    const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + deltaX))
    workflowStore.setWorkflowPanelWidth(newWidth)
  }
  
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

const handleNewProject = () => {
}


// 헤더 액션
const goToBoard = (buttonRect: DOMRect) => {
  boardButtonRect.value = buttonRect
  boardPanelOpen.value = true
}

const goToLogin = () => {
  router.push('/login')
}

const handleLogout = async () => {
  if (confirm('정말로 로그아웃하시겠습니까?')) {
    try {
      // 채팅 데이터 먼저 초기화
      chatStore.clearAllData()
      // 인증 스토어 로그아웃
      await authStore.logout()
      // 강제 페이지 새로고침으로 완전 초기화
      window.location.href = '/login'
    } catch (error) {
      console.error('로그아웃 실패:', error)
    }
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

// 창 크기 변경 감지 및 패널 크기 재조정
const handleResize = () => {
  const currentWidth = workflowStore.workflowPanelWidth
  const newDefaultWidth = getDefaultPanelWidth()
  const screenWidth = window.innerWidth
  
  // 현재 패널이 화면에 비해 너무 크면 조정
  if (currentWidth > screenWidth * 0.8) {
    workflowStore.setWorkflowPanelWidth(newDefaultWidth)
  }
}

// 컴포넌트 마운트
onMounted(async () => {
  document.addEventListener('keydown', handleGlobalKeydown)
  window.addEventListener('resize', handleResize)
  
  // 워크플로우 선택 상태 초기화
  // 스토어 기반으로 변경되어 별도 초기화 불필요
  
  // 인증 상태 확인
  await authStore.checkAuthStatus()
  
  // 백엔드 연결 확인 (1회만)
  await checkBackendConnection()
})

// 클린업
onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
  window.removeEventListener('resize', handleResize)
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
<template>
  <div class="app">
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
        @download-json="downloadJsonFile"
        @go-to-board="goToBoard"
        @go-to-login="goToLogin"
      />
      
      <!-- 채팅 영역 -->
      <ChatArea
        :showWelcome="showWelcome"
        :messages="messages"
        :examplePrompts="examplePrompts"
        :inputText="inputText"
        :isDragging="isDragging"
        @send-message="sendMessage"
        @use-example-prompt="useExamplePrompt"
        @handle-keydown="handleKeydown"
        @handle-file-upload="handleFileUpload"
        @handle-drag-enter="handleDragEnter"
        @handle-drag-over="handleDragOver"
        @handle-drag-leave="handleDragLeave"
        @handle-drop="handleDrop"
        @update:input-text="inputText = $event"
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
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import ChatArea from './components/ChatArea.vue'
import WorkflowPanel from './components/WorkflowPanel.vue'
import { useChatManagement } from './composables/useChatManagement'
import { useWorkflowManagement } from './composables/useWorkflowManagement'
import { useFileHandling } from './composables/useFileHandling'
import type { ChatHistoryItem, WorkflowItem, Message, ExamplePrompt } from './types'

// 상태 관리
const { 
  messages,
  inputText,
  showWelcome,
  chatHistoryItems,
  currentChatId,
  sendMessage,
  newChat,
  selectChatHistory,
  useExamplePrompt,
  handleKeydown
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

const {
  isDragging,
  handleFileUpload,
  handleDragEnter,
  handleDragOver,
  handleDragLeave,
  handleDrop
} = useFileHandling()

// UI 상태
const sidebarCollapsed = ref(false)
const activeMenu = ref<string | null>(null)

// 예시 프롬프트
const examplePrompts: ExamplePrompt[] = [
  {
    title: '창의적인 아이디어',
    text: '새로운 프로젝트를 위한 창의적인 아이디어를 제안해주세요'
  },
  {
    title: '문제 해결',
    text: '복잡한 문제를 단계별로 해결하는 방법을 알려주세요'
  },
  {
    title: '학습 도우미',
    text: '새로운 주제에 대해 쉽게 설명해주세요'
  }
]

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
  console.log('게시판 페이지로 이동')
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

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
  document.removeEventListener('click', closeDropdown)
})
</script>

<style>
@import './assets/styles/main.css';
</style>
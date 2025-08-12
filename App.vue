<template>
  <div class="app">
    <!-- Sidebar with ChatGPT design -->
    <div class="sidebar">
      <!-- New Chat Button -->
      <div class="sidebar-header">
        <button class="new-chat-btn" @click="handleNewChat">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          새 채팅
        </button>
      </div>

      <!-- Chat History -->
      <div class="chat-history">
        <div class="nav-section">
          <div 
            v-for="chat in sortedChatHistories" 
            :key="chat.id"
            class="nav-item"
            :class="{ 'active': currentChatId === chat.id }"
            @click="handleChatHistoryClick(chat)"
          >
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-5.7-2.051l-3.3.654.654-3.3A8.955 8.955 0 0112 4c4.418 0 8 3.582 8 8z"/>
            </svg>
            <span class="truncate">{{ chat.title.length > 20 ? chat.title.substring(0, 20) + '...' : chat.title }}</span>
          </div>
        </div>
      </div>

      <!-- Sidebar Footer with Workflow Options -->
      <div class="sidebar-footer">
        <div class="nav-section">
          <div class="nav-item" @click="handleBoardClick">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
            워크플로우 보드
          </div>
          <div class="nav-item" @click="isWorkflowPanelOpen = !isWorkflowPanelOpen">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            워크플로우 패널
            <span v-if="currentWorkflow" class="ml-auto text-xs text-gray-500">{{ currentWorkflow.title }}</span>
          </div>
        </div>
        
        <div class="user-profile" @click="handleLoginClick">
          <div class="user-avatar">U</div>
          <div class="user-name">사용자</div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="main-content">
      <!-- Workflow Panel (Right Side) -->
      <div v-if="isWorkflowPanelOpen" class="workflow-panel-overlay">
        <WorkflowPanel
          :is-open="isWorkflowPanelOpen"
          :workflow="currentWorkflow"
          @close="isWorkflowPanelOpen = false"
          @download="handleDownloadWorkflow"
          @delete="handleDeleteWorkflow"
        />
      </div>

      <!-- Chat Content -->
      <div class="chat-container" :class="{ 'with-panel': isWorkflowPanelOpen }">
        <!-- Empty State with Workflow Examples -->
        <div v-if="messages.length === 0" class="welcome-area">
          <div class="logo-container">
            <div class="chatgpt-logo">W</div>
            <h1 class="welcome-title">워크플로우 AI</h1>
            <p class="welcome-subtitle">워크플로우를 선택하거나 질문을 시작해보세요</p>
          </div>

          <!-- Workflow Examples Grid -->
          <div class="example-prompts">
            <div 
              v-for="workflow in allWorkflows.slice(0, 6)" 
              :key="workflow.id"
              class="example-prompt"
              @click="handleWorkflowSelect(workflow.id)"
            >
              <div class="example-prompt-title">{{ workflow.title }}</div>
              <div class="example-prompt-text">{{ workflow.description || '이 워크플로우를 사용해보세요' }}</div>
            </div>
          </div>

          <!-- Workflow Upload Button -->
          <div class="upload-section">
            <WorkflowUpload @workflow-add="handleAddCustomWorkflow" />
          </div>
        </div>

        <!-- Chat Messages -->
        <div v-else class="messages-area">
          <div class="messages-container">
            <div 
              v-for="(message, index) in messages" 
              :key="message.id" 
              class="message-wrapper"
              :class="{ 'assistant': !message.isUser, 'user': message.isUser }"
            >
              <div class="message-content">
                <div class="message-avatar">
                  <div v-if="message.isUser" class="user-avatar">U</div>
                  <div v-else class="assistant-avatar">W</div>
                </div>
                <div class="message-body">
                  <div class="message-text">
                    <StreamingMessage 
                      v-if="message.isStreaming"
                      :content="message.content"
                      @complete="handleStreamingComplete"
                    />
                    <div v-else class="whitespace-pre-wrap">{{ message.content }}</div>
                  </div>
                  <MessageActions
                    v-if="!message.isUser"
                    :message="message.content"
                    :message-id="message.id"
                    :is-user="message.isUser"
                    @feedback="handleMessageFeedback"
                  />
                </div>
              </div>
            </div>
            
            <!-- Typing Indicator -->
            <div v-if="isTyping" class="message-wrapper assistant">
              <div class="message-content">
                <div class="message-avatar">
                  <div class="assistant-avatar">W</div>
                </div>
                <div class="message-body">
                  <TypingIndicator />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Container -->
      <div class="input-container">
        <!-- Uploaded Files Display -->
        <div v-if="uploadedFiles.length > 0" class="uploaded-files">
          <div class="file-tags">
            <span v-for="file in uploadedFiles" :key="file" class="file-tag">
              📎 {{ file }}
            </span>
          </div>
        </div>

        <div class="input-wrapper">
          <button class="file-upload-btn" @click="$refs.fileInput?.click()">
            📎
          </button>
          <textarea
            v-model="inputMessage"
            class="input-box"
            placeholder="메시지를 입력하세요..."
            rows="1"
            @keydown="handleKeyDown"
            @input="adjustTextareaHeight"
            ref="textareaRef"
          ></textarea>
          <button 
            class="send-btn"
            :disabled="!inputMessage.trim()"
            @click="handleSendMessage"
            :class="{ 'enabled': inputMessage.trim() }"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
          <input
            type="file"
            ref="fileInput"
            multiple
            style="display: none"
            @change="handleFileUpload"
          >
        </div>
      </div>
    </div>

    <!-- Modals -->
    <Login v-if="currentView === 'login'" @back="handleBackToMain" />
    <Board 
      v-if="currentView === 'board'" 
      @back="handleBackToMain" 
      @import-workflow="handleImportWorkflow" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import WorkflowPanel from './components/WorkflowPanel.vue'
import WorkflowUpload from './components/WorkflowUpload.vue'
import StreamingMessage from './components/StreamingMessage.vue'
import MessageActions from './components/MessageActions.vue'
import TypingIndicator from './components/TypingIndicator.vue'
import Login from './components/Login.vue'
import Board from './components/Board.vue'
import { generateChatTitle, formatTimestamp } from './utils/chatUtils'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  files?: string[]
  isStreaming?: boolean
}

interface ChatHistory {
  id: string
  title: string
  lastMessage: string
  timestamp: string
  workflow?: Workflow
  messages: Message[]
  createdAt: Date
}

interface Workflow {
  id: string
  title: string
  image: string
  isCustom?: boolean
  jsonData?: any
  description?: string
  n8nUrl?: string
}

const DEFAULT_WORKFLOWS: Workflow[] = [
  {
    id: "default-1",
    title: "데이터 분석",
    image: "",
    description: "CSV 파일을 읽어서 데이터를 분석하고 리포트를 생성하는 워크플로우",
    jsonData: {
      "meta": { "instanceId": "example" },
      "nodes": [
        {
          "parameters": { "filePath": "/data/input.csv" },
          "id": "csv-reader",
          "name": "CSV Reader",
          "type": "n8n-nodes-base.csvRead",
          "position": [240, 300]
        }
      ]
    }
  },
  {
    id: "default-2", 
    title: "이미지 처리",
    image: "",
    description: "이미지를 리사이즈하고 워터마크를 추가하는 자동화 워크플로우",
    jsonData: {
      "meta": { "instanceId": "example" },
      "nodes": [
        {
          "parameters": { "path": "/images/input" },
          "id": "image-input",
          "name": "Image Input",
          "type": "n8n-nodes-base.readBinaryFiles",
          "position": [240, 300]
        }
      ]
    }
  },
  {
    id: "default-3",
    title: "API 연동",
    image: "",
    description: "외부 API에서 데이터를 가져와서 데이터베이스에 저장하는 워크플로우",
    jsonData: {
      "meta": { "instanceId": "example" },
      "nodes": [
        {
          "parameters": { "url": "https://api.example.com/data", "method": "GET" },
          "id": "api-request",
          "name": "API Request",
          "type": "n8n-nodes-base.httpRequest",
          "position": [240, 300]
        }
      ]
    }
  },
  {
    id: "default-4",
    title: "머신러닝",
    image: "",
    description: "데이터를 전처리하고 ML 모델로 예측을 수행하는 워크플로우",
    jsonData: {
      "meta": { "instanceId": "example" },
      "nodes": [
        {
          "parameters": { "dataSource": "training_data" },
          "id": "data-loader",
          "name": "Data Loader",
          "type": "n8n-nodes-base.readPDF",
          "position": [240, 300]
        }
      ]
    }
  },
  {
    id: "default-5",
    title: "자동화",
    image: "",
    description: "스케줄된 작업으로 데이터를 백업하고 알림을 보내는 워크플로우",
    jsonData: {
      "meta": { "instanceId": "example" },
      "nodes": [
        {
          "parameters": { "rule": { "interval": [{ "field": "hours", "value": 24 }] } },
          "id": "schedule-trigger",
          "name": "Daily Schedule",
          "type": "n8n-nodes-base.cron",
          "position": [240, 300]
        }
      ]
    }
  },
  {
    id: "default-6",
    title: "보고서 생성",
    image: "",
    description: "데이터를 수집하고 차트를 생성하여 PDF 보고서를 만드는 워크플로우",
    jsonData: {
      "meta": { "instanceId": "example" },
      "nodes": [
        {
          "parameters": { "query": "SELECT * FROM sales_data" },
          "id": "collect-data",
          "name": "Collect Data",
          "type": "n8n-nodes-base.postgres",
          "position": [240, 300]
        }
      ]
    }
  }
]

const AI_RESPONSES = [
  "네, 말씀하신 내용을 이해했습니다. 워크플로우와 관련해서 더 자세히 설명해드릴까요?",
  "좋은 질문이네요! 이 워크플로우의 핵심은 효율적인 데이터 처리에 있습니다.",
  "워크플로우 최적화를 위해서는 몇 가지 고려사항이 있습니다.",
  "제안해주신 방법이 흥미롭네요. 이를 실제로 구현하려면 다음과 같은 접근을 고려해볼 수 있습니다...",
  "이 워크플로우의 장점은 확장성과 유지보수성을 동시에 확보할 수 있다는 점입니다."
]

// Reactive state
const currentView = ref<'main' | 'login' | 'board'>('main')
const currentWorkflowIndex = ref<number>(0)
const isWorkflowPanelOpen = ref(false)
const messages = ref<Message[]>([])
const uploadedFiles = ref<string[]>([])
const currentChatId = ref<string | null>(null)
const inputMessage = ref<string>('')
const isTyping = ref(false)
const textareaRef = ref<HTMLTextAreaElement>()
const fileInput = ref<HTMLInputElement>()

// Local storage
const chatHistories = useLocalStorage<ChatHistory[]>('chat-histories', [])
const customWorkflows = useLocalStorage<Workflow[]>('custom-workflows', [])

// Computed
const allWorkflows = computed(() => [
  ...customWorkflows.value.map(w => ({ ...w, isCustom: true })), 
  ...DEFAULT_WORKFLOWS
])

const currentWorkflow = computed(() => allWorkflows.value[currentWorkflowIndex.value] || null)

const sortedChatHistories = computed(() => 
  [...chatHistories.value].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
)

// Watch for auto-saving chats
watch([messages, currentChatId, currentWorkflow], () => {
  if (messages.value.length > 0 && currentChatId.value) {
    const firstUserMessage = messages.value.find(m => m.isUser)?.content || ''
    const lastMessage = messages.value[messages.value.length - 1]?.content || ''
    const title = generateChatTitle(firstUserMessage)

    const existingIndex = chatHistories.value.findIndex(chat => chat.id === currentChatId.value)
    const updatedChat: ChatHistory = {
      id: currentChatId.value,
      title,
      lastMessage: lastMessage.length > 30 ? lastMessage.substring(0, 27) + '...' : lastMessage,
      timestamp: formatTimestamp(new Date()),
      workflow: currentWorkflow.value || undefined,
      messages: messages.value.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })),
      createdAt: new Date()
    }

    if (existingIndex >= 0) {
      chatHistories.value[existingIndex] = updatedChat
    } else {
      chatHistories.value.unshift(updatedChat)
    }
  }
}, { deep: true })

// Methods
const handleWorkflowSelect = (workflowId: string) => {
  const index = allWorkflows.value.findIndex(w => w.id === workflowId)
  if (index >= 0) {
    currentWorkflowIndex.value = index
    isWorkflowPanelOpen.value = true
  }
}

const handleDeleteWorkflow = (workflowId: string) => {
  const workflowToDelete = allWorkflows.value.find(w => w.id === workflowId)
  
  if (!workflowToDelete || !workflowToDelete.isCustom) {
    return
  }

  customWorkflows.value = customWorkflows.value.filter(w => w.id !== workflowId)
  
  if (currentWorkflow.value && currentWorkflow.value.id === workflowId) {
    currentWorkflowIndex.value = 0
    isWorkflowPanelOpen.value = false
  }
}

const handleChatHistoryClick = (chat: ChatHistory) => {
  if (chat.workflow) {
    const index = allWorkflows.value.findIndex(w => w.id === chat.workflow!.id)
    if (index >= 0) {
      currentWorkflowIndex.value = index
    }
  }
  
  messages.value = chat.messages.map(msg => ({
    ...msg,
    timestamp: new Date(msg.timestamp)
  }))
  currentChatId.value = chat.id
  isWorkflowPanelOpen.value = false
  uploadedFiles.value = []
}

const handleNewChat = () => {
  messages.value = []
  uploadedFiles.value = []
  isWorkflowPanelOpen.value = false
  currentChatId.value = null
  inputMessage.value = ''
}

const handleSendMessage = () => {
  if (!inputMessage.value.trim()) return
  
  if (!currentChatId.value) {
    currentChatId.value = Date.now().toString()
  }

  const userMessage: Message = {
    id: Date.now().toString(),
    content: inputMessage.value.trim(),
    isUser: true,
    timestamp: new Date(),
    files: uploadedFiles.value.length > 0 ? [...uploadedFiles.value] : undefined
  }

  messages.value.push(userMessage)
  uploadedFiles.value = []
  inputMessage.value = ''
  isTyping.value = true
  
  // Reset textarea height
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }

  // AI 응답 시뮬레이션
  setTimeout(() => {
    const randomResponse = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)]
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: randomResponse,
      isUser: false,
      timestamp: new Date(),
      isStreaming: true
    }
    
    messages.value.push(aiMessage)
    isTyping.value = false
  }, 800)
}

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    const fileNames = Array.from(input.files).map(file => file.name)
    uploadedFiles.value.push(...fileNames)
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSendMessage()
  }
}

const adjustTextareaHeight = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = Math.min(textareaRef.value.scrollHeight, 200) + 'px'
  }
}

const handleAddCustomWorkflow = (workflow: Workflow) => {
  const newWorkflow = { ...workflow, isCustom: true }
  customWorkflows.value.push(newWorkflow)
  currentWorkflowIndex.value = customWorkflows.value.length - 1
}

const handleImportWorkflow = (workflow: Workflow) => {
  handleAddCustomWorkflow(workflow)
  currentView.value = 'main'
}

const handleDownloadWorkflow = () => {
  if (currentWorkflow.value && currentWorkflow.value.jsonData) {
    const dataStr = JSON.stringify(currentWorkflow.value.jsonData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${currentWorkflow.value.title.replace(/\s+/g, '_')}_n8n_workflow.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

const handleLoginClick = () => {
  currentView.value = 'login'
}

const handleBoardClick = () => {
  currentView.value = 'board'
}

const handleBackToMain = () => {
  currentView.value = 'main'
}

const handleMessageFeedback = (messageId: string, type: 'like' | 'dislike') => {
  console.log(`Message ${messageId} received ${type} feedback`)
}

const handleStreamingComplete = () => {
  // Streaming animation complete
}

onMounted(() => {
  // 초기화 작업
})
</script>

<style scoped>
.app {
  display: flex;
  height: 100vh;
  font-family: "Söhne", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif;
}

/* 사이드바 스타일 */
.sidebar {
  width: 280px;
  background: #f7f7f8;
  border-right: 1px solid #e1e3e6;
  display: flex;
  flex-direction: column;
  position: relative;
}

.sidebar-header {
  padding: 12px;
  border-bottom: none;
}

.new-chat-btn {
  width: 100%;
  padding: 12px;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.1s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.new-chat-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.chat-history {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 20px;
}

.nav-item {
  padding: 10px 12px;
  margin: 2px 0;
  border-radius: 8px;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  transition: background 0.1s ease;
  font-weight: 400;
}

.nav-item:hover {
  background: #f3f4f6;
}

.nav-item.active {
  background: #e5e7eb;
  font-weight: 500;
}

.nav-icon {
  width: 16px;
  height: 16px;
  opacity: 0.7;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid #e1e3e6;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.user-profile:hover {
  background: #f3f4f6;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #10a37f;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.user-name {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

/* 메인 컨텐츠 */
.main-content {
  flex: 1;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  position: relative;
}

.workflow-panel-overlay {
  position: absolute;
  top: 0;
  right: 0;
  width: 400px;
  height: 100%;
  z-index: 10;
  border-left: 1px solid #e1e3e6;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: margin-right 0.3s ease;
}

.chat-container.with-panel {
  margin-right: 400px;
}

.welcome-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.logo-container {
  margin-bottom: 32px;
}

.chatgpt-logo {
  width: 40px;
  height: 40px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #74aa9c 0%, #1f8b73 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.welcome-title {
  font-size: 32px;
  font-weight: 600;
  color: #202123;
  margin-bottom: 12px;
  letter-spacing: -0.8px;
}

.welcome-subtitle {
  font-size: 18px;
  color: #6b7280;
  margin-bottom: 48px;
  font-weight: 400;
}

.example-prompts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
  margin-bottom: 32px;
  width: 100%;
}

.example-prompt {
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.example-prompt:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 8px rgba(0,0,0,0.08);
  transform: translateY(-1px);
}

.example-prompt-title {
  font-weight: 600;
  color: #202123;
  margin-bottom: 8px;
  font-size: 15px;
}

.example-prompt-text {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
}

.upload-section {
  margin-top: 20px;
}

/* 메시지 영역 */
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.messages-container {
  max-width: 800px;
  margin: 0 auto;
}

.message-wrapper {
  margin-bottom: 24px;
}

.message-content {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.message-avatar .user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #10a37f;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.message-avatar .assistant-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #74aa9c 0%, #1f8b73 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.message-body {
  flex: 1;
  min-width: 0;
}

.message-text {
  color: #374151;
  line-height: 1.6;
  font-size: 15px;
}

/* 입력 영역 */
.input-container {
  position: sticky;
  bottom: 0;
  background: #ffffff;
  padding: 24px;
  border-top: 1px solid #e5e7eb;
}

.uploaded-files {
  max-width: 800px;
  margin: 0 auto 16px;
}

.file-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.file-tag {
  background: #f3f4f6;
  color: #374151;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
}

.input-wrapper {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

.input-box {
  width: 100%;
  min-height: 52px;
  max-height: 200px;
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 24px;
  padding: 12px 90px 12px 50px;
  font-size: 16px;
  line-height: 1.5;
  resize: none;
  outline: none;
  font-family: inherit;
  color: #202123;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  transition: all 0.2s;
}

.input-box:focus {
  border-color: #10a37f;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08), 0 0 0 3px rgba(16, 163, 127, 0.1);
}

.input-box::placeholder {
  color: #9ca3af;
}

.file-upload-btn {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 16px;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 16px;
}

.file-upload-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.send-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  background: #d1d5db;
  border: none;
  border-radius: 18px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.send-btn.enabled {
  background: #10a37f;
}

.send-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.whitespace-pre-wrap {
  white-space: pre-wrap;
}
</style>
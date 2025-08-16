<template>
  <!-- 웰컴 화면 -->
  <div v-if="showWelcome" class="chat-container">
    <div class="welcome-area">
      <div class="logo-container">
        <div class="chatgpt-logo">✨</div>
        <h1 class="welcome-title">{{ t('welcome_title') }}</h1>
        <p class="welcome-subtitle">{{ t('welcome_subtitle') }}</p>
      </div>

      <div class="example-workflows">
        <div v-for="workflow in exampleWorkflows" 
             :key="workflow.title"
             class="example-workflow"
             @click="addExampleWorkflow(workflow)">
          <div class="example-workflow-title">{{ workflow.title }}</div>
          <div class="example-workflow-text">{{ workflow.description }}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- 메시지 영역 -->
  <div v-else class="messages">
    <div class="messages-inner">
      <div v-for="message in messages" 
           :key="message.id"
           :class="['message', message.type]">
        <div class="message-avatar">
          {{ message.type === 'user' ? 'U' : 'AI' }}
        </div>
        <div class="message-content">
          <!-- Thinking 표시 -->
          <div v-if="message.isThinking && chatStore.isThinking" class="thinking-block">
            <div class="thinking-header">
              <span class="thinking-icon">🤔</span>
              <span class="thinking-title">생각 중...</span>
              <div class="thinking-spinner">⟳</div>
            </div>
            <div class="thinking-content">
              <div class="thinking-text">{{ chatStore.thinkingText }}</div>
            </div>
          </div>

          <!-- Tool Usage 표시 -->
          <div v-if="chatStore.isUsingTool && chatStore.currentToolExecution" class="tool-block">
            <div class="tool-header">
              <span class="tool-icon">🔧</span>
              <span class="tool-title">도구 사용 중: {{ chatStore.currentToolExecution.name }}</span>
              <div v-if="chatStore.currentToolExecution.isExecuting" class="tool-spinner">⟳</div>
              <div v-else class="tool-status">✓</div>
            </div>
            <div class="tool-content">
              <div class="tool-input" v-if="chatStore.currentToolExecution.input">
                <strong>입력:</strong> {{ formatToolInput(chatStore.currentToolExecution.input) }}
              </div>
              <div class="tool-result" v-if="chatStore.currentToolExecution.result">
                <strong>결과:</strong> {{ chatStore.currentToolExecution.result }}
              </div>
              <div class="tool-error" v-if="chatStore.currentToolExecution.error">
                <strong>오류:</strong> {{ chatStore.currentToolExecution.error }}
              </div>
            </div>
          </div>

          <!-- 완료된 Tool Executions 표시 -->
          <div v-if="chatStore.toolExecutions.length > 0" class="completed-tools">
            <div v-for="(tool, idx) in chatStore.toolExecutions" :key="idx" class="completed-tool">
              <div class="tool-header completed">
                <span class="tool-icon">🔧</span>
                <span class="tool-title">{{ tool.name }}</span>
                <div class="tool-status" :class="{ error: tool.error }">{{ tool.error ? '❌' : '✅' }}</div>
              </div>
              <div class="tool-summary">
                {{ tool.error ? `오류: ${tool.error}` : `완료됨` }}
              </div>
            </div>
          </div>
          
          <!-- 스트리밍 메시지 -->
          <span v-if="message.isStreaming" class="streaming-content">
            {{ message.streamingText || '' }}<span class="cursor-blink">|</span>
          </span>
          
          <!-- 일반 메시지 (content blocks 처리) -->
          <div v-else-if="message.content && Array.isArray(message.content)">
            <div v-for="(block, idx) in message.content" :key="idx">
              <span v-if="block.type === 'text'">{{ block.text }}</span>
              <div v-else-if="block.type === 'image'" class="message-image">
                <img :src="`data:${block.source.media_type};base64,${block.source.data}`" alt="uploaded image" />
              </div>
              <div v-else-if="block.type === 'document'" class="message-document">
                📄 PDF 문서가 업로드되었습니다
              </div>
            </div>
          </div>
          
          <!-- 에러 메시지 -->
          <div v-else-if="message.isError" class="error-message">
            {{ getMessageText(message) }}
          </div>
          
          <!-- 일반 텍스트 (fallback) -->
          <span v-else>{{ getMessageText(message) }}</span>
          
          <!-- 파일 표시 (사용자 메시지) -->
          <div v-if="message.type === 'user' && hasFiles(message)" class="message-files">
            <div v-for="(file, idx) in getMessageFiles(message)" :key="idx" class="file-tag">
              {{ getFileIconFromBlock(file) }} 파일 첨부됨
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 입력 영역 -->
  <div class="input-container">
    <!-- 업로드된 파일 표시 -->
    <div v-if="uploadedFiles.length > 0" class="uploaded-files">
      <div v-for="(file, index) in uploadedFiles" :key="index" class="uploaded-file">
        <span class="file-icon">{{ getFileIcon(file.type) }}</span>
        <span class="file-name">{{ file.name }}</span>
        <span class="file-size">{{ formatFileSize(file.size) }}</span>
        <button class="remove-file-btn" @click="$emit('remove-uploaded-file', index)" :title="t('remove_file')">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="input-wrapper" 
         :class="{ 'drag-over': isDragging }"
         @dragenter="$emit('handle-drag-enter', $event)"
         @dragover="$emit('handle-drag-over', $event)"
         @dragleave="$emit('handle-drag-leave', $event)"
         @drop="$emit('handle-drop', $event)">
      <div v-if="isDragging" class="drag-overlay">
        📁 {{ t('drop_files_here') }}
      </div>
      <input type="file" @change="$emit('handle-file-upload', $event)" style="display: none;" ref="fileInput" multiple>
      <button class="file-upload-btn" :title="t('file_upload')" @click="fileInput?.click()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
        </svg>
      </button>
      <textarea 
        ref="textareaRef"
        :value="inputText"
        @input="handleInput"
        class="input-box"
        :placeholder="t('enter_message')"
        rows="1"
        @keydown="$emit('handle-keydown', $event)"
      ></textarea>
      <button class="send-btn" @click="console.log('🚨 [ChatArea] send-message 이벤트 발생!'); $emit('send-message')" :disabled="!inputText.trim()" :title="t('send_message')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m5 12 7-7 7 7"/>
          <path d="M12 19V5"/>
        </svg>
      </button>
      <div v-if="isDragging" class="drag-overlay">
        📁 {{ t('drop_files_here') }}
      </div>
    </div>
    <div class="disclaimer">
      {{ t('disclaimer') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted } from 'vue'
import type { Message } from '../types'
import { useTranslation } from '@/utils/i18n'
import { useChatStore } from '@/stores/chat'

const fileInput = ref<HTMLInputElement>()
const chatStore = useChatStore()

interface ExampleWorkflow {
  title: string
  description: string
  category: string
  n8nUrl: string
  jsonData: any
  exampleQuestion: string
}

import type { UploadedFile } from '../types'

const props = defineProps<{
  showWelcome: boolean
  messages: Message[]
  inputText: string
  isDragging: boolean
  uploadedFiles: UploadedFile[]
  formatFileSize: (size: number) => string
  getFileIcon: (type: string) => string
}>()

const emit = defineEmits<{
  'send-message': []
  'handle-keydown': [event: KeyboardEvent]
  'handle-file-upload': [event: Event]
  'handle-drag-enter': [event: DragEvent]
  'handle-drag-over': [event: DragEvent]
  'handle-drag-leave': [event: DragEvent]
  'handle-drop': [event: DragEvent]
  'update:input-text': [value: string]
  'remove-uploaded-file': [index: number]
}>()

const textareaRef = ref<HTMLTextAreaElement>()
const { t } = useTranslation()

// 자동 리사이징 기능 (HTML과 동일)
const autoResizeTextarea = () => {
  nextTick(() => {
    const textarea = textareaRef.value
    if (textarea) {
      textarea.style.height = 'auto'
      const newHeight = Math.min(textarea.scrollHeight, 200)
      textarea.style.height = newHeight + 'px'
      
      // 최대 높이에 도달했을 때 스크롤 표시
      if (textarea.scrollHeight > 200) {
        textarea.style.overflowY = 'auto'
      } else {
        textarea.style.overflowY = 'hidden'
      }
    }
  })
}

// input 핸들러
const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:input-text', target.value)
  autoResizeTextarea()
}

// inputText 변경 감지
watch(() => props.inputText, () => {
  autoResizeTextarea()
})

// 초기 로드 시에도 실행 (HTML과 동일)
onMounted(() => {
  autoResizeTextarea()
})

// HTML과 정확히 동일한 예시 워크플로우
const exampleWorkflows: ExampleWorkflow[] = [
  { 
    title: '데이터 분석 자동화', 
    description: 'CSV 파일을 읽고 차트 생성 후 보고서 전송',
    category: 'data',
    n8nUrl: 'https://n8n.io/templates/data-analysis',
    jsonData: null,
    exampleQuestion: 'CSV 파일을 자동으로 읽어서 차트를 만들고 보고서를 이메일로 보내는 워크플로우를 생성해줘'
  },
  { 
    title: '이미지 처리', 
    description: '이미지 리사이즈 및 워터마크 추가 자동화',
    category: 'media',
    n8nUrl: 'https://n8n.io/templates/image-processing',
    jsonData: null,
    exampleQuestion: '이미지를 자동으로 리사이즈하고 워터마크를 추가하는 워크플로우를 생성해줘'
  },
  { 
    title: '이메일 자동화', 
    description: '조건부 이메일 발송 및 답장 처리',
    category: 'communication',
    n8nUrl: 'https://n8n.io/templates/email-automation',
    jsonData: null,
    exampleQuestion: '특정 조건에 따라 자동으로 이메일을 발송하고 답장을 처리하는 워크플로우를 생성해줘'
  },
  { 
    title: 'AI 텍스트 생성', 
    description: 'GPT API를 활용한 콘텐츠 자동 생성',
    category: 'ai',
    n8nUrl: 'https://n8n.io/templates/ai-content',
    jsonData: null,
    exampleQuestion: 'GPT API를 사용해서 자동으로 콘텐츠를 생성하는 워크플로우를 생성해줘'
  },
  { 
    title: '소셜미디어 관리', 
    description: '다중 플랫폼 포스팅 및 댓글 모니터링',
    category: 'social',
    n8nUrl: 'https://n8n.io/templates/social-media',
    jsonData: null,
    exampleQuestion: '여러 소셜미디어 플랫폼에 자동으로 포스팅하고 댓글을 모니터링하는 워크플로우를 생성해줘'
  },
  { 
    title: '보고서 자동화', 
    description: '정기 보고서 생성 및 배포 자동화',
    category: 'reporting',
    n8nUrl: 'https://n8n.io/templates/reporting',
    jsonData: null,
    exampleQuestion: '정기적으로 보고서를 자동 생성하고 배포하는 워크플로우를 생성해줘'
  }
]

// HTML과 동일한 addExampleWorkflow 함수
const addExampleWorkflow = (workflow: ExampleWorkflow) => {
  // 워크플로우 예시 클릭 시 채팅 입력창에 질문 채우기 (자동 전송 안함)
  if (workflow.exampleQuestion) {
    emit('update:input-text', workflow.exampleQuestion)
    // 입력창에 포커스 주기
    nextTick(() => {
      const inputElement = textareaRef.value
      if (inputElement) {
        inputElement.focus()
      }
    })
  }
}

// 메시지 텍스트 추출 헬퍼 함수
const getMessageText = (message: any): string => {
  if (typeof message.content === 'string') {
    return message.content
  }
  if (Array.isArray(message.content)) {
    return message.content
      .filter((block: any) => block.type === 'text')
      .map((block: any) => block.text)
      .join(' ')
  }
  return ''
}

// 메시지에 파일이 있는지 확인
const hasFiles = (message: any): boolean => {
  if (!Array.isArray(message.content)) return false
  return message.content.some((block: any) => 
    block.type === 'image' || block.type === 'document'
  )
}

// 메시지에서 파일 추출
const getMessageFiles = (message: any): any[] => {
  if (!Array.isArray(message.content)) return []
  return message.content.filter((block: any) => 
    block.type === 'image' || block.type === 'document'
  )
}

// 파일 블록에서 아이콘 가져오기
const getFileIconFromBlock = (block: any): string => {
  if (block.type === 'image') return '🖼️'
  if (block.type === 'document') return '📄'
  return '📎'
}

// 도구 입력값 포맷팅
const formatToolInput = (input: any): string => {
  if (!input) return ''
  if (typeof input === 'string') return input
  if (typeof input === 'object') {
    try {
      return JSON.stringify(input, null, 2)
    } catch {
      return String(input)
    }
  }
  return String(input)
}
</script>

<style scoped>
@keyframes cursor-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.cursor-blink {
  animation: cursor-blink 1s infinite;
}

.streaming-content {
  display: inline;
}

.message-files {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.file-tag {
  padding: 4px 8px;
  background: #f3f4f6;
  border-radius: 4px;
  font-size: 12px;
  color: #6b7280;
}

.chat-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.welcome-area {
  text-align: center;
  max-width: 500px;
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

.messages {
  flex: 1;
  width: 100%;
  padding: 20px;
  overflow-y: auto;
}

.messages-inner {
  max-width: 768px;
  margin: 0 auto;
  width: 100%;
}

.message {
  margin-bottom: 24px;
  display: flex;
  gap: 16px;
  padding: 20px 24px;
}

.message.user {
  flex-direction: row-reverse;
  justify-content: flex-start;
  background: transparent;
}

.message.user .message-content {
  background: var(--message-bg-user);
  border-radius: 18px;
  padding: 12px 16px;
  max-width: 70%;
  margin-left: auto;
}

.message.assistant {
  background: transparent;
  border-radius: 16px;
  margin: 12px;
}

.message.assistant .message-content {
  flex: 1;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: #5436da;
  color: white;
}

.message.assistant .message-avatar {
  background: #19c37d;
  color: white;
}

.message-content {
  font-size: var(--message-font-size);
  line-height: var(--message-line-height);
  color: var(--text-color);
  padding-top: 4px;
}

.input-container {
  position: sticky;
  bottom: 0;
  background: var(--bg-color);
  padding: 24px;
  border-top: 1px solid var(--border-color);
}

.input-wrapper {
  max-width: 768px;
  width: 100%;
  margin: 0 auto;
  position: relative;
}

.input-box {
  width: 100%;
  min-height: 52px;
  max-height: 200px;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 24px;
  padding: 12px 56px 12px 50px;
  font-size: 16px;
  line-height: 1.5;
  resize: none;
  outline: none;
  font-family: inherit;
  color: var(--text-color);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s;
  overflow-y: hidden;
}

.input-box:focus {
  border-color: var(--input-focus) !important;
  box-shadow: var(--shadow-focus) !important;
  outline: none !important;
}

.input-box::placeholder {
  color: var(--text-muted);
}

.file-upload-btn {
  position: absolute;
  left: 12px;
  bottom: 10px;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 16px;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 16px;
  z-index: 10;
}

.file-upload-btn:hover {
  background: var(--panel-hover);
  color: var(--text-color);
}

.send-btn {
  position: absolute;
  right: 12px;
  bottom: 10px;
  width: 32px;
  height: 32px;
  background: #2d2d2d !important;
  border: none;
  border-radius: 50%;
  color: white !important;
  cursor: pointer;
  display: flex !important;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 14px;
  z-index: 100 !important;
}

.send-btn:hover {
  background: #1a1a1a !important;
}

.send-btn svg {
  color: white !important;
  stroke: white !important;
  fill: none !important;
  z-index: 101 !important;
}

.send-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.input-wrapper.drag-over {
  border-color: #67bdc6;
  background: #f0fdf4;
}

.input-wrapper.drag-over .input-box {
  border-color: #67bdc6;
  background: #f0fdf4;
}

.drag-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(16, 163, 127, 0.1);
  border: 2px dashed #67bdc6;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #67bdc6;
  font-size: 14px;
  font-weight: 500;
  z-index: 10;
  pointer-events: none;
}

.disclaimer {
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
  margin-top: 12px;
  max-width: 768px;
  margin-left: auto;
  margin-right: auto;
}

/* 업로드된 파일 표시 스타일 */
.uploaded-files {
  max-width: 768px;
  width: 100%;
  margin: 0 auto 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.uploaded-file {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--panel-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-color);
  transition: all 0.2s;
}

.uploaded-file:hover {
  background: var(--panel-hover);
}

.file-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.file-name {
  font-weight: 500;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 12px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.remove-file-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  padding: 2px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.remove-file-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.remove-file-btn svg {
  stroke: currentColor;
}

/* Thinking 표시 스타일 */
.thinking-block {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.thinking-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  font-weight: 500;
  gap: 8px;
}

.thinking-icon {
  font-size: 16px;
}

.thinking-title {
  flex: 1;
  font-size: 14px;
}

.thinking-spinner {
  animation: spin 2s linear infinite;
  font-size: 14px;
}

.thinking-content {
  padding: 16px;
  background: #f8fafc;
}

.thinking-text {
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
  white-space: pre-wrap;
  max-height: 150px;
  overflow-y: auto;
  font-family: 'Consolas', 'Monaco', monospace;
}

/* Tool Usage 표시 스타일 */
.tool-block {
  background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 20%, #f59e0b 100%);
  border: 1px solid #d97706;
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.tool-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  font-weight: 500;
  gap: 8px;
}

.tool-header.completed {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.tool-icon {
  font-size: 16px;
}

.tool-title {
  flex: 1;
  font-size: 14px;
}

.tool-spinner {
  animation: spin 1.5s linear infinite;
  font-size: 14px;
}

.tool-status {
  font-size: 14px;
}

.tool-status.error {
  color: #ef4444;
}

.tool-content {
  padding: 16px;
  background: #fffbeb;
  font-size: 13px;
  line-height: 1.5;
}

.tool-input,
.tool-result,
.tool-error {
  margin-bottom: 8px;
  padding: 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.7);
}

.tool-error {
  background: rgba(254, 226, 226, 0.8);
  border: 1px solid #fca5a5;
  color: #dc2626;
}

.tool-input strong,
.tool-result strong,
.tool-error strong {
  color: #374151;
  display: block;
  margin-bottom: 4px;
}

/* 완료된 도구들 표시 */
.completed-tools {
  margin-bottom: 16px;
}

.completed-tool {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border: 1px solid #10b981;
  border-radius: 8px;
  margin-bottom: 8px;
  overflow: hidden;
}

.tool-summary {
  padding: 8px 16px;
  font-size: 12px;
  color: #059669;
  background: #ecfdf5;
}

/* 스피너 애니메이션 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 이미지 및 문서 표시 스타일 */
.message-image {
  margin-top: 12px;
  max-width: 400px;
}

.message-image img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.message-document {
  padding: 12px;
  background: var(--panel-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-top: 12px;
  font-size: 14px;
  color: var(--text-muted);
}

/* 에러 메시지 스타일 */
.error-message {
  color: #ef4444;
  font-style: italic;
}
</style>
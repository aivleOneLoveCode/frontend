<template>
  <!-- 웰컴 화면 -->
  <div v-if="showWelcome" class="chat-container">
    <div class="welcome-area">
      <div class="logo-container">
        <div class="profile-showcase">
          <div class="profile-duo">
            <div class="profile-item">
              <img :src="danyProfile" alt="다니" class="welcome-avatar" />
              <span class="profile-name">다니</span>
            </div>
            <div class="profile-item">
              <img :src="zzanyProfile" alt="짜니" class="welcome-avatar" />
              <span class="profile-name">짜니</span>
            </div>
          </div>
          <div class="logo-symbol">💫</div>
        </div>
        <h1 class="welcome-title">{{ t('welcome_title') }}</h1>
        <p class="welcome-subtitle">{{ t('welcome_subtitle') }}</p>
      </div>

      <div class="example-workflows">
        <div v-for="(workflow, index) in exampleWorkflows" 
             :key="workflow.title"
             class="example-workflow"
             :class="`workflow-${index + 1}`"
             @click="addExampleWorkflow(workflow)">
          <div class="workflow-icon">{{ getWorkflowIcon(workflow.category) }}</div>
          <div class="workflow-content">
            <div class="example-workflow-title">{{ workflow.title }}</div>
            <div class="example-workflow-text">{{ workflow.description }}</div>
            <div class="workflow-hint">💬 클릭하면 아래 입력창에 질문이 입력됩니다</div>
          </div>
          <div class="workflow-arrow">💬</div>
        </div>
      </div>
    </div>
  </div>

  <!-- 메시지 영역 -->
  <div v-else ref="messagesContainer" class="messages">
    <div class="messages-inner">
      <div v-for="message in messages" 
           :key="message.id"
           :class="['message', message.type]">
        <!-- 사용자 메시지: 아바타 없음, 오른쪽 정렬 -->
        <div v-if="message.type === 'user'" class="message-content user-bubble">
          <!-- 일반 메시지 (content blocks 처리) -->
          <div v-if="message.content && Array.isArray(message.content)">
            <div v-for="(block, idx) in message.content" :key="idx">
              <div v-if="block.type === 'text'" v-html="renderMarkdown(block.text)"></div>
              <div v-else-if="block.type === 'image'" class="message-image">
                <img :src="`data:${block.source.media_type};base64,${block.source.data}`" alt="uploaded image" />
              </div>
              <div v-else-if="block.type === 'document'" class="message-document">
                📄 PDF 문서가 업로드되었습니다
              </div>
            </div>
          </div>
          <!-- 일반 텍스트 (fallback) -->
          <span v-else>{{ getMessageText(message) }}</span>
          
          <!-- 파일 표시 (사용자 메시지) -->
          <div v-if="hasFiles(message)" class="message-files">
            <div v-for="(file, idx) in getMessageFiles(message)" :key="idx" class="file-tag">
              {{ getFileIconFromBlock(file) }} 파일 첨부됨
            </div>
          </div>
        </div>

        <!-- AI 메시지: 프로필 있음, 왼쪽 정렬 -->
        <div v-else class="ai-message-container">
          <div class="profile-section">
            <!-- Thinking이나 Tool 메시지는 zzany 프로필 -->
            <template v-if="message.isThinking !== undefined || message.isUsingTool !== undefined">
              <img :src="zzanyProfile" alt="zzany" class="avatar-img" />
              <span class="profile-name">짜니</span>
            </template>
            <!-- 일반 텍스트 메시지는 dany 프로필 -->
            <template v-else>
              <img :src="danyProfile" alt="dany" class="avatar-img" />
              <span class="profile-name">다니</span>
            </template>
          </div>
          <div class="message-content">
            <!-- Thinking 메시지 표시 -->
            <div v-if="message.isThinking !== undefined" class="thinking-block">
              <div class="thinking-header" @click="toggleThinkingBlock">
                <span class="thinking-icon">{{ message.isThinking ? '🤔' : '💡' }}</span>
                <span class="thinking-title">{{ message.isThinking ? '생각 중...' : '생각 완료' }}</span>
                <div v-if="message.isThinking" class="thinking-spinner">⟳</div>
                <span class="block-toggle">▼</span>
              </div>
              <div class="thinking-content">
                <div class="thinking-text">{{ (message.content && Array.isArray(message.content) && message.content[0] && message.content[0].text) || '' }}</div>
              </div>
            </div>

            <!-- Tool 메시지 표시 -->
            <div v-else-if="message.isUsingTool !== undefined" class="tool-block">
              <div class="tool-header" @click="toggleToolBlock">
                <span class="tool-icon">🔧</span>
                <span class="tool-title">{{ message.isUsingTool ? '도구 실행 중' : '도구 실행 완료' }}</span>
                <div v-if="message.isUsingTool" class="tool-spinner">⟳</div>
                <div v-else class="tool-status">✓</div>
                <span class="block-toggle">▼</span>
              </div>
              <div class="tool-content">
                <div v-html="renderMarkdown((message.content && Array.isArray(message.content) && message.content[0] && message.content[0].text) || '')"></div>
              </div>
            </div>
          
            <!-- 스트리밍 메시지 -->
            <div v-else-if="message.isStreaming" class="streaming-content">
              <div v-html="renderMarkdown((message.content && Array.isArray(message.content) && message.content[0] && message.content[0].text) || '')"></div>
            </div>
            
            <!-- 일반 메시지 (content blocks 처리) -->
            <div v-else-if="message.content && Array.isArray(message.content)">
              <div v-for="(block, idx) in message.content" :key="idx">
                <div v-if="block.type === 'text'" v-html="renderMarkdown(block.text)"></div>
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
      <button 
        :class="['send-btn', { 'stop-btn': props.isProcessing }]" 
        @click="props.isProcessing ? handleStopMessage() : handleSendMessage()" 
        :disabled="!props.isProcessing && !inputText.trim()" 
        :title="props.isProcessing ? '응답 중단' : t('send_message')">
        <!-- 중단 아이콘 (AI 응답 중) -->
        <svg v-if="props.isProcessing" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="1"/>
        </svg>
        <!-- 전송 아이콘 (평상시) -->
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
import { useTranslation } from '@/utils/i18n'
import zzanyProfileImg from '@/assets/profile/zzany.png'
import danyProfileImg from '@/assets/profile/dany.png'

const fileInput = ref<HTMLInputElement>()

// 프로필 이미지
const zzanyProfile = ref(zzanyProfileImg)
const danyProfile = ref(danyProfileImg)

interface ExampleWorkflow {
  title: string
  description: string
  category: string
  n8nUrl: string
  jsonData: any
  exampleQuestion: string
}

interface Message {
  id: number
  type: 'user' | 'assistant'
  content: any[]
  timestamp: Date
  isError?: boolean
  isStreaming?: boolean
  isThinking?: boolean
  isUsingTool?: boolean
  streamingText?: string
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
  isProcessing?: boolean
}>()

const emit = defineEmits<{
  'send-message': []
  'stop-message': []
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
const messagesContainer = ref<HTMLDivElement>()
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

// 메시지 전송 핸들러
const handleSendMessage = () => {
  emit('send-message')
  // 포커스만 처리 (초기화는 부모에서 처리)
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.focus()
      autoResizeTextarea()
    }
  })
}

// 메시지 중단 핸들러
const handleStopMessage = () => {
  emit('stop-message')
}

// inputText 변경 감지
watch(() => props.inputText, () => {
  autoResizeTextarea()
})

// 메시지 영역을 맨 아래로 스크롤
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTo({
        top: messagesContainer.value.scrollHeight,
        behavior: 'smooth'
      })
    }
  })
}

// 초기 로드 시 실행
onMounted(() => {
  autoResizeTextarea()
  scrollToBottom()
})

// 메시지 변화 감지해서 스크롤
watch(() => props.messages, () => {
  scrollToBottom()
}, { deep: true })

// n8n 자동화 워크플로우 예시
const exampleWorkflows: ExampleWorkflow[] = [
  { 
    title: '뉴스 모니터링 알림', 
    description: '특정 키워드 뉴스가 올라오면 슬랙으로 자동 알림',
    category: 'trigger',
    n8nUrl: '',
    jsonData: null,
    exampleQuestion: '특정 키워드가 포함된 뉴스가 올라오면 자동으로 슬랙에 알림을 보내는 워크플로우를 만들어줘'
  },
  { 
    title: '고객 문의 자동 분류', 
    description: '이메일 문의를 AI로 분석해서 담당팀에 자동 배정',
    category: 'collection',
    n8nUrl: '',
    jsonData: null,
    exampleQuestion: '고객 이메일이 들어오면 내용을 분석해서 자동으로 적절한 담당팀에게 배정하는 워크플로우를 생성해줘'
  },
  { 
    title: '소셜미디어 감정 분석', 
    description: '브랜드 멘션을 매일 수집해서 감정 분석 후 리포트 생성',
    category: 'processing',
    n8nUrl: '',
    jsonData: null,
    exampleQuestion: '매일 우리 브랜드 관련 SNS 멘션을 수집해서 감정을 분석하고 대시보드에 업데이트하는 워크플로우를 만들어줘'
  },
  { 
    title: '매출 보고서 자동화', 
    description: '매월 말 자동으로 매출 데이터 수집하여 보고서 이메일 발송',
    category: 'action',
    n8nUrl: '',
    jsonData: null,
    exampleQuestion: '매월 말에 자동으로 매출 데이터를 수집해서 보고서를 만들고 경영진에게 이메일로 보내는 워크플로우를 생성해줘'
  },
  { 
    title: '재고 부족 알림', 
    description: '재고가 설정된 수량 이하로 떨어지면 구매팀에 자동 알림',
    category: 'monitoring',
    n8nUrl: '',
    jsonData: null,
    exampleQuestion: '재고가 부족하면 자동으로 구매팀에 알림을 보내는 워크플로우를 만들어줘'
  },
  { 
    title: '신규 고객 환영 메일', 
    description: '새 고객 가입 시 개인화된 환영 이메일과 가이드 자동 발송',
    category: 'automation',
    n8nUrl: '',
    jsonData: null,
    exampleQuestion: '새 고객이 가입하면 자동으로 개인화된 환영 이메일과 온보딩 가이드를 보내는 워크플로우를 생성해줘'
  }
]

// 워크플로우 카테고리별 아이콘
const getWorkflowIcon = (category: string): string => {
  const icons: Record<string, string> = {
    'trigger': '🔄',
    'collection': '📥',
    'processing': '⚙️',
    'action': '📤',
    'monitoring': '👁️',
    'automation': '🚀'
  }
  return icons[category] || '⚡'
}

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


// 마크다운 렌더링
const renderMarkdown = (text: string): string => {
  if (!text) return ''
  try {
    // @ts-ignore - marked는 전역으로 로드됨
    return window.marked.parse(text)
  } catch (error) {
    console.error('마크다운 렌더링 오류:', error)
    return text
  }
}


// 접기/펼치기 함수들
const toggleThinkingBlock = (event: Event) => {
  const header = event.currentTarget as HTMLElement
  const block = header.closest('.thinking-block')
  const content = block?.querySelector('.thinking-content') as HTMLElement
  const toggle = block?.querySelector('.block-toggle') as HTMLElement
  
  if (content && toggle) {
    content.classList.toggle('collapsed')
    toggle.classList.toggle('collapsed')
  }
}

const toggleToolBlock = (event: Event) => {
  const header = event.currentTarget as HTMLElement
  const block = header.closest('.tool-block')
  const content = block?.querySelector('.tool-content') as HTMLElement
  const toggle = block?.querySelector('.block-toggle') as HTMLElement
  
  if (content && toggle) {
    content.classList.toggle('collapsed')
    toggle.classList.toggle('collapsed')
  }
}
</script>

<style scoped>
/* 애니메이션 키프레임 */
@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideInFromLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes typingDots {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.streaming-content {
  display: block;
  width: 100%;
  animation: fadeInScale 0.3s ease-out;
}

/* 부드러운 텍스트 나타나기 효과 */
.streaming-content p,
.streaming-content div {
  animation: textFadeIn 0.4s ease-out;
}


@keyframes textFadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
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
  max-width: 1200px;
  animation: fadeInScale 0.8s ease-out;
}

.logo-container {
  margin-bottom: 48px;
}

.profile-showcase {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.profile-duo {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  position: relative;
}

.profile-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.welcome-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e5e7eb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.welcome-avatar:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.profile-item .profile-name {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-align: center;
}

.logo-symbol {
  font-size: 24px;
  background: linear-gradient(135deg, #74aa9c 0%, #1f8b73 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: bold;
  margin-top: 8px;
}

.welcome-title {
  font-size: 36px;
  font-weight: 700;
  background: linear-gradient(135deg, #1f2937 0%, #374151 50%, #1f8b73 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
  letter-spacing: -1px;
  line-height: 1.2;
}

.welcome-subtitle {
  font-size: 18px;
  color: #6b7280;
  margin-bottom: 48px;
  font-weight: 400;
  line-height: 1.5;
}

.example-workflows {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
  max-width: 1100px;
  margin-left: auto;
  margin-right: auto;
}

.example-workflow {
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  overflow: hidden;
}

.example-workflow::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(116, 170, 156, 0.05) 0%, rgba(31, 139, 115, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.example-workflow:hover {
  border-color: #74aa9c;
  box-shadow: 0 8px 25px rgba(116, 170, 156, 0.15);
  transform: translateY(-2px);
}

.example-workflow:hover::before {
  opacity: 1;
}

.example-workflow:hover .workflow-arrow {
  transform: scale(1.1);
  color: white;
  background: linear-gradient(135deg, #1f8b73 0%, #74aa9c 100%);
  box-shadow: 0 2px 8px rgba(31, 139, 115, 0.3);
}

.example-workflow:hover .workflow-hint {
  opacity: 1;
  color: #1f8b73;
}

.workflow-icon {
  font-size: 28px;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.example-workflow:hover .workflow-icon {
  background: linear-gradient(135deg, #74aa9c 0%, #1f8b73 100%);
  transform: scale(1.1);
}

.workflow-content {
  flex: 1;
  z-index: 1;
}

.example-workflow-title {
  font-weight: 600;
  color: #202123;
  margin-bottom: 6px;
  font-size: 16px;
  line-height: 1.3;
}

.example-workflow-text {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 8px;
}

.workflow-hint {
  color: #9ca3af;
  font-size: 12px;
  font-style: italic;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.workflow-arrow {
  font-size: 20px;
  color: #9ca3af;
  font-weight: 600;
  transition: all 0.3s ease;
  flex-shrink: 0;
  z-index: 1;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 개별 워크플로우 카드 색상 변화 */
.workflow-1:hover .workflow-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
}

.workflow-2:hover .workflow-icon {
  background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
}

.workflow-3:hover .workflow-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.workflow-4:hover .workflow-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.workflow-5:hover .workflow-icon {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.workflow-6:hover .workflow-icon {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.messages {
  flex: 1;
  width: 100%;
  padding: 20px;
  overflow-y: auto;
}

.messages-inner {
  max-width: 1024px;
  margin: 0 auto;
  width: 100%;
}

.message {
  margin-bottom: 32px;
  padding: 0 32px;
  animation: messageSlideIn 0.5s ease-out;
  opacity: 0;
  animation-fill-mode: forwards;
}

/* 사용자 메시지 스타일 (오른쪽 정렬, 말풍선) */
.message.user {
  display: flex;
  justify-content: flex-end;
}

.user-bubble {
  background: var(--message-bg-user, #007bff);
  color: white;
  border-radius: 18px 18px 4px 18px;
  padding: 14px 18px;
  max-width: 75%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
  font-size: 15px;
  line-height: 1.5;
  animation: fadeInScale 0.3s ease-out;
}

/* AI 메시지 컨테이너 (왼쪽 정렬, 프로필 + 메시지) */
.message.assistant {
  display: flex;
  justify-content: flex-start;
}

.ai-message-container {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px;
  max-width: 90%;
  align-items: flex-start;
}

.ai-message-container .message-content {
  flex: 1;
  background: var(--message-bg-assistant, #f8f9fa);
  border-radius: 18px 18px 18px 4px;
  padding: 16px 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  min-height: 52px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  animation: fadeInScale 0.4s ease-out;
}

.profile-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  justify-self: center;
  min-width: 68px;
  margin-top: 12px;
  animation: fadeInScale 0.5s ease-out;
}

.avatar-img {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: block;
}

.profile-name {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary, #6b7280);
  text-align: center;
  margin-top: 2px;
  white-space: nowrap;
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
  max-width: 1024px;
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

/* 중단 버튼 (processing 상태) 빨간색 스타일 */
.send-btn.stop-btn {
  background: #dc2626 !important;
}

.send-btn.stop-btn:hover {
  background: #b91c1c !important;
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
  max-width: 1024px;
  margin-left: auto;
  margin-right: auto;
}

/* 업로드된 파일 표시 스타일 */
.uploaded-files {
  max-width: 1024px;
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
  margin-bottom: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  width: 500px;
  animation: slideInFromLeft 0.4s ease-out;
}

.thinking-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  font-weight: 500;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  justify-content: space-between;
}

.thinking-header:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
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
  transition: max-height 0.3s ease-out, padding 0.3s ease-out;
  overflow: hidden;
}

.thinking-content.collapsed {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.block-toggle {
  font-size: 14px;
  transition: transform 0.2s;
  margin-left: auto;
}

.block-toggle.collapsed {
  transform: rotate(-90deg);
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
  margin-bottom: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  width: 500px;
  animation: slideInFromLeft 0.4s ease-out;
}

.tool-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  font-weight: 500;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  justify-content: space-between;
}

.tool-header:hover {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
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
  transition: max-height 0.3s ease-out, padding 0.3s ease-out;
  overflow: hidden;
}

.tool-content.collapsed {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
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

/* 마크다운 스타일 */
.message-content :deep(h1),
.message-content :deep(h2),
.message-content :deep(h3),
.message-content :deep(h4),
.message-content :deep(h5),
.message-content :deep(h6) {
  margin: 16px 0 8px 0;
  font-weight: 600;
  line-height: 1.3;
}

.message-content :deep(h1) { font-size: 1.5rem; }
.message-content :deep(h2) { font-size: 1.3rem; }
.message-content :deep(h3) { font-size: 1.1rem; }

.message-content :deep(p) {
  margin: 8px 0;
  line-height: 1.6;
}

.message-content :deep(code) {
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 0.9em;
  color: #e11d48;
}

.message-content :deep(pre) {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  overflow-x: auto;
  margin: 12px 0;
}

.message-content :deep(pre code) {
  background: none;
  padding: 0;
  color: #334155;
  font-size: 0.9em;
}

.message-content :deep(ul),
.message-content :deep(ol) {
  margin: 8px 0;
  padding-left: 24px;
}

.message-content :deep(li) {
  margin: 4px 0;
  line-height: 1.5;
}

.message-content :deep(blockquote) {
  border-left: 4px solid #cbd5e1;
  margin: 12px 0;
  padding: 8px 16px;
  background: #f8fafc;
  font-style: italic;
  color: #64748b;
}

.message-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
}

.message-content :deep(th),
.message-content :deep(td) {
  border: 1px solid #e2e8f0;
  padding: 8px 12px;
  text-align: left;
}

.message-content :deep(th) {
  background: #f1f5f9;
  font-weight: 600;
}

.message-content :deep(a) {
  color: #3b82f6;
  text-decoration: underline;
}

.message-content :deep(a:hover) {
  color: #1d4ed8;
}
</style>
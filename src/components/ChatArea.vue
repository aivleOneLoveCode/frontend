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
  <div v-else ref="messagesContainer" class="messages" @scroll="handleScroll" tabindex="0">
    <div class="messages-inner">
      <div v-for="(message, index) in messages" 
           :key="index"
           :class="['message', message.role]">
        
        <!-- 사용자 메시지 -->
        <div v-if="message.role === 'user'" :class="isToolResultMessage(message) ? 'tool-message-container' : 'user-message-container'">
          <!-- tool_result와 tool_use 통합 표시 -->
          <div v-if="isToolResultMessage(message)" class="tool-result-container">
            <div v-for="(toolResult, tridx) in getToolResults(message)" :key="tridx" class="tool-block-wrapper">
              <div class="tool-block">
                <div class="tool-header">
                  <span class="tool-title">{{ getToolNameFromResult(toolResult) }}</span>
                  <div v-if="toolResult.is_pending" class="tool-spinner">⟳</div>
                </div>
                <!-- 디버깅용 tool-content (주석처리)
                <div class="tool-content collapsed">
                  <div v-if="getToolUseForResult(toolResult)" class="tool-input-section">
                    <div class="tool-section-title">Input:</div>
                    <pre>{{ JSON.stringify(getToolUseForResult(toolResult).input, null, 2) }}</pre>
                  </div>
                  <div v-if="!toolResult.is_pending && toolResult.content" class="tool-result-section">
                    <div class="tool-section-title">Result:</div>
                    <pre>{{ JSON.stringify(toolResult.content, null, 2) }}</pre>
                  </div>
                  <div v-else-if="toolResult.is_pending" class="tool-pending-section">
                    <div class="tool-section-title">실행 중...</div>
                    <div class="pending-indicator">🔄 도구를 실행하고 있습니다.</div>
                  </div>
                </div>
                -->
              </div>
            </div>
          </div>
          
          <!-- 일반 사용자 메시지 -->
          <div v-else class="user-message-wrapper">
            <!-- 첨부파일 표시 (채팅 블록 위쪽) -->
            <div v-if="getUserAttachments(message).length > 0" class="user-attachments-container">
              <!-- 이미지 열 -->
              <div v-if="getImageAttachments(message).length > 0" class="image-row">
                <div v-for="(image, iidx) in getImageAttachments(message)" :key="'img-' + iidx" class="attachment-thumbnail image">
                  <img :src="`data:${image.source.media_type};base64,${image.source.data}`" alt="uploaded image" />
                </div>
              </div>
              
              <!-- 다른 파일 열 -->
              <div v-if="getNonImageAttachments(message).length > 0" class="file-column">
                <div v-for="(file, fidx) in getNonImageAttachments(message)" :key="'file-' + fidx" class="uploaded-file-item">
                  <div class="file-icon-container" :class="getFileTypeClass(file.type)">
                    <span class="file-icon">{{ getAttachmentIcon(file.type) }}</span>
                  </div>
                  <div class="file-info">
                    <div class="file-name">{{ getAttachmentName(file) }}</div>
                    <div class="file-type">{{ getFileTypeLabel(file) }}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 텍스트 메시지 -->
            <div class="user-bubble">
              <div v-if="hasText(message)" class="message-text" v-html="renderUserText(message)"></div>
            </div>
          </div>
        </div>
        
        <!-- 어시스턴트 메시지 -->
        <div v-else-if="message.role === 'assistant'">
          <!-- 각 content 블록을 개별 메시지로 처리 -->
          <div v-for="(content, cidx) in message.content" :key="cidx">
            
            <!-- Thinking 메시지 (짜니) -->
            <div v-if="content.type === 'thinking'" class="ai-message-container thinking-message">
              <div class="profile-section">
                <img :src="zzanyProfile" alt="짜니" class="avatar-img" />
                <span class="profile-name">짜니</span>
              </div>
              <div class="message-content thinking-content">
                <div v-html="renderMarkdown(content.thinking || '')"></div>
              </div>
            </div>
            
            <!-- Tool Use 메시지는 숨김 (짜니) -->
            <div v-else-if="content.type === 'tool_use'" style="display: none;"></div>
            
            <!-- 일반 텍스트 메시지 (다니) -->
            <div v-else-if="content.type === 'text'" class="ai-message-container text-message">
              <div class="profile-section">
                <img :src="danyProfile" alt="다니" class="avatar-img" />
                <span class="profile-name">다니</span>
              </div>
              <div class="message-content">
                <div v-html="renderMarkdown(content.text || '')"></div>
              </div>
            </div>
            
          </div>
        </div>
        
      </div>
    </div>
  </div>

  <!-- 입력 영역 -->
  <div class="input-container">
    <div class="input-box-container">
      
      <input type="file" @change="$emit('handle-file-upload', $event)" style="display: none;" ref="fileInput" multiple>
      
      <div class="input-box" 
           :class="{ 'has-files': uploadedFiles.length > 0, 'drag-over': isDragging }"
           @dragenter="$emit('handle-drag-enter', $event)"
           @dragover="$emit('handle-drag-over', $event)"
           @dragleave="$emit('handle-drag-leave', $event)"
           @drop="$emit('handle-drop', $event)">
        
        <!-- 업로드된 파일들을 입력창 상단에 표시 -->
        <div v-if="uploadedFiles.length > 0" class="uploaded-files-inline" contenteditable="false">
          <div v-for="(file, index) in uploadedFiles" :key="index" class="uploaded-file-inline">
            <span class="file-icon">{{ getFileIcon(file.type) }}</span>
            <span class="file-name">{{ file.name }}</span>
            <button v-if="file.type === 'application/json'" class="share-file-btn" @click="$emit('share-file-to-board', file, index)" :title="'게시판에 공유'">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 3h18v18H3zM9 9h6v6H9z"/>
                <path d="M9 3v6M15 3v6M21 9H15M21 15H15M9 15v6M15 15v6M3 9h6M3 15h6"/>
              </svg>
            </button>
            <button class="remove-file-btn" @click="$emit('remove-uploaded-file', index)" :title="t('remove_file')">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- 하단 입력 영역 (첨부버튼 + 텍스트입력 + 전송버튼) -->
        <div class="input-row">
          <div class="input-left-btn">
            <button class="file-upload-btn" :title="t('file_upload')" @click="fileInput?.click()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
            </button>
          </div>

          <!-- 텍스트 입력 영역 (contenteditable) -->
          <div class="text-input-area" 
               ref="textareaRef"
               contenteditable="true"
               :data-placeholder="!inputText.trim() ? t('enter_message') : ''"
               @input="handleInput"
               @keydown="$emit('handle-keydown', $event)">
          </div>

          <div class="input-right-btn">
            <button 
              :class="['send-btn', { 'stop-btn': props.isProcessing && !props.isStopRequested }]" 
              @click="props.isProcessing && !props.isStopRequested ? handleStopMessage() : handleSendMessage()" 
              :disabled="(props.isProcessing && props.isStopRequested) || (!props.isProcessing && (!props.canSendMessage || (!props.inputText.trim() && uploadedFiles.length === 0)))" 
              :title="props.isProcessing && !props.isStopRequested ? '응답 중단' : t('send_message')">
              <!-- 중단 아이콘 (메시지 전송중이고 아직 중단 요청 안됨) -->
              <svg v-if="props.isProcessing && !props.isStopRequested" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="1"/>
              </svg>
              <!-- 전송 아이콘 (평상시 또는 중단 요청됨) -->
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m5 12 7-7 7 7"/>
                <path d="M12 19V5"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div v-if="isDragging" class="drag-overlay">
          📋 워크플로우를 여기에 드롭하세요
        </div>
      </div>
    </div>
    
    <div class="disclaimer">
      {{ t('disclaimer') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted, onUnmounted } from 'vue'
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
  role: 'user' | 'assistant'
  content: any[]
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
  isStopRequested?: boolean
  canSendMessage?: boolean
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
  'share-file-to-board': [file: any, index: number]
  'share-all-files-to-board': []
}>()

const textareaRef = ref<HTMLTextAreaElement>()
const messagesContainer = ref<HTMLDivElement>()
const { t } = useTranslation()

// 스마트 스크롤 상태 관리
const isUserScrolling = ref(false)
const scrollThrottleTimeout = ref<number | null>(null)
const lastMessagesLength = ref(0)
const isInitialRender = ref(true)

// 자동 리사이징 기능 (HTML과 동일)
const autoResizeTextarea = () => {
  nextTick(() => {
    const textarea = textareaRef.value
    if (textarea) {
      textarea.style.height = 'auto'
      const newHeight = Math.min(textarea.scrollHeight, 400)
      textarea.style.height = newHeight + 'px'
      
      // 최대 높이에 도달했을 때 스크롤 표시
      if (textarea.scrollHeight > 400) {
        textarea.style.overflowY = 'auto'
      } else {
        textarea.style.overflowY = 'hidden'
      }
    }
  })
}

// contenteditable input 핸들러
const handleInput = (event: Event) => {
  const target = event.target as HTMLDivElement
  const text = target.textContent || ''
  emit('update:input-text', text)
  autoResizeTextarea()
}

// 메시지 전송 핸들러
const handleSendMessage = () => {
  emit('send-message')
  // 메시지 전송 시 강제로 맨 아래 스크롤
  forceScrollToBottom()
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
watch(() => props.inputText, (newValue) => {
  // contenteditable div의 내용 업데이트
  if (textareaRef.value && textareaRef.value.textContent !== newValue) {
    textareaRef.value.textContent = newValue
  }
  autoResizeTextarea()
})

// 스크롤이 맨 아래에 있는지 확인
const isScrolledToBottom = (): boolean => {
  if (!messagesContainer.value) return true
  const container = messagesContainer.value
  const threshold = 100 // 100px 정도 여유를 둠
  return container.scrollHeight - container.scrollTop - container.clientHeight <= threshold
}

// 스크롤 이벤트 핸들러 (즉각 반응 + 스로틀링)
const handleScroll = () => {
  // 즉시 사용자 스크롤 상태 업데이트 (실시간 반응)
  const isAtBottom = isScrolledToBottom()
  isUserScrolling.value = !isAtBottom
  
  // 스로틀링으로 성능 최적화 (상태 안정화)
  if (scrollThrottleTimeout.value) {
    clearTimeout(scrollThrottleTimeout.value)
  }
  
  scrollThrottleTimeout.value = window.setTimeout(() => {
    isUserScrolling.value = !isScrolledToBottom()
    scrollThrottleTimeout.value = null
  }, 50) // 150ms → 50ms로 줄여서 더 빠른 반응
}

// 메시지 영역을 맨 아래로 스크롤 (스마트 스크롤)
const scrollToBottom = (immediate = false) => {
  nextTick(() => {
    if (messagesContainer.value && !isUserScrolling.value) {
      messagesContainer.value.scrollTo({
        top: messagesContainer.value.scrollHeight,
        behavior: immediate ? 'instant' : 'smooth'
      })
    }
  })
}

// 즉시 맨 아래로 스크롤 (애니메이션 없음)
const scrollToBottomInstant = () => {
  // DOM 렌더링이 완전히 끝날 때까지 기다린 후 스크롤
  nextTick(() => {
    setTimeout(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }, 0)
  })
}

// 메시지 전송 시 강제로 맨 아래 스크롤
const forceScrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      isUserScrolling.value = false // 사용자 스크롤 상태 재설정
      messagesContainer.value.scrollTo({
        top: messagesContainer.value.scrollHeight,
        behavior: 'smooth'
      })
    }
  })
}

// 사용자 인터랙션 감지 (즉시 제어권 가져가기)
const handleUserInteraction = () => {
  if (!isScrolledToBottom()) {
    isUserScrolling.value = true
  }
}

// 초기 로드 시 실행
onMounted(() => {
  autoResizeTextarea()
  
  // 이벤트 리스너들 추가
  if (messagesContainer.value) {
    messagesContainer.value.addEventListener('scroll', handleScroll, { passive: true })
    messagesContainer.value.addEventListener('wheel', handleUserInteraction, { passive: true })
    messagesContainer.value.addEventListener('touchstart', handleUserInteraction, { passive: true })
    messagesContainer.value.addEventListener('keydown', handleUserInteraction, { passive: true })
  }
})

// 메시지 변화 감지해서 스크롤
watch(() => props.messages, (newMessages) => {
  const currentLength = newMessages.length
  
  // 첫 렌더링이거나 메시지가 크게 변화한 경우 (세션 전환)
  const isDramaticChange = Math.abs(currentLength - lastMessagesLength.value) > 1 || currentLength === 0
  const isNewSession = isInitialRender.value || isDramaticChange
  
  if (isNewSession) {
    // 세션 전환이나 초기 로드시에는 즉시 스크롤
    scrollToBottomInstant()
    isInitialRender.value = false
  } else {
    // 실시간 스트리밍 중에는 스마트 스크롤 (1개씩 증가하는 경우)
    scrollToBottom()
  }
  
  lastMessagesLength.value = currentLength
}, { deep: true, immediate: true })

// showWelcome 변화 감지 (새 채팅 시작)
watch(() => props.showWelcome, (newVal, oldVal) => {
  if (oldVal === true && newVal === false) {
    // Welcome에서 채팅으로 전환되는 순간
    isInitialRender.value = true
  }
})

// cleanup
onUnmounted(() => {
  if (messagesContainer.value) {
    messagesContainer.value.removeEventListener('scroll', handleScroll)
    messagesContainer.value.removeEventListener('wheel', handleUserInteraction)
    messagesContainer.value.removeEventListener('touchstart', handleUserInteraction)
    messagesContainer.value.removeEventListener('keydown', handleUserInteraction)
  }
  if (scrollThrottleTimeout.value) {
    clearTimeout(scrollThrottleTimeout.value)
  }
})

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

// 사용자 텍스트 렌더링 (간단한 줄바꿈 처리)
const renderUserText = (message: any): string => {
  // 첫 번째 text content만 메시지로 표시
  const firstText = message.content.find((c: any) => c.type === 'text')
  if (firstText) {
    return firstText.text.replace(/\n/g, '<br>')
  }
  return ''
}

// 메시지에 특정 타입의 컨텐츠가 있는지 확인 (첫 번째 text만 체크)
const hasText = (message: any): boolean => {
  return message.content.length > 0 && message.content[0].type === 'text'
}


// 사용자 메시지에서 첨부파일 추출 (첫번째 content 이후의 모든 것)
const getUserAttachments = (message: any): any[] => {
  if (!message.content || !Array.isArray(message.content)) return []
  
  // 첫 번째 content를 제외한 나머지 모든 content를 첨부파일로 처리
  // (두 번째 text도 첨부파일로 취급)
  return message.content.slice(1).map((c: any, index: number) => {
    // text 타입도 첨부파일로 처리 (워크플로우 JSON 등)
    if (c.type === 'text') {
      // JSON 파싱 시도
      let isJson = false
      let jsonData = null
      try {
        jsonData = JSON.parse(c.text)
        isJson = true
      } catch {}
      
      // 워크플로우 JSON에서 이름 추출
      let fileName = `attachment_${index + 1}.${isJson ? 'json' : 'txt'}`
      if (isJson && jsonData) {
        // 워크플로우 이름 추출 시도
        if (jsonData.workflow_name) {
          fileName = `${jsonData.workflow_name}.json`
        } else if (jsonData.workflow_json?.name) {
          fileName = `${jsonData.workflow_json.name}.json`
        } else if (jsonData.name) {
          fileName = `${jsonData.name}.json`
        }
      }
      
      return {
        ...c,
        type: isJson ? 'json' : 'text',
        name: fileName,
        text: c.text
      }
    }
    return c
  })
}

// 이미지 첨부파일만 추출
const getImageAttachments = (message: any): any[] => {
  const attachments = getUserAttachments(message)
  return attachments.filter((c: any) => c.type === 'image')
}

// 이미지가 아닌 첨부파일 추출
const getNonImageAttachments = (message: any): any[] => {
  const attachments = getUserAttachments(message)
  return attachments.filter((c: any) => {
    return c.type !== 'image'
  })
}

// 첨부파일 아이콘 결정
const getAttachmentIcon = (type: string): string => {
  switch(type) {
    case 'image': return '🖼️'
    case 'document': return '📄'
    case 'workflow': return '📋'
    case 'json': return '📋'
    case 'text': return '📝'
    default: return '📁'
  }
}

// 첨부파일 이름 추출
const getAttachmentName = (attachment: any): string => {
  // 워크플로우 JSON인 경우 (게시판에서 추가된 경우)
  if (attachment.type === 'json' || attachment.type === 'text') {
    // 파일명에서 워크플로우 이름 추출 (예: "간단한 데이터 가져오기.json")
    if (attachment.name) {
      // .json 확장자 제거
      return attachment.name.replace(/\.json$/i, '').replace(/\.txt$/i, '')
    }
    return 'Workflow'
  }
  
  // workflow나 json 타입의 경우 실제 파일명이 있을 수 있음
  if (attachment.type === 'workflow') {
    return attachment.workflow_name || attachment.name || 'Workflow'
  }
  
  // attachment에 name 필드가 있으면 사용
  if (attachment.name) return attachment.name
  
  // 타입별 기본 이름
  switch(attachment.type) {
    case 'document': return 'Document'
    default: return 'File'
  }
}

// 파일 타입 CSS 클래스
const getFileTypeClass = (type: string): string => {
  return type
}

// 파일 타입 라벨
const getFileTypeLabel = (file: any): string => {
  const type = file.type
  
  // json 타입일 때 워크플로우 출처 판단
  if (type === 'json') {
    try {
      const jsonData = typeof file.text === 'string' ? JSON.parse(file.text) : file.text
      
      // 게시판에서 온 경우: workflow_name과 workflow_json 구조
      if (jsonData.workflow_name && jsonData.workflow_json) {
        return '게시판'
      }
      // 내 워크플로우에서 온 경우: 바로 워크플로우 JSON 구조
      else if (jsonData.nodes && jsonData.connections) {
        return '내 워크플로우'
      }
    } catch {
      // 파싱 실패 시 기본값
    }
    return '워크플로우'
  }
  
  switch(type) {
    case 'document': return 'PDF'
    case 'text': return '텍스트'
    case 'workflow': return '워크플로우'
    default: return '파일'
  }
}


// tool_result 메시지인지 확인
const isToolResultMessage = (message: any): boolean => {
  return message.content.some((c: any) => c.type === 'tool_result')
}


// 스트리밍 상태 확인 (실제 구현 시 store와 연동)
// const isStreaming = (message: any, content: any): boolean => {
//   // TODO: 실제 스트리밍 상태 확인 로직
//   return false
// }

// tool_result 메시지에서 tool_result들 추출
const getToolResults = (message: any): any[] => {
  if (!message.content || !Array.isArray(message.content)) return []
  return message.content.filter((c: any) => c.type === 'tool_result')
}

// tool_result에 대응하는 tool_use 찾기
const getToolUseForResult = (toolResult: any): any => {
  const toolId = toolResult.tool_use_id
  if (!toolId) return null
  
  // 이전 메시지들에서 tool_use 찾기
  for (let i = props.messages.length - 1; i >= 0; i--) {
    const message = props.messages[i]
    if (message.role === 'assistant') {
      const toolUse = message.content.find((c: any) => 
        c.type === 'tool_use' && c.id === toolId
      )
      if (toolUse) return toolUse
    }
  }
  return null
}

// tool_result에서 tool 상태 메시지 가져오기
const getToolNameFromResult = (toolResult: any): string => {
  const toolUse = getToolUseForResult(toolResult)
  if (!toolUse) return '도구 실행 중'
  
  const toolName = toolUse.name
  const toolInput = toolUse.input || {}
  const toolContent = toolResult.content || {}
  
  // 실행 중일 때
  if (toolResult.is_pending) {
    return getToolPendingMessage(toolName, toolInput)
  }
  
  // 실행 완료일 때
  return getToolCompleteMessage(toolName, toolInput, toolContent)
}

// 실행 중 메시지
const getToolPendingMessage = (toolName: string, input: any): string => {
  switch(toolName) {
    case 'search_nodes':
      return input.query ? `블록 검색 중 (${input.query})` : `블록 검색 중`
    case 'list_nodes':
      if (input.category) {
        return `블록 검색 중 (카테고리: ${input.category})`
      } else if (input.package) {
        const packageName = input.package === '@n8n/n8n-nodes-langchain' ? 'AI 노드' : '기본 노드'
        return `블록 검색 중 (${packageName})`
      } else if (input.isAITool) {
        return `AI 블록 검색 중`
      } else {
        return `전체 블록 검색 중`
      }
    case 'get_node_info':
      return `블록 정보 확인 중`
    case 'validate_workflow':
      return `워크플로우 점검 중`
    case 'n8n_create_workflow':
      return `워크플로우 생성 중`
    case 'n8n_update_full_workflow':
      return `워크플로우 변경 중`
    case 'n8n_delete_workflow':
      return `워크플로우 삭제 중`
    case 'n8n_list_workflows':
      return `워크플로우 검색 중`
    case 'n8n_get_workflow':
      return `워크플로우 정보 확인 중`
    default:
      return `${toolName} 실행 중`
  }
}

// 실행 완료 메시지
const getToolCompleteMessage = (toolName: string, input: any, content: any): string => {
  switch(toolName) {
    case 'search_nodes':
      if (content && content.results && Array.isArray(content.results)) {
        const count = content.totalCount || content.results.length
        return count > 0 
          ? `${count}개 블록 검색 완료 (${input.query || ''})`
          : `블록 검색 결과 없음 (${input.query || ''})`
      } else {
        return `블록 검색 결과 없음 (${input.query || ''})`
      }
    case 'list_nodes':
      if (content && content.nodes && Array.isArray(content.nodes)) {
        const count = content.totalCount || content.nodes.length
        let searchType = ''
        if (input.category) {
          searchType = ` (카테고리: ${input.category})`
        } else if (input.package) {
          const packageName = input.package === '@n8n/n8n-nodes-langchain' ? 'AI 노드' : '기본 노드'
          searchType = ` (${packageName})`
        } else if (input.isAITool) {
          searchType = ' (AI 블록)'
        }
        return count > 0 
          ? `${count}개 블록 검색 완료${searchType}`
          : `블록 검색 결과 없음${searchType}`
      } else {
        return `블록 검색 결과 없음`
      }
    case 'get_node_info':
      const displayName = content?.displayName || (input.nodeType ? input.nodeType.replace('nodes-base.', '') : '')
      if (content && Object.keys(content).length > 0) {
        return `블록 정보 확인 완료 (${displayName})`
      } else {
        return `블록 정보 없음 (${displayName})`
      }
    case 'validate_workflow':
      const workflowName = input.workflow?.name || '워크플로우'
      if (content.valid === true) {
        const warningCount = content.summary?.warningCount || 0
        if (warningCount > 0) {
          return `워크플로우 점검 완료 "${workflowName}" (경고 ${warningCount}개)`
        } else {
          return `워크플로우 점검 완료 "${workflowName}"`
        }
      } else {
        const errorCount = content.summary?.errorCount || 0
        return `워크플로우 점검 오류 "${workflowName}" (오류 ${errorCount}개)`
      }
    case 'n8n_create_workflow':
      const workflowCreateName = content.data?.name || input.name || '워크플로우'
      if (content.success === true) {
        return `"${workflowCreateName}" 워크플로우 생성 완료`
      } else {
        return `"${workflowCreateName}" 워크플로우 생성 오류`
      }
    case 'n8n_update_full_workflow':
      if (content.success === true) {
        return `${input.workflow?.name || ''} 워크플로우 변경 완료`
      } else {
        return `${input.workflow?.name || ''} 워크플로우 변경 오류`
      }
    case 'n8n_delete_workflow':
      if (content.success === true) {
        return `워크플로우 삭제 완료`
      } else {
        return `워크플로우 삭제 오류`
      }
    case 'n8n_list_workflows':
      return getListWorkflowCompleteMessage(input, content)
    case 'n8n_get_workflow':
      const workflowGetName = content.data?.name || ''
      if (content.success === true) {
        return `워크플로우 정보 확인 완료 "${workflowGetName}"`
      } else {
        return `워크플로우 정보 확인 오류`
      }
    default:
      return `${toolName} 실행 완료`
  }
}

// n8n_list_workflows 실행 완료 메시지
const getListWorkflowCompleteMessage = (input: any, content: any): string => {
  const tags = input.tags || []
  const workflows = content.data?.workflows || content.workflows || []
  const count = content.data?.returned || workflows.length
  
  let searchType = '워크플로우'
  if (tags.length === 0) {
    searchType = '내 워크플로우'
  } else if (tags[0] === 'well_defined_node') {
    searchType = '검증된 블록'
  } else if (tags[0] === 'well_defined_workflow') {
    searchType = '검증된 워크플로우'
  }
  
  if (count > 0) {
    return `${searchType} ${count}개 검색 완료`
  } else {
    return `${searchType} 결과 없음`
  }
}

// 블록 접기/펼치기 (디버깅용 - 주석처리)
// const toggleBlock = (event: Event) => {
//   const header = event.currentTarget as HTMLElement
//   const block = header.closest('.thinking-block, .tool-block')
//   const content = block?.querySelector('.thinking-content, .tool-content')
//   const toggle = block?.querySelector('.block-toggle')
//   
//   if (content && toggle) {
//     content.classList.toggle('collapsed')
//     toggle.textContent = content.classList.contains('collapsed') ? '▼' : '▲'
//   }
// }


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
  align-items: flex-start;
  justify-content: center;
  padding: 20px;
  padding-top: 60px;
}

.welcome-area {
  text-align: center;
  max-width: 1200px;
  animation: fadeInScale 0.8s ease-out;
  padding-top: 100px;
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
  z-index: 10;
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
  outline: none; /* 키보드 포커스 시 outline 제거 */
}

.messages-inner {
  max-width: 1040px;
  margin: 0 auto;
  width: 100%;
}

.message {
  margin-bottom: 24px;
  animation: messageSlideIn 0.5s ease-out;
  opacity: 0;
  animation-fill-mode: forwards;
}

.message-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* 사용자 메시지 스타일 (오른쪽 정렬, 말풍선) */
.message.user {
  display: flex;
  justify-content: flex-end;
  padding: 0px;
}

.user-message-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  max-width: 70%;
}

.user-message-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

/* 사용자 첨부파일 컨테이너 */
.user-attachments-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  margin-bottom: 8px;
}

/* 이미지 행 (가로 정렬) */
.image-row {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* 파일 열 (세로 정렬) */
.file-column {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
}

/* 이미지 썸네일 */
.attachment-thumbnail.image {
  width: 128px;
  height: 128px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color, #e5e7eb);
  background: #f9fafb;
}


.attachment-thumbnail.image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 일반 파일 아이템 */
.uploaded-file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: white;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  width: 200px;
  min-width: 200px;
  max-width: 200px;
}


.file-icon-container {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.file-icon-container.json {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.file-icon-container.document {
  background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
}

.file-icon-container.workflow {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.file-icon-container .file-icon {
  font-size: 16px;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-info .file-name {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-info .file-type {
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  font-weight: 500;
}

/* 사용자 메시지의 uploaded-file-inline 스타일 */
.user-attachments-container .uploaded-file-inline {
  /* input-box와 동일한 스타일 유지 */
  display: flex;
  align-items: center;
}

/* 사용자 채팅 말풍선 */
.user-bubble {
  background: #f3f4f6;
  color: #374151;
  border-radius: 18px 18px 4px 18px;
  padding: 12px 16px;
  max-width: 500px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  animation: fadeInScale 0.3s ease-out;
}

.message-text {
  font-size: 15px;
  line-height: 1.5;
  word-wrap: break-word;
}

.tool-result-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  margin-bottom: 12px;
}

.tool-block-wrapper {
  display: flex;
  justify-content: flex-start;
  width: 100%;
}

/* Tool Input/Result 섹션 스타일 */
.tool-input-section,
.tool-result-section {
  margin-bottom: 12px;
}

.tool-section-title {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 4px;
  text-transform: uppercase;
}

/* Tool pending 상태 스타일 */
.tool-pending-section {
  margin-bottom: 12px;
}

.pending-indicator {
  color: #6b7280;
  font-style: italic;
  font-size: 13px;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 6px;
  border-left: 3px solid #3b82f6;
}

/* 도구 메시지 컨테이너 (좌측 정렬) */
.tool-message-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 540px;
  width: fit-content;
  margin-left: 140px;
  margin-right: auto;
  animation: fadeInScale 0.3s ease-out;
}

/* 사용자 메시지 컨테이너 (우측 정렬) */
.user-message-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  max-width: 540px;
  width: fit-content;
  margin-left: auto;
  margin-right: 122px;
  animation: fadeInScale 0.3s ease-out;
}

/* 일반 사용자 텍스트 메시지 스타일 */
.user-text-message {
  background: var(--message-bg-user, #007bff);
  border-radius: 18px 18px 4px 18px;
  padding: 14px 18px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
  font-size: 15px;
  line-height: 1.5;
  width: fit-content;
  max-width: 100%;
}

/* 디버그용 메시지 스타일 */
.message-debug {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 12px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 12px;
  line-height: 1.4;
  max-width: 100%;
  overflow-x: auto;
}

.message-debug pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* AI 메시지 컨테이너 (왼쪽 정렬, 프로필 + 메시지) */
.message.assistant {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 32px;
}

.ai-message-container {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px;
  max-width: 100%;
  align-items: flex-start;
}

/* 각 메시지 타입별 여백 */
.thinking-message,
.tool-message {
  margin-bottom: 24px;
}

/* 각 메시지 타입별 여백 */
.thinking-message,
.tool-message,
.text-message {
  max-width: 700px;
}

.message-content {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 18px 18px 18px 4px;
  padding: 8px 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  animation: fadeInScale 0.4s ease-out;
  font-size: 15px;
  line-height: 1.6;
}

.message-content.streaming {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-color: #3b82f6;
}

/* 말풍선 꼬리 효과 */
.ai-message-container .message-content::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 20px;
  width: 0;
  height: 0;
  border-right: 10px solid #ffffff;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
}

/* 말풍선 꼬리 테두리 */
.ai-message-container .message-content::after {
  content: '';
  position: absolute;
  left: -9px;
  top: 19px;
  width: 0;
  height: 0;
  border-right: 11px solid #e5e7eb;
  border-top: 7px solid transparent;
  border-bottom: 7px solid transparent;
  z-index: -1;
}

.profile-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  justify-self: center;
  min-width: 68px;
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
}

.input-container {
  background: var(--bg-color);
  padding: 0;
  margin: 0;
  z-index: 100;
}

.input-box-container {
  max-width: 780px;
  width: 100%;
  margin: 0 auto;
}

.input-box {
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 24px;
  padding: 8px;
  max-height: 100%;
  position: relative;
}



/* 인라인 첨부파일 스타일 */
.uploaded-files-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
  padding: 4px 0;
  user-select: none;
  pointer-events: auto;
}

.input-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.input-left-btn,
.input-right-btn {
  flex-shrink: 0;
}

.text-input-area {
  flex: 1;
  min-height: 28px;
  outline: none;
  padding: 4px 8px;
}

.uploaded-file-inline {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: var(--panel-bg, #f3f4f6);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  font-size: 12px;
  color: var(--text-color);
  transition: all 0.2s;
  user-select: none;
  pointer-events: auto;
}

.uploaded-file-inline:hover {
  background: var(--panel-hover, #f9fafb);
}

.uploaded-file-inline .file-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.uploaded-file-inline .file-name {
  font-weight: 500;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.uploaded-file-inline .file-size {
  font-size: 10px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.uploaded-file-inline .share-file-btn,
.uploaded-file-inline .remove-file-btn {
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
  pointer-events: auto;
}

.uploaded-file-inline .share-file-btn:hover {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.uploaded-file-inline .remove-file-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}


.text-input-area:empty:before,
.text-input-area[data-placeholder]:before {
  content: attr(data-placeholder);
  color: var(--text-muted);
  pointer-events: none;
  position: absolute;
}

.file-upload-btn {
  background: transparent;
  border: none;
  cursor: pointer;
}

.file-upload-btn:hover {
  background: var(--panel-hover);
  color: var(--text-color);
}

.send-btn {
  background: #2d2d2d;
  border: none;
  color: white;
  cursor: pointer;
}

.send-btn:hover {
  background: #1a1a1a;
}

/* 중단 버튼 (processing 상태) 검정색 스타일 */
.send-btn.stop-btn {
  background: #000000;
}

.send-btn.stop-btn:hover {
  background: #1f2937;
}

.send-btn svg {
  color: white;
  stroke: white;
  fill: none;
}

.send-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.input-box.drag-over {
  border-color: #67bdc6;
  background: #f0fdf4;
}

.drag-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(103, 189, 198, 0.1);
  border: 2px dashed #67bdc6;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #67bdc6;
  font-size: 14px;
  font-weight: 500;
  pointer-events: none;
  z-index: 10;
}

.disclaimer {
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
  margin: 7px auto;
  max-width: 780px;
}

/* 업로드된 파일 표시 스타일 */
.uploaded-files {
  max-width: 1000px;
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

.share-file-btn {
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

.share-file-btn:hover {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.share-file-btn svg {
  stroke: currentColor;
}

.share-all-files-btn {
  width: 32px;
  height: 32px;
  background: #10b981;
  border: none;
  border-radius: 16px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.share-all-files-btn:hover {
  background: #059669;
  transform: scale(1.05);
}

.share-all-files-btn svg {
  stroke: currentColor;
}

.file-count-badge {
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 10px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

/* Thinking 표시 스타일 */
.thinking-block {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  animation: slideInFromLeft 0.4s ease-out;
}

.thinking-block.streaming {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
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
  padding: 8px 16px;
  transition: max-height 0.3s ease-out, padding 0.3s ease-out;
  overflow: hidden;
}

.thinking-content.collapsed {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
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

/* Tool 블록 스타일 */
.tool-block {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #0891b2;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(8, 145, 178, 0.1);
  animation: slideInFromLeft 0.4s ease-out;
}

.tool-header {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
  color: white;
  padding: 10px 16px;
  font-weight: 500;
  font-size: 14px;
  user-select: none;
}

.tool-header.completed {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.tool-icon {
  font-size: 16px;
}

.tool-title {
  flex: 1;
}

.tool-spinner {
  animation: spin 2s linear infinite;
  font-size: 14px;
}

.tool-status {
  font-size: 14px;
  font-weight: bold;
}

.block-toggle {
  font-size: 12px;
  transition: transform 0.3s ease;
}

.tool-content {
  padding: 12px 16px;
  background: #f0f9ff;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 12px;
  color: #0c4a6e;
  transition: all 0.3s ease;
  max-height: 300px;
  overflow-y: auto;
}

.tool-content.collapsed {
  max-height: 0;
  padding: 0;
  overflow: hidden;
}

.tool-input {
  padding: 12px 16px;
  background: #f0f9ff;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 12px;
  color: #0c4a6e;
}

.tool-input pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.tool-result-block {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #22c55e;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(34, 197, 94, 0.1);
  max-width: 500px;
  animation: slideInFromLeft 0.4s ease-out;
}

.tool-result-content {
  padding: 12px 16px;
  background: #f0fdf4;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 12px;
  color: #15803d;
}

.tool-result-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
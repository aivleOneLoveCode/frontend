import { defineStore } from 'pinia'
import { sessionService, type Session, type SessionWithMessages } from '@/services/session'
import { chatStream, type StreamUpdate } from '@/services/chatStream'
import { FileUploadService, type UploadedFile } from '@/services/fileUpload'
import { useWorkflowStore } from './workflow'

interface Message {
  role: 'user' | 'assistant'
  content: any[] // Claude content blocks 형태 
}

interface ChatHistory {
  session_id: string
  title: string
  active: boolean
  messages: Message[]
  created_at: string
  updated_at: string
}

interface ToolExecution {
  name: string
  input: any
  result?: string
  isExecuting: boolean
  error?: string
}

interface ChatState {
  sessions: ChatHistory[]
  currentSessionId: string | null
  messages: Message[]
  isLoading: boolean
  isStreaming: boolean
  streamingMessage: Message | null
  isThinking: boolean
  thinkingText: string
  streamingText: string
  isUsingTool: boolean
  currentToolExecution: ToolExecution | null
  toolExecutions: ToolExecution[]
  uploadedFiles: UploadedFile[]
  updateThrottleId: number | null
  abortController: AbortController | null
  isStopRequested: boolean
}

export const useChatStore = defineStore('chat', {
  state: (): ChatState => ({
    sessions: [],
    currentSessionId: null,
    messages: [],
    isLoading: false,
    isStreaming: false,
    streamingMessage: null,
    isThinking: false,
    thinkingText: '',
    streamingText: '',
    isUsingTool: false,
    currentToolExecution: null,
    toolExecutions: [],
    uploadedFiles: [],
    updateThrottleId: null,
    abortController: null,
    isStopRequested: false
  }),

  getters: {
    currentSession: (state): ChatHistory | undefined => {
      return state.sessions.find(session => session.session_id === state.currentSessionId)
    },

    activeSessions: (state): ChatHistory[] => {
      return state.sessions
    },

    hasAnySessions: (state): boolean => {
      return state.sessions.length > 0
    },

    currentMessages: (state): Message[] => {
      // 항상 state.messages를 사용 (단일 소스)
      return state.messages
    },

    canSendMessage: (state): boolean => {
      return !state.isLoading && !state.isStreaming && !state.isStopRequested
    },

    isProcessing: (state): boolean => {
      return state.isThinking || state.isUsingTool || state.isStreaming
    }
  },

  actions: {
    // Vue 반응성 강제 업데이트 (스로틀링됨)
    forceUpdate() {
      if (this.updateThrottleId) {
        cancelAnimationFrame(this.updateThrottleId)
      }
      this.updateThrottleId = requestAnimationFrame(() => {
        this.messages = [...this.messages]
        this.updateThrottleId = null
      })
    },

    // 세션 목록 로드
    async loadSessions() {
      try {
        this.isLoading = true
        const sessions = await sessionService.getSessions()
        this.sessions = sessions.map(session => ({
          ...session,
          active: false,
          messages: []
        }))
      } catch (error) {
        console.error('세션 로드 실패:', error)
      } finally {
        this.isLoading = false
      }
    },

    // 특정 세션 선택 및 메시지 로드
    async selectSession(sessionId: string) {
      try {
        this.isLoading = true
        this.currentSessionId = sessionId
        
        // 모든 세션의 active 상태 초기화
        this.sessions.forEach(session => {
          session.active = session.session_id === sessionId
        })

        // 세션 메시지 로드
        const sessionData = await sessionService.getSession(sessionId)
        const sessionIndex = this.sessions.findIndex(s => s.session_id === sessionId)
        
        if (sessionIndex !== -1) {
          this.sessions[sessionIndex].messages = sessionData.messages
          this.messages = sessionData.messages
        }
      } catch (error) {
        console.error('세션 선택 실패:', error)
      } finally {
        this.isLoading = false
      }
    },

    // 새 채팅 시작
    startNewChat() {
      this.currentSessionId = null
      this.messages = []
      this.uploadedFiles = []
      this.isStopRequested = false
      
      // 모든 세션의 active 상태 초기화
      this.sessions.forEach(session => {
        session.active = false
      })
    },

    // 임시프론트와 동일한 메시지 전송 로직
    async sendMessage(text: string, files: UploadedFile[] = []) {
      if (!text.trim() && files.length === 0) return
      if (this.isStreaming || this.isLoading) return

      try {
        // content 블록 생성 (화면 표시와 백엔드 전송 모두 동일하게)
        const contentBlocks = FileUploadService.createContentBlocks(text, files)
        
        // 사용자 메시지를 화면에 먼저 표시
        const userMessage: Message = {
          role: 'user',
          content: contentBlocks
        }
        this.messages.push(userMessage)
        this.uploadedFiles = [] // 파일 목록 초기화

        // AbortController 생성 및 스트리밍 요청
        this.abortController = new AbortController()
        this.isStreaming = true
        await this.streamChatLikeTemp(contentBlocks)

      } catch (error) {
        console.error('메시지 전송 실패:', error)
        
        // 사용자가 중단한 경우가 아닌 실제 에러인 경우에만 에러 메시지 표시
        if (error instanceof Error && error.name !== 'AbortError') {
          const errorMessage: Message = {
            role: 'assistant',
            content: [{ type: 'text', text: '죄송합니다. 메시지 전송 중 오류가 발생했습니다.' }]
          }
          this.messages.push(errorMessage)
        } else if (error instanceof Error && error.name === 'AbortError') {
          console.log('DEBUG: Request was aborted by user')
        }
      } finally {
        this.isStreaming = false
        this.abortController = null
        this.isStopRequested = false
      }
    },

    // 임시프론트와 동일한 스트리밍 로직
    async streamChatLikeTemp(content: any[]) {
      const token = localStorage.getItem('auth_token')
      
      if (!token) {
        throw new Error('로그인이 필요합니다.')
      }

      const requestBody = {
        content: content,
        session_id: this.currentSessionId
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody),
        signal: this.abortController?.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('스트리밍 응답을 읽을 수 없습니다.')
      }

      const decoder = new TextDecoder()
      let currentClaudeMessage: Message | null = null
      let currentThinkingElement: any = null
      let currentToolBlocks = new Map()
      
      console.log('DEBUG: Starting new stream, currentClaudeMessage reset to null')

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            console.log('DEBUG: Stream ended normally')
            break
          }
          
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                console.log('DEBUG: Stream event:', data.type)
                currentClaudeMessage = this.handleTempStyleStreamEvent(data, currentClaudeMessage, currentThinkingElement, currentToolBlocks)
              } catch (error) {
                console.log('DEBUG: JSON parse error:', error, 'line:', line)
                // JSON parse error - skip line
              }
            }
          }
        }
      } catch (error) {
        console.log('DEBUG: Stream reading error:', error)
        // AbortError인 경우 다시 throw하지 않음 (정상적인 중단)
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('DEBUG: Stream was aborted by user')
        } else {
          throw error
        }
      } finally {
        console.log('DEBUG: Stream reader released')
        reader.releaseLock()
        this.isStreaming = false
        console.log('DEBUG: isStreaming set to false')
      }
    },

    // 백엔드 구조에 맞는 스트림 이벤트 처리
    handleTempStyleStreamEvent(data: any, currentClaudeMessage: Message | null, currentThinkingElement: any, currentToolBlocks: Map<string, any>): Message | null {
      switch (data.type) {
        case 'thinking_start':
          console.log('DEBUG: thinking_start - currentClaudeMessage is null?', currentClaudeMessage === null)
          // 항상 새로운 assistant 메시지 생성 (이전 메시지 재사용 방지)
          if (!currentClaudeMessage) {
            currentClaudeMessage = {
              role: 'assistant',
              content: []
            }
            this.messages.push(currentClaudeMessage)
            console.log('DEBUG: New Claude message created for thinking, total messages:', this.messages.length)
          } else {
            console.log('DEBUG: ERROR - currentClaudeMessage should be null at start of new stream!')
            // 강제로 새 메시지 생성
            currentClaudeMessage = {
              role: 'assistant',
              content: []
            }
            this.messages.push(currentClaudeMessage)
            console.log('DEBUG: Forced new Claude message creation, total messages:', this.messages.length)
          }
          // thinking 블록 추가
          currentClaudeMessage.content.push({ type: 'thinking', thinking: '' })
          console.log('DEBUG: Thinking block added, content blocks:', currentClaudeMessage.content.length)
          break

        case 'thinking_delta':
          if (data.text && currentClaudeMessage) {
            // 현재 메시지의 가장 최근 thinking 블록 찾아서 업데이트
            for (let i = currentClaudeMessage.content.length - 1; i >= 0; i--) {
              if (currentClaudeMessage.content[i].type === 'thinking') {
                currentClaudeMessage.content[i].thinking += data.text
                break
              }
            }
            // Vue 반응성을 위한 스로틀링된 업데이트
            this.forceUpdate()
          }
          break

        case 'thinking_stop':
          // thinking 완료 - 추가 처리 불필요
          break

        case 'text_start':
          // 현재 assistant 메시지가 없으면 생성
          if (!currentClaudeMessage) {
            currentClaudeMessage = {
              role: 'assistant',
              content: []
            }
            this.messages.push(currentClaudeMessage)
            console.log('DEBUG: New Claude message created for text, total messages:', this.messages.length)
          } else {
            console.log('DEBUG: text_start - reusing existing message with', currentClaudeMessage.content.length, 'blocks')
          }
          // text 블록 추가
          currentClaudeMessage.content.push({ type: 'text', text: '' })
          console.log('DEBUG: Text block added, content blocks:', currentClaudeMessage.content.length)
          break

        case 'text_delta':
          if (data.text && currentClaudeMessage) {
            // 현재 메시지의 가장 최근 text 블록 찾아서 업데이트
            for (let i = currentClaudeMessage.content.length - 1; i >= 0; i--) {
              if (currentClaudeMessage.content[i].type === 'text') {
                currentClaudeMessage.content[i].text += data.text
                break
              }
            }
            // Vue 반응성을 위한 스로틀링된 업데이트
            this.forceUpdate()
          }
          break

        case 'tool_use_start':
          // 현재 assistant 메시지가 없으면 생성
          if (!currentClaudeMessage) {
            currentClaudeMessage = {
              role: 'assistant',
              content: []
            }
            this.messages.push(currentClaudeMessage)
          }
          // tool_use 블록 추가 - 백엔드에서 보낸 input 사용
          currentClaudeMessage.content.push({
            type: 'tool_use',
            id: data.id || '',
            name: data.name || '',
            input: data.input || {}  // 백엔드에서 보낸 input 사용
          })
          
          // tool 실행 중 상태를 나타내기 위해 임시 tool_result 생성 (실행 중 상태)
          const pendingToolResult: Message = {
            role: 'user',
            content: [{
              type: 'tool_result',
              tool_use_id: data.id || '',
              content: null,  // 아직 결과 없음
              is_pending: true  // 실행 중 플래그
            }]
          }
          this.messages.push(pendingToolResult)
          console.log('DEBUG: pending tool_result created for tool:', data.name)
          this.forceUpdate()  // 반응성 강제 업데이트
          break
        
        case 'tool_use_complete':
          // tool_use 완성 - input 정보 업데이트
          if (currentClaudeMessage && data.id) {
            for (let i = currentClaudeMessage.content.length - 1; i >= 0; i--) {
              if (currentClaudeMessage.content[i].type === 'tool_use' && currentClaudeMessage.content[i].id === data.id) {
                currentClaudeMessage.content[i].input = data.input
                break
              }
            }
          }
          break

        case 'tool_execution':
          console.log('DEBUG: tool_execution received:', data)
          // tool_execution은 백엔드에서 도구 실행 중임을 알리는 이벤트
          // 특별한 처리 없이 로그만 남김
          break

        case 'tool_result':
          console.log('DEBUG: tool_result received:', data)
          // 기존 pending tool_result 찾아서 업데이트
          let foundPending = false
          for (let i = this.messages.length - 1; i >= 0; i--) {
            const msg = this.messages[i]
            if (msg.role === 'user' && msg.content) {
              for (let j = 0; j < msg.content.length; j++) {
                const content = msg.content[j]
                if (content.type === 'tool_result' && 
                    content.tool_use_id === data.tool_use_id && 
                    content.is_pending) {
                  // pending 상태를 완료 상태로 업데이트
                  content.content = data.content
                  content.is_pending = false
                  foundPending = true
                  break
                }
              }
            }
            if (foundPending) break
          }
          
          // pending을 찾지 못했으면 새로 생성 (호환성)
          if (!foundPending) {
            const toolResultMessage: Message = {
              role: 'user',
              content: [{
                type: 'tool_result',
                tool_use_id: data.tool_use_id,
                content: data.content
              }]
            }
            this.messages.push(toolResultMessage)
          }
          console.log('DEBUG: tool_result updated/added, current isStreaming:', this.isStreaming)
          this.forceUpdate()  // 반응성 강제 업데이트
          break

        case 'session_id':
          if (data.session_id) {
            this.currentSessionId = data.session_id
          }
          break

        case 'session_created':
          if (data.session_id) {
            this.currentSessionId = data.session_id
            // 새 세션을 목록에 추가
            const newSession: ChatHistory = {
              session_id: data.session_id,
              title: data.title || '새 채팅',
              active: true,
              messages: [...this.messages],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
            this.sessions.unshift(newSession)
          }
          break

        case 'complete':
          console.log('DEBUG: Stream complete event received, total messages:', this.messages.length)
          if (currentClaudeMessage) {
            console.log('DEBUG: Final message content blocks:', currentClaudeMessage.content.length)
          }
          // 스트리밍 완료
          currentClaudeMessage = null
          break

        case 'error':
          console.log('DEBUG: Error event received:', data)
          // 에러가 발생해도 스트리밍을 계속 진행해야 함
          // 단순히 에러 로그만 출력하고 계속
          break

        default:
          console.log('DEBUG: Unknown event type:', data.type, data)
          break
      }
      return currentClaudeMessage
    },



    // 파일 추가
    addUploadedFile(file: UploadedFile) {
      this.uploadedFiles.push(file)
    },

    // 파일 제거
    removeUploadedFile(index: number) {
      this.uploadedFiles.splice(index, 1)
    },

    // 세션 제목 수정
    async updateSessionTitle(sessionId: string, title: string) {
      try {
        await sessionService.updateSessionTitle(sessionId, title)
        const sessionIndex = this.sessions.findIndex(s => s.session_id === sessionId)
        if (sessionIndex !== -1) {
          this.sessions[sessionIndex].title = title
        }
      } catch (error) {
        console.error('세션 제목 수정 실패:', error)
      }
    },

    // 세션 삭제
    async deleteSession(sessionId: string) {
      try {
        await sessionService.deleteSession(sessionId)
        this.sessions = this.sessions.filter(s => s.session_id !== sessionId)
        
        if (this.currentSessionId === sessionId) {
          this.startNewChat()
        }
      } catch (error) {
        console.error('세션 삭제 실패:', error)
      }
    },

    // 채팅 중단
    async stopMessage() {
      console.log('DEBUG: stopMessage called, isStreaming before:', this.isStreaming)
      
      // 중단 요청 상태 설정 (UI 변경)
      this.isStopRequested = true
      
      // 백엔드에 중단 요청 전송 (reason-act 루프 중단)
      if (this.currentSessionId) {
        try {
          const token = localStorage.getItem('auth_token')
          if (token) {
            await fetch(`/api/chat/stop/${this.currentSessionId}`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            })
            console.log('DEBUG: Stop request sent to backend - reason-act loop will stop after current tool_result')
          }
        } catch (error) {
          console.error('백엔드 중단 요청 실패:', error)
        }
      }
      
      // 프론트엔드는 스트림을 계속 받아서 tool_result까지 출력
      // 백엔드가 자연스럽게 스트림을 종료할 때까지 기다림
      console.log('DEBUG: Frontend continues to receive stream until backend naturally ends')
    },

    // 백엔드 연결 상태 확인
    async checkBackendConnection(): Promise<boolean> {
      return await chatStream.checkBackend()
    },

    // 로그아웃 시 모든 데이터 초기화
    clearAllData() {
      // 진행 중인 요청 중단
      if (this.abortController) {
        this.abortController.abort()
      }
      
      this.sessions = []
      this.currentSessionId = null
      this.messages = []
      this.isLoading = false
      this.isStreaming = false
      this.streamingMessage = null
      this.isThinking = false
      this.thinkingText = ''
      this.streamingText = ''
      this.isUsingTool = false
      this.currentToolExecution = null
      this.toolExecutions = []
      this.uploadedFiles = []
      this.abortController = null
      this.isStopRequested = false
    }
  }
})
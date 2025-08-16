import { defineStore } from 'pinia'
import { sessionService, type Session, type SessionWithMessages } from '@/services/session'
import { chatStream, type StreamUpdate } from '@/services/chatStream'
import { FileUploadService, type UploadedFile } from '@/services/fileUpload'

interface Message {
  id: number
  type: 'user' | 'assistant'
  content: any[] // Claude content blocks 형태
  timestamp: Date
  isError?: boolean
  isStreaming?: boolean
  isThinking?: boolean
  streamingText?: string
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
  isUsingTool: boolean
  currentToolExecution: ToolExecution | null
  toolExecutions: ToolExecution[]
  uploadedFiles: UploadedFile[]
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
    isUsingTool: false,
    currentToolExecution: null,
    toolExecutions: [],
    uploadedFiles: []
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
      // 현재 세션이 있으면 세션의 메시지, 없으면 state.messages (새 채팅)
      if (state.currentSessionId) {
        const currentSession = state.sessions.find(session => session.session_id === state.currentSessionId)
        return currentSession?.messages || []
      }
      return state.messages
    },

    canSendMessage: (state): boolean => {
      return !state.isLoading && !state.isStreaming
    },

    isProcessing: (state): boolean => {
      return state.isThinking || state.isUsingTool || state.isStreaming
    }
  },

  actions: {
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
          this.sessions[sessionIndex].messages = this.convertBackendMessages(sessionData.messages)
          this.messages = this.sessions[sessionIndex].messages
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
      
      // 모든 세션의 active 상태 초기화
      this.sessions.forEach(session => {
        session.active = false
      })
    },

    // 임시프론트와 동일한 메시지 전송 로직
    async sendMessage(text: string, files: UploadedFile[] = []) {
      console.log('[Chat Store] sendMessage 시작:', { text, files: files.length })
      if (!text.trim() && files.length === 0) return
      if (this.isStreaming || this.isLoading) return

      try {
        // 사용자 메시지를 화면에 먼저 표시
        const userMessage: Message = {
          id: Date.now(),
          type: 'user',
          content: FileUploadService.createContentBlocks(text, files),
          timestamp: new Date()
        }
        this.messages.push(userMessage)
        this.uploadedFiles = [] // 파일 목록 초기화

        // content 배열 생성 (임시프론트 방식)
        const content = [{ "type": "text", "text": text }]
        
        // 파일이 있으면 content에 추가
        if (files.length > 0) {
          for (const file of files) {
            if (file.contentBlock) {
              content.push(file.contentBlock)
            }
          }
        }

        // 임시프론트와 동일한 방식으로 스트리밍 요청
        console.log('[Chat Store] 스트리밍 요청 시작:', content)
        this.isStreaming = true
        await this.streamChatLikeTemp(content)

      } catch (error) {
        console.error('메시지 전송 실패:', error)
        
        // 에러 메시지 표시
        const errorMessage: Message = {
          id: Date.now() + 2,
          type: 'assistant',
          content: [{ type: 'text', text: '죄송합니다. 메시지 전송 중 오류가 발생했습니다.' }],
          timestamp: new Date(),
          isError: true
        }
        this.messages.push(errorMessage)
      } finally {
        this.isStreaming = false
        this.streamingMessage = null
        this.isThinking = false
        this.thinkingText = ''
        this.isUsingTool = false
        this.currentToolExecution = null
        this.toolExecutions = []
      }
    },

    // 임시프론트와 동일한 스트리밍 로직
    async streamChatLikeTemp(content: any[]) {
      const token = localStorage.getItem('auth_token')
      console.log('🔑 토큰 확인:', token ? '있음' : '없음')
      console.log('🔑 실제 토큰:', token)
      
      if (!token) {
        console.error('❌ 토큰이 없습니다!')
        throw new Error('로그인이 필요합니다.')
      }

      console.log('📤 메시지 전송 시작:', { content, session_id: this.currentSessionId })

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
      
      console.log('📤 요청 헤더:', headers)
      
      const requestBody = {
        content: content,
        session_id: this.currentSessionId
      }
      
      console.log('📤 요청 본문:', requestBody)

      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })

      console.log('📥 응답 상태:', response.status, response.statusText)

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

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                this.handleTempStyleStreamEvent(data, currentClaudeMessage, currentThinkingElement, currentToolBlocks)
              } catch (error) {
                console.error('JSON parse error:', error)
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    },

    // 임시프론트 스타일의 스트림 이벤트 처리
    handleTempStyleStreamEvent(data: any, currentClaudeMessage: Message | null, currentThinkingElement: any, currentToolBlocks: Map<string, any>) {
      switch (data.type) {
        case 'thinking_start':
          this.isThinking = true
          this.thinkingText = ''
          break

        case 'thinking_delta':
          if (data.text) {
            this.thinkingText += data.text
          }
          break

        case 'thinking_stop':
          this.isThinking = false
          break

        case 'text_start':
          // 새 Claude 메시지 시작
          currentClaudeMessage = {
            id: Date.now() + 1,
            type: 'assistant',
            content: [{ type: 'text', text: '' }],
            timestamp: new Date(),
            isStreaming: true
          }
          this.messages.push(currentClaudeMessage)
          this.streamingMessage = currentClaudeMessage
          break

        case 'text_delta':
          if (currentClaudeMessage && data.text) {
            if (Array.isArray(currentClaudeMessage.content) && currentClaudeMessage.content[0]) {
              currentClaudeMessage.content[0].text += data.text
            }
          }
          break

        case 'tool_use_start':
          this.isUsingTool = true
          if (data.name) {
            this.currentToolExecution = {
              name: data.name,
              input: data.input,
              isExecuting: true
            }
          }
          break

        case 'tool_execution':
          console.log(`🔧 도구 실행: ${data.name}`, data.input)
          break

        case 'tool_result':
          if (this.currentToolExecution) {
            this.currentToolExecution.result = data.result
            this.currentToolExecution.isExecuting = false
            this.toolExecutions.push({...this.currentToolExecution})
          }
          this.isUsingTool = false
          this.currentToolExecution = null
          console.log(`✅ 도구 결과: ${data.name}`, data.result)
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
          if (currentClaudeMessage) {
            currentClaudeMessage.isStreaming = false
          }
          this.streamingMessage = null
          break
      }
    },


    // 백엔드 메시지를 프론트엔드 형태로 변환
    convertBackendMessages(backendMessages: any[]): Message[] {
      return backendMessages.map((msg, index) => ({
        id: index,
        type: msg.role,
        content: Array.isArray(msg.content) ? msg.content : [{ type: 'text', text: msg.content }],
        timestamp: new Date()
      }))
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

    // 백엔드 연결 상태 확인
    async checkBackendConnection(): Promise<boolean> {
      return await chatStream.checkBackend()
    }
  }
})
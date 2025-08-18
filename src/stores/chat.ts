import { defineStore } from 'pinia'
import { sessionService, type Session, type SessionWithMessages } from '@/services/session'
import { chatStream, type StreamUpdate } from '@/services/chatStream'
import { FileUploadService, type UploadedFile } from '@/services/fileUpload'
import { useWorkflowStore } from './workflow'

interface Message {
  id: number
  type: 'user' | 'assistant'
  content: any[] // Claude content blocks 형태
  timestamp: Date
  isError?: boolean
  isStreaming?: boolean
  isThinking?: boolean
  isUsingTool?: boolean
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
  streamingText: string
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
    streamingText: '',
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
      // 항상 state.messages를 사용 (단일 소스)
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
          this.messages = [...this.sessions[sessionIndex].messages]
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
      
      if (!token) {
        throw new Error('로그인이 필요합니다.')
      }

      const requestBody = {
        content: content,
        session_id: this.currentSessionId
      }

      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
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
                currentClaudeMessage = this.handleTempStyleStreamEvent(data, currentClaudeMessage, currentThinkingElement, currentToolBlocks)
              } catch (error) {
                // JSON parse error - skip line
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    },

    // 임시프론트 스타일의 스트림 이벤트 처리
    handleTempStyleStreamEvent(data: any, currentClaudeMessage: Message | null, currentThinkingElement: any, currentToolBlocks: Map<string, any>): Message | null {
      switch (data.type) {
        case 'thinking_start':
          // 새 thinking 블록 생성
          const thinkingMessage: Message = {
            id: Date.now() + Math.random(),
            type: 'assistant',
            content: [{ type: 'text', text: '' }],
            timestamp: new Date(),
            isStreaming: false,
            isThinking: true
          }
          this.messages.push(thinkingMessage)
          this.isThinking = true
          this.thinkingText = ''
          break

        case 'thinking_delta':
          if (data.text) {
            this.thinkingText += data.text
            // 가장 최근 thinking 메시지 업데이트
            const lastThinkingMessage = [...this.messages].reverse().find(m => m.isThinking)
            if (lastThinkingMessage && Array.isArray(lastThinkingMessage.content)) {
              lastThinkingMessage.content[0].text = this.thinkingText
            }
          }
          break

        case 'thinking_stop':
          this.isThinking = false
          // thinking 메시지를 완료 상태로 표시
          const completedThinkingMessage = [...this.messages].reverse().find(m => m.isThinking)
          if (completedThinkingMessage) {
            completedThinkingMessage.isThinking = false
          }
          break

        case 'text_start':
          // 새 Claude 메시지 시작
          this.streamingText = ''  // 스트리밍 텍스트 초기화
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
            this.streamingText += data.text  // Pinia state 업데이트
            // 가장 최근 스트리밍 메시지 업데이트
            const lastStreamingMessage = [...this.messages].reverse().find(m => m.isStreaming)
            if (lastStreamingMessage && Array.isArray(lastStreamingMessage.content)) {
              lastStreamingMessage.content[0].text = this.streamingText
            }
          }
          break

        case 'tool_use_start':
          // 새 tool 블록 생성
          const toolMessage: Message = {
            id: Date.now() + Math.random(),
            type: 'assistant',
            content: [{ type: 'text', text: `🔧 도구 사용: ${data.name}` }],
            timestamp: new Date(),
            isStreaming: false,
            isUsingTool: true
          }
          this.messages.push(toolMessage)
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
          // 가장 최근 tool 메시지 업데이트
          const executingToolMessage = [...this.messages].reverse().find(m => m.isUsingTool)
          if (executingToolMessage && Array.isArray(executingToolMessage.content)) {
            executingToolMessage.content[0].text = `🔧 도구 실행 중: ${data.name}\n입력: ${JSON.stringify(data.input, null, 2)}`
          }
          break

        case 'tool_result':
          if (this.currentToolExecution) {
            this.currentToolExecution.result = data.result
            this.currentToolExecution.isExecuting = false
            this.toolExecutions.push({...this.currentToolExecution})
          }
          
          this.isUsingTool = false
          this.currentToolExecution = null
          
          // 가장 최근 tool 메시지 업데이트
          const completedToolMessage = [...this.messages].reverse().find(m => m.isUsingTool)
          if (completedToolMessage && Array.isArray(completedToolMessage.content)) {
            completedToolMessage.content[0].text = `✅ 도구 완료: ${data.name}\n결과: ${data.result ? data.result.substring(0, 200) + '...' : '완료됨'}`
            completedToolMessage.isUsingTool = false
          }
          
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
          this.streamingText = ''  // 스트리밍 텍스트 초기화
          break
      }
      return currentClaudeMessage
    },


    // 백엔드 메시지를 프론트엔드 형태로 변환 (thinking, tool 블록 분리)
    convertBackendMessages(backendMessages: any[]): Message[] {
      const messages: Message[] = []
      let messageId = 0

      for (const msg of backendMessages) {
        const content = Array.isArray(msg.content) ? msg.content : [{ type: 'text', text: msg.content }]
        
        if (msg.role === 'assistant') {
          // assistant 메시지에서 thinking, text 블록 분리
          const thinkingBlocks: any[] = []
          const textBlocks: any[] = []
          
          for (const block of content) {
            if (block.type === 'thinking') {
              thinkingBlocks.push(block)
            } else if (block.type === 'text') {
              textBlocks.push(block)
            }
          }
          
          // thinking 블록이 있으면 별도 메시지로 생성
          if (thinkingBlocks.length > 0) {
            const thinkingText = thinkingBlocks.map(block => block.thinking || block.text || '').join('')
            messages.push({
              id: messageId++,
              type: 'assistant',
              content: [{ type: 'text', text: thinkingText }],
              timestamp: new Date(),
              isThinking: false // 이미 완료된 상태
            })
          }
          
          // text 블록이 있으면 일반 응답 메시지로 생성
          if (textBlocks.length > 0) {
            messages.push({
              id: messageId++,
              type: 'assistant',
              content: textBlocks,
              timestamp: new Date()
            })
          }
          
        } else if (msg.role === 'user') {
          // user 메시지 처리
          const toolResults = content.filter((block: any) => block.type === 'tool_result')
          const nonToolContent = content.filter((block: any) => block.type !== 'tool_result')
          
          // 일반 사용자 메시지 (tool_result가 아닌 것들)
          if (nonToolContent.length > 0) {
            messages.push({
              id: messageId++,
              type: 'user',
              content: nonToolContent,
              timestamp: new Date()
            })
          }
          
          // tool_result 메시지들을 도구 완료 메시지로 변환
          for (const toolResult of toolResults) {
            const toolResultText = `🔧 도구 완료\n결과: ${toolResult.content ? (typeof toolResult.content === 'string' ? toolResult.content.substring(0, 200) + '...' : JSON.stringify(toolResult.content).substring(0, 200) + '...') : '완료됨'}`
            messages.push({
              id: messageId++,
              type: 'assistant',
              content: [{ type: 'text', text: toolResultText }],
              timestamp: new Date(),
              isUsingTool: false // 이미 완료된 상태
            })
          }
        }
      }

      return messages
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
      // 스트리밍 상태 즉시 종료
      this.isStreaming = false
      this.isThinking = false
      this.isUsingTool = false
      this.streamingMessage = null
      this.streamingText = ''
      this.currentToolExecution = null
      
      // 현재 스트리밍 중인 메시지가 있으면 완료 상태로 변경
      const streamingMsg = this.messages.find(m => m.isStreaming)
      if (streamingMsg) {
        streamingMsg.isStreaming = false
      }
      
      // 백엔드에 중단 요청 (필요시 구현)
      try {
        const token = localStorage.getItem('auth_token')
        if (token && this.currentSessionId) {
          await fetch(`http://localhost:8000/chat/stop/${this.currentSessionId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        }
      } catch (error) {
        // 백엔드 중단 요청 실패 (무시)
      }
    },

    // 백엔드 연결 상태 확인
    async checkBackendConnection(): Promise<boolean> {
      return await chatStream.checkBackend()
    },

    // 로그아웃 시 모든 데이터 초기화
    clearAllData() {
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
    }
  }
})
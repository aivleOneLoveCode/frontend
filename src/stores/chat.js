import { defineStore } from 'pinia'
import { chatService } from '@/services/chat'

export const useChatStore = defineStore('chat', {
  state: () => ({
    chatHistories: [],
    currentChatId: null,
    messages: [],
    isLoading: false,
    isStreaming: false,
    streamingMessage: null
  }),

  getters: {
    currentChat: (state) => {
      return state.chatHistories.find(chat => chat.id === state.currentChatId)
    },
    
    activeChatHistories: (state) => {
      return state.chatHistories.filter(chat => !chat.deleted)
    },

    currentMessages: (state) => {
      const currentChat = state.chatHistories.find(chat => chat.id === state.currentChatId)
      return currentChat?.messages || []
    }
  },

  actions: {
    async loadChatHistories() {
      try {
        this.isLoading = true
        const histories = await chatService.getChatHistory()
        this.chatHistories = histories
      } catch (error) {
        console.error('Failed to load chat histories:', error)
      } finally {
        this.isLoading = false
      }
    },

    async createNewChat(title = null) {
      try {
        const chatTitle = title || `새로운 채팅 ${new Date().toLocaleString('ko-KR')}`
        const newChat = await chatService.createChat(chatTitle)
        
        // 모든 채팅의 active 상태를 false로 변경
        this.chatHistories.forEach(chat => chat.active = false)
        
        // 새 채팅을 맨 위에 추가
        this.chatHistories.unshift({
          ...newChat,
          active: true,
          messages: []
        })
        
        this.currentChatId = newChat.id
        this.messages = []
        
        return newChat
      } catch (error) {
        console.error('Failed to create new chat:', error)
        throw error
      }
    },

    async selectChat(chatId) {
      // 모든 채팅의 active 상태 변경
      this.chatHistories.forEach(chat => {
        chat.active = chat.id === chatId
      })
      
      this.currentChatId = chatId
      
      // 해당 채팅의 메시지들을 현재 메시지로 설정
      const selectedChat = this.chatHistories.find(chat => chat.id === chatId)
      this.messages = selectedChat?.messages || []
    },

    async sendMessage(content, files = []) {
      if (!this.currentChatId) {
        // 현재 활성 채팅이 없으면 새로 생성
        const firstWords = content.slice(0, 30)
        await this.createNewChat(firstWords + (content.length > 30 ? '...' : ''))
      }

      try {
        // 사용자 메시지 추가
        const userMessage = {
          id: Date.now(),
          type: 'user',
          content,
          files: files.map(file => file.name),
          timestamp: new Date()
        }
        
        this.addMessage(userMessage)
        
        // 서버로 메시지 전송
        const response = await chatService.sendMessage(this.currentChatId, content, files)
        
        // AI 응답 메시지 추가
        const aiMessage = {
          id: response.id,
          type: 'assistant',
          content: response.content,
          timestamp: new Date(response.timestamp)
        }
        
        this.addMessage(aiMessage)
        
        return response
      } catch (error) {
        console.error('Failed to send message:', error)
        
        // 에러 메시지 추가
        const errorMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: '죄송합니다. 메시지 전송 중 오류가 발생했습니다. 다시 시도해 주세요.',
          timestamp: new Date(),
          isError: true
        }
        
        this.addMessage(errorMessage)
        throw error
      }
    },

    async streamMessage(content, files = []) {
      if (!this.currentChatId) {
        const firstWords = content.slice(0, 30)
        await this.createNewChat(firstWords + (content.length > 30 ? '...' : ''))
      }

      try {
        // 사용자 메시지 추가
        const userMessage = {
          id: Date.now(),
          type: 'user',
          content,
          files: files.map(file => file.name),
          timestamp: new Date()
        }
        
        this.addMessage(userMessage)
        
        // 스트리밍 메시지 초기화
        const streamingMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: '',
          timestamp: new Date(),
          isStreaming: true
        }
        
        this.addMessage(streamingMessage)
        this.isStreaming = true
        this.streamingMessage = streamingMessage
        
        // 스트리밍 시작
        const eventSource = chatService.streamMessage(this.currentChatId, content)
        
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data)
          
          if (data.type === 'content') {
            // 스트리밍 메시지 업데이트
            streamingMessage.content += data.content
          } else if (data.type === 'done') {
            // 스트리밍 완료
            streamingMessage.isStreaming = false
            this.isStreaming = false
            this.streamingMessage = null
            eventSource.close()
          }
        }
        
        eventSource.onerror = (error) => {
          console.error('Streaming error:', error)
          streamingMessage.content = '스트리밍 중 오류가 발생했습니다.'
          streamingMessage.isStreaming = false
          streamingMessage.isError = true
          this.isStreaming = false
          this.streamingMessage = null
          eventSource.close()
        }
        
      } catch (error) {
        console.error('Failed to start streaming:', error)
        this.isStreaming = false
        this.streamingMessage = null
        throw error
      }
    },

    addMessage(message) {
      // 현재 채팅의 메시지 배열에 추가
      const currentChat = this.chatHistories.find(chat => chat.id === this.currentChatId)
      if (currentChat) {
        currentChat.messages.push(message)
      }
      
      // 현재 메시지 배열에도 추가
      this.messages.push(message)
    },

    async deleteChat(chatId) {
      try {
        await chatService.deleteChat(chatId)
        
        // 로컬에서 채팅 제거
        const chatIndex = this.chatHistories.findIndex(chat => chat.id === chatId)
        if (chatIndex !== -1) {
          this.chatHistories.splice(chatIndex, 1)
        }
        
        // 현재 채팅이 삭제된 경우 초기화
        if (this.currentChatId === chatId) {
          this.currentChatId = null
          this.messages = []
        }
        
      } catch (error) {
        console.error('Failed to delete chat:', error)
        throw error
      }
    },

    async updateChatTitle(chatId, newTitle) {
      try {
        await chatService.updateChatTitle(chatId, newTitle)
        
        // 로컬에서 제목 업데이트
        const chat = this.chatHistories.find(chat => chat.id === chatId)
        if (chat) {
          chat.title = newTitle
        }
        
      } catch (error) {
        console.error('Failed to update chat title:', error)
        throw error
      }
    },

    clearCurrentChat() {
      this.currentChatId = null
      this.messages = []
      this.chatHistories.forEach(chat => chat.active = false)
    }
  }
})
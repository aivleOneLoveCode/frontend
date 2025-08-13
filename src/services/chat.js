import api from './api.js'

export const chatService = {
  // 채팅 기록 가져오기
  async getChatHistory() {
    const response = await api.get('/chats')
    return response.data
  },

  // 특정 채팅 조회
  async getChat(chatId) {
    const response = await api.get(`/chats/${chatId}`)
    return response.data
  },

  // 새 채팅 생성
  async createChat(title = null) {
    const response = await api.post('/chats', { 
      title: title || `새로운 채팅 ${new Date().toLocaleString('ko-KR')}` 
    })
    return response.data
  },

  // 채팅 제목 수정
  async updateChatTitle(chatId, title) {
    const response = await api.patch(`/chats/${chatId}`, { title })
    return response.data
  },

  // 채팅 삭제
  async deleteChat(chatId) {
    const response = await api.delete(`/chats/${chatId}`)
    return response.data
  },

  // 메시지 전송
  async sendMessage(chatId, content, files = []) {
    const formData = new FormData()
    formData.append('content', content)
    formData.append('chatId', chatId)
    
    // 파일 첨부
    files.forEach(file => {
      formData.append('files', file)
    })

    const response = await api.post('/messages', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data'
      }
    })
    
    return response.data
  },

  // 스트리밍 메시지 (Server-Sent Events)
  streamMessage(chatId, content, files = []) {
    const token = localStorage.getItem('auth_token')
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
    
    // URL 파라미터 구성
    const params = new URLSearchParams({
      chatId,
      content
    })

    const eventSource = new EventSource(
      `${baseUrl}/messages/stream?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    return eventSource
  },

  // WebSocket을 사용한 실시간 채팅 (선택사항)
  connectWebSocket(chatId, onMessage, onError) {
    const token = localStorage.getItem('auth_token')
    const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/ws'
    
    const ws = new WebSocket(`${wsBaseUrl}/chat/${chatId}?token=${token}`)
    
    ws.onopen = () => {
      console.log('WebSocket connected')
    }
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      onMessage(data)
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      if (onError) onError(error)
    }
    
    ws.onclose = () => {
      console.log('WebSocket disconnected')
    }
    
    return ws
  },

  // 메시지 좋아요/싫어요
  async rateMessage(messageId, rating) {
    const response = await api.post(`/messages/${messageId}/rate`, { rating })
    return response.data
  },

  // 메시지 수정 (사용자 메시지만)
  async editMessage(messageId, newContent) {
    const response = await api.patch(`/messages/${messageId}`, { content: newContent })
    return response.data
  },

  // 메시지 삭제
  async deleteMessage(messageId) {
    const response = await api.delete(`/messages/${messageId}`)
    return response.data
  },

  // 채팅 검색
  async searchChats(query) {
    const response = await api.get('/chats/search', {
      params: { q: query }
    })
    return response.data
  },

  // 메시지 검색
  async searchMessages(query, chatId = null) {
    const params = { q: query }
    if (chatId) params.chatId = chatId

    const response = await api.get('/messages/search', { params })
    return response.data
  },

  // 채팅 내보내기
  async exportChat(chatId, format = 'json') {
    const response = await api.get(`/chats/${chatId}/export`, {
      params: { format },
      responseType: format === 'pdf' ? 'blob' : 'json'
    })
    
    if (format === 'pdf') {
      // PDF 파일 다운로드
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `chat_${chatId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    }
    
    return response.data
  },

  // 채팅 통계
  async getChatStats() {
    const response = await api.get('/chats/stats')
    return response.data
  }
}
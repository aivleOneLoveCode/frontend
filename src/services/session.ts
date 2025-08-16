import api from './api'

export interface SessionInfo {
  session_id: string
  title: string
  created_at: string
  updated_at: string
  messages: any[]
}

export const sessionService = {
  // 모든 세션 가져오기
  async getAllSessions() {
    const response = await api.get('/sessions')
    return response.data
  },

  // 특정 세션 정보 및 메시지 가져오기
  async getSessionInfo(sessionId: string) {
    const response = await api.get(`/sessions/${sessionId}`)
    return response.data as SessionInfo
  },

  // 세션 제목 변경
  async updateSession(sessionId: string, title: string) {
    const response = await api.put(`/sessions/${sessionId}?title=${encodeURIComponent(title)}`)
    return response.data
  },

  // 세션 삭제
  async deleteSession(sessionId: string) {
    const response = await api.delete(`/sessions/${sessionId}`)
    return response.data
  }
}
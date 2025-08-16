import api from './api'

export interface Session {
  session_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface SessionWithMessages extends Session {
  messages: any[]
}

export const sessionService = {
  // 세션 목록 조회
  async getSessions(): Promise<Session[]> {
    const response = await api.get('/sessions')
    return response.data.sessions
  },

  // 특정 세션 조회 (메시지 포함)
  async getSession(sessionId: string): Promise<SessionWithMessages> {
    const response = await api.get(`/sessions/${sessionId}`)
    return response.data
  },

  // 세션 제목 수정
  async updateSessionTitle(sessionId: string, title: string): Promise<void> {
    await api.put(`/sessions/${sessionId}`, null, {
      params: { title }
    })
  },

  // 세션 삭제
  async deleteSession(sessionId: string): Promise<void> {
    await api.delete(`/sessions/${sessionId}`)
  }
}
// DA-ZZANY 실시간 채팅 스트림 서비스 (고도화된 백엔드 연동)
export interface StreamUpdate {
  type: 'thinking_start' | 'thinking_delta' | 'thinking_stop' | 'text_start' | 'text_delta' | 'complete' | 'error' | 'session_created' | 'session_id' | 'tool_execution' | 'tool_result' | 'tool_error' | 'tool_use_start' | 'cancelled'
  text?: string
  message?: string
  session_id?: string
  title?: string
  name?: string
  input?: any
  result?: string
  error?: string
}

export class DAZZANYChatStream {
  private backendUrl: string
  private sessionId: string
  private isConnected: boolean
  private isProcessing: boolean

  constructor() {
    this.backendUrl = 'http://localhost:8000'
    this.sessionId = 'web-' + Date.now()
    this.isConnected = false
    this.isProcessing = false
  }

  async checkBackend(): Promise<boolean> {
    try {
      // JWT 토큰 확인
      const token = localStorage.getItem('auth_token')
      if (!token) {
        console.warn('⚠️ 인증 토큰이 없습니다 - 로그인이 필요합니다')
        this.isConnected = false
        return false
      }

      // /sessions 엔드포인트로 연결 체크 (토큰 검증도 함께)
      const response = await fetch(`${this.backendUrl}/sessions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.status === 200) {
        this.isConnected = true
        return true
      } else if (response.status === 401) {
        console.warn('⚠️ 인증 실패 - 토큰이 유효하지 않습니다')
        this.isConnected = false
        return false
      } else {
        this.isConnected = false
        console.warn('⚠️ 백엔드 연결 실패:', response.status)
        return false
      }
    } catch (error) {
      this.isConnected = false
      console.error('❌ 백엔드 연결 오류:', error)
      return false
    }
  }

  async sendMessage(content: any[], sessionId?: string, onUpdate?: (data: StreamUpdate) => void): Promise<void> {
    if (this.isProcessing) {
      console.warn('⚠️ 이미 처리 중인 메시지가 있습니다.')
      return
    }

    this.isProcessing = true

    try {
      await this.streamChat(content, sessionId, onUpdate || (() => {}))
    } catch (error) {
      console.error('채팅 오류:', error)
      if (onUpdate) {
        onUpdate({ type: 'error', message: '오류가 발생했습니다: ' + (error as Error).message })
      }
    } finally {
      this.isProcessing = false
    }
  }

  // P-test 방식의 authenticated fetch 메서드 추가
  private async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.')
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }

    return fetch(url, {
      ...options,
      headers
    })
  }

  private async streamChat(content: any[], sessionId?: string, onUpdate?: (data: StreamUpdate) => void): Promise<void> {
    // P-test 방식으로 authenticatedFetch 사용
    const response = await this.authenticatedFetch(`${this.backendUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: content,
        session_id: sessionId
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('스트리밍 응답을 읽을 수 없습니다.')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          if (onUpdate) {
            onUpdate({ type: 'complete' })
          }
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6))
              if (onUpdate) {
                onUpdate(data)
              }
            } catch (error) {
              console.error('JSON 파싱 오류:', error, 'Line:', line)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected
  }

  isCurrentlyProcessing(): boolean {
    return this.isProcessing
  }
}

// 싱글톤 인스턴스
export const chatStream = new DAZZANYChatStream()
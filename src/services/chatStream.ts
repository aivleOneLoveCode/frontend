// DA-ZZANY 실시간 채팅 스트림 서비스 (HTML과 동일)
export interface StreamUpdate {
  type: 'thinking_start' | 'thinking_delta' | 'thinking_stop' | 'text_start' | 'text_delta' | 'complete' | 'error'
  text?: string
  message?: string
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
    
    console.log('DA-ZZANY 채팅 스트림 초기화됨')
  }

  async checkBackend(): Promise<boolean> {
    try {
      const response = await fetch(`${this.backendUrl}/health`)
      if (response.ok) {
        const data = await response.json()
        this.isConnected = true
        console.log('✅ 백엔드 연결 성공:', data)
        return true
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

  async sendMessage(message: string, onUpdate: (data: StreamUpdate) => void): Promise<void> {
    if (this.isProcessing) {
      console.warn('⚠️ 이미 처리 중인 메시지가 있습니다.')
      return
    }

    this.isProcessing = true

    try {
      await this.streamChat(message, onUpdate)
    } catch (error) {
      console.error('채팅 오류:', error)
      onUpdate({ type: 'error', message: '오류가 발생했습니다: ' + (error as Error).message })
    } finally {
      this.isProcessing = false
    }
  }

  private async streamChat(message: string, onUpdate: (data: StreamUpdate) => void): Promise<void> {
    const response = await fetch(`${this.backendUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        session_id: this.sessionId
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
          console.log('✅ 스트리밍 완료')
          onUpdate({ type: 'complete' })
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6))
              onUpdate(data)
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
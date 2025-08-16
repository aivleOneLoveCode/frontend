import axios, { InternalAxiosRequestConfig } from 'axios'

interface RefreshTokenResponse {
  access_token: string
}

declare global {
  interface ImportMeta {
    env: {
      VITE_API_BASE_URL?: string
      VITE_WS_BASE_URL?: string
      DEV?: boolean
    }
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000, // 긴 스트리밍 요청을 위해 타임아웃 증가
  headers: {
    'Content-Type': 'application/json'
  }
})

// 요청 인터셉터 (토큰 자동 추가)
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 개발 환경에서 로그 출력
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`)
    }
    
    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

// 응답 인터셉터 (에러 처리)
api.interceptors.response.use(
  (response) => {
    // 개발 환경에서 로그 출력
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status)
    }
    
    return response
  },
  async (error: any) => {
    const originalRequest = error.config

    // 개발 환경에서 에러 로그 출력
    if (import.meta.env.DEV) {
      console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.status)
    }

    // 401 Unauthorized - 토큰 만료 또는 유효하지 않음
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // 토큰 갱신 시도
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const response = await api.post<RefreshTokenResponse>('/auth/refresh', { refresh_token: refreshToken })
          const { access_token } = response.data
          
          localStorage.setItem('auth_token', access_token)
          
          // 원래 요청을 새 토큰으로 재시도
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
      }

      // 토큰 갱신 실패 시 로그아웃 처리
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      
      // 로그인 페이지로 리다이렉트 (라우터 사용)
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }

    // 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data)
    }

    // 404 Not Found
    if (error.response?.status === 404) {
      console.error('Resource not found:', error.response.data)
    }

    // 500 Internal Server Error
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data)
    }

    return Promise.reject(error)
  }
)

export default api
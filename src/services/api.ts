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

// 디버그: 실제 baseURL 확인
console.log('[API] Base URL:', api.defaults.baseURL)

// 전역 토큰 관리 함수 (store에서 설정)
let getAuthToken: (() => string | null) | null = null

export const setTokenProvider = (provider: () => string | null) => {
  getAuthToken = provider
}

// 요청 인터셉터 (토큰 자동 추가)
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // store에서 제공하는 토큰 getter 사용
    const token = getAuthToken ? getAuthToken() : null
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 디버그: 토큰 확인
    if (import.meta.env.DEV) {
      console.log('[API] Token:', token ? `${token.substring(0, 20)}...` : 'None')
    }
    
    // 개발 환경에서 로그 출력
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
      console.log(`[API Request Data]`, config.data)
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
      console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.baseURL}${error.config?.url}`, error.response?.status)
      console.error(`[API Error Response]`, error.response?.data)
    }

    // 401 Unauthorized - 토큰 만료 또는 유효하지 않음
    if (error.response?.status === 401) {
      // 로그인 페이지로 리다이렉트 (store에서 logout 처리됨)
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
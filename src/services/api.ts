import axios, { InternalAxiosRequestConfig } from 'axios'

interface RefreshTokenResponse {
  access_token: string
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000, // 긴 스트리밍 요청을 위해 타임아웃 증가
  headers: {
    'Content-Type': 'application/json'
  }
})


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
    return response
  },
  async (error: any) => {
    // 401 Unauthorized - 토큰 만료 또는 유효하지 않음
    if (error.response?.status === 401) {
      // 토큰이 있었는데 401이면 토큰이 만료된 것
      const token = getAuthToken ? getAuthToken() : null
      if (token && typeof window !== 'undefined') {
        // 인증 상태 초기화 후 로그인 페이지로 이동
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
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
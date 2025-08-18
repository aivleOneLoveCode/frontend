import { defineStore } from 'pinia'
import { authService } from '@/services/auth'
import { setTokenProvider } from '@/services/api'

interface User {
  user_id: string
  email: string
  first_name: string
  last_name: string
  loginTime?: string
  avatar?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string
  successMessage: string
}

interface UserData {
  first_name: string
  last_name: string
  email: string
  password: string
  confirmPassword?: string
}

interface LoginResult {
  success: boolean
  user?: User
  message?: string
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: '',
    successMessage: ''
  }),

  getters: {
    isLoggedIn: (state): boolean => !!state.token && !!state.user,
    currentUser: (state): User | null => state.user,
    userAvatar: (state): string => state.user?.avatar || state.user?.first_name?.charAt(0) || 'U',
    fullName: (state): string => state.user ? `${state.user.first_name} ${state.user.last_name}` : ''
  },

  actions: {
    // 스토어 초기화 시 API 서비스에 토큰 제공자 설정
    initTokenProvider() {
      setTokenProvider(() => this.token)
    },

    clearMessages() {
      this.error = ''
      this.successMessage = ''
    },

    async login(email: string, password: string): Promise<LoginResult> {
      try {
        this.isLoading = true
        this.clearMessages()

        const { token, user } = await authService.login({ email, password })
        
        this.user = {
          ...user,
          loginTime: new Date().toISOString()
        }
        this.token = token
        this.isAuthenticated = true
        
        // 토큰 제공자 설정 (중요!)
        this.initTokenProvider()
        
        // localStorage에 토큰과 사용자 정보 저장
        localStorage.setItem('auth_token', this.token!)
        localStorage.setItem('user', JSON.stringify(this.user))
        
        return { success: true, user: this.user as User }
      } catch (error: any) {
        console.error('Login failed:', error)
        this.error = error.response?.data?.detail || '로그인 중 오류가 발생했습니다.'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async register(userData: UserData): Promise<LoginResult> {
      try {
        this.isLoading = true
        this.clearMessages()

        // 입력값 검증
        if (!userData.first_name || !userData.last_name || !userData.email || !userData.password || !userData.confirmPassword) {
          this.error = '모든 필드를 입력해주세요.'
          throw new Error(this.error)
        }

        if (userData.password !== userData.confirmPassword) {
          this.error = '비밀번호가 일치하지 않습니다.'
          throw new Error(this.error)
        }

        if (userData.password.length < 8) {
          this.error = '비밀번호는 8자 이상이어야 합니다.'
          throw new Error(this.error)
        }

        const result = await authService.register(userData)
        
        this.successMessage = '회원가입이 완료되었습니다! 로그인해주세요.'
        return { success: true, message: this.successMessage }
      } catch (error: any) {
        console.error('Registration failed:', error)
        this.error = error.response?.data?.detail || '회원가입 중 오류가 발생했습니다.'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async forgotPassword(email: string): Promise<LoginResult> {
      try {
        this.isLoading = true
        this.clearMessages()

        if (!email) {
          this.error = '이메일을 입력해주세요.'
          throw new Error(this.error)
        }

        // 실제 API 호출 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        this.successMessage = '비밀번호 재설정 이메일을 발송했습니다. 이메일을 확인해주세요.'
        return { success: true, message: this.successMessage }
      } catch (error) {
        console.error('Forgot password failed:', error)
        if (!this.error) {
          this.error = '이메일 발송 중 오류가 발생했습니다.'
        }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async socialLogin(provider: string, code: string): Promise<LoginResult> {
      try {
        this.isLoading = true
        const { token, user } = await authService.socialLogin(provider, { code })
        
        this.token = token
        this.user = user
        this.isAuthenticated = true
        
        localStorage.setItem('auth_token', token)
        return { success: true, user }
      } catch (error) {
        console.error('Social login failed:', error)
        return { 
          success: false, 
          message: (error as any).response?.data?.message || '소셜 로그인에 실패했습니다.' 
        }
      } finally {
        this.isLoading = false
      }
    },

    async logout(): Promise<void> {
      // JWT는 stateless이므로 클라이언트에서만 토큰 삭제
      this.token = null
      this.user = null
      this.isAuthenticated = false
      
      // localStorage 완전 정리
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      localStorage.removeItem('current_user')
      localStorage.removeItem('chatHistories')
      localStorage.removeItem('customWorkflows')
      localStorage.removeItem('workflowFolders')
      localStorage.removeItem('folders')
      
      this.clearMessages()
      
      // 채팅 스토어 초기화는 각 컴포넌트에서 개별 처리하거나 router에서 전역 처리
    },

    async checkAuthStatus(): Promise<void> {
      // localStorage에서 토큰 복구 (새로고침 시 로그인 상태 유지)
      const token = localStorage.getItem('auth_token')
      const userStr = localStorage.getItem('user')
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr)
          this.token = token
          this.user = user
          this.isAuthenticated = true
          this.initTokenProvider()
        } catch (error) {
          console.error('Failed to restore auth status:', error)
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
        }
      }
    },

    // 소셜 로그인은 나중에 백엔드 연동 시 구현
    async socialLoginRedirect(provider: string): Promise<void> {
      alert(`${provider} 로그인 기능은 백엔드 연동 후 구현됩니다.`)
    }
  }
})
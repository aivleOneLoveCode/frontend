import { defineStore } from 'pinia'
import { authService } from '@/services/auth'
import { storage } from '@/utils/helpers'

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
    token: storage.get('auth_token'),
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
    clearMessages() {
      this.error = ''
      this.successMessage = ''
    },

    async login(email: string, password: string): Promise<LoginResult> {
      try {
        this.isLoading = true
        this.clearMessages()

        console.log('[Auth Store] 로그인 시도:', { email })
        const { token, user } = await authService.login({ email, password })
        console.log('[Auth Store] 로그인 성공:', { user })
        
        this.user = {
          ...user,
          loginTime: new Date().toISOString()
        }
        this.token = token
        this.isAuthenticated = true
        
        storage.set('auth_token', this.token)
        storage.set('current_user', this.user)
        
        return { success: true, user: this.user }
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
      try {
        // 실제 API 호출은 나중에 백엔드 연동 시 추가
        // if (this.token) {
        //   await authService.logout()
        // }
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.token = null
        this.user = null
        this.isAuthenticated = false
        storage.remove('auth_token')
        storage.remove('current_user')
        this.clearMessages()
      }
    },

    async checkAuthStatus(): Promise<void> {
      const token = storage.get('auth_token')
      const user = storage.get('current_user')
      
      if (!token || !user) {
        this.isAuthenticated = false
        return
      }

      try {
        this.token = token
        this.user = user
        this.isAuthenticated = true
      } catch (error) {
        console.error('Auth check failed:', error)
        // 토큰이 유효하지 않으면 로그아웃 처리
        this.logout()
      }
    },

    // 소셜 로그인은 나중에 백엔드 연동 시 구현
    async socialLoginRedirect(provider: string): Promise<void> {
      console.log(`${provider} 로그인 요청`)
      alert(`${provider} 로그인 기능은 백엔드 연동 후 구현됩니다.`)
    }
  }
})
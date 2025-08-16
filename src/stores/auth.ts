import { defineStore } from 'pinia'
import { authService } from '@/services/auth'
import { setTokenProvider } from '@/services/api'

interface User {
  email: string
  name: string
  loginTime?: string
  avatar?: string
}

interface RegisteredUser {
  email: string
  name: string
  password: string
  registeredAt: string
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
  firstName: string
  lastName: string
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
    userAvatar: (state): string => state.user?.avatar || state.user?.name?.charAt(0) || 'U'
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

        // 백엔드 API 호출
        const response = await authService.login({ email, password })
        
        // 로그인 성공 - 사용자 정보 저장
        const userData = {
          email: response.user.email,
          name: response.user.name,
          loginTime: new Date().toISOString()
        }
        
        this.user = userData
        this.token = response.token
        this.isAuthenticated = true
        
        // localStorage에 토큰 저장 (표준 방식)
        localStorage.setItem('auth_token', response.token)
        localStorage.setItem('user', JSON.stringify(userData))
        
        // 토큰 제공자 즉시 업데이트
        this.initTokenProvider()
        
        console.log('[Auth] Login success - token set:', this.token ? 'YES' : 'NO')
        
        console.log('로그인 성공:', userData)
        return { success: true, user: userData }
      } catch (error) {
        console.error('Login failed:', error)
        this.error = (error as Error).message || '로그인 중 오류가 발생했습니다.'
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
        if (!userData.firstName || !userData.lastName || !userData.email || !userData.password || !userData.confirmPassword) {
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

        // 백엔드 API 호출
        const response = await authService.register({
          first_name: userData.firstName.trim(),
          last_name: userData.lastName.trim(),
          email: userData.email,
          password: userData.password
        })
        
        // 회원가입 성공 시 자동 로그인 처리
        const user = {
          email: response.user.email,
          name: `${response.user.first_name} ${response.user.last_name}`.trim(),
          loginTime: new Date().toISOString()
        }
        
        this.user = user
        this.token = response.token
        this.isAuthenticated = true
        
        // localStorage에 토큰 저장 (표준 방식)
        localStorage.setItem('auth_token', response.token)
        localStorage.setItem('user', JSON.stringify(user))
        
        // 토큰 제공자 즉시 업데이트
        this.initTokenProvider()
        
        this.successMessage = '회원가입이 완료되었습니다!'
        console.log('회원가입 및 자동 로그인 완료:', user)
        return { success: true, user, message: this.successMessage }
      } catch (error) {
        console.error('Registration failed:', error)
        this.error = (error as Error).message || '회원가입 중 오류가 발생했습니다.'
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
      
      // localStorage에서 토큰 제거 (표준 로그아웃 방식)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      
      this.clearMessages()
      console.log('[Auth] Logout completed - token cleared from localStorage')
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
          console.log('[Auth] Login status restored from localStorage')
        } catch (error) {
          console.error('Failed to restore auth status:', error)
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
        }
      }
    },

    // 소셜 로그인은 나중에 백엔드 연동 시 구현
    async socialLoginRedirect(provider: string): Promise<void> {
      console.log(`${provider} 로그인 요청`)
      alert(`${provider} 로그인 기능은 백엔드 연동 후 구현됩니다.`)
    }
  }
})
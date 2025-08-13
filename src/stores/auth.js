import { defineStore } from 'pinia'
import { authService } from '@/services/auth'
import { storage } from '@/utils/helpers'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: storage.get('auth_token'),
    isAuthenticated: false,
    isLoading: false,
    error: '',
    successMessage: ''
  }),

  getters: {
    isLoggedIn: (state) => !!state.token && !!state.user,
    currentUser: (state) => state.user,
    userAvatar: (state) => state.user?.avatar || state.user?.name?.charAt(0) || 'U'
  },

  actions: {
    clearMessages() {
      this.error = ''
      this.successMessage = ''
    },

    async login(email, password) {
      try {
        this.isLoading = true
        this.clearMessages()

        // 로컬스토리지에서 등록된 사용자들 가져오기
        const users = storage.get('registered_users', [])
        
        // 기본 테스트 계정도 포함
        const testUser = { email: 'test@test.com', password: 'password', name: '테스트 사용자' }
        const allUsers = [testUser, ...users]
        
        // 사용자 인증 확인
        const authenticatedUser = allUsers.find(user => 
          user.email === email && user.password === password
        )
        
        if (authenticatedUser) {
          // 로그인 성공 - 사용자 정보 저장
          const userData = {
            email: authenticatedUser.email,
            name: authenticatedUser.name,
            loginTime: new Date().toISOString()
          }
          
          this.user = userData
          this.token = 'mock-jwt-token-' + Date.now()
          this.isAuthenticated = true
          
          storage.set('auth_token', this.token)
          storage.set('current_user', userData)
          
          return { success: true, user: userData }
        } else {
          this.error = '이메일 또는 비밀번호가 올바르지 않습니다.'
          throw new Error(this.error)
        }
      } catch (error) {
        console.error('Login failed:', error)
        if (!this.error) {
          this.error = '로그인 중 오류가 발생했습니다.'
        }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async register(userData) {
      try {
        this.isLoading = true
        this.clearMessages()

        // 입력값 검증
        if (!userData.name || !userData.email || !userData.password || !userData.confirmPassword) {
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

        // 기존 사용자들 가져오기
        const users = storage.get('registered_users', [])
        
        // 중복 이메일 체크
        const existingUser = users.find(user => user.email === userData.email)
        if (existingUser) {
          this.error = '이미 등록된 이메일입니다.'
          throw new Error(this.error)
        }
        
        // 새 사용자 추가
        const newUser = {
          name: userData.name,
          email: userData.email,
          password: userData.password,
          registeredAt: new Date().toISOString()
        }
        
        users.push(newUser)
        storage.set('registered_users', users)
        
        this.successMessage = '회원가입이 완료되었습니다! 로그인해주세요.'
        return { success: true, message: this.successMessage }
      } catch (error) {
        console.error('Registration failed:', error)
        if (!this.error) {
          this.error = '회원가입 중 오류가 발생했습니다.'
        }
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async forgotPassword(email) {
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

    async socialLogin(provider, code) {
      try {
        this.loading = true
        const { token, user } = await authService.socialLogin(provider, code)
        
        this.token = token
        this.user = user
        this.isAuthenticated = true
        
        localStorage.setItem('auth_token', token)
        return { success: true, user }
      } catch (error) {
        console.error('Social login failed:', error)
        return { 
          success: false, 
          message: error.response?.data?.message || '소셜 로그인에 실패했습니다.' 
        }
      } finally {
        this.loading = false
      }
    },

    async logout() {
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

    async checkAuthStatus() {
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
    async socialLogin(provider) {
      console.log(`${provider} 로그인 요청`)
      alert(`${provider} 로그인 기능은 백엔드 연동 후 구현됩니다.`)
    }
  }
})
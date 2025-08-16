import api from './api'

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  first_name: string
  last_name: string
  email: string
  password: string
  confirmPassword?: string
}

// This interface may be used in future implementations
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface AuthResponse {
  access_token: string
  refresh_token?: string
  user: any
}

interface SocialAuthData {
  code?: string
  [key: string]: any
}

interface ProfileData {
  name?: string
  email?: string
  avatar?: string
  [key: string]: any
}

export const authService = {
  // 로그인
  async login(credentials: LoginCredentials) {
    console.log('[Auth Service] API 요청:', credentials)
    const response = await api.post('/login', credentials)
    console.log('[Auth Service] API 응답:', response.data)
    const { access_token, user } = response.data
    
    // 토큰 저장
    localStorage.setItem('auth_token', access_token)
    
    return { token: access_token, user }
  },

  // 회원가입
  async register(userData: RegisterData) {
    const response = await api.post('/register', {
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      password: userData.password
    })
    return response.data
  },

  // 비밀번호 재설정 요청
  async forgotPassword(email: string) {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  // 비밀번호 재설정 확인
  async resetPassword(token: string, newPassword: string) {
    const response = await api.post('/auth/reset-password', {
      token,
      password: newPassword
    })
    return response.data
  },

  // 소셜 로그인
  async socialLogin(provider: string, authData: SocialAuthData) {
    const response = await api.post(`/auth/social/${provider}`, authData)
    const { access_token, refresh_token, user } = response.data
    
    // 토큰 저장
    localStorage.setItem('auth_token', access_token)
    if (refresh_token) {
      localStorage.setItem('refresh_token', refresh_token)
    }
    
    return { token: access_token, user }
  },

  // 구글 소셜 로그인
  async googleLogin(code: string) {
    return this.socialLogin('google', { code })
  },

  // GitHub 소셜 로그인
  async githubLogin(code: string) {
    return this.socialLogin('github', { code })
  },

  // Microsoft 소셜 로그인
  async microsoftLogin(code: string) {
    return this.socialLogin('microsoft', { code })
  },

  // 로그아웃
  async logout() {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      // 토큰 제거는 항상 실행
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
    }
  },

  // 현재 사용자 정보 가져오기
  async getCurrentUser() {
    const response = await api.get('/auth/me')
    return response.data
  },

  // 토큰 갱신
  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await api.post('/auth/refresh', {
      refresh_token: refreshToken
    })
    
    const { access_token } = response.data
    return { token: access_token }
  },

  // 사용자 프로필 업데이트
  async updateProfile(profileData: ProfileData) {
    const response = await api.patch('/auth/profile', profileData)
    return response.data
  },

  // 비밀번호 변경
  async changePassword(currentPassword: string, newPassword: string) {
    const response = await api.patch('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword
    })
    return response.data
  },

  // 이메일 인증 요청
  async requestEmailVerification() {
    const response = await api.post('/auth/verify-email/request')
    return response.data
  },

  // 이메일 인증 확인
  async verifyEmail(token: string) {
    const response = await api.post('/auth/verify-email/confirm', { token })
    return response.data
  },

  // 계정 삭제
  async deleteAccount(password: string) {
    const response = await api.delete('/auth/account', {
      data: { password }
    })
    return response.data
  }
}
import api from './api.js'

export const authService = {
  // 로그인
  async login(credentials) {
    const response = await api.post('/auth/login', credentials)
    const { access_token, refresh_token, user } = response.data
    
    // 토큰 저장
    localStorage.setItem('auth_token', access_token)
    if (refresh_token) {
      localStorage.setItem('refresh_token', refresh_token)
    }
    
    return { token: access_token, user }
  },

  // 회원가입
  async register(userData) {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  // 비밀번호 재설정 요청
  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  // 비밀번호 재설정 확인
  async resetPassword(token, newPassword) {
    const response = await api.post('/auth/reset-password', {
      token,
      password: newPassword
    })
    return response.data
  },

  // 소셜 로그인
  async socialLogin(provider, authData) {
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
  async googleLogin(code) {
    return this.socialLogin('google', { code })
  },

  // GitHub 소셜 로그인
  async githubLogin(code) {
    return this.socialLogin('github', { code })
  },

  // Microsoft 소셜 로그인
  async microsoftLogin(code) {
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
  async updateProfile(profileData) {
    const response = await api.patch('/auth/profile', profileData)
    return response.data
  },

  // 비밀번호 변경
  async changePassword(currentPassword, newPassword) {
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
  async verifyEmail(token) {
    const response = await api.post('/auth/verify-email/confirm', { token })
    return response.data
  },

  // 계정 삭제
  async deleteAccount(password) {
    const response = await api.delete('/auth/account', {
      data: { password }
    })
    return response.data
  }
}
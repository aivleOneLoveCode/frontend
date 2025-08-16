<template>
  <div class="login-container">
    <div class="login-card">
      <button class="back-btn" @click="goBack" title="메인으로 돌아가기">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5"/>
          <path d="M12 19l-7-7 7-7"/>
        </svg>
      </button>

      <div class="logo-section">
        <div class="logo">DA-ZZANY</div>
        <h1 class="logo-title">다시 오신 것을 환영합니다</h1>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label" for="email">이메일</label>
          <input 
            type="email" 
            id="email"
            class="form-input"
            :class="{
              error: validation.email.error,
              valid: validation.email.valid
            }"
            v-model="loginForm.email"
            placeholder="your@email.com"
            @blur="validateField('email')"
            required
          >
          <div v-if="validation.email.message" class="form-help">
            {{ validation.email.message }}
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label" for="password">비밀번호</label>
          <input 
            type="password" 
            id="password"
            class="form-input"
            :class="{
              error: validation.password.error,
              valid: validation.password.valid
            }"
            v-model="loginForm.password"
            placeholder="비밀번호를 입력하세요"
            @blur="validateField('password')"
            required
          >
          <div v-if="validation.password.message" class="form-help">
            {{ validation.password.message }}
          </div>
        </div>
        
        <div class="forgot-password">
          <router-link to="/forgot-password">비밀번호를 잊으셨나요?</router-link>
        </div>
        
        <button type="submit" class="submit-btn" :disabled="authStore.isLoading || !isFormValid">
          <span v-if="authStore.isLoading" class="loading-spinner"></span>
          {{ authStore.isLoading ? '로그인 중...' : '로그인' }}
        </button>
        
        <div class="error-message" :class="{ show: authStore.error }">
          {{ authStore.error }}
        </div>
      </form>

      <div class="divider">
        <span>또는</span>
      </div>

      <div class="social-login">
        <button class="social-btn" @click="handleSocialLogin('google')">
          <svg class="social-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google로 계속하기
        </button>
        
        <button class="social-btn" @click="handleSocialLogin('github')">
          <svg class="social-icon" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHub로 계속하기
        </button>
      </div>

      <div class="auth-footer">
        계정이 없으신가요? 
        <router-link to="/register">회원가입</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { validateEmail } from '@/utils/helpers'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loginForm = ref({
  email: '',
  password: ''
})

const validation = ref({
  email: { valid: false, error: false, message: '' },
  password: { valid: false, error: false, message: '' }
})

const isFormValid = computed(() => {
  return validation.value.email.valid && validation.value.password.valid
})

const validateField = (fieldName: string) => {
  const field = validation.value[fieldName as keyof typeof validation.value]
  const value = loginForm.value[fieldName as keyof typeof loginForm.value]
  
  field.error = false
  field.valid = false
  field.message = ''

  if (!value || value.trim() === '') {
    field.error = true
    field.message = '필수 입력 항목입니다.'
    return
  }

  switch (fieldName) {
    case 'email':
      if (!validateEmail(value)) {
        field.error = true
        field.message = '올바른 이메일 형식이 아닙니다.'
      } else {
        field.valid = true
      }
      break
    case 'password':
      if (value.length < 3) {
        field.error = true
        field.message = '비밀번호를 입력해주세요.'
      } else {
        field.valid = true
      }
      break
  }
}

const handleLogin = async () => {
  try {
    console.log('[Login] 로그인 시도:', loginForm.value.email)
    await authStore.login(loginForm.value.email, loginForm.value.password)
    console.log('[Login] 로그인 성공, 리다이렉트 중...')
    // 로그인 성공 시 채팅 페이지로 리다이렉트
    const redirectPath = route.query.redirect as string || '/chat'
    router.push(redirectPath)
  } catch (error) {
    console.error('[Login] 로그인 실패:', error)
  }
}

const handleSocialLogin = (provider: string) => {
  console.log(`${provider} 로그인 요청`)
  alert(`${provider} 로그인 기능은 준비 중입니다.`)
}

const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
  position: relative;
}

.back-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.logo-section {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #67bdc6, #5aa7b0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #67bdc6;
  box-shadow: 0 0 0 3px rgba(103, 189, 198, 0.1);
}

.form-input.error {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.form-input.valid {
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

.form-help {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.form-input.error + .form-help {
  color: #dc2626;
}

.form-input.valid + .form-help {
  color: #059669;
}

.forgot-password {
  text-align: right;
  margin-bottom: 24px;
}

.forgot-password a {
  color: #67bdc6;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.forgot-password a:hover {
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
  background: #67bdc6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn:hover {
  background: #5aa7b0;
}

.submit-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  color: #dc2626;
  font-size: 14px;
  margin-top: 8px;
  display: none;
}

.error-message.show {
  display: block;
}

.divider {
  position: relative;
  text-align: center;
  margin: 24px 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e5e7eb;
}

.divider span {
  background: white;
  padding: 0 16px;
  color: #6b7280;
  font-size: 14px;
}

.social-login {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.social-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.social-icon {
  width: 20px;
  height: 20px;
}

.auth-footer {
  text-align: center;
  color: #6b7280;
  font-size: 14px;
}

.auth-footer a {
  color: #67bdc6;
  text-decoration: none;
  font-weight: 500;
}

.auth-footer a:hover {
  text-decoration: underline;
}

/* 반응형 디자인 */
@media (max-width: 480px) {
  .login-card {
    padding: 24px;
    margin: 10px;
  }
  
  .logo-title {
    font-size: 18px;
  }
}
</style>
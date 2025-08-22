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
            @input="validateField('email', false)"
            @blur="validateField('email', true)"
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
            @input="validateField('password', false)"
            @blur="validateField('password', true)"
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
        
        <div v-if="authStore.error" class="error-message show">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {{ getErrorMessage(authStore.error) }}
        </div>
      </form>

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
import { useChatStore } from '@/stores/chat'
import { validateEmail } from '@/utils/helpers'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const chatStore = useChatStore()

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

const validateField = (fieldName: string, showError: boolean = true) => {
  const field = validation.value[fieldName as keyof typeof validation.value]
  const value = loginForm.value[fieldName as keyof typeof loginForm.value]
  
  // 입력 중에는 에러 메시지를 초기화하지만 에러 상태는 유지
  if (!showError) {
    field.message = ''
  } else {
    field.error = false
    field.message = ''
  }
  
  field.valid = false

  if (!value || value.trim() === '') {
    if (showError) {
      field.error = true
      field.message = '필수 입력 항목입니다.'
    }
    return
  }

  switch (fieldName) {
    case 'email':
      if (!validateEmail(value)) {
        if (showError) {
          field.error = true
          field.message = '올바른 이메일 형식이 아닙니다.'
        }
      } else {
        field.valid = true
        field.error = false
      }
      break
    case 'password':
      if (value.length < 1) {
        if (showError) {
          field.error = true
          field.message = '비밀번호를 입력해주세요.'
        }
      } else {
        field.valid = true
        field.error = false
      }
      break
  }
}

const handleLogin = async () => {
  try {
    // 에러 메시지 초기화
    authStore.clearMessages()
    
    await authStore.login(loginForm.value.email, loginForm.value.password)
    // 로그인 성공 시 채팅 페이지로 리다이렉트
    const redirectPath = route.query.redirect as string || '/chat'
    router.push(redirectPath)
  } catch (error) {
    console.error('Login failed:', error)
    // 에러는 authStore에서 처리됨
  }
}

// 에러 메시지를 사용자 친화적으로 변환
const getErrorMessage = (error: string): string => {
  if (error.includes('이메일 또는 비밀번호가 잘못되었습니다')) {
    return '이메일 또는 비밀번호를 확인해주세요.'
  }
  if (error.includes('인증이 필요합니다')) {
    return '로그인이 필요합니다. 다시 시도해주세요.'
  }
  if (error.includes('네트워크') || error.includes('연결')) {
    return '네트워크 연결을 확인해주세요.'
  }
  if (error.includes('서버')) {
    return '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
  }
  if (error.includes('HTTP 401')) {
    return '이메일 또는 비밀번호가 올바르지 않습니다.'
  }
  if (error.includes('HTTP 500')) {
    return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
  }
  // 기본 에러 메시지
  return error || '로그인 중 오류가 발생했습니다. 다시 시도해주세요.'
}

const goBack = () => {
  // 홈 페이지로 이동
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
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px 16px;
  margin-top: 16px;
  color: #dc2626;
  font-size: 14px;
  font-weight: 500;
  animation: shake 0.5s ease-in-out;
}

.error-message svg {
  flex-shrink: 0;
  color: #dc2626;
}

.error-message.show {
  display: flex;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
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
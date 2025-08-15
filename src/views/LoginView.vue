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
        <div class="logo">✨</div>
        <h1 class="logo-title">ChatGPT Clone</h1>
        <p class="logo-subtitle">계정에 로그인하여 시작하세요</p>
      </div>

      <div class="tab-container">
        <button 
          class="tab-btn" 
          :class="{ active: currentTab === 'login' }" 
          @click="setTab('login')"
        >
          로그인
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: currentTab === 'register' }" 
          @click="setTab('register')"
        >
          회원가입
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: currentTab === 'forgot' }" 
          @click="setTab('forgot')"
        >
          비밀번호 찾기
        </button>
      </div>

      <!-- 로그인 폼 -->
      <div v-if="currentTab === 'login'" class="form-section active">
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label" for="login-email">이메일</label>
            <input 
              type="email" 
              id="login-email"
              class="form-input"
              :class="{
                error: loginValidation.email.error,
                valid: loginValidation.email.valid
              }"
              v-model="loginForm.email"
              placeholder="your@email.com"
              @blur="validateField('login', 'email')"
              required
            >
            <div v-if="loginValidation.email.message" class="form-help">
              {{ loginValidation.email.message }}
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="login-password">비밀번호</label>
            <input 
              type="password" 
              id="login-password"
              class="form-input"
              :class="{
                error: loginValidation.password.error,
                valid: loginValidation.password.valid
              }"
              v-model="loginForm.password"
              placeholder="비밀번호를 입력하세요"
              @blur="validateField('login', 'password')"
              required
            >
            <div v-if="loginValidation.password.message" class="form-help">
              {{ loginValidation.password.message }}
            </div>
          </div>
          <div class="forgot-password">
            <a href="#" @click.prevent="setTab('forgot')">비밀번호를 잊으셨나요?</a>
          </div>
          <button type="submit" class="submit-btn" :disabled="authStore.isLoading || !isLoginFormValid">
            <span v-if="authStore.isLoading" class="loading-spinner"></span>
            {{ authStore.isLoading ? '로그인 중...' : '로그인' }}
          </button>
          <div class="error-message" :class="{ show: authStore.error }">
            {{ authStore.error }}
          </div>
        </form>
      </div>

      <!-- 회원가입 폼 -->
      <div v-if="currentTab === 'register'" class="form-section active">
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label class="form-label" for="register-name">이름</label>
            <input 
              type="text" 
              id="register-name"
              class="form-input"
              :class="{
                error: registerValidation.name.error,
                valid: registerValidation.name.valid
              }"
              v-model="registerForm.name"
              placeholder="이름을 입력하세요"
              @blur="validateField('register', 'name')"
              required
            >
            <div v-if="registerValidation.name.message" class="form-help">
              {{ registerValidation.name.message }}
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="register-email">이메일</label>
            <input 
              type="email" 
              id="register-email"
              class="form-input"
              :class="{
                error: registerValidation.email.error,
                valid: registerValidation.email.valid
              }"
              v-model="registerForm.email"
              placeholder="your@email.com"
              @blur="validateField('register', 'email')"
              required
            >
            <div v-if="registerValidation.email.message" class="form-help">
              {{ registerValidation.email.message }}
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="register-password">비밀번호</label>
            <input 
              type="password" 
              id="register-password"
              class="form-input"
              :class="{
                error: registerValidation.password.error,
                valid: registerValidation.password.valid
              }"
              v-model="registerForm.password"
              placeholder="8자 이상 입력하세요"
              @input="validateField('register', 'password')"
              required
            >
            <div v-if="passwordStrength && registerForm.password" class="password-strength">
              <div class="password-strength-bar" :class="passwordStrengthClass"></div>
            </div>
            <div v-if="registerValidation.password.message" class="form-help">
              {{ registerValidation.password.message }}
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="register-confirm-password">비밀번호 확인</label>
            <input 
              type="password" 
              id="register-confirm-password"
              class="form-input"
              :class="{
                error: registerValidation.confirmPassword.error,
                valid: registerValidation.confirmPassword.valid
              }"
              v-model="registerForm.confirmPassword"
              placeholder="비밀번호를 다시 입력하세요"
              @blur="validateField('register', 'confirmPassword')"
              required
            >
            <div v-if="registerValidation.confirmPassword.message" class="form-help">
              {{ registerValidation.confirmPassword.message }}
            </div>
          </div>
          <button type="submit" class="submit-btn" :disabled="authStore.isLoading || !isRegisterFormValid">
            <span v-if="authStore.isLoading" class="loading-spinner"></span>
            {{ authStore.isLoading ? '가입 중...' : '회원가입' }}
          </button>
          <div class="error-message" :class="{ show: authStore.error }">
            {{ authStore.error }}
          </div>
          <div class="success-message" :class="{ show: authStore.successMessage }">
            {{ authStore.successMessage }}
          </div>
        </form>
      </div>

      <!-- 비밀번호 찾기 폼 -->
      <div v-if="currentTab === 'forgot'" class="form-section active">
        <form @submit.prevent="handleForgotPassword">
          <div class="form-group">
            <label class="form-label" for="forgot-email">이메일</label>
            <input 
              type="email" 
              id="forgot-email"
              class="form-input"
              :class="{
                error: forgotValidation.email.error,
                valid: forgotValidation.email.valid
              }"
              v-model="forgotForm.email"
              placeholder="등록된 이메일을 입력하세요"
              @blur="validateField('forgot', 'email')"
              required
            >
            <div v-if="forgotValidation.email.message" class="form-help">
              {{ forgotValidation.email.message }}
            </div>
          </div>
          <button type="submit" class="submit-btn" :disabled="authStore.isLoading || !isForgotFormValid">
            <span v-if="authStore.isLoading" class="loading-spinner"></span>
            {{ authStore.isLoading ? '전송 중...' : '비밀번호 재설정 이메일 보내기' }}
          </button>
          <div class="error-message" :class="{ show: authStore.error }">
            {{ authStore.error }}
          </div>
          <div class="success-message" :class="{ show: authStore.successMessage }">
            {{ authStore.successMessage }}
          </div>
        </form>
      </div>

      <!-- 소셜 로그인 (로그인 탭에서만 표시) -->
      <div v-if="currentTab === 'login'" class="divider">
        <span>또는</span>
      </div>

      <div v-if="currentTab === 'login'" class="social-login">
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
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHub로 계속하기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { validateEmail, getPasswordStrength } from '@/utils/helpers'

const router = useRouter()
const authStore = useAuthStore()

const currentTab = ref<'login' | 'register' | 'forgot'>('login')

// 폼 데이터
const loginForm = ref({
  email: '',
  password: ''
})

const registerForm = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const forgotForm = ref({
  email: ''
})

// 검증 상태
const loginValidation = ref({
  email: { valid: false, error: false, message: '' },
  password: { valid: false, error: false, message: '' }
})

const registerValidation = ref({
  name: { valid: false, error: false, message: '' },
  email: { valid: false, error: false, message: '' },
  password: { valid: false, error: false, message: '' },
  confirmPassword: { valid: false, error: false, message: '' }
})

const forgotValidation = ref({
  email: { valid: false, error: false, message: '' }
})

// Computed Properties
const isLoginFormValid = computed(() => {
  return loginValidation.value.email.valid && 
         loginValidation.value.password.valid
})

const isRegisterFormValid = computed(() => {
  return registerValidation.value.name.valid && 
         registerValidation.value.email.valid && 
         registerValidation.value.password.valid && 
         registerValidation.value.confirmPassword.valid
})

const isForgotFormValid = computed(() => {
  return forgotValidation.value.email.valid
})

const passwordStrength = computed(() => {
  return getPasswordStrength(registerForm.value.password)
})

const passwordStrengthClass = computed(() => {
  const strength = passwordStrength.value.score
  if (strength <= 2) return 'password-strength-weak'
  if (strength <= 3) return 'password-strength-medium'
  return 'password-strength-strong'
})

// 유틸리티 함수들
const validateName = (name: string) => {
  return name && name.trim().length >= 2
}

const validatePassword = (password: string) => {
  return password && password.length >= 8
}

// 필드 검증 함수
const validateField = (formType: 'login' | 'register' | 'forgot', fieldName: string) => {
  let validation: any
  let value: string

  switch (formType) {
    case 'login':
      validation = loginValidation.value
      value = loginForm.value[fieldName as keyof typeof loginForm.value]
      break
    case 'register':
      validation = registerValidation.value
      value = registerForm.value[fieldName as keyof typeof registerForm.value]
      break
    case 'forgot':
      validation = forgotValidation.value
      value = forgotForm.value[fieldName as keyof typeof forgotForm.value]
      break
  }

  if (!validation || !validation[fieldName]) return

  const field = validation[fieldName]
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
        field.message = ''
      }
      break

    case 'name':
      if (!validateName(value)) {
        field.error = true
        field.message = '이름은 2자 이상이어야 합니다.'
      } else {
        field.valid = true
        field.message = ''
      }
      break

    case 'password':
      if (!validatePassword(value)) {
        field.error = true
        field.message = '비밀번호는 8자 이상이어야 합니다.'
      } else {
        field.valid = true
        if (formType === 'register') {
          const strength = passwordStrength.value.score
          if (strength <= 2) {
            field.message = '약한 비밀번호입니다.'
          } else if (strength <= 3) {
            field.message = '보통 비밀번호입니다.'
          } else {
            field.message = '강한 비밀번호입니다.'
          }
        }
      }
      break

    case 'confirmPassword':
      if (value !== registerForm.value.password) {
        field.error = true
        field.message = '비밀번호가 일치하지 않습니다.'
      } else {
        field.valid = true
        field.message = '비밀번호가 일치합니다.'
      }
      break
  }
}

// Watchers
watch(() => registerForm.value.password, () => {
  if (registerForm.value.confirmPassword) {
    validateField('register', 'confirmPassword')
  }
})

// 탭 변경
const setTab = (tab: 'login' | 'register' | 'forgot') => {
  currentTab.value = tab
  authStore.clearMessages()
}

// 로그인 처리
const handleLogin = async () => {
  try {
    await authStore.login(loginForm.value.email, loginForm.value.password)
    router.push('/')
  } catch (error) {
    console.error('Login failed:', error)
  }
}

// 회원가입 처리
const handleRegister = async () => {
  try {
    await authStore.register({
      name: registerForm.value.name,
      email: registerForm.value.email,
      password: registerForm.value.password,
      confirmPassword: registerForm.value.confirmPassword
    })
    
    // 성공 시 2초 후 로그인 탭으로 전환
    setTimeout(() => {
      setTab('login')
      registerForm.value = { name: '', email: '', password: '', confirmPassword: '' }
    }, 2000)
  } catch (error) {
    console.error('Registration failed:', error)
  }
}

// 비밀번호 찾기 처리
const handleForgotPassword = async () => {
  try {
    await authStore.forgotPassword(forgotForm.value.email)
    forgotForm.value.email = ''
  } catch (error) {
    console.error('Forgot password failed:', error)
  }
}

// 소셜 로그인 처리
const handleSocialLogin = (provider: string) => {
  console.log(`${provider} 로그인 요청`)
  // 실제로는 OAuth 플로우 시작
  alert(`${provider} 로그인 기능은 준비 중입니다.`)
}

// 메인 페이지로 돌아가기
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
  font-size: 32px;
  margin-bottom: 8px;
}

.logo-title {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.logo-subtitle {
  color: #6b7280;
  font-size: 14px;
}

.tab-container {
  display: flex;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 24px;
}

.tab-btn {
  flex: 1;
  background: transparent;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
}

.tab-btn.active {
  background: white;
  color: #374151;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.form-section {
  display: none;
}

.form-section.active {
  display: block;
}

.form-input.error {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.form-input.valid {
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
}

.password-strength {
  margin-top: 8px;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.password-strength-bar {
  height: 100%;
  transition: all 0.3s ease;
}

.password-strength-weak {
  width: 33%;
  background: #dc2626;
}

.password-strength-medium {
  width: 66%;
  background: #f59e0b;
}

.password-strength-strong {
  width: 100%;
  background: #059669;
}

.form-help {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
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
  border-color: #10a37f;
  box-shadow: 0 0 0 3px rgba(16, 163, 127, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

.forgot-password {
  text-align: right;
  margin-bottom: 24px;
}

.forgot-password a {
  color: #10a37f;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.forgot-password a:hover {
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
  background: #10a37f;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 24px;
}

.submit-btn:hover {
  background: #0d8a6b;
}

.submit-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
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

.error-message {
  color: #dc2626;
  font-size: 14px;
  margin-top: 8px;
  display: none;
}

.error-message.show {
  display: block;
}

.success-message {
  color: #059669;
  font-size: 14px;
  margin-top: 8px;
  display: none;
}

.success-message.show {
  display: block;
}

/* 반응형 디자인 */
@media (max-width: 480px) {
  .login-card {
    padding: 24px;
    margin: 10px;
  }
  
  .logo-title {
    font-size: 20px;
  }
}
</style>
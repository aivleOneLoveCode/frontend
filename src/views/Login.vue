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
        <h1 class="logo-title">
          <span v-if="currentTab === 'login'">다시 오신 것을 환영합니다</span>
          <span v-else-if="currentTab === 'register'">계정을 생성하세요</span>
          <span v-else>비밀번호를 재설정하세요</span>
        </h1>
      </div>

      <!-- 로그인 폼 -->
      <div v-if="currentTab === 'login'" class="form-section active">
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label">이메일</label>
            <input 
              type="email" 
              v-model="loginForm.email"
              class="form-input"
              :class="{ error: loginForm.emailError, valid: loginForm.emailValid }"
              placeholder="이메일을 입력하세요"
              required
            >
            <div v-if="loginForm.emailError" class="error-message show">{{ loginForm.emailError }}</div>
          </div>

          <div class="form-group">
            <label class="form-label">비밀번호</label>
            <input 
              type="password" 
              v-model="loginForm.password"
              class="form-input"
              :class="{ error: loginForm.passwordError }"
              placeholder="비밀번호를 입력하세요"
              required
            >
            <div v-if="loginForm.passwordError" class="error-message show">{{ loginForm.passwordError }}</div>
          </div>

          <div class="forgot-password">
            <a href="#" @click.prevent="currentTab = 'forgot'">비밀번호를 잊으셨나요?</a>
          </div>

          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="isLoading" class="loading-spinner"></span>
            로그인
          </button>

          <div v-if="loginForm.error" class="error-message show">{{ loginForm.error }}</div>
          <div v-if="loginForm.success" class="success-message show">{{ loginForm.success }}</div>
        </form>

        <div class="auth-footer">
          계정이 없으신가요? 
          <button @click="currentTab = 'register'">회원가입</button>
        </div>
      </div>

      <!-- 회원가입 폼 -->
      <div v-else-if="currentTab === 'register'" class="form-section active">
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label class="form-label">이름</label>
            <input 
              type="text" 
              v-model="registerForm.name"
              class="form-input"
              :class="{ error: registerForm.nameError, valid: registerForm.nameValid }"
              placeholder="이름을 입력하세요"
              required
            >
            <div v-if="registerForm.nameError" class="error-message show">{{ registerForm.nameError }}</div>
          </div>

          <div class="form-group">
            <label class="form-label">이메일</label>
            <input 
              type="email" 
              v-model="registerForm.email"
              class="form-input"
              :class="{ error: registerForm.emailError, valid: registerForm.emailValid }"
              placeholder="이메일을 입력하세요"
              required
            >
            <div v-if="registerForm.emailError" class="error-message show">{{ registerForm.emailError }}</div>
          </div>

          <div class="form-group">
            <label class="form-label">비밀번호</label>
            <input 
              type="password" 
              v-model="registerForm.password"
              class="form-input"
              :class="{ error: registerForm.passwordError, valid: registerForm.passwordValid }"
              placeholder="비밀번호를 입력하세요"
              @input="checkPasswordStrength"
              required
            >
            <div class="password-strength">
              <div class="password-strength-bar" :class="passwordStrengthClass"></div>
            </div>
            <div class="form-help">최소 8자, 대소문자, 숫자, 특수문자 포함</div>
            <div v-if="registerForm.passwordError" class="error-message show">{{ registerForm.passwordError }}</div>
          </div>

          <div class="form-group">
            <label class="form-label">비밀번호 확인</label>
            <input 
              type="password" 
              v-model="registerForm.confirmPassword"
              class="form-input"
              :class="{ error: registerForm.confirmPasswordError, valid: registerForm.confirmPasswordValid }"
              placeholder="비밀번호를 다시 입력하세요"
              required
            >
            <div v-if="registerForm.confirmPasswordError" class="error-message show">{{ registerForm.confirmPasswordError }}</div>
          </div>

          <button type="submit" class="submit-btn" :disabled="isLoading || !isRegisterFormValid">
            <span v-if="isLoading" class="loading-spinner"></span>
            회원가입
          </button>

          <div v-if="registerForm.error" class="error-message show">{{ registerForm.error }}</div>
          <div v-if="registerForm.success" class="success-message show">{{ registerForm.success }}</div>
        </form>

        <div class="auth-footer">
          이미 계정이 있으신가요? 
          <button @click="currentTab = 'login'">로그인</button>
        </div>
      </div>

      <!-- 비밀번호 재설정 폼 -->
      <div v-else-if="currentTab === 'forgot'" class="form-section active">
        <form @submit.prevent="handleForgotPassword">
          <div class="form-group">
            <label class="form-label">이메일</label>
            <input 
              type="email" 
              v-model="forgotForm.email"
              class="form-input"
              :class="{ error: forgotForm.emailError, valid: forgotForm.emailValid }"
              placeholder="등록된 이메일을 입력하세요"
              required
            >
            <div class="form-help">비밀번호 재설정 링크를 보내드립니다</div>
            <div v-if="forgotForm.emailError" class="error-message show">{{ forgotForm.emailError }}</div>
          </div>

          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="isLoading" class="loading-spinner"></span>
            재설정 링크 보내기
          </button>

          <div v-if="forgotForm.error" class="error-message show">{{ forgotForm.error }}</div>
          <div v-if="forgotForm.success" class="success-message show">{{ forgotForm.success }}</div>
        </form>

        <div class="auth-footer">
          <button @click="currentTab = 'login'">로그인으로 돌아가기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 현재 탭 상태
const currentTab = ref('login')
const isLoading = ref(false)

// 로그인 폼 데이터
const loginForm = ref({
  email: '',
  password: '',
  emailError: '',
  passwordError: '',
  emailValid: false,
  error: '',
  success: ''
})

// 회원가입 폼 데이터
const registerForm = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  nameError: '',
  emailError: '',
  passwordError: '',
  confirmPasswordError: '',
  nameValid: false,
  emailValid: false,
  passwordValid: false,
  confirmPasswordValid: false,
  error: '',
  success: ''
})

// 비밀번호 찾기 폼 데이터
const forgotForm = ref({
  email: '',
  emailError: '',
  emailValid: false,
  error: '',
  success: ''
})

// 비밀번호 강도
const passwordStrength = ref(0)

const passwordStrengthClass = computed(() => {
  if (passwordStrength.value <= 1) return 'password-strength-weak'
  if (passwordStrength.value <= 2) return 'password-strength-medium'
  return 'password-strength-strong'
})

const isRegisterFormValid = computed(() => {
  return registerForm.value.nameValid && 
         registerForm.value.emailValid && 
         registerForm.value.passwordValid && 
         registerForm.value.confirmPasswordValid
})

// 이메일 유효성 검사
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 비밀번호 강도 체크
const checkPasswordStrength = () => {
  const password = registerForm.value.password
  let strength = 0
  
  if (password.length >= 8) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++
  
  passwordStrength.value = Math.min(strength, 3)
  
  // 비밀번호 유효성 검사
  if (password.length < 8) {
    registerForm.value.passwordError = '비밀번호는 최소 8자 이상이어야 합니다'
    registerForm.value.passwordValid = false
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
    registerForm.value.passwordError = '대소문자, 숫자, 특수문자를 포함해야 합니다'
    registerForm.value.passwordValid = false
  } else {
    registerForm.value.passwordError = ''
    registerForm.value.passwordValid = true
  }
  
  // 비밀번호 확인 체크
  if (registerForm.value.confirmPassword && registerForm.value.confirmPassword !== password) {
    registerForm.value.confirmPasswordError = '비밀번호가 일치하지 않습니다'
    registerForm.value.confirmPasswordValid = false
  } else if (registerForm.value.confirmPassword === password && password) {
    registerForm.value.confirmPasswordError = ''
    registerForm.value.confirmPasswordValid = true
  }
}

// 로그인 처리
const handleLogin = async () => {
  isLoading.value = true
  loginForm.value.error = ''
  
  try {
    // 이메일 유효성 검사
    if (!validateEmail(loginForm.value.email)) {
      loginForm.value.emailError = '올바른 이메일 형식을 입력하세요'
      loginForm.value.emailValid = false
      return
    } else {
      loginForm.value.emailError = ''
      loginForm.value.emailValid = true
    }
    
    // 실제 로그인 API 호출 (여기서는 시뮬레이션)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 로그인 성공 시
    loginForm.value.success = '로그인 성공!'
    
    setTimeout(() => {
      const redirectTo = route.query.redirect as string || '/chat'
      router.push(redirectTo)
    }, 1000)
    
  } catch (error) {
    loginForm.value.error = '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.'
  } finally {
    isLoading.value = false
  }
}

// 회원가입 처리
const handleRegister = async () => {
  isLoading.value = true
  registerForm.value.error = ''
  
  try {
    // 폼 유효성 검사
    if (!registerForm.value.name.trim()) {
      registerForm.value.nameError = '이름을 입력하세요'
      registerForm.value.nameValid = false
      return
    } else {
      registerForm.value.nameError = ''
      registerForm.value.nameValid = true
    }
    
    if (!validateEmail(registerForm.value.email)) {
      registerForm.value.emailError = '올바른 이메일 형식을 입력하세요'
      registerForm.value.emailValid = false
      return
    } else {
      registerForm.value.emailError = ''
      registerForm.value.emailValid = true
    }
    
    if (registerForm.value.password !== registerForm.value.confirmPassword) {
      registerForm.value.confirmPasswordError = '비밀번호가 일치하지 않습니다'
      registerForm.value.confirmPasswordValid = false
      return
    } else {
      registerForm.value.confirmPasswordError = ''
      registerForm.value.confirmPasswordValid = true
    }
    
    // 실제 회원가입 API 호출 (여기서는 시뮬레이션)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    registerForm.value.success = '회원가입이 완료되었습니다!'
    
    setTimeout(() => {
      currentTab.value = 'login'
    }, 2000)
    
  } catch (error) {
    registerForm.value.error = '회원가입에 실패했습니다. 다시 시도해주세요.'
  } finally {
    isLoading.value = false
  }
}

// 비밀번호 재설정 처리
const handleForgotPassword = async () => {
  isLoading.value = true
  forgotForm.value.error = ''
  
  try {
    if (!validateEmail(forgotForm.value.email)) {
      forgotForm.value.emailError = '올바른 이메일 형식을 입력하세요'
      forgotForm.value.emailValid = false
      return
    } else {
      forgotForm.value.emailError = ''
      forgotForm.value.emailValid = true
    }
    
    // 실제 비밀번호 재설정 API 호출 (여기서는 시뮬레이션)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    forgotForm.value.success = '비밀번호 재설정 링크를 이메일로 보내드렸습니다.'
    
  } catch (error) {
    forgotForm.value.error = '이메일 전송에 실패했습니다. 다시 시도해주세요.'
  } finally {
    isLoading.value = false
  }
}

// 뒤로 가기
const goBack = () => {
  router.push('/')
}

onMounted(() => {
  // URL 파라미터에 따라 초기 탭 설정
  const tab = route.query.tab as string
  if (tab && ['login', 'register', 'forgot'].includes(tab)) {
    currentTab.value = tab
  }
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  color: #374151;
  line-height: 1.6;
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
  margin-bottom: 24px;
}

.form-section {
  display: none;
}

.form-section.active {
  display: block;
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

.form-input::placeholder {
  color: #9ca3af;
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

.auth-footer {
  text-align: center;
  margin-top: 20px;
  color: #6b7280;
  font-size: 14px;
}

.auth-footer button {
  background: none;
  border: none;
  color: #67bdc6;
  cursor: pointer;
  text-decoration: underline;
}

.auth-footer button:hover {
  color: #5aa7b0;
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
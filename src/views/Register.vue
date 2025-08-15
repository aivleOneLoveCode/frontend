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
        <h1 class="logo-title">계정을 생성하세요</h1>
      </div>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label class="form-label" for="name">이름</label>
          <input 
            type="text" 
            id="name"
            class="form-input"
            :class="{
              error: validation.name.error,
              valid: validation.name.valid
            }"
            v-model="registerForm.name"
            placeholder="이름을 입력하세요"
            @blur="validateField('name')"
            required
          >
          <div v-if="validation.name.message" class="form-help">
            {{ validation.name.message }}
          </div>
        </div>

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
            v-model="registerForm.email"
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
            v-model="registerForm.password"
            placeholder="8자 이상 입력하세요"
            @input="validateField('password')"
            required
          >
          <div v-if="passwordStrength && registerForm.password" class="password-strength">
            <div class="password-strength-bar" :class="passwordStrengthClass"></div>
          </div>
          <div v-if="validation.password.message" class="form-help">
            {{ validation.password.message }}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="confirmPassword">비밀번호 확인</label>
          <input 
            type="password" 
            id="confirmPassword"
            class="form-input"
            :class="{
              error: validation.confirmPassword.error,
              valid: validation.confirmPassword.valid
            }"
            v-model="registerForm.confirmPassword"
            placeholder="비밀번호를 다시 입력하세요"
            @blur="validateField('confirmPassword')"
            required
          >
          <div v-if="validation.confirmPassword.message" class="form-help">
            {{ validation.confirmPassword.message }}
          </div>
        </div>
        
        <button type="submit" class="submit-btn" :disabled="authStore.isLoading || !isFormValid">
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

      <div class="auth-footer">
        이미 계정이 있으신가요? 
        <router-link to="/login">로그인</router-link>
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

const registerForm = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validation = ref({
  name: { valid: false, error: false, message: '' },
  email: { valid: false, error: false, message: '' },
  password: { valid: false, error: false, message: '' },
  confirmPassword: { valid: false, error: false, message: '' }
})

const isFormValid = computed(() => {
  return validation.value.name.valid && 
         validation.value.email.valid && 
         validation.value.password.valid && 
         validation.value.confirmPassword.valid
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

const validateName = (name: string) => {
  return name && name.trim().length >= 2
}

const validatePassword = (password: string) => {
  return password && password.length >= 8
}

const validateField = (fieldName: string) => {
  const field = validation.value[fieldName as keyof typeof validation.value]
  const value = registerForm.value[fieldName as keyof typeof registerForm.value]
  
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

    case 'name':
      if (!validateName(value)) {
        field.error = true
        field.message = '이름은 2자 이상이어야 합니다.'
      } else {
        field.valid = true
      }
      break

    case 'password':
      if (!validatePassword(value)) {
        field.error = true
        field.message = '비밀번호는 8자 이상이어야 합니다.'
      } else {
        field.valid = true
        const strength = passwordStrength.value.score
        if (strength <= 2) {
          field.message = '약한 비밀번호입니다.'
        } else if (strength <= 3) {
          field.message = '보통 비밀번호입니다.'
        } else {
          field.message = '강한 비밀번호입니다.'
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

// 비밀번호 변경 시 확인 비밀번호 재검증
watch(() => registerForm.value.password, () => {
  if (registerForm.value.confirmPassword) {
    validateField('confirmPassword')
  }
})

const handleRegister = async () => {
  try {
    await authStore.register({
      name: registerForm.value.name,
      email: registerForm.value.email,
      password: registerForm.value.password,
      confirmPassword: registerForm.value.confirmPassword
    })
    
    // 성공 시 2초 후 로그인 페이지로 이동
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error) {
    console.error('Registration failed:', error)
  }
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

.form-input.error + .password-strength + .form-help,
.form-input.error + .form-help {
  color: #dc2626;
}

.form-input.valid + .password-strength + .form-help,
.form-input.valid + .form-help {
  color: #059669;
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

.success-message {
  color: #059669;
  font-size: 14px;
  margin-top: 8px;
  display: none;
}

.success-message.show {
  display: block;
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
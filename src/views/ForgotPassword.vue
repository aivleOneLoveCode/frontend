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
        <h1 class="logo-title">비밀번호를 재설정하세요</h1>
        <p class="logo-subtitle">등록된 이메일 주소를 입력하시면<br>비밀번호 재설정 링크를 보내드립니다.</p>
      </div>

      <form @submit.prevent="handleForgotPassword">
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
            v-model="forgotForm.email"
            placeholder="등록된 이메일을 입력하세요"
            @blur="validateField('email')"
            required
          >
          <div v-if="validation.email.message" class="form-help">
            {{ validation.email.message }}
          </div>
        </div>
        
        <button type="submit" class="submit-btn" :disabled="authStore.isLoading || !isFormValid">
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

      <div class="auth-footer">
        <div class="auth-links">
          <router-link to="/login">로그인으로 돌아가기</router-link>
          <span class="separator">•</span>
          <router-link to="/register">회원가입</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { validateEmail } from '@/utils/helpers'

const router = useRouter()
const authStore = useAuthStore()

const forgotForm = ref({
  email: ''
})

const validation = ref({
  email: { valid: false, error: false, message: '' }
})

const isFormValid = computed(() => {
  return validation.value.email.valid
})

const validateField = (fieldName: string) => {
  const field = validation.value[fieldName as keyof typeof validation.value]
  const value = forgotForm.value[fieldName as keyof typeof forgotForm.value]
  
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
  }
}

const handleForgotPassword = async () => {
  try {
    await authStore.forgotPassword(forgotForm.value.email)
    forgotForm.value.email = ''
  } catch (error) {
    console.error('Forgot password failed:', error)
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
  margin-bottom: 12px;
}

.logo-subtitle {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 24px;
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

.auth-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.separator {
  color: #d1d5db;
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

  .auth-links {
    flex-direction: column;
    gap: 8px;
  }

  .separator {
    display: none;
  }
}
</style>
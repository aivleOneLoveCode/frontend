<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Back Button -->
      <button
        class="flex items-center gap-2 mb-6 -ml-2 px-2 py-1 bg-transparent border-0 cursor-pointer hover:bg-gray-100 rounded"
        @click="onBack"
      >
        <ArrowLeftIcon />
        메인으로 돌아가기
      </button>

      <div class="w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <!-- Card Header -->
        <div class="p-6 pb-4">
          <h2 class="text-xl font-semibold text-center">
            {{ showForgotPassword 
              ? "비밀번호 찾기" 
              : isLogin 
                ? "로그인" 
                : "회원가입"
            }}
          </h2>
          <p class="text-center text-gray-600 text-sm mt-2">
            {{ showForgotPassword 
              ? "등록된 이메일 주소를 입력하세요" 
              : isLogin 
                ? "계정에 로그인하여 워크플로우를 관리하세요" 
                : "새 계정을 만들어 시작하세요"
            }}
          </p>
        </div>

        <!-- Card Content -->
        <div class="px-6 pb-4 space-y-4">
          <form @submit="handleSubmit" class="space-y-4">
            <div v-if="!isLogin && !showForgotPassword" class="space-y-2">
              <label for="name" class="text-sm font-medium">이름</label>
              <input
                id="name"
                v-model="name"
                type="text"
                placeholder="이름을 입력하세요"
                class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div class="space-y-2">
              <label for="email" class="text-sm font-medium">이메일</label>
              <div class="relative">
                <MailIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>

            <div v-if="!showForgotPassword" class="space-y-2">
              <label for="password" class="text-sm font-medium">비밀번호</label>
              <div class="relative">
                <LockIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  v-model="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>

            <div v-if="!isLogin && !showForgotPassword" class="space-y-2">
              <label for="confirmPassword" class="text-sm font-medium">비밀번호 확인</label>
              <div class="relative">
                <LockIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="confirmPassword"
                  v-model="confirmPassword"
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer border-0"
            >
              {{ showForgotPassword 
                ? "재설정 링크 전송" 
                : isLogin 
                  ? "로그인" 
                  : "회원가입"
              }}
            </button>
          </form>

          <div v-if="!showForgotPassword">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300"></div>
              </div>
              <div class="relative flex justify-center">
                <span class="bg-white px-2 text-gray-600">또는</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 mt-4">
              <button
                class="flex items-center justify-center gap-2 w-full px-3 py-2 border border-gray-300 rounded bg-transparent hover:bg-gray-50 cursor-pointer"
                @click="() => handleSocialLogin('Google')"
              >
                <ChromeIcon />
                Google
              </button>
              <button
                class="flex items-center justify-center gap-2 w-full px-3 py-2 border border-gray-300 rounded bg-transparent hover:bg-gray-50 cursor-pointer"
                @click="() => handleSocialLogin('GitHub')"
              >
                <GithubIcon />
                GitHub
              </button>
            </div>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="px-6 pb-6 flex flex-col space-y-3">
          <div v-if="showForgotPassword">
            <button
              class="w-full text-blue-600 hover:text-blue-700 bg-transparent border-0 cursor-pointer underline"
              @click="handleBackToLogin"
            >
              로그인으로 돌아가기
            </button>
          </div>
          <div v-else-if="isLogin">
            <button
              class="w-full text-blue-600 hover:text-blue-700 bg-transparent border-0 cursor-pointer underline mb-3"
              @click="handleForgotPassword"
            >
              비밀번호를 잊으셨나요?
            </button>
            <div class="text-center">
              <span class="text-gray-600">계정이 없으신가요? </span>
              <button 
                class="text-blue-600 hover:text-blue-700 bg-transparent border-0 cursor-pointer underline p-0"
                @click="switchMode"
              >
                회원가입
              </button>
            </div>
          </div>
          <div v-else>
            <div class="text-center">
              <span class="text-gray-600">이미 계정이 있으신가요? </span>
              <button 
                class="text-blue-600 hover:text-blue-700 bg-transparent border-0 cursor-pointer underline p-0"
                @click="switchMode"
              >
                로그인
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface LoginProps {
  onBack: () => void
}

const props = defineProps<LoginProps>()

const isLogin = ref(true)
const showForgotPassword = ref(false)
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const name = ref('')

const handleSubmit = (e: Event) => {
  e.preventDefault()
  
  if (showForgotPassword.value) {
    console.log("비밀번호 재설정 이메일 전송:", email.value)
    // 여기에 비밀번호 재설정 로직 추가
    alert(`${email.value}로 비밀번호 재설정 링크를 전송했습니다.`)
    showForgotPassword.value = false
    return
  }

  if (isLogin.value) {
    console.log("로그인:", { email: email.value, password: password.value })
    // 여기에 로그인 로직 추가
    alert("로그인 되었습니다!")
    props.onBack() // 메인 화면으로 돌아가기
  } else {
    if (password.value !== confirmPassword.value) {
      alert("비밀번호가 일치하지 않습니다.")
      return
    }
    console.log("회원가입:", { name: name.value, email: email.value, password: password.value })
    // 여기에 회원가입 로직 추가
    alert("회원가입이 완료되었습니다!")
    isLogin.value = true
  }
}

const handleSocialLogin = (provider: string) => {
  console.log(`${provider} 로그인`)
  // 여기에 소셜 로그인 로직 추가
  alert(`${provider} 로그인 되었습니다!`)
  props.onBack() // 메인 화면으로 돌아가기
}

const resetForm = () => {
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  name.value = ''
}

const switchMode = () => {
  isLogin.value = !isLogin.value
  showForgotPassword.value = false
  resetForm()
}

const handleForgotPassword = () => {
  showForgotPassword.value = true
  resetForm()
}

const handleBackToLogin = () => {
  showForgotPassword.value = false
  resetForm()
}
</script>

<!-- Icon Components -->
<script lang="ts">
const ArrowLeftIcon = {
  name: 'ArrowLeftIcon',
  template: `
    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  `
}

const MailIcon = {
  name: 'MailIcon',
  template: `
    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  `
}

const LockIcon = {
  name: 'LockIcon',
  template: `
    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  `
}

const ChromeIcon = {
  name: 'ChromeIcon',
  template: `
    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="4"/>
      <path d="M21.17 8H12"/>
      <path d="M3.95 6.06L8.54 14"/>
      <path d="M10.88 21.94L15.46 14"/>
    </svg>
  `
}

const GithubIcon = {
  name: 'GithubIcon',
  template: `
    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  `
}

export { ArrowLeftIcon, MailIcon, LockIcon, ChromeIcon, GithubIcon }
</script>
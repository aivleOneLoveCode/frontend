<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ t('settings') }}</h2>
        <button class="modal-close-btn" @click="closeModal">×</button>
      </div>
      <div class="modal-body">
        <div v-if="currentUser" class="settings-section">
          <h3>{{ t('user_profile') }}</h3>
          <div class="setting-item" style="display: flex; align-items: center; gap: 16px; padding: 16px; background: var(--panel-hover); border-radius: 12px;">
            <div class="user-avatar" style="width: 48px; height: 48px; background: linear-gradient(135deg, #67bdc6, #4a9ba3); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 600;">{{ getUserInitial }}</div>
            <div>
              <div style="font-size: 16px; font-weight: 600; color: var(--text-color); margin-bottom: 4px;">{{ currentUser.name }}</div>
              <div style="font-size: 14px; color: var(--text-muted);">{{ currentUser.email }}</div>
              <div v-if="currentUser.loginTime" style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">로그인: {{ formatDate(new Date(currentUser.loginTime)) }}</div>
            </div>
            <div style="margin-left: auto;">
              <button class="btn-secondary" @click="logout" style="padding: 8px 16px; font-size: 14px;">{{ t('logout') }}</button>
            </div>
          </div>
        </div>
        
        <div class="settings-section">
          <h3>{{ t('appearance') }}</h3>
          <div class="setting-item">
            <label>{{ t('theme') }}</label>
            <select v-model="settings.theme" @change="changeTheme(settings.theme)">
              <option value="light">{{ t('light_mode') }}</option>
              <option value="dark">{{ t('dark_mode') }}</option>
              <option value="system">{{ t('system_setting') }}</option>
            </select>
          </div>
          <div class="setting-item">
            <label>{{ t('language') }}</label>
            <select v-model="settings.language" @change="changeLanguage(settings.language)">
              <option value="ko">한국어</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
            </select>
          </div>
        </div>

        <div class="settings-section">
          <h3>{{ t('chat') }}</h3>
          <div class="setting-item">
            <label>
              <input type="checkbox" v-model="settings.autoSaveChat" @change="saveSettings"> {{ t('auto_save_chat') }}
            </label>
          </div>
          <div class="setting-item">
            <label>
              <input type="checkbox" v-model="settings.autoScroll" @change="saveSettings"> {{ t('auto_scroll') }}
            </label>
          </div>
          <div class="setting-item">
            <label>{{ t('message_font_size') }}</label>
            <select v-model="settings.fontSize" @change="changeFontSize">
              <option value="small">{{ t('small') }}</option>
              <option value="medium">{{ t('medium') }}</option>
              <option value="large">{{ t('large') }}</option>
            </select>
          </div>
        </div>

        <div class="settings-section">
          <h3>{{ t('workflow') }}</h3>
          <div class="setting-item">
            <label>
              <input type="checkbox" v-model="settings.autoExecuteWorkflow" @change="saveSettings"> {{ t('auto_execute_workflow') }}
            </label>
          </div>
          <div class="setting-item">
            <label>
              <input type="checkbox" v-model="settings.workflowNotification" @change="saveSettings"> {{ t('execution_complete_notification') }}
            </label>
          </div>
          <div class="setting-item">
            <label>{{ t('items_per_page') }}</label>
            <select v-model="settings.itemsPerPage" @change="changeItemsPerPage">
              <option value="2">2{{ currentLang === 'ko' ? '개' : currentLang === 'ja' ? '個' : '' }}</option>
              <option value="4">4{{ currentLang === 'ko' ? '개' : currentLang === 'ja' ? '個' : '' }}</option>
              <option value="6">6{{ currentLang === 'ko' ? '개' : currentLang === 'ja' ? '個' : '' }}</option>
            </select>
          </div>
        </div>

        <div class="settings-section">
          <h3>{{ t('notification') }}</h3>
          <div class="setting-item">
            <label>
              <input type="checkbox" v-model="settings.desktopNotification" @change="handleNotificationPermission"> {{ t('desktop_notification') }}
            </label>
          </div>
          <div class="setting-item">
            <label>
              <input type="checkbox" v-model="settings.soundNotification" @change="saveSettings"> {{ t('sound_notification') }}
            </label>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" @click="closeModal">{{ t('cancel') }}</button>
        <button class="btn-primary" @click="closeModal">{{ t('save') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { t, setLanguage, getCurrentLanguage } from '@/utils/i18n'

interface User {
  name: string
  email?: string
  loginTime?: string
}

interface Settings {
  theme: string
  language: string
  autoSaveChat: boolean
  autoScroll: boolean
  fontSize: string
  autoExecuteWorkflow: boolean
  workflowNotification: boolean
  itemsPerPage: number
  desktopNotification: boolean
  soundNotification: boolean
}

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const router = useRouter()

// 사용자 정보
const currentUser = ref<User | null>(null)

// 설정
const settings = ref<Settings>({
  theme: 'light',
  language: 'ko',
  autoSaveChat: true,
  autoScroll: true,
  fontSize: 'medium',
  autoExecuteWorkflow: false,
  workflowNotification: true,
  itemsPerPage: 4,
  desktopNotification: false,
  soundNotification: true
})

// 반응형 번역 상태
const currentLang = ref(getCurrentLanguage())

// 계산된 속성
const getUserInitial = computed(() => {
  if (currentUser.value?.name) {
    return currentUser.value.name.charAt(0).toUpperCase()
  }
  return 'U'
})

// 메소드
const closeModal = () => {
  emit('close')
}

const loadCurrentUser = () => {
  try {
    const storedUser = localStorage.getItem('current_user')
    if (storedUser) {
      currentUser.value = JSON.parse(storedUser)
    }
  } catch (error) {
    console.error('사용자 정보 로드 실패:', error)
    currentUser.value = null
  }
}

const loadSettings = () => {
  try {
    const storedSettings = localStorage.getItem('appSettings') // HTML과 동일한 키 사용
    if (storedSettings) {
      const parsed = JSON.parse(storedSettings)
      Object.assign(settings.value, parsed)
    }
  } catch (error) {
    console.error('설정 로드 실패:', error)
  }
}

const saveSettings = () => {
  localStorage.setItem('appSettings', JSON.stringify(settings.value)) // HTML과 동일한 키 사용
}

// 언어 변경 함수
const changeLanguage = (newLanguage: string) => {
  settings.value.language = newLanguage
  setLanguage(newLanguage)
  currentLang.value = newLanguage
  saveSettings()
  showDownloadAlert(t('language_changed'), 'success')
}

// 테마 적용 함수 (HTML과 완전히 동일)
const applyTheme = (theme: string) => {
  const root = document.documentElement
  
  if (theme === 'dark') {
    // 다크모드 색상 팔레트 - HTML과 완전히 동일
    root.style.setProperty('--bg-color', '#0f1419')
    root.style.setProperty('--text-color', '#e6e6e6')
    root.style.setProperty('--text-secondary', '#8b9499')
    root.style.setProperty('--border-color', '#2d3748')
    root.style.setProperty('--border-hover', '#4a5568')
    
    root.style.setProperty('--panel-bg', '#1a202c')
    root.style.setProperty('--panel-hover', '#2d3748')
    root.style.setProperty('--sidebar-bg', '#171923')
    root.style.setProperty('--header-bg', '#1a202c')
    
    root.style.setProperty('--input-bg', '#2d3748')
    root.style.setProperty('--input-border', '#4a5568')
    root.style.setProperty('--input-focus', '#68d391')
    root.style.setProperty('--shadow-focus', '0 0 0 3px rgba(104, 211, 145, 0.1)')
    
    root.style.setProperty('--btn-primary', '#68d391')
    root.style.setProperty('--btn-primary-hover', '#48bb78')
    root.style.setProperty('--btn-secondary', '#718096')
    root.style.setProperty('--btn-secondary-hover', '#a0aec0')
    
    root.style.setProperty('--message-bg-user', '#2d3748')
    root.style.setProperty('--message-bg-assistant', 'transparent')
    
    root.style.setProperty('--dropdown-bg', '#2d3748')
    root.style.setProperty('--dropdown-shadow', 'rgba(0, 0, 0, 0.4)')
    root.style.setProperty('--modal-bg', '#1a202c')
    root.style.setProperty('--modal-overlay', 'rgba(0, 0, 0, 0.8)')
    
    root.style.setProperty('--success-color', '#68d391')
    root.style.setProperty('--warning-color', '#f6ad55')
    root.style.setProperty('--error-color', '#fc8181')
    
    root.style.setProperty('--scrollbar-track', '#2d3748')
    root.style.setProperty('--scrollbar-thumb', '#4a5568')
    root.style.setProperty('--scrollbar-thumb-hover', '#718096')
    
  } else if (theme === 'system') {
    // 시스템 설정에 따라 자동 결정
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
    applyTheme(isDarkMode ? 'dark' : 'light')
    return
  } else {
    // 라이트 모드 (기본값 복원) - HTML과 완전히 동일
    root.style.setProperty('--bg-color', '#ffffff')
    root.style.setProperty('--text-color', '#000000')
    root.style.setProperty('--text-secondary', '#6b7280')
    root.style.setProperty('--border-color', '#e5e7eb')
    root.style.setProperty('--border-hover', '#d1d5db')
    
    root.style.setProperty('--panel-bg', '#ffffff')
    root.style.setProperty('--panel-hover', '#f9fafb')
    root.style.setProperty('--sidebar-bg', '#f8f9fa')
    root.style.setProperty('--header-bg', '#ffffff')
    
    root.style.setProperty('--input-bg', '#ffffff')
    root.style.setProperty('--input-border', '#d1d5db')
    root.style.setProperty('--input-focus', '#67bdc6')
    root.style.setProperty('--shadow-focus', '0 0 0 3px rgba(103, 189, 198, 0.1)')
    
    root.style.setProperty('--btn-primary', '#67bdc6')
    root.style.setProperty('--btn-primary-hover', '#5aa7b0')
    root.style.setProperty('--btn-secondary', '#6b7280')
    root.style.setProperty('--btn-secondary-hover', '#4b5563')
    
    root.style.setProperty('--message-bg-user', '#f7f7f8')
    root.style.setProperty('--message-bg-assistant', 'transparent')
    
    root.style.setProperty('--dropdown-bg', '#ffffff')
    root.style.setProperty('--dropdown-shadow', 'rgba(0, 0, 0, 0.1)')
    root.style.setProperty('--modal-bg', '#ffffff')
    root.style.setProperty('--modal-overlay', 'rgba(0, 0, 0, 0.5)')
    
    root.style.setProperty('--success-color', '#10b981')
    root.style.setProperty('--warning-color', '#f59e0b')
    root.style.setProperty('--error-color', '#ef4444')
    
    root.style.setProperty('--scrollbar-track', '#f1f1f1')
    root.style.setProperty('--scrollbar-thumb', '#c1c1c1')
    root.style.setProperty('--scrollbar-thumb-hover', '#a8a8a8')
  }
}

// 폰트 크기 적용 함수 (HTML과 동일)
const applyFontSize = (fontSize: string) => {
  const root = document.documentElement
  
  switch(fontSize) {
    case 'small':
      root.style.setProperty('--message-font-size', '14px')
      root.style.setProperty('--message-line-height', '1.4')
      break
    case 'large':
      root.style.setProperty('--message-font-size', '18px')
      root.style.setProperty('--message-line-height', '1.6')
      break
    default: // medium
      root.style.setProperty('--message-font-size', '16px')
      root.style.setProperty('--message-line-height', '1.5')
  }
}

// 알림 메시지 표시 함수
const showDownloadAlert = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
  // 간단한 알림 구현
  const alertDiv = document.createElement('div')
  alertDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    transition: all 0.3s ease;
    ${type === 'success' ? 'background: #10b981;' : 
      type === 'error' ? 'background: #ef4444;' : 
      'background: #f59e0b;'}
  `
  alertDiv.textContent = message
  document.body.appendChild(alertDiv)
  
  setTimeout(() => {
    alertDiv.style.opacity = '0'
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.parentNode.removeChild(alertDiv)
      }
    }, 300)
  }, 3000)
}

const changeTheme = (theme: string) => {
  settings.value.theme = theme
  applyTheme(theme)
  saveSettings()
  const messageKey = theme === 'light' ? 'theme_changed_light' : 
                    theme === 'dark' ? 'theme_changed_dark' : 
                    'theme_changed_system'
  showDownloadAlert(t(messageKey), 'success')
}

const changeFontSize = () => {
  applyFontSize(settings.value.fontSize)
  saveSettings()
  const messageKey = settings.value.fontSize === 'small' ? 'font_size_changed_small' :
                    settings.value.fontSize === 'large' ? 'font_size_changed_large' :
                    'font_size_changed_medium'
  showDownloadAlert(t(messageKey), 'success')
}

const changeItemsPerPage = () => {
  saveSettings()
  showDownloadAlert(t('items_per_page_changed', { count: settings.value.itemsPerPage }), 'success')
  // TODO: 실제 페이지네이션에 반영
}

const handleNotificationPermission = async () => {
  if (settings.value.desktopNotification) {
    if (!("Notification" in window)) {
      showDownloadAlert('이 브라우저는 데스크톱 알림을 지원하지 않습니다.', 'error')
      settings.value.desktopNotification = false
      return
    }

    if (Notification.permission === 'denied') {
      showDownloadAlert('알림 권한이 거부되었습니다. 브라우저 설정에서 알림을 허용해주세요.', 'warning')
      settings.value.desktopNotification = false
      return
    }

    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        showDownloadAlert('알림 권한이 거부되었습니다.', 'warning')
        settings.value.desktopNotification = false
        return
      }
    }
    
    showDownloadAlert(t('desktop_notification_enabled'), 'success')
  } else {
    showDownloadAlert(t('desktop_notification_disabled'), 'success')
  }
  saveSettings()
}

const formatDate = (date: Date): string => {
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const logout = async () => {
  if (confirm('정말로 로그아웃하시겠습니까?')) {
    try {
      // 채팅 데이터 먼저 초기화  
      const { useChatStore } = await import('@/stores/chat')
      const { useAuthStore } = await import('@/stores/auth')
      const chatStore = useChatStore()
      const authStore = useAuthStore()
      
      chatStore.clearAllData()
      // 인증 스토어 로그아웃
      await authStore.logout()
      
      currentUser.value = null
      closeModal()
      // 강제 페이지 새로고침으로 완전 초기화
      window.location.href = '/login'
    } catch (error) {
      console.error('로그아웃 실패:', error)
    }
  }
}

onMounted(() => {
  loadCurrentUser()
  loadSettings()
  // 초기 언어 설정
  setLanguage(settings.value.language)
  currentLang.value = settings.value.language
  // 초기 테마와 폰트 크기 적용
  applyTheme(settings.value.theme)
  applyFontSize(settings.value.fontSize)
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--modal-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease-out;
  backdrop-filter: blur(8px);
}

.modal-content {
  background: var(--modal-bg);
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25), 
              0 0 0 1px rgba(103, 189, 198, 0.1);
  width: 90%;
  max-width: 600px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

@keyframes modalSlideIn {
  0% { 
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  60% {
    opacity: 0.8;
    transform: translateY(-5px) scale(1.02);
  }
  100% { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  background: linear-gradient(135deg, #67bdc6 0%, #5aa7b0 50%, #4a969f 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.modal-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.modal-close-btn {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px;
  border-radius: 12px;
  cursor: pointer;
  color: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  font-size: 18px;
  font-weight: 600;
}

.modal-close-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  background: var(--modal-bg);
}

.settings-section {
  margin-bottom: 32px;
  background: var(--panel-bg);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(103, 189, 198, 0.1);
}

.settings-section:last-child {
  margin-bottom: 0;
}

.settings-section h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 8px;
}

.setting-item {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-item label {
  font-weight: 500;
  color: var(--text-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.setting-item select,
.setting-item input[type="number"] {
  padding: 8px 12px;
  border: 1px solid var(--input-border);
  border-radius: 8px;
  background: var(--input-bg);
  color: var(--text-color);
  min-width: 120px;
  transition: all 0.2s;
}

.setting-item select:focus,
.setting-item input[type="number"]:focus {
  border-color: var(--input-focus);
  box-shadow: var(--shadow-focus);
  outline: none;
}

.setting-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--btn-primary);
}

.modal-footer {
  padding: 20px 32px;
  border-top: 1px solid var(--border-color);
  background: var(--panel-hover);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-primary, .btn-secondary {
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: var(--btn-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--btn-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(103, 189, 198, 0.3);
}

.btn-secondary {
  background: var(--panel-bg);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--panel-hover);
}

/* CSS 변수들은 main.css에 이미 정의되어 있음 */
</style>
<template>
  <div class="sidebar-footer">
    <!-- 확장된 상태의 사용자 프로필 -->
    <div v-if="!collapsed" class="user-profile" @click="handleCollapsedProfile">
      <div class="user-avatar">{{ getUserInitial }}</div>
      <div class="user-name">{{ getUserName }}</div>
      <div class="user-profile-dropdown dropdown-menu" :class="{ show: showUserMenu }" @click.stop>
        <button class="dropdown-item" @click.stop="openSettings">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V6a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V12a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          {{ t('settings') }}
        </button>
        <button class="dropdown-item" @click="openHelp">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          {{ t('help') }}
        </button>
        <button class="dropdown-item" @click="logout">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          {{ t('logout') }}
        </button>
      </div>
    </div>
    
    <!-- 축소된 상태의 사용자 아바타 -->
    <div v-if="collapsed" class="collapsed-user-avatar" @click="handleCollapsedProfile">
      <div class="user-avatar">{{ getUserInitial }}</div>
    </div>
  </div>

  <!-- 설정 모달 -->
  <SettingsModal :isOpen="showSettingsModal" @close="closeSettingsModal" />
  
  <!-- 도움말 모달 -->
  <HelpModal :isOpen="showHelpModal" @close="closeHelpModal" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import SettingsModal from '../SettingsModal.vue'
import HelpModal from '../HelpModal.vue'
import { useTranslation } from '@/utils/i18n'

const props = defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits<{
  'collapsed-profile': []
}>()

const router = useRouter()
const chatStore = useChatStore()
const { t } = useTranslation()

// 상태 관리
const currentUser = ref<any>(null)
const showSettingsModal = ref(false)
const showHelpModal = ref(false)
const showUserMenu = ref(false)

// 사용자 관련 computed 속성
const getUserInitial = computed(() => {
  if (currentUser.value?.first_name) {
    return currentUser.value.first_name.charAt(0).toUpperCase()
  }
  if (currentUser.value?.name) {
    return currentUser.value.name.charAt(0).toUpperCase()
  }
  return 'U'
})

const getUserName = computed(() => {
  if (currentUser.value?.first_name && currentUser.value?.last_name) {
    return `${currentUser.value.first_name} ${currentUser.value.last_name}`
  }
  if (currentUser.value?.first_name) {
    return currentUser.value.first_name
  }
  if (currentUser.value?.name) {
    return currentUser.value.name
  }
  return t('user')
})

// 드롭다운 관련
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

// 축소된 상태에서 프로필 클릭 시
const handleCollapsedProfile = () => {
  if (props.collapsed) {
    // 축소된 상태에서는 확장하고 메뉴 표시
    emit('collapsed-profile')
    // 약간의 딜레이 후 메뉴 표시 (사이드바 확장 애니메이션 후)
    setTimeout(() => {
      showUserMenu.value = true
    }, 300)
  } else {
    // 이미 확장된 상태에서는 메뉴만 토글
    toggleUserMenu()
  }
}

// 모달 관련 함수들
const closeSettingsModal = () => {
  showSettingsModal.value = false
}

const closeHelpModal = () => {
  showHelpModal.value = false
}

// 사용자 프로필 관련 함수들
const openSettings = () => {
  showUserMenu.value = false // 드롭다운 닫기
  showSettingsModal.value = true
}

const openHelp = () => {
  showUserMenu.value = false // 드롭다운 닫기
  showHelpModal.value = true
}

const logout = async () => {
  showUserMenu.value = false // 드롭다운 닫기
  if (confirm(t('confirm_logout'))) {
    const authStore = useAuthStore()
    try {
      // 채팅 데이터 먼저 초기화
      chatStore.clearAllData()
      // 인증 스토어 로그아웃
      await authStore.logout()
      // 강제 페이지 새로고침으로 완전 초기화
      window.location.href = '/login'
    } catch (error) {
      console.error('로그아웃 실패:', error)
    }
  }
}

// 사용자 정보 로드
const loadCurrentUser = () => {
  try {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      currentUser.value = JSON.parse(storedUser)
    }
  } catch (error) {
    console.error('사용자 정보 로드 실패:', error)
    currentUser.value = null
  }
}

// 컴포넌트 마운트 시 사용자 정보 로드
onMounted(() => {
  loadCurrentUser()
})
</script>

<style scoped>
/* 사용자 프로필 영역 */
.sidebar-footer {
  position: relative;
  flex: 5;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 50px;
  max-height: 80px;
  flex-shrink: 0;
}

/* 확장된 상태의 사이드바 푸터 */
.sidebar-footer:has(.user-profile) {
  padding: 12px;
  border-top: 1px solid var(--border-color);
  background: var(--panel-bg);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}

.user-profile:hover {
  background: var(--panel-hover);
}

.user-profile-dropdown {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  margin-bottom: 8px;
  z-index: 1000;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #67bdc6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.user-name {
  font-size: 14px;
  color: var(--text-color);
  font-weight: 500;
}

/* 축소된 상태의 사용자 아바타 */
.collapsed-user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  padding: 8px;
}

.collapsed-user-avatar:hover {
  transform: scale(1.1);
}

.collapsed-user-avatar .user-avatar {
  width: 32px;
  height: 32px;
  box-shadow: 0 2px 8px rgba(103, 189, 198, 0.3);
  border: 2px solid var(--border-color);
}

/* 드롭다운 메뉴 */
.dropdown-menu {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  margin-bottom: 8px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  min-width: 130px;
  display: none;
}

.dropdown-menu.show {
  display: block;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 14px;
  color: var(--text-color);
  background: none;
  border: none;
  width: calc(100% - 8px);
  text-align: left;
  cursor: pointer;
  transition: background 0.1s;
  border-radius: 6px;
  margin: 2px 4px;
}

.dropdown-item:hover {
  background: var(--panel-hover);
}
</style>
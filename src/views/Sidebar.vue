<template>
  <div :class="['sidebar', { collapsed: collapsed }]">
    <!-- 토글 버튼 (상태에 따라 다른 버튼) -->
    <button 
      v-if="collapsed"
      class="sidebar-expand-btn" 
      @click="$emit('toggle-sidebar')" 
      :title="t('expand_sidebar')"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </button>
    <button 
      v-else
      class="sidebar-close-btn" 
      @click="$emit('toggle-sidebar')" 
      :title="t('close_sidebar')"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
    </button>

    <!-- 사이드바 컨텐츠 (항상 존재하지만 축소시 일부 숨김) -->
    <div class="sidebar-content">
      <!-- 축소된 새 채팅 버튼 (축소시만 보임) -->
      <button 
        v-if="collapsed"
        class="collapsed-new-chat-btn" 
        @click="handleCollapsedNewChat" 
        :title="t('new_chat')"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>

      <!-- 확장시만 보이는 섹션들 -->
      <transition name="fade-in" mode="out-in">
        <div v-if="!collapsed" class="expanded-sections">
          <!-- 워크플로우 섹션 -->
          <WorkflowSection 
            @new-project="$emit('new-project')"
            @select-workflow="$emit('select-workflow', $event)"
          />
          
          <!-- 채팅 섹션 -->
          <ChatSection 
            :chatHistoryItems="chatHistoryItems"
            @new-chat="handleNewChat"
            @select-chat="handleSelectChat"
          />
        </div>
      </transition>

      <!-- 사용자 프로필 (항상 존재) -->
      <SidebarFooter :collapsed="collapsed" @collapsed-profile="handleCollapsedProfile" />
    </div>
  </div>

  <!-- 설정 모달 -->
  <SettingsModal :isOpen="showSettingsModal" @close="closeSettingsModal" />
  
  <!-- 도움말 모달 -->
  <HelpModal :isOpen="showHelpModal" @close="closeHelpModal" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import WorkflowSection from '@/components/sidebar/WorkflowSection.vue'
import ChatSection from '@/components/sidebar/ChatSection.vue'
import SidebarFooter from '@/components/sidebar/SidebarFooter.vue'
import SettingsModal from '@/components/SettingsModal.vue'
import HelpModal from '@/components/HelpModal.vue'
import { useTranslation } from '@/utils/i18n'
import type { ChatHistoryItem } from '@/types'

const props = defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits<{
  'toggle-sidebar': []
  'new-project': []
  'select-workflow': [workflow: any]
}>()

const { t } = useTranslation()
const chatStore = useChatStore()

// 컴포넌트 마운트 시 세션 로드
onMounted(async () => {
  await chatStore.loadSessions()
})

// 채팅 데이터를 직접 store에서 가져오기
const chatHistoryItems = computed(() => 
  chatStore.sessions.map(session => ({
    id: session.session_id,
    title: session.title,
    active: session.active,
    messages: []
  }))
)

// 사이드바 상태 관련
const showSettingsModal = ref(false)
const showHelpModal = ref(false)

// 새 채팅 시작
const handleNewChat = () => {
  chatStore.startNewChat()
}

// 채팅 선택
const handleSelectChat = (item: ChatHistoryItem) => {
  chatStore.selectSession(item.id)
}

// 축소된 상태에서 새 채팅 버튼 클릭
const handleCollapsedNewChat = () => {
  emit('toggle-sidebar') // 사이드바 펼치기
  handleNewChat() // 새 채팅 생성
}

// 축소된 상태에서 유저 프로필 클릭
const handleCollapsedProfile = () => {
  emit('toggle-sidebar') // 사이드바 펼치기
}

// 모달 관련 함수들
const closeSettingsModal = () => {
  showSettingsModal.value = false
}

const closeHelpModal = () => {
  showHelpModal.value = false
}
</script>

<style scoped>
/* 메인 사이드바 레이아웃 */
.sidebar {
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  position: relative;
  height: 100vh;
  flex: none;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

/* 확장된 상태 */
.sidebar:not(.collapsed) {
  width: 260px;
}

/* 축소된 상태 */
.sidebar.collapsed {
  width: 52px;
}

/* 사이드바 컨텐츠 */
.sidebar-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 확장된 상태의 컨텐츠 */
.sidebar:not(.collapsed) .sidebar-content {
  align-items: stretch;
  padding: 0;
}

/* 축소된 상태의 컨텐츠 */
.sidebar.collapsed .sidebar-content {
  align-items: center;
  padding: 20px 8px;
  justify-content: space-between; /* 새 채팅과 사용자 프로필 사이에 공간 확보 */
}

.expanded-sections {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 토글 버튼들 */
.sidebar-close-btn,
.sidebar-expand-btn {
  position: absolute;
  top: 20px;
  right: -20px;
  width: 28px;
  height: 32px;
  background: var(--panel-bg);
  border: 1px solid var(--border-color);
  border-left: none;
  border-radius: 0 12px 12px 0;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 14px;
  z-index: 20;
  box-shadow: 2px 0 4px rgba(0,0,0,0.05);
}

.sidebar-close-btn:hover,
.sidebar-expand-btn:hover {
  background: var(--panel-hover);
  color: var(--text-color);
  box-shadow: 2px 0 8px rgba(0,0,0,0.1);
}

/* 축소된 새 채팅 버튼 */
.collapsed-new-chat-btn {
  width: 36px;
  height: 36px;
  background: var(--btn-primary);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(103, 189, 198, 0.3);
}

.collapsed-new-chat-btn:hover {
  background: var(--btn-primary-hover);
  transform: scale(1.05);
}

/* 페이드인 애니메이션 */
.fade-in-enter-active {
  transition: opacity 0.4s ease 0.1s; /* 0.1초 딜레이로 사이드바 너비 변경 후 시작 */
}

.fade-in-leave-active {
  transition: opacity 0.2s ease;
}

.fade-in-enter-from,
.fade-in-leave-to {
  opacity: 0;
}

.fade-in-enter-to,
.fade-in-leave-from {
  opacity: 1;
}
</style>
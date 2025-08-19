<template>
  <div class="section chat-section">
    <div class="section-header">
      <div class="section-title">{{ t('chat') }}</div>
      <button class="section-new-btn" @click="$emit('new-chat')" :title="t('new_chat')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
    </div>
    <div class="section-content">
      <ChatItem
        v-for="item in chatHistoryItems"
        :key="item.id"
        :chatItem="item"
        @select="$emit('select-chat', $event)"
        @rename="renameChatItem"
        @delete="deleteChatItem"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ChatItem from './ChatItem.vue'
import { useTranslation } from '@/utils/i18n'
import { useChatStore } from '@/stores/chat'
import type { ChatHistoryItem } from '@/types'

const props = defineProps<{
  chatHistoryItems: ChatHistoryItem[]
}>()

const emit = defineEmits<{
  'new-chat': []
  'select-chat': [item: ChatHistoryItem]
}>()

const { t } = useTranslation()
const chatStore = useChatStore()

// 채팅 아이템 이름 변경
const renameChatItem = async (item: ChatHistoryItem) => {
  const newName = prompt(t('enter_new_name', { current: item.title }), item.title)
  if (newName && newName.trim()) {
    try {
      await chatStore.updateSessionTitle(item.id, newName.trim())
    } catch (error) {
      console.error('채팅 이름 변경 실패:', error)
      alert('채팅 이름 변경에 실패했습니다.')
    }
  }
}

// 채팅 아이템 삭제
const deleteChatItem = async (itemId: string) => {
  if (confirm(t('confirm_delete'))) {
    try {
      await chatStore.deleteSession(itemId)
    } catch (error) {
      console.error('채팅 삭제 실패:', error)
      alert('채팅 삭제에 실패했습니다.')
    }
  }
}
</script>

<style scoped>
/* 섹션 스타일 */
.section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

/* 섹션 헤더 */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 12px 8px 12px;
  background: var(--sidebar-bg);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.section-new-btn {
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.section-new-btn:hover {
  background: var(--panel-hover);
  color: var(--text-color);
  transform: scale(1.1);
}

/* 섹션 콘텐츠 */
.section-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.section-content::-webkit-scrollbar {
  width: 6px;
}

.section-content::-webkit-scrollbar-track {
  background: transparent;
}

.section-content::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 3px;
}

.section-content::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}
</style>
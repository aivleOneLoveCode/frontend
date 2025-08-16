<template>
  <div 
    :class="['chat-history-item', { active: chatItem.active }]"
    @click="$emit('select', chatItem)">
    <span class="item-title">{{ chatItem.title }}</span>
    <div class="item-menu">
      <button class="item-menu-btn" @click.stop="showDropdown">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="2"/>
          <circle cx="12" cy="12" r="2"/>
          <circle cx="19" cy="12" r="2"/>
        </svg>
      </button>
      <div class="dropdown-menu" :class="{ show: showMenu }" :style="globalDropdownStyle" @click.stop>
        <button class="dropdown-item" @click="handleRename">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
            <path d="m15 5 4 4"/>
          </svg>
          {{ t('rename') }}
        </button>
        <button class="dropdown-item delete" @click="handleDelete">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18"/>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
          {{ t('delete') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTranslation } from '@/utils/i18n'
import type { ChatHistoryItem } from '@/types'
import { openDropdown, closeDropdown, isDropdownOpen, globalDropdownStyle } from '@/utils/dropdownManager'

const props = defineProps<{
  chatItem: ChatHistoryItem
}>()

const emit = defineEmits<{
  'select': [item: ChatHistoryItem]
  'rename': [item: ChatHistoryItem]
  'delete': [itemId: number]
}>()

const { t } = useTranslation()

// 전역 드롭다운 시스템 사용
const dropdownId = computed(() => `chat-${props.chatItem.id}`)
const showMenu = computed(() => isDropdownOpen(dropdownId.value))

// 드롭다운 메뉴 관련
const showDropdown = (event: Event) => {
  openDropdown(dropdownId.value, event)
}

const handleRename = () => {
  closeDropdown()
  emit('rename', props.chatItem)
}

const handleDelete = () => {
  closeDropdown()
  emit('delete', props.chatItem.id)
}
</script>

<style scoped>
/* 채팅 히스토리 아이템 */
.chat-history-item {
  padding: 10px 12px;
  margin: 2px 0;
  border-radius: 8px;
  color: var(--text-color);
  cursor: pointer;
  font-size: 14px;
  transition: background 0.1s ease;
  font-weight: 400;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: transparent;
}

.chat-history-item:hover {
  background: var(--panel-hover);
}

.chat-history-item.active {
  background: rgba(103, 189, 198, 0.1);
  font-weight: 500;
  border: 1px solid rgba(103, 189, 198, 0.3);
}

.item-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 8px;
}

/* 아이템 메뉴 */
.item-menu {
  position: relative;
}

.item-menu-btn {
  opacity: 0;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  border-radius: 4px;
  color: var(--text-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  margin-left: 8px;
  flex-shrink: 0;
}

.item-menu-btn:hover {
  background: var(--panel-hover);
  color: var(--text-color);
}

.chat-history-item:hover .item-menu-btn {
  opacity: 1;
}

/* 드롭다운 메뉴 */
.dropdown-menu {
  background: var(--dropdown-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--dropdown-shadow);
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

.dropdown-item.delete {
  color: #dc2626;
}

.dropdown-item.delete:hover {
  background: #fef2f2;
}
</style>
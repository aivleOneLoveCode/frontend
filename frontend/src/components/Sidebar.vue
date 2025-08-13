<template>
  <div :class="['sidebar', { collapsed: collapsed }]">
    <button class="sidebar-close-btn" @click="$emit('toggle-sidebar')" title="사이드바 닫기">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
    </button>
    
    <div class="sidebar-header">
      <button class="new-chat-btn" @click="$emit('new-chat')">
        <div class="new-chat-content">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          새 채팅
        </div>
        <div class="shortcut-hint">Ctrl+Shift+O</div>
      </button>
    </div>

    <div class="sidebar-content">
      <div class="workflow-section">
        <div class="section-title">워크플로우</div>
        <div class="workflow-content">
          <div class="workflow-list">
            <div v-for="item in workflowItems" 
                 :key="item.id"
                 :class="['workflow-item', { active: item.active }]"
                 @click="$emit('select-workflow', item)">
              <span class="item-title">{{ item.title }}</span>
              <div class="item-menu">
                <button class="item-menu-btn" @click="$emit('show-dropdown', item.id, 'workflow', $event)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="5" cy="12" r="2"/>
                    <circle cx="12" cy="12" r="2"/>
                    <circle cx="19" cy="12" r="2"/>
                  </svg>
                </button>
                <div class="dropdown-menu" :class="{ show: activeMenu === 'workflow-' + item.id }" @click.stop>
                  <button class="dropdown-item" @click="$emit('rename-item', item, 'workflow')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                      <path d="m15 5 4 4"/>
                    </svg>
                    이름 바꾸기
                  </button>
                  <button class="dropdown-item delete" @click="$emit('delete-item', item.id, 'workflow')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 6h18"/>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                    삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-history">
        <div class="section-title">채팅</div>
        <div class="chat-history-content">
        <div v-for="item in chatHistoryItems" 
             :key="item.id"
             :class="['chat-history-item', { active: item.active }]"
             @click="$emit('select-chat', item)">
          <span class="item-title">{{ item.title }}</span>
          <div class="item-menu">
            <button class="item-menu-btn" @click="$emit('show-dropdown', item.id, 'chat', $event)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="12" r="2"/>
                <circle cx="12" cy="12" r="2"/>
                <circle cx="19" cy="12" r="2"/>
              </svg>
            </button>
            <div class="dropdown-menu" :class="{ show: activeMenu === 'chat-' + item.id }" @click.stop>
              <button class="dropdown-item" @click="$emit('rename-item', item, 'chat')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                  <path d="m15 5 4 4"/>
                </svg>
                이름 바꾸기
              </button>
              <button class="dropdown-item delete" @click="$emit('delete-item', item.id, 'chat')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
                삭제
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>

    <div class="sidebar-footer">
      <div class="user-profile">
        <div class="user-avatar">U</div>
        <div class="user-name">사용자</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatHistoryItem, WorkflowItem } from '../types'

defineProps<{
  collapsed: boolean
  chatHistoryItems: ChatHistoryItem[]
  workflowItems: WorkflowItem[]
  activeMenu: string | null
}>()

defineEmits<{
  'toggle-sidebar': []
  'new-chat': []
  'select-chat': [item: ChatHistoryItem]
  'select-workflow': [item: WorkflowItem]
  'show-dropdown': [itemId: number, type: string, event: Event]
  'rename-item': [item: ChatHistoryItem | WorkflowItem, type: string]
  'delete-item': [itemId: number, type: string]
}>()
</script>

<style scoped>
.sidebar {
  width: 260px;
  background: #f7f7f8;
  border-right: 1px solid #e1e3e6;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: transform 0.3s ease;
}

.sidebar.collapsed {
  transform: translateX(-100%);
}

.sidebar-close-btn {
  position: absolute;
  top: 20px;
  right: -20px;
  width: 28px;
  height: 32px;
  background: #f7f7f8;
  border: 1px solid #e1e3e6;
  border-left: none;
  border-radius: 0 12px 12px 0;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 14px;
  z-index: 20;
  box-shadow: 2px 0 4px rgba(0,0,0,0.05);
}

.sidebar-close-btn:hover {
  background: #e5e7eb;
  color: #374151;
  box-shadow: 2px 0 8px rgba(0,0,0,0.1);
}

.sidebar-header {
  padding: 12px;
  border-bottom: none;
  flex-shrink: 0;
}

.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.new-chat-btn {
  width: 100%;
  padding: 10px 12px;
  margin: 2px 0;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  font-weight: 400;
  transition: background 0.1s ease;
  position: relative;
}

.new-chat-btn:hover {
  background: #e5e7eb;
}

.new-chat-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.shortcut-hint {
  opacity: 0;
  font-size: 12px;
  color: #6b7280;
  transition: opacity 0.2s;
}

.new-chat-btn:hover .shortcut-hint {
  opacity: 1;
}

.section-title {
  padding: 8px 12px;
  margin: 0;
  font-size: 14px;
  font-weight: 400;
  color: #9ca3af;
  background: #f7f7f8;
  flex-shrink: 0;
}

.workflow-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px 12px 0 12px;
  min-height: 0;
  margin-bottom: 0;
}

.workflow-content {
  flex: 1;
  overflow-y: auto;
  padding-top: 0;
  padding-bottom: 8px;
}

.workflow-content::-webkit-scrollbar {
  width: 6px;
}

.workflow-content::-webkit-scrollbar-track {
  background: transparent;
}

.workflow-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.workflow-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.workflow-list {
  margin-top: 0;
  margin-bottom: 0;
}

.chat-history {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 12px 12px 12px;
  min-height: 0;
  margin-top: 0;
}

.chat-history-content {
  flex: 1;
  overflow-y: auto;
  padding-top: 0;
}

.chat-history-content::-webkit-scrollbar {
  width: 6px;
}

.chat-history-content::-webkit-scrollbar-track {
  background: transparent;
}

.chat-history-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.chat-history-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.chat-history-item, .workflow-item {
  padding: 10px 12px;
  margin: 2px 0;
  border-radius: 8px;
  color: #374151;
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
}

.item-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-menu-btn {
  opacity: 0;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  border-radius: 4px;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  margin-left: 8px;
  flex-shrink: 0;
}

.item-menu-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.chat-history-item:hover .item-menu-btn,
.workflow-item:hover .item-menu-btn {
  opacity: 1;
}

.chat-history-item:hover,
.workflow-item:hover {
  background: #e5e7eb;
}

.chat-history-item.active,
.workflow-item.active {
  background: #e5e7eb;
  font-weight: 500;
}

.item-menu {
  position: relative;
}

.dropdown-menu {
  position: fixed;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
  color: #374151;
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
  background: #f3f4f6;
}

.dropdown-item.delete {
  color: #dc2626;
}

.dropdown-item.delete:hover {
  background: #fef2f2;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid #e1e3e6;
  flex-shrink: 0;
  margin-top: auto;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.user-profile:hover {
  background: #e5e7eb;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #10a37f;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.user-name {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}
</style>
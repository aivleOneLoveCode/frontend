<template>
  <div class="header-buttons">
    <!-- 백엔드 연결 상태 -->
    <div :class="['backend-status', isConnected ? 'connected' : 'disconnected']">
      <span class="status-dot"></span>
      <span class="status-text">{{ backendStatus }}</span>
      <button v-if="!isConnected" class="retry-btn" @click="$emit('retry-connection')" :title="t('retry_connection')">
        ↻
      </button>
    </div>
    <button class="header-btn-icon" @click="$emit('go-to-board')" :title="t('go_to_board')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="9" y1="9" x2="15" y2="9"/>
        <line x1="9" y1="13" x2="15" y2="13"/>
        <line x1="9" y1="17" x2="13" y2="17"/>
      </svg>
    </button>
    <button v-if="!isAuthenticated" class="header-btn-icon primary" @click="$emit('go-to-login')" :title="t('login_signup')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    </button>
    <button v-else class="header-btn-icon logout" @click="$emit('logout')" :title="t('logout')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16,17 21,12 16,7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useTranslation } from '@/utils/i18n'

defineProps<{
  isConnected?: boolean
  backendStatus?: string
  isAuthenticated?: boolean
}>()

defineEmits<{
  'go-to-board': []
  'go-to-login': []
  'logout': []
  'retry-connection': []
}>()

const { t } = useTranslation()
</script>

<style scoped>
.header-buttons {
  position: absolute;
  top: 12px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 10;
}

.header-btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.header-btn-icon:hover {
  background: #f3f4f6;
  color: #374151;
}

.header-btn-icon.primary {
  background: #67bdc6;
  color: white;
}

.header-btn-icon.primary:hover {
  background: #5aa7b0;
}

.header-btn-icon.logout {
  background: transparent;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.header-btn-icon.logout:hover {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}

/* 백엔드 연결 상태 */
.backend-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid;
  transition: all 0.2s;
}

.backend-status.connected {
  background: #d1fae5;
  border-color: #10b981;
  color: #065f46;
}

.backend-status.disconnected {
  background: #fef2f2;
  border-color: #f87171;
  color: #991b1b;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.backend-status.connected .status-dot {
  background: #10b981;
  animation: pulse 2s infinite;
}

.backend-status.disconnected .status-dot {
  background: #ef4444;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.retry-btn {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 16px;
  padding: 2px;
  border-radius: 4px;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.header-btn-icon:hover::after {
  content: attr(title);
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 12px;
  font-weight: normal;
  border-radius: 4px;
  white-space: nowrap;
  z-index: 1000;
  animation: fadeIn 0.2s ease-in-out;
}

.header-btn-icon:hover::before {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 2px;
  border: 4px solid transparent;
  border-bottom-color: rgba(0, 0, 0, 0.8);
  z-index: 1001;
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
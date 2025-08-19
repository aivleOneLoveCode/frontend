<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content help-modal" @click.stop>
      <div class="modal-header">
        <h2>{{ t('help') }}</h2>
        <button class="modal-close-btn" @click="closeModal">×</button>
      </div>
      <div class="modal-body">
        <div class="help-section">
          <h3>🚀 {{ t('help_getting_started') }}</h3>
          <p>{{ t('help_getting_started_content') }}</p>
        </div>

        <div class="help-section">
          <h3>💬 {{ t('help_chat_usage') }}</h3>
          <ul>
            <li v-for="(item, index) in tList('help_chat_usage_content')" :key="index" v-html="item"></li>
          </ul>
        </div>

        <div class="help-section">
          <h3>📁 {{ t('help_folder_management') }}</h3>
          <ul>
            <li v-for="(item, index) in tList('help_folder_management_content')" :key="index" v-html="item"></li>
          </ul>
        </div>

        <div class="help-section">
          <h3>⚙️ {{ t('help_workflow_management') }}</h3>
          <ul>
            <li v-for="(item, index) in tList('help_workflow_management_content')" :key="index" v-html="item"></li>
          </ul>
        </div>

        <div class="help-section">
          <h3>⌨️ {{ t('help_shortcuts') }}</h3>
          <ul>
            <li v-for="(item, index) in tList('help_shortcuts_content')" :key="index" v-html="item"></li>
          </ul>
        </div>

        <div class="help-section">
          <h3>🔧 {{ t('help_troubleshooting') }}</h3>
          <ul>
            <li v-for="(item, index) in tList('help_troubleshooting_content')" :key="index" v-html="item"></li>
          </ul>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-primary" @click="closeModal">{{ t('confirm') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTranslation } from '@/utils/i18n'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const { t, tList } = useTranslation()

const closeModal = () => {
  emit('close')
}
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

.modal-content.help-modal {
  background: var(--modal-bg);
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25), 
              0 0 0 1px rgba(103, 189, 198, 0.1);
  width: 90%;
  max-width: 700px;
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
  line-height: 1.6;
}

.help-section {
  margin-bottom: 32px;
  background: var(--panel-bg);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(103, 189, 198, 0.1);
}

.help-section:last-child {
  margin-bottom: 0;
}

.help-section h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 8px;
}

.help-section p {
  margin: 0 0 12px 0;
  line-height: 1.6;
  color: var(--text-secondary);
}

.help-section ul {
  margin: 0;
  padding-left: 20px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.help-section li {
  margin-bottom: 8px;
}

.help-section strong {
  color: var(--btn-primary);
  font-weight: 600;
  background: var(--panel-hover);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.modal-footer {
  padding: 20px 32px;
  border-top: 1px solid var(--border-color);
  background: var(--panel-hover);
  display: flex;
  justify-content: center;
}

.btn-primary {
  padding: 12px 32px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background: var(--btn-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--btn-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(103, 189, 198, 0.3);
}
</style>
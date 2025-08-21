<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2>이용 약관</h2>
        <button class="close-button" @click="closeModal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- 개인정보 처리방침 내용 -->
        <div class="privacy-content">
          <h3>개인정보 수집 및 이용에 관한 사항</h3>
          
          <div class="privacy-section">
            <h4>1. 개인정보 수집 목적</h4>
            <p>• 회원가입 및 서비스 이용</p>
            <p>• 본인 확인 및 인증</p>
            <p>• 고객 상담 및 지원</p>
          </div>

          <div class="privacy-section">
            <h4>2. 수집하는 개인정보 항목</h4>
            <p>• 필수: 이메일, 이름, 비밀번호</p>
            <p>• 선택: 마케팅 수신 동의, 분석 데이터 수집 동의</p>
          </div>

          <div class="privacy-section">
            <h4>3. 개인정보 보유 및 이용기간</h4>
            <p>• 회원 탈퇴 시까지 보유</p>
            <p>• 관련 법령에 따른 보존 의무 기간이 있는 경우 해당 기간까지 보유</p>
          </div>
        </div>

        <!-- 동의 관리 섹션 -->
        <div class="consent-management">
          <h3>동의 설정 관리</h3>
          
          <div class="consent-item required">
            <div class="consent-info">
              <span class="consent-title">개인정보 수집 및 이용 (필수)</span>
              <span class="consent-description">서비스 이용을 위한 필수 개인정보 수집</span>
            </div>
            <div class="consent-status">
              <span class="status-badge required">필수 동의됨</span>
            </div>
          </div>

          <div class="consent-item">
            <div class="consent-info">
              <span class="consent-title">마케팅 정보 수신 (선택)</span>
              <span class="consent-description">이벤트, 프로모션 등 마케팅 정보 수신</span>
            </div>
            <div class="consent-toggle">
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="localConsents.marketing_consent"
                >
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div class="consent-item">
            <div class="consent-info">
              <span class="consent-title">서비스 이용 분석 (선택)</span>
              <span class="consent-description">서비스 개선을 위한 이용 데이터 분석</span>
            </div>
            <div class="consent-toggle">
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="localConsents.analytics_consent"
                >
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="closeModal">취소</button>
        <button class="btn-primary" @click="updateConsents">변경사항 저장</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface ConsentData {
  marketing_consent: boolean
  analytics_consent: boolean
}

const props = defineProps<{
  isOpen: boolean
  currentConsents: ConsentData
}>()

const emit = defineEmits<{
  close: []
  confirm: [ConsentData]
}>()

const localConsents = ref<ConsentData>({
  marketing_consent: false,
  analytics_consent: false
})

// props 변경 시 로컬 상태 동기화
watch(() => props.currentConsents, (newConsents) => {
  localConsents.value = { ...newConsents }
}, { immediate: true })

const closeModal = () => {
  emit('close')
}

const updateConsents = () => {
  emit('confirm', localConsents.value)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal-container {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.close-button:hover {
  background: #f5f5f5;
}

.modal-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.privacy-content {
  margin-bottom: 32px;
}

.privacy-content h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.privacy-section {
  margin-bottom: 20px;
}

.privacy-section h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #555;
}

.privacy-section p {
  margin: 4px 0;
  color: #666;
  line-height: 1.5;
}

.consent-management {
  border-top: 1px solid #e0e0e0;
  padding-top: 24px;
}

.consent-management h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.consent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 12px;
}

.consent-item.required {
  background: #f8f9fa;
  border-color: #dee2e6;
}

.consent-info {
  flex: 1;
}

.consent-title {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.consent-description {
  display: block;
  font-size: 14px;
  color: #666;
}

.consent-status {
  margin-left: 16px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.required {
  background: #e3f2fd;
  color: #1976d2;
}

.consent-toggle {
  margin-left: 16px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.2s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.2s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #67bdc6;
}

input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e0e0e0;
}

.btn-secondary, .btn-primary {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background: #f5f5f5;
  color: #666;
}

.btn-secondary:hover {
  background: #e9e9e9;
}

.btn-primary {
  background: #67bdc6;
  color: white;
}

.btn-primary:hover {
  background: #5aa9b3;
}
</style>
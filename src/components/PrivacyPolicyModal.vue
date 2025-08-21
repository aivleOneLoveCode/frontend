<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>개인정보 수집 및 이용 동의</h2>
        <button class="close-btn" @click="closeModal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="modal-body">
        <!-- 전체 동의 섹션 -->
        <div class="all-consent-section">
          <div class="all-consent-item">
            <label class="checkbox-label all-consent-label">
              <input 
                type="checkbox" 
                v-model="allConsent"
                @change="handleAllConsent"
                class="consent-checkbox"
              >
              <span class="checkmark main-checkmark"></span>
              <span class="consent-text">
                <strong>이용약관에 모두 동의합니다</strong>
                <small>필수 및 선택 항목 모두 동의</small>
              </span>
            </label>
          </div>
        </div>

        <div class="privacy-section">
          <h3>📋 필수 항목</h3>
          
          <div class="info-table">
            <table>
              <thead>
                <tr>
                  <th>수집항목</th>
                  <th>수집목적</th>
                  <th>보유기간</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>이름, 이메일</td>
                  <td>회원가입, 서비스 이용, 고객지원</td>
                  <td>회원탈퇴 시까지</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="consent-item">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="requiredConsent"
                class="consent-checkbox"
              >
              <span class="checkmark"></span>
              개인정보 수집 및 이용에 동의합니다 (필수)
            </label>
          </div>
        </div>

        <div class="privacy-section">
          <h3>⚙️ 선택 항목</h3>
          
          <div class="info-table">
            <table>
              <thead>
                <tr>
                  <th>수집항목</th>
                  <th>수집목적</th>
                  <th>보유기간</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>이메일</td>
                  <td>이벤트, 프로모션, 서비스 안내</td>
                  <td>동의철회 시까지</td>
                </tr>
                <tr>
                  <td>서비스 이용 기록</td>
                  <td>서비스 개선, 사용성 분석</td>
                  <td>수집일로부터 1년</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="consent-item">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="marketingConsent"
                class="consent-checkbox"
              >
              <span class="checkmark"></span>
              이벤트 및 광고성 정보 수신 동의 (선택)
            </label>
          </div>
          
          <div class="consent-item">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="analyticsConsent"
                class="consent-checkbox"
              >
              <span class="checkmark"></span>
              서비스 이용 통계 및 분석 정보 제공 동의 (선택)
            </label>
          </div>
        </div>

        <div class="privacy-section">
          <h3>ℹ️ 개인정보 처리 안내</h3>
          <div class="info-box">
            <ul>
              <li>수집된 개인정보는 명시된 목적 외에는 사용되지 않습니다.</li>
              <li>필수 항목에 동의하지 않으시면 회원가입이 제한됩니다.</li>
              <li>선택 항목에 동의하지 않아도 서비스 이용에는 제한이 없습니다.</li>
              <li>개인정보 수집 및 이용 동의는 언제든지 철회할 수 있습니다.</li>
              <li>개인정보보호법에 따라 개인정보를 안전하게 관리합니다.</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <div class="button-group">
          <button 
            class="btn-confirm" 
            @click="confirmConsent"
            :disabled="!requiredConsent"
          >
            {{ requiredConsent ? '동의하고 계속' : '필수 동의가 필요합니다' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  isOpen: boolean
  currentConsents?: {
    required: boolean
    marketing: boolean
    analytics: boolean
  }
}>()

const emit = defineEmits<{
  close: []
  confirm: [consents: {
    required: boolean
    marketing: boolean
    analytics: boolean
  }]
}>()

const requiredConsent = ref(false)
const marketingConsent = ref(false)
const analyticsConsent = ref(false)


const allConsent = computed({
  get: () => requiredConsent.value && marketingConsent.value && analyticsConsent.value,
  set: (value: boolean) => {
    // setter는 handleAllConsent에서 처리
  }
})

function handleAllConsent() {
  const isAllChecked = allConsent.value
  if (!isAllChecked) {
    // 전체 동의 활성화
    requiredConsent.value = true
    marketingConsent.value = true
    analyticsConsent.value = true
  } else {
    // 전체 동의 해제 시 모든 항목 해제
    requiredConsent.value = false
    marketingConsent.value = false
    analyticsConsent.value = false
  }
}

function closeModal() {
  // 취소 시에도 현재 상태를 적용
  emit('confirm', {
    required: requiredConsent.value,
    marketing: marketingConsent.value,
    analytics: analyticsConsent.value
  })
  emit('close')
}

function handleCancel() {
  // 취소 버튼도 현재 상태를 적용
  emit('confirm', {
    required: requiredConsent.value,
    marketing: marketingConsent.value,
    analytics: analyticsConsent.value
  })
  emit('close')
}

function confirmConsent() {
  if (!requiredConsent.value) {
    alert('필수 항목에 동의해주세요.')
    return
  }
  
  emit('confirm', {
    required: requiredConsent.value,
    marketing: marketingConsent.value,
    analytics: analyticsConsent.value
  })
  
  // 동의 확인 시에는 원래 상태로 되돌리지 않음
  emit('close')
}

// 모달이 열릴 때 현재 동의 상태로 초기화
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    if (props.currentConsents) {
      requiredConsent.value = props.currentConsents.required
      marketingConsent.value = props.currentConsents.marketing
      analyticsConsent.value = props.currentConsents.analytics
    } else {
      requiredConsent.value = false
      marketingConsent.value = false
      analyticsConsent.value = false
    }
  }
})

// 개별 체크박스 상태 변경 시 전체 동의 상태 업데이트
watch([requiredConsent, marketingConsent, analyticsConsent], () => {
  // 전체 동의 체크박스는 computed로 자동 업데이트됨
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: #f3f4f6;
  border: none;
  width: 36px;
  height: 36px;
  cursor: pointer;
  color: #6b7280;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.close-btn:hover {
  background-color: #e5e7eb;
  color: #374151;
  transform: scale(1.05);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.modal-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.privacy-section {
  margin-bottom: 32px;
}

.privacy-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.info-table {
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.info-table table {
  width: 100%;
  border-collapse: collapse;
}

.info-table th {
  background-color: #f9fafb;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  text-align: left;
}

.info-table td {
  padding: 12px 16px;
  font-size: 14px;
  color: #6b7280;
  border-top: 1px solid #e5e7eb;
}

.consent-item {
  margin-bottom: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 0;
  font-size: 14px;
  color: #374151;
}

.consent-checkbox {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  margin-right: 12px;
  position: relative;
  transition: all 0.2s;
  flex-shrink: 0;
}

.consent-checkbox:checked + .checkmark {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.consent-checkbox:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.info-box {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
}

.info-box ul {
  margin: 0;
  padding-left: 20px;
}

.info-box li {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 6px;
  line-height: 1.5;
}

.all-consent-section {
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border: 2px solid #e2e8f0;
  border-radius: 12px;
}

.all-consent-item {
  margin: 0;
}

.all-consent-label {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  align-items: flex-start;
}

.main-checkmark {
  width: 24px;
  height: 24px;
  border-width: 2px;
  border-color: #3b82f6;
  margin-top: 2px;
}

.consent-checkbox:checked + .main-checkmark {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.consent-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.consent-text strong {
  color: #1e293b;
  font-size: 16px;
}

.consent-text small {
  color: #64748b;
  font-size: 13px;
  font-weight: 400;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.button-group {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-confirm {
  width: 100%;
  padding: 16px 24px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-height: 52px;
}

.btn-confirm {
  background: linear-gradient(135deg, #67bdc6, #5aa7b0);
  color: white;
  box-shadow: 0 2px 8px rgba(103, 189, 198, 0.3);
}

.btn-confirm:hover:not(:disabled) {
  background: linear-gradient(135deg, #5aa7b0, #4a9299);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(103, 189, 198, 0.4);
}

.btn-confirm:disabled {
  background: #e2e8f0;
  color: #94a3b8;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

@media (max-width: 768px) {
  .modal-content {
    margin: 10px;
    max-height: 95vh;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }
  
  .info-table th,
  .info-table td {
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .all-consent-section {
    padding: 16px;
    margin-bottom: 16px;
  }

  .all-consent-label {
    font-size: 15px;
  }

  .consent-text strong {
    font-size: 15px;
  }

  .btn-confirm {
    min-height: 48px;
    font-size: 15px;
    padding: 14px 20px;
  }
}
</style>
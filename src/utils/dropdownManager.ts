import { ref } from 'vue'

// 전역 드롭다운 상태
export const globalActiveDropdown = ref<string | null>(null)
export const globalDropdownStyle = ref({})

// 드롭다운 관리 함수들
export function openDropdown(id: string, event: Event) {
  // 이벤트 전파 방지
  event.stopPropagation()
  
  // 같은 드롭다운을 다시 클릭하면 닫기
  if (globalActiveDropdown.value === id) {
    closeDropdown()
    return
  }
  
  // 다른 드롭다운 열기
  globalActiveDropdown.value = id
  
  // 버튼의 위치 계산
  const button = event.target as HTMLElement
  const rect = button.getBoundingClientRect()
  
  // 드롭다운을 버튼 우측에 배치
  globalDropdownStyle.value = {
    position: 'fixed',
    top: rect.top + 'px',
    left: (rect.right + 5) + 'px', // 5px 간격
    zIndex: 99999
  }
}

export function closeDropdown() {
  globalActiveDropdown.value = null
  globalDropdownStyle.value = {}
}

export function isDropdownOpen(id: string): boolean {
  return globalActiveDropdown.value === id
}

// 전역 클릭 리스너 설정
let globalClickListenerAdded = false

function handleGlobalClick(event: Event) {
  const target = event.target as HTMLElement
  
  // 드롭다운 메뉴 내부 클릭인지 확인
  if (target.closest('.dropdown-menu')) {
    return
  }
  
  // 드롭다운 버튼 클릭인지 확인
  if (target.closest('.item-menu-btn')) {
    return
  }
  
  // 그 외의 경우 드롭다운 닫기
  closeDropdown()
}

export function initDropdownManager() {
  if (!globalClickListenerAdded) {
    document.addEventListener('click', handleGlobalClick)
    globalClickListenerAdded = true
  }
}

export function destroyDropdownManager() {
  if (globalClickListenerAdded) {
    document.removeEventListener('click', handleGlobalClick)
    globalClickListenerAdded = false
  }
}

// 자동 초기화
if (typeof window !== 'undefined') {
  initDropdownManager()
}
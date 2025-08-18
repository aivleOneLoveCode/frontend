import { ref } from 'vue'
import type { WorkflowItem } from '../types'

// 워크플로우 인터페이스 (폴더용) - 백엔드 스키마 호환
interface FolderWorkflow {
  n8n_workflow_id: string
  user_id: number
  project_id: number | null
  name: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
  active: boolean
  isRunning?: boolean
  description?: string
  n8nUrl?: string
  jsonData?: any
}

// 전역 선택된 워크플로우 상태
export const globalSelectedWorkflow = ref<WorkflowItem | FolderWorkflow | null>(null)
export const globalWorkflowPanelOpen = ref(false)

// 워크플로우 선택을 위한 전역 함수
export function selectWorkflowGlobally(workflow: WorkflowItem | FolderWorkflow) {
  // 이미 선택된 워크플로우를 다시 클릭하면 해제
  if (globalSelectedWorkflow.value?.n8n_workflow_id === workflow.n8n_workflow_id) {
    closeWorkflowPanelGlobally()
    return
  }
  
  // 기존 선택 초기화를 위한 이벤트 발생
  clearAllWorkflowSelections()
  
  // 선택된 워크플로우 active 상태 설정
  workflow.active = true
  
  // 전역 상태 업데이트
  globalSelectedWorkflow.value = workflow
  globalWorkflowPanelOpen.value = true
}

// 모든 워크플로우 선택 초기화를 위한 이벤트 시스템
const selectionClearCallbacks: (() => void)[] = []

export function registerSelectionClearCallback(callback: () => void) {
  selectionClearCallbacks.push(callback)
}

export function clearAllWorkflowSelections() {
  selectionClearCallbacks.forEach(callback => callback())
}

export function closeWorkflowPanelGlobally() {
  globalWorkflowPanelOpen.value = false
  globalSelectedWorkflow.value = null
  clearAllWorkflowSelections()
}

// 앱 초기화시 호출할 함수
export function initializeWorkflowSelection() {
  globalWorkflowPanelOpen.value = false
  globalSelectedWorkflow.value = null
  clearAllWorkflowSelections()
}
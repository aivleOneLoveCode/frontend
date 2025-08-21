import { ref, onMounted } from 'vue'
import type { WorkflowItem } from '../types'
import { registerSelectionClearCallback } from '../utils/workflowSelection'
export function useWorkflowManagement() {
  const workflowPanelOpen = ref(false)
  const selectedWorkflow = ref<WorkflowItem | null>(null)
  // 화면 크기에 따른 기본 패널 너비 계산
  const getDefaultPanelWidth = () => {
    const screenWidth = window.innerWidth
    
    if (screenWidth < 768) {
      // 모바일: 화면의 90% (최소 300px)
      return Math.max(screenWidth * 0.9, 300)
    } else if (screenWidth < 1024) {
      // 태블릿: 화면의 60% (최소 400px, 최대 600px)
      return Math.min(Math.max(screenWidth * 0.6, 400), 600)
    } else if (screenWidth < 1440) {
      // 작은 데스크톱: 화면의 45% (최소 500px, 최대 700px)
      return Math.min(Math.max(screenWidth * 0.45, 500), 700)
    } else {
      // 큰 데스크톱: 화면의 40% (최소 600px, 최대 1000px)
      return Math.min(Math.max(screenWidth * 0.4, 600), 1000)
    }
  }

  const workflowPanelWidth = ref(getDefaultPanelWidth())
  const isResizing = ref(false)

  const workflowItems = ref<WorkflowItem[]>([

  ])

  const selectWorkflow = async (selectedItem: WorkflowItem) => {
    selectedWorkflow.value = selectedItem
    workflowPanelOpen.value = true
  }

  const clearLocalSelections = () => {
    workflowItems.value.forEach(item => item.active = false)
  }

  onMounted(() => {
    registerSelectionClearCallback(clearLocalSelections)
  })

  const closeWorkflowPanel = () => {
    workflowPanelOpen.value = false
    selectedWorkflow.value = null
  }

  const startResize = (event: MouseEvent) => {
    isResizing.value = true
    const startX = event.clientX
    const startWidth = workflowPanelWidth.value

    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing.value) {
        const deltaX = startX - e.clientX
        const screenWidth = window.innerWidth
        
        // 화면 크기에 따른 동적 최소/최대값
        const minWidth = screenWidth < 768 ? 250 : 350
        const maxWidth = Math.min(screenWidth * 0.8, 1200) // 화면의 80% 또는 1200px 중 작은 값
        
        const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + deltaX))
        workflowPanelWidth.value = newWidth
      }
    }

    const handleMouseUp = () => {
      isResizing.value = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const addWorkflow = (name: string, jsonData: any) => {
    const newWorkflow: WorkflowItem = {
      workflow_id: `wf_${Date.now()}`,
      user_id: '1',
      project_id: null,
      name: name,
      status: 'inactive',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      active: false,
      jsonData: jsonData,
      isCustom: true
    }
    
    workflowItems.value.unshift(newWorkflow)
  }

  const downloadJsonFile = () => {
    const customWorkflows = workflowItems.value.filter(item => item.isCustom && item.jsonData)
    
    if (customWorkflows.length === 0) {
      alert('다운로드할 JSON 파일이 없습니다. 먼저 워크플로우를 생성해주세요.')
      return
    }
    
    const latestWorkflow = customWorkflows[0]
    const jsonContent = JSON.stringify(latestWorkflow.jsonData, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `${latestWorkflow.name}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return {
    workflowItems,
    workflowPanelOpen,
    selectedWorkflow,
    workflowPanelWidth,
    isResizing,
    selectWorkflow,
    closeWorkflowPanel,
    startResize,
    addWorkflow,
    downloadJsonFile
  }
}
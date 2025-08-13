import { ref } from 'vue'
import type { WorkflowItem } from '../types'

export function useWorkflowManagement() {
  const workflowPanelOpen = ref(false)
  const selectedWorkflow = ref<WorkflowItem | null>(null)
  const workflowPanelWidth = ref(400)
  const isResizing = ref(false)

  const workflowItems = ref<WorkflowItem[]>([
    { 
      id: 1, 
      title: '데이터 분석 워크플로우', 
      active: false,
      description: '데이터를 수집, 정제, 분석하여 인사이트를 도출하는 워크플로우입니다.',
      n8nUrl: 'https://n8n.example.com/workflow/data-analysis',
      jsonData: {
        "name": "데이터 분석 워크플로우",
        "nodes": [
          {"id": "1", "name": "데이터 수집", "type": "HTTP Request"},
          {"id": "2", "name": "데이터 정제", "type": "Code"},
          {"id": "3", "name": "분석 결과", "type": "Webhook"}
        ]
      }
    },
    { 
      id: 2, 
      title: '이미지 처리 워크플로우', 
      active: false,
      description: '이미지를 업로드하고 다양한 필터와 변환을 적용하는 워크플로우입니다.',
      n8nUrl: 'https://n8n.example.com/workflow/image-processing'
    },
    { 
      id: 3, 
      title: 'API 데이터 연동', 
      active: false,
      description: '외부 API에서 데이터를 가져와 내부 시스템과 연동하는 워크플로우입니다.'
    },
    { 
      id: 4, 
      title: '머신러닝 모델 학습', 
      active: false,
      description: '데이터를 기반으로 머신러닝 모델을 학습시키고 배포하는 워크플로우입니다.',
      n8nUrl: 'https://n8n.example.com/workflow/ml-training'
    },
    { 
      id: 5, 
      title: '자동화 업무 수행', 
      active: false,
      description: '반복적인 업무를 자동화하여 효율성을 높이는 워크플로우입니다.'
    },
    { 
      id: 6, 
      title: '리포트 생성 워크플로우', 
      active: false,
      description: '데이터를 기반으로 정기 리포트를 자동 생성하는 워크플로우입니다.',
      n8nUrl: 'https://n8n.example.com/workflow/report-generation'
    },
    {
      id: 7,
      title: '이메일 자동 발송',
      active: false,
      description: '조건에 따라 이메일을 자동으로 발송하는 워크플로우입니다.',
      n8nUrl: 'https://n8n.example.com/workflow/email-automation',
      jsonData: {
        "name": "이메일 자동 발송",
        "nodes": [
          {"id": "1", "name": "조건 확인", "type": "IF"},
          {"id": "2", "name": "이메일 발송", "type": "Email Send"},
          {"id": "3", "name": "로그 기록", "type": "HTTP Request"}
        ]
      }
    },
    {
      id: 8,
      title: '소셜미디어 모니터링',
      active: false,
      description: '소셜미디어 플랫폼을 모니터링하여 키워드를 추적하는 워크플로우입니다.',
      n8nUrl: 'https://n8n.example.com/workflow/social-monitoring'
    },
    {
      id: 9,
      title: '파일 백업 자동화',
      active: false,
      description: '중요한 파일들을 자동으로 클라우드에 백업하는 워크플로우입니다.',
      jsonData: {
        "name": "파일 백업 자동화",
        "nodes": [
          {"id": "1", "name": "파일 감지", "type": "Watch Files"},
          {"id": "2", "name": "압축", "type": "Compression"},
          {"id": "3", "name": "클라우드 업로드", "type": "Google Drive"}
        ]
      }
    },
    {
      id: 10,
      title: '고객 지원 티켓 관리',
      active: false,
      description: '고객 지원 티켓을 자동으로 분류하고 담당자에게 할당하는 워크플로우입니다.',
      n8nUrl: 'https://n8n.example.com/workflow/ticket-management'
    },
    {
      id: 11,
      title: '재고 관리 알림',
      active: false,
      description: '재고 수준을 모니터링하고 부족할 때 알림을 보내는 워크플로우입니다.',
      jsonData: {
        "name": "재고 관리 알림",
        "nodes": [
          {"id": "1", "name": "재고 조회", "type": "Database"},
          {"id": "2", "name": "재고 확인", "type": "IF"},
          {"id": "3", "name": "슬랙 알림", "type": "Slack"},
          {"id": "4", "name": "발주 요청", "type": "HTTP Request"}
        ]
      }
    }
  ])

  const selectWorkflow = (selectedItem: WorkflowItem) => {
    workflowItems.value.forEach(item => item.active = false)
    selectedItem.active = true
    
    selectedWorkflow.value = selectedItem
    workflowPanelOpen.value = true
    
    console.log('워크플로우 선택됨:', selectedItem.title)
  }

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
        const newWidth = Math.max(300, Math.min(800, startWidth + deltaX))
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

  const addWorkflow = (title: string, jsonData: any) => {
    const newWorkflow: WorkflowItem = {
      id: Date.now(),
      title: title,
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
    link.download = `${latestWorkflow.title}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    console.log(`"${latestWorkflow.title}.json" 파일이 다운로드되었습니다.`)
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
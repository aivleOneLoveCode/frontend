import { ref, onMounted } from 'vue'
import type { WorkflowItem } from '../types'
import { selectWorkflowGlobally, registerSelectionClearCallback, globalSelectedWorkflow, globalWorkflowPanelOpen } from '../utils/workflowSelection'

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
    { 
      n8n_workflow_id: 'wf_1001',
      user_id: 1,
      project_id: null,
      name: '데이터 분석 워크플로우',
      status: 'inactive',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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
      n8n_workflow_id: 'wf_1002',
      user_id: 1,
      project_id: null,
      name: '이미지 처리 워크플로우',
      status: 'inactive',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      active: false,
      description: '이미지를 업로드하고 다양한 필터와 변환을 적용하는 워크플로우입니다.',
      n8nUrl: 'https://n8n.example.com/workflow/image-processing'
    },
    { 
      n8n_workflow_id: 'wf_1003',
      user_id: 1,
      project_id: null,
      name: 'API 데이터 연동',
      status: 'inactive',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      active: false,
      description: '외부 API에서 데이터를 가져와 내부 시스템과 연동하는 워크플로우입니다.'
    },
    { 
      n8n_workflow_id: 'wf_1004',
      user_id: 1,
      project_id: null,
      name: '머신러닝 모델 학습',
      status: 'inactive',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      active: false,
      description: '데이터를 기반으로 머신러닝 모델을 학습시키고 배포하는 워크플로우입니다.',
      n8nUrl: 'https://n8n.example.com/workflow/ml-training'
    },
    { 
      n8n_workflow_id: 'wf_1005',
      user_id: 1,
      project_id: null,
      name: '자동화 업무 수행',
      status: 'inactive',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      active: false,
      description: '반복적인 업무를 자동화하여 효율성을 높이는 워크플로우입니다.'
    },
    { 
      n8n_workflow_id: 'wf_1006',
      user_id: 1,
      project_id: null,
      name: '리포트 생성 워크플로우',
      status: 'inactive',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      active: false,
      description: '데이터를 기반으로 정기 리포트를 자동 생성하는 워크플로우입니다.',
      n8nUrl: 'https://n8n.example.com/workflow/report-generation'
    },
    {
      n8n_workflow_id: 'wf_1007',
      user_id: 1,
      project_id: null,
      name: '이메일 자동 발송',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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
      n8n_workflow_id: 'wf_1008',
      user_id: 1,
      project_id: null,
      name: '소셜미디어 모니터링',
      status: 'inactive',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      active: false,
      description: '소셜미디어 플랫폼을 모니터링하여 키워드를 추적하는 워크플로우입니다.',
      n8nUrl: 'https://n8n.example.com/workflow/social-monitoring'
    },
    {
      n8n_workflow_id: 'wf_1009',
      user_id: 1,
      project_id: null,
      name: '파일 백업 자동화',
      status: 'inactive',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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
      n8n_workflow_id: 'wf_1010',
      user_id: 1,
      project_id: null,
      name: '고객 지원 티켓 관리',
      status: 'inactive',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      active: false,
      description: '고객 지원 티켓을 자동으로 분류하고 담당자에게 할당하는 워크플로우입니다.',
      n8nUrl: 'https://n8n.example.com/workflow/ticket-management'
    },
    {
      n8n_workflow_id: 'wf_1011',
      user_id: 1,
      project_id: null,
      name: '재고 관리 알림',
      status: 'inactive',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      active: false,
      description: '재고 수준을 모니터링하고 부족할 때 알림을 보내는 워크플로우입니다.',
      jsonData: {
        "name": "재고 관리 알림",
        "nodes": [
          {"id": "1", "name": "재고 조회", "type": "Database"},
          {"id": "2", "name": "재고 확인", "type": "IF"},
          {"id": "3", "name": "발주 요청", "type": "HTTP Request"}
        ]
      }
    },
    {
      n8n_workflow_id: 'wf_1012',
      user_id: 1,
      project_id: null,
      name: 'SNS 자동 포스팅',
      status: 'inactive',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      active: false,
      description: '소셜미디어 플랫폼에 자동으로 포스트를 업로드하는 워크플로우입니다.',
      jsonData: {
        "name": "SNS 자동 포스팅",
        "nodes": [
          {"id": "1", "name": "콘텐츠 생성", "type": "Code"},
          {"id": "2", "name": "이미지 처리", "type": "Image Processing"},
          {"id": "3", "name": "Twitter 포스팅", "type": "Twitter"},
          {"id": "4", "name": "Instagram 포스팅", "type": "Instagram"},
          {"id": "5", "name": "Facebook 포스팅", "type": "Facebook"}
        ],
        "connections": {
          "콘텐츠 생성": ["이미지 처리"],
          "이미지 처리": ["Twitter 포스팅", "Instagram 포스팅", "Facebook 포스팅"]
        }
      }
    }
  ])

  const selectWorkflow = async (selectedItem: WorkflowItem) => {
    await selectWorkflowGlobally(selectedItem)
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
      n8n_workflow_id: `wf_${Date.now()}`,
      user_id: 1,
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
    workflowPanelOpen: globalWorkflowPanelOpen,
    selectedWorkflow: globalSelectedWorkflow,
    workflowPanelWidth,
    isResizing,
    selectWorkflow,
    closeWorkflowPanel,
    startResize,
    addWorkflow,
    downloadJsonFile
  }
}
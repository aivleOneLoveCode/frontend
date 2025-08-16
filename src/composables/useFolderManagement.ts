import { ref, onMounted } from 'vue'
import { registerSelectionClearCallback } from '../utils/workflowSelection'

interface Workflow {
  id: number
  title: string
  active: boolean
  isRunning: boolean
  description?: string
  n8nUrl?: string
  jsonData?: any
  dragging?: boolean
}

interface Folder {
  id: number
  title: string
  type: string
  active: boolean
  expanded: boolean
  workflows: Workflow[]
  dragOver?: boolean
}

// 전역 상태로 폴더와 활성 폴더 관리
export const folders = ref<Folder[]>([
  { 
    id: 1, 
    title: '개발 프로젝트', 
    type: 'folder', 
    active: false, 
    expanded: false, 
    workflows: [
      { 
        id: 101, 
        title: 'API 연동 워크플로우', 
        active: false, 
        isRunning: false,
        description: 'GitHub API를 호출하여 사용자 정보를 가져오고, 공개 저장소 개수에 따라 이메일 또는 웹훅으로 알림을 전송하는 자동화 워크플로우입니다.',
        n8nUrl: 'https://n8n.io/workflows/github-api-integration-workflow'
      },
      { 
        id: 102, 
        title: '데이터베이스 백업', 
        active: false, 
        isRunning: false,
        description: 'MySQL 데이터베이스를 자동으로 백업하고 클라우드 스토리지에 업로드하는 워크플로우입니다.',
        n8nUrl: 'https://n8n.io/workflows/database-backup-automation'
      },
      { 
        id: 103, 
        title: '코드 배포 자동화', 
        active: false, 
        isRunning: false,
        description: 'Git 저장소에 새로운 커밋이 푸시되면 자동으로 테스트를 실행하고 성공 시 프로덕션 서버에 배포하는 CI/CD 워크플로우입니다.',
        n8nUrl: 'https://n8n.io/workflows/cicd-deployment-automation'
      }
    ]
  },
  { 
    id: 2, 
    title: '디자인 작업', 
    type: 'folder', 
    active: false, 
    expanded: false, 
    workflows: [
      { 
        id: 201, 
        title: '이미지 최적화', 
        active: false, 
        isRunning: false,
        description: '업로드된 이미지를 다양한 크기로 리사이즈하고 압축하여 웹 최적화된 형태로 변환하는 워크플로우입니다.',
        n8nUrl: 'https://n8n.io/workflows/image-optimization'
      },
      { 
        id: 202, 
        title: 'UI 컴포넌트 생성', 
        active: false, 
        isRunning: false,
        description: '디자인 시스템 기반으로 자동화된 UI 컴포넌트를 생성하고 코드베이스에 배포하는 워크플로우입니다.',
        n8nUrl: 'https://n8n.io/workflows/ui-component-generator'
      },
      { 
        id: 203, 
        title: '디자인 시스템 관리', 
        active: false, 
        isRunning: false,
        description: '디자인 토큰과 컴포넌트 라이브러리를 관리하고 업데이트를 자동으로 배포하는 워크플로우입니다.',
        n8nUrl: 'https://n8n.io/workflows/design-system-management'
      }
    ]
  },
  { 
    id: 3, 
    title: '회의 내용', 
    type: 'folder', 
    active: false, 
    expanded: false, 
    workflows: [
      { 
        id: 301, 
        title: '회의록 자동 생성', 
        active: false, 
        isRunning: false,
        description: '회의 음성을 텍스트로 변환하고 AI를 사용해 요약된 회의록을 자동 생성하는 워크플로우입니다.',
        n8nUrl: 'https://n8n.io/workflows/meeting-notes-automation'
      },
      { 
        id: 302, 
        title: '일정 동기화', 
        active: false, 
        isRunning: false,
        description: '여러 캘린더 서비스 간의 일정을 자동으로 동기화하고 중복 일정을 관리하는 워크플로우입니다.',
        n8nUrl: 'https://n8n.io/workflows/calendar-sync'
      },
      { 
        id: 303, 
        title: '참석자 알림', 
        active: false, 
        isRunning: false,
        description: '회의 시작 전 참석자들에게 자동으로 알림을 발송하고 확인 응답을 수집하는 워크플로우입니다.',
        n8nUrl: 'https://n8n.io/workflows/attendee-notification'
      }
    ]
  },
  { 
    id: 4, 
    title: '학습 자료', 
    type: 'folder', 
    active: false, 
    expanded: false, 
    workflows: [
      { 
        id: 401, 
        title: '자료 분류 시스템', 
        active: false, 
        isRunning: false,
        description: 'AI를 활용해 학습 자료를 자동으로 분류하고 태그를 생성하여 체계적으로 관리하는 워크플로우입니다.',
        n8nUrl: 'https://n8n.io/workflows/content-classification'
      },
      { 
        id: 402, 
        title: '진도 추적', 
        active: false, 
        isRunning: false,
        description: '학습자의 진행 상황을 추적하고 개인화된 학습 계획을 제안하는 워크플로우입니다.',
        n8nUrl: 'https://n8n.io/workflows/progress-tracking'
      },
      { 
        id: 403, 
        title: '퀴즈 생성기', 
        active: false, 
        isRunning: false,
        description: '학습 내용을 바탕으로 자동으로 퀴즈를 생성하고 평가하는 워크플로우입니다.',
        n8nUrl: 'https://n8n.io/workflows/quiz-generator'
      }
    ]
  },
  { id: 5, title: '마케팅 기획', type: 'folder', active: false, expanded: false, workflows: [] },
  { id: 6, title: '고객 지원', type: 'folder', active: false, expanded: false, workflows: [] },
  { id: 7, title: '연구 분석', type: 'folder', active: false, expanded: false, workflows: [] },
  { id: 8, title: '팀 관리', type: 'folder', active: false, expanded: false, workflows: [] },
  { id: 9, title: '문서 작성', type: 'folder', active: false, expanded: false, workflows: [] }
])

export const activeFolderId = ref<number | null>(null)

export function useFolderManagement() {
  const clearFolderWorkflowSelections = () => {
    folders.value.forEach(folder => {
      if (folder.workflows) {
        folder.workflows.forEach(workflow => workflow.active = false)
      }
    })
  }

  onMounted(() => {
    registerSelectionClearCallback(clearFolderWorkflowSelections)
  })
  // localStorage 저장/복원 기능
  const saveFoldersToLocalStorage = () => {
    try {
      const foldersData = folders.value.map(folder => ({
        id: folder.id,
        title: folder.title,
        type: folder.type,
        active: folder.active,
        expanded: folder.expanded,
        workflows: folder.workflows || []
      }))
      localStorage.setItem('workflowFolders', JSON.stringify(foldersData))
      console.log('폴더 상태가 저장되었습니다.')
    } catch (e) {
      console.error('폴더 저장 오류:', e)
    }
  }

  const loadFoldersFromLocalStorage = () => {
    try {
      const savedFolders = localStorage.getItem('workflowFolders')
      if (savedFolders) {
        const foldersData = JSON.parse(savedFolders)
        folders.value = foldersData.map((folder: any) => ({
          ...folder,
          dragOver: false
        }))
        console.log('폴더 상태가 복원되었습니다.')
      }
    } catch (e) {
      console.error('폴더 복원 오류:', e)
    }
  }

  // HTML과 동일한 워크플로우 생성 감지 기능
  const checkForWorkflowInMessage = (messageContent: string) => {
    const jsonPatterns = [
      /워크플로우.*생성/i,
      /json.*파일.*만들/i,
      /n8n.*워크플로우/i,
      /자동화.*워크플로우/i
    ]
    
    const containsWorkflowRequest = jsonPatterns.some(pattern => 
      pattern.test(messageContent)
    )
    
    if (containsWorkflowRequest) {
      // 시뮬레이션: 실제로는 AI가 생성한 JSON을 받아야 함
      const sampleWorkflowJson = {
        name: "AI 생성 워크플로우",
        nodes: [
          {
            id: "start",
            type: "n8n-nodes-base.start",
            position: [100, 100]
          },
          {
            id: "webhook", 
            type: "n8n-nodes-base.webhook",
            position: [300, 100]
          }
        ],
        connections: {}
      }
      
      const workflowTitle = `AI 워크플로우 ${Date.now()}`
      
      // 활성 폴더가 있으면 해당 폴더에 워크플로우 추가
      if (activeFolderId.value) {
        const activeFolder = folders.value.find(f => f.id === activeFolderId.value)
        if (activeFolder) {
          if (!activeFolder.workflows) {
            activeFolder.workflows = []
          }
          const newWorkflow = {
            id: Date.now(),
            title: workflowTitle,
            active: false,
            isRunning: false,
            jsonData: sampleWorkflowJson
          }
          activeFolder.workflows.unshift(newWorkflow)
          saveFoldersToLocalStorage()
          return `새로운 워크플로우 "${workflowTitle}"가 "${activeFolder.title}" 폴더에 생성되었습니다.`
        }
      }
      
      // 활성 폴더가 없으면 새로운 프로젝트 폴더 생성
      const currentTime = new Date()
      const folderName = `프로젝트 ${currentTime.getMonth() + 1}월 ${currentTime.getDate()}일`
      
      // 새로운 프로젝트 폴더 생성
      const newFolderId = Date.now()
      const newFolder: Folder = {
        id: newFolderId,
        title: folderName,
        type: 'folder',
        active: false,
        expanded: true, // 새로 생성된 폴더는 자동으로 펼쳐짐
        workflows: [{
          id: Date.now() + 1,
          title: workflowTitle,
          active: false,
          isRunning: false,
          jsonData: sampleWorkflowJson
        }]
      }
      
      // 모든 폴더의 active 상태 초기화
      folders.value.forEach(f => f.active = false)
      
      // 새 폴더를 맨 앞에 추가
      folders.value.unshift(newFolder)
      
      // 새 폴더를 활성 폴더로 설정
      activeFolderId.value = newFolderId
      
      saveFoldersToLocalStorage()
      
      return `새로운 프로젝트 폴더 "${folderName}"가 생성되었고, 워크플로우 "${workflowTitle}"가 추가되었습니다.`
    }
    
    return null
  }

  const toggleFolder = (folder: Folder) => {
    folder.expanded = !folder.expanded
    // 폴더를 활성 폴더로 설정 (HTML과 동일)
    activeFolderId.value = folder.id
    saveFoldersToLocalStorage()
  }

  return {
    folders,
    activeFolderId,
    saveFoldersToLocalStorage,
    loadFoldersFromLocalStorage,
    checkForWorkflowInMessage,
    toggleFolder
  }
}

export type { Folder, Workflow }
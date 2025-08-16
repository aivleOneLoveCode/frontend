import { defineStore } from 'pinia'
import { workflowService } from '@/services/workflow'
import { selectWorkflowGlobally, registerSelectionClearCallback } from '@/utils/workflowSelection'

interface WorkflowNode {
  id: string
  name: string
  type: string
}

interface WorkflowJsonData {
  name: string
  nodes: WorkflowNode[]
}

interface Workflow {
  id: number
  title: string
  active: boolean
  description?: string
  n8nUrl?: string
  jsonData?: WorkflowJsonData
  isCustom: boolean
}

interface WorkflowState {
  workflows: Workflow[]
  selectedWorkflow: Workflow | null
  isWorkflowPanelOpen: boolean
  workflowPanelWidth: number
  isLoading: boolean
}

interface WorkflowData {
  title: string
  description?: string
  jsonData?: WorkflowJsonData
  isCustom?: boolean
}

export const useWorkflowStore = defineStore('workflow', {
  state: (): WorkflowState => ({
    workflows: [],
    selectedWorkflow: null,
    isWorkflowPanelOpen: false,
    workflowPanelWidth: 400,
    isLoading: false
  }),

  getters: {
    customWorkflows: (state): Workflow[] => state.workflows.filter(w => w.isCustom),
    defaultWorkflows: (state): Workflow[] => state.workflows.filter(w => !w.isCustom),
    activeWorkflow: (state): Workflow | undefined => state.workflows.find(w => w.active)
  },

  actions: {
    async loadWorkflows(): Promise<void> {
      try {
        this.isLoading = true
        
        // 기본 워크플로우들
        const defaultWorkflows = [
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
            },
            isCustom: false
          },
          {
            id: 2,
            title: '이미지 처리 워크플로우',
            active: false,
            description: '이미지를 업로드하고 다양한 필터와 변환을 적용하는 워크플로우입니다.',
            n8nUrl: 'https://n8n.example.com/workflow/image-processing',
            isCustom: false
          },
          {
            id: 3,
            title: 'API 데이터 연동',
            active: false,
            description: '외부 API에서 데이터를 가져와 내부 시스템과 연동하는 워크플로우입니다.',
            isCustom: false
          },
          {
            id: 4,
            title: '머신러닝 모델 학습',
            active: false,
            description: '데이터를 기반으로 머신러닝 모델을 학습시키고 배포하는 워크플로우입니다.',
            n8nUrl: 'https://n8n.example.com/workflow/ml-training',
            isCustom: false
          },
          {
            id: 5,
            title: '자동화 업무 수행',
            active: false,
            description: '반복적인 업무를 자동화하여 효율성을 높이는 워크플로우입니다.',
            isCustom: false
          },
          {
            id: 6,
            title: '리포트 생성 워크플로우',
            active: false,
            description: '데이터를 기반으로 정기 리포트를 자동 생성하는 워크플로우입니다.',
            n8nUrl: 'https://n8n.example.com/workflow/report-generation',
            isCustom: false
          }
        ]

        // 사용자 커스텀 워크플로우들을 서버에서 가져오기
        const customWorkflows = await workflowService.getCustomWorkflows()
        
        this.workflows = [...defaultWorkflows, ...customWorkflows]
        
      } catch (error) {
        console.error('Failed to load workflows:', error)
        
        // 서버 연결 실패 시 기본 워크플로우만 로드
        this.workflows = [
          // ... defaultWorkflows 배열을 여기에 넣어도 됨
        ]
      } finally {
        this.isLoading = false
      }
    },

    async createWorkflow(workflowData: WorkflowData): Promise<Workflow> {
      try {
        const newWorkflow = await workflowService.createWorkflow(workflowData)
        
        // 모든 워크플로우의 active 상태를 false로 변경
        this.workflows.forEach(w => w.active = false)
        
        // 새 워크플로우를 맨 위에 추가
        this.workflows.unshift({
          ...newWorkflow,
          active: true,
          isCustom: true
        })
        
        return newWorkflow
      } catch (error) {
        console.error('Failed to create workflow:', error)
        throw error
      }
    },

    async updateWorkflow(workflowId: number, updateData: Partial<WorkflowData>): Promise<Workflow> {
      try {
        const updatedWorkflow = await workflowService.updateWorkflow(workflowId, updateData)
        
        // 로컬에서 워크플로우 업데이트
        const index = this.workflows.findIndex(w => w.id === workflowId)
        if (index !== -1) {
          this.workflows[index] = { ...this.workflows[index], ...updatedWorkflow }
        }
        
        return updatedWorkflow
      } catch (error) {
        console.error('Failed to update workflow:', error)
        throw error
      }
    },

    async deleteWorkflow(workflowId: number): Promise<void> {
      try {
        await workflowService.deleteWorkflow(workflowId)
        
        // 로컬에서 워크플로우 제거
        const index = this.workflows.findIndex(w => w.id === workflowId)
        if (index !== -1) {
          this.workflows.splice(index, 1)
        }
        
        // 선택된 워크플로우가 삭제된 경우 초기화
        if (this.selectedWorkflow?.id === workflowId) {
          this.selectedWorkflow = null
          this.isWorkflowPanelOpen = false
        }
        
      } catch (error) {
        console.error('Failed to delete workflow:', error)
        throw error
      }
    },

    selectWorkflow(workflow: Workflow): void {
      selectWorkflowGlobally(workflow)
      
      // 로컬 패널 상태 업데이트 (전역 상태와 동기화를 위해)
      this.selectedWorkflow = workflow
      this.isWorkflowPanelOpen = true
    },

    initSelectionClearCallback(): void {
      const clearStoreSelections = () => {
        this.workflows.forEach(w => w.active = false)
      }
      registerSelectionClearCallback(clearStoreSelections)
    },

    closeWorkflowPanel(): void {
      this.isWorkflowPanelOpen = false
      this.selectedWorkflow = null
    },

    setWorkflowPanelWidth(width: number): void {
      this.workflowPanelWidth = Math.max(300, Math.min(800, width))
    },

    async uploadWorkflowFromJson(jsonData: WorkflowJsonData): Promise<Workflow> {
      try {
        // JSON 데이터에서 워크플로우 정보 추출
        const workflowTitle = jsonData.name || '업로드된 워크플로우'
        
        const workflowData = {
          title: workflowTitle,
          description: '사용자가 업로드한 n8n 워크플로우입니다.',
          jsonData: jsonData,
          isCustom: true
        }
        
        const newWorkflow = await this.createWorkflow(workflowData)
        
        return newWorkflow
      } catch (error) {
        console.error('Failed to upload workflow from JSON:', error)
        throw error
      }
    },

    parseJsonToWorkflow(jsonString: string): WorkflowJsonData {
      try {
        const jsonData = JSON.parse(jsonString)
        
        // n8n 워크플로우 JSON 형식 검증
        if (!jsonData.name || !jsonData.nodes) {
          throw new Error('유효하지 않은 n8n 워크플로우 JSON 형식입니다.')
        }
        
        return jsonData
      } catch (error) {
        console.error('Failed to parse JSON:', error)
        throw new Error('JSON 파싱에 실패했습니다. 올바른 형식인지 확인해주세요.')
      }
    }
  }
})
import { defineStore } from 'pinia'
import { workflowService } from '@/services/workflow'
import { projectService } from '@/services/project'
import { registerSelectionClearCallback } from '@/utils/workflowSelection'
import type { WorkflowItem, Project } from '@/types'

interface WorkflowState {
  workflows: WorkflowItem[]
  projects: Project[]
  selectedWorkflow: WorkflowItem | null
  isWorkflowPanelOpen: boolean
  workflowPanelWidth: number
  isLoading: boolean
  error: string | null
}


export const useWorkflowStore = defineStore('workflow', {
  state: (): WorkflowState => ({
    workflows: [],
    projects: [],
    selectedWorkflow: null,
    isWorkflowPanelOpen: false,
    workflowPanelWidth: 800,
    isLoading: false,
    error: null
  }),

  getters: {
    customWorkflows: (state): WorkflowItem[] => state.workflows.filter(w => w.isCustom),
    defaultWorkflows: (state): WorkflowItem[] => state.workflows.filter(w => !w.isCustom),
    activeWorkflow: (state): WorkflowItem | undefined => state.workflows.find(w => w.active),
    activeWorkflows: (state): WorkflowItem[] => {
      return state.workflows.filter(w => w.status === 'active')
    },
    inactiveWorkflows: (state): WorkflowItem[] => {
      return state.workflows.filter(w => w.status === 'inactive')
    },
    workflowsByProject: (state) => {
      return (projectId?: string) => {
        return state.workflows.filter(w => w.project_id === projectId)
      }
    },
    unassignedWorkflows: (state): WorkflowItem[] => {
      return state.workflows.filter(w => !w.project_id)
    }
  },

  actions: {
    async loadWorkflows(): Promise<void> {
      try {
        this.isLoading = true
        

        // 서버에서 워크플로우와 프로젝트 가져오기
        const backendWorkflows = await workflowService.getAllWorkflows()
        
        // 백엔드 워크플로우를 그대로 사용 (변환 없이)
        const customWorkflows = backendWorkflows.workflows ? backendWorkflows.workflows.map((wf: any) => ({
          workflow_id: wf.workflow_id,
          user_id: wf.user_id,
          project_id: wf.project_id || null,
          name: wf.name || wf.title,
          status: wf.status || 'inactive',
          active: false,
          description: '사용자가 생성한 워크플로우입니다.',
          isCustom: true,
          created_at: wf.created_at,
          updated_at: wf.updated_at
        })) : []
        
        this.workflows = [...customWorkflows]
        // 프로젝트는 별도 API로 로드
        
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

    async updateWorkflowName(workflowId: string, name: string): Promise<void> {
      try {
        await workflowService.updateWorkflowName(workflowId, name)
        const workflow = this.workflows.find(w => w.workflow_id === workflowId)
        if (workflow) {
          workflow.name = name
          workflow.updated_at = new Date().toISOString()
        }
      } catch (error: any) {
        this.error = error.message || '워크플로우 이름 변경 실패'
        throw error
      }
    },

    async toggleWorkflowStatus(workflowId: string): Promise<void> {
      try {
        const response = await workflowService.toggleWorkflowStatus(workflowId)
        const workflow = this.workflows.find(w => w.workflow_id === workflowId)
        if (workflow) {
          workflow.status = response.status as 'active' | 'inactive'
          workflow.updated_at = new Date().toISOString()
        }
      } catch (error: any) {
        this.error = error.message || '워크플로우 상태 변경 실패'
        throw error
      }
    },

    async deleteWorkflow(workflowId: string): Promise<void> {
      try {
        await workflowService.deleteWorkflow(workflowId)
        this.workflows = this.workflows.filter(w => w.workflow_id !== workflowId)
        
        if (this.selectedWorkflow?.workflow_id === workflowId) {
          this.selectedWorkflow = null
          this.isWorkflowPanelOpen = false
        }
      } catch (error: any) {
        this.error = error.message || '워크플로우 삭제 실패'
        throw error
      }
    },

    selectWorkflow(workflow: WorkflowItem): void {
      // 같은 워크플로우를 다시 클릭하면 패널 닫기
      if (this.selectedWorkflow?.workflow_id === workflow.workflow_id && this.isWorkflowPanelOpen) {
        this.closeWorkflowPanel()
        return
      }
      
      this.selectedWorkflow = workflow
      this.isWorkflowPanelOpen = true
    },

    closeWorkflowPanel(): void {
      this.isWorkflowPanelOpen = false
      this.selectedWorkflow = null
    },

    setWorkflowPanelWidth(width: number): void {
      this.workflowPanelWidth = Math.max(400, Math.min(1200, width))
    },

    async loadProjects(): Promise<void> {
      try {
        const response = await projectService.getAllProjects()
        this.projects = response.projects || []
      } catch (error: any) {
        this.error = error.message || '프로젝트 로드 실패'
        console.error('프로젝트 로드 실패:', error)
      }
    },

    async createProject(name: string): Promise<Project> {
      try {
        const newProject = await projectService.createProject(name)
        this.projects.unshift(newProject)
        return newProject
      } catch (error: any) {
        this.error = error.message || '프로젝트 생성 실패'
        throw error
      }
    },

    async updateProjectName(projectId: string, name: string): Promise<void> {
      try {
        await projectService.updateProject(projectId, name)
        const project = this.projects.find(p => p.project_id === projectId)
        if (project) {
          project.name = name
        }
      } catch (error: any) {
        this.error = error.message || '프로젝트 이름 변경 실패'
        throw error
      }
    },

    async deleteProject(projectId: string): Promise<void> {
      try {
        await projectService.deleteProject(projectId)
        this.projects = this.projects.filter(p => p.project_id !== projectId)
        
        this.workflows.forEach(workflow => {
          if (workflow.project_id === projectId) {
            workflow.project_id = null
          }
        })
      } catch (error: any) {
        this.error = error.message || '프로젝트 삭제 실패'
        throw error
      }
    },

    async assignWorkflowToProject(workflowId: string, projectId?: string | null): Promise<void> {
      try {
        await workflowService.assignWorkflowToProject(workflowId, projectId || null)
        
        const workflow = this.workflows.find(w => w.workflow_id === workflowId)
        if (workflow) {
          workflow.project_id = projectId || null
        }
      } catch (error: any) {
        this.error = error.message || '워크플로우 할당 실패'
        throw error
      }
    },


    clearError(): void {
      this.error = null
    },

    async refreshAll(): Promise<void> {
      await Promise.all([
        this.loadWorkflows()
      ])
    },

    initSelectionClearCallback(): void {
      const clearStoreSelections = () => {
        this.workflows.forEach(w => w.active = false)
      }
      registerSelectionClearCallback(clearStoreSelections)
    },

  }
})
import { defineStore } from 'pinia'
import { workflowManagementService, type Workflow, type Project } from '@/services/workflowManagement'

interface WorkflowManagementState {
  workflows: Workflow[]
  projects: Project[]
  isLoading: boolean
  error: string | null
}

export const useWorkflowManagementStore = defineStore('workflowManagement', {
  state: (): WorkflowManagementState => ({
    workflows: [],
    projects: [],
    isLoading: false,
    error: null
  }),

  getters: {
    activeWorkflows: (state): Workflow[] => {
      return state.workflows.filter(w => w.status === 'active')
    },

    inactiveWorkflows: (state): Workflow[] => {
      return state.workflows.filter(w => w.status === 'inactive')
    },

    workflowsByProject: (state) => {
      return (projectId?: string) => {
        return state.workflows.filter(w => w.project_id === projectId)
      }
    },

    unassignedWorkflows: (state): Workflow[] => {
      return state.workflows.filter(w => !w.project_id)
    }
  },

  actions: {
    // 워크플로우 목록 로드
    async loadWorkflows() {
      try {
        this.isLoading = true
        this.error = null
        this.workflows = await workflowManagementService.getWorkflows()
      } catch (error: any) {
        this.error = error.message || '워크플로우 로드 실패'
        console.error('워크플로우 로드 실패:', error)
      } finally {
        this.isLoading = false
      }
    },

    // 프로젝트 목록 로드
    async loadProjects() {
      try {
        this.isLoading = true
        this.error = null
        this.projects = await workflowManagementService.getProjects()
      } catch (error: any) {
        this.error = error.message || '프로젝트 로드 실패'
        console.error('프로젝트 로드 실패:', error)
      } finally {
        this.isLoading = false
      }
    },

    // 워크플로우 이름 변경
    async updateWorkflowName(workflowId: string, name: string) {
      try {
        await workflowManagementService.updateWorkflowName(workflowId, name)
        const workflowIndex = this.workflows.findIndex(w => w.workflow_id === workflowId)
        if (workflowIndex !== -1) {
          this.workflows[workflowIndex].title = name
        }
      } catch (error: any) {
        this.error = error.message || '워크플로우 이름 변경 실패'
        throw error
      }
    },

    // 워크플로우 상태 토글
    async toggleWorkflowStatus(workflowId: string) {
      try {
        await workflowManagementService.toggleWorkflowStatus(workflowId)
        const workflowIndex = this.workflows.findIndex(w => w.workflow_id === workflowId)
        if (workflowIndex !== -1) {
          const currentStatus = this.workflows[workflowIndex].status
          this.workflows[workflowIndex].status = currentStatus === 'active' ? 'inactive' : 'active'
        }
      } catch (error: any) {
        this.error = error.message || '워크플로우 상태 변경 실패'
        throw error
      }
    },

    // 워크플로우 삭제
    async deleteWorkflow(workflowId: string) {
      try {
        await workflowManagementService.deleteWorkflow(workflowId)
        this.workflows = this.workflows.filter(w => w.workflow_id !== workflowId)
      } catch (error: any) {
        this.error = error.message || '워크플로우 삭제 실패'
        throw error
      }
    },

    // 워크플로우를 프로젝트에 할당
    async assignWorkflowToProject(workflowId: string, projectId?: string) {
      try {
        await workflowManagementService.assignToProject(workflowId, projectId)
        const workflowIndex = this.workflows.findIndex(w => w.workflow_id === workflowId)
        if (workflowIndex !== -1) {
          this.workflows[workflowIndex].project_id = projectId
        }
      } catch (error: any) {
        this.error = error.message || '워크플로우 할당 실패'
        throw error
      }
    },

    // 프로젝트 생성
    async createProject(name: string) {
      try {
        const newProject = await workflowManagementService.createProject(name)
        this.projects.unshift(newProject)
        return newProject
      } catch (error: any) {
        this.error = error.message || '프로젝트 생성 실패'
        throw error
      }
    },

    // 프로젝트 이름 변경
    async updateProjectName(projectId: string, name: string) {
      try {
        await workflowManagementService.updateProjectName(projectId, name)
        const projectIndex = this.projects.findIndex(p => p.project_id === projectId)
        if (projectIndex !== -1) {
          this.projects[projectIndex].name = name
        }
      } catch (error: any) {
        this.error = error.message || '프로젝트 이름 변경 실패'
        throw error
      }
    },

    // 프로젝트 삭제
    async deleteProject(projectId: string) {
      try {
        await workflowManagementService.deleteProject(projectId)
        this.projects = this.projects.filter(p => p.project_id !== projectId)
        
        // 해당 프로젝트에 속한 워크플로우들의 project_id를 null로 설정
        this.workflows.forEach(workflow => {
          if (workflow.project_id === projectId) {
            workflow.project_id = undefined
          }
        })
      } catch (error: any) {
        this.error = error.message || '프로젝트 삭제 실패'
        throw error
      }
    },

    // 에러 초기화
    clearError() {
      this.error = null
    },

    // 전체 데이터 새로고침
    async refreshAll() {
      await Promise.all([
        this.loadWorkflows(),
        this.loadProjects()
      ])
    }
  }
})
import api from './api'

export interface Workflow {
  workflow_id: string
  title: string
  project_id?: string
  status: 'active' | 'inactive'
}

export interface Project {
  project_id: string
  name: string
  created_at: string
  updated_at: string
}

export const workflowManagementService = {
  // 워크플로우 관리
  async getWorkflows(): Promise<Workflow[]> {
    const response = await api.get('/workflows')
    return response.data.workflows
  },

  async updateWorkflowName(workflowId: string, name: string): Promise<void> {
    await api.put(`/workflows/${workflowId}/name`, { name })
  },

  async toggleWorkflowStatus(workflowId: string): Promise<void> {
    await api.post(`/workflows/${workflowId}/toggle`)
  },

  async deleteWorkflow(workflowId: string): Promise<void> {
    await api.delete(`/workflows/${workflowId}`)
  },

  async assignToProject(workflowId: string, projectId?: string): Promise<void> {
    await api.put(`/workflows/${workflowId}/project`, { project_id: projectId })
  },

  // 프로젝트 관리
  async getProjects(): Promise<Project[]> {
    const response = await api.get('/projects')
    return response.data.projects
  },

  async createProject(name: string): Promise<Project> {
    const response = await api.post('/projects', { name })
    return response.data
  },

  async updateProjectName(projectId: string, name: string): Promise<void> {
    await api.put(`/projects/${projectId}`, { name })
  },

  async deleteProject(projectId: string): Promise<void> {
    await api.delete(`/projects/${projectId}`)
  }
}
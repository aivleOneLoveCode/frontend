import api from './api'

export const projectService = {
  // 모든 프로젝트 가져오기
  async getAllProjects() {
    const response = await api.get('/projects')
    return response.data
  },

  // 프로젝트 생성
  async createProject(name: string) {
    const response = await api.post('/projects', { name })
    return response.data
  },

  // 프로젝트 이름 변경
  async updateProject(projectId: number, name: string) {
    const response = await api.put(`/projects/${projectId}`, { name })
    return response.data
  },

  // 프로젝트 삭제
  async deleteProject(projectId: number) {
    const response = await api.delete(`/projects/${projectId}`)
    return response.data
  }
}
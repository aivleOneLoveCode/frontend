import api from './api'

interface WorkflowNode {
  id: string
  name: string
  type: string
  position?: [number, number]
  parameters?: Record<string, any>
}

interface WorkflowConnection {
  [nodeId: string]: {
    [outputIndex: string]: Array<{
      node: string
      type: string
      index: number
    }>
  }
}

interface WorkflowJsonData {
  name: string
  description?: string
  nodes: WorkflowNode[]
  connections?: WorkflowConnection
  version?: string
}

interface WorkflowData {
  title: string
  description?: string
  jsonData?: WorkflowJsonData
  n8nUrl?: string
  isCustom?: boolean
  variables?: Record<string, any>
}

interface ShareSettings {
  isPublic: boolean
  sharedUsers?: string[]
  permissions?: 'read' | 'write' | 'admin'
}

// This interface may be used in future implementations
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ExecutionData {
  input_data?: Record<string, any>
}

interface ValidationResult {
  valid: boolean
  message: string
}

interface ParsedWorkflow {
  title: string
  description: string
  jsonData: WorkflowJsonData
  nodeCount: number
  version: string
}

export const workflowService = {
  // 모든 워크플로우 가져오기
  async getAllWorkflows() {
    const response = await api.get('/workflows')
    return response.data
  },

  // 워크플로우 삭제
  async deleteWorkflow(n8nWorkflowId: string) {
    const response = await api.delete(`/workflows/${n8nWorkflowId}`)
    return response.data
  },

  // 워크플로우 이름 변경
  async updateWorkflowName(n8nWorkflowId: string, name: string) {
    const response = await api.put(`/workflows/${n8nWorkflowId}/name`, { name })
    return response.data
  },

  // 워크플로우 상태 토글 (활성화/비활성화)
  async toggleWorkflowStatus(n8nWorkflowId: string) {
    const response = await api.post(`/workflows/${n8nWorkflowId}/toggle`)
    return response.data
  },

  // 워크플로우를 프로젝트에 할당/제거
  async assignWorkflowToProject(n8nWorkflowId: string, projectId: string | null) {
    const response = await api.put(`/workflows/${n8nWorkflowId}/project`, { project_id: projectId })
    return response.data
  },

  // 워크플로우 실행
  async executeWorkflow(workflowId: number, inputData: Record<string, any> = {}) {
    const response = await api.post(`/workflows/${workflowId}/execute`, {
      input_data: inputData
    })
    return response.data
  },

  // 워크플로우 실행 상태 조회
  async getExecutionStatus(executionId: string) {
    const response = await api.get(`/workflows/executions/${executionId}`)
    return response.data
  },

  // 워크플로우 실행 기록
  async getExecutionHistory(workflowId: number, page: number = 1, limit: number = 20) {
    const response = await api.get(`/workflows/${workflowId}/executions`, {
      params: { page, limit }
    })
    return response.data
  },

  // JSON 파일로 워크플로우 업로드
  async uploadWorkflowFromJson(jsonData: WorkflowJsonData) {
    const response = await api.post('/workflows/upload', {
      json_data: jsonData
    })
    return response.data
  },

  // 워크플로우 JSON 내보내기
  async exportWorkflow(workflowId: number) {
    const response = await api.get(`/workflows/${workflowId}/export`)
    return response.data
  },

  // 워크플로우 JSON 데이터 가져오기 (test/backend 호환)
  async getWorkflowJson(workflowId: string) {
    const response = await api.get(`/workflows/${workflowId}/json`)
    return response.data
  },

  // 워크플로우 복제
  async cloneWorkflow(workflowId: number, newTitle: string | null = null) {
    const response = await api.post(`/workflows/${workflowId}/clone`, {
      title: newTitle
    })
    return response.data
  },

  // 워크플로우 공유
  async shareWorkflow(workflowId: number, shareSettings: ShareSettings) {
    const response = await api.post(`/workflows/${workflowId}/share`, {
      is_public: shareSettings.isPublic,
      shared_users: shareSettings.sharedUsers || [],
      permissions: shareSettings.permissions || 'read'
    })
    return response.data
  },

  // 공유된 워크플로우 가져오기
  async getSharedWorkflows() {
    const response = await api.get('/workflows/shared')
    return response.data
  },

  // 워크플로우 검색
  async searchWorkflows(query: string) {
    const response = await api.get('/workflows/search', {
      params: { q: query }
    })
    return response.data
  },

  // 워크플로우 카테고리별 조회
  async getWorkflowsByCategory(category: string) {
    const response = await api.get('/workflows', {
      params: { category }
    })
    return response.data
  },

  // 워크플로우 템플릿 가져오기
  async getWorkflowTemplates() {
    const response = await api.get('/workflows/templates')
    return response.data
  },

  // 템플릿에서 워크플로우 생성
  async createFromTemplate(templateId: number, customData: Partial<WorkflowData> = {}) {
    const response = await api.post(`/workflows/templates/${templateId}/create`, {
      title: customData.title,
      description: customData.description,
      variables: customData.variables || {}
    })
    return response.data
  },

  // 워크플로우 통계
  async getWorkflowStats(workflowId: number) {
    const response = await api.get(`/workflows/${workflowId}/stats`)
    return response.data
  },

  // n8n 워크플로우 유효성 검증
  validateN8nWorkflow(jsonData: WorkflowJsonData): ValidationResult {
    try {
      // 기본적인 n8n 워크플로우 구조 검증
      if (!jsonData.name) {
        throw new Error('워크플로우 이름이 필요합니다.')
      }

      if (!jsonData.nodes || !Array.isArray(jsonData.nodes)) {
        throw new Error('워크플로우 노드가 필요합니다.')
      }

      if (jsonData.nodes.length === 0) {
        throw new Error('최소 하나의 노드가 필요합니다.')
      }

      // 각 노드 검증
      jsonData.nodes.forEach((node, index) => {
        if (!node.id) {
          throw new Error(`노드 ${index + 1}에 ID가 없습니다.`)
        }
        if (!node.name) {
          throw new Error(`노드 ${index + 1}에 이름이 없습니다.`)
        }
        if (!node.type) {
          throw new Error(`노드 ${index + 1}에 타입이 없습니다.`)
        }
      })

      // 연결 검증 (있는 경우)
      if (jsonData.connections) {
        Object.keys(jsonData.connections).forEach(nodeId => {
          const nodeExists = jsonData.nodes.some(node => node.id === nodeId)
          if (!nodeExists) {
            throw new Error(`연결에 존재하지 않는 노드 ID가 있습니다: ${nodeId}`)
          }
        })
      }

      return { valid: true, message: '유효한 n8n 워크플로우입니다.' }
    } catch (error) {
      return { valid: false, message: (error as Error).message || 'Unknown error occurred' }
    }
  },

  // JSON 문자열을 워크플로우 객체로 파싱
  parseJsonToWorkflow(jsonString: string): ParsedWorkflow {
    try {
      const jsonData = JSON.parse(jsonString)
      const validation = this.validateN8nWorkflow(jsonData)
      
      if (!validation.valid) {
        throw new Error(validation.message)
      }

      return {
        title: jsonData.name,
        description: jsonData.description || '업로드된 n8n 워크플로우입니다.',
        jsonData: jsonData,
        nodeCount: jsonData.nodes.length,
        version: jsonData.version || '1.0.0'
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('유효하지 않은 JSON 형식입니다.')
      }
      throw error
    }
  }
}
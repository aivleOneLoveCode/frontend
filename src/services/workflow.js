import api from './api.js'

export const workflowService = {
  // 모든 워크플로우 가져오기
  async getAllWorkflows() {
    const response = await api.get('/workflows')
    return response.data
  },

  // 사용자 커스텀 워크플로우만 가져오기
  async getCustomWorkflows() {
    const response = await api.get('/workflows?custom=true')
    return response.data
  },

  // 특정 워크플로우 조회
  async getWorkflow(workflowId) {
    const response = await api.get(`/workflows/${workflowId}`)
    return response.data
  },

  // 새 워크플로우 생성
  async createWorkflow(workflowData) {
    const response = await api.post('/workflows', {
      title: workflowData.title,
      description: workflowData.description,
      json_data: workflowData.jsonData,
      n8n_url: workflowData.n8nUrl,
      is_custom: workflowData.isCustom || true
    })
    return response.data
  },

  // 워크플로우 수정
  async updateWorkflow(workflowId, updateData) {
    const response = await api.patch(`/workflows/${workflowId}`, {
      title: updateData.title,
      description: updateData.description,
      json_data: updateData.jsonData,
      n8n_url: updateData.n8nUrl
    })
    return response.data
  },

  // 워크플로우 삭제
  async deleteWorkflow(workflowId) {
    const response = await api.delete(`/workflows/${workflowId}`)
    return response.data
  },

  // 워크플로우 실행
  async executeWorkflow(workflowId, inputData = {}) {
    const response = await api.post(`/workflows/${workflowId}/execute`, {
      input_data: inputData
    })
    return response.data
  },

  // 워크플로우 실행 상태 조회
  async getExecutionStatus(executionId) {
    const response = await api.get(`/workflows/executions/${executionId}`)
    return response.data
  },

  // 워크플로우 실행 기록
  async getExecutionHistory(workflowId, page = 1, limit = 20) {
    const response = await api.get(`/workflows/${workflowId}/executions`, {
      params: { page, limit }
    })
    return response.data
  },

  // JSON 파일로 워크플로우 업로드
  async uploadWorkflowFromJson(jsonData) {
    const response = await api.post('/workflows/upload', {
      json_data: jsonData
    })
    return response.data
  },

  // 워크플로우 JSON 내보내기
  async exportWorkflow(workflowId) {
    const response = await api.get(`/workflows/${workflowId}/export`)
    return response.data
  },

  // 워크플로우 복제
  async cloneWorkflow(workflowId, newTitle = null) {
    const response = await api.post(`/workflows/${workflowId}/clone`, {
      title: newTitle
    })
    return response.data
  },

  // 워크플로우 공유
  async shareWorkflow(workflowId, shareSettings) {
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
  async searchWorkflows(query) {
    const response = await api.get('/workflows/search', {
      params: { q: query }
    })
    return response.data
  },

  // 워크플로우 카테고리별 조회
  async getWorkflowsByCategory(category) {
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
  async createFromTemplate(templateId, customData = {}) {
    const response = await api.post(`/workflows/templates/${templateId}/create`, {
      title: customData.title,
      description: customData.description,
      variables: customData.variables || {}
    })
    return response.data
  },

  // 워크플로우 통계
  async getWorkflowStats(workflowId) {
    const response = await api.get(`/workflows/${workflowId}/stats`)
    return response.data
  },

  // n8n 워크플로우 유효성 검증
  validateN8nWorkflow(jsonData) {
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
      return { valid: false, message: error.message }
    }
  },

  // JSON 문자열을 워크플로우 객체로 파싱
  parseJsonToWorkflow(jsonString) {
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
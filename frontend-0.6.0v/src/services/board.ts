import api from './api'

// 백엔드 API 응답 인터페이스
export interface BoardPost {
  post_id: string
  user_id: string
  title: string
  description: string
  workflow_id: string
  workflow_name: string
  download_count: number
  created_at: string
  updated_at: string
  author_name: string
}

export interface BoardPostsResponse {
  posts: BoardPost[]
  total: number
  limit: number
  offset: number
  has_more: boolean
}

export interface GetPostsParams {
  limit?: number
  offset?: number
  search?: string
}

export interface UpdatePostData {
  title: string
  description: string
  workflow_id: string
  workflow_name: string
}

export const boardService = {
  // 게시물 목록 가져오기
  async getPosts(params: GetPostsParams = {}): Promise<BoardPostsResponse> {
    const { limit = 50, offset = 0, search } = params
    
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    })
    
    if (search) {
      queryParams.append('search', search)
    }
    
    const response = await api.get(`/board/posts?${queryParams.toString()}`)
    return response.data
  },

  // 게시물 상세 조회
  async getPost(postId: string): Promise<BoardPost> {
    const response = await api.get(`/board/posts/${postId}`)
    return response.data
  },

  // 워크플로우 JSON 데이터 가져오기
  async getWorkflowJson(workflowId: string): Promise<any> {
    const response = await api.get(`/workflows/${workflowId}/json`)
    return response.data
  },

  // 다운로드 수 증가 (임시 비활성화)
  async incrementDownloadCount(postId: string): Promise<void> {
    console.log('조회수 증가 API 임시 비활성화:', postId)
    // 백엔드 API 엔드포인트가 확실하지 않으므로 임시 비활성화
    // TODO: 백엔드 API 문서 확인 후 올바른 엔드포인트로 수정
    return Promise.resolve()
  },

  // 게시물 수정
  async updatePost(postId: string, updateData: UpdatePostData): Promise<BoardPost> {
    const response = await api.put(`/board/posts/${postId}`, updateData)
    return response.data
  },

  // 게시물 삭제
  async deletePost(postId: string): Promise<any> {
    console.log('API 삭제 요청 URL:', `/board/posts/${postId}`)
    const response = await api.delete(`/board/posts/${postId}`)
    console.log('API 삭제 raw 응답:', response)
    return response.data
  }
}

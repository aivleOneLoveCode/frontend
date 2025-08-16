export interface Message {
  id: number
  type: 'user' | 'assistant'
  content: string
  files?: UploadedFile[]
  timestamp?: string
  isStreaming?: boolean
}

export interface UploadedFile {
  name: string
  type: string
  size: number
  content?: string
  jsonData?: any
}

export interface ChatHistoryItem {
  id: number
  title: string
  active: boolean
  messages: Message[]
}

// 백엔드 데이터베이스 스키마 그대로 사용
export interface Project {
  project_id: number
  user_id: number
  name: string
  created_at: string
  updated_at: string
  
  // UI 상태 추가
  active?: boolean  // UI 선택 상태
  expanded?: boolean  // UI 폴더 펼침 상태
  dragOver?: boolean  // UI 드래그 상태
}

export interface WorkflowItem {
  n8n_workflow_id: string
  user_id: number
  project_id: number | null  // null이면 비소속, 값이 있으면 소속
  name: string
  status: 'active' | 'inactive'  // 활성화 여부
  created_at: string
  updated_at: string
  
  // UI 상태 추가
  active?: boolean  // UI 선택 상태 (status와는 다름)
  description?: string
  n8nUrl?: string
  jsonData?: any
  isCustom?: boolean
  isRunning?: boolean  // UI 실행 표시 상태
  isDragging?: boolean  // UI 드래그 상태
  project?: Project | null  // 조인된 프로젝트 정보 (API 응답에서 포함될 수 있음)
}

export interface ExamplePrompt {
  title: string
  text: string
}

export interface NavItem {
  icon: string
  text: string
  active: boolean
}

export interface User {
  id: number
  name: string
  email: string
  avatar?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface FileUploadEvent extends Event {
  target: HTMLInputElement & EventTarget
}
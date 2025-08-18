export interface Message {
  id: number
  type: 'user' | 'assistant'
  content: any[] // Claude content blocks 형태
  timestamp: Date
  isError?: boolean
  isStreaming?: boolean
  isThinking?: boolean
  streamingText?: string
}

export interface UploadedFile {
  name: string
  type: string
  size: number
  content?: string
  jsonData?: any
}

export interface ChatHistoryItem {
  id: string // session_id는 string 타입
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
  user_id: string  // UUID 문자열
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

// n8n 워크플로우 관련 타입 정의
export interface N8nNode {
  id: string
  name: string
  type: string
  typeVersion: number
  position: [number, number]
  parameters?: Record<string, any>
  credentials?: Record<string, any>
  disabled?: boolean
  notes?: string
  notesInFlow?: boolean
  color?: string
  continueOnFail?: boolean
  alwaysOutputData?: boolean
  executeOnce?: boolean
  retryOnFail?: boolean
  maxTries?: number
  waitBetweenTries?: number
  onError?: 'stopWorkflow' | 'continueRegularOutput' | 'continueErrorOutput'
}

export interface N8nConnection {
  node: string
  type: string
  index: number
}

export interface N8nConnections {
  [nodeId: string]: {
    [connectionType: string]: N8nConnection[][]
  }
}

export interface N8nWorkflowData {
  id?: string
  name?: string
  nodes: N8nNode[]
  connections: N8nConnections
  meta?: {
    name?: string
    description?: string
    tags?: string[]
    templateCredsSetupCompleted?: boolean
    instanceId?: string
  }
  settings?: {
    executionOrder?: 'v0' | 'v1'
    saveManualExecutions?: boolean
    callerPolicy?: string
    errorWorkflow?: string
    timezone?: string
  }
  pinData?: Record<string, any>
  versionId?: string
  triggerCount?: number
}

// Vue Flow 관련 타입 (n8n에서 사용)
export interface CanvasNode {
  id: string
  type?: string
  position: { x: number; y: number }
  data: any
  selected?: boolean
  dragging?: boolean
}

export interface CanvasConnection {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  type?: string
  data?: any
}
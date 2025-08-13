export interface Message {
  id: number
  type: 'user' | 'assistant'
  content: string
  files?: string[]
  timestamp?: string
}

export interface ChatHistoryItem {
  id: number
  title: string
  active: boolean
  messages: Message[]
}

export interface WorkflowItem {
  id: number
  title: string
  active: boolean
  description?: string
  n8nUrl?: string
  jsonData?: any
  isCustom?: boolean
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
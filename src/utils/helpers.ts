// 날짜 포맷팅
export const formatDate = (date: string | Date | null): string => {
  if (!date) return ''
  
  const d = new Date(date)
  const now = new Date()
  const diffTime = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return d.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  } else if (diffDays === 1) {
    return '어제'
  } else if (diffDays < 7) {
    return `${diffDays}일 전`
  } else {
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
}

// 파일 크기 포맷팅
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 텍스트 줄임 처리
export const truncateText = (text: string | null, maxLength: number = 100): string => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 이메일 유효성 검사
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

interface PasswordStrength {
  score: number
  level: 'none' | 'weak' | 'medium' | 'strong'
  message: string
  checks?: {
    length: boolean
    lowercase: boolean
    uppercase: boolean
    numbers: boolean
    symbols: boolean
  }
}

// 비밀번호 강도 검사
export const getPasswordStrength = (password: string): PasswordStrength => {
  if (!password) return { score: 0, level: 'none', message: '' }
  
  let score = 0
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /[0-9]/.test(password),
    symbols: /[^A-Za-z0-9]/.test(password)
  }
  
  Object.values(checks).forEach(check => {
    if (check) score++
  })
  
  let level: 'weak' | 'medium' | 'strong'
  let message: string
  if (score <= 2) {
    level = 'weak'
    message = '약함'
  } else if (score <= 3) {
    level = 'medium'
    message = '보통'
  } else {
    level = 'strong'
    message = '강함'
  }
  
  return { score, level, message, checks }
}

// 디바운스 함수
export const debounce = <T extends (...args: any[]) => any>(func: T, wait: number): ((...args: Parameters<T>) => void) => {
  let timeout: number | undefined
  return function executedFunction(...args) {
    const later = (): void => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 쓰로틀 함수
export const throttle = <T extends (...args: any[]) => any>(func: T, limit: number): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 로컬 스토리지 헬퍼
export const storage = {
  get<T = any>(key: string, defaultValue: T | null = null): T | null {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error)
      return defaultValue
    }
  },
  
  set<T = any>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Error setting ${key} to localStorage:`, error)
      return false
    }
  },
  
  remove(key: string): boolean {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error)
      return false
    }
  },
  
  clear(): boolean {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Error clearing localStorage:', error)
      return false
    }
  }
}

// URL 파라미터 추출
export const getUrlParams = (): Record<string, string> => {
  const params: Record<string, string> = {}
  const searchParams = new URLSearchParams(window.location.search)
  
  for (const [key, value] of searchParams) {
    params[key] = value
  }
  
  return params
}

// 파일 다운로드
export const downloadFile = (data: string | Blob, filename: string, type: string = 'application/json'): void => {
  const blob = new Blob([data], { type })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// 파일 읽기 (JSON)
export const readJsonFile = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      try {
        if (event.target?.result && typeof event.target.result === 'string') {
          const jsonData = JSON.parse(event.target.result)
          resolve(jsonData)
        } else {
          reject(new Error('파일을 읽을 수 없습니다.'))
        }
      } catch (error) {
        reject(new Error('유효하지 않은 JSON 파일입니다.'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('파일을 읽을 수 없습니다.'))
    }
    
    reader.readAsText(file)
  })
}

// 클립보드에 복사
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    
    // fallback for older browsers
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError)
      return false
    }
  }
}

// 색상 유틸리티
export const colors = {
  // HEX를 RGB로 변환
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  },
  
  // RGB를 HEX로 변환
  rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  },
  
  // 색상의 밝기 계산
  getBrightness(hex: string): number {
    const rgb = this.hexToRgb(hex)
    if (!rgb) return 0
    return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
  },
  
  // 밝은 색상인지 판단
  isLight(hex: string): boolean {
    return this.getBrightness(hex) > 127
  }
}

// 에러 처리 유틸리티
export const handleError = (error: any, defaultMessage = '오류가 발생했습니다.'): string => {
  console.error('Error:', error)
  
  if (error.response) {
    // API 응답 에러
    return error.response.data?.message || defaultMessage
  } else if (error.message) {
    // 일반적인 에러 메시지
    return error.message
  } else {
    // 기본 메시지
    return defaultMessage
  }
}

// 랜덤 ID 생성
export const generateId = (prefix = ''): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${prefix}${timestamp}-${random}`
}

// 객체 깊은 복사
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T
  if (typeof obj === 'object') {
    const clonedObj: Record<string, any> = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone((obj as any)[key])
      }
    }
    return clonedObj as T
  }
  return obj
}
// 파일 업로드 및 처리 서비스 (고도화된 백엔드 연동)
export interface UploadedFile {
  name: string
  type: string
  size: number
  content?: string
  jsonData?: any
  base64?: string
  contentBlock?: any
}

export class FileUploadService {
  
  // 고도화된 백엔드에 맞춘 파일 처리 (이미지, PDF 지원)
  static async processUploadedFile(file: File): Promise<UploadedFile> {
    const fileType = file.type
    const fileName = file.name
    
    const uploadedFile: UploadedFile = {
      name: fileName,
      type: fileType,
      size: file.size
    }

    // 파일 크기 제한 확인
    if (fileType.startsWith('image/') && file.size > 5 * 1024 * 1024) {
      throw new Error('이미지 파일은 5MB 이하만 업로드 가능합니다.')
    }
    if (fileType === 'application/pdf' && file.size > 32 * 1024 * 1024) {
      throw new Error('PDF 파일은 32MB 이하만 업로드 가능합니다.')
    }
    
    // JSON 파일인 경우 워크플로우로 처리
    if (fileType === 'application/json' || fileName.endsWith('.json')) {
      try {
        const content = await this.readFileAsText(file)
        const jsonData = JSON.parse(content)
        
        uploadedFile.content = content
        uploadedFile.jsonData = jsonData
        
        // 워크플로우로 처리
        return uploadedFile
      } catch (error) {
        console.error('JSON 파싱 오류:', error)
        throw new Error('유효하지 않은 JSON 파일입니다.')
      }
    }
    
    // 텍스트 파일 처리
    else if (fileType.startsWith('text/') || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      try {
        const content = await this.readFileAsText(file)
        uploadedFile.content = content
        
        return uploadedFile
      } catch (error) {
        console.error('텍스트 파일 읽기 오류:', error)
        throw new Error('텍스트 파일을 읽을 수 없습니다.')
      }
    }
    
    // 이미지 파일 처리 (JPEG, PNG, GIF, WebP)
    else if (fileType.startsWith('image/') && ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(fileType)) {
      try {
        const base64 = await this.readFileAsBase64(file)
        uploadedFile.base64 = base64
        uploadedFile.contentBlock = {
          type: "image",
          source: {
            type: "base64",
            media_type: fileType,
            data: base64
          }
        }
        return uploadedFile
      } catch (error) {
        console.error('이미지 파일 처리 오류:', error)
        throw new Error('이미지 파일을 처리할 수 없습니다.')
      }
    }
    
    // PDF 파일 처리
    else if (fileType === 'application/pdf') {
      try {
        const base64 = await this.readFileAsBase64(file)
        uploadedFile.base64 = base64
        uploadedFile.contentBlock = {
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: base64
          }
        }
        return uploadedFile
      } catch (error) {
        console.error('PDF 파일 처리 오류:', error)
        throw new Error('PDF 파일을 처리할 수 없습니다.')
      }
    }
    
    // 기타 파일 형식 (기본 처리)
    else {
      try {
        const base64 = await this.readFileAsBase64(file)
        uploadedFile.base64 = base64
        uploadedFile.contentBlock = {
          type: "document",
          source: {
            type: "base64", 
            media_type: fileType || "application/octet-stream",
            data: base64
          }
        }
        return uploadedFile
      } catch (error) {
        console.error('파일 처리 오류:', error)
        // 바이너리 파일로 처리 실패 시 기본 파일 정보만 저장
        return uploadedFile
      }
    }
  }
  
  // 파일을 텍스트로 읽기
  private static readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string)
        } else {
          reject(new Error('파일을 읽을 수 없습니다.'))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('파일 읽기 중 오류가 발생했습니다.'))
      }
      
      reader.readAsText(file, 'utf-8')
    })
  }

  // 파일을 Base64로 읽기
  private static readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64 = (event.target.result as string).split(',')[1] // "data:image/png;base64," 제거
          resolve(base64)
        } else {
          reject(new Error('파일을 읽을 수 없습니다.'))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('파일 읽기 중 오류가 발생했습니다.'))
      }
      
      reader.readAsDataURL(file)
    })
  }
  
  // 파일 크기 포맷팅
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  // 파일 타입 아이콘 가져오기
  static getFileIcon(fileType: string): string {
    if (fileType.startsWith('image/')) return '🖼️'
    if (fileType.startsWith('text/') || fileType === 'application/json') return '📄'
    if (fileType.startsWith('video/')) return '🎥'
    if (fileType.startsWith('audio/')) return '🎵'
    if (fileType.includes('pdf')) return '📕'
    if (fileType.includes('word')) return '📘'
    if (fileType.includes('excel')) return '📗'
    if (fileType.includes('powerpoint')) return '📙'
    if (fileType.includes('zip') || fileType.includes('rar')) return '📦'
    return '📄'
  }
  
  // 지원되는 파일 타입 확인 (모든 파일 형식 지원)
  static isSupportedFileType(file: File): boolean {
    // 모든 파일 형식을 지원
    return true
  }

  // Claude 백엔드용 content block 배열 생성
  static createContentBlocks(text: string, files: UploadedFile[]): any[] {
    const blocks: any[] = []
    
    // 텍스트 블록 추가
    if (text.trim()) {
      blocks.push({
        type: "text",
        text: text
      })
    }
    
    // 파일 블록들 추가
    files.forEach(file => {
      if (file.contentBlock) {
        blocks.push(file.contentBlock)
      }
    })
    
    return blocks
  }
}
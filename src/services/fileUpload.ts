// 파일 업로드 및 처리 서비스 (HTML과 동일)
export interface UploadedFile {
  name: string
  type: string
  size: number
  content?: string
  jsonData?: any
}

export class FileUploadService {
  
  // HTML의 processUploadedFile 함수와 동일
  static async processUploadedFile(file: File): Promise<UploadedFile> {
    const fileType = file.type
    const fileName = file.name
    
    const uploadedFile: UploadedFile = {
      name: fileName,
      type: fileType,
      size: file.size
    }
    
    // JSON 파일인 경우 워크플로우로 처리
    if (fileType === 'application/json' || fileName.endsWith('.json')) {
      try {
        const content = await this.readFileAsText(file)
        const jsonData = JSON.parse(content)
        
        uploadedFile.content = content
        uploadedFile.jsonData = jsonData
        
        console.log('JSON 파일 업로드됨:', fileName)
        console.log('JSON 데이터:', jsonData)
        
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
        
        console.log('텍스트 파일 업로드됨:', fileName)
        return uploadedFile
      } catch (error) {
        console.error('텍스트 파일 읽기 오류:', error)
        throw new Error('텍스트 파일을 읽을 수 없습니다.')
      }
    }
    
    // 이미지 파일 처리
    else if (fileType.startsWith('image/')) {
      console.log('이미지 파일 업로드됨:', fileName)
      return uploadedFile
    }
    
    // 기타 파일 처리
    else {
      console.log('기타 파일 업로드됨:', fileName)
      return uploadedFile
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
  
  // 지원되는 파일 타입 확인
  static isSupportedFileType(file: File): boolean {
    const supportedTypes = [
      'application/json',
      'text/plain',
      'text/markdown',
      'text/csv',
      'text/html',
      'text/css',
      'text/javascript',
      'application/javascript',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ]
    
    const supportedExtensions = [
      '.json', '.txt', '.md', '.csv', '.html', '.css', '.js', '.ts',
      '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'
    ]
    
    return supportedTypes.includes(file.type) || 
           supportedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
  }
}
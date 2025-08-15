import { ref } from 'vue'
import { useWorkflowManagement } from './useWorkflowManagement'

export function useFileHandling() {
  const isDragging = ref(false)
  const { addWorkflow } = useWorkflowManagement()

  const parseJsonToWorkflow = (jsonContent: string | object, fileName: string | null = null) => {
    try {
      const parsedJson = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent
      
      if (parsedJson.nodes && Array.isArray(parsedJson.nodes)) {
        const title = fileName ? fileName.replace('.json', '') : 
                     parsedJson.name || `워크플로우 ${Date.now()}`
        
        addWorkflow(title, parsedJson)
        return true
      }
      return false
    } catch (error) {
      console.error('JSON 파싱 오류:', error)
      return false
    }
  }

  const processUploadedFile = (file: File) => {
    const fileType = file.type
    const fileName = file.name
    
    if (fileType === 'application/json' || fileName.endsWith('.json')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const jsonContent = e.target?.result as string
        if (parseJsonToWorkflow(jsonContent, fileName)) {
          console.log(`워크플로우 "${fileName.replace('.json', '')}"가 성공적으로 업로드되었습니다.`)
        } else {
          console.log(`"${fileName}" 파일이 업로드되었습니다. (JSON 형식이지만 워크플로우 형식이 아닙니다)`)
        }
      }
      reader.readAsText(file)
    }
    else if (fileType.startsWith('image/')) {
      console.log(`이미지 파일 "${fileName}"이 업로드되었습니다. (크기: ${(file.size / 1024).toFixed(1)}KB)`)
    }
    else if (fileType.startsWith('text/') || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const textContent = e.target?.result as string
        const preview = textContent.length > 100 ? textContent.substring(0, 100) + '...' : textContent
        console.log(`텍스트 파일 "${fileName}"이 업로드되었습니다.\n\n미리보기:\n${preview}`)
      }
      reader.readAsText(file)
    }
    else {
      const fileSize = file.size > 1024 * 1024 ? 
                      `${(file.size / (1024 * 1024)).toFixed(1)}MB` : 
                      `${(file.size / 1024).toFixed(1)}KB`
      console.log(`파일 "${fileName}"이 업로드되었습니다. (타입: ${fileType || '알 수 없음'}, 크기: ${fileSize})`)
    }
  }

  const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
      processUploadedFile(file)
      target.value = ''
    }
  }

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    isDragging.value = true
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!(e.currentTarget as Element)?.contains(e.relatedTarget as Node)) {
      isDragging.value = false
    }
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    isDragging.value = false
    
    const files = e.dataTransfer?.files
    if (files && files.length > 0) {
      processUploadedFile(files[0])
    }
  }

  return {
    isDragging,
    handleFileUpload,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    processUploadedFile,
    parseJsonToWorkflow
  }
}
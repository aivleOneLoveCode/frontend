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
        parseJsonToWorkflow(jsonContent, fileName)
      }
      reader.readAsText(file)
    }
    else if (fileType.startsWith('image/')) {
      // 이미지 파일 처리
    }
    else if (fileType.startsWith('text/') || fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        // 텍스트 파일 처리 완료
      }
      reader.readAsText(file)
    }
    else {
      // 기타 파일 처리 완료
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
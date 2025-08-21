import { ref, computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useBoardStore } from '@/stores/board'
import { FileUploadService, type UploadedFile } from '@/services/fileUpload'

export function useChatManagement() {
  const chatStore = useChatStore()
  const boardStore = useBoardStore()
  
  // 로컬 상태
  const inputText = ref('')
  const isDragging = ref(false)
  
  // Computed properties
  const messages = computed(() => chatStore.currentMessages)
  const showWelcome = computed(() => messages.value.length === 0)
  const uploadedFiles = computed(() => chatStore.uploadedFiles)

  // 채팅 기능
  const sendMessage = async () => {
    if (!inputText.value.trim() && uploadedFiles.value.length === 0) {
      return
    }
    if (!chatStore.canSendMessage) {
      return
    }

    // 메시지 내용 저장 후 즉시 초기화
    const messageText = inputText.value
    const files = [...uploadedFiles.value]
    inputText.value = ''
    chatStore.uploadedFiles = [] // 메시지 전송 후 업로드된 파일 목록 초기화

    try {
      await chatStore.sendMessage(messageText, files)
    } catch (error) {
      console.error('메시지 전송 실패:', error)
      // 실패 시 원래 텍스트 복구
      inputText.value = messageText
    }
  }

  // 새 채팅 시작
  const newChat = () => {
    chatStore.startNewChat()
    inputText.value = ''
  }

  // 채팅 중단
  const stopMessage = async () => {
    try {
      await chatStore.stopMessage()
    } catch (error) {
      console.error('메시지 중단 실패:', error)
    }
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      if (event.shiftKey) {
        // Shift+Enter: 줄바꿈 (기본 동작)
        return
      } else {
        // Enter: 메시지 전송
        event.preventDefault()
        sendMessage()
      }
    }
  }

  // 파일 처리
  const handleFileUpload = async (event: Event) => {
    const input = event.target as HTMLInputElement
    if (!input.files) return

    for (const file of Array.from(input.files)) {
      try {
        if (FileUploadService.isSupportedFileType(file)) {
          const processedFile = await FileUploadService.processUploadedFile(file)
          chatStore.addUploadedFile(processedFile)
        } else {
          alert('지원하지 않는 파일 형식입니다.')
        }
      } catch (error) {
        console.error('파일 처리 오류:', error)
        alert('파일 처리 중 오류가 발생했습니다.')
      }
    }
    
    // 입력 초기화
    input.value = ''
  }

  const handleDragEnter = (event: DragEvent) => {
    event.preventDefault()
    isDragging.value = true
  }

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
  }

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault()
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const x = event.clientX
    const y = event.clientY
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      isDragging.value = false
    }
  }

  const handleDrop = async (event: DragEvent) => {
    event.preventDefault()
    isDragging.value = false
    
    // 워크플로우 드래그 확인 (JSON 파싱 방식)
    const dragData = event.dataTransfer?.getData('text/plain')
    
    console.log('드래그 데이터:', dragData)
    
    if (dragData) {
      try {
        const parsed = JSON.parse(dragData)
        console.log('파싱된 데이터:', parsed)
        const workflowId = parsed.n8n_workflow_id
        const workflowName = parsed.name
        
        console.log('워크플로우 ID:', workflowId, '이름:', workflowName)
        
        if (workflowId && workflowName) {
          // 워크플로우를 첨부하는 경우
          try {
            const token = localStorage.getItem('auth_token')
            if (!token) {
              alert('로그인이 필요합니다.')
              return
            }

            // 워크플로우 JSON 데이터 가져오기
            const response = await fetch(`/api/workflows/${workflowId}/json`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            })

            if (response.ok) {
              const workflowJson = await response.json()
              
              // 워크플로우 JSON을 파일처럼 처리
              const workflowFile = {
                name: `${workflowName}.json`,
                type: 'application/json',
                size: JSON.stringify(workflowJson).length,
                content: JSON.stringify(workflowJson, null, 2),
                jsonData: workflowJson,
                contentBlock: {
                  type: "text",
                  text: `=== 워크플로우: ${workflowName} ===\n${JSON.stringify(workflowJson, null, 2)}\n=== 워크플로우 끝 ===`
                }
              }
              
              chatStore.addUploadedFile(workflowFile)
              console.log('워크플로우가 첨부되었습니다:', workflowName)
            } else {
              console.error('워크플로우 API 응답 오류:', response.status, response.statusText)
              alert(`워크플로우 데이터를 가져올 수 없습니다. (${response.status})`)
            }
          } catch (error) {
            console.error('워크플로우 첨부 오류:', error)
            alert('워크플로우 첨부 중 오류가 발생했습니다.')
          }
          return
        }
      } catch (error) {
        // JSON 파싱 실패 시 일반 파일 드래그로 처리
        console.log('JSON 파싱 실패, 일반 파일로 처리:', error)
      }
    }
    
    // 일반 파일 드래그의 경우
    const files = event.dataTransfer?.files
    if (!files) return

    for (const file of Array.from(files)) {
      try {
        if (FileUploadService.isSupportedFileType(file)) {
          const processedFile = await FileUploadService.processUploadedFile(file)
          chatStore.addUploadedFile(processedFile)
        } else {
          alert(`지원하지 않는 파일 형식입니다: ${file.name}`)
        }
      } catch (error) {
        console.error('파일 처리 오류:', error)
        alert(`파일 처리 중 오류가 발생했습니다: ${file.name}`)
      }
    }
  }

  const removeUploadedFile = (index: number) => {
    chatStore.removeUploadedFile(index)
  }

  // 파일 관련 유틸리티 함수들
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf': return '📄'
      case 'doc':
      case 'docx': return '📝'
      case 'xls':
      case 'xlsx': return '📊'
      case 'ppt':
      case 'pptx': return '📋'
      case 'txt': return '📄'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return '🖼️'
      case 'mp4':
      case 'avi':
      case 'mov': return '🎥'
      case 'mp3':
      case 'wav': return '🎵'
      default: return '📎'
    }
  }

  // 파일을 게시판에 공유
  const shareFileToBoard = async (file: any, index: number) => {
    try {
      await boardStore.shareFileToBoard(file)
      alert(`${file.name} 파일이 게시판에 성공적으로 공유되었습니다!`)
      
      // 공유 후 파일을 업로드 목록에서 제거 (선택사항)
      // chatStore.removeUploadedFile(index)
    } catch (error) {
      console.error('파일 공유 실패:', error)
      alert('파일 공유 중 오류가 발생했습니다.')
    }
  }

  // 모든 파일을 게시판에 공유
  const shareAllFilesToBoard = async () => {
    try {
      const files = uploadedFiles.value
      if (files.length === 0) {
        alert('공유할 파일이 없습니다.')
        return
      }
      
      await boardStore.shareFilesToBoard(files)
      alert(`${files.length}개의 파일이 게시판에 성공적으로 공유되었습니다!`)
      
      // 공유 후 모든 파일을 업로드 목록에서 제거 (선택사항)
      // files.forEach((_, index) => chatStore.removeUploadedFile(index))
    } catch (error) {
      console.error('모든 파일 공유 실패:', error)
      alert('파일 공유 중 오류가 발생했습니다.')
    }
  }

  return {
    // 상태
    messages,
    inputText,
    showWelcome,
    uploadedFiles,
    isDragging,
    
    // 채팅 기능
    sendMessage,
    stopMessage,
    newChat,
    handleKeydown,
    
    // 파일 처리
    handleFileUpload,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeUploadedFile,
    formatFileSize,
    getFileIcon,
    
    // 게시판 공유
    shareFileToBoard,
    shareAllFilesToBoard,
    
    // Store 접근
    chatStore,
    boardStore
  }
}
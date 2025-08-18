import { ref, nextTick } from 'vue'
import type { Message, ChatHistoryItem, ExamplePrompt, UploadedFile } from '../types'
import { useFolderManagement } from './useFolderManagement'
import { chatStream, type StreamUpdate } from '../services/chatStream'
import { FileUploadService } from '../services/fileUpload'

export function useChatManagement() {
  // 폴더 관리 composable 사용
  const { checkForWorkflowInMessage } = useFolderManagement()
  
  const messages = ref<Message[]>([])
  const inputText = ref('')
  const showWelcome = ref(true)
  const currentChatId = ref<number | null>(null)
  const uploadedFiles = ref<UploadedFile[]>([])
  const isDragging = ref(false)
  
  // 백엔드 연결 상태 (HTML과 동일)
  const isBackendConnected = ref(false)
  const backendStatus = ref('연결 확인 중...')

  const chatHistoryItems = ref<ChatHistoryItem[]>([
    { id: 1, title: 'Git pull 동작 설명', active: false, messages: [] },
    { id: 2, title: '프론트엔드 코드 예시', active: false, messages: [] },
    { id: 3, title: 'Git 저장소 올리기', active: false, messages: [] },
    { id: 4, title: 'React 실행 방법', active: false, messages: [] },
    { id: 5, title: 'MCP 서버 추천', active: false, messages: [] },
    { id: 6, title: 'Python 환경변수 편집', active: false, messages: [] },
    { id: 7, title: '이 두 사람 누구인가', active: false, messages: [] },
    { id: 8, title: 'MCP Client 연결 오류', active: false, messages: [] },
  ])

  // HTML과 동일한 실시간 스트리밍 테스트 함수
  const testStreamingChat = (currentInput: string) => {
    // 채팅 생성 로직 (기존과 동일)
    if (currentChatId.value === null) {
      const newChatTitle = currentInput.length > 20 ? currentInput.substring(0, 20) + '...' : currentInput
      const newChatId = Date.now()
      
      chatHistoryItems.value.forEach(item => item.active = false)
      
      chatHistoryItems.value.unshift({
        id: newChatId,
        title: newChatTitle,
        active: true,
        messages: []
      })
      
      currentChatId.value = newChatId
    }

    showWelcome.value = false
    
    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: currentInput,
      files: uploadedFiles.value.length > 0 ? [...uploadedFiles.value] : undefined
    }

    messages.value.push(userMessage)
    
    const currentChat = chatHistoryItems.value.find(item => item.id === currentChatId.value)
    if (currentChat) {
      currentChat.messages.push(userMessage)
    }
    
    inputText.value = ''
    uploadedFiles.value = [] // 메시지 전송 후 업로드된 파일 목록 초기화

    nextTick(() => {
      scrollToBottom()
    })

    // 실시간 스트리밍 시작
    
    const assistantMessage: Message = {
      id: Date.now() + 1,
      type: 'assistant',
      content: '연결 중...',
      isStreaming: true
    }
    
    messages.value.push(assistantMessage)
    
    if (currentChat) {
      currentChat.messages.push(assistantMessage)
    }

    // 실시간 스트리밍 호출
    chatStream.sendMessage(currentInput, (data) => {
      handleStreamingUpdate(data, assistantMessage)
    })
  }

  // 스트리밍 업데이트 처리 (HTML과 동일)
  const handleStreamingUpdate = (data: StreamUpdate, assistantMessage: Message) => {
    
    switch (data.type) {
      case 'thinking_start':
        assistantMessage.content = '🤔 생각 중...'
        break
        
      case 'thinking_delta':
        if (data.text) {
          assistantMessage.content = '🤔 생각 중: ' + data.text.substring(0, 50) + '...'
        }
        break
        
      case 'thinking_stop':
        assistantMessage.content = '💬 답변 준비 중...'
        break
        
      case 'text_start':
        assistantMessage.content = ''
        break
        
      case 'text_delta':
        if (data.text) {
          assistantMessage.content += data.text
        }
        break
        
      case 'complete':
        assistantMessage.isStreaming = false
        break
        
      case 'error':
        assistantMessage.content = '❌ 오류: ' + data.message
        assistantMessage.isStreaming = false
        break
    }
    
    // Vue 반응성 트리거
    messages.value = [...messages.value]
    
    nextTick(() => {
      scrollToBottom()
    })
  }

  const sendMessage = () => {
    if (!inputText.value.trim()) return

    const currentInput = inputText.value
    
    // 모든 메시지에서 실시간 스트리밍 사용 (HTML과 동일)
    testStreamingChat(currentInput)
  }

  const newChat = () => {
    messages.value = []
    inputText.value = ''
    showWelcome.value = true
    currentChatId.value = null
    chatHistoryItems.value.forEach(item => item.active = false)
  }

  const selectChatHistory = (selectedItem: ChatHistoryItem) => {
    chatHistoryItems.value.forEach(item => item.active = false)
    selectedItem.active = true
    currentChatId.value = selectedItem.id
    
    showWelcome.value = false
    messages.value = [...selectedItem.messages]
  }

  const useExamplePrompt = (prompt: ExamplePrompt) => {
    inputText.value = prompt.text
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  const scrollToBottom = () => {
    const messagesContainer = document.querySelector('.messages')
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
  }

  // 파일 업로드 처리 (HTML의 handleFileUpload와 동일)
  const handleFileUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
      try {
        const uploadedFile = await FileUploadService.processUploadedFile(file)
        uploadedFiles.value.push(uploadedFile)
        
        // 파일 업로드 후 워크플로우로 처리되는 경우
        if (uploadedFile.jsonData && uploadedFile.name.endsWith('.json')) {
          // 워크플로우 파일 처리 로직 추가 가능
        }
        
        // 파일 입력 초기화
        target.value = ''
      } catch (error) {
        console.error('파일 업로드 오류:', error)
        alert('파일 업로드 중 오류가 발생했습니다: ' + (error as Error).message)
      }
    }
  }

  // 드래그 앤 드롭 이벤트 핸들러들 (HTML과 동일)
  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault()
    isDragging.value = true
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    return false
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      isDragging.value = false
    }
    return false
  }

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault()
    isDragging.value = false
    
    const files = e.dataTransfer?.files
    if (files && files.length > 0) {
      // 첫 번째 파일만 처리 (여러 파일 업로드 시 확장 가능)
      try {
        const uploadedFile = await FileUploadService.processUploadedFile(files[0])
        uploadedFiles.value.push(uploadedFile)
      } catch (error) {
        console.error('드래그앤드롭 파일 업로드 오류:', error)
        alert('파일 업로드 중 오류가 발생했습니다: ' + (error as Error).message)
      }
    }
  }

  // 업로드된 파일 제거
  const removeUploadedFile = (index: number) => {
    uploadedFiles.value.splice(index, 1)
  }

  // 파일 크기 포맷팅
  const formatFileSize = FileUploadService.formatFileSize

  // 파일 아이콘 가져오기
  const getFileIcon = FileUploadService.getFileIcon

  // 백엔드 연결 확인 (HTML의 checkBackendConnection과 동일)
  const checkBackendConnection = async () => {
    const connected = await chatStream.checkBackend()
    isBackendConnected.value = connected
    backendStatus.value = connected ? 
      '백엔드 서버 연결됨' : 
      '백엔드 서버 연결 실패 - 서버가 실행 중인지 확인하세요'
  }


  return {
    messages,
    inputText,
    showWelcome,
    chatHistoryItems,
    currentChatId,
    uploadedFiles,
    isDragging,
    isBackendConnected,
    backendStatus,
    sendMessage,
    newChat,
    selectChatHistory,
    useExamplePrompt,
    handleKeydown,
    scrollToBottom,
    testStreamingChat,
    handleStreamingUpdate,
    chatStream,
    handleFileUpload,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeUploadedFile,
    formatFileSize,
    getFileIcon,
    checkBackendConnection
  }
}
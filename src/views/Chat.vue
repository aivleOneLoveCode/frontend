<template>
  <!-- 채팅 영역 -->
  <ChatArea
    :showWelcome="showWelcome"
    :messages="messages"
    :inputText="inputText"
    :isDragging="isDragging"
    :uploadedFiles="uploadedFiles"
    :formatFileSize="formatFileSize"
    :getFileIcon="getFileIcon"
    :isProcessing="chatStore.isProcessing"
    @send-message="sendMessage"
    @stop-message="stopMessage"
    @handle-keydown="handleKeydown"
    @handle-file-upload="handleFileUpload"
    @handle-drag-enter="handleDragEnter"
    @handle-drag-over="handleDragOver"
    @handle-drag-leave="handleDragLeave"
    @handle-drop="handleDrop"
    @update:input-text="inputText = $event"
    @remove-uploaded-file="removeUploadedFile"
    @share-file-to-board="shareFileToBoard"
    @share-all-files-to-board="shareAllFilesToBoard"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ChatArea from '@/components/ChatArea.vue'
import { useChatStore } from '@/stores/chat'
import { useBoardStore } from '@/stores/board'
import { FileUploadService } from '@/services/fileUpload'

const chatStore = useChatStore()
const boardStore = useBoardStore()

// 채팅 관련 상태
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

  try {
    await chatStore.sendMessage(messageText, files)
  } catch (error) {
    console.error('메시지 전송 실패:', error)
    // 실패 시 원래 텍스트 복구
    inputText.value = messageText
  }
}

// 채팅 중단
const stopMessage = async () => {
  try {
    await chatStore.stopMessage()
  } catch (error) {
    console.error('메시지 중단 실패:', error)
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
</script>

<style scoped>
/* Chat 컴포넌트 전용 스타일 (필요시 추가) */
</style>
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
    @send-message="sendMessage"
    @handle-keydown="handleKeydown"
    @handle-file-upload="handleFileUpload"
    @handle-drag-enter="handleDragEnter"
    @handle-drag-over="handleDragOver"
    @handle-drag-leave="handleDragLeave"
    @handle-drop="handleDrop"
    @update:input-text="inputText = $event"
    @remove-uploaded-file="removeUploadedFile"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ChatArea from '@/components/ChatArea.vue'
import { useChatStore } from '@/stores/chat'
import { FileUploadService } from '@/services/fileUpload'

const chatStore = useChatStore()

// 채팅 관련 상태
const inputText = ref('')
const isDragging = ref(false)

// Computed properties
const messages = computed(() => chatStore.currentMessages)
const showWelcome = computed(() => messages.value.length === 0)
const uploadedFiles = computed(() => chatStore.uploadedFiles)

// 채팅 기능
const sendMessage = async () => {
  console.log('🚨 [Chat.vue] sendMessage 함수 호출됨!')
  console.log('🚨 [Chat.vue] inputText:', inputText.value)
  console.log('🚨 [Chat.vue] uploadedFiles:', uploadedFiles.value)
  console.log('🚨 [Chat.vue] canSendMessage:', chatStore.canSendMessage)
  
  if (!inputText.value.trim() && uploadedFiles.value.length === 0) {
    console.log('🚨 [Chat.vue] 메시지가 비어있음 - 종료')
    return
  }
  if (!chatStore.canSendMessage) {
    console.log('🚨 [Chat.vue] canSendMessage가 false - 종료')
    return
  }

  try {
    console.log('🚨 [Chat.vue] chatStore.sendMessage 호출 전')
    await chatStore.sendMessage(inputText.value, uploadedFiles.value)
    console.log('🚨 [Chat.vue] chatStore.sendMessage 호출 후')
    inputText.value = ''
  } catch (error) {
    console.error('🚨 [Chat.vue] 메시지 전송 실패:', error)
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
  console.log('🚨 [Chat.vue] handleKeydown 호출됨! key:', event.key)
  if (event.key === 'Enter') {
    if (event.shiftKey) {
      // Shift+Enter: 줄바꿈 (기본 동작)
      console.log('🚨 [Chat.vue] Shift+Enter 감지 - 줄바꿈')
      return
    } else {
      // Enter: 메시지 전송
      console.log('🚨 [Chat.vue] Enter 감지 - sendMessage 호출!')
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
</script>

<style scoped>
/* Chat 컴포넌트 전용 스타일 (필요시 추가) */
</style>
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
import ChatArea from '@/components/ChatArea.vue'

// Props (부모 컴포넌트인 Home.vue에서 전달받음)
defineProps<{
  messages: any[]
  inputText: string
  showWelcome: boolean
  isDragging: boolean
  uploadedFiles: any[]
}>()

// Events (부모 컴포넌트로 전달)
defineEmits<{
  'send-message': [message: string, files?: File[]]
  'handle-keydown': [event: KeyboardEvent]
  'handle-file-upload': [files: FileList]
  'handle-drag-enter': [event: DragEvent]
  'handle-drag-over': [event: DragEvent]
  'handle-drag-leave': [event: DragEvent]
  'handle-drop': [event: DragEvent]
  'update:input-text': [value: string]
  'remove-uploaded-file': [index: number]
}>()

// 파일 관련 유틸리티 함수들은 부모에서 전달받지 않고 직접 정의
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
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
    :isStopRequested="chatStore.isStopRequested"
    :canSendMessage="chatStore.canSendMessage"
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
import ChatArea from '@/components/ChatArea.vue'
import { useChatManagement } from '@/composables/useChatManagement'

// useChatManagement composable 사용
const {
  // 상태
  messages,
  inputText,
  showWelcome,
  uploadedFiles,
  isDragging,
  
  // 채팅 기능
  sendMessage,
  stopMessage,
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
  chatStore
} = useChatManagement()

</script>

<style scoped>
/* Chat 컴포넌트 전용 스타일 (필요시 추가) */
</style>
<template>
  <form @submit="handleSubmit">
    <div 
      :class="[
        'relative flex items-end gap-2 p-2 border border-gray-300 rounded-2xl bg-background transition-all',
        {
          'ring-2 ring-primary border-primary bg-primary/5': isDragging,
          'border-gray-400 shadow-md': message.trim() && !isDragging,
          'border-gray-300 hover:shadow-sm': !message.trim() && !isDragging
        }
      ]"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
    >
      <input
        ref="fileInputRef"
        type="file"
        multiple
        class="hidden"
        @change="handleFileSelect"
      />
      
      <button
        type="button"
        class="shrink-0 h-9 w-9 hover:bg-muted rounded-xl flex items-center justify-center bg-transparent border-0 cursor-pointer transition-colors"
        @click="() => fileInputRef?.click()"
      >
        <PlusIcon />
      </button>

      <div class="flex-1 relative min-h-[24px]">
        <textarea
          ref="textareaRef"
          v-model="message"
          @input="handleTextareaChange"
          placeholder="메시지 보내기"
          class="chat-input min-h-[24px] max-h-[200px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 p-2 text-[15px] leading-6 placeholder:text-muted-foreground/70 w-full outline-none"
          rows="1"
          @keydown="handleKeyDown"
        />
        
        <div 
          v-if="isDragging"
          class="absolute inset-0 rounded-xl flex items-center justify-center text-primary bg-primary/5 border-2 border-dashed border-primary"
        >
          <div class="flex items-center gap-2 text-sm font-medium">
            <PaperclipIcon />
            <span>파일을 여기에 드롭하세요</span>
          </div>
        </div>
      </div>
      
      <button
        type="submit"
        :disabled="!message.trim()"
        :class="[
          'shrink-0 h-8 w-8 rounded-lg transition-all flex items-center justify-center border-0',
          message.trim() 
            ? 'bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer' 
            : 'bg-muted text-muted-foreground cursor-not-allowed'
        ]"
      >
        <SendIcon />
      </button>
    </div>
    
    <div class="mt-2 px-3">
      <p class="text-xs text-muted-foreground/70 text-center">
        Enter를 눌러 전송, Shift+Enter로 줄바꿈
      </p>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  onFileUpload: (files: File[]) => void
  onTypingStart?: () => void
}

const props = defineProps<ChatInputProps>()

const message = ref('')
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement>()
const textareaRef = ref<HTMLTextAreaElement>()

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  if (message.value.trim()) {
    props.onSendMessage(message.value)
    message.value = ''
    props.onTypingStart?.()
    // 텍스트 영역 높이 리셋
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
    }
  }
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || [])
  if (files.length > 0) {
    props.onFileUpload(files)
  }
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
  const files = Array.from(e.dataTransfer?.files || [])
  if (files.length > 0) {
    props.onFileUpload(files)
  }
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  if (!e.currentTarget?.contains(e.relatedTarget as Node)) {
    isDragging.value = false
  }
}

const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
  element.style.height = 'auto'
  element.style.height = `${Math.min(element.scrollHeight, 200)}px`
}

const handleTextareaChange = (e: Event) => {
  const target = e.target as HTMLTextAreaElement
  adjustTextareaHeight(target)
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSubmit(e)
  }
}
</script>

<!-- Plus Icon Component -->
<script lang="ts">
const PlusIcon = {
  name: 'PlusIcon',
  template: `
    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  `
}

const SendIcon = {
  name: 'SendIcon', 
  template: `
    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m12 19 7-7 3 3-7 7-3-3z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m2 2 20 20" />
    </svg>
  `
}

const PaperclipIcon = {
  name: 'PaperclipIcon',
  template: `
    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49" />
    </svg>
  `
}

export { PlusIcon, SendIcon, PaperclipIcon }
</script>
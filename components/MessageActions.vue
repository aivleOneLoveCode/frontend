<template>
  <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
    <button
      class="h-6 w-6 p-0 bg-transparent border-0 cursor-pointer hover:bg-gray-100 rounded flex items-center justify-center"
      @click="handleCopy"
    >
      <CheckIcon v-if="copied" />
      <CopyIcon v-else />
    </button>
    
    <template v-if="!isUser">
      <button
        :class="[
          'h-6 w-6 p-0 bg-transparent border-0 cursor-pointer hover:bg-gray-100 rounded flex items-center justify-center',
          { 'text-green-600': feedback === 'like' }
        ]"
        @click="() => handleFeedback('like')"
      >
        <ThumbsUpIcon />
      </button>
      
      <button
        :class="[
          'h-6 w-6 p-0 bg-transparent border-0 cursor-pointer hover:bg-gray-100 rounded flex items-center justify-center',
          { 'text-red-600': feedback === 'dislike' }
        ]"
        @click="() => handleFeedback('dislike')"
      >
        <ThumbsDownIcon />
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface MessageActionsProps {
  message: string
  messageId: string
  isUser: boolean
  onFeedback?: (messageId: string, type: 'like' | 'dislike') => void
}

const props = defineProps<MessageActionsProps>()

const copied = ref(false)
const feedback = ref<'like' | 'dislike' | null>(null)

// Simple toast function (you may want to replace with a proper toast library)
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  // For now, using console.log - you can replace with your preferred toast implementation
  console.log(`${type.toUpperCase()}: ${message}`)
}

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(props.message)
    copied.value = true
    showToast("메시지가 복사되었습니다", 'success')
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    showToast("복사에 실패했습니다", 'error')
  }
}

const handleFeedback = (type: 'like' | 'dislike') => {
  feedback.value = type
  props.onFeedback?.(props.messageId, type)
  showToast(type === 'like' ? "좋아요를 누르셨습니다" : "싫어요를 누르셨습니다", 'success')
}
</script>

<!-- Icon Components -->
<script lang="ts">
const CopyIcon = {
  name: 'CopyIcon',
  template: `
    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  `
}

const CheckIcon = {
  name: 'CheckIcon',
  template: `
    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
    </svg>
  `
}

const ThumbsUpIcon = {
  name: 'ThumbsUpIcon',
  template: `
    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  `
}

const ThumbsDownIcon = {
  name: 'ThumbsDownIcon',
  template: `
    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
    </svg>
  `
}

export { CopyIcon, CheckIcon, ThumbsUpIcon, ThumbsDownIcon }
</script>
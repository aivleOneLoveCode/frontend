<template>
  <div class="relative">
    <span class="whitespace-pre-wrap leading-relaxed">
      {{ displayedContent }}
    </span>
    <span 
      v-if="!isComplete"
      class="inline-block w-2 h-5 bg-current ml-1 animate-blink"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

interface StreamingMessageProps {
  content: string
  onComplete?: () => void
}

const props = defineProps<StreamingMessageProps>()

const displayedContent = ref('')
const isComplete = ref(false)
let interval: ReturnType<typeof setInterval> | null = null

const startStreaming = () => {
  if (props.content.length === 0) return

  let currentIndex = 0
  interval = setInterval(() => {
    if (currentIndex < props.content.length) {
      displayedContent.value = props.content.slice(0, currentIndex + 1)
      currentIndex++
    } else {
      isComplete.value = true
      if (interval) {
        clearInterval(interval)
        interval = null
      }
      props.onComplete?.()
    }
  }, 30) // 30ms 간격으로 한 글자씩 표시
}

// Watch for content changes to restart streaming
watch(() => props.content, (newContent) => {
  if (interval) {
    clearInterval(interval)
    interval = null
  }
  displayedContent.value = ''
  isComplete.value = false
  startStreaming()
}, { immediate: true })

onUnmounted(() => {
  if (interval) {
    clearInterval(interval)
  }
})
</script>

<style scoped>
@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

.animate-blink {
  animation: blink 0.8s infinite;
}
</style>
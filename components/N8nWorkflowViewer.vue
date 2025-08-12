<template>
  <div 
    v-if="!isValidUrl(url)"
    :class="`flex flex-col items-center justify-center bg-red-50 border border-red-200 rounded-lg ${className}`"
    :style="{ width: `${width}px`, height: `${height}px` }"
  >
    <AlertCircleIcon />
    <p class="text-sm text-red-700">유효하지 않은 URL입니다</p>
    <p class="text-xs text-red-600 mt-1">{{ url }}</p>
  </div>
  
  <div 
    v-else
    :class="`relative bg-white border rounded-lg overflow-hidden ${className}`"
    :style="{ width: `${width}px`, height: `${height}px` }"
  >
    <div 
      v-if="isLoading"
      class="absolute inset-0 flex items-center justify-center bg-gray-50 z-10"
    >
      <div class="flex flex-col items-center gap-2">
        <Loader2Icon />
        <p class="text-sm text-gray-600">n8n 워크플로우를 로드하는 중...</p>
      </div>
    </div>

    <div 
      v-if="hasError"
      class="absolute inset-0 flex flex-col items-center justify-center bg-yellow-50 border border-yellow-200 z-10"
    >
      <AlertCircleIcon class="w-8 h-8 text-yellow-600 mb-2" />
      <p class="text-sm text-yellow-800 mb-2">워크플로우를 로드할 수 없습니다</p>
      <button
        class="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded bg-transparent hover:bg-gray-50 cursor-pointer"
        @click="handleOpenInNewTab"
      >
        <ExternalLinkIcon />
        새 탭에서 열기
      </button>
    </div>
    
    <template v-if="!hasError">
      <iframe
        :src="embedUrl"
        :width="width"
        :height="height"
        frameBorder="0"
        @load="handleIframeLoad"
        @error="handleIframeError"
        class="w-full h-full"
        sandbox="allow-scripts allow-same-origin allow-forms"
        referrerpolicy="strict-origin-when-cross-origin"
        title="n8n Workflow"
      />
      
      <!-- Open in new tab button -->
      <button
        class="absolute top-2 right-2 w-6 h-6 bg-white/80 hover:bg-white shadow-sm opacity-70 hover:opacity-100 transition-opacity rounded flex items-center justify-center border-0 cursor-pointer"
        @click="handleOpenInNewTab"
      >
        <ExternalLinkIcon class="w-3 h-3" />
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface N8nWorkflowViewerProps {
  url: string
  width?: number
  height?: number
  className?: string
}

const props = withDefaults(defineProps<N8nWorkflowViewerProps>(), {
  width: 300,
  height: 200,
  className: ''
})

const isLoading = ref(true)
const hasError = ref(false)

// URL validation
const isValidUrl = (urlString: string) => {
  try {
    new URL(urlString)
    return true
  } catch (e) {
    return false
  }
}

// Convert n8n URL to embeddable form
const getEmbedUrl = (originalUrl: string) => {
  try {
    const url = new URL(originalUrl)
    
    // Check n8n workflow URL pattern
    if (url.pathname.includes('/workflow/')) {
      // Check if it's already an embed URL
      if (!url.searchParams.has('embed')) {
        url.searchParams.set('embed', 'true')
        url.searchParams.set('mode', 'readonly') // Read-only mode
      }
      return url.toString()
    }
    
    return originalUrl
  } catch (e) {
    return originalUrl
  }
}

const embedUrl = computed(() => getEmbedUrl(props.url))

const handleIframeLoad = () => {
  isLoading.value = false
  hasError.value = false
}

const handleIframeError = () => {
  isLoading.value = false
  hasError.value = true
}

const handleOpenInNewTab = () => {
  window.open(props.url, '_blank', 'noopener,noreferrer')
}
</script>

<!-- Icon Components -->
<script lang="ts">
const Loader2Icon = {
  name: 'Loader2Icon',
  template: `
    <svg class="w-6 h-6 animate-spin text-gray-500" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
    </svg>
  `
}

const AlertCircleIcon = {
  name: 'AlertCircleIcon',
  template: `
    <svg class="w-8 h-8 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" x2="12" y1="8" y2="12"/>
      <line x1="12" x2="12.01" y1="16" y2="16"/>
    </svg>
  `
}

const ExternalLinkIcon = {
  name: 'ExternalLinkIcon',
  template: `
    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  `
}

export { Loader2Icon, AlertCircleIcon, ExternalLinkIcon }
</script>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
<template>
  <header class="border-b border-gray-200 bg-white px-4 py-3 flex justify-between items-center shrink-0">
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
          <MessageSquareIcon class="w-4 h-4 text-white" />
        </div>
        <span class="font-semibold text-lg">워크플로우 AI</span>
      </div>
    </div>
    
    <div class="flex items-center gap-2">
      <button 
        @click="handleDownloadClick"
        :disabled="!currentWorkflow || !currentWorkflow.jsonData"
        class="flex items-center gap-2 h-8 px-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <DownloadIcon class="w-4 h-4" />
        다운로드
      </button>
      
      <button 
        @click="$emit('boardClick')"
        class="flex items-center gap-2 h-8 px-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
      >
        <MessageSquareIcon class="w-4 h-4" />
        게시판
      </button>
      
      <button 
        @click="$emit('loginClick')"
        class="flex items-center gap-2 h-8 px-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
      >
        <LogInIcon class="w-4 h-4" />
        로그인
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Workflow {
  id: string
  title: string
  image: string
  isCustom?: boolean
  jsonData?: any
  description?: string
}

interface Props {
  currentWorkflow: Workflow | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  download: []
  loginClick: []
  boardClick: []
}>()

// Simple SVG icons as components
const MessageSquareIcon = {
  template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>'
}

const DownloadIcon = {
  template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7,10 12,15 17,10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>'
}

const LogInIcon = {
  template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10,17 15,12 10,7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>'
}

const handleDownloadClick = () => {
  if (props.currentWorkflow && props.currentWorkflow.jsonData) {
    emit('download')
  }
}
</script>
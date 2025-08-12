<template>
  <div v-if="isOpen && workflow" class="w-full border-l border-gray-300 bg-white flex flex-col h-full">
    <div class="p-4 border-b border-gray-300 flex justify-between items-start shrink-0">
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <h3 class="font-medium">{{ workflow.title }}</h3>
          <span v-if="workflow.isCustom" class="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
            사용자 정의
          </span>
        </div>
        <p v-if="workflow.description" class="text-sm text-gray-600 leading-relaxed">
          {{ workflow.description }}
        </p>
      </div>
      <button
        @click="$emit('close')"
        class="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
      >
        <XIcon class="w-4 h-4" />
      </button>
    </div>
    
    <!-- 워크플로우 시각화 -->
    <div class="p-4 border-b border-gray-300">
      <div class="aspect-video w-full overflow-hidden rounded-lg border border-gray-300 relative group">
        <N8nWorkflowViewer 
          v-if="workflow.n8nUrl"
          :url="workflow.n8nUrl"
          :width="400"
          :height="225"
          class="w-full h-full"
        />
        <WorkflowDiagram 
          v-else-if="workflow.jsonData"
          :workflow-data="workflow.jsonData"
          :width="400"
          :height="225"
          class="w-full h-full"
        />
        <div v-else class="w-full h-full bg-gray-100 flex items-center justify-center">
          <p class="text-gray-500 text-sm">워크플로우 데이터 없음</p>
        </div>
        
        <!-- 사용자 정의 워크플로우 삭제 버튼 -->
        <div v-if="workflow.isCustom" class="absolute top-2 right-2">
          <button
            class="w-6 h-6 bg-red-500/90 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg flex items-center justify-center"
            @click="handleDelete"
          >
            <XIcon class="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>

    <!-- 워크플로우 정보 -->
    <div class="flex-1 overflow-y-auto">
      <div class="p-4 space-y-4">
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <InfoIcon class="w-4 h-4 text-gray-600" />
            <h4 class="font-medium">워크플로우 정보</h4>
          </div>
          
          <!-- n8n URL 정보 -->
          <div v-if="workflow.n8nUrl" class="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <div class="text-blue-800 text-sm font-medium mb-1">n8n 워크플로우</div>
            <div class="text-blue-600 text-xs break-all">{{ workflow.n8nUrl }}</div>
          </div>

          <template v-if="workflow.jsonData">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div class="bg-gray-50 p-3 rounded-lg">
                <div class="text-gray-600">노드 수</div>
                <div class="font-medium">{{ nodeCount }}개</div>
              </div>
              <div class="bg-gray-50 p-3 rounded-lg">
                <div class="text-gray-600">연결 수</div>
                <div class="font-medium">{{ connectionCount }}개</div>
              </div>
            </div>

            <div v-if="workflow.jsonData.nodes" class="space-y-2">
              <h5 class="font-medium text-sm">포함된 노드</h5>
              <div class="space-y-1">
                <div 
                  v-for="(node, index) in workflow.jsonData.nodes" 
                  :key="index" 
                  class="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                >
                  <span class="font-medium">{{ node.name }}</span>
                  <span class="text-gray-600 text-xs">
                    {{ node.type?.replace('n8n-nodes-base.', '') }}
                  </span>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div v-if="!workflow.jsonData && !workflow.n8nUrl" class="text-center py-8 text-gray-600">
          <CodeIcon class="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p class="text-sm">이 워크플로우에는 데이터가 없습니다</p>
        </div>
      </div>
    </div>

    <!-- 다운로드 버튼 -->
    <div v-if="workflow.jsonData" class="p-4 border-t border-gray-300 shrink-0">
      <button 
        @click="handleDownload" 
        class="w-full gap-2 bg-sky-100 hover:bg-sky-200 text-sky-800 border border-sky-300 rounded-md px-3 py-2 text-sm font-medium flex items-center justify-center transition-colors"
      >
        <DownloadIcon class="w-4 h-4" />
        다운로드
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import WorkflowDiagram from './WorkflowDiagram.vue'
import N8nWorkflowViewer from './N8nWorkflowViewer.vue'

interface Workflow {
  id: string
  title: string
  image: string
  isCustom?: boolean
  jsonData?: any
  description?: string
  n8nUrl?: string
}

interface Props {
  isOpen: boolean
  workflow: Workflow | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  download: []
  delete: [workflowId: string]
}>()

const nodeCount = computed(() => props.workflow?.jsonData?.nodes?.length || 0)

const connectionCount = computed(() => {
  if (!props.workflow?.jsonData?.connections) return 0
  return Object.values(props.workflow.jsonData.connections).reduce((acc: number, conn: any) => acc + conn.main.length, 0)
})

const handleDownload = () => {
  if (props.workflow?.jsonData) {
    emit('download')
  }
}

const handleDelete = () => {
  if (props.workflow) {
    emit('delete', props.workflow.id)
    emit('close')
  }
}

// Simple SVG icons as components
const XIcon = {
  template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"></path><path d="M6 6l12 12"></path></svg>'
}

const InfoIcon = {
  template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>'
}

const CodeIcon = {
  template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16,18 22,12 16,6"></polyline><polyline points="8,6 2,12 8,18"></polyline></svg>'
}

const DownloadIcon = {
  template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7,10 12,15 17,10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>'
}
</script>
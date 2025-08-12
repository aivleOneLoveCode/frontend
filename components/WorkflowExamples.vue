<template>
  <div class="mb-6">
    <!-- Custom Workflows Section -->
    <div v-if="customWorkflows.length > 0" class="mb-8">
      <h3 class="mb-4 text-gray-800">
        내 워크플로우 ({{ customWorkflows.length }}개)
      </h3>
      <div class="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
        <div
          v-for="workflow in customWorkflows"
          :key="workflow.id"
          class="cursor-pointer"
          @click="onWorkflowSelect(workflow.id)"
          @mouseenter="hoveredCard = workflow.id"
          @mouseleave="hoveredCard = null"
        >
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700 relative">
            <div class="aspect-[4/3] mb-4 flex items-center justify-center">
              <N8nWorkflowViewer 
                v-if="workflow.n8nUrl"
                :url="workflow.n8nUrl"
                :width="200"
                :height="150"
                class="w-full h-full"
              />
              <WorkflowDiagram 
                v-else-if="workflow.jsonData"
                :workflowData="workflow.jsonData"
                :width="200"
                :height="150"
                class="w-full h-full"
              />
              <div v-else class="w-full h-full bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <p class="text-gray-400 text-sm">워크플로우 데이터 없음</p>
              </div>
            </div>
            <h3 class="text-sm font-medium text-gray-800 dark:text-white text-center">
              {{ workflow.title }}
            </h3>
            <div class="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
              내 워크플로우
            </div>
            
            <!-- Delete Button -->
            <button
              v-if="hoveredCard === workflow.id"
              class="absolute top-2 right-2 w-6 h-6 bg-gray-500 hover:bg-gray-600 text-white rounded-full shadow-lg flex items-center justify-center text-sm z-[999]"
              @click="(e) => handleDeleteWorkflow(e, workflow.id)"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Default Workflows Section -->
    <div>
      <div class="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
        <div
          v-for="workflow in defaultWorkflows.slice(0, 4)"
          :key="workflow.id"
          class="cursor-pointer group"
          @click="onWorkflowSelect(workflow.id)"
        >
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700 relative">
            <div class="aspect-[4/3] mb-4 flex items-center justify-center">
              <N8nWorkflowViewer 
                v-if="workflow.n8nUrl"
                :url="workflow.n8nUrl"
                :width="200"
                :height="150"
                class="w-full h-full"
              />
              <WorkflowDiagram 
                v-else-if="workflow.jsonData"
                :workflowData="workflow.jsonData"
                :width="200"
                :height="150"
                class="w-full h-full"
              />
              <div v-else class="w-full h-full bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <p class="text-gray-400 text-sm">워크플로우 데이터 없음</p>
              </div>
            </div>
            <h3 class="text-sm font-medium text-gray-800 dark:text-white text-center">
              {{ workflow.title }}
            </h3>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import WorkflowDiagram from './WorkflowDiagram.vue'
import N8nWorkflowViewer from './N8nWorkflowViewer.vue'

interface Workflow {
  id: string
  title: string
  image: string
  isCustom?: boolean
  jsonData?: any
  n8nUrl?: string
}

interface WorkflowExamplesProps {
  onWorkflowSelect: (workflowId: string) => void
  allWorkflows: Workflow[]
  onDeleteWorkflow?: (workflowId: string) => void
}

const props = defineProps<WorkflowExamplesProps>()

const hoveredCard = ref<string | null>(null)

const customWorkflows = computed(() => 
  props.allWorkflows.filter(w => w.isCustom)
)

const defaultWorkflows = computed(() => 
  props.allWorkflows.filter(w => !w.isCustom)
)

const handleDeleteWorkflow = (e: Event, workflowId: string) => {
  e.stopPropagation()
  if (props.onDeleteWorkflow) {
    props.onDeleteWorkflow(workflowId)
  }
}
</script>
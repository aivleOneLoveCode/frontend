<template>
  <div>
    <!-- Trigger Button -->
    <button
      class="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded bg-transparent hover:bg-gray-50 cursor-pointer"
      @click="isOpen = true"
    >
      <PlusIcon />
      워크플로우 추가
    </button>

    <!-- Dialog Modal -->
    <div 
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @click="handleBackdropClick"
    >
      <div class="fixed inset-0 bg-black/50" />
      <div class="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-lg w-full max-w-[500px] mx-4">
        <div class="p-6">
          <div class="pb-4">
            <h2 class="text-xl font-semibold">워크플로우 추가</h2>
          </div>
          
          <form @submit="handleSubmit" class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">워크플로우 JSON 파일 *</label>
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div v-if="jsonData" class="space-y-3">
                  <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div class="flex items-center gap-3">
                      <FileTextIcon />
                      <div>
                        <span class="text-sm font-medium text-green-700">{{ jsonFileName }}</span>
                        <div class="text-xs text-green-600">
                          {{ jsonData.nodes?.length || 0 }}개 노드, {{ Object.keys(jsonData.connections || {}).length }}개 연결
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      class="p-1 hover:bg-gray-100 rounded"
                      @click="clearJsonData"
                    >
                      <XIcon />
                    </button>
                  </div>
                  
                  <div v-if="jsonData.nodes && jsonData.nodes.length > 0" class="text-xs text-gray-600">
                    <span class="font-medium">포함된 노드:</span>
                    {{ jsonData.nodes.slice(0, 3).map((node: any) => node.name).join(", ") }}
                    <span v-if="jsonData.nodes.length > 3"> 외 {{ jsonData.nodes.length - 3 }}개</span>
                  </div>
                </div>
                <div 
                  v-else
                  class="flex flex-col items-center justify-center h-32 cursor-pointer hover:bg-gray-50 transition-colors rounded"
                  @click="() => jsonInputRef?.click()"
                >
                  <UploadIcon />
                  <p class="text-sm font-medium text-center mt-2">
                    워크플로우 JSON 파일을 업로드하세요
                  </p>
                  <p class="text-xs text-gray-600 text-center mt-1">
                    클릭하거나 파일을 드래그해서 업로드
                  </p>
                </div>
              </div>
              <input
                ref="jsonInputRef"
                type="file"
                accept=".json,application/json"
                @change="handleJsonSelect"
                class="hidden"
              />
            </div>

            <div class="space-y-2">
              <label for="title" class="text-sm font-medium">워크플로우 제목 *</label>
              <input
                id="title"
                v-model="title"
                placeholder="워크플로우 제목을 입력하세요"
                class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <p class="text-xs text-gray-600">
                JSON 파일에서 자동으로 추출되지만 수정할 수 있습니다
              </p>
            </div>

            <div class="space-y-2">
              <label for="n8n-url" class="text-sm font-medium">n8n 워크플로우 URL (선택사항)</label>
              <input
                id="n8n-url"
                v-model="n8nUrl"
                placeholder="https://your-n8n-instance.com/workflow/123"
                type="url"
                class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <p class="text-xs text-gray-600">
                n8n 인스턴스의 워크플로우 URL을 입력하면 실제 워크플로우 화면이 표시됩니다
              </p>
            </div>

            <div class="space-y-2">
              <label for="description" class="text-sm font-medium">설명</label>
              <textarea
                id="description"
                v-model="description"
                placeholder="워크플로우에 대한 설명을 입력하세요"
                class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-[80px] resize-none"
              />
              <p class="text-xs text-gray-600">
                JSON 파일에서 자동으로 생성되지만 수정할 수 있습니다
              </p>
            </div>
            
            <div class="flex gap-2 justify-end">
              <button 
                type="button" 
                class="px-4 py-2 border border-gray-300 rounded bg-transparent hover:bg-gray-50 cursor-pointer"
                @click="handleCancel"
              >
                취소
              </button>
              <button 
                type="submit" 
                :disabled="!jsonData || !title"
                :class="[
                  'px-4 py-2 rounded text-white',
                  (!jsonData || !title) 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                ]"
              >
                추가
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Workflow {
  id: string
  title: string
  image: string
  isCustom?: boolean
  jsonData?: any
  description?: string
  n8nUrl?: string
}

interface WorkflowUploadProps {
  onWorkflowAdd: (workflow: Workflow) => void
}

const props = defineProps<WorkflowUploadProps>()

// 워크플로우 카테고리별 기본 이미지
const DEFAULT_WORKFLOW_IMAGES = [
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop", // 데이터 분석
  "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=300&h=200&fit=crop", // 이미지 처리
  "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=300&h=200&fit=crop", // API
  "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=300&h=200&fit=crop", // ML
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=200&fit=crop", // 자동화
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop", // 보고서
  "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=300&h=200&fit=crop", // 일반
]

const isOpen = ref(false)
const title = ref("")
const description = ref("")
const jsonData = ref<any>(null)
const jsonFileName = ref<string>("")
const n8nUrl = ref("")
const jsonInputRef = ref<HTMLInputElement>()

const getWorkflowImage = (jsonData: any, title: string): string => {
  // JSON 데이터나 제목을 기반으로 적절한 이미지 선택
  const lowerTitle = title.toLowerCase()
  const nodeTypes = jsonData?.nodes?.map((node: any) => node.type?.toLowerCase() || '') || []
  
  if (lowerTitle.includes('데이터') || lowerTitle.includes('분석') || nodeTypes.some(type => type.includes('csv') || type.includes('excel'))) {
    return DEFAULT_WORKFLOW_IMAGES[0]
  } else if (lowerTitle.includes('이미지') || nodeTypes.some(type => type.includes('image') || type.includes('edit'))) {
    return DEFAULT_WORKFLOW_IMAGES[1]
  } else if (lowerTitle.includes('api') || lowerTitle.includes('http') || nodeTypes.some(type => type.includes('http') || type.includes('webhook'))) {
    return DEFAULT_WORKFLOW_IMAGES[2]
  } else if (lowerTitle.includes('머신러닝') || lowerTitle.includes('ml') || lowerTitle.includes('ai')) {
    return DEFAULT_WORKFLOW_IMAGES[3]
  } else if (lowerTitle.includes('자동화') || lowerTitle.includes('스케줄') || nodeTypes.some(type => type.includes('cron') || type.includes('schedule'))) {
    return DEFAULT_WORKFLOW_IMAGES[4]
  } else if (lowerTitle.includes('보고서') || lowerTitle.includes('리포트') || nodeTypes.some(type => type.includes('pdf') || type.includes('html'))) {
    return DEFAULT_WORKFLOW_IMAGES[5]
  } else {
    return DEFAULT_WORKFLOW_IMAGES[6]
  }
}

const extractWorkflowInfo = (jsonData: any) => {
  let extractedTitle = ""
  let extractedDescription = ""

  // n8n 워크플로우에서 제목 추출
  if (jsonData.name) {
    extractedTitle = jsonData.name
  } else if (jsonData.meta?.name) {
    extractedTitle = jsonData.meta.name
  } else if (jsonData.nodes && jsonData.nodes.length > 0) {
    // 첫 번째 노드 이름을 기반으로 제목 생성
    extractedTitle = `${jsonData.nodes[0].name} 워크플로우`
  }

  // 설명 생성 (노드 수 기반)
  if (jsonData.nodes) {
    const nodeCount = jsonData.nodes.length
    const nodeTypes = [...new Set(jsonData.nodes.map((node: any) => 
      node.type?.replace('n8n-nodes-base.', '') || 'Unknown'
    ))]
    
    extractedDescription = `${nodeCount}개의 노드로 구성된 워크플로우입니다. `
    if (nodeTypes.length <= 3) {
      extractedDescription += `주요 구성요소: ${nodeTypes.join(', ')}`
    } else {
      extractedDescription += `${nodeTypes.slice(0, 3).join(', ')} 등의 구성요소를 포함합니다.`
    }
  }

  return { extractedTitle, extractedDescription }
}

const handleJsonSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const jsonContent = JSON.parse((e.target?.result as string) || '')
          jsonData.value = jsonContent
          jsonFileName.value = file.name
          
          // 워크플로우 정보 자동 추출
          const { extractedTitle, extractedDescription } = extractWorkflowInfo(jsonContent)
          
          if (extractedTitle && !title.value) {
            title.value = extractedTitle
          }
          if (extractedDescription && !description.value) {
            description.value = extractedDescription
          }
          
          console.log("워크플로우를 성공적으로 로드했습니다")
        } catch (error) {
          console.log("올바른 JSON 파일이 아닙니다")
        }
      }
      reader.readAsText(file)
    } else {
      console.log("JSON 파일만 업로드 가능합니다")
    }
  }
}

const clearJsonData = () => {
  jsonData.value = null
  jsonFileName.value = ""
  title.value = ""
  description.value = ""
  n8nUrl.value = ""
}

const handleSubmit = (e: Event) => {
  e.preventDefault()
  if (!title.value || !jsonData.value) {
    console.log("제목과 워크플로우 JSON 파일을 모두 입력해주세요")
    return
  }

  // 워크플로우 이미지 자동 선택
  const workflowImage = getWorkflowImage(jsonData.value, title.value)

  props.onWorkflowAdd({
    id: Date.now().toString(),
    title: title.value,
    image: workflowImage,
    description: description.value,
    jsonData: jsonData.value,
    n8nUrl: n8nUrl.value.trim() || undefined,
    isCustom: true
  })

  // 폼 리셋
  handleCancel()
  console.log("워크플로우가 추가되었습니다")
}

const handleCancel = () => {
  title.value = ""
  description.value = ""
  jsonData.value = null
  jsonFileName.value = ""
  n8nUrl.value = ""
  isOpen.value = false
}

const handleBackdropClick = (e: Event) => {
  if (e.target === e.currentTarget) {
    handleCancel()
  }
}
</script>

<!-- Icon Components -->
<script lang="ts">
const PlusIcon = {
  name: 'PlusIcon',
  template: `
    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  `
}

const UploadIcon = {
  name: 'UploadIcon',
  template: `
    <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  `
}

const FileTextIcon = {
  name: 'FileTextIcon',
  template: `
    <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  `
}

const XIcon = {
  name: 'XIcon',
  template: `
    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  `
}

export { PlusIcon, UploadIcon, FileTextIcon, XIcon }
</script>
<template>
  <div class="h-full flex flex-col bg-background">
    <!-- Header -->
    <div class="border-b border-gray-200 bg-background px-6 py-4 flex justify-between items-center shrink-0">
      <div class="flex items-center gap-3">
        <button 
          class="flex items-center gap-2 px-2 py-1 bg-transparent border-0 cursor-pointer hover:bg-gray-100 rounded text-sm"
          @click="onBack"
        >
          <ArrowLeftIcon />
          돌아가기
        </button>
        <h1 class="text-lg font-medium">게시판</h1>
      </div>
      
      <button
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer border-0"
        @click="isUploadModalOpen = true"
      >
        <PlusIcon />
        워크플로우 업로드
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-auto p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div
          v-for="post in posts"
          :key="post.id"
          class="bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          @click="openDetailModal(post)"
        >
          <!-- Card Content -->
          <div class="p-4">
            <!-- Workflow Preview -->
            <div class="w-full h-32 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg mb-3 flex items-center justify-center border">
              <div class="text-center">
                <div class="w-12 h-12 bg-blue-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <UploadIcon class="w-6 h-6 text-white" />
                </div>
                <p class="text-xs text-gray-600">워크플로우</p>
              </div>
            </div>
            
            <h3 class="font-medium mb-2 leading-tight line-clamp-2">{{ post.title }}</h3>
            <p class="text-sm text-gray-600 mb-3 leading-relaxed line-clamp-2">
              {{ post.description }}
            </p>
            
            <div class="flex items-center gap-2 mb-2">
              <span class="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                {{ post.downloads }} 다운로드
              </span>
              <span class="px-2 py-1 border border-gray-300 text-gray-600 rounded text-xs">
                ♥ {{ post.likes }}
              </span>
            </div>
          </div>
          
          <!-- Card Footer -->
          <div class="p-4 pt-0">
            <div class="flex items-center gap-2 w-full">
              <div class="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                <span class="text-xs font-medium">{{ post.authorInitials }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">{{ post.author }}</p>
                <p class="text-xs text-gray-600">{{ formatDate(post.createdAt) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <div 
      v-if="isUploadModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @click="handleUploadModalBackdrop"
    >
      <div class="fixed inset-0 bg-black/50" />
      <div class="relative bg-white border border-gray-200 shadow-2xl rounded-lg w-full max-w-md mx-4">
        <div class="p-6">
          <div class="mb-4">
            <h2 class="text-xl font-semibold">워크플로우 업로드</h2>
          </div>
          <div class="space-y-4">
            <div>
              <label for="title" class="block text-sm font-medium mb-1">제목</label>
              <input
                id="title"
                v-model="uploadForm.title"
                placeholder="워크플로우 제목을 입력하세요"
                class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label for="description" class="block text-sm font-medium mb-1">설명</label>
              <textarea
                id="description"
                v-model="uploadForm.description"
                placeholder="워크플로우에 대한 설명을 입력하세요"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              />
            </div>
            <div>
              <label for="file" class="block text-sm font-medium mb-1">JSON 파일</label>
              <input
                id="file"
                type="file"
                accept=".json"
                @change="handleFileSelect"
                class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <p v-if="uploadForm.file" class="text-sm text-gray-600 mt-1">
                선택된 파일: {{ uploadForm.file.name }}
              </p>
            </div>
            <div class="flex gap-2 pt-2">
              <button 
                :disabled="!uploadForm.title.trim() || !uploadForm.description.trim() || !uploadForm.file"
                :class="[
                  'flex-1 px-4 py-2 rounded border-0',
                  (!uploadForm.title.trim() || !uploadForm.description.trim() || !uploadForm.file)
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                ]"
                @click="handleUpload"
              >
                업로드
              </button>
              <button 
                class="flex-1 px-4 py-2 border border-gray-300 rounded bg-transparent hover:bg-gray-50 cursor-pointer"
                @click="closeUploadModal"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div 
      v-if="isDetailModalOpen && selectedPost"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @click="handleDetailModalBackdrop"
    >
      <div class="fixed inset-0 bg-black/50" />
      <div class="relative bg-white border border-gray-200 shadow-2xl rounded-lg w-full max-w-2xl max-h-[80vh] overflow-auto mx-4">
        <div class="p-6">
          <!-- Header -->
          <div class="mb-6">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span class="text-sm font-medium">{{ selectedPost.authorInitials }}</span>
              </div>
              <div>
                <h2 class="text-xl font-semibold">{{ selectedPost.title }}</h2>
                <p class="text-sm text-gray-600">
                  {{ selectedPost.author }} · {{ formatDate(selectedPost.createdAt) }}
                </p>
              </div>
            </div>
          </div>
          
          <div class="space-y-4">
            <!-- Workflow Preview -->
            <div class="w-full h-48 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center border">
              <div class="text-center">
                <div class="w-16 h-16 bg-blue-600 rounded-lg mx-auto mb-3 flex items-center justify-center">
                  <UploadIcon class="w-8 h-8 text-white" />
                </div>
                <p class="text-sm text-gray-600">워크플로우 다이어그램</p>
              </div>
            </div>
            
            <!-- Description -->
            <div>
              <h3 class="font-medium mb-2">설명</h3>
              <p class="text-gray-600">{{ selectedPost.description }}</p>
            </div>
            
            <!-- Statistics -->
            <div class="flex gap-4">
              <div class="flex items-center gap-2">
                <DownloadIcon />
                <span class="text-sm">{{ selectedPost.downloads }} 다운로드</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm">♥ {{ selectedPost.likes }} 좋아요</span>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex gap-2 pt-4">
              <button 
                class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer border-0"
                @click="() => handleDownload(selectedPost)"
              >
                <DownloadIcon />
                다운로드
              </button>
              <button 
                class="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded bg-transparent hover:bg-gray-50 cursor-pointer"
                @click="() => handleImport(selectedPost)"
              >
                <PlusIcon />
                가져오기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface BoardPost {
  id: string
  title: string
  description: string
  author: string
  authorInitials: string
  createdAt: Date
  likes: number
  downloads: number
  jsonData: any
  previewImage?: string
}

interface Workflow {
  id: string
  title: string
  image: string
  isCustom?: boolean
  jsonData?: any
  description?: string
  n8nUrl?: string
}

interface BoardProps {
  onBack: () => void
  onImportWorkflow: (workflow: Workflow) => void
}

const props = defineProps<BoardProps>()

// Sample posts data
const SAMPLE_POSTS: BoardPost[] = [
  {
    id: "post-1",
    title: "이메일 자동화 워크플로우",
    description: "고객 문의 이메일을 자동으로 분류하고 응답하는 워크플로우입니다. Gmail API와 AI를 활용하여 빠른 고객 서비스를 제공합니다.",
    author: "김개발",
    authorInitials: "김개",
    createdAt: new Date("2024-01-15"),
    likes: 24,
    downloads: 156,
    jsonData: {
      "meta": { "instanceId": "email-automation" },
      "nodes": [
        {
          "parameters": { "pollTimes": { "item": [{ "mode": "everyMinute" }] } },
          "id": "gmail-trigger",
          "name": "Gmail Trigger",
          "type": "n8n-nodes-base.gmailTrigger",
          "position": [240, 300]
        },
        {
          "parameters": { "model": "gpt-3.5-turbo", "prompt": "이메일 내용을 분석하여 카테고리를 분류해주세요" },
          "id": "ai-classifier",
          "name": "AI Email Classifier",
          "type": "n8n-nodes-base.openAi",
          "position": [460, 300]
        },
        {
          "parameters": { "subject": "자동 응답", "message": "안녕하세요. 문의해주셔서 감사합니다." },
          "id": "auto-reply",
          "name": "Auto Reply",
          "type": "n8n-nodes-base.gmail",
          "position": [680, 300]
        }
      ],
      "connections": {
        "Gmail Trigger": { "main": [["AI Email Classifier"]] },
        "AI Email Classifier": { "main": [["Auto Reply"]] }
      }
    }
  },
  {
    id: "post-2",
    title: "소셜미디어 콘텐츠 배포",
    description: "하나의 콘텐츠를 여러 소셜미디어 플랫폼에 동시에 배포하는 자동화 워크플로우입니다.",
    author: "박마케팅",
    authorInitials: "박마",
    createdAt: new Date("2024-01-12"),
    likes: 18,
    downloads: 89,
    jsonData: {
      "meta": { "instanceId": "social-distribution" },
      "nodes": [
        {
          "parameters": { "rule": { "interval": [{ "field": "hours", "value": 9 }] } },
          "id": "schedule-trigger",
          "name": "Daily Schedule",
          "type": "n8n-nodes-base.cron",
          "position": [240, 300]
        },
        {
          "parameters": { "message": "오늘의 소식을 전해드립니다!" },
          "id": "twitter-post",
          "name": "Twitter Post",
          "type": "n8n-nodes-base.twitter",
          "position": [460, 200]
        },
        {
          "parameters": { "message": "새로운 업데이트를 확인하세요" },
          "id": "facebook-post",
          "name": "Facebook Post",
          "type": "n8n-nodes-base.facebook",
          "position": [460, 400]
        }
      ],
      "connections": {
        "Daily Schedule": { "main": [["Twitter Post"], ["Facebook Post"]] }
      }
    }
  },
  {
    id: "post-3",
    title: "재고 관리 자동화",
    description: "재고가 부족할 때 자동으로 알림을 보내고 주문을 생성하는 워크플로우입니다.",
    author: "최운영",
    authorInitials: "최운",
    createdAt: new Date("2024-01-10"),
    likes: 31,
    downloads: 203,
    jsonData: {
      "meta": { "instanceId": "inventory-management" },
      "nodes": [
        {
          "parameters": { "query": "SELECT * FROM inventory WHERE quantity < minimum_stock" },
          "id": "check-inventory",
          "name": "Check Inventory",
          "type": "n8n-nodes-base.postgres",
          "position": [240, 300]
        },
        {
          "parameters": { "message": "재고 부족 알림", "channel": "#inventory" },
          "id": "slack-alert",
          "name": "Slack Alert",
          "type": "n8n-nodes-base.slack",
          "position": [460, 300]
        },
        {
          "parameters": { "supplier": "default", "quantity": "auto" },
          "id": "create-order",
          "name": "Create Order",
          "type": "n8n-nodes-base.httpRequest",
          "position": [680, 300]
        }
      ],
      "connections": {
        "Check Inventory": { "main": [["Slack Alert"]] },
        "Slack Alert": { "main": [["Create Order"]] }
      }
    }
  },
  {
    id: "post-4",
    title: "웹사이트 모니터링",
    description: "웹사이트 상태를 주기적으로 확인하고 문제 발생 시 즉시 알림을 보내는 모니터링 워크플로우입니다.",
    author: "이개발",
    authorInitials: "이개",
    createdAt: new Date("2024-01-08"),
    likes: 15,
    downloads: 67,
    jsonData: {
      "meta": { "instanceId": "website-monitoring" },
      "nodes": [
        {
          "parameters": { "rule": { "interval": [{ "field": "minutes", "value": 5 }] } },
          "id": "monitor-schedule",
          "name": "Monitor Schedule",
          "type": "n8n-nodes-base.cron",
          "position": [240, 300]
        },
        {
          "parameters": { "url": "https://example.com", "method": "GET" },
          "id": "health-check",
          "name": "Health Check",
          "type": "n8n-nodes-base.httpRequest",
          "position": [460, 300]
        },
        {
          "parameters": { "to": "admin@company.com", "subject": "웹사이트 다운 알림" },
          "id": "email-alert",
          "name": "Email Alert",
          "type": "n8n-nodes-base.emailSend",
          "position": [680, 300]
        }
      ],
      "connections": {
        "Monitor Schedule": { "main": [["Health Check"]] },
        "Health Check": { "main": [["Email Alert"]] }
      }
    }
  }
]

const posts = ref<BoardPost[]>(SAMPLE_POSTS)
const selectedPost = ref<BoardPost | null>(null)
const isUploadModalOpen = ref(false)
const isDetailModalOpen = ref(false)
const uploadForm = ref({
  title: "",
  description: "",
  file: null as File | null
})

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file && file.type === "application/json") {
    uploadForm.value.file = file
  } else {
    console.log("JSON 파일만 업로드 가능합니다.")
  }
}

const handleUpload = async () => {
  if (!uploadForm.value.title.trim() || !uploadForm.value.description.trim() || !uploadForm.value.file) {
    console.log("모든 필드를 입력해주세요.")
    return
  }

  try {
    const fileContent = await uploadForm.value.file.text()
    const jsonData = JSON.parse(fileContent)

    const newPost: BoardPost = {
      id: `post-${Date.now()}`,
      title: uploadForm.value.title,
      description: uploadForm.value.description,
      author: "사용자",
      authorInitials: "사용",
      createdAt: new Date(),
      likes: 0,
      downloads: 0,
      jsonData
    }

    posts.value = [newPost, ...posts.value]
    closeUploadModal()
    console.log("워크플로우가 성공적으로 업로드되었습니다!")
  } catch (error) {
    console.log("유효하지 않은 JSON 파일입니다.")
  }
}

const handleDownload = (post: BoardPost) => {
  const dataStr = JSON.stringify(post.jsonData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${post.title.replace(/\s+/g, '_')}_n8n_workflow.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  // 다운로드 수 증가
  posts.value = posts.value.map(p => 
    p.id === post.id ? { ...p, downloads: p.downloads + 1 } : p
  )
  console.log("워크플로우를 다운로드했습니다!")
}

const handleImport = (post: BoardPost) => {
  const workflow: Workflow = {
    id: `imported-${Date.now()}`,
    title: post.title,
    image: "",
    description: post.description,
    jsonData: post.jsonData,
    isCustom: true
  }

  props.onImportWorkflow(workflow)
  isDetailModalOpen.value = false
  console.log("워크플로우를 성공적으로 가져왔습니다!")
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const openDetailModal = (post: BoardPost) => {
  selectedPost.value = post
  isDetailModalOpen.value = true
}

const closeUploadModal = () => {
  uploadForm.value = { title: "", description: "", file: null }
  isUploadModalOpen.value = false
}

const handleUploadModalBackdrop = (e: Event) => {
  if (e.target === e.currentTarget) {
    closeUploadModal()
  }
}

const handleDetailModalBackdrop = (e: Event) => {
  if (e.target === e.currentTarget) {
    isDetailModalOpen.value = false
  }
}
</script>

<!-- Icon Components -->
<script lang="ts">
const ArrowLeftIcon = {
  name: 'ArrowLeftIcon',
  template: `
    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  `
}

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
    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  `
}

const DownloadIcon = {
  name: 'DownloadIcon',
  template: `
    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  `
}

export { ArrowLeftIcon, PlusIcon, UploadIcon, DownloadIcon }
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
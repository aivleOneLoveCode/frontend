<template>
  <div class="w-80 border-r border-sky-200 bg-sky-50 flex flex-col h-full">
    <!-- 새 채팅 버튼 -->
    <div class="p-3 border-b border-sky-200">
      <button 
        @click="$emit('newChat')"
        class="w-full justify-start gap-2 h-11 bg-transparent border border-sky-300 hover:bg-sky-100 text-sky-900 font-medium flex items-center px-3 rounded-md transition-colors"
      >
        <PlusIcon class="w-4 h-4" />
        새 채팅
      </button>
    </div>
    
    <!-- 현재 워크플로우 -->
    <div v-if="currentWorkflow" class="p-3 border-b border-sky-200">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-sky-900">현재 워크플로우</span>
        <div class="flex items-center gap-1">
          <template v-if="workflows.length > 1">
            <button
              class="w-6 h-6 p-0 hover:bg-sky-200 rounded-sm transition-colors flex items-center justify-center"
              @click="$emit('workflowNavigate', 'prev')"
            >
              <ChevronLeftIcon class="w-3 h-3" />
            </button>
            <span class="text-xs text-sky-600 px-1">
              {{ currentWorkflowIndex + 1 }}/{{ workflows.length }}
            </span>
            <button
              class="w-6 h-6 p-0 hover:bg-sky-200 rounded-sm transition-colors flex items-center justify-center"
              @click="$emit('workflowNavigate', 'next')"
            >
              <ChevronRightIcon class="w-3 h-3" />
            </button>
          </template>
        </div>
      </div>
      
      <div 
        class="relative bg-sky-100 rounded-lg p-6 cursor-pointer hover:bg-sky-200 transition-colors"
        @click="$emit('workflowClick')"
        @mouseenter="hoveredWorkflow = true"
        @mouseleave="hoveredWorkflow = false"
      >
        <div class="flex flex-col">
          <div class="relative w-full h-32 bg-sky-200 rounded-lg flex items-center justify-center mb-2 hover:bg-sky-300 transition-colors overflow-hidden">
            <WorkflowDiagram 
              v-if="currentWorkflow.jsonData"
              :workflow-data="currentWorkflow.jsonData"
              :width="256"
              :height="128"
              class="w-full h-full"
            />
            <MessageSquareIcon v-else class="w-16 h-16 text-sky-700" />
            
            <button
              v-if="hoveredWorkflow"
              class="absolute top-1 right-1 w-5 h-5 bg-gray-500 hover:bg-gray-600 text-white rounded-full shadow-lg flex items-center justify-center text-xs z-[999]"
              @click.stop="$emit('deleteWorkflow', currentWorkflow.id)"
            >
              ×
            </button>
          </div>
          <div class="text-center">
            <div class="font-medium text-sm text-sky-900 truncate">{{ currentWorkflow.title }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 채팅 기록 -->
    <div class="flex-1 flex flex-col min-h-0">
      <div class="p-3 border-b border-sky-200">
        <span class="text-sm font-medium text-sky-900">채팅 기록</span>
      </div>
      
      <div class="flex-1 overflow-y-auto">
        <div class="p-2 space-y-1">
          <div v-if="chatHistories.length === 0" class="p-4 text-center text-sm text-sky-600">
            채팅 기록이 없습니다
          </div>
          <template v-else>
            <div 
              v-for="chat in chatHistories" 
              :key="chat.id" 
              class="relative"
            >
              <div
                class="sidebar-item cursor-pointer hover:bg-sky-100 rounded-lg p-3 transition-colors relative"
                @click="$emit('chatHistoryClick', chat)"
                @mouseenter="hoveredChatId = chat.id"
                @mouseleave="hoveredChatId = null"
              >
                <div class="flex items-center gap-2 min-w-0 pr-10">
                  <MessageSquareIcon class="w-4 h-4 text-sky-600 flex-shrink-0" />
                  <div class="flex-1 min-w-0">
                    <input
                      v-if="editingChatId === chat.id"
                      v-model="editingTitle"
                      type="text"
                      class="w-full text-sm bg-transparent border-none outline-none text-sky-900"
                      @blur="handleSaveTitle"
                      @keydown="handleKeyPress"
                      ref="editInput"
                    />
                    <template v-else>
                      <div class="font-medium text-sm text-sky-900 overflow-hidden">
                        {{ chat.title.length > 25 ? `${chat.title.substring(0, 22)}...` : chat.title }}
                      </div>
                      <div class="text-xs text-sky-600 overflow-hidden">
                        {{ chat.lastMessage.length > 30 ? `${chat.lastMessage.substring(0, 27)}...` : chat.lastMessage }}
                      </div>
                    </template>
                  </div>
                </div>
                
                <button
                  v-if="hoveredChatId === chat.id"
                  class="absolute top-2 right-4 w-5 h-5 bg-gray-500 hover:bg-gray-600 text-white rounded-full shadow-lg flex items-center justify-center text-xs z-[999]"
                  @click.stop="$emit('deleteChatHistory', chat.id)"
                >
                  ×
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import WorkflowDiagram from './WorkflowDiagram.vue'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  files?: string[]
}

interface Workflow {
  id: string
  title: string
  image: string
  isCustom?: boolean
  jsonData?: any
}

interface ChatHistory {
  id: string
  title: string
  lastMessage: string
  timestamp: string
  workflow?: Workflow
  messages: Message[]
  createdAt: Date
}

interface Props {
  workflows: Workflow[]
  currentWorkflowIndex: number
  chatHistories: ChatHistory[]
}

const props = defineProps<Props>()

defineEmits<{
  workflowNavigate: [direction: 'prev' | 'next']
  workflowClick: []
  chatHistoryClick: [chat: ChatHistory]
  newChat: []
  deleteChatHistory: [chatId: string]
  editChatTitle: [chatId: string, newTitle: string]
  deleteWorkflow: [workflowId: string]
}>()

const currentWorkflow = computed(() => props.workflows[props.currentWorkflowIndex])
const editingChatId = ref<string | null>(null)
const editingTitle = ref<string>('')
const hoveredWorkflow = ref<boolean>(false)
const hoveredChatId = ref<string | null>(null)
const editInput = ref<HTMLInputElement>()

const handleEditTitle = async (chat: ChatHistory) => {
  editingChatId.value = chat.id
  editingTitle.value = chat.title
  await nextTick()
  editInput.value?.focus()
}

const handleSaveTitle = () => {
  if (editingChatId.value && editingTitle.value.trim()) {
    $emit('editChatTitle', editingChatId.value, editingTitle.value.trim())
  }
  editingChatId.value = null
  editingTitle.value = ''
}

const handleKeyPress = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSaveTitle()
  } else if (e.key === 'Escape') {
    editingChatId.value = null
    editingTitle.value = ''
  }
}

// Simple SVG icons as components
const PlusIcon = {
  template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>'
}

const MessageSquareIcon = {
  template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>'
}

const ChevronLeftIcon = {
  template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"></path></svg>'
}

const ChevronRightIcon = {
  template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"></path></svg>'
}
</script>
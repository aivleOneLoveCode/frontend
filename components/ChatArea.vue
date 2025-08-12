<template>
  <div class="w-full h-full flex flex-col bg-white">
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Empty state -->
      <div v-if="messages.length === 0" class="flex-1 flex flex-col justify-center">
        <div class="max-w-4xl mx-auto px-6 text-center">
          <div class="mb-12">
            <h1 class="text-3xl font-semibold mb-4 text-gray-800">
              안녕하세요, 워크플로우 도우미입니다
            </h1>
            <p class="text-gray-600 text-lg mb-8">
              다양한 워크플로우를 선택하여 작업을 자동화하세요
            </p>
          </div>
          
          <WorkflowExamples 
            @workflow-select="$emit('workflowSelect', $event)"
            :all-workflows="allWorkflows"
            @delete-workflow="$emit('deleteWorkflow', $event)"
          />
          
          <div class="mt-8">
            <WorkflowUpload @workflow-add="$emit('addCustomWorkflow', $event)" />
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div v-else class="flex-1 overflow-y-auto" ref="scrollAreaRef">
        <div class="max-w-3xl mx-auto">
          <div 
            v-for="(message, index) in messages" 
            :key="message.id" 
            class="group"
          >
            <div :class="[
              'px-4 py-6',
              !message.isUser && index % 2 === 1 ? 'bg-gray-50' : 'bg-transparent'
            ]">
              <div class="flex gap-4 max-w-full">
                <div class="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                  <div v-if="message.isUser" class="w-7 h-7 bg-blue-600 rounded-sm flex items-center justify-center">
                    <UserIcon class="w-4 h-4 text-white" />
                  </div>
                  <div v-else class="w-7 h-7 bg-blue-600 rounded-sm flex items-center justify-center">
                    <BotIcon class="w-4 h-4 text-white" />
                  </div>
                </div>
                
                <div class="flex-1 min-w-0">
                  <div class="font-semibold text-sm mb-2 text-gray-900">
                    {{ message.isUser ? '사용자' : 'Assistant' }}
                  </div>
                  
                  <div v-if="message.files && message.files.length > 0" class="mb-3 p-3 bg-gray-100 rounded-lg text-sm flex items-center gap-2">
                    <span>📎</span>
                    <span class="text-gray-600">{{ message.files.join(', ') }}</span>
                  </div>
                  
                  <div class="text-gray-900">
                    <StreamingMessage 
                      v-if="message.isStreaming"
                      :content="message.content"
                      @complete="handleStreamingComplete"
                    />
                    <div v-else class="whitespace-pre-wrap leading-7 text-[15px]">
                      {{ message.content }}
                    </div>
                  </div>
                  
                  <div v-if="!message.isUser" class="mt-3 flex items-center">
                    <MessageActions
                      :message="message.content"
                      :message-id="message.id"
                      :is-user="message.isUser"
                      @feedback="handleMessageFeedback"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Typing indicator -->
          <div v-if="isTyping" class="px-4 py-6">
            <div class="flex gap-4 max-w-full">
              <div class="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                <div class="w-7 h-7 bg-blue-600 rounded-sm flex items-center justify-center">
                  <BotIcon class="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div class="flex-1 min-w-0">
                <div class="font-semibold text-sm mb-2">Assistant</div>
                <TypingIndicator />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Uploaded files indicator -->
    <div v-if="uploadedFiles.length > 0" class="border-t border-gray-200 bg-gray-50 px-4 py-3 shrink-0">
      <div class="max-w-3xl mx-auto">
        <div class="text-sm text-gray-600 flex items-center gap-2">
          <span>📎</span>
          <span>업로드된 파일: {{ uploadedFiles.join(', ') }}</span>
        </div>
      </div>
    </div>

    <!-- Chat input -->
    <div class="shrink-0 border-t border-gray-200 bg-white">
      <div class="max-w-3xl mx-auto px-4 py-4">
        <ChatInput 
          @send-message="$emit('sendMessage', $event)"
          @file-upload="$emit('fileUpload', $event)"
          @typing-start="isTyping = true"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import WorkflowExamples from './WorkflowExamples.vue'
import ChatInput from './ChatInput.vue'
import MessageActions from './MessageActions.vue'
import TypingIndicator from './TypingIndicator.vue'
import StreamingMessage from './StreamingMessage.vue'
import WorkflowUpload from './WorkflowUpload.vue'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  files?: string[]
  isStreaming?: boolean
}

interface Workflow {
  id: string
  title: string
  image: string
  isCustom?: boolean
}

interface Props {
  messages: Message[]
  uploadedFiles: string[]
  allWorkflows: Workflow[]
}

const props = defineProps<Props>()

defineEmits<{
  workflowSelect: [workflowId: string]
  sendMessage: [content: string]
  fileUpload: [files: File[]]
  addCustomWorkflow: [workflow: Workflow]
  deleteWorkflow: [workflowId: string]
}>()

const isTyping = ref(false)
const scrollAreaRef = ref<HTMLElement>()

// Auto scroll to bottom when messages change
watch(() => props.messages, async () => {
  await nextTick()
  if (scrollAreaRef.value) {
    scrollAreaRef.value.scrollTop = scrollAreaRef.value.scrollHeight
  }
}, { deep: true })

watch(isTyping, async () => {
  await nextTick()
  if (scrollAreaRef.value) {
    scrollAreaRef.value.scrollTop = scrollAreaRef.value.scrollHeight
  }
})

const handleMessageFeedback = (messageId: string, type: 'like' | 'dislike') => {
  console.log(`Message ${messageId} received ${type} feedback`)
}

const handleStreamingComplete = () => {
  isTyping.value = false
}

// Simple SVG icons as components
const UserIcon = {
  template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
}

const BotIcon = {
  template: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>'
}
</script>
<template>
  <!-- 웰컴 화면 -->
  <div v-if="showWelcome" class="chat-container">
    <div class="welcome-area">
      <div class="logo-container">
        <div class="chatgpt-logo">✨</div>
        <h1 class="welcome-title">ChatGPT</h1>
        <p class="welcome-subtitle">준비되면 여기에 주세요</p>
      </div>

      <div class="example-prompts">
        <div v-for="prompt in examplePrompts" 
             :key="prompt.title"
             class="example-prompt"
             @click="$emit('use-example-prompt', prompt)">
          <div class="example-prompt-title">{{ prompt.title }}</div>
          <div class="example-prompt-text">{{ prompt.text }}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- 메시지 영역 -->
  <div v-else class="messages">
    <div class="messages-inner">
      <div v-for="message in messages" 
           :key="message.id"
           :class="['message', message.type]">
        <div class="message-avatar">
          {{ message.type === 'user' ? 'U' : 'AI' }}
        </div>
        <div class="message-content">
          {{ message.content }}
        </div>
      </div>
    </div>
  </div>

  <!-- 입력 영역 -->
  <div class="input-container">
    <div class="input-wrapper" 
         :class="{ 'drag-over': isDragging }"
         @dragenter="$emit('handle-drag-enter', $event)"
         @dragover="$emit('handle-drag-over', $event)"
         @dragleave="$emit('handle-drag-leave', $event)"
         @drop="$emit('handle-drop', $event)">
      <input type="file" @change="$emit('handle-file-upload', $event)" style="display: none;" ref="fileInput">
      <button class="file-upload-btn" title="파일 업로드" @click="fileInput?.click()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>
      <textarea 
        :value="inputText"
        @input="$emit('update:input-text', ($event.target as HTMLTextAreaElement).value)"
        class="input-box"
        placeholder="메시지를 입력하세요..."
        rows="1"
        @keydown="$emit('handle-keydown', $event)"
      ></textarea>
      <button class="send-btn" @click="$emit('send-message')" :disabled="!inputText.trim()" title="메시지 전송">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m5 12 7-7 7 7"/>
          <path d="M12 19V5"/>
        </svg>
      </button>
      <div v-if="isDragging" class="drag-overlay">
        📁 파일을 여기에 드롭하세요
      </div>
    </div>
    <div class="disclaimer">
      ChatGPT는 실수할 수 있습니다. 중요한 정보를 확인해 보세요.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Message, ExamplePrompt } from '../types'

defineProps<{
  showWelcome: boolean
  messages: Message[]
  examplePrompts: ExamplePrompt[]
  inputText: string
  isDragging: boolean
}>()

defineEmits<{
  'send-message': []
  'use-example-prompt': [prompt: ExamplePrompt]
  'handle-keydown': [event: KeyboardEvent]
  'handle-file-upload': [event: Event]
  'handle-drag-enter': [event: DragEvent]
  'handle-drag-over': [event: DragEvent]
  'handle-drag-leave': [event: DragEvent]
  'handle-drop': [event: DragEvent]
  'update:input-text': [value: string]
}>()

const fileInput = ref<HTMLInputElement>()
</script>

<style scoped>
.chat-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.welcome-area {
  text-align: center;
  max-width: 500px;
}

.logo-container {
  margin-bottom: 32px;
}

.chatgpt-logo {
  width: 40px;
  height: 40px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #74aa9c 0%, #1f8b73 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.welcome-title {
  font-size: 32px;
  font-weight: 600;
  color: #202123;
  margin-bottom: 12px;
  letter-spacing: -0.8px;
}

.welcome-subtitle {
  font-size: 18px;
  color: #6b7280;
  margin-bottom: 48px;
  font-weight: 400;
}

.example-prompts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
  margin-bottom: 32px;
}

.example-prompt {
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.example-prompt:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 8px rgba(0,0,0,0.08);
  transform: translateY(-1px);
}

.example-prompt-title {
  font-weight: 600;
  color: #202123;
  margin-bottom: 8px;
  font-size: 15px;
}

.example-prompt-text {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
}

.messages {
  flex: 1;
  width: 100%;
  padding: 20px;
  overflow-y: auto;
}

.messages-inner {
  max-width: 768px;
  margin: 0 auto;
  width: 100%;
}

.message {
  margin-bottom: 24px;
  display: flex;
  gap: 16px;
  padding: 20px 24px;
}

.message.user {
  background: transparent;
}

.message.assistant {
  background: #f7f7f8;
  border-radius: 16px;
  margin: 12px;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: #5436da;
  color: white;
}

.message.assistant .message-avatar {
  background: #19c37d;
  color: white;
}

.message-content {
  flex: 1;
  font-size: 16px;
  line-height: 1.6;
  color: #202123;
  padding-top: 4px;
}

.input-container {
  position: sticky;
  bottom: 0;
  background: #ffffff;
  padding: 24px;
  border-top: 1px solid #e5e7eb;
}

.input-wrapper {
  max-width: 768px;
  width: 100%;
  margin: 0 auto;
  position: relative;
}

.input-box {
  width: 100%;
  min-height: 52px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 24px;
  padding: 12px 56px 12px 50px;
  font-size: 16px;
  line-height: 1.5;
  resize: none;
  outline: none;
  font-family: inherit;
  color: #202123;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  transition: all 0.2s;
}

.input-box:focus {
  border-color: #10a37f;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08), 0 0 0 3px rgba(16, 163, 127, 0.1);
}

.input-box::placeholder {
  color: #9ca3af;
}

.file-upload-btn {
  position: absolute;
  left: 12px;
  top: calc(50% - 2px);
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: 16px;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 16px;
}

.file-upload-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.send-btn {
  position: absolute;
  right: 12px;
  top: calc(50% - 2px);
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  background: #2d2d2d;
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 14px;
}

.send-btn:hover {
  background: #1a1a1a;
}

.send-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.input-wrapper.drag-over {
  border-color: #10a37f;
  background: #f0fdf4;
}

.input-wrapper.drag-over .input-box {
  border-color: #10a37f;
  background: #f0fdf4;
}

.drag-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(16, 163, 127, 0.1);
  border: 2px dashed #10a37f;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10a37f;
  font-size: 14px;
  font-weight: 500;
  z-index: 10;
  pointer-events: none;
}

.disclaimer {
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
  margin-top: 12px;
  max-width: 768px;
  margin-left: auto;
  margin-right: auto;
}
</style>
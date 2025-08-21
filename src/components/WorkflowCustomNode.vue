<template>
  <div class="custom-node" :class="{ disabled: data.disabled }">
    <div class="node-icon">
      <img 
        v-if="data.iconUrl && !showFallback" 
        :src="data.iconUrl" 
        :alt="data.nodeType"
        @error="onImageError"
        class="node-svg-icon"
      />
      <span v-else class="node-emoji-icon">{{ data.fallbackIcon }}</span>
    </div>
    <div class="node-label">{{ data.label }}</div>
    <Handle 
      type="target" 
      :position="Position.Top" 
      :style="{ background: '#555' }"
      id="top"
    />
    <Handle 
      type="source" 
      :position="Position.Bottom" 
      :style="{ background: '#555' }"
      id="bottom"
    />
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { ref } from 'vue'

interface NodeData {
  label: string
  iconUrl?: string | null
  fallbackIcon: string
  nodeType: string
  disabled: boolean
}

interface Props {
  data: NodeData
}

const props = defineProps<Props>()
const showFallback = ref(false)

const onImageError = (event: Event) => {
  console.log(`Icon loading failed for ${props.data.nodeType}:`, (event.target as HTMLImageElement).src)
  // 아이콘 로딩 실패 시 즉시 이모지 폴백 사용
  showFallback.value = true
}
</script>

<style scoped>
.custom-node {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  min-width: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.custom-node:hover {
  border-color: #10a37f;
  box-shadow: 0 4px 12px rgba(16, 163, 127, 0.2);
}

.custom-node.disabled {
  background: #f3f4f6;
  border-color: #d1d5db;
  opacity: 0.7;
}

.node-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.node-svg-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  transition: opacity 0.2s ease;
}

.node-emoji-icon {
  font-size: 24px;
  line-height: 1;
}

.node-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  text-align: center;
  line-height: 1.3;
  max-width: 140px;
  word-wrap: break-word;
}

.custom-node.disabled .node-label {
  color: #6b7280;
}

/* Handle 스타일 오버라이드 */
:deep(.vue-flow__handle) {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 2px solid white;
  background: #6b7280;
}

:deep(.vue-flow__handle.vue-flow__handle-top) {
  top: -6px;
}

:deep(.vue-flow__handle.vue-flow__handle-bottom) {
  bottom: -6px;
}
</style>
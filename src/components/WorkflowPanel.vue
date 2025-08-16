<template>
  <div class="workflow-panel" :style="{ width: workflowPanelWidth + 'px' }">
    <div class="workflow-panel-resize" 
         @mousedown="$emit('start-resize', $event)"
         title="드래그하여 패널 크기 조정">
    </div>
    <div class="workflow-panel-content">
      <div class="workflow-panel-header">
        <h3>{{ selectedWorkflow?.name }}</h3>
        <div class="header-actions">
          <button v-if="selectedWorkflow?.jsonData" class="download-btn" @click="downloadJson" title="JSON 다운로드">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
          <button class="panel-close-btn" @click="$emit('close-panel')" title="패널 닫기">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="workflow-panel-body">
        <div class="panel-section">
          <h4>구조</h4>
          <div class="workflow-structure">
            <a v-if="selectedWorkflow?.n8nUrl" :href="selectedWorkflow.n8nUrl" target="_blank" class="n8n-link">
              {{ selectedWorkflow.n8nUrl }}
            </a>
            <span v-else class="no-structure">구조 정보가 없습니다</span>
          </div>
        </div>

        <div class="panel-section">
          <h4>JSON 파일 내용</h4>
          <div class="workflow-json">
            <pre v-if="selectedWorkflow?.jsonData" v-html="formatJsonWithSyntaxHighlight(selectedWorkflow.jsonData)"></pre>
            <span v-else class="no-json">JSON 데이터가 없습니다</span>
          </div>
        </div>

        <div class="panel-section">
          <h4>워크플로우 설명</h4>
          <div class="workflow-description">
            <p v-if="selectedWorkflow?.description">{{ selectedWorkflow.description }}</p>
            <span v-else class="no-description">설명이 없습니다</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WorkflowItem } from '../types'

const props = defineProps<{
  selectedWorkflow: WorkflowItem | null
  workflowPanelWidth: number
}>()

defineEmits<{
  'close-panel': []
  'start-resize': [event: MouseEvent]
}>()

const formatJsonWithSyntaxHighlight = (jsonData: any) => {
  if (!jsonData) return ''
  
  let jsonString = JSON.stringify(jsonData, null, 2)
  
  jsonString = jsonString
    .replace(/(".*?")(\s*:\s*)/g, '<span class="json-key">$1</span>$2')
    .replace(/:\s*(".*?")/g, ': <span class="json-string">$1</span>')
    .replace(/:\s*(\d+)/g, ': <span class="json-number">$1</span>')
    .replace(/:\s*(true|false)/g, ': <span class="json-boolean">$1</span>')
    .replace(/:\s*(null)/g, ': <span class="json-null">$1</span>')
  
  return jsonString
}

const downloadJson = () => {
  if (!props.selectedWorkflow?.jsonData) return
  
  const dataStr = JSON.stringify(props.selectedWorkflow.jsonData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${props.selectedWorkflow.title || 'workflow'}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.workflow-panel {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  background: white;
  border-left: 1px solid #e5e7eb;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: row;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.workflow-panel-resize {
  width: 4px;
  background: transparent;
  cursor: col-resize;
  transition: background 0.2s;
  position: relative;
}

.workflow-panel-resize:hover {
  background: #10a37f;
}

.workflow-panel-resize::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 0;
  width: 20px;
  height: 100%;
}

.workflow-panel-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.workflow-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.workflow-panel-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.download-btn {
  background: #10a37f;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  color: white;
  transition: all 0.2s;
}

.download-btn:hover {
  background: #0f8a6a;
}

.panel-close-btn {
  background: transparent;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.panel-close-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.workflow-panel-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  position: relative;
}

.panel-section {
  width: 100%;
  padding: 20px;
  border-bottom: 1px solid #f3f4f6;
  box-sizing: border-box;
  position: relative;
  background: white;
}

.panel-section:last-child {
  border-bottom: none;
  padding-bottom: 30px;
}

.panel-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.workflow-structure {
  margin: 0;
  width: 100%;
  box-sizing: border-box;
}

.workflow-structure .n8n-link {
  color: #10a37f;
  text-decoration: none;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  padding: 8px 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  display: block;
  transition: all 0.2s;
  word-break: break-all;
  width: 100%;
  box-sizing: border-box;
}

.workflow-structure .n8n-link:hover {
  background: #dcfce7;
  border-color: #86efac;
}

.workflow-json {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  max-height: 250px;
  overflow-y: auto;
  overflow-x: auto;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
}

.workflow-json pre {
  margin: 0;
  padding: 16px;
  font-family: 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #1f2937;
  white-space: pre;
  overflow-x: auto;
  tab-size: 2;
}

:deep(.json-key) {
  color: #dc2626;
  font-weight: 600;
}

:deep(.json-string) {
  color: #059669;
}

:deep(.json-number) {
  color: #7c3aed;
}

:deep(.json-boolean) {
  color: #ea580c;
}

:deep(.json-null) {
  color: #6b7280;
}

.workflow-description {
  margin: 0;
  width: 100%;
  box-sizing: border-box;
}

.workflow-description p {
  margin: 0;
  line-height: 1.6;
  color: #4b5563;
  font-size: 14px;
  width: 100%;
  word-wrap: break-word;
}

.no-structure, .no-json, .no-description {
  color: #9ca3af;
  font-style: italic;
  font-size: 14px;
  display: block;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}
</style>
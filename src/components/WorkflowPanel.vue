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
          <button class="panel-close-btn" @click="$emit('close-panel')" title="패널 닫기">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="workflow-panel-body">
        <div class="canvas-full-section">
          <WorkflowCanvasViewer 
            :workflow="selectedWorkflow"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WorkflowItem } from '../types'
import WorkflowCanvasViewer from './WorkflowCanvasViewer.vue'

const props = defineProps<{
  selectedWorkflow: WorkflowItem | null
  workflowPanelWidth: number
}>()

defineEmits<{
  'close-panel': []
  'start-resize': [event: MouseEvent]
}>()

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
  user-select: none;
  flex-shrink: 0;
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
  cursor: col-resize;
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


.panel-close-btn {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  color: #374151;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.panel-close-btn:hover {
  background: #ef4444;
  color: white;
  border-color: #dc2626;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
  transform: translateY(-1px);
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


.canvas-full-section {
  flex: 1;
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.canvas-full-section > * {
  flex: 1;
  height: 100%;
}
</style>
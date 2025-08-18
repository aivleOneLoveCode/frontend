<template>
  <div 
    :class="['workflow-item', { 
      active: workflow.active, 
      running: workflow.isRunning, 
      dragging: workflow.isDragging 
    }]"
    @click="$emit('select', workflow)"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    draggable="true">
    <span class="item-title">{{ workflow.name }}</span>
    <div :class="['workflow-controls', { 'show-always': workflow.status === 'active' }]">
      <div :class="['workflow-toggle', { active: workflow.status === 'active' }]" 
           @click.stop="$emit('toggle-running', workflow)"
           :title="workflow.status === 'active' ? t('deactivate_workflow') : t('activate_workflow')">
      </div>
    </div>
    <div class="item-menu">
      <button class="item-menu-btn" @click.stop="showDropdown">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="2"/>
          <circle cx="12" cy="12" r="2"/>
          <circle cx="19" cy="12" r="2"/>
        </svg>
      </button>
      <div class="dropdown-menu" :class="{ show: showMenu }" :style="globalDropdownStyle" @click.stop>
        <button class="dropdown-item" @click="handleRename">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
            <path d="m15 5 4 4"/>
          </svg>
          {{ t('rename') }}
        </button>
        <button class="dropdown-item" @click="handleCopy">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
          </svg>
          {{ t('copy') }}
        </button>
        <button class="dropdown-item delete" @click="handleDelete">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18"/>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
          {{ t('delete') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTranslation } from '@/utils/i18n'
import { openDropdown, closeDropdown, isDropdownOpen, globalDropdownStyle } from '@/utils/dropdownManager'

// 백엔드 스키마에 맞는 타입 import
import type { WorkflowItem } from '@/types'

const props = defineProps<{
  workflow: WorkflowItem
}>()

const emit = defineEmits<{
  'select': [workflow: WorkflowItem]
  'toggle-running': [workflow: WorkflowItem]
  'rename': [workflow: WorkflowItem]
  'copy': [workflow: WorkflowItem]
  'delete': [workflowId: string]  // n8n_workflow_id는 string
}>()

const { t } = useTranslation()

// 전역 드롭다운 시스템 사용
const dropdownId = computed(() => `workflow-${props.workflow.n8n_workflow_id}`)
const showMenu = computed(() => isDropdownOpen(dropdownId.value))

// 드래그 앤 드롭 관련
const handleDragStart = (event: DragEvent) => {
  props.workflow.isDragging = true
  
  // 올바른 필드명으로 드래그 데이터 생성 (JSON 데이터 포함)
  const dragData = {
    n8n_workflow_id: props.workflow.n8n_workflow_id,
    name: props.workflow.name,
    project_id: props.workflow.project_id,
    status: props.workflow.status,
    user_id: props.workflow.user_id,
    jsonData: props.workflow.jsonData,
    isDragging: true
  }
  
  event.dataTransfer!.setData('text/plain', JSON.stringify(dragData))
  event.dataTransfer!.effectAllowed = 'move'
}

const handleDragEnd = () => {
  props.workflow.isDragging = false
}

// 드롭다운 메뉴 관련
const showDropdown = (event: Event) => {
  openDropdown(dropdownId.value, event)
}

const handleRename = () => {
  closeDropdown()
  emit('rename', props.workflow)
}

const handleCopy = () => {
  closeDropdown()
  emit('copy', props.workflow)
}

const handleDelete = () => {
  closeDropdown()
  emit('delete', props.workflow.n8n_workflow_id)
}

</script>

<style scoped>
/* 워크플로우 아이템 스타일 */
.workflow-item {
  padding: 8px 12px;
  margin: 2px 0;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: var(--text-color);
  transition: all 0.1s ease;
  position: relative;
  min-height: 32px;
  background: transparent;
}

.workflow-item:hover {
  background: var(--panel-hover);
}

.workflow-item.active {
  background: rgba(103, 189, 198, 0.1);
  font-weight: 500;
  border: 1px solid rgba(103, 189, 198, 0.3);
}

.workflow-item.dragging {
  opacity: 0.5;
  transform: scale(0.98);
}

.workflow-item .item-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 8px;
}

/* 워크플로우 컨트롤 */
.workflow-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
  margin-right: 8px;
}

.workflow-item:hover .workflow-controls,
.workflow-item.running .workflow-controls,
.workflow-controls.show-always {
  opacity: 1;
}

.workflow-toggle {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.workflow-toggle.active {
  background: #ef4444;
}

.workflow-toggle.active::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 50%;
  animation: gentle-pulse 3s infinite ease-out;
  pointer-events: none;
}

@keyframes gentle-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
    opacity: 1;
  }
  70% {
    box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
    opacity: 0;
  }
  100% {
    box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
    opacity: 0;
  }
}

/* 아이템 메뉴 */
.item-menu {
  position: relative;
}

.item-menu-btn {
  opacity: 0;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  border-radius: 4px;
  color: var(--text-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  margin-left: 8px;
  flex-shrink: 0;
}

.item-menu-btn:hover {
  background: var(--panel-hover);
  color: var(--text-color);
}

.workflow-item:hover .item-menu-btn {
  opacity: 1;
}

/* 드롭다운 메뉴 */
.dropdown-menu {
  background: var(--dropdown-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--dropdown-shadow);
  min-width: 130px;
  display: none;
}

.dropdown-menu.show {
  display: block;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 14px;
  color: var(--text-color);
  background: none;
  border: none;
  width: calc(100% - 8px);
  text-align: left;
  cursor: pointer;
  transition: background 0.1s;
  border-radius: 6px;
  margin: 2px 4px;
}

.dropdown-item:hover {
  background: var(--panel-hover);
}

.dropdown-item.delete {
  color: #dc2626;
}

.dropdown-item.delete:hover {
  background: #fef2f2;
}
</style>
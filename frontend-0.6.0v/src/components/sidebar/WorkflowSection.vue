<template>
  <div class="section workflow-section">
    <div class="section-header">
      <div class="section-title">{{ t('workflows') }}</div>
      <button class="section-new-btn" @click="handleNewProject" title="새 프로젝트">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          <path d="M12 11v6M9 14h6"/>
        </svg>
      </button>
    </div>
    <div class="section-content" 
         @dragover.prevent="handleSectionDragOver"
         @drop="handleSectionDrop">
      <!-- 프로젝트 리스트 -->
      <div class="project-list">
        <div v-for="project in projects" 
             :key="project.project_id"
             :class="['project-item', { active: project.active }]">
          <div :class="['project-header', { 'drag-over': project.dragOver }]"
               @click="selectProject(project)"
               @dragover.prevent="handleProjectDragOver(project, $event)"
               @dragleave="handleProjectDragLeave(project)"
               @drop="handleProjectDrop(project, $event)">
            <div class="project-info">
              <span>📂 {{ project.name }}</span>
              <span v-if="workflowsByProject[project.project_id]?.length > 0" class="workflow-count">({{ workflowsByProject[project.project_id]?.length }})</span>
            </div>
            <div class="item-menu">
              <button class="item-menu-btn" @click.stop="showProjectDropdown(project.project_id, $event)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="5" cy="12" r="2"/>
                  <circle cx="12" cy="12" r="2"/>
                  <circle cx="19" cy="12" r="2"/>
                </svg>
              </button>
              <div class="dropdown-menu" :class="{ show: isDropdownOpen('project-' + project.project_id) }" :style="globalDropdownStyle" @click.stop>
                <button class="dropdown-item" @click="renameProject(project)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                    <path d="m15 5 4 4"/>
                  </svg>
                  {{ t('rename') }}
                </button>
                <button class="dropdown-item delete" @click="deleteProject(project.project_id)">
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
          <!-- 프로젝트 내 워크플로우들 -->
          <div v-if="project.expanded" class="project-workflows">
            <WorkflowItemComponent
              v-for="workflow in workflowsByProject[project.project_id] || []"
              :key="workflow.n8n_workflow_id"
              :workflow="workflow"
              @select="handleWorkflowSelect"
              @toggle-running="toggleWorkflowRunning"
              @rename="renameWorkflow"
              @copy="copyWorkflow"
              @delete="deleteWorkflow"
            />
          </div>
        </div>
      </div>
      <!-- 개별 워크플로우들 (프로젝트에 속하지 않은) -->
      <div class="standalone-workflows">
        <WorkflowItemComponent
          v-for="workflow in standaloneWorkflows"
          :key="workflow.n8n_workflow_id"
          :workflow="workflow"
          @select="handleWorkflowSelect"
          @toggle-running="toggleWorkflowRunning"
          @rename="renameWorkflow"
          @copy="copyWorkflow"
          @delete="deleteWorkflow"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import WorkflowItemComponent from './WorkflowItem.vue'
import { useTranslation } from '@/utils/i18n'
import { registerSelectionClearCallback, selectWorkflowGlobally } from '@/utils/workflowSelection'
import { openDropdown, closeDropdown, isDropdownOpen, globalDropdownStyle } from '@/utils/dropdownManager'
import { workflowService } from '@/services/workflow'
import { projectService } from '@/services/project'
import { useAuthStore } from '@/stores/auth'

import type { WorkflowItem, Project } from '@/types'

const emit = defineEmits<{
  'new-project': []
  'select-workflow': [workflow: WorkflowItem]
}>()

const { t } = useTranslation()

// 상태 관리 변수들 - 백엔드 스키마 그대로 사용
const projects = ref<Project[]>([])
const workflows = ref<WorkflowItem[]>([])  // 모든 워크플로우를 하나의 배열로
const copiedWorkflow = ref<WorkflowItem | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')
const pollingInterval = ref<number | null>(null)
const POLLING_INTERVAL_MS = 10000 // 10초마다 polling

// 계산된 속성으로 워크플로우 분류
const standaloneWorkflows = computed(() => 
  workflows.value.filter(w => w.project_id === null)
)

const workflowsByProject = computed(() => {
  const grouped: Record<number, WorkflowItem[]> = {}
  workflows.value
    .filter(w => w.project_id !== null)
    .forEach(w => {
      const projectId = w.project_id!
      if (!grouped[projectId]) {
        grouped[projectId] = []
      }
      grouped[projectId].push(w)
    })
  return grouped
})

// 새 프로젝트 생성
const createNewProject = async () => {
  const projectName = prompt(t('enter_project_name'), t('new_project'))
  if (projectName && projectName.trim()) {
    try {
      const response = await projectService.createProject(projectName.trim())
      
      // 새 프로젝트를 로컬 상태에 추가
      const newProject: Project = {
        project_id: response.project_id,
        user_id: 1, // 백엔드에서 설정됨
        name: response.name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        active: false,
        expanded: false
      }
      projects.value.push(newProject)
      
      // 데이터를 다시 로드하여 최신 상태 반영
      await loadData()
      
    } catch (error) {
      console.error('프로젝트 생성 실패:', error)
      alert('프로젝트 생성에 실패했습니다.')
    }
  }
}

// 프로젝트 선택/토글
const selectProject = (project: Project) => {
  project.expanded = !project.expanded
}

// 워크플로우 실행 상태 토글
const toggleWorkflowRunning = async (workflow: WorkflowItem) => {
  try {
    const response = await workflowService.toggleWorkflowStatus(workflow.n8n_workflow_id)
    
    // 로컬 상태 업데이트
    workflow.status = response.status as 'active' | 'inactive'
    workflow.updated_at = new Date().toISOString()
    
  } catch (error) {
    console.error('워크플로우 상태 변경 실패:', error)
    alert('워크플로우 상태 변경에 실패했습니다.')
  }
}

// 드래그 앤 드롭 관련
const handleProjectDragOver = (project: Project, event: DragEvent) => {
  event.preventDefault()
  event.dataTransfer!.dropEffect = 'move'
  project.dragOver = true
}

const handleProjectDragLeave = (project: Project) => {
  project.dragOver = false
}

const handleProjectDrop = async (project: Project, event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  project.dragOver = false
  
  const workflowData = event.dataTransfer!.getData('text/plain')
  
  if (workflowData) {
    try {
      // JSON 데이터인지 확인
      if (!workflowData.startsWith('{')) {
        return
      }
      
      const draggedWorkflow = JSON.parse(workflowData)
      
      // 워크플로우 데이터 유효성 검사
      if (!draggedWorkflow.n8n_workflow_id) {
        return
      }
      
      // 중복 체크 - 이미 이 프로젝트에 있는지
      const exists = workflows.value.some((w: WorkflowItem) => 
        w.n8n_workflow_id === draggedWorkflow.n8n_workflow_id && 
        w.project_id === project.project_id
      )
      
      if (!exists) {
        // 워크플로우의 project_id 업데이트
        const workflowIndex = workflows.value.findIndex((w: WorkflowItem) => 
          w.n8n_workflow_id === draggedWorkflow.n8n_workflow_id
        )
        
        if (workflowIndex > -1) {
          try {
            await workflowService.assignWorkflowToProject(draggedWorkflow.n8n_workflow_id, project.project_id)
            
            // 로컬 상태 업데이트
            workflows.value[workflowIndex].project_id = project.project_id
            workflows.value[workflowIndex].updated_at = new Date().toISOString()
            workflows.value[workflowIndex].isDragging = false
            
          } catch (error) {
            console.error('워크플로우 이동 실패:', error)
            alert('워크플로우 이동에 실패했습니다.')
          }
        }
      }
    } catch (e) {
      console.error('❌ 워크플로우 데이터 파싱 오류 (프로젝트):', e)
      console.error('파싱 시도한 데이터:', workflowData)
      // 에러를 조용히 무시하고 사용자에게 표시하지 않음
    }
  }
}

// 워크플로우를 바깥으로 드래그해서 빼내기 (비소속으로 만들기)
const handleSectionDrop = async (event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  
  const workflowData = event.dataTransfer!.getData('text/plain')
  
  if (workflowData) {
    try {
      // JSON 데이터인지 확인
      if (!workflowData.startsWith('{')) {
        return
      }
      
      const draggedWorkflow = JSON.parse(workflowData)
      
      // 워크플로우 데이터 유효성 검사
      if (!draggedWorkflow.n8n_workflow_id) {
        return
      }
      
      // 워크플로우를 비소속으로 변경 (project_id = null)
      const workflowIndex = workflows.value.findIndex((w: WorkflowItem) => 
        w.n8n_workflow_id === draggedWorkflow.n8n_workflow_id
      )
      
      if (workflowIndex > -1 && workflows.value[workflowIndex].project_id !== null) {
        try {
          await workflowService.assignWorkflowToProject(draggedWorkflow.n8n_workflow_id, null)
          
          // 로컬 상태 업데이트
          workflows.value[workflowIndex].project_id = null
          workflows.value[workflowIndex].updated_at = new Date().toISOString()
          workflows.value[workflowIndex].isDragging = false
          
        } catch (error) {
          console.error('워크플로우 이동 실패:', error)
          alert('워크플로우 이동에 실패했습니다.')
        }
      }
    } catch (e) {
      console.error('❌ 워크플로우 데이터 파싱 오류 (섹션):', e)
      console.error('파싱 시도한 데이터:', workflowData)
      // 에러를 조용히 무시하고 사용자에게 표시하지 않음
    }
  }
}

const handleSectionDragOver = (event: DragEvent) => {
  event.preventDefault()
  event.dataTransfer!.dropEffect = 'move'
}

// 드롭다운 관련
const showProjectDropdown = (id: number, event: Event) => {
  const dropdownId = `project-${id}`
  openDropdown(dropdownId, event)
}


// 프로젝트 관련 함수들
const renameProject = async (project: Project) => {
  closeDropdown()
  const newName = prompt(t('enter_new_name', { current: project.name }), project.name)
  if (newName && newName.trim()) {
    try {
      await projectService.updateProject(project.project_id, newName.trim())
      
      // 로컬 상태 업데이트
      project.name = newName.trim()
      project.updated_at = new Date().toISOString()
      
    } catch (error) {
      console.error('프로젝트 이름 변경 실패:', error)
      alert('프로젝트 이름 변경에 실패했습니다.')
    }
  }
}

const deleteProject = async (projectId: number) => {
  closeDropdown()
  if (confirm(t('confirm_delete'))) {
    try {
      await projectService.deleteProject(projectId)
      
      // 로컬 상태에서 프로젝트 제거
      const index = projects.value.findIndex(item => item.project_id === projectId)
      if (index > -1) {
        
        // 프로젝트의 워크플로우들을 비소속으로 변경
        workflows.value.forEach((workflow: WorkflowItem) => {
          if (workflow.project_id === projectId) {
            workflow.project_id = null
            workflow.updated_at = new Date().toISOString()
          }
        })
        
        projects.value.splice(index, 1)
      }
    } catch (error) {
      console.error('프로젝트 삭제 실패:', error)
      alert('프로젝트 삭제에 실패했습니다.')
    }
  }
}

// 워크플로우 관련 함수들
const renameWorkflow = async (workflow: WorkflowItem) => {
  const newName = prompt(t('enter_new_name', { current: workflow.name }), workflow.name)
  if (newName && newName.trim()) {
    try {
      await workflowService.updateWorkflowName(workflow.n8n_workflow_id, newName.trim())
      
      // 로컬 상태 업데이트
      workflow.name = newName.trim()
      workflow.updated_at = new Date().toISOString()
      
    } catch (error) {
      console.error('워크플로우 이름 변경 실패:', error)
      alert('워크플로우 이름 변경에 실패했습니다.')
    }
  }
}

const copyWorkflow = (workflow: WorkflowItem) => {
  copiedWorkflow.value = {
    ...workflow,
    n8n_workflow_id: `copy_${Date.now()}`,
    active: false,
    status: 'inactive',
    isDragging: false,
    jsonData: workflow.jsonData ? { ...workflow.jsonData } : undefined
  }
}

const deleteWorkflow = async (workflowId: string) => {
  if (confirm(t('confirm_delete'))) {
    try {
      await workflowService.deleteWorkflow(workflowId)
      
      // 로컬 상태에서 워크플로우 제거
      const index = workflows.value.findIndex((w: WorkflowItem) => w.n8n_workflow_id === workflowId)
      if (index > -1) {
        workflows.value.splice(index, 1)
      }
    } catch (error) {
      console.error('워크플로우 삭제 실패:', error)
      alert('워크플로우 삭제에 실패했습니다.')
    }
  }
}

// API에서 데이터 로드
const loadData = async (isPolling = false) => {
  // 인증된 사용자만 데이터 로드
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) {
    if (!isPolling) {
      errorMessage.value = '로그인이 필요합니다.'
    }
    return
  }
  
  // polling 중이 아닐 때만 로딩 상태 표시
  if (!isPolling) {
    isLoading.value = true
  }
  errorMessage.value = ''
  
  try {
    if (!isPolling) {
    }
    
    // 프로젝트와 워크플로우 데이터를 병렬로 로드
    const [projectsResponse, workflowsResponse] = await Promise.all([
      projectService.getAllProjects(),
      workflowService.getAllWorkflows()
    ])
    
    if (!isPolling) {
    }
    
    projects.value = projectsResponse.projects || []
    
    // 백엔드 응답을 프론트엔드 형식으로 변환
    const rawWorkflows = workflowsResponse.workflows || []
    workflows.value = rawWorkflows.map((workflow: any) => ({
      n8n_workflow_id: workflow.workflow_id || workflow.n8n_workflow_id,
      name: workflow.title || workflow.name,
      project_id: workflow.project_id,
      status: workflow.status || 'inactive',
      user_id: workflow.user_id || '',
      created_at: workflow.created_at || '',
      updated_at: workflow.updated_at || ''
    }))
    
    if (!isPolling) {
    }
  } catch (error: any) {
    if (!isPolling) {
      console.error('❌ 데이터 로드 실패:', error)
      
      if (error.response?.status === 401) {
        errorMessage.value = '인증이 만료되었습니다. 다시 로그인해주세요.'
      } else if (error.response?.status === 403) {
        errorMessage.value = '액세스 권한이 없습니다.'
      } else if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        errorMessage.value = '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.'
      } else {
        errorMessage.value = `데이터 로드 실패: ${error.message || error}`
      }
    }
  } finally {
    if (!isPolling) {
      isLoading.value = false
    }
  }
}

// 워크플로우 선택 핸들러 - 글로벌 상태 관리 사용
const handleWorkflowSelect = (workflow: WorkflowItem) => {
  // 글로벌 워크플로우 선택 함수 사용 (다른 컴포넌트와 상태 공유)
  selectWorkflowGlobally(workflow)
  
  // Home.vue에도 이벤트 전달 (기존 패널 열기 등을 위해)
  emit('select-workflow', workflow)
}

// 선택 상태 초기화 함수
const clearProjectWorkflowSelections = () => {
  workflows.value.forEach((workflow: WorkflowItem) => workflow.active = false)
}

// polling 시작
const startPolling = () => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
  }
  
  pollingInterval.value = window.setInterval(() => {
    loadData(true) // polling 플래그로 호출
  }, POLLING_INTERVAL_MS)
  
}

// polling 중지
const stopPolling = () => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
    pollingInterval.value = null
  }
}

// 새 프로젝트 버튼과 연결
const handleNewProject = () => {
  createNewProject()
  emit('new-project')
}

// 컴포넌트 마운트 시 API에서 데이터 로드 및 polling 시작
onMounted(() => {
  loadData()
  registerSelectionClearCallback(clearProjectWorkflowSelections)
  startPolling()
})

// 컴포넌트 언마운트 시 polling 정리
onUnmounted(() => {
  stopPolling()
})

// 인증 상태 변화 감지
const authStore = useAuthStore()
watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  if (isAuthenticated) {
    loadData()
    startPolling()
  } else {
    stopPolling()
  }
}, { immediate: false })
</script>

<style scoped>
/* 섹션 스타일 */
.section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

/* 섹션 헤더 */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 12px 8px 12px;
  background: var(--sidebar-bg);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.section-new-btn {
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.section-new-btn:hover {
  background: var(--panel-hover);
  color: var(--text-color);
  transform: scale(1.1);
}

/* 섹션 콘텐츠 */
.section-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.section-content::-webkit-scrollbar {
  width: 6px;
}

.section-content::-webkit-scrollbar-track {
  background: transparent;
}

.section-content::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 3px;
}

.section-content::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}

/* 프로젝트 관련 스타일 */
.project-item {
  margin: 2px 0;
  border-radius: 8px;
  background: var(--panel-bg);
  transition: all 0.2s ease;
}

.project-header {
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 8px;
  transition: background 0.1s ease;
  min-height: 40px;
}

.project-header.drag-over {
  background: rgba(103, 189, 198, 0.1);
  border: 2px dashed #67bdc6;
  padding: 8px 10px;
}

.project-header:hover {
  background: var(--panel-hover);
}

.project-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
}

.workflow-count {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 400;
}

/* 프로젝트 내 워크플로우 */
.project-workflows {
  padding-left: 20px;
  padding-top: 4px;
  padding-bottom: 4px;
}

/* 공통 아이템 메뉴 */
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

.project-item:hover .item-menu-btn {
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
<template>
  <div :class="['sidebar', { collapsed: collapsed }]">
    <button class="sidebar-close-btn" @click="$emit('toggle-sidebar')" :title="t('close_sidebar')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
    </button>
    
    <div class="sidebar-top">
      <div class="sidebar-header">
        <button class="new-chat-btn" @click="$emit('new-chat')">
          <div class="new-chat-content">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            {{ t('new_chat') }}
          </div>
          <div class="shortcut-hint">Ctrl+Shift+O</div>
        </button>
        <button class="new-folder-btn" @click="$emit('new-folder')">
          <div class="new-chat-content">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              <line x1="12" y1="11" x2="12" y2="17"/>
              <line x1="9" y1="14" x2="15" y2="14"/>
            </svg>
            {{ t('new_folder') }}
          </div>
          <div class="shortcut-hint">Ctrl+Shift+F</div>
        </button>
        <div class="section-title" style="margin-top: 8px;">{{ t('folders') }}</div>
        
        <!-- 폴더 리스트 -->
        <div class="folder-content">
          <div class="folder-list">
            <div v-for="item in paginatedFolderItems" 
                 :key="item.id"
                 :class="['folder-item', { active: item.active }]">
              <div :class="['folder-header', { 'drag-over': item.dragOver }]"
                   @click="toggleFolder(item)"
                   @dragover.prevent="handleFolderDragOver(item, $event)"
                   @dragleave="handleFolderDragLeave(item)"
                   @drop="handleFolderDrop(item, $event)">
                <div class="folder-toggle">
                  <svg :class="['folder-arrow', { expanded: item.expanded }]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 6L16 12L10 18" />
                  </svg>
                  <span>📁 {{ item.title }}</span>
                  <span v-if="item.workflows && item.workflows.length > 0" style="color: #9ca3af; font-size: 12px; margin-left: 4px;">({{ item.workflows.length }})</span>
                </div>
                <div class="item-menu">
                  <button class="item-menu-btn" @click.stop="showDropdown(item.id, 'folder', $event)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="5" cy="12" r="2"/>
                      <circle cx="12" cy="12" r="2"/>
                      <circle cx="19" cy="12" r="2"/>
                    </svg>
                  </button>
                  <div class="dropdown-menu" :class="{ show: activeMenu === 'folder-' + item.id }" @click.stop>
                    <button class="dropdown-item" @click="renameItem(item, 'folder')">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        <path d="m15 5 4 4"/>
                      </svg>
                      {{ t('rename') }}
                    </button>
                    <button class="dropdown-item" @click="pasteWorkflow(item)" :disabled="!copiedWorkflow">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                      </svg>
                      {{ t('paste') }}
                    </button>
                    <button class="dropdown-item delete" @click="deleteItem(item.id, 'folder')">
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
              <div :class="['folder-workflows', { expanded: item.expanded }]">
                <div v-for="workflow in item.workflows"
                     :key="workflow.id"
                     :class="['folder-workflow-item', { active: workflow.active, running: workflow.isRunning }]"
                     @click="selectFolderWorkflow(workflow, item)">
                  <span class="item-title">{{ workflow.title }}</span>
                  <div class="workflow-controls">
                    <div :class="['workflow-toggle', { active: workflow.isRunning }]" 
                         @click.stop="toggleWorkflowRunning(workflow)"
                         :title="workflow.isRunning ? t('deactivate_workflow') : t('activate_workflow')">
                    </div>
                  </div>
                  <div class="item-menu">
                    <button class="item-menu-btn" @click.stop="showDropdown('folder-workflow-' + workflow.id, 'workflow', $event)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="5" cy="12" r="2"/>
                        <circle cx="12" cy="12" r="2"/>
                        <circle cx="19" cy="12" r="2"/>
                      </svg>
                    </button>
                    <div class="dropdown-menu" :class="{ show: activeMenu === 'workflow-folder-workflow-' + workflow.id }" @click.stop>
                      <button class="dropdown-item" @click="renameItem(workflow, 'folder-workflow', item)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                          <path d="m15 5 4 4"/>
                        </svg>
                        {{ t('rename') }}
                      </button>
                      <button class="dropdown-item" @click="copyWorkflow(workflow)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                        </svg>
                        {{ t('copy') }}
                      </button>
                      <button class="dropdown-item delete" @click="deleteItem(workflow.id, 'folder-workflow', item)">
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
              </div>
            </div>
          </div>
        </div>
        
        <!-- 폴더 페이지네이션 -->
        <div class="folder-pagination" v-if="totalFolderPages > 1">
          <button class="folder-nav-btn" 
                  @click="prevFolderPage" 
                  :disabled="currentFolderPage <= 1">‹</button>
          <div class="folder-page-info">
            {{ currentFolderPage }} / {{ totalFolderPages }}
          </div>
          <button class="folder-nav-btn" 
                  @click="nextFolderPage" 
                  :disabled="currentFolderPage >= totalFolderPages">›</button>
        </div>
      </div>
    </div>
    
    <div class="sidebar-content">
      <div class="chat-history">
        <!-- 채팅 히스토리 섹션 -->
        <div class="section-title">{{ t('chat') }}</div>
        <div class="chat-history-content">
          <div v-for="item in chatHistoryItems" 
               :key="item.id"
               :class="['chat-history-item', { active: item.active }]"
               @click="selectChatHistory(item)">
            <span class="item-title">{{ item.title }}</span>
            <div class="item-menu">
              <button class="item-menu-btn" @click="showDropdown(item.id, 'chat', $event)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="5" cy="12" r="2"/>
                  <circle cx="12" cy="12" r="2"/>
                  <circle cx="19" cy="12" r="2"/>
                </svg>
              </button>
              <div class="dropdown-menu" :class="{ show: activeMenu === 'chat-' + item.id }" @click.stop>
                <button class="dropdown-item" @click="renameItem(item, 'chat')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                    <path d="m15 5 4 4"/>
                  </svg>
                  {{ t('rename') }}
                </button>
                <button class="dropdown-item delete" @click="deleteItem(item.id, 'chat')">
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
        </div>
      </div>
    </div>

    <!-- 사용자 프로필 -->
    <div class="sidebar-footer">
      <div class="user-profile" @click="showDropdown('user-profile', 'user', $event)">
        <div class="user-avatar">{{ getUserInitial }}</div>
        <div class="user-name">{{ getUserName }}</div>
        <div class="user-profile-dropdown dropdown-menu" :class="{ show: activeMenu === 'user-user-profile' }" @click.stop>
          <button class="dropdown-item" @click="openSettings">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V6a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V12a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            {{ t('settings') }}
          </button>
          <button class="dropdown-item" @click="openHelp">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            {{ t('help') }}
          </button>
          <button class="dropdown-item" @click="logout">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {{ t('logout') }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 설정 모달 -->
  <SettingsModal :isOpen="showSettingsModal" @close="closeSettingsModal" />
  
  <!-- 도움말 모달 -->
  <HelpModal :isOpen="showHelpModal" @close="closeHelpModal" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SettingsModal from './SettingsModal.vue'
import HelpModal from './HelpModal.vue'
import { useTranslation } from '@/utils/i18n'
import { useFolderManagement, type Folder, type Workflow } from '@/composables/useFolderManagement'
import type { ChatHistoryItem } from '../types'

const props = defineProps<{
  collapsed: boolean
  chatHistoryItems: ChatHistoryItem[]
}>()

const emit = defineEmits<{
  'toggle-sidebar': []
  'new-chat': []
  'new-folder': []
  'select-chat': [item: ChatHistoryItem]
  'select-workflow': [workflow: Workflow]
  'show-dropdown': [id: number | string, type: string, event: Event]
  'rename-item': [item: any, type: string]
  'delete-item': [id: number, type: string, folder?: Folder]
}>()

const router = useRouter()

// 폴더 관리 composable
const { folders, saveFoldersToLocalStorage, loadFoldersFromLocalStorage, toggleFolder: toggleFolderComposable } = useFolderManagement()

// 상태 관리 변수들
const copiedWorkflow = ref<Workflow | null>(null)

// 사용자 관련 상태
const currentUser = ref<any>(null)
const showSettingsModal = ref(false)
const showHelpModal = ref(false)
const activeMenu = ref<string | null>(null)

// 다국어 지원
const { t } = useTranslation()

// 페이지네이션 관련
const currentFolderPage = ref(1)
const folderPageSize = ref(4)
const totalFolderPages = computed(() => Math.ceil(folders.value.length / folderPageSize.value))
const paginatedFolderItems = computed(() => {
  const start = (currentFolderPage.value - 1) * folderPageSize.value
  const end = start + folderPageSize.value
  return folders.value.slice(start, end)
})

// 폴더 토글 (composable 함수 사용)
const toggleFolder = (folder: Folder) => {
  toggleFolderComposable(folder)
}

// 워크플로우 실행 상태 토글 (HTML과 동일)
const toggleWorkflowRunning = (workflow: Workflow) => {
  workflow.isRunning = !workflow.isRunning
  const status = workflow.isRunning ? '활성화 (트리거 대기중)' : '비활성화'
  console.log(`워크플로우 "${workflow.title}" ${status}`)
  saveFoldersToLocalStorage() // 상태 저장
}

// 드래그 앤 드롭 (HTML과 동일)
const handleFolderDragOver = (folder: Folder, event: DragEvent) => {
  event.preventDefault()
  event.dataTransfer!.dropEffect = 'move'
  folder.dragOver = true
}

const handleFolderDragLeave = (folder: Folder) => {
  folder.dragOver = false
}

const handleFolderDrop = (folder: Folder, event: DragEvent) => {
  event.preventDefault()
  event.stopPropagation()
  folder.dragOver = false
  
  // 워크플로우 데이터 가져오기
  const workflowData = event.dataTransfer!.getData('workflow')
  if (workflowData) {
    try {
      const workflow = JSON.parse(workflowData)
      
      // 폴더에 워크플로우 추가 (중복 체크)
      if (!folder.workflows) {
        folder.workflows = []
      }
      
      const exists = folder.workflows.some(w => w.id === workflow.id)
      if (!exists) {
        folder.workflows.push({...workflow})
        console.log(`워크플로우 "${workflow.title}"가 폴더 "${folder.title}"로 이동되었습니다.`)
        saveFoldersToLocalStorage() // 저장
      }
    } catch (e) {
      console.error('워크플로우 데이터 파싱 오류:', e)
    }
  }
}

// HTML의 기능들
const showDropdown = (id: number | string, type: string, event: Event) => {
  emit('show-dropdown', id, type, event)
}

const selectChatHistory = (item: ChatHistoryItem) => {
  emit('select-chat', item)
}

const selectFolderWorkflow = (workflow: Workflow, folder: Folder) => {
  // 이미 선택된 워크플로우를 다시 클릭한 경우 패널 닫기
  if (workflow.active) {
    workflow.active = false
    console.log('워크플로우 패널 닫힘')
    return
  }
  
  // 모든 워크플로우의 active 상태 초기화
  folders.value.forEach(f => {
    if (f.workflows) {
      f.workflows.forEach(w => w.active = false)
    }
  })
  
  // 선택된 워크플로우만 active
  workflow.active = true
  
  console.log(`폴더 "${folder.title}"의 워크플로우 "${workflow.title}" 선택됨`)
  emit('select-workflow', workflow)
}

const renameItem = (item: any, _type: string, _folder?: Folder) => {
  const newName = prompt(t('enter_new_name', { current: item.title }), item.title)
  if (newName && newName.trim()) {
    item.title = newName.trim()
    saveFoldersToLocalStorage() // 상태 저장
  }
}

const deleteItem = (id: number, type: string, folder?: Folder) => {
  if (confirm(t('confirm_delete'))) {
    if (type === 'folder') {
      const index = folders.value.findIndex(item => item.id === id)
      if (index > -1) {
        folders.value.splice(index, 1)
        saveFoldersToLocalStorage() // 저장
        
        // 현재 페이지에 항목이 없으면 이전 페이지로 이동
        const newTotalPages = Math.ceil(folders.value.length / folderPageSize.value)
        if (currentFolderPage.value > newTotalPages && newTotalPages > 0) {
          currentFolderPage.value = newTotalPages
        }
      }
    } else if (type === 'folder-workflow') {
      // 폴더 내부 워크플로우 삭제
      if (folder && folder.workflows) {
        const index = folder.workflows.findIndex(w => w.id === id)
        if (index > -1) {
          folder.workflows.splice(index, 1)
          console.log(`폴더 "${folder.title}"에서 워크플로우가 삭제되었습니다.`)
          saveFoldersToLocalStorage() // 저장
        }
      }
    }
    emit('delete-item', id, type, folder)
  }
}

const copyWorkflow = (workflow: Workflow) => {
  copiedWorkflow.value = {
    ...workflow,
    id: 0, // 새 ID로 설정될 예정
    active: false,
    isRunning: false,
    jsonData: workflow.jsonData ? { ...workflow.jsonData } : undefined
  }
  console.log('워크플로우가 복사되었습니다.')
}

const pasteWorkflow = (folder: Folder) => {
  if (copiedWorkflow.value) {
    const newWorkflow: Workflow = {
      id: Date.now(),
      title: `${copiedWorkflow.value.title} ${t('copy_suffix')}`,
      active: false,
      isRunning: false,
      description: copiedWorkflow.value.description,
      n8nUrl: copiedWorkflow.value.n8nUrl,
      jsonData: copiedWorkflow.value.jsonData ? { ...copiedWorkflow.value.jsonData } : undefined
    }
    
    if (!folder.workflows) {
      folder.workflows = []
    }
    folder.workflows.push(newWorkflow)
    
    console.log(`워크플로우가 폴더 "${folder.title}"에 붙여넣기되었습니다.`)
    saveFoldersToLocalStorage() // 저장
  }
}

// 페이지네이션
const prevFolderPage = () => {
  if (currentFolderPage.value > 1) {
    currentFolderPage.value--
  }
}

const nextFolderPage = () => {
  if (currentFolderPage.value < totalFolderPages.value) {
    currentFolderPage.value++
  }
}

// 사용자 관련 computed 속성 (HTML과 동일)
const getUserInitial = computed(() => {
  if (currentUser.value?.name) {
    return currentUser.value.name.charAt(0).toUpperCase()
  }
  return 'U'
})

const getUserName = computed(() => {
  if (currentUser.value?.name) {
    return currentUser.value.name
  }
  return t('user')
})

// 사용자 정보 로드 (HTML과 동일)
const loadCurrentUser = () => {
  try {
    const storedUser = localStorage.getItem('current_user')
    if (storedUser) {
      currentUser.value = JSON.parse(storedUser)
    }
  } catch (error) {
    console.error('사용자 정보 로드 실패:', error)
    currentUser.value = null
  }
}

// 모달 관련 함수들
const closeSettingsModal = () => {
  showSettingsModal.value = false
}

const closeHelpModal = () => {
  showHelpModal.value = false
}

// 사용자 프로필 관련 함수들 (HTML과 동일)
const openSettings = () => {
  showSettingsModal.value = true
  activeMenu.value = null
  console.log('설정 모달 열기')
}

const openHelp = () => {
  showHelpModal.value = true
  activeMenu.value = null
  console.log('도움말 모달 열기')
}

const logout = () => {
  if (confirm(t('confirm_logout'))) {
    // 채팅 기록 초기화
    // TODO: 부모 컴포넌트에서 채팅 데이터 초기화
    
    // 로컬 스토리지 정리
    localStorage.removeItem('chatHistories')
    localStorage.removeItem('customWorkflows')
    localStorage.removeItem('workflowFolders')
    localStorage.removeItem('folders')
    
    // 로그인 정보 제거
    localStorage.removeItem('current_user')
    currentUser.value = null
    
    console.log('로그아웃되었습니다.')
    
    // 로그인 페이지로 이동
    router.push('/login')
  }
  activeMenu.value = null
}

// 컴포넌트 마운트 시 localStorage에서 상태 복원
onMounted(() => {
  loadFoldersFromLocalStorage()
  loadCurrentUser() // 사용자 정보 로드
})

</script>

<style>
/* HTML 파일의 정확한 CSS 스타일 - 완전히 동일하게 적용 */
.sidebar {
  width: 260px;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: relative;
  transition: transform 0.3s ease;
}

.sidebar.collapsed {
  transform: translateX(-100%);
}

.sidebar-close-btn {
  position: absolute;
  top: 20px;
  right: -20px;
  width: 28px;
  height: 32px;
  background: var(--gray-100);
  border: 1px solid var(--border-color);
  border-left: none;
  border-radius: 0 12px 12px 0;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 14px;
  z-index: 20;
  box-shadow: 2px 0 4px rgba(0,0,0,0.05);
}

.sidebar-close-btn:hover {
  background: var(--gray-200);
  color: var(--gray-700);
  box-shadow: 2px 0 8px rgba(0,0,0,0.1);
}

.sidebar-header {
  padding: 12px;
  border-bottom: none;
}

.new-chat-btn, .new-folder-btn {
  width: 100%;
  padding: 10px 12px;
  margin: 2px 0;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  font-weight: 400;
  transition: background 0.1s ease;
  position: relative;
}

.new-chat-btn:hover, .new-folder-btn:hover {
  background: #e5e7eb;
}

.new-chat-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.shortcut-hint {
  opacity: 0;
  font-size: 12px;
  color: #6b7280;
  transition: opacity 0.2s;
}

.new-chat-btn:hover .shortcut-hint,
.new-folder-btn:hover .shortcut-hint {
  opacity: 1;
}

.section-title {
  padding: 10px 12px;
  margin: 2px 0;
  font-size: 14px;
  font-weight: 400;
  color: #9ca3af;
  position: sticky;
  top: 0;
  background: #f7f7f8;
  z-index: 10;
}

.sidebar-top {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  max-height: 70vh;
  overflow-y: auto;
}

.sidebar-top::-webkit-scrollbar {
  width: 6px;
}

.sidebar-top::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-top::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.sidebar-top::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.folder-content {
  flex: 0 0 auto;
  overflow-y: visible;
  padding-top: 0;
  padding-bottom: 0;
}

.folder-list {
  margin-top: 0;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.folder-item {
  margin: 2px 0;
  border-radius: 8px;
  color: #374151;
  font-size: 14px;
  transition: all 0.2s ease;
  user-select: none;
  -webkit-user-select: none;
}

.folder-header {
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 8px;
  transition: background 0.1s ease;
  min-height: 40px;
}

.folder-header.drag-over {
  background: #dbeafe;
  border: 2px dashed #60a5fa;
  padding: 8px 10px;
}

.folder-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.folder-arrow {
  width: 12px;
  height: 12px;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.folder-arrow.expanded {
  transform: rotate(90deg);
}

.folder-workflows {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  padding-left: 28px;
}

.folder-workflows.expanded {
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-top: 4px;
  padding-bottom: 4px;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.folder-workflows.expanded::-webkit-scrollbar {
  width: 6px;
}

.folder-workflows.expanded::-webkit-scrollbar-track {
  background: transparent;
}

.folder-workflows.expanded::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 3px;
  transition: background 0.2s ease;
}

.folder-workflows.expanded:hover::-webkit-scrollbar-thumb {
  background: #d1d5db;
}

.folder-workflow-item {
  padding: 8px 12px;
  margin: 2px 0;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: #4b5563;
  transition: background 0.1s ease;
  position: relative;
  min-height: 32px;
}

.folder-workflow-item .item-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 8px;
}

.folder-workflow-item .workflow-controls {
  opacity: 0;
  transition: opacity 0.2s;
  margin-right: 8px;
}

.folder-workflow-item:hover .workflow-controls {
  opacity: 1;
}

.folder-workflow-item.running .workflow-controls {
  opacity: 1;
}

.folder-workflow-item:hover {
  background: #f3f4f6;
}

.folder-workflow-item.active {
  background: #e5e7eb;
  font-weight: 500;
}

.folder-workflow-item.dragging {
  opacity: 0.5;
}

.folder-workflow-item:hover .item-menu-btn {
  opacity: 1;
}

.folder-header:hover {
  background: #e5e7eb;
}

.folder-item.active .folder-header {
  background: #e5e7eb;
  font-weight: 500;
}

.folder-header:hover .item-menu-btn {
  opacity: 1;
}

.workflow-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.workflow-toggle {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: #9ca3af;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.workflow-toggle.active {
  background: #ef4444;
  position: relative;
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

.folder-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 8px;
  margin-bottom: 12px;
  padding: 0 12px;
  gap: 16px;
  flex: 0 0 auto;
}

.folder-page-info {
  font-size: 13px;
  color: #6b7280;
  min-width: 40px;
  text-align: center;
}

.folder-nav-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #6b7280;
  transition: all 0.2s;
}

.folder-nav-btn:hover:not(:disabled) {
  background: #f3f4f6;
  color: #374151;
}

.folder-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.chat-history {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px 12px 0 12px;
  min-height: 100px;
  overflow: hidden;
}

.chat-history-content {
  flex: 1;
  overflow-y: auto;
  padding-top: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.chat-history-content::-webkit-scrollbar {
  width: 6px;
}

.chat-history-content::-webkit-scrollbar-track {
  background: transparent;
}

.chat-history-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.chat-history-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.chat-history-item {
  padding: 10px 12px;
  margin: 2px 0;
  border-radius: 8px;
  color: #374151;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.1s ease;
  font-weight: 400;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.item-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-menu-btn {
  opacity: 0;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  border-radius: 4px;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  margin-left: 8px;
  flex-shrink: 0;
}

.item-menu-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.chat-history-item:hover .item-menu-btn {
  opacity: 1;
}

.item-menu {
  position: relative;
}

.dropdown-menu {
  position: fixed;
  background: var(--dropdown-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--dropdown-shadow);
  z-index: 9999;
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
  color: #374151;
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
  background: #f3f4f6;
}

.dropdown-item.delete {
  color: #dc2626;
}

.dropdown-item.delete:hover {
  background: #fef2f2;
}

.dropdown-item:disabled {
  color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.5;
}

.dropdown-item:disabled:hover {
  background: transparent;
}

.chat-history-item:hover {
  background: #e5e7eb;
}

.chat-history-item.active {
  background: #e5e7eb;
  font-weight: 500;
}

/* 사용자 프로필 스타일 (HTML과 동일) */
.sidebar-footer {
  padding: 12px;
  border-top: 1px solid #e1e3e6;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}

.user-profile:hover {
  background: #e5e7eb;
}

.user-profile-dropdown {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  margin-bottom: 8px;
  z-index: 1000;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #67bdc6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.user-name {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}
</style>
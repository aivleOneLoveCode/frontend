<template>
  <div v-if="isOpen" class="board-overlay" @click="closeBoard">
    <div class="board-panel" @click.stop>
      <!-- 게시판 헤더 -->
      <div class="board-header">
        <h3>게시판</h3>
      </div>
      
      <!-- 게시판 컨텐츠 -->
      <div class="board-content">
        <!-- 검색 기능 (상단으로 이동) -->
        <div class="search-section">
          <div class="search-box">
            <input 
              v-model="searchKeyword" 
              type="text" 
              placeholder="키워드로 게시물 검색..." 
              class="search-input"
            />
          </div>
          <div class="search-info">
            <span v-if="searchKeyword" class="search-results">
              "{{ searchKeyword }}" 검색 결과: {{ totalPosts }}건
            </span>
          </div>
        </div>

        <!-- 게시물 목록 (아코디언 형식) -->
        <div class="posts-section">
          <!-- 로딩 상태 -->
          <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>게시물을 불러오는 중...</p>
          </div>
          
          <!-- 에러 상태 -->
          <div v-else-if="error" class="error-state">
            <p>{{ error }}</p>
            <button class="retry-btn" @click="() => loadPosts()">다시 시도</button>
          </div>
          
          <!-- 게시물 목록 -->
          <div v-else class="posts-list">
            <div 
              v-for="post in paginatedPosts" 
              :key="post.id" 
              class="post-card"
            >
              <div class="post-header">
                <div class="post-title-area">
                  <h4 class="post-title">{{ post.title }}</h4>
                  <span class="post-meta-inline">
                    <span class="post-author">{{ maskName(post.author) }}</span>
                    <span class="post-date">{{ formatDate(post.createdAt) }}</span>
                    <span class="post-views">다운로드: {{ post.downloadCount }}회</span>
                  </span>
                </div>
              </div>
              
              <!-- 게시글 내용 -->
              <div class="post-content-area">
                <div class="post-content">
                  {{ post.content }}
                </div>

                <div class="post-actions">
                  <button 
                    v-if="!canEditPost(post)"
                    class="add-workflow-btn" 
                    @click="addToChat(post)"
                    title="채팅에 추가"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="10" y1="10" x2="14" y2="10"/>
                    </svg>
                    채팅에 추가
                  </button>
                  <button 
                    v-if="canEditPost(post)"
                    class="edit-btn" 
                    @click="openEditForm(post)"
                    title="게시물 수정"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    수정
                  </button>
                  <button 
                    v-if="canEditPost(post)"
                    class="delete-btn" 
                    @click="deletePost(post)"
                    title="게시물 삭제"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 6h18"/>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                    삭제
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 페이징 및 글쓰기 -->
          <div class="pagination-section">
            <div class="pagination">
              <button 
                class="page-btn" 
                :disabled="currentPage === 1"
                @click="goToPage(currentPage - 1)"
              >
                이전
              </button>
              
              <div class="page-numbers">
                <button 
                  v-for="page in visiblePages" 
                  :key="page"
                  class="page-btn" 
                  :class="{ active: page === currentPage, separator: page === -1 }"
                  :disabled="page === -1"
                  @click="page !== -1 && goToPage(page)"
                >
                  {{ page === -1 ? '...' : page }}
                </button>
              </div>
              
              <button 
                class="page-btn" 
                :disabled="currentPage === totalPages"
                @click="goToPage(currentPage + 1)"
              >
                다음
              </button>
            </div>
            
            <button class="new-post-btn compact" @click="openWriteForm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              글쓰기
            </button>
          </div>


        </div>

        <!-- 글쓰기 폼 모달 -->
        <div v-if="showWriteForm" class="write-form-modal" @click="closeWriteForm">
          <div class="write-form-content" @click.stop>
            <div class="write-form-header">
              <h3>글쓰기</h3>
            </div>
            <div class="write-form-body">
              <div class="post-form">
                <div class="input-group">
                  <label class="input-label">워크플로우 <span class="required">*</span></label>
                  <select 
                    v-model="newPost.workflowId" 
                    class="workflow-select"
                    :disabled="isLoadingWorkflows"
                    @change="onWorkflowSelect"
                  >
                    <option value="" disabled>워크플로우를 선택하세요</option>
                    <option 
                      v-for="workflow in userWorkflows" 
                      :key="workflow.workflow_id"
                      :value="workflow.workflow_id"
                    >
                      {{ workflow.name || workflow.title }}
                    </option>
                  </select>
                </div>
                <div class="input-group">
                  <label class="input-label">제목 <span class="required">*</span></label>
                  <input 
                    v-model="newPost.title" 
                    type="text" 
                    placeholder="제목을 입력하세요" 
                    class="post-title-input"
                    maxlength="100"
                  />
                  <span class="char-count">{{ newPost.title.length }}/100</span>
                </div>
                <div class="input-group">
                  <label class="input-label">내용 <span class="required">*</span></label>
                  <textarea 
                    v-model="newPost.content" 
                    placeholder="내용을 입력하세요" 
                    class="post-content-input"
                    rows="8"
                    maxlength="2000"
                  ></textarea>
                  <span class="char-count">{{ newPost.content.length }}/2000</span>
                </div>
                
                <!-- 파일 업로드 섹션 제거 -->
                
                <div class="post-actions">
                  <button class="post-btn primary" @click="createPost">게시물 작성</button>
                  <button class="post-btn secondary" @click="closeWriteForm">취소</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 게시글 수정 폼 모달 -->
        <div v-if="showEditForm" class="write-form-modal" @click="closeEditForm">
          <div class="write-form-content" @click.stop>
            <div class="write-form-header">
              <h3>게시글 수정</h3>
            </div>
            <div class="write-form-body">
              <div class="post-form">
                <div class="input-group">
                  <label class="input-label">워크플로우 <span class="required">*</span></label>
                  <select 
                    v-model="editPost.workflow_id" 
                    class="workflow-select"
                    :disabled="isLoadingWorkflows"
                    @change="onEditWorkflowSelect"
                  >
                    <option value="" disabled>워크플로우를 선택하세요</option>
                    <option 
                      v-for="workflow in userWorkflows" 
                      :key="workflow.workflow_id"
                      :value="workflow.workflow_id"
                    >
                      {{ workflow.name || workflow.title }}
                    </option>
                  </select>
                </div>
                <div class="input-group">
                  <label class="input-label">제목 <span class="required">*</span></label>
                  <input 
                    v-model="editPost.title" 
                    type="text" 
                    placeholder="제목을 입력하세요" 
                    class="post-title-input"
                    maxlength="100"
                  />
                  <span class="char-count">{{ editPost.title.length }}/100</span>
                </div>
                <div class="input-group">
                  <label class="input-label">내용 <span class="required">*</span></label>
                  <textarea 
                    v-model="editPost.description" 
                    placeholder="내용을 입력하세요" 
                    class="post-content-input"
                    rows="8"
                    maxlength="2000"
                  ></textarea>
                  <span class="char-count">{{ editPost.description.length }}/2000</span>
                </div>
                
                <div class="post-actions">
                  <button class="post-btn primary" @click="updatePost">게시물 수정</button>
                  <button class="post-btn secondary" @click="closeEditForm">취소</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, onMounted, onUnmounted, computed, watch } from 'vue'
import { useWorkflowStore } from '@/stores/workflow'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { boardService, type BoardPost, type CreatePostData } from '@/services/board'
import api from '@/services/api'

// 백엔드 데이터를 프론트엔드 형식으로 변환하는 인터페이스
interface Post {
  id: string
  userId: string
  title: string
  content: string
  author: string
  createdAt: Date
  views: number
  workflowId: string
  workflowName: string
  downloadCount: number
  attachedFile?: File
}

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
}

// Props are used directly in template
defineProps<Props>()
const emit = defineEmits<Emits>()

// 스토어
const workflowStore = useWorkflowStore()
const authStore = useAuthStore()

// 상태
const showWriteForm = ref(false)
const showEditForm = ref(false)
const editingPost = ref<Post | null>(null)
const newPost = ref({
  title: '',
  content: '',
  workflowId: ''
})

const editPost = ref({
  title: '',
  description: '',
  workflow_id: ''
})

// 워크플로우 목록 (백엔드가 name 또는 title로 반환할 수 있음)
const userWorkflows = ref<Array<{ workflow_id: string; name?: string; title?: string }>>([])
const isLoadingWorkflows = ref(false)

// const selectedPost = ref<Post | null>(null) // 사용하지 않음
const searchKeyword = ref('')
const currentPage = ref(1)
const postsPerPage = 6

// 아코디언 기능 제거됨 (카드는 항상 열려있음)

// 게시물 데이터 및 로딩 상태
const posts = ref<Post[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

// 백엔드 데이터를 프론트엔드 형식으로 변환
const convertBoardPostToPost = (boardPost: BoardPost): Post => {
  console.log('🔍 변환 중인 게시물 상세:', {
    title: boardPost.title,
    post_id: boardPost.post_id,
    user_id: boardPost.user_id,
    user_id_type: typeof boardPost.user_id,
    author_name: boardPost.author_name,
    created_at: boardPost.created_at,
    전체_boardPost: boardPost
  })
  
  // 날짜 안전하게 파싱
  let createdDate: Date
  try {
    createdDate = new Date(boardPost.created_at)
    // Invalid Date 체크
    if (isNaN(createdDate.getTime())) {
      console.warn('⚠️ 유효하지 않은 날짜:', boardPost.created_at)
      createdDate = new Date() // 현재 시간으로 대체
    }
  } catch (error) {
    console.warn('⚠️ 날짜 파싱 실패:', boardPost.created_at, error)
    createdDate = new Date() // 현재 시간으로 대체
  }
  
  return {
    id: String(boardPost.post_id), // 문자열로 변환
    userId: boardPost.user_id || 'unknown', // undefined 방지
    title: boardPost.title,
    content: boardPost.description,
    author: boardPost.author_name,
    createdAt: createdDate,
    views: boardPost.download_count,
    workflowId: boardPost.workflow_id,
    workflowName: boardPost.workflow_name,
    downloadCount: boardPost.download_count
  }
}

// 현재 사용자가 게시물을 수정/삭제할 수 있는지 확인
const canEditPost = (post: Post): boolean => {
  const currentUserId = authStore.currentUser?.user_id
  const postUserId = post.userId
  
  console.log('권한 체크:', {
    postTitle: post.title,
    currentUserId,
    postUserId,
    postAuthor: post.author,
    hasCurrentUser: !!authStore.currentUser,
    hasPostUserId: !!postUserId
  })
  
  // 현재 사용자가 없으면 편집 불가
  if (!currentUserId) {
    console.log('권한 거부: 로그인하지 않음')
    return false
  }
  
  // 정상적인 경우: userId가 일치하면 편집 가능
  if (postUserId && String(currentUserId) === String(postUserId)) {
    console.log('권한 허용: userId 일치')
    return true
  }
  
  // 임시 해결책: userId가 없는 경우 (로컬 생성 게시물)
  if (!postUserId || postUserId === 'unknown') {
    console.log('권한 허용: userId가 없는 로컬 게시물')
    return true
  }
  
  console.log('권한 거부: 조건 불일치')
  return false
}

// 계산된 속성 (서버 페이지네이션 사용)
const totalPages = computed(() => Math.ceil(totalPosts.value / postsPerPage))

// 서버에서 이미 페이지네이션된 데이터를 받으므로 그대로 사용
const paginatedPosts = computed(() => {
  return posts.value
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages: number[] = []
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push(-1) // 구분자
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push(-1) // 구분자
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      pages.push(-1) // 구분자
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push(-1) // 구분자
      pages.push(total)
    }
  }
  
  return pages
})

// 전체 게시물 수를 저장할 변수 추가
const totalPosts = ref(0)
const allPosts = ref<Post[]>([]) // 검색용 전체 게시물
const isSearchDataLoaded = ref(false) // 검색 데이터 로드 여부

// 데이터 로딩 함수 (페이지네이션 적용)
const loadPosts = async (page: number = 1, forceReload: boolean = false) => {
  try {
    isLoading.value = true
    error.value = null
    
    // 검색 모드인 경우
    if (searchKeyword.value.trim()) {
      // 검색 데이터가 없거나 강제 리로드인 경우에만 서버 요청
      if (!isSearchDataLoaded.value || forceReload) {
        console.log('=== 검색용 데이터 서버에서 가져오기 ===')
        
        const response = await boardService.getPosts({
          limit: 50,
          offset: 0
        })
        
        allPosts.value = response.posts.map(convertBoardPostToPost)
        isSearchDataLoaded.value = true
      }
      
      // 클라이언트 사이드 검색 (이미 로드된 데이터에서)
      console.log('=== 클라이언트 사이드 검색 ===')
      const keyword = searchKeyword.value.toLowerCase()
      const filtered = allPosts.value.filter(post => 
        post.title.toLowerCase().includes(keyword) ||
        post.content.toLowerCase().includes(keyword) ||
        post.author.toLowerCase().includes(keyword)
      )
      
      // 검색 결과를 페이지네이션
      totalPosts.value = filtered.length
      const start = (page - 1) * postsPerPage
      const end = start + postsPerPage
      posts.value = filtered.slice(start, end)
      
      console.log('검색 결과:', filtered.length, '건, 현재 페이지:', page)
    } else {
      // 일반 모드: 서버 페이지네이션
      isSearchDataLoaded.value = false // 검색 모드 해제
      allPosts.value = [] // 검색 데이터 초기화
      
      const offset = (page - 1) * postsPerPage
      
      console.log('=== 일반 모드 데이터 로딩 ===')
      console.log('페이지:', page, 'Offset:', offset, 'Limit:', postsPerPage)
      
      const response = await boardService.getPosts({
        limit: postsPerPage,
        offset: offset
      })
      
      posts.value = response.posts.map(convertBoardPostToPost)
      totalPosts.value = response.total || posts.value.length
    }
    
    console.log('로드된 게시물 수:', posts.value.length, '전체:', totalPosts.value)
    console.log('=== 데이터 로딩 완료 ===')
  } catch (err) {
    console.error('게시물 로딩 실패:', err)
    error.value = '게시물을 불러오는데 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}

// 메서드
const closeBoard = () => {
  // 게시판 닫을 때 검색 초기화
  clearSearch()
  emit('close')
}

const closeWriteForm = () => {
  showWriteForm.value = false
  clearForm()
}

// 글쓰기 폼 열기 시 워크플로우 목록 로드
const openWriteForm = () => {
  showWriteForm.value = true
  // 워크플로우 목록이 없으면 로드
  if (userWorkflows.value.length === 0) {
    loadWorkflows()
  }
}

const openEditForm = (post: Post) => {
  editingPost.value = post
  editPost.value = {
    title: post.title,
    description: post.content,
    workflow_id: post.workflowId || ''
  }
  showEditForm.value = true
  // 워크플로우 목록이 없으면 로드
  if (userWorkflows.value.length === 0) {
    loadWorkflows()
  }
}

const closeEditForm = () => {
  showEditForm.value = false
  editingPost.value = null
  clearEditForm()
}

const clearEditForm = () => {
  editPost.value = {
    title: '',
    description: '',
    workflow_id: ''
  }
}

const handleSearch = () => {
  currentPage.value = 1 // 검색 시 첫 페이지로 이동
  loadPosts(1) // 검색어에 따라 게시물 다시 로드
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadPosts(page) // 해당 페이지 데이터 로드
  }
}

const createPost = async () => {
  if (!newPost.value.workflowId) {
    alert('워크플로우를 선택해주세요.')
    return
  }
  
  if (!newPost.value.title.trim()) {
    alert('제목을 입력해주세요.')
    return
  }
  
  if (!newPost.value.content.trim()) {
    alert('내용을 입력해주세요.')
    return
  }

  if (newPost.value.title.length > 100) {
    alert('제목은 100자 이내로 입력해주세요.')
    return
  }

  if (newPost.value.content.length > 2000) {
    alert('내용은 2000자 이내로 입력해주세요.')
    return
  }

  // 현재 로그인한 사용자 정보 확인
  const currentUserId = authStore.currentUser?.user_id
  if (!currentUserId) {
    alert('로그인이 필요합니다.')
    return
  }

  try {
    // 선택된 워크플로우 정보 찾기
    console.log('선택된 워크플로우 ID:', newPost.value.workflowId)
    console.log('전체 워크플로우 목록:', userWorkflows.value)
    const selectedWorkflow = userWorkflows.value.find(w => w.workflow_id === newPost.value.workflowId)
    console.log('찾은 워크플로우:', selectedWorkflow)
    const workflowName = selectedWorkflow ? (selectedWorkflow.name || selectedWorkflow.title || '') : ''
    
    // 백엔드 API로 게시물 생성
    const postData: CreatePostData = {
      title: newPost.value.title.trim(),
      description: newPost.value.content.trim(),
      workflow_id: newPost.value.workflowId,
      workflow_name: workflowName
    }
    
    console.log('게시물 생성 요청 데이터 상세:', JSON.stringify(postData, null, 2))
    const response = await boardService.createPost(postData)
    console.log('게시물 생성 응답:', response)
    
    // 검색 초기화 후 첫 페이지로 이동
    clearSearch()
    currentPage.value = 1
    await loadPosts(1, true)
    
    clearForm()
    closeWriteForm()
    
    alert('게시글이 성공적으로 작성되었습니다!')
  } catch (error) {
    console.error('게시글 작성 실패:', error)
    alert('게시글 작성에 실패했습니다.')
  }
}

const updatePost = async () => {
  if (!editingPost.value) return
  
  if (!editPost.value.workflow_id) {
    alert('워크플로우를 선택해주세요.')
    return
  }
  
  if (!editPost.value.title.trim()) {
    alert('제목을 입력해주세요.')
    return
  }
  
  if (!editPost.value.description.trim()) {
    alert('내용을 입력해주세요.')
    return
  }

  if (editPost.value.title.length > 100) {
    alert('제목은 100자 이내로 입력해주세요.')
    return
  }

  if (editPost.value.description.length > 2000) {
    alert('내용은 2000자 이내로 입력해주세요.')
    return
  }

  try {
    // 선택된 워크플로우 정보 찾기
    const selectedWorkflow = userWorkflows.value.find(w => w.workflow_id === editPost.value.workflow_id)
    const workflowName = selectedWorkflow ? (selectedWorkflow.name || selectedWorkflow.title || '') : ''
    
    console.log('게시글 수정 요청:', { id: editingPost.value.id, data: editPost.value })
    const response = await boardService.updatePost(editingPost.value.id, {
      title: editPost.value.title,
      description: editPost.value.description,
      workflow_id: editPost.value.workflow_id,
      workflow_name: workflowName
    })
    console.log('게시글 수정 응답:', response)
    
    // 검색 초기화 후 현재 페이지 새로고침
    clearSearch()
    await loadPosts(currentPage.value, true)
    
    closeEditForm()
    alert('게시글이 성공적으로 수정되었습니다!')
  } catch (error) {
    console.error('게시글 수정 실패:', error)
    alert('게시글 수정에 실패했습니다.')
  }
}

const clearForm = () => {
  newPost.value.title = ''
  newPost.value.content = ''
  newPost.value.workflowId = ''
}

// 검색 초기화 함수
const clearSearch = () => {
  searchKeyword.value = ''
  isSearchDataLoaded.value = false
  allPosts.value = []
}

// 워크플로우 선택 시 제목 자동 채우기 (글쓰기)
const onWorkflowSelect = () => {
  if (newPost.value.workflowId) {
    const selectedWorkflow = userWorkflows.value.find(w => w.workflow_id === newPost.value.workflowId)
    if (selectedWorkflow) {
      // 워크플로우 변경 시 항상 제목을 워크플로우 이름으로 변경
      newPost.value.title = selectedWorkflow.name || selectedWorkflow.title || ''
    }
  }
}

// 워크플로우 선택 시 제목 자동 채우기 (수정)
const onEditWorkflowSelect = () => {
  if (editPost.value.workflow_id) {
    const selectedWorkflow = userWorkflows.value.find(w => w.workflow_id === editPost.value.workflow_id)
    if (selectedWorkflow) {
      // 워크플로우 변경 시 항상 제목을 워크플로우 이름으로 변경
      editPost.value.title = selectedWorkflow.name || selectedWorkflow.title || ''
    }
  }
}

const addToChat = async (post: Post) => {
  try {
    // 워크플로우 ID가 있는지 확인
    if (!post.workflowId) {
      alert('이 게시물에는 워크플로우 정보가 없습니다.')
      return
    }

    // 백엔드에서 워크플로우 JSON 데이터 가져오기 (다운로드 수 자동 증가)
    const workflowJson = await boardService.downloadWorkflow(post.id)
    
    // 채팅 스토어를 가져와서 파일로 추가
    const chatStore = useChatStore()
    
    // 워크플로우 JSON을 UploadedFile 형식으로 추가
    const workflowText = JSON.stringify(workflowJson, null, 2)
    const workflowFile = {
      name: `${post.workflowName || post.title}.json`,
      type: 'text/plain',
      size: workflowText.length,
      content: workflowText,
      contentBlock: {
        type: 'text',
        text: workflowText
      },
      source: 'board'  // 게시판에서 추가됨을 표시
    }
    
    chatStore.addUploadedFile(workflowFile)
    
    // 로컬 상태 업데이트
    post.downloadCount++
    
    // 게시판 닫기 (alert 없이 바로)
    closeBoard()
    
  } catch (error) {
    console.error('채팅에 추가 실패:', error)
    alert('채팅에 추가하는데 실패했습니다. 다시 시도해주세요.')
  }
}

const deletePost = async (post: Post) => {
  console.log('삭제 시도:', { postId: post.id, postTitle: post.title })
  
  if (confirm(`"${post.title}" 게시물을 정말로 삭제하시겠습니까?`)) {
    try {
      console.log('API 삭제 요청 시작:', post.id)
      const response = await boardService.deletePost(post.id)
      console.log('API 삭제 응답:', response)
      
      alert('게시물이 삭제되었습니다.')
      
      // 검색 초기화
      clearSearch()
      
      // 현재 페이지가 비어있을 수 있으므로 다시 로드
      // 마지막 게시물을 삭제했다면 이전 페이지로
      if (posts.value.length === 1 && currentPage.value > 1) {
        currentPage.value--
        await loadPosts(currentPage.value, true)
      } else {
        await loadPosts(currentPage.value, true)
      }
    } catch (error: any) {
      console.error('게시물 삭제 실패:', error)
      console.error('삭제 오류 상세:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      })
      alert('게시물 삭제에 실패했습니다.')
    }
  }
}

// 아코디언 토글 기능 제거됨 (카드는 항상 열려있음)

// 이름 마스킹 함수
const maskName = (name: string): string => {
  if (!name || name.length <= 1) {
    return name
  }
  
  // 한글자는 그대로, 나머지는 *로 마스킹
  return name.charAt(0) + '*'.repeat(name.length - 1)
}

const formatDate = (date: Date) => {
  try {
    // Date 객체가 유효한지 확인
    if (!date || isNaN(date.getTime())) {
      console.warn('⚠️ formatDate: 유효하지 않은 날짜:', date)
      return '날짜 없음'
    }
    
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (minutes < 1) {
      return '방금 전'
    } else if (minutes < 60) {
      return `${minutes}분 전`
    } else if (hours < 24) {
      return `${hours}시간 전`
    } else if (days === 1) {
      return '어제'
    } else if (days < 7) {
      return `${days}일 전`
    } else if (days < 30) {
      const weeks = Math.floor(days / 7)
      return `${weeks}주 전`
    } else {
      // 30일 이상 지난 경우 절대 날짜 표시
      return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date)
    }
  } catch (error) {
    console.error('formatDate 오류:', error, date)
    return '날짜 형식 오류'
  }
}

// ESC 키로 게시판 닫기
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    if (showEditForm.value) {
      closeEditForm()
    } else if (showWriteForm.value) {
      closeWriteForm()
    } else {
      closeBoard()
    }
  }
}

// 검색어 변경 시 자동 검색
watch(searchKeyword, () => {
  currentPage.value = 1
  loadPosts(1)
})

// 워크플로우 목록 가져오기
const loadWorkflows = async () => {
  isLoadingWorkflows.value = true
  try {
    const response = await api.get('/workflows')
    console.log('워크플로우 API 응답:', response.data)
    userWorkflows.value = response.data.workflows || []
    console.log('워크플로우 목록 상세:', userWorkflows.value)
    if (userWorkflows.value.length > 0) {
      console.log('첫 번째 워크플로우 구조:', userWorkflows.value[0])
    }
  } catch (error) {
    console.error('워크플로우 목록 로드 실패:', error)
  } finally {
    isLoadingWorkflows.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  loadPosts(1) // 컴포넌트 마운트 시 첫 페이지 로드
  loadWorkflows() // 워크플로우 목록 로드
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.board-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  z-index: 1000;
  padding: 70px 24px 20px 20px;
}

.board-panel {
  background: white;
  border-radius: 12px;
  width: 600px;
  max-width: calc(100vw - 48px);
  max-height: calc(100vh - 90px);
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideInFromTopRight 0.3s ease-out;
  margin: 0;
  pointer-events: auto;
}

.board-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.board-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.board-content {
  max-height: calc(90vh - 100px);
  overflow-y: auto;
  padding: 24px;
}

.pagination-section {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  margin-bottom: 24px;
  position: relative;
}

.pagination {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
}

.new-post-btn.compact {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 36px;
  line-height: 1;
  grid-column: 2;
}

.new-post-btn.compact:hover {
  background: linear-gradient(135deg, #0e7490 0%, #0c6a7f 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.posts-section {
  margin-bottom: 24px;
}

/* 카드 스타일 */
.post-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  transition: box-shadow 0.2s;
  height: fit-content;
}

.post-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.post-card .post-header {
  padding: 16px 20px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.post-title-area {
  flex: 1;
}

.post-title {
  margin: 0 0 8px 0;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.post-meta-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
}

.post-meta-inline span {
  white-space: nowrap;
}

.post-content-area {
  padding: 20px;
  background: white;
}

.post-content {
  line-height: 1.6;
  color: #374151;
  font-size: 14px;
  margin-bottom: 16px;
  white-space: pre-wrap;
}

/* 로딩 상태 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  color: #6b7280;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #0891b2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 에러 상태 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  color: #ef4444;
}

.retry-btn {
  margin-top: 16px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: linear-gradient(135deg, #0e7490 0%, #0891b2 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 워크플로우 정보 스타일 제거됨 (더 이상 표시하지 않음) */

.post-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  justify-content: center;
}

/* slideDown 애니메이션 제거됨 (카드는 항상 열려있음) */

.posts-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .posts-list {
    grid-template-columns: 1fr;
  }
}

.add-workflow-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  font-weight: 500;
}

.add-workflow-btn:hover {
  background: linear-gradient(135deg, #0e7490 0%, #0c6a7f 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.edit-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  font-weight: 500;
}

.edit-btn:hover {
  background: #e5e7eb;
  border-color: #d1d5db;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.delete-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: white;
  color: #ef4444;
  border: 1px solid #fecaca;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  font-weight: 500;
}

.delete-btn:hover {
  background: #fef2f2;
  border-color: #fca5a5;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.1);
}



.page-btn {
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  background: white;
  color: #6b7280;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 40px;
  height: 36px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

.page-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #374151;
}

.page-btn.active {
  background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
  color: white;
  border-color: transparent;
  font-weight: 600;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: #f9fafb;
}

.page-btn.separator {
  background: transparent;
  border: none;
  cursor: default;
  min-width: 20px;
  padding: 8px 4px;
}

.page-btn.separator:hover {
  background: transparent;
  border: none;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-numbers .page-btn {
  min-width: 36px;
}

.page-numbers .page-btn:first-child,
.page-numbers .page-btn:last-child {
  min-width: 40px;
}

.search-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.search-box {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  background: #f9fafb;
}

.search-input:focus {
  outline: none;
  border-color: #0891b2;
  background: white;
  box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1);
}


.search-info {
  font-size: 14px;
  color: #6b7280;
}

.search-results {
  color: #0891b2;
  font-weight: 600;
}

/* 글쓰기 폼 모달 */
.write-form-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.write-form-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.write-form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.write-form-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.write-form-body {
  padding: 24px;
}

.post-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  position: relative;
}

.input-label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.input-label .required {
  color: #ef4444;
  margin-left: 2px;
}

.workflow-select,
.post-title-input,
.post-content-input {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.workflow-select {
  background: white;
  cursor: pointer;
}

.workflow-select:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.6;
}

.workflow-select:focus,
.post-title-input:focus,
.post-content-input:focus {
  outline: none;
  border-color: #0891b2;
  box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1);
}

.char-count {
  position: absolute;
  bottom: 8px;
  right: 12px;
  font-size: 12px;
  color: #9ca3af;
  background: white;
  padding: 2px 6px;
  border-radius: 4px;
}

/* 파일 업로드 섹션 */
.file-upload-section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background: #f9fafb;
}

.file-upload-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.file-upload-area {
  position: relative;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 16px 12px;
  text-align: center;
  transition: border-color 0.2s;
  background: white;
}

.file-upload-area:hover {
  border-color: #0891b2;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.file-upload-content {
  pointer-events: none;
}

.file-upload-content svg {
  color: #9ca3af;
  margin-bottom: 12px;
}

.file-upload-content p {
  margin: 0 0 12px 0;
  color: #6b7280;
  font-size: 13px;
}

.file-select-btn {
  pointer-events: auto;
  padding: 8px 16px;
  background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.file-select-btn:hover {
  background: linear-gradient(135deg, #0e7490 0%, #0891b2 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.attached-file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding: 12px 16px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #374151;
  font-size: 14px;
}

.file-info svg {
  color: #6b7280;
}

.file-name {
  font-weight: 500;
}

.file-size {
  color: #6b7280;
}

.remove-file-btn {
  background: transparent;
  border: none;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  color: #ef4444;
  transition: background 0.2s;
}

.remove-file-btn:hover {
  background: #fef2f2;
}


.post-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.post-btn.primary {
  background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
  color: white;
  border: none;
}

.post-btn.primary:hover {
  background: linear-gradient(135deg, #0e7490 0%, #0c6a7f 100%);
}

.post-btn.secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.post-btn.secondary:hover {
  background: #e5e7eb;
  border-color: #d1d5db;
}

/* 파일 업로드 섹션 */
.file-upload-section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background: #f9fafb;
}

.file-upload-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.file-upload-area {
  position: relative;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 16px 12px;
  text-align: center;
  transition: border-color 0.2s;
  background: white;
}

.file-upload-area:hover {
  border-color: #0891b2;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.file-upload-content {
  pointer-events: none;
}

.file-upload-content svg {
  color: #9ca3af;
  margin-bottom: 16px;
}

.file-upload-content p {
  margin: 0 0 16px 0;
  color: #6b7280;
  font-size: 14px;
}

.file-select-btn {
  pointer-events: auto;
  padding: 8px 16px;
  background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.file-select-btn:hover {
  background: linear-gradient(135deg, #0e7490 0%, #0891b2 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.attached-file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding: 12px 16px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #374151;
  font-size: 14px;
}

.file-info svg {
  color: #6b7280;
}

.file-name {
  font-weight: 500;
}

.file-size {
  color: #6b7280;
}

.remove-file-btn {
  background: transparent;
  border: none;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  color: #ef4444;
  transition: background 0.2s;
}

.remove-file-btn:hover {
  background: #fef2f2;
}





@keyframes slideInFromTopRight {
  from { 
    opacity: 0;
    transform: translateX(20px) translateY(-10px) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translateX(0) translateY(0) scale(1);
  }
}

/* 스크롤바 스타일링 */
.board-content::-webkit-scrollbar {
  width: 6px;
}

.board-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.board-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.board-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .board-overlay {
    padding: 60px 16px 16px 16px;
  }
  
  .board-panel {
    width: 100%;
    max-width: none;
    max-height: calc(100vh - 76px);
  }
}
</style>

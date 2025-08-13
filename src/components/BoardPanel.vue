<template>
  <div v-if="isOpen" class="board-overlay" @click="closeBoard">
    <div class="board-panel" @click.stop>
      <!-- 게시판 헤더 -->
      <div class="board-header">
        <h2 class="board-title">게시판</h2>
        <button class="close-btn" @click="closeBoard" title="닫기">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- 게시판 컨텐츠 -->
      <div class="board-content">
        <!-- 게시물 목록 -->
        <div class="posts-section">
          <div class="posts-list">
            <div 
              v-for="post in paginatedPosts" 
              :key="post.id" 
              class="post-item"
              @click="selectPost(post)"
            >
              <div class="post-header">
                <h4 class="post-title">{{ post.title }}</h4>
                <span class="post-date">{{ formatDate(post.createdAt) }}</span>
              </div>
              <div class="post-meta">
                <span class="post-author">{{ post.author }}</span>
                <span class="post-views">조회수: {{ post.views }}</span>
                <div class="post-actions">
                  <button 
                    class="download-btn" 
                    @click.stop="downloadPost(post)"
                    title="JSON 다운로드"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7,10 12,15 17,10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </button>
                  <button 
                    class="delete-btn" 
                    @click.stop="deletePost(post)"
                    title="게시물 삭제"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 6h18"/>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      <line x1="10" y1="11" x2="10" y2="17"/>
                      <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
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
            
            <button class="new-post-btn compact" @click="showWriteForm = true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              글쓰기
            </button>
          </div>

          <!-- 검색 기능 -->
          <div class="search-section">
            <div class="search-box">
              <input 
                v-model="searchKeyword" 
                type="text" 
                placeholder="키워드로 게시물 검색..." 
                class="search-input"
                @input="handleSearch"
              />
              <button class="search-btn" @click="handleSearch">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </button>
            </div>
            <div class="search-info">
              <span v-if="searchKeyword" class="search-results">
                "{{ searchKeyword }}" 검색 결과: {{ filteredPosts.length }}건
              </span>
            </div>
          </div>
        </div>

        <!-- 글쓰기 폼 모달 -->
        <div v-if="showWriteForm" class="write-form-modal" @click="closeWriteForm">
          <div class="write-form-content" @click.stop>
            <div class="write-form-header">
              <h3>글쓰기</h3>
              <button class="close-btn" @click="closeWriteForm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div class="write-form-body">
              <div class="post-form">
                <div class="input-group">
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
                  <textarea 
                    v-model="newPost.content" 
                    placeholder="내용을 입력하세요" 
                    class="post-content-input"
                    rows="8"
                    maxlength="2000"
                  ></textarea>
                  <span class="char-count">{{ newPost.content.length }}/2000</span>
                </div>
                
                <!-- 파일 업로드 섹션 -->
                <div class="file-upload-section">
                  <h4>JSON 파일 첨부</h4>
                  <div class="file-upload-area">
                    <input 
                      ref="fileInput"
                      type="file" 
                      accept=".json"
                      @change="handleFileUpload"
                      class="file-input"
                    />
                    <div class="file-upload-content">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7,10 12,15 17,10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      <p>JSON 파일을 선택하거나 여기에 드래그하세요</p>
                      <button type="button" class="file-select-btn" @click="$refs.fileInput.click()">
                        파일 선택
                      </button>
                    </div>
                  </div>
                  
                  <!-- 업로드된 파일 표시 -->
                  <div v-if="newPost.attachedFile" class="attached-file">
                    <div class="file-info">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10,9 9,9 8,9"/>
                      </svg>
                      <span class="file-name">{{ newPost.attachedFile.name }}</span>
                      <span class="file-size">({{ formatFileSize(newPost.attachedFile.size) }})</span>
                    </div>
                    <button 
                      type="button" 
                      class="remove-file-btn"
                      @click="removeAttachedFile"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div class="post-actions">
                  <button class="post-btn primary" @click="createPost">게시물 작성</button>
                  <button class="post-btn secondary" @click="closeWriteForm">취소</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 게시글 상세보기 모달 -->
      <div v-if="selectedPost" class="post-detail-modal" @click="closePostDetail">
        <div class="post-detail-content" @click.stop>
          <div class="post-detail-header">
            <h2>{{ selectedPost.title }}</h2>
            <div class="post-detail-actions">
              <button 
                class="download-btn large" 
                @click="downloadPost(selectedPost)"
                title="JSON 다운로드"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                다운로드
              </button>
              <button class="close-btn" @click="closePostDetail">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
          <div class="post-detail-body">
            <div class="post-info">
              <span class="post-author">작성자: {{ selectedPost.author }}</span>
              <span class="post-date">{{ formatDate(selectedPost.createdAt) }}</span>
              <span class="post-views">조회수: {{ selectedPost.views }}</span>
            </div>
            <div class="post-content">
              {{ selectedPost.content }}
            </div>
            
            <!-- 첨부된 파일 표시 -->
            <div v-if="selectedPost.attachedFile" class="attached-file-display">
              <h4>첨부된 파일</h4>
              <div class="file-info">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
                <span class="file-name">{{ selectedPost.attachedFile.name }}</span>
                <span class="file-size">({{ formatFileSize(selectedPost.attachedFile.size) }})</span>
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

interface Post {
  id: number
  title: string
  content: string
  author: string
  createdAt: Date
  views: number
  attachedFile?: File
}

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 상태
const showWriteForm = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const newPost = ref({
  title: '',
  content: '',
  attachedFile: null as File | null
})

const selectedPost = ref<Post | null>(null)
const searchKeyword = ref('')
const currentPage = ref(1)
const postsPerPage = 10

// 샘플 게시글 데이터 (더 많은 데이터 추가)
const posts = ref<Post[]>([
  {
    id: 1,
    title: 'Vue.js 3 프로젝트 시작하기',
    content: 'Vue.js 3를 사용하여 새로운 프로젝트를 시작하는 방법에 대해 알아보겠습니다. Composition API와 TypeScript를 활용한 모던한 개발 방법을 소개합니다.',
    author: '개발자1',
    createdAt: new Date('2024-01-15'),
    views: 45,
    attachedFile: new File(['{"framework": "Vue.js 3", "version": "3.4.0"}'], 'vue-project.json', { type: 'application/json' })
  },
  {
    id: 2,
    title: 'ChatGPT API 활용 팁',
    content: 'ChatGPT API를 활용하여 다양한 애플리케이션을 개발하는 방법과 유용한 팁들을 공유합니다. 프롬프트 엔지니어링과 응답 처리에 대한 내용을 다룹니다.',
    author: 'AI연구원',
    createdAt: new Date('2024-01-14'),
    views: 32,
    attachedFile: new File(['{"api": "ChatGPT", "endpoint": "/v1/chat/completions"}'], 'chatgpt-config.json', { type: 'application/json' })
  },
  {
    id: 3,
    title: 'n8n 워크플로우 자동화',
    content: 'n8n을 사용하여 반복적인 작업을 자동화하는 워크플로우를 만드는 방법을 설명합니다. 다양한 노드와 트리거를 활용한 실용적인 예제를 제공합니다.',
    author: '자동화전문가',
    createdAt: new Date('2024-01-13'),
    views: 28,
    attachedFile: new File(['{"workflow": "n8n", "nodes": ["HTTP Request", "IF", "Set"]}'], 'n8n-workflow.json', { type: 'application/json' })
  },
  {
    id: 4,
    title: 'TypeScript 고급 기능 활용',
    content: 'TypeScript의 고급 기능들을 활용하여 더 안전하고 유지보수하기 쉬운 코드를 작성하는 방법을 알아봅니다.',
    author: 'TS전문가',
    createdAt: new Date('2024-01-12'),
    views: 56
  },
  {
    id: 5,
    title: 'Vite 빌드 최적화 가이드',
    content: 'Vite를 사용한 프로젝트의 빌드 성능을 최적화하는 다양한 방법과 팁을 공유합니다.',
    author: '빌드전문가',
    createdAt: new Date('2024-01-11'),
    views: 41
  },
  {
    id: 6,
    title: 'Pinia 상태 관리 패턴',
    content: 'Pinia를 사용한 Vue.js 애플리케이션의 상태 관리 패턴과 모범 사례를 소개합니다.',
    author: '상태관리전문가',
    createdAt: new Date('2024-01-10'),
    views: 38
  },
  {
    id: 7,
    title: 'Vue Router 고급 라우팅',
    content: 'Vue Router의 고급 기능을 활용한 복잡한 라우팅 구조와 네비게이션 가드를 구현하는 방법을 설명합니다.',
    author: '라우팅전문가',
    createdAt: new Date('2024-01-09'),
    views: 33
  },
  {
    id: 8,
    title: 'CSS Grid와 Flexbox 활용',
    content: 'CSS Grid와 Flexbox를 활용한 반응형 레이아웃 구현 방법과 실용적인 예제를 제공합니다.',
    author: 'CSS전문가',
    createdAt: new Date('2024-01-08'),
    views: 47
  },
  {
    id: 9,
    title: 'JavaScript 비동기 프로그래밍',
    content: 'JavaScript의 비동기 프로그래밍 패턴과 Promise, async/await를 활용한 효율적인 코드 작성법을 다룹니다.',
    author: 'JS전문가',
    createdAt: new Date('2024-01-07'),
    views: 52
  },
  {
    id: 10,
    title: 'Git 워크플로우 전략',
    content: '팀 개발을 위한 Git 워크플로우 전략과 브랜치 관리 방법을 소개합니다.',
    author: 'Git전문가',
    createdAt: new Date('2024-01-06'),
    views: 39
  },
  {
    id: 11,
    title: 'Docker 컨테이너 배포',
    content: 'Docker를 사용한 애플리케이션 컨테이너화와 배포 자동화 방법을 설명합니다.',
    author: 'DevOps전문가',
    createdAt: new Date('2024-01-05'),
    views: 44
  },
  {
    id: 12,
    title: 'API 설계 원칙',
    content: 'RESTful API 설계의 기본 원칙과 모범 사례를 소개합니다.',
    author: 'API전문가',
    createdAt: new Date('2024-01-04'),
    views: 36
  },
  {
    id: 13,
    title: '데이터베이스 최적화 기법',
    content: '데이터베이스 성능 최적화를 위한 인덱싱과 쿼리 튜닝 기법을 다룹니다.',
    author: 'DB전문가',
    createdAt: new Date('2024-01-03'),
    views: 49
  },
  {
    id: 14,
    title: '보안 코딩 가이드',
    content: '웹 애플리케이션 개발 시 주의해야 할 보안 취약점과 방어 기법을 설명합니다.',
    author: '보안전문가',
    createdAt: new Date('2024-01-02'),
    views: 42
  },
  {
    id: 15,
    title: '성능 모니터링 도구',
    content: '웹 애플리케이션의 성능을 모니터링하고 분석하는 다양한 도구와 방법을 소개합니다.',
    author: '성능전문가',
    createdAt: new Date('2024-01-01'),
    views: 35
  }
])

// 계산된 속성
const filteredPosts = computed(() => {
  if (!searchKeyword.value.trim()) {
    return posts.value
  }
  
  const keyword = searchKeyword.value.toLowerCase()
  return posts.value.filter(post => 
    post.title.toLowerCase().includes(keyword) ||
    post.content.toLowerCase().includes(keyword) ||
    post.author.toLowerCase().includes(keyword)
  )
})

const totalPages = computed(() => Math.ceil(filteredPosts.value.length / postsPerPage))

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * postsPerPage
  const end = start + postsPerPage
  return filteredPosts.value.slice(start, end)
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

// 메서드
const closeBoard = () => {
  emit('close')
}

const closeWriteForm = () => {
  showWriteForm.value = false
  clearForm()
}

const handleSearch = () => {
  currentPage.value = 1 // 검색 시 첫 페이지로 이동
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const createPost = () => {
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

  const post: Post = {
    id: Date.now(),
    title: newPost.value.title.trim(),
    content: newPost.value.content.trim(),
    author: '현재사용자',
    createdAt: new Date(),
    views: 0,
    attachedFile: newPost.value.attachedFile || undefined
  }

  posts.value.unshift(post)
  clearForm()
  closeWriteForm()
  
  // 성공 메시지 표시
  alert('게시글이 성공적으로 작성되었습니다!')
}

const clearForm = () => {
  newPost.value.title = ''
  newPost.value.content = ''
  newPost.value.attachedFile = null
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      newPost.value.attachedFile = file
    } else {
      alert('JSON 파일만 업로드 가능합니다.')
      target.value = ''
    }
  }
}

const removeAttachedFile = () => {
  newPost.value.attachedFile = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const downloadPost = (post: Post) => {
  const postData = {
    id: post.id,
    title: post.title,
    content: post.content,
    author: post.author,
    createdAt: post.createdAt.toISOString(),
    views: post.views,
    attachedFile: post.attachedFile ? {
      name: post.attachedFile.name,
      size: post.attachedFile.size,
      type: post.attachedFile.type
    } : null
  }
  
  const dataStr = JSON.stringify(postData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `${post.title.replace(/[^a-zA-Z0-9가-힣]/g, '_')}.json`
  link.click()
  
  URL.revokeObjectURL(link.href)
}

const deletePost = (post: Post) => {
  if (confirm(`"${post.title}" 게시물을 정말로 삭제하시겠습니까?`)) {
    const index = posts.value.findIndex(p => p.id === post.id)
    if (index > -1) {
      posts.value.splice(index, 1)
      alert('게시물이 삭제되었습니다.')
      
      // 현재 페이지가 비어있으면 이전 페이지로 이동
      if (paginatedPosts.value.length === 0 && currentPage.value > 1) {
        currentPage.value--
      }
    }
  }
}

const selectPost = (post: Post) => {
  selectedPost.value = post
  // 조회수 증가
  post.views++
}

const closePostDetail = () => {
  selectedPost.value = null
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// ESC 키로 게시판 닫기
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    if (showWriteForm.value) {
      closeWriteForm()
    } else if (selectedPost.value) {
      closePostDetail()
    } else {
      closeBoard()
    }
  }
}

// 검색어 변경 시 페이지 초기화
watch(searchKeyword, () => {
  currentPage.value = 1
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.board-panel {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideUp 0.3s ease-out;
  margin: 0 auto;
}

.board-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.board-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  background: transparent;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.board-content {
  max-height: calc(90vh - 100px);
  overflow-y: auto;
  padding: 24px;
}

.pagination-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
}

.new-post-btn.compact {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #10a37f;
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
}

.new-post-btn.compact:hover {
  background: #0d8a6b;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.posts-section {
  margin-bottom: 24px;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.post-item {
  padding: 16px 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.post-item:hover {
  border-color: #10a37f;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.post-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  flex: 1;
  margin-right: 16px;
}

.post-date {
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
}

.post-meta {
  display: flex;
  gap: 16px;
  align-items: center;
  font-size: 12px;
  color: #6b7280;
}

.post-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.download-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
  font-size: 12px;
}

.download-btn:hover {
  background: #f3f4f6;
  border-color: #10a37f;
  color: #10a37f;
}

.download-btn.large {
  padding: 8px 16px;
  font-size: 14px;
  background: #10a37f;
  color: white;
  border-color: #10a37f;
}

.download-btn.large:hover {
  background: #0d8a6b;
  border-color: #0d8a6b;
}

.delete-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  background: transparent;
  border: 1px solid #ef4444;
  border-radius: 4px;
  cursor: pointer;
  color: #ef4444;
  transition: all 0.2s;
  font-size: 12px;
}

.delete-btn:hover {
  background: #fef2f2;
  border-color: #dc2626;
  color: #dc2626;
}



.page-btn {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 40px;
  height: 36px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.page-btn.active {
  background: #10a37f;
  color: white;
  border-color: #10a37f;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  margin-top: 24px;
  padding: 20px;
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
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #10a37f;
  box-shadow: 0 0 0 3px rgba(16, 163, 127, 0.1);
}

.search-btn {
  padding: 12px 16px;
  background: #10a37f;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.search-btn:hover {
  background: #0d8a6b;
}

.search-info {
  font-size: 14px;
  color: #6b7280;
}

.search-results {
  color: #10a37f;
  font-weight: 500;
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

.post-title-input:focus,
.post-content-input:focus {
  outline: none;
  border-color: #10a37f;
  box-shadow: 0 0 0 3px rgba(16, 163, 127, 0.1);
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
  border-color: #10a37f;
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
  background: #10a37f;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.file-select-btn:hover {
  background: #0d8a6b;
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

.post-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
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
  background: #10a37f;
  color: white;
}

.post-btn.primary:hover {
  background: #0d8a6b;
}

.post-btn.secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.post-btn.secondary:hover {
  background: #e5e7eb;
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
  border-color: #10a37f;
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
  background: #10a37f;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.file-select-btn:hover {
  background: #0d8a6b;
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

.post-detail-modal {
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

.post-detail-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.post-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.post-detail-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.post-detail-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.post-detail-body {
  padding: 24px;
}

.post-info {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  color: #6b7280;
}

.post-content {
  line-height: 1.6;
  color: #374151;
  font-size: 16px;
  margin-bottom: 24px;
}

.attached-file-display {
  border-top: 1px solid #e5e7eb;
  padding-top: 20px;
}

.attached-file-display h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
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
</style>

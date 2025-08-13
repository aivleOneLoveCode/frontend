# Vue 프로젝트 전환 및 백엔드 연동 가이드

## 왜 Vue 프로젝트가 필요한가?

### 현재 HTML 파일의 한계:
- ❌ **CORS 문제**: 브라우저에서 직접 API 호출 시 CORS 에러
- ❌ **환경 변수**: API 엔드포인트, 키 등 관리 어려움
- ❌ **빌드 최적화**: 번들링, 코드 스플리팅 없음
- ❌ **개발 서버**: Hot reload, 프록시 설정 불가
- ❌ **패키지 관리**: axios, 상태관리 라이브러리 사용 어려움

### Vue 프로젝트의 장점:
- ✅ **개발 서버**: Vite dev server로 CORS 해결
- ✅ **프록시 설정**: 백엔드 API로 요청 프록시
- ✅ **환경 변수**: .env 파일로 설정 관리
- ✅ **패키지 관리**: npm/yarn으로 라이브러리 설치
- ✅ **빌드 최적화**: 프로덕션 빌드 최적화

## 전환 방법

### 1단계: Vue 프로젝트 생성
```bash
# Vue 프로젝트 생성
npm create vue@latest chatgpt-clone

# 프로젝트 디렉토리로 이동
cd chatgpt-clone

# 의존성 설치
npm install

# 추가 패키지 설치 (백엔드 연동용)
npm install axios
npm install @vueuse/core  # Vue 유틸리티 함수들
```

### 2단계: 현재 코드 마이그레이션

#### A. 기본 프로젝트 구조
```
chatgpt-clone/
├── src/
│   ├── components/          # 컴포넌트들
│   │   ├── ChatArea.vue
│   │   ├── Sidebar.vue
│   │   ├── WorkflowPanel.vue
│   │   └── LoginForm.vue
│   ├── views/              # 페이지들
│   │   ├── Home.vue
│   │   └── Login.vue
│   ├── router/             # 라우터 설정
│   │   └── index.js
│   ├── stores/             # 상태 관리 (Pinia)
│   │   ├── auth.js
│   │   ├── chat.js
│   │   └── workflow.js
│   ├── services/           # API 서비스
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── chat.js
│   │   └── workflow.js
│   ├── utils/              # 유틸리티 함수
│   │   └── helpers.js
│   └── App.vue
├── public/
├── .env                    # 환경 변수
├── .env.development        # 개발 환경 변수
├── .env.production         # 프로덕션 환경 변수
├── vite.config.js          # Vite 설정
└── package.json
```

#### B. 환경 변수 설정 (.env.development)
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_BASE_URL=ws://localhost:8000/ws
VITE_OAUTH_GOOGLE_CLIENT_ID=your-google-client-id
VITE_OAUTH_GITHUB_CLIENT_ID=your-github-client-id
```

#### C. API 서비스 (src/services/api.js)
```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 요청 인터셉터 (토큰 자동 추가)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 응답 인터셉터 (에러 처리)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

#### D. 인증 서비스 (src/services/auth.js)
```javascript
import api from './api.js'

export const authService = {
  // 로그인
  async login(credentials) {
    const response = await api.post('/auth/login', credentials)
    const { token, user } = response.data
    localStorage.setItem('auth_token', token)
    return { token, user }
  },

  // 회원가입
  async register(userData) {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  // 비밀번호 재설정
  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  // 소셜 로그인
  async socialLogin(provider, code) {
    const response = await api.post(`/auth/social/${provider}`, { code })
    const { token, user } = response.data
    localStorage.setItem('auth_token', token)
    return { token, user }
  },

  // 로그아웃
  logout() {
    localStorage.removeItem('auth_token')
  },

  // 현재 사용자 정보
  async getCurrentUser() {
    const response = await api.get('/auth/me')
    return response.data
  }
}
```

#### E. 채팅 서비스 (src/services/chat.js)
```javascript
import api from './api.js'

export const chatService = {
  // 채팅 기록 가져오기
  async getChatHistory() {
    const response = await api.get('/chats')
    return response.data
  },

  // 새 채팅 생성
  async createChat(title) {
    const response = await api.post('/chats', { title })
    return response.data
  },

  // 메시지 전송
  async sendMessage(chatId, content, files = []) {
    const formData = new FormData()
    formData.append('content', content)
    formData.append('chatId', chatId)
    
    files.forEach(file => {
      formData.append('files', file)
    })

    const response = await api.post('/messages', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // 스트리밍 메시지 (SSE 또는 WebSocket)
  streamMessage(chatId, content) {
    const eventSource = new EventSource(
      `${import.meta.env.VITE_API_BASE_URL}/messages/stream?chatId=${chatId}&content=${encodeURIComponent(content)}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      }
    )
    return eventSource
  }
}
```

### 3단계: Vite 설정 (vite.config.js)
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
```

### 4단계: 상태 관리 (Pinia)
```bash
npm install pinia
```

```javascript
// src/stores/auth.js
import { defineStore } from 'pinia'
import { authService } from '@/services/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('auth_token'),
    isAuthenticated: false
  }),

  actions: {
    async login(credentials) {
      const { token, user } = await authService.login(credentials)
      this.token = token
      this.user = user
      this.isAuthenticated = true
    },

    async logout() {
      authService.logout()
      this.token = null
      this.user = null
      this.isAuthenticated = false
    },

    async getCurrentUser() {
      if (this.token) {
        try {
          this.user = await authService.getCurrentUser()
          this.isAuthenticated = true
        } catch (error) {
          this.logout()
        }
      }
    }
  }
})
```

## 백엔드 API 예상 엔드포인트

### 인증 API
- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/forgot-password` - 비밀번호 재설정
- `GET /api/auth/me` - 현재 사용자 정보
- `POST /api/auth/social/google` - Google 소셜 로그인

### 채팅 API
- `GET /api/chats` - 채팅 목록
- `POST /api/chats` - 새 채팅 생성
- `GET /api/chats/:id` - 특정 채팅 조회
- `DELETE /api/chats/:id` - 채팅 삭제
- `POST /api/messages` - 메시지 전송
- `GET /api/messages/stream` - 스트리밍 메시지 (SSE)

### 워크플로우 API
- `GET /api/workflows` - 워크플로우 목록
- `POST /api/workflows` - 워크플로우 생성
- `PUT /api/workflows/:id` - 워크플로우 수정
- `DELETE /api/workflows/:id` - 워크플로우 삭제

## 마이그레이션 단계별 실행

### 즉시 실행 가능한 방법:
1. **현재 HTML 유지 + API 호출만 추가**
2. **점진적 Vue 컴포넌트 전환**
3. **완전한 Vue 프로젝트 재구성**

어떤 방법을 선택하시겠습니까?
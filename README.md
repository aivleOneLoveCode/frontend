# ChatGPT Clone - Vue.js 프로젝트

## 개요
Vue.js 3 기반의 ChatGPT 클론 애플리케이션입니다. n8n 워크플로우 통합과 실시간 채팅 기능을 제공합니다.

## 기술 스택
- **프레임워크**: Vue.js 3 (Composition API)
- **빌드 도구**: Vite
- **상태 관리**: Pinia
- **라우팅**: Vue Router
- **HTTP 클라이언트**: Axios
- **유틸리티**: @vueuse/core

## 프로젝트 구조
```
src/
├── components/          # 재사용 가능한 컴포넌트
├── views/              # 페이지 컴포넌트
├── stores/             # Pinia 스토어
├── services/           # API 서비스 레이어
├── router/             # Vue Router 설정
├── utils/              # 유틸리티 함수
├── App.vue            # 루트 컴포넌트
└── main.js            # 앱 진입점
```

## 시작하기

### 1. 리포지토리 클론 (서브모듈 포함)
```bash
# 서브모듈과 함께 클론
git clone --recursive https://github.com/your-repo/axagent.git

# 이미 클론한 경우 서브모듈 초기화
git submodule update --init --recursive
```

### 2. n8n 서브모듈 설정
이 프로젝트는 n8n 워크플로우 아이콘과 노드 정보를 위해 n8n을 서브모듈로 사용합니다.

```bash
# 서브모듈 상태 확인
git submodule status

# 서브모듈 업데이트
git submodule update --remote
```

**⚠️ 중요**: `lib/n8n` 폴더는 서브모듈이므로 `.gitignore`에 추가하지 마세요.

### 3. 의존성 설치
```bash
npm install
```

### 4. 환경 변수 설정
`.env.development` 파일의 환경 변수를 설정하세요:
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_BASE_URL=ws://localhost:8000/ws
VITE_OAUTH_GOOGLE_CLIENT_ID=your-google-client-id
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 프로덕션 빌드
```bash
npm run build
```

## n8n 워크플로우 캔바스

### 개요
이 프로젝트는 n8n 워크플로우를 시각적으로 표시하기 위해 Vue Flow를 사용한 커스텀 캔바스를 구현합니다. n8n의 실제 아이콘과 노드 구조를 그대로 재현하여 사용자가 워크플로우를 직관적으로 이해할 수 있도록 합니다.

### 주요 특징
- **실제 n8n 아이콘**: 서브모듈을 통해 n8n의 실제 SVG 아이콘 사용
- **자동 레이아웃**: 워크플로우 로드 시 자동으로 전체 뷰에 맞춤
- **반응형 패널**: 화면 크기에 따른 동적 패널 크기 조정
- **읽기 전용**: 안전한 워크플로우 미리보기 (수정 불가)

### 지원하는 아이콘 방식
1. **SVG 파일**: `file:icon.svg` 형식의 노드들
   - 예: OpenAI, Slack, Gmail, Aggregate 등
2. **FontAwesome 아이콘**: `fa:icon-name` 형식의 노드들
   - 이모지 폴백으로 표시 (Interval ⏰, ExecuteWorkflow 🔄)

### 아이콘 매핑 예시
```typescript
// 실제 n8n 구조를 반영한 아이콘 경로 매핑
const nodePathMapping = {
  'openAi': 'OpenAi/openAi.svg',
  'gmail': 'Google/Gmail/gmail.svg',
  'aggregate': 'Transform/Aggregate/aggregate.svg',
  'slack': 'Slack/slack.svg'
}
```

### 서브모듈 의존성
- **경로**: `lib/n8n/packages/nodes-base/nodes/`
- **용도**: 노드 아이콘 파일 접근
- **버전**: n8n 최신 버전과 동기화

## 주요 기능
- ✅ 사용자 인증 (로그인/회원가입/소셜 로그인)
- ✅ 실시간 채팅 인터페이스
- ✅ 채팅 기록 관리
- ✅ n8n 워크플로우 통합
- ✅ 파일 업로드 및 첨부
- ✅ 워크플로우 JSON 파일 관리
- ✅ 반응형 디자인

## API 엔드포인트

### 인증 API
- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/forgot-password` - 비밀번호 재설정
- `GET /api/auth/me` - 현재 사용자 정보
- `POST /api/auth/logout` - 로그아웃
- `POST /api/auth/social/{provider}` - 소셜 로그인

### 채팅 API
- `GET /api/chats` - 채팅 목록
- `POST /api/chats` - 새 채팅 생성
- `GET /api/chats/{id}` - 특정 채팅 조회
- `PATCH /api/chats/{id}` - 채팅 제목 수정
- `DELETE /api/chats/{id}` - 채팅 삭제
- `POST /api/messages` - 메시지 전송
- `GET /api/messages/stream` - 스트리밍 메시지 (SSE)

### 워크플로우 API
- `GET /api/workflows` - 워크플로우 목록
- `POST /api/workflows` - 워크플로우 생성
- `GET /api/workflows/{id}` - 워크플로우 조회
- `PATCH /api/workflows/{id}` - 워크플로우 수정
- `DELETE /api/workflows/{id}` - 워크플로우 삭제
- `POST /api/workflows/{id}/execute` - 워크플로우 실행
- `POST /api/workflows/upload` - JSON 파일 업로드

## 백엔드 연동 가이드

### 1. CORS 설정
백엔드에서 다음 CORS 설정이 필요합니다:
```python
# FastAPI 예시
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 개발 서버
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. JWT 토큰 인증
- `Authorization: Bearer <token>` 헤더 사용
- 토큰 만료 시 자동 갱신 로직 포함
- 리프레시 토큰 지원

### 3. 스트리밍 응답 (SSE)
```python
# FastAPI SSE 예시
from fastapi.responses import StreamingResponse

@app.get("/api/messages/stream")
async def stream_message(chat_id: str, content: str):
    async def generate():
        # AI 응답 생성 로직
        for chunk in ai_response_generator(content):
            yield f"data: {json.dumps({'type': 'content', 'content': chunk})}\\n\\n"
        
        yield f"data: {json.dumps({'type': 'done'})}\\n\\n"
    
    return StreamingResponse(generate(), media_type="text/plain")
```

### 4. 파일 업로드
```python
# 파일 업로드 엔드포인트
@app.post("/api/messages")
async def send_message(
    content: str = Form(...),
    chat_id: str = Form(...),
    files: List[UploadFile] = File(default=[])
):
    # 파일 처리 로직
    pass
```

### 5. 데이터베이스 모델 예시
```python
# SQLAlchemy 모델 예시
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Chat(Base):
    __tablename__ = "chats"
    
    id = Column(Integer, primary_key=True)
    title = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True)
    chat_id = Column(Integer, ForeignKey("chats.id"))
    content = Column(Text)
    message_type = Column(String)  # 'user' or 'assistant'
    files = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
```

## 환경별 설정

### 개발 환경
```bash
npm run dev
```
- Hot reload 지원
- API 프록시 설정 활성화
- 개발자 도구 사용 가능

### 프로덕션 환경
```bash
npm run build
npm run preview
```
- 코드 최적화 및 번들링
- 소스맵 비활성화
- 환경 변수는 `.env.production` 사용

## 배포 가이드

### 1. 정적 파일 배포 (Nginx)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /path/to/dist;
    index index.html;
    
    # Vue Router history mode 지원
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API 프록시
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 2. Docker 배포
```dockerfile
# 빌드 스테이지
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# 프로덕션 스테이지
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 개발 가이드

### 1. 컴포넌트 생성
- `src/components/` 디렉토리에 생성
- PascalCase 네이밍 사용
- 단일 파일 컴포넌트 (.vue) 형식

### 2. API 서비스 추가
- `src/services/` 디렉토리에 생성
- 서비스별로 파일 분리
- `api.js`의 axios 인스턴스 사용

### 3. 상태 관리
- Pinia 스토어는 `src/stores/` 디렉토리에 생성
- 기능별로 스토어 분리 (auth, chat, workflow)
- Composition API 스타일 사용

### 4. 스타일링
- 전역 스타일은 `App.vue`에 정의
- 컴포넌트별 스타일은 `<style scoped>` 사용
- CSS 변수를 활용한 테마 지원

## 서브모듈 관리

### 서브모듈 상태 확인
```bash
# 현재 서브모듈 상태 확인
git submodule status

# 서브모듈 정보 자세히 보기
git submodule foreach git status
```

### 서브모듈 업데이트
```bash
# 모든 서브모듈을 최신으로 업데이트
git submodule update --remote

# 특정 서브모듈만 업데이트
git submodule update --remote lib/n8n

# 서브모듈 변경사항 커밋
git add lib/n8n
git commit -m "update n8n submodule"
```

### 트러블슈팅

#### 1. 서브모듈이 비어있을 때
```bash
# 서브모듈 다시 초기화
git submodule deinit lib/n8n
git submodule update --init lib/n8n
```

#### 2. 아이콘이 로드되지 않을 때
- Vite 개발 서버가 `lib/n8n` 경로를 정적 파일로 서빙하는지 확인
- 브라우저 개발자 도구에서 404 에러 확인
- 서브모듈이 올바르게 초기화되었는지 확인

#### 3. 서브모듈 충돌 시
```bash
# 서브모듈 강제 업데이트
git submodule update --force --remote

# 모든 서브모듈 재설정
git submodule deinit --all
git submodule update --init --recursive
```

#### 4. Git 서브모듈 URL 변경
```bash
# .gitmodules 파일 수정 후
git submodule sync
git submodule update --init --recursive
```

### 주의사항
- 서브모듈은 독립적인 Git 리포지토리입니다
- `.gitignore`에 `lib/n8n`을 추가하면 안 됩니다
- 서브모듈 내부에서 직접 변경사항을 만들지 마세요
- 프로덕션 배포 시 서브모듈도 함께 배포되는지 확인하세요

## 라이센스
MIT License
import asyncio
import json
import httpx
import os
import sqlite3
import uuid
import bcrypt
import jwt
import base64
import mimetypes
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Depends, status, Response, Header
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Claude MCP Multi-User Backend")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT 설정
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-this")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

security = HTTPBearer()

# Pydantic 모델들
class UserRegister(BaseModel):
    email: str
    first_name: str
    last_name: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class ChatRequest(BaseModel):
    content: List[dict]  # content blocks array (text, image, document 등)
    session_id: Optional[str] = None

class WorkflowCreate(BaseModel):
    n8n_workflow_id: str

class WorkflowUpdate(BaseModel):
    status: Optional[str] = None

class ApiKeyWorkflowCreate(BaseModel):
    n8n_workflow_id: str
    name: str = "Untitled Workflow"
    user_id: str

class WorkflowNameUpdate(BaseModel):
    name: str

class ProjectCreate(BaseModel):
    name: str

class ProjectUpdate(BaseModel):
    name: str

class WorkflowProjectUpdate(BaseModel):
    project_id: Optional[str] = None

class DatabaseManager:
    def __init__(self, db_path: str = "claude_multi_user.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """데이터베이스 초기화 및 테이블 생성"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Users 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                user_id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                password TEXT NOT NULL,
                api_key TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Sessions 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sessions (
                session_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (user_id)
            )
        ''')
        
        # Messages 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                message_id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES sessions (session_id)
            )
        ''')
        
        # Projects 테이블
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS projects (
                project_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                name TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (user_id)
            )
        ''')
        
        # Workflows 테이블 (n8n_workflow_id를 기본키로 사용)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS workflows (
                n8n_workflow_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                project_id TEXT,
                name TEXT NOT NULL DEFAULT 'Untitled Workflow',
                status TEXT DEFAULT 'inactive' CHECK(status IN ('active', 'inactive')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (user_id),
                FOREIGN KEY (project_id) REFERENCES projects (project_id)
            )
        ''')
        
        # 기존 테이블에 name 컬럼이 없으면 추가 (마이그레이션)
        try:
            cursor.execute('ALTER TABLE workflows ADD COLUMN name TEXT NOT NULL DEFAULT "Untitled Workflow"')
            print("[INFO] workflows 테이블에 name 컬럼을 추가했습니다.")
        except sqlite3.OperationalError:
            # 이미 컬럼이 존재하거나 다른 에러인 경우
            pass
        
        conn.commit()
        conn.close()
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Multi-user database initialized: {self.db_path}")
    
    def create_user(self, email: str, first_name: str, last_name: str, password: str):
        """새 사용자 생성"""
        user_id = str(uuid.uuid4())
        api_key = str(uuid.uuid4())  # API 키 생성
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO users (user_id, email, first_name, last_name, password, api_key)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (user_id, email, first_name, last_name, hashed_password, api_key))
            
            conn.commit()
            conn.close()
            return user_id
        except sqlite3.IntegrityError:
            conn.close()
            raise HTTPException(status_code=400, detail="이미 존재하는 이메일입니다")
    
    def authenticate_user(self, email: str, password: str):
        """사용자 인증"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT user_id, password, first_name, last_name 
            FROM users WHERE email = ?
        ''', (email,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result and bcrypt.checkpw(password.encode('utf-8'), result[1].encode('utf-8')):
            return {
                "user_id": result[0],
                "email": email,
                "first_name": result[2],
                "last_name": result[3]
            }
        return None
    
    def get_user_by_id(self, user_id: str):
        """사용자 ID로 사용자 정보 조회"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT user_id, email, first_name, last_name, api_key 
            FROM users WHERE user_id = ?
        ''', (user_id,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return {
                "user_id": result[0],
                "email": result[1],
                "first_name": result[2],
                "last_name": result[3],
                "api_key": result[4]
            }
        return None
    
    def create_session(self, user_id: str, title: str = "새 채팅", session_id: str = None):
        """새 세션 생성"""
        if not session_id:
            session_id = str(uuid.uuid4())
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO sessions (session_id, user_id, title, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ''', (session_id, user_id, title))
        
        conn.commit()
        conn.close()
        
        return session_id
    
    def update_session_title(self, session_id: str, title: str, user_id: str):
        """세션 제목 업데이트"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE sessions 
            SET title = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE session_id = ? AND user_id = ?
        ''', (title, session_id, user_id))
        
        conn.commit()
        conn.close()
    
    def delete_session(self, session_id: str, user_id: str):
        """세션 삭제"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 메시지 먼저 삭제
        cursor.execute('''
            DELETE FROM messages 
            WHERE session_id = ?
        ''', (session_id,))
        
        # 세션 삭제
        cursor.execute('''
            DELETE FROM sessions 
            WHERE session_id = ? AND user_id = ?
        ''', (session_id, user_id))
        
        conn.commit()
        conn.close()
    
    def save_message(self, session_id: str, role: str, content: str):
        """메시지를 데이터베이스에 저장"""
        message_id = str(uuid.uuid4())
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO messages (message_id, session_id, role, content)
            VALUES (?, ?, ?, ?)
        ''', (message_id, session_id, role, content))
        
        # 세션 업데이트 시간 갱신
        cursor.execute('''
            UPDATE sessions 
            SET updated_at = CURRENT_TIMESTAMP 
            WHERE session_id = ?
        ''', (session_id,))
        
        conn.commit()
        conn.close()
        
        return message_id
    
    def get_user_sessions(self, user_id: str):
        """사용자의 모든 세션 목록 조회"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT session_id, title, created_at, updated_at
            FROM sessions 
            WHERE user_id = ?
            ORDER BY updated_at DESC
        ''', (user_id,))
        
        rows = cursor.fetchall()
        conn.close()
        
        sessions = []
        for row in rows:
            sessions.append({
                "session_id": row[0],
                "title": row[1],
                "created_at": row[2],
                "updated_at": row[3]
            })
        
        return sessions
    
    def get_session_messages(self, session_id: str, user_id: str):
        """세션의 메시지 기록을 조회 (사용자 권한 확인)"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 세션이 해당 사용자 것인지 확인
        cursor.execute('''
            SELECT session_id FROM sessions 
            WHERE session_id = ? AND user_id = ?
        ''', (session_id, user_id))
        
        if not cursor.fetchone():
            conn.close()
            raise HTTPException(status_code=403, detail="세션에 접근할 권한이 없습니다")
        
        cursor.execute('''
            SELECT role, content FROM messages 
            WHERE session_id = ? 
            ORDER BY created_at ASC
        ''', (session_id,))
        
        rows = cursor.fetchall()
        conn.close()
        
        messages = []
        for role, content_json in rows:
            try:
                if content_json.startswith('[') or content_json.startswith('{'):
                    content = json.loads(content_json)
                    messages.append({"role": role, "content": content})
                else:
                    messages.append({"role": role, "content": [{"type": "text", "text": content_json}]})
            except json.JSONDecodeError:
                messages.append({"role": role, "content": [{"type": "text", "text": content_json}]})
        
        return messages
    
    async def generate_session_title(self, user_message: str, anthropic_client):
        """하이쿠 모델로 사용자 메시지 기반 세션 제목 생성"""
        try:
            response = anthropic_client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=30,
                system="사용자의 질문을 기반으로 간단하고 명확한 채팅방 제목을 한국어로 생성해주세요. 적절한 길이로 만들어주세요.",
                messages=[{"role": "user", "content": f"다음 질문에 적합한 채팅방 제목을 생성해주세요: {user_message}"}]
            )
            
            title = response.content[0].text.strip()
            title = title.replace('"', '').replace("'", '').strip()
            return title[:50]
        except Exception as e:
            print(f"제목 생성 실패: {e}")
            return user_message[:20] + "..." if len(user_message) > 20 else user_message
    
    def create_workflow(self, user_id: str, n8n_workflow_id: str, name: str = "Untitled Workflow"):
        """새 워크플로우 생성"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO workflows (n8n_workflow_id, user_id, name)
            VALUES (?, ?, ?)
        ''', (n8n_workflow_id, user_id, name))
        
        conn.commit()
        conn.close()
        
        return n8n_workflow_id
    
    def get_user_workflows(self, user_id: str):
        """사용자의 모든 워크플로우 목록 조회 (workflow_id, 제목, project_id 반환)"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT n8n_workflow_id, name, project_id, status
            FROM workflows 
            WHERE user_id = ?
            ORDER BY updated_at DESC
        ''', (user_id,))
        
        rows = cursor.fetchall()
        conn.close()
        
        workflows = []
        for row in rows:
            workflows.append({
                "workflow_id": row[0],
                "title": row[1],
                "project_id": row[2],  # None일 수 있음
                "status": row[3] or "inactive"  # 기본값 inactive
            })
        
        return workflows
    
    def update_workflow_status(self, n8n_workflow_id: str, status: str, user_id: str):
        """워크플로우 상태 업데이트"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE workflows 
            SET status = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE n8n_workflow_id = ? AND user_id = ?
        ''', (status, n8n_workflow_id, user_id))
        
        rows_affected = cursor.rowcount
        conn.commit()
        conn.close()
        
        return rows_affected > 0
    
    def update_workflow_name(self, n8n_workflow_id: str, name: str, user_id: str):
        """워크플로우 이름 업데이트"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE workflows 
            SET name = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE n8n_workflow_id = ? AND user_id = ?
        ''', (name, n8n_workflow_id, user_id))
        
        affected_rows = cursor.rowcount
        conn.commit()
        conn.close()
        
        return affected_rows > 0
    
    def delete_workflow(self, n8n_workflow_id: str, user_id: str):
        """워크플로우 삭제"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            DELETE FROM workflows 
            WHERE n8n_workflow_id = ? AND user_id = ?
        ''', (n8n_workflow_id, user_id))
        
        conn.commit()
        conn.close()
    
    def get_workflow_by_id(self, n8n_workflow_id: str, user_id: str):
        """워크플로우 ID로 워크플로우 정보 조회"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT n8n_workflow_id, name, status, created_at, updated_at
            FROM workflows 
            WHERE n8n_workflow_id = ? AND user_id = ?
        ''', (n8n_workflow_id, user_id))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return {
                "n8n_workflow_id": result[0],
                "name": result[1],
                "status": result[2],
                "created_at": result[3],
                "updated_at": result[4]
            }
        return None
    
    # 프로젝트 관리 메서드들
    def create_project(self, user_id: str, name: str):
        """새 프로젝트 생성"""
        project_id = str(uuid.uuid4())
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO projects (project_id, user_id, name)
            VALUES (?, ?, ?)
        ''', (project_id, user_id, name))
        
        conn.commit()
        conn.close()
        
        return project_id
    
    def get_user_projects(self, user_id: str):
        """사용자의 모든 프로젝트 목록 조회"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT project_id, name, created_at, updated_at
            FROM projects 
            WHERE user_id = ?
            ORDER BY updated_at DESC
        ''', (user_id,))
        
        rows = cursor.fetchall()
        conn.close()
        
        projects = []
        for row in rows:
            projects.append({
                "project_id": row[0],
                "name": row[1],
                "created_at": row[2],
                "updated_at": row[3]
            })
        
        return projects
    
    def update_project_name(self, project_id: str, name: str, user_id: str):
        """프로젝트 이름 업데이트"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE projects 
            SET name = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE project_id = ? AND user_id = ?
        ''', (name, project_id, user_id))
        
        affected_rows = cursor.rowcount
        conn.commit()
        conn.close()
        
        return affected_rows > 0
    
    def delete_project(self, project_id: str, user_id: str):
        """프로젝트 삭제 (해당 프로젝트의 워크플로우들은 project_id를 NULL로 설정)"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 프로젝트 소속 워크플로우들의 project_id를 NULL로 설정
        cursor.execute('''
            UPDATE workflows 
            SET project_id = NULL, updated_at = CURRENT_TIMESTAMP 
            WHERE project_id = ? AND user_id = ?
        ''', (project_id, user_id))
        
        # 프로젝트 삭제
        cursor.execute('''
            DELETE FROM projects 
            WHERE project_id = ? AND user_id = ?
        ''', (project_id, user_id))
        
        conn.commit()
        conn.close()
    
    def assign_workflow_to_project(self, n8n_workflow_id: str, project_id: str, user_id: str):
        """워크플로우를 프로젝트에 할당"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE workflows 
            SET project_id = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE n8n_workflow_id = ? AND user_id = ?
        ''', (project_id, n8n_workflow_id, user_id))
        
        affected_rows = cursor.rowcount
        conn.commit()
        conn.close()
        
        return affected_rows > 0
    
    def get_workflows_by_project(self, user_id: str, project_id: str = None):
        """프로젝트별 워크플로우 조회 (project_id가 None이면 프로젝트에 속하지 않은 워크플로우)"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if project_id is None:
            cursor.execute('''
                SELECT n8n_workflow_id, name
                FROM workflows 
                WHERE user_id = ? AND project_id IS NULL
                ORDER BY updated_at DESC
            ''', (user_id,))
        else:
            cursor.execute('''
                SELECT n8n_workflow_id, name
                FROM workflows 
                WHERE user_id = ? AND project_id = ?
                ORDER BY updated_at DESC
            ''', (user_id, project_id))
        
        rows = cursor.fetchall()
        conn.close()
        
        workflows = []
        for row in rows:
            workflows.append({
                "workflow_id": row[0],
                "title": row[1]
            })
        
        return workflows
    
    def get_user_workspace_items(self, user_id: str):
        """사용자의 프로젝트와 워크플로우를 type별로 구분해서 반환"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        items = []
        
        # 프로젝트 목록 조회
        cursor.execute('''
            SELECT project_id, name, created_at, updated_at
            FROM projects 
            WHERE user_id = ?
            ORDER BY updated_at DESC
        ''', (user_id,))
        
        project_rows = cursor.fetchall()
        
        # 워크플로우 목록 조회 (project_id와 함께)
        cursor.execute('''
            SELECT n8n_workflow_id, name, project_id, created_at, updated_at
            FROM workflows 
            WHERE user_id = ?
            ORDER BY updated_at DESC
        ''', (user_id,))
        
        workflow_rows = cursor.fetchall()
        conn.close()
        
        # 프로젝트들을 items에 추가
        for row in project_rows:
            items.append({
                "type": "project",
                "id": row[0],
                "name": row[1],
                "created_at": row[2],
                "updated_at": row[3]
            })
        
        # 워크플로우들을 items에 추가
        for row in workflow_rows:
            items.append({
                "type": "workflow", 
                "id": row[0],
                "name": row[1],
                "project_id": row[2],
                "created_at": row[3],
                "updated_at": row[4]
            })
        
        return items

# 파일 처리 헬퍼 함수들
def process_file_to_content_block(file_content: bytes, filename: str, content_type: str = None) -> dict:
    """파일을 Claude 호환 content block으로 변환 (이미지와 PDF만 지원)"""
    mime_type, _ = mimetypes.guess_type(filename)
    if not mime_type and content_type:
        mime_type = content_type
    mime_type = mime_type or "application/octet-stream"
    
    file_size = len(file_content)
    
    # 이미지 파일 처리
    if mime_type in ['image/jpeg', 'image/png', 'image/gif', 'image/webp']:
        if file_size > 5 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="이미지 파일은 5MB 이하만 업로드 가능합니다.")
        
        base64_content = base64.b64encode(file_content).decode('utf-8')
        return {
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": mime_type,
                "data": base64_content
            }
        }
    
    # PDF 파일 처리
    elif mime_type == 'application/pdf':
        if file_size > 32 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="PDF 파일은 32MB 이하만 업로드 가능합니다.")
        
        base64_content = base64.b64encode(file_content).decode('utf-8')
        return {
            "type": "document",
            "source": {
                "type": "base64",
                "media_type": "application/pdf",
                "data": base64_content
            }
        }
    
    # 지원하지 않는 파일 형식
    else:
        raise HTTPException(status_code=415, detail=f"지원하지 않는 파일 형식입니다. 이미지(JPEG, PNG, GIF, WebP) 또는 PDF 파일만 업로드 가능합니다.")

# JWT 관련 함수들
def create_access_token(user_data: dict):
    """JWT 토큰 생성"""
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode = user_data.copy()
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """JWT 토큰 검증"""
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

# verify_internal_api_key 함수 제거됨 - 사용되지 않음

def verify_user_api_key(x_api_key: str = Header(None, alias="X-API-Key")):
    """사용자 API 키 검증"""
    if not x_api_key:
        raise HTTPException(status_code=401, detail="API key required")
    
    # 데이터베이스에서 API 키로 사용자 조회
    conn = sqlite3.connect("claude_multi_user.db")
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT user_id, email, first_name, last_name 
        FROM users 
        WHERE api_key = ?
    ''', (x_api_key,))
    
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    return {
        "user_id": user[0],
        "email": user[1],
        "first_name": user[2],
        "last_name": user[3]
    }


class ClaudeMCPBackend:
    def __init__(self):
        self.anthropic = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        self.mcp_url = "http://localhost:3000/mcp"
        self.auth_token = "4PsvmU2knXt+KTV+d2sOFTly6C9C+9QAwdbqnd9uFVw="
        self.tools = []
        self.request_count = 0
        self.db = DatabaseManager()
        self.n8n_api_key = os.getenv("N8N_API_KEY")
        self.active_sessions = {}  # session_id -> asyncio.Event for cancellation
        
    async def init_mcp(self):
        if self.tools:
            return
            
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        async with httpx.AsyncClient() as client:
            await client.post(self.mcp_url, json={
                "jsonrpc": "2.0", "id": 1, "method": "initialize",
                "params": {"protocolVersion": "2024-11-05", "capabilities": {},
                          "clientInfo": {"name": "claude-mcp-backend", "version": "1.0"}}
            }, headers=headers)
            
            response = await client.post(self.mcp_url, json={
                "jsonrpc": "2.0", "id": 2, "method": "tools/list"
            }, headers=headers)
            
            self.tools = response.json()["result"]["tools"]
            print(f"[{datetime.now().strftime('%H:%M:%S')}] MCP 도구 {len(self.tools)}개 로드 완료")
    
    def convert_tools(self):
        # 사용할 툴 목록 (9개로 제한)
        allowed_tools = {
            "search_nodes",
            "list_nodes", 
            "get_node_info",
            "validate_workflow",
            "n8n_create_workflow",
            "n8n_update_full_workflow",
            "n8n_delete_workflow",
            "n8n_list_workflows",
            "n8n_get_workflow"
        }
        
        # 허용된 툴만 필터링해서 반환
        filtered_tools = []
        for tool in self.tools:
            # if tool["name"] in allowed_tools:
            filtered_tools.append({
                "name": tool["name"],
                "description": tool.get("description", ""),
                "input_schema": tool.get("inputSchema", {"type": "object", "properties": {}})
            })
        
        return filtered_tools
    
    async def call_tool(self, name, args, n8n_api_key=None, user_id=None):
        # n8n API 툴의 경우 api_key를 자동으로 추가
        # if name starts with n8n_
        if name.startswith("n8n_"):
            if n8n_api_key:
                args["api_key"] = n8n_api_key
                args["user_id"] = user_id
                print(f"[DEBUG] {name} 툴에 API 키 자동 추가됨")
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        async with httpx.AsyncClient() as client:
            response = await client.post(self.mcp_url, json={
                "jsonrpc": "2.0", "id": 3, "method": "tools/call",
                "params": {"name": name, "arguments": args}
            }, headers=headers)
            
            result = response.json().get("result", {})
            return json.dumps(result.get("content", result), ensure_ascii=False, indent=2)
    
    def add_cache_control_to_messages(self, messages):
        if len(messages) >= 1:
            for msg in messages:
                if isinstance(msg.get("content"), str):
                    msg["content"] = [{"type": "text", "text": msg["content"]}]
                elif isinstance(msg.get("content"), list):
                    for block in msg["content"]:
                        if isinstance(block, dict) and "cache_control" in block:
                            del block["cache_control"]
            
            if messages:
                last_msg = messages[-1]
                if isinstance(last_msg.get("content"), list) and last_msg["content"]:
                    last_block = last_msg["content"][-1]
                    if isinstance(last_block, dict):
                        last_block["cache_control"] = {"type": "ephemeral"}
    
    async def chat_stream(self, content, user_id: str, session_id: str = None):
        await self.init_mcp()
        
        self.request_count += 1
        request_id = self.request_count
        
        # 중단 이벤트 생성
        cancel_event = asyncio.Event()
        if session_id:
            self.active_sessions[session_id] = cancel_event
        
        
        # 데이터베이스에서 세션 메시지 로드
        messages = []
        if session_id:
            try:
                messages = self.db.get_session_messages(session_id, user_id)
            except HTTPException:
                # 세션이 존재하지 않거나 권한이 없으면 새 세션으로 처리
                session_id = None
                messages = []
        
        if not session_id:
            session_id = str(uuid.uuid4())
        is_first_message = len(messages) == 0
        
        # 새 사용자 메시지 추가 (content 배열 형태)
        user_content = content if isinstance(content, list) else [{"type": "text", "text": str(content)}]
        
        messages.append({"role": "user", "content": user_content})
        
        # 세션이 없으면 생성하고 제목 생성
        if is_first_message:
            # 제목 생성을 위해 첫 번째 텍스트 블록 사용
            title_text = next((block["text"] for block in user_content if block.get("type") == "text"), "새 채팅")
            
            title = await self.db.generate_session_title(title_text, self.anthropic)
            self.db.create_session(user_id, title, session_id)
            yield f"data: {json.dumps({'type': 'session_created', 'session_id': session_id, 'title': title})}\n\n"
        
        # 사용자 메시지를 데이터베이스에 저장
        self.db.save_message(session_id, "user", json.dumps(user_content, ensure_ascii=False))
        
        # 현재 사용자 정보 가져오기 (API 키 포함)
        # current_user = self.db.get_user_by_id(user_id)
        
        self.add_cache_control_to_messages(messages)
        
        try:
            while True:
                tools = self.convert_tools()
                if tools:
                    tools[-1]["cache_control"] = {"type": "ephemeral"}
            
            # 현재 사용자 정보 가져오기
            # current_user = self.db.get_user_by_id(user_id)
            # user_info = f"사용자 ID: {user_id}"
            # user_api_key = ""
            # if current_user:
            #     user_info += f", 이름: {current_user['first_name']} {current_user['last_name']}, 이메일: {current_user['email']}"
            #     user_api_key = current_user.get('api_key', '')
            #     print(f"[DEBUG] 시스템 프롬프트에 포함될 API 키: {user_api_key[:8] + '...' if user_api_key else '없음'}")
            
                system = [
                    {
                        "type": "text",
                        "text": open("prompt.txt", "r", encoding="utf-8").read()
                    }
                    # {
                    #     "type": "text",
                    #     "text": "# 페르소나\n당신은 n8n 자동화 소프트웨어의 전문가입니다. n8n-MCP 도구를 사용하여 워크플로우를 설계, 구축, 검증하는 역할을 합니다."
                    # },
                    # {
                    #     "type": "text", 
                    #     "text": f"# 사전정보\n- 현재 대화 중인 사용자: {user_info}\n- 사용자 API 키: {user_api_key}\n- 사용자는 단순히 자동화를 원하는 비IT 직무자입니다\n- 사용자는 기술적 세부사항보다는 결과와 과정을 이해하고 싶어합니다"
                    # },
                    # {
                    #     "type": "text",
                    #     "text": "# 툴 사용법 워크플로우\n## 노드 추가 시:\n1. search_nodes로 필요한 노드 검색\n2. get_node_info로 노드 상세 정보 확인\n3. 적절한 노드를 워크플로우에 추가\n\n## 워크플로우 생성 시:\n1. validate_workflow로 워크플로우 구조 검증\n2. n8n_create_workflow로 워크플로우 생성 (API 키는 자동으로 포함됨)"
                    # },
                    # {
                    #     "type": "text",
                    #     "text": "# 생각 및 출력 양식\n- 정확하고 효율적으로 작업하세요\n- tool_use를 할 때는 사용자에게 '이런 이유로 이런 도구를 사용한다'고 설명해주세요\n- 최대한 간단하고 이해하기 쉽게 설명하세요\n- 사용자에게 코드를 보여주지 마세요. 말로 잘 설명해야 합니다\n- 기술적 용어보다는 일상적인 언어를 사용하세요\n- 위의 툴 사용법 워크플로우를 반드시 따라주세요\n- 업로드된 이미지나 파일이 있다면 해당 내용을 분석하고 n8n 워크플로우와 어떻게 연결할 수 있는지 설명해주세요",
                    #     "cache_control": {"type": "ephemeral"}
                    # }
                ]
                
                with self.anthropic.messages.stream(
                    model="claude-sonnet-4-20250514",
                    max_tokens=16000,
                    thinking={"type": "enabled", "budget_tokens": 10000},
                    tools=tools,
                    system=system,
                    extra_headers={"anthropic-beta": "interleaved-thinking-2025-05-14"},
                    messages=messages
                ) as stream:
                    
                    thinking_text = ""
                    current_block_type = None
                    
                    for event in stream:
                        # 중단 요청 체크
                        if cancel_event.is_set():
                            print(f"🛑 스트리밍 중단됨: session_id={session_id}")
                            break
                            
                        if event.type == "content_block_start":
                            current_block_type = event.content_block.type
                            if current_block_type == "thinking":
                                yield f"data: {json.dumps({'type': 'thinking_start'})}\n\n"
                            elif current_block_type == "text":
                                yield f"data: {json.dumps({'type': 'text_start'})}\n\n"
                            elif current_block_type == "tool_use":
                                yield f"data: {json.dumps({'type': 'tool_use_start', 'name': event.content_block.name})}\n\n"
                        
                        elif event.type == "content_block_delta":
                            if event.delta.type == "thinking_delta":
                                thinking_text += event.delta.thinking
                                yield f"data: {json.dumps({'type': 'thinking_delta', 'text': event.delta.thinking})}\n\n"
                                await asyncio.sleep(0)
                            elif event.delta.type == "text_delta":
                                yield f"data: {json.dumps({'type': 'text_delta', 'text': event.delta.text})}\n\n"
                                await asyncio.sleep(0)
                        
                        elif event.type == "content_block_stop":
                            if current_block_type == "thinking":
                                yield f"data: {json.dumps({'type': 'thinking_stop'})}\n\n"
                                thinking_text = ""
                    
                    # Usage 로그 출력 및 메시지 추출
                    message_obj = stream.get_final_message()
                    usage = message_obj.usage
                    
                    cache_read = getattr(usage, 'cache_read_input_tokens', 0)
                    cache_creation = getattr(usage, 'cache_creation_input_tokens', 0)
                    
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] REQUEST #{request_id} USAGE - Input: {usage.input_tokens}, Output: {usage.output_tokens}, Cache Create: {cache_creation}, Cache Read: {cache_read}")
                    
                    # response_content를 JSON 직렬화 가능한 형태로 변환
                    assistant_content = []
                    for block in message_obj.content:
                        if hasattr(block, 'model_dump'):
                            assistant_content.append(block.model_dump())
                        else:
                            assistant_content.append({"type": "text", "text": str(block)})
                    
                    # 어시스턴트 응답을 데이터베이스에 저장
                    self.db.save_message(session_id, "assistant", json.dumps(assistant_content, ensure_ascii=False))
                    
                    messages.append({"role": "assistant", "content": assistant_content})
                    
                    tool_blocks = [b for b in message_obj.content if b.type == 'tool_use']
                    
                    if not tool_blocks:
                        yield f"data: {json.dumps({'type': 'session_id', 'session_id': session_id})}\n\n"
                        yield f"data: {json.dumps({'type': 'complete'})}\n\n"
                        break
                    
                    # 도구 실행
                    tool_results = []
                    for tool in tool_blocks:
                        yield f"data: {json.dumps({'type': 'tool_execution', 'name': tool.name, 'input': tool.input})}\n\n"
                        
                        try:
                            result = await self.call_tool(tool.name, tool.input, self.n8n_api_key, user_id)
                            yield f"data: {json.dumps({'type': 'tool_result', 'name': tool.name, 'result': result[:200] + ('...' if len(result) > 200 else '')})}\n\n"
                            
                            tool_results.append({
                                "type": "tool_result",
                                "tool_use_id": tool.id,
                                "content": result
                            })
                        except Exception as e:
                            error_msg = str(e)
                            yield f"data: {json.dumps({'type': 'tool_error', 'name': tool.name, 'error': error_msg})}\n\n"
                            tool_results.append({
                                "type": "tool_result",
                                "tool_use_id": tool.id,
                                "content": f"오류: {error_msg}"
                            })
                    
                    # 도구 결과를 DB에 저장하고 메시지에 추가
                    self.db.save_message(session_id, "user", json.dumps(tool_results, ensure_ascii=False))
                    messages.append({"role": "user", "content": tool_results})
                    
                    self.add_cache_control_to_messages(messages)
        
        finally:
            # 세션 정리
            if session_id and session_id in self.active_sessions:
                del self.active_sessions[session_id]

# 전역 인스턴스
claude_backend = ClaudeMCPBackend()

# 인증 관련 엔드포인트
@app.post("/register")
async def register(user: UserRegister):
    """회원가입"""
    user_id = claude_backend.db.create_user(
        user.email, user.first_name, user.last_name, user.password
    )
    
    user_data = {
        "user_id": user_id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name
    }
    
    token = create_access_token(user_data)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_data
    }

# n8n API 헬퍼 함수들
async def update_workflow_in_n8n(workflow_id: str, name: str):
    """n8n에서 워크플로우 이름 업데이트"""
    n8n_url = os.getenv("N8N_API_URL", "http://localhost:5678/api/v1")
    n8n_api_key = os.getenv("N8N_API_KEY")
    
    if not n8n_api_key:
        print("[WARNING] N8N_API_KEY가 설정되지 않았습니다")
        return False
    
    try:
        async with httpx.AsyncClient() as client:
            # 첫 번째 시도: PATCH로 이름만 변경
            patch_response = await client.patch(
                f"{n8n_url}/workflows/{workflow_id}",
                headers={
                    "X-N8N-API-KEY": n8n_api_key,
                    "Content-Type": "application/json"
                },
                json={"name": name},
                timeout=10.0
            )
            
            if patch_response.status_code == 200:
                print(f"[INFO] n8n 워크플로우 이름 업데이트 성공 (PATCH): {workflow_id} -> {name}")
                return True
            
            print(f"[WARN] PATCH 실패: {patch_response.status_code} - {patch_response.text}")
            
            # PATCH 실패시 PUT으로 전체 업데이트 시도
            get_response = await client.get(
                f"{n8n_url}/workflows/{workflow_id}",
                headers={
                    "X-N8N-API-KEY": n8n_api_key,
                },
                timeout=10.0
            )
            
            if get_response.status_code != 200:
                print(f"[ERROR] n8n 워크플로우 조회 실패: {get_response.status_code} - {get_response.text}")
                return False
            
            workflow_data = get_response.json()
            print(f"[DEBUG] 원본 워크플로우 데이터 키: {list(workflow_data.keys())}")
            
            # 정확히 필요한 필드만 복사
            update_data = {
                "name": name,
                "nodes": workflow_data["nodes"],
                "connections": workflow_data["connections"]
            }
            
            # 존재하는 선택적 필드만 추가
            for field in ["settings", "staticData", "pinData"]:
                if field in workflow_data and workflow_data[field]:
                    update_data[field] = workflow_data[field]
            
            print(f"[DEBUG] 전송할 데이터 키: {list(update_data.keys())}")
            
            put_response = await client.put(
                f"{n8n_url}/workflows/{workflow_id}",
                headers={
                    "X-N8N-API-KEY": n8n_api_key,
                    "Content-Type": "application/json"
                },
                json=update_data,
                timeout=10.0
            )
            
            if put_response.status_code == 200:
                print(f"[INFO] n8n 워크플로우 이름 업데이트 성공 (PUT): {workflow_id} -> {name}")
                return True
            else:
                print(f"[ERROR] n8n 워크플로우 이름 업데이트 실패: {put_response.status_code} - {put_response.text}")
                return False
                
    except Exception as e:
        print(f"[ERROR] n8n API 호출 중 오류: {e}")
        return False

async def toggle_workflow_in_n8n(workflow_id: str, activate: bool):
    """n8n에서 워크플로우 활성화/비활성화"""
    n8n_url = os.getenv("N8N_API_URL", "http://localhost:5678/api/v1")
    n8n_api_key = os.getenv("N8N_API_KEY")
    
    if not n8n_api_key:
        print("[WARNING] N8N_API_KEY가 설정되지 않았습니다")
        return False
    
    try:
        async with httpx.AsyncClient() as client:
            # 정확한 n8n API 엔드포인트 사용
            if activate:
                endpoint = f"{n8n_url}/workflows/{workflow_id}/activate"
            else:
                endpoint = f"{n8n_url}/workflows/{workflow_id}/deactivate"
            
            response = await client.post(
                endpoint,
                headers={
                    "X-N8N-API-KEY": n8n_api_key,
                    "Content-Type": "application/json"
                },
                timeout=10.0
            )
            
            if response.status_code in [200, 201]:
                action = "활성화" if activate else "비활성화"
                print(f"[INFO] n8n 워크플로우 {action} 성공: {workflow_id}")
                return True
            else:
                action = "활성화" if activate else "비활성화"
                print(f"[ERROR] n8n 워크플로우 {action} 실패: {response.status_code} - {response.text}")
                return False
                
    except Exception as e:
        print(f"[ERROR] n8n API 호출 중 오류: {e}")
        return False

async def delete_workflow_in_n8n(workflow_id: str):
    """n8n에서 워크플로우 삭제"""
    n8n_url = os.getenv("N8N_API_URL", "http://localhost:5678/api/v1")
    n8n_api_key = os.getenv("N8N_API_KEY")
    
    if not n8n_api_key:
        print("[WARNING] N8N_API_KEY가 설정되지 않았습니다")
        return False
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{n8n_url}/workflows/{workflow_id}",
                headers={
                    "X-N8N-API-KEY": n8n_api_key
                },
                timeout=10.0
            )
            
            if response.status_code == 200:
                print(f"[INFO] n8n 워크플로우 삭제 성공: {workflow_id}")
                return True
            else:
                print(f"[ERROR] n8n 워크플로우 삭제 실패: {response.status_code} - {response.text}")
                return False
                
    except Exception as e:
        print(f"[ERROR] n8n API 호출 중 오류: {e}")
        return False

@app.post("/login")
async def login(user: UserLogin):
    """로그인 - 백엔드 로그인 성공 후 n8n 마스터 계정 정보 제공"""
    user_data = claude_backend.db.authenticate_user(user.email, user.password)
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 잘못되었습니다"
        )
    
    token = create_access_token(user_data)
    
    response_data = {
        "access_token": token,
        "token_type": "bearer",
        "user": user_data
    }
    
    print(f"사용자 {user.email}의 백엔드 로그인 성공")
    
    return response_data

# 채팅 관련 엔드포인트
@app.post("/chat")
async def chat(request: ChatRequest, current_user: dict = Depends(verify_token)):
    """통합 채팅 (텍스트 + 파일)"""
    try:
        # 프론트엔드에서 받은 content를 그대로 처리
        # content는 이미 [{"type": "text", "text": "..."}, {"type": "image", "source": {...}}, ...] 형태
        
        return StreamingResponse(
            claude_backend.chat_stream(request.content, current_user["user_id"], request.session_id),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat/stop/{session_id}")
async def stop_chat(session_id: str, current_user: dict = Depends(verify_token)):
    """채팅 중단"""
    try:
        print(f"🛑 채팅 중단 요청: session_id={session_id}, user_id={current_user['user_id']}")
        
        # 활성 세션이 있으면 중단 이벤트 설정
        if session_id in claude_backend.active_sessions:
            claude_backend.active_sessions[session_id].set()
            print(f"🛑 세션 중단 신호 전송: {session_id}")
            return {"status": "stopped", "session_id": session_id}
        else:
            print(f"🛑 활성 세션 없음: {session_id}")
            return {"status": "no_active_session", "session_id": session_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/sessions")
async def get_user_sessions(current_user: dict = Depends(verify_token)):
    """사용자의 세션 목록 조회"""
    sessions = claude_backend.db.get_user_sessions(current_user["user_id"])
    return {"sessions": sessions}

@app.get("/sessions/{session_id}")
async def get_session_info(session_id: str, current_user: dict = Depends(verify_token)):
    """세션 정보 및 메시지 조회"""
    try:
        # 메시지 조회 (권한 확인 포함)
        messages = claude_backend.db.get_session_messages(session_id, current_user["user_id"])
        
        # 세션 정보 조회
        sessions = claude_backend.db.get_user_sessions(current_user["user_id"])
        session = next((s for s in sessions if s["session_id"] == session_id), None)
        if not session:
            raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다")
        
        # 세션 정보와 메시지를 함께 반환
        return {
            "session_id": session["session_id"],
            "title": session["title"],
            "created_at": session["created_at"],
            "updated_at": session["updated_at"],
            "messages": messages
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다")

# /user/api-key API 제거됨 - 프론트엔드에서 사용되지 않음 (보안상 불필요)

@app.put("/sessions/{session_id}")
async def update_session(session_id: str, title: str, current_user: dict = Depends(verify_token)):
    """세션 제목 업데이트"""
    claude_backend.db.update_session_title(session_id, title, current_user["user_id"])
    return {"session_id": session_id, "title": title}

@app.delete("/sessions/{session_id}")
async def delete_session(session_id: str, current_user: dict = Depends(verify_token)):
    """세션 삭제"""
    claude_backend.db.delete_session(session_id, current_user["user_id"])
    return {"message": "Session deleted successfully"}

# verify_token_from_query 함수 제거됨 - 더 이상 사용되지 않음


# /open-n8n API 제거됨 - n8n 자동 로그인으로 불필요

# API 키 기반 워크플로우 엔드포인트 (MCP 서버용)
# Public API - API 키 기반 워크플로우 엔드포인트 (MCP 서버용)

@app.post("/api/workflows")
async def create_workflow_with_api_key(workflow: ApiKeyWorkflowCreate):
    """API 키 기반: 워크플로우 생성 (MCP 서버용)"""
    print(f"[DEBUG] MCP 서버로부터 워크플로우 등록 요청: n8n_workflow_id={workflow.n8n_workflow_id}, name={workflow.name}, user_id={workflow.user_id}")
    try:
        n8n_workflow_id = claude_backend.db.create_workflow(
            workflow.user_id, workflow.n8n_workflow_id, workflow.name
        )
        print(f"[DEBUG] 워크플로우 등록 성공: {n8n_workflow_id}")
        return {"n8n_workflow_id": n8n_workflow_id, "user_id": workflow.user_id}
    except sqlite3.IntegrityError:
        print(f"[DEBUG] 워크플로우 등록 실패: 이미 등록된 워크플로우")
        raise HTTPException(status_code=400, detail="이미 등록된 워크플로우입니다")

@app.get("/api/workflows")
async def get_user_workflows_api(workflow: ApiKeyWorkflowCreate):
    """API 키 기반: 사용자의 워크플로우 목록 조회 (MCP 서버용)"""
    workflows = claude_backend.db.get_user_workflows(workflow.user_id)
    return {"workflows": workflows}



# API 키 기반 삭제 API 제거됨 - JWT 토큰 기반 내부 API만 사용

# 내부 API - JWT 토큰 기반 워크플로우 엔드포인트
@app.get("/workflows")
async def get_user_workflows(current_user: dict = Depends(verify_token)):
    """사용자의 워크플로우 목록 조회"""
    workflows = claude_backend.db.get_user_workflows(current_user["user_id"])
    return {"workflows": workflows}



@app.delete("/workflows/{n8n_workflow_id}")
async def delete_workflow(n8n_workflow_id: str, current_user: dict = Depends(verify_token)):
    """워크플로우 삭제 (n8n과 백엔드 DB 모두에서 삭제)"""
    # 워크플로우 존재 확인
    existing_workflow = claude_backend.db.get_workflow_by_id(n8n_workflow_id, current_user["user_id"])
    if not existing_workflow:
        raise HTTPException(status_code=404, detail="워크플로우를 찾을 수 없습니다")
    
    # 먼저 n8n에서 워크플로우 삭제
    n8n_success = await delete_workflow_in_n8n(n8n_workflow_id)
    if not n8n_success:
        raise HTTPException(status_code=500, detail="n8n에서 워크플로우 삭제에 실패했습니다")
    
    # n8n 성공 시 백엔드 DB에서도 삭제
    claude_backend.db.delete_workflow(n8n_workflow_id, current_user["user_id"])
    return {"message": "워크플로우가 삭제되었습니다"}

# 내부 API - 워크플로우 이름 변경 (JWT 토큰 기반)
@app.put("/workflows/{n8n_workflow_id}/name")
async def update_workflow_name(n8n_workflow_id: str, workflow_update: WorkflowNameUpdate, current_user: dict = Depends(verify_token)):
    """워크플로우 이름 변경 (n8n과 백엔드 DB 모두 업데이트)"""
    # 먼저 n8n에서 워크플로우 이름 변경
    n8n_success = await update_workflow_in_n8n(n8n_workflow_id, workflow_update.name)
    if not n8n_success:
        raise HTTPException(status_code=500, detail="n8n에서 워크플로우 이름 변경에 실패했습니다")
    
    # n8n 성공 시 백엔드 DB도 업데이트
    db_success = claude_backend.db.update_workflow_name(n8n_workflow_id, workflow_update.name, current_user["user_id"])
    if not db_success:
        raise HTTPException(status_code=404, detail="워크플로우를 찾을 수 없습니다")
    
    return {"message": "워크플로우 이름이 변경되었습니다", "n8n_workflow_id": n8n_workflow_id, "name": workflow_update.name}

@app.post("/workflows/{n8n_workflow_id}/toggle")
async def toggle_workflow_status(n8n_workflow_id: str, current_user: dict = Depends(verify_token)):
    """워크플로우 활성화/비활성화 토글"""
    # 현재 상태 조회 (디버깅 추가)
    workflow = claude_backend.db.get_workflow_by_id(n8n_workflow_id, current_user["user_id"])
    print(f"[DEBUG] 워크플로우 조회 결과: {workflow}")
    print(f"[DEBUG] 사용자 ID: {current_user['user_id']}")
    print(f"[DEBUG] 워크플로우 ID: {n8n_workflow_id}")
    
    if not workflow:
        raise HTTPException(status_code=404, detail="워크플로우를 찾을 수 없습니다")
    
    # 현재 상태의 반대로 토글
    new_status = "inactive" if workflow["status"] == "active" else "active"
    activate = new_status == "active"
    
    # n8n에서 상태 변경
    n8n_success = await toggle_workflow_in_n8n(n8n_workflow_id, activate)
    if not n8n_success:
        raise HTTPException(status_code=500, detail="n8n에서 워크플로우 상태 변경에 실패했습니다")
    
    # 백엔드 DB에서 상태 업데이트
    db_success = claude_backend.db.update_workflow_status(n8n_workflow_id, new_status, current_user["user_id"])
    if not db_success:
        raise HTTPException(status_code=404, detail="워크플로우를 찾을 수 없습니다")
    
    action = "활성화" if activate else "비활성화"
    return {"message": f"워크플로우가 {action}되었습니다", "n8n_workflow_id": n8n_workflow_id, "status": new_status}

# 프로젝트 관리 엔드포인트들
@app.post("/projects")
async def create_project(project: ProjectCreate, current_user: dict = Depends(verify_token)):
    """프로젝트 생성"""
    project_id = claude_backend.db.create_project(current_user["user_id"], project.name)
    return {"project_id": project_id, "name": project.name}

@app.get("/projects")
async def get_user_projects(current_user: dict = Depends(verify_token)):
    """사용자의 프로젝트 목록 조회"""
    projects = claude_backend.db.get_user_projects(current_user["user_id"])
    return {"projects": projects}

@app.put("/projects/{project_id}")
async def update_project(project_id: str, project_update: ProjectUpdate, current_user: dict = Depends(verify_token)):
    """프로젝트 이름 변경"""
    success = claude_backend.db.update_project_name(project_id, project_update.name, current_user["user_id"])
    if not success:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")
    
    return {"message": "프로젝트 이름이 변경되었습니다", "project_id": project_id, "name": project_update.name}

@app.delete("/projects/{project_id}")
async def delete_project(project_id: str, current_user: dict = Depends(verify_token)):
    """프로젝트 삭제"""
    claude_backend.db.delete_project(project_id, current_user["user_id"])
    return {"message": "프로젝트가 삭제되었습니다"}

@app.put("/workflows/{n8n_workflow_id}/project")
async def assign_workflow_to_project(n8n_workflow_id: str, workflow_update: WorkflowProjectUpdate, current_user: dict = Depends(verify_token)):
    """워크플로우를 프로젝트에 할당 (project_id가 None이면 프로젝트에서 제거)"""
    success = claude_backend.db.assign_workflow_to_project(n8n_workflow_id, workflow_update.project_id, current_user["user_id"])
    if not success:
        raise HTTPException(status_code=404, detail="워크플로우를 찾을 수 없습니다")
    
    if workflow_update.project_id:
        return {"message": "워크플로우가 프로젝트에 할당되었습니다"}
    else:
        return {"message": "워크플로우가 프로젝트에서 제거되었습니다"}

# API 키 기반 공개 API 제거됨 - JWT 토큰 기반 내부 API만 사용

# health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Backend is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
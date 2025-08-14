import asyncio
import json
import httpx
import os
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="DA-ZZANY Chat Backend",
    description="실시간 스트리밍 채팅 백엔드 서버 - n8n 자동화 전문가 Claude",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"

class DAZZANYChatBackend:
    def __init__(self):
        # 강제로 Mock 모드 사용 (테스트용)
        print("Mock 모드로 강제 설정됨")
        self.anthropic = None
        self.mock_mode = True
            
        # MCP 설정 (n8n 워크플로우 자동화 도구)
        self.mcp_url = "http://localhost:3000/mcp"
        self.auth_token = "4PsvmU2knXt+KTV+d2sOFTly6C9C+9QAwdbqnd9uFVw="
        self.tools = []
        self.sessions = {}  # 세션별 대화 저장
        
        mode_text = "Mock" if self.mock_mode else "Claude API"
        print(f"DA-ZZANY 채팅 백엔드 초기화 완료 (모드: {mode_text})")
        
    async def init_mcp(self):
        if self.tools:  # 이미 초기화됨
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
        return [{
            "name": tool["name"],
            "description": tool.get("description", ""),
            "input_schema": tool.get("inputSchema", {"type": "object", "properties": {}})
        } for tool in self.tools]
    
    async def call_tool(self, name, args):
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        async with httpx.AsyncClient() as client:
            response = await client.post(self.mcp_url, json={
                "jsonrpc": "2.0", "id": 3, "method": "tools/call",
                "params": {"name": name, "arguments": args}
            }, headers=headers)
            
            result = response.json().get("result", {})
            return json.dumps(result.get("content", result), ensure_ascii=False, indent=2)
    
    def get_session_messages(self, session_id):
        if session_id not in self.sessions:
            self.sessions[session_id] = []
        return self.sessions[session_id]
    
    def add_cache_control_to_messages(self, messages):
        if len(messages) >= 1:
            # 모든 메시지를 표준 형태로 변환하고 기존 캐시 컨트롤 제거
            for msg in messages:
                if isinstance(msg.get("content"), str):
                    msg["content"] = [{"type": "text", "text": msg["content"]}]
                elif isinstance(msg.get("content"), list):
                    for block in msg["content"]:
                        if isinstance(block, dict) and "cache_control" in block:
                            del block["cache_control"]
            
            # 전체 대화 기록을 캐시 - 마지막 메시지에 캐시 컨트롤 적용
            if messages:
                last_msg = messages[-1]
                if isinstance(last_msg.get("content"), list) and last_msg["content"]:
                    # 마지막 메시지의 마지막 블록에 캐시 컨트롤 추가
                    last_block = last_msg["content"][-1]
                    if isinstance(last_block, dict):
                        last_block["cache_control"] = {"type": "ephemeral"}
    
    async def chat_stream(self, message: str, session_id: str):
        """실시간 스트리밍 채팅 처리"""
        # Mock 모드일 때는 간단한 응답 스트리밍
        if self.mock_mode:
            async for chunk in self._mock_chat_stream(message, session_id):
                yield chunk
            return
            
        # 실제 Claude API 스트리밍
        await self.init_mcp()
        
        messages = self.get_session_messages(session_id)
        messages.append({"role": "user", "content": message})
        
        self.add_cache_control_to_messages(messages)
        
        # 디버깅: 캐시 컨트롤 적용 확인
        print(f"[{datetime.now().strftime('%H:%M:%S')}] DEBUG - Messages count: {len(messages)}")
        cache_control_count = 0
        for i, msg in enumerate(messages):
            if isinstance(msg.get('content'), list):
                for j, block in enumerate(msg['content']):
                    if isinstance(block, dict) and 'cache_control' in block:
                        cache_control_count += 1
                        print(f"[{datetime.now().strftime('%H:%M:%S')}] DEBUG - Cache control found in message {i} ({msg['role']}), block {j}")
        print(f"[{datetime.now().strftime('%H:%M:%S')}] DEBUG - Total cache controls: {cache_control_count}")
        
        while True:
            # 도구 목록을 캐시 가능한 형태로 구성
            tools = self.convert_tools()
            if tools:  # 마지막 도구에 캐시 컨트롤 추가
                tools[-1]["cache_control"] = {"type": "ephemeral"}
            
            with self.anthropic.messages.stream(
                model="claude-sonnet-4-20250514",
                max_tokens=16000,
                thinking={"type": "enabled", "budget_tokens": 10000},
                tools=tools,
                system=[{
                    "type": "text",
                    "text": "당신은 n8n 자동화 소프트웨어의 전문가입니다. n8n-MCP 도구를 사용하여 워크플로우를 설계, 구축, 검증하는 역할을 합니다. 정확하고 효율적으로 작업하세요. 노드를 배치하게 된다면 노드의 input과 output을 예상해서 사용자한테 알려주세요. ",
                    "cache_control": {"type": "ephemeral"}
                }],
                extra_headers={"anthropic-beta": "interleaved-thinking-2025-05-14"},
                messages=messages
            ) as stream:
                
                thinking_text = ""
                current_block_type = None
                
                for event in stream:
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
                            # 원본 delta를 그대로 전송
                            yield f"data: {json.dumps({'type': 'thinking_delta', 'text': event.delta.thinking})}\n\n"
                            await asyncio.sleep(0)  # 이벤트 루프가 다른 작업을 처리할 수 있도록
                        elif event.delta.type == "text_delta":
                            # 원본 delta를 그대로 전송  
                            yield f"data: {json.dumps({'type': 'text_delta', 'text': event.delta.text})}\n\n"
                            await asyncio.sleep(0)  # 이벤트 루프가 다른 작업을 처리할 수 있도록
                    
                    elif event.type == "content_block_stop":
                        if current_block_type == "thinking":
                            yield f"data: {json.dumps({'type': 'thinking_stop'})}\n\n"
                            thinking_text = ""
                
                # Usage 로그 출력 및 메시지 추출
                message = stream.get_final_message()
                usage = message.usage
                
                # 올바른 캐시 속성명 사용
                cache_read = getattr(usage, 'cache_read_input_tokens', 0)
                cache_creation = getattr(usage, 'cache_creation_input_tokens', 0)
                
                print(f"[{datetime.now().strftime('%H:%M:%S')}] USAGE - Input: {usage.input_tokens}, Output: {usage.output_tokens}, Cache Create: {cache_creation}, Cache Read: {cache_read}")
                tool_blocks = [b for b in message.content if b.type == 'tool_use']
                
                if not tool_blocks:
                    yield f"data: {json.dumps({'type': 'complete'})}\n\n"
                    break
                
                messages.append({"role": "assistant", "content": message.content})
                
                # 도구 실행
                tool_results = []
                for tool in tool_blocks:
                    yield f"data: {json.dumps({'type': 'tool_execution', 'name': tool.name, 'input': tool.input})}\n\n"
                    
                    try:
                        result = await self.call_tool(tool.name, tool.input)
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
                
                messages.append({"role": "user", "content": tool_results})
                
                # 도구 실행 후 다시 캐시 컨트롤 적용
                self.add_cache_control_to_messages(messages)
    
    async def _mock_chat_stream(self, message: str, session_id: str):
        """모의 채팅 스트리밍 (API가 없을 때)"""
        # 세션 처리
        messages = self.get_session_messages(session_id)
        messages.append({"role": "user", "content": message})
        
        # 응답 생성
        response = self._generate_mock_response(message)
        
        # 사고 단계 시뮬레이션
        yield f"data: {json.dumps({'type': 'thinking_start'})}\n\n"
        await asyncio.sleep(0.3)
        yield f"data: {json.dumps({'type': 'thinking_delta', 'text': '사용자의 질문을 분석하고 있습니다...'})}\n\n"
        await asyncio.sleep(0.5)
        yield f"data: {json.dumps({'type': 'thinking_delta', 'text': ' 적절한 응답을 준비하고 있습니다.'})}\n\n"
        await asyncio.sleep(0.3)
        yield f"data: {json.dumps({'type': 'thinking_stop'})}\n\n"
        
        # 텍스트 스트리밍
        yield f"data: {json.dumps({'type': 'text_start'})}\n\n"
        
        # 문자를 조금씩 스트리밍
        for char in response:
            yield f"data: {json.dumps({'type': 'text_delta', 'text': char})}\n\n"
            await asyncio.sleep(0.02)  # 타이핑 효과
        
        # 완료
        yield f"data: {json.dumps({'type': 'complete'})}\n\n"
        
        # 세션에 응답 저장
        messages.append({"role": "assistant", "content": response})
    
    def _generate_mock_response(self, message: str) -> str:
        """모의 응답 생성"""
        message_lower = message.lower()
        
        if "안녕" in message_lower or "hello" in message_lower:
            return "안녕하세요! DA-ZZANY에 오신 것을 환영합니다. 저는 n8n 워크플로우 자동화 전문가입니다. 어떤 작업을 자동화하고 싶으신가요?"
        elif "워크플로우" in message_lower or "workflow" in message_lower:
            return "워크플로우 자동화에 대한 질문이시군요! n8n을 활용한 다양한 자동화 솔루션을 도와드릴 수 있습니다. 예를 들어:\n\n• 데이터 처리 및 변환\n• API 연동 및 데이터 동기화\n• 이메일 자동화 및 알림\n• 파일 처리 및 백업\n• 소셜 미디어 자동 게시\n\n어떤 종류의 자동화를 원하시는지 알려주세요!"
        elif "채팅" in message_lower or "chat" in message_lower:
            return "실시간 채팅 시스템이 정상적으로 작동하고 있습니다! 이 시스템은 Server-Sent Events를 통해 실시간 스트리밍을 지원하며, 사고 과정(thinking)과 도구 실행 과정을 실시간으로 볼 수 있습니다."
        elif "n8n" in message_lower:
            return "n8n은 강력한 워크플로우 자동화 도구입니다. 다양한 노드를 연결하여 복잡한 비즈니스 로직을 자동화할 수 있습니다. 특정 n8n 기능에 대해 더 알고 싶으시다면 구체적으로 어떤 부분이 궁금한지 알려주세요!"
        else:
            return f"'{message}'에 대한 질문을 받았습니다. 더 구체적인 정보를 제공해주시면 더 정확한 답변을 드릴 수 있습니다. 워크플로우 자동화와 관련된 어떤 도움이 필요하신가요?"

# 전역 인스턴스
chat_backend = DAZZANYChatBackend()

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        return StreamingResponse(
            chat_backend.chat_stream(request.message, request.session_id),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"  # nginx 버퍼링 비활성화
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "DA-ZZANY Chat Backend API",
        "version": "1.0.0",
        "description": "n8n 워크플로우 자동화 전문가 Claude",
        "endpoints": {
            "/chat": "POST - 실시간 스트리밍 채팅",
            "/health": "GET - 서버 상태 확인",
            "/sessions/{session_id}/messages": "GET - 세션 메시지 기록",
            "/sessions/{session_id}": "DELETE - 세션 초기화"
        }
    }

@app.get("/health")
async def health():
    """헬스 체크 엔드포인트"""
    return {
        "status": "healthy",
        "backend": "DA-ZZANY Chat Backend",
        "mode": "Mock" if chat_backend.mock_mode else "Claude API",
        "tools_loaded": len(chat_backend.tools),
        "sessions": len(chat_backend.sessions),
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    
    print("DA-ZZANY 채팅 백엔드 서버 시작 중...")
    mode_text = "Mock (미리보기)" if chat_backend.mock_mode else "Claude API (실제)"
    print(f"모드: {mode_text}")
    print("서버 주소: http://localhost:8000")
    print("API 문서: http://localhost:8000/docs")
    print("중단하려면 Ctrl+C를 누르세요\n")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        log_level="info"
    )
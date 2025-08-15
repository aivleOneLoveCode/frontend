# -*- coding: utf-8 -*-
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json

app = FastAPI(title="DA-ZZANY Chat Backend Test")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "DA-ZZANY Chat Backend API", "status": "running"}

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "backend": "DA-ZZANY Chat Backend",
        "mode": "Test",
        "tools_loaded": 0,
        "sessions": 0
    }

if __name__ == "__main__":
    import uvicorn
    print("DA-ZZANY 테스트 서버 시작...")
    print("서버 주소: http://localhost:8000")
    print("중단하려면 Ctrl+C를 누르세요")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
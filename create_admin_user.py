#!/usr/bin/env python
"""
기본 관리자 사용자 생성 스크립트
"""
import asyncio
import bcrypt
import sqlite3
import uuid
from dotenv import load_dotenv

load_dotenv()

def create_admin_user():
    """관리자 사용자 생성"""
    # 기본 계정 정보
    email = "admin@admin.com"
    password = "12345678"
    first_name = "관리자"
    last_name = "Admin"
    
    # 사용자 ID와 API 키 생성
    user_id = str(uuid.uuid4())
    api_key = str(uuid.uuid4())
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # 데이터베이스 연결
    conn = sqlite3.connect("claude_multi_user.db")
    cursor = conn.cursor()
    
    try:
        # 기존 사용자 확인
        cursor.execute('SELECT user_id FROM users WHERE email = ?', (email,))
        existing_user = cursor.fetchone()
        
        if existing_user:
            print(f"사용자 {email}이 이미 존재합니다.")
            cursor.execute('''
                SELECT user_id, email, first_name, last_name, api_key 
                FROM users WHERE email = ?
            ''', (email,))
            user_data = cursor.fetchone()
            print(f"기존 사용자 정보:")
            print(f"  - User ID: {user_data[0]}")
            print(f"  - Email: {user_data[1]}")
            print(f"  - Name: {user_data[2]} {user_data[3]}")
            print(f"  - API Key: {user_data[4]}")
        else:
            # 새 사용자 생성
            cursor.execute('''
                INSERT INTO users (user_id, email, first_name, last_name, password, api_key)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (user_id, email, first_name, last_name, hashed_password, api_key))
            
            conn.commit()
            print(f"관리자 사용자가 성공적으로 생성되었습니다!")
            print(f"  - Email: {email}")
            print(f"  - Password: {password}")
            print(f"  - Name: {first_name} {last_name}")
            print(f"  - User ID: {user_id}")
            print(f"  - API Key: {api_key}")
            
    except Exception as e:
        print(f"사용자 생성 중 오류 발생: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    create_admin_user()
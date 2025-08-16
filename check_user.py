#!/usr/bin/env python
"""
사용자 계정 확인 스크립트
"""
import sqlite3
import bcrypt

def check_user():
    """사용자 계정 확인"""
    email = "admin@admin.com"
    password = "12345678"
    
    conn = sqlite3.connect("claude_multi_user.db")
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT user_id, password, first_name, last_name 
        FROM users WHERE email = ?
    ''', (email,))
    
    result = cursor.fetchone()
    conn.close()
    
    if result:
        print(f"사용자 찾음: {email}")
        print(f"User ID: {result[0]}")
        print(f"Name: {result[2]} {result[3]}")
        print(f"저장된 해시: {result[1][:50]}...")
        
        # 비밀번호 검증
        if bcrypt.checkpw(password.encode('utf-8'), result[1].encode('utf-8')):
            print("✅ 비밀번호 일치!")
        else:
            print("❌ 비밀번호 불일치!")
            
    else:
        print(f"사용자 {email}을 찾을 수 없습니다.")

if __name__ == "__main__":
    check_user()
#!/usr/bin/env python
"""
관리자 비밀번호 재설정 스크립트
"""
import sqlite3
import bcrypt

def reset_admin_password():
    """관리자 비밀번호 재설정"""
    email = "admin@admin.com"
    new_password = "admin123"
    
    # 새 해시 생성
    hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    conn = sqlite3.connect("claude_multi_user.db")
    cursor = conn.cursor()
    
    try:
        # 비밀번호 업데이트
        cursor.execute('''
            UPDATE users 
            SET password = ? 
            WHERE email = ?
        ''', (hashed_password, email))
        
        if cursor.rowcount > 0:
            conn.commit()
            print(f"관리자 비밀번호가 재설정되었습니다!")
            print(f"Email: {email}")
            print(f"New Password: {new_password}")
            
            # 검증
            cursor.execute('''
                SELECT password FROM users WHERE email = ?
            ''', (email,))
            result = cursor.fetchone()
            
            if result and bcrypt.checkpw(new_password.encode('utf-8'), result[0].encode('utf-8')):
                print("✅ 비밀번호 검증 성공!")
            else:
                print("❌ 비밀번호 검증 실패!")
        else:
            print(f"사용자 {email}을 찾을 수 없습니다.")
            
    except Exception as e:
        print(f"오류 발생: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    reset_admin_password()
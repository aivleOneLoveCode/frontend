#!/usr/bin/env python
"""
로그인 테스트 스크립트
"""
import requests
import json

def test_login():
    """로그인 테스트"""
    url = "http://localhost:8000/login"
    data = {
        "email": "admin@admin.com",
        "password": "12345678"
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Login Success! Token: {result.get('access_token', 'No token')[:50]}...")
        else:
            print("Login Failed!")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login()
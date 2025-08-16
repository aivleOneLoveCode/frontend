#!/usr/bin/env python
"""
회원가입 테스트 스크립트
"""
import requests
import json

def test_register():
    """회원가입 테스트"""
    url = "http://localhost:8000/register"
    data = {
        "email": "test@test.com",
        "first_name": "테스트",
        "last_name": "사용자", 
        "password": "testpass123"
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Register Success! Token: {result.get('access_token', 'No token')[:50]}...")
        else:
            print("Register Failed!")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_register()
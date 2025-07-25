#!/usr/bin/env python3
"""
Production deployment health check script
Run this after deployment to verify everything is working
"""

import requests
import json
import os
from datetime import datetime

def check_health(api_url):
    """Check API health endpoint"""
    try:
        response = requests.get(f"{api_url}/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API Health: {data.get('status', 'unknown')}")
            return True
        else:
            print(f"❌ API Health Check Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API Health Check Error: {e}")
        return False

def check_cors(api_url, frontend_url):
    """Check CORS configuration"""
    try:
        headers = {
            'Origin': frontend_url,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
        
        response = requests.options(f"{api_url}/auth/login", headers=headers, timeout=10)
        if response.status_code in [200, 204]:
            print("✅ CORS Configuration: OK")
            return True
        else:
            print(f"❌ CORS Configuration: Failed ({response.status_code})")
            return False
    except Exception as e:
        print(f"❌ CORS Check Error: {e}")
        return False

def check_database(api_url):
    """Check database connectivity by fetching products"""
    try:
        response = requests.get(f"{api_url}/products", timeout=10)
        if response.status_code == 200:
            data = response.json()
            product_count = len(data.get('products', []))
            print(f"✅ Database: Connected ({product_count} products)")
            return True
        else:
            print(f"❌ Database Check Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Database Check Error: {e}")
        return False

def check_authentication(api_url):
    """Test authentication endpoints"""
    try:
        # Test registration endpoint (should return validation error)
        response = requests.post(f"{api_url}/auth/register", 
                               json={}, 
                               timeout=10)
        
        if response.status_code == 400:  # Expected validation error
            print("✅ Authentication Endpoints: Accessible")
            return True
        else:
            print(f"❌ Authentication Check: Unexpected response ({response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Authentication Check Error: {e}")
        return False

def main():
    """Run all deployment checks"""
    print("🚀 QuickCart Production Deployment Check")
    print("=" * 50)
    print(f"Timestamp: {datetime.now().isoformat()}")
    print()
    
    # Get URLs from environment or prompt
    api_url = os.getenv('API_URL')
    frontend_url = os.getenv('FRONTEND_URL')
    
    if not api_url:
        api_url = input("Enter your API URL (e.g., https://your-api.onrender.com/api): ").strip()
    
    if not frontend_url:
        frontend_url = input("Enter your Frontend URL (e.g., https://your-app.vercel.app): ").strip()
    
    print(f"API URL: {api_url}")
    print(f"Frontend URL: {frontend_url}")
    print()
    
    # Run checks
    checks_passed = 0
    total_checks = 4
    
    print("Running health checks...")
    print("-" * 30)
    
    if check_health(api_url):
        checks_passed += 1
    
    if check_cors(api_url, frontend_url):
        checks_passed += 1
    
    if check_database(api_url):
        checks_passed += 1
    
    if check_authentication(api_url):
        checks_passed += 1
    
    print()
    print("=" * 50)
    print(f"Checks Passed: {checks_passed}/{total_checks}")
    
    if checks_passed == total_checks:
        print("🎉 All checks passed! Your deployment is ready.")
        return 0
    else:
        print("⚠️  Some checks failed. Please review the errors above.")
        return 1

if __name__ == "__main__":
    exit(main())

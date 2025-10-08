#!/usr/bin/env python3
"""
Test All Services Script
"""

import requests
import time

def test_service(url, name, expected_status=200):
    """Test a service endpoint"""
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == expected_status:
            print(f"✅ {name}: OK (Status: {response.status_code})")
            return True
        else:
            print(f"❌ {name}: FAILED (Status: {response.status_code})")
            return False
    except requests.exceptions.ConnectionError:
        print(f"❌ {name}: NOT RUNNING")
        return False
    except requests.exceptions.Timeout:
        print(f"❌ {name}: TIMEOUT")
        return False
    except Exception as e:
        print(f"❌ {name}: ERROR - {str(e)}")
        return False

def main():
    print("Testing All Services")
    print("=" * 30)
    
    services = [
        ("http://localhost:5001/health", "OCR Service"),
        ("http://localhost:5000", "Backend API"),
        ("http://localhost:5173", "Frontend")
    ]
    
    results = []
    for url, name in services:
        results.append(test_service(url, name))
        time.sleep(1)  # Small delay between tests
    
    print("\n" + "=" * 30)
    print("SUMMARY:")
    print(f"OCR Service: {'✅' if results[0] else '❌'}")
    print(f"Backend API: {'✅' if results[1] else '❌'}")
    print(f"Frontend: {'✅' if results[2] else '❌'}")
    
    if all(results):
        print("\n🎉 All services are running correctly!")
        print("You can now use the application at: http://localhost:5173")
    else:
        print("\n⚠️ Some services are not running.")
        print("Please check the startup scripts and try again.")

if __name__ == "__main__":
    main()

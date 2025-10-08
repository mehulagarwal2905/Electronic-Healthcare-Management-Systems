#!/usr/bin/env python3
"""
Simple Port Test
"""

import requests
import socket

def test_port(port):
    """Test if a port is in use"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('localhost', port))
        sock.close()
        return result == 0
    except:
        return False

def test_service(url):
    """Test if a service is responding"""
    try:
        response = requests.get(url, timeout=3)
        return response.status_code == 200
    except:
        return False

def main():
    print("Port Configuration Test")
    print("=" * 30)
    
    # Test ports
    print("\nPort Usage:")
    print(f"Port 5000 (Backend): {'IN USE' if test_port(5000) else 'FREE'}")
    print(f"Port 5001 (OCR): {'IN USE' if test_port(5001) else 'FREE'}")
    print(f"Port 5173 (Frontend): {'IN USE' if test_port(5173) else 'FREE'}")
    
    # Test services
    print("\nService Status:")
    print(f"Backend API: {'RUNNING' if test_service('http://localhost:5000') else 'NOT RUNNING'}")
    print(f"OCR Service: {'RUNNING' if test_service('http://localhost:5001/health') else 'NOT RUNNING'}")
    print(f"Frontend: {'RUNNING' if test_service('http://localhost:8081') else 'NOT RUNNING'}")
    
    # Check for conflicts
    backend_running = test_port(5000)
    ocr_running = test_port(5001)
    
    if backend_running and ocr_running:
        print("\nSUCCESS: Both services are running on different ports!")
    elif backend_running or ocr_running:
        print("\nPARTIAL: Only one service is running")
    else:
        print("\nERROR: No services are running")

if __name__ == "__main__":
    main()

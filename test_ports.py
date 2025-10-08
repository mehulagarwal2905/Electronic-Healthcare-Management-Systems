#!/usr/bin/env python3
"""
Test Port Configuration
"""

import requests
import socket

def test_port(port, service_name):
    """Test if a port is available"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('localhost', port))
        sock.close()
        
        if result == 0:
            print(f"✅ Port {port} is in use by {service_name}")
            return True
        else:
            print(f"❌ Port {port} is free (no {service_name})")
            return False
    except Exception as e:
        print(f"❌ Error testing port {port}: {str(e)}")
        return False

def test_service_endpoint(url, service_name):
    """Test if a service endpoint is responding"""
    try:
        response = requests.get(url, timeout=5)
        print(f"✅ {service_name}: {response.status_code} - {response.text[:50]}")
        return True
    except requests.exceptions.ConnectionError:
        print(f"❌ {service_name}: Not responding")
        return False
    except Exception as e:
        print(f"❌ {service_name}: Error - {str(e)}")
        return False

def main():
    print("Port Configuration Test")
    print("=" * 30)
    
    # Test ports
    print("\n1. Testing Port Usage:")
    port_5000 = test_port(5000, "Backend API")
    port_5001 = test_port(5001, "OCR Service")
    port_5173 = test_port(5173, "Frontend")
    
    # Test service endpoints
    print("\n2. Testing Service Endpoints:")
    backend_ok = test_service_endpoint("http://localhost:5000", "Backend API")
    ocr_ok = test_service_endpoint("http://localhost:5001/health", "OCR Service")
    frontend_ok = test_service_endpoint("http://localhost:5173", "Frontend")
    
    # Summary
    print("\n" + "=" * 30)
    print("SUMMARY:")
    print(f"Port 5000 (Backend): {'✅' if port_5000 else '❌'}")
    print(f"Port 5001 (OCR): {'✅' if port_5001 else '❌'}")
    print(f"Port 5173 (Frontend): {'✅' if port_5173 else '❌'}")
    
    print(f"\nBackend API: {'✅' if backend_ok else '❌'}")
    print(f"OCR Service: {'✅' if ocr_ok else '❌'}")
    print(f"Frontend: {'✅' if frontend_ok else '❌'}")
    
    if port_5000 and port_5001 and not (port_5000 and port_5001 and port_5000 == port_5001):
        print("\n✅ Port configuration is correct!")
    else:
        print("\n❌ Port conflict detected!")

if __name__ == "__main__":
    main()

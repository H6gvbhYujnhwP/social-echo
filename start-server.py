#!/usr/bin/env python3
"""
Start Next.js server for Social Echo application
"""

import os
import subprocess
import sys

def start_nextjs():
    """Start Next.js in production mode"""
    try:
        print("🚀 Starting Social Echo Next.js server...")
        
        # Change to the app directory
        os.chdir('/home/ubuntu/social-echo')
        
        # Start Next.js server
        result = subprocess.run(['npm', 'start'], check=True)
        
        print("✅ Next.js server started successfully")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Error starting Next.js server: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == '__main__':
    success = start_nextjs()
    sys.exit(0 if success else 1)

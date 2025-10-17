#!/usr/bin/env python3
"""
Simple Flask server to serve the Next.js Social Echo application
"""

import os
import subprocess
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Get the directory of this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

@app.route('/')
def index():
    """Serve the main page"""
    return send_from_directory(BASE_DIR, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files"""
    try:
        return send_from_directory(BASE_DIR, path)
    except:
        # If file not found, serve index.html for client-side routing
        return send_from_directory(BASE_DIR, 'index.html')

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "app": "Social Echo"})

if __name__ == '__main__':
    print("🚀 Starting Social Echo server...")
    print("📁 Serving from:", BASE_DIR)
    
    # Start Next.js in production mode
    try:
        print("🔧 Starting Next.js server...")
        os.chdir(BASE_DIR)
        subprocess.Popen(['npm', 'start'], cwd=BASE_DIR)
        print("✅ Next.js server started")
    except Exception as e:
        print(f"❌ Error starting Next.js: {e}")
    
    # Start Flask server
    app.run(host='0.0.0.0', port=5000, debug=False)

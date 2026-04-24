#!/usr/bin/env python3
"""
MBV Knowledge Check – Local Development Server
Run this script to preview the quiz and admin dashboard locally.

Usage:
  python3 serve.py

Then open:
  Quiz:      http://localhost:8000/quiz/
  Dashboard: http://localhost:8000/admin/dashboard.html
  Email:     http://localhost:8000/email/template.html
"""
import http.server
import socketserver
import os
import webbrowser

PORT = 8000
DIR  = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIR, **kwargs)
    def log_message(self, fmt, *args):
        print(f"  {self.address_string()} → {fmt % args}")

print(f"\n{'='*50}")
print("  MBV Knowledge Check · Local Server")
print(f"{'='*50}")
print(f"\n  Quiz:      http://localhost:{PORT}/quiz/")
print(f"  Dashboard: http://localhost:{PORT}/admin/dashboard.html")
print(f"  Email:     http://localhost:{PORT}/email/template.html")
print(f"\n  Press Ctrl+C to stop\n")

webbrowser.open(f"http://localhost:{PORT}/quiz/")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()

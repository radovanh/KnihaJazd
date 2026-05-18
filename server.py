#!/usr/bin/env python3
"""
Kniha Jazd - Local HTTP Server
Serves the web app and handles data persistence.
Run: python3 server.py
Then open: http://localhost:8765
"""

import http.server
import json
import os
import sys
import webbrowser
from pathlib import Path

PORT = 8765
DATA_FILE = Path(__file__).parent / "data.json"
APP_DIR = Path(__file__).parent


class KnihaJazdHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(APP_DIR), **kwargs)

    def do_GET(self):
        # Serve index.html for root
        if self.path == '/' or self.path == '':
            self.path = '/index.html'
        super().do_GET()

    def do_POST(self):
        if self.path == '/save':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            try:
                data = json.loads(body)
                with open(DATA_FILE, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(b'{"status":"ok"}')
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, fmt, *args):
        # Suppress routine GET request logs, show only errors and saves
        if '"/save"' in fmt % args or 'Error' in (fmt % args):
            print(f"  {fmt % args}")


def main():
    os.chdir(APP_DIR)

    print("=" * 50)
    print("  📋 Kniha Jazd — Local Server")
    print("=" * 50)
    print(f"  📂 Working directory: {APP_DIR}")
    print(f"  💾 Data file: {DATA_FILE}")

    if not DATA_FILE.exists():
        print("  ⚠️  data.json not found — starting with empty data")
        with open(DATA_FILE, 'w') as f:
            json.dump({
                "vehicles": [], "places": [], "routes": [],
                "tripReasons": [], "holidays": [], "trips": [], "fuelLogs": []
            }, f)

    url = f"http://localhost:{PORT}"
    print(f"\n  🌐 Opening: {url}")
    print("  Press Ctrl+C to stop\n")

    try:
        server = http.server.HTTPServer(('localhost', PORT), KnihaJazdHandler)
        webbrowser.open(url)
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  👋 Server stopped.")
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"  ❌ Port {PORT} is already in use.")
            print(f"     Try opening {url} in your browser directly,")
            print(f"     or stop the other process first.")
        else:
            raise


if __name__ == '__main__':
    main()

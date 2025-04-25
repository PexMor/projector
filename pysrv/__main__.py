#!/usr/bin/env python3
# encoding: utf-8
"""Use this instead of `python3 -m http.server` when you need CORS"""

import os
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path


class CORSRequestHandler(SimpleHTTPRequestHandler):
    """Simple HTTP request handler with CORS support."""

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET")
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        return super(CORSRequestHandler, self).end_headers()


if __name__ == "__main__":
    DOCS_DIR = Path(__file__).parent.parent / "docs"

    os.chdir(DOCS_DIR)
    print("Serving HTTP on port 8088 from", DOCS_DIR)
    httpd = HTTPServer(("localhost", 8088), CORSRequestHandler)
    httpd.serve_forever()

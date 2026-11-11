#!/usr/bin/env python3
"""Serveur local de prévisualisation : comme http.server, mais sert /page via page.html
(les URL sans extension que Firebase réécrit en production)."""
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def send_head(self):
        path, sep, query = self.path.partition('?')
        clean = path.rstrip('/')
        if clean and '.' not in os.path.basename(clean):
            if os.path.isfile(os.path.join(ROOT, clean.lstrip('/') + '.html')):
                self.path = clean + '.html' + sep + query
        return super().send_head()


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8877
    ThreadingHTTPServer(('127.0.0.1', port), Handler).serve_forever()

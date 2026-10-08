from http.server import BaseHTTPRequestHandler, HTTPServer
import sys

class SimpleHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        with open("rendered_dom.html", "w", encoding="utf-8") as f:
            f.write(post_data.decode("utf-8"))
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        print("DOM dumped to rendered_dom.html. Exiting.")
        sys.exit(0)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.end_headers()

server = HTTPServer(('localhost', 9999), SimpleHandler)
print("Listening on 9999...")
server.serve_forever()

import http.server
import socketserver
import os
from io import BytesIO

ROOT = "lite"
PORT = 6328


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        super().do_GET()


if __name__ == "__main__":
    os.chdir(ROOT)
    httpd = socketserver.TCPServer(("", PORT), Handler, bind_and_activate=False)
    httpd.allow_reuse_address = True
    httpd.daemon_threads = True

    print(f"Serving AdvantageScope Lite on port {PORT}")
    try:
        httpd.server_bind()
        httpd.server_activate()
        httpd.serve_forever()
    except KeyboardInterrupt:
        httpd.shutdown()
        httpd.server_close()
        print("\nServer stopped")

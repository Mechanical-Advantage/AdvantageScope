import http.server
import mimetypes
import socketserver
import os
import json

import urllib

PORT = 6328
ROOT = "lite"
EXTRA_ASSETS_PATH = os.path.abspath("ascope_assets")
BUNDLED_ASSETS_PATH = os.path.abspath(os.path.join(ROOT, "bundledAssets"))


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Don't serve directly since all assets are available under "/assets"
        if self.path.startswith("/bundledAssets"):
            self.send_error(404, "File not found.")

        # Serve list of asset files
        elif self.path == "/assets" or self.path == "/assets/":
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()

            asset_file_list = {}
            for root in [BUNDLED_ASSETS_PATH, EXTRA_ASSETS_PATH]:
                for dirpath, _, filenames in os.walk(root):
                    for filename in filenames:
                        if not filename.startswith("."):
                            path = os.path.join(dirpath, filename)
                            contents = None
                            if filename == "config.json":
                                try:
                                    contents = json.loads(open(path, "r").read())
                                except:
                                    pass
                            asset_file_list[os.path.relpath(path, root)] = contents

            json_string = json.dumps(asset_file_list, separators=(',', ':'))
            self.wfile.write(json_string.encode('utf-8'))

        # Serve asset files (bundled or extra)
        elif self.path.startswith("/assets"):
            asset_path = urllib.parse.unquote(self.path[(len("/assets") + 1):])
            extra_asset_path = os.path.join(EXTRA_ASSETS_PATH, asset_path)
            bundled_asset_path = os.path.join(BUNDLED_ASSETS_PATH, asset_path)
            for path in [extra_asset_path, bundled_asset_path]:
                if os.path.exists(path) and os.path.isfile(path):
                    try:
                        with open(path, 'rb') as f:
                            self.send_response(200)
                            mimetype, _ = mimetypes.guess_type(path)
                            if mimetype:
                                self.send_header('Content-type', mimetype)
                            self.send_header('Content-length', str(os.path.getsize(path)))
                            self.end_headers()
                            while True:
                                chunk = f.read(4096)
                                if not chunk:
                                    break
                                self.wfile.write(chunk)
                    except Exception as e:
                        self.send_error(500, f"Error serving file: {e}")
                    return
            self.send_error(404, "File not found")

        # Serve everything else
        else:
            super().do_GET()


if __name__ == "__main__":
    # Create extra assets folder
    if not os.path.exists(EXTRA_ASSETS_PATH):
        os.mkdir(EXTRA_ASSETS_PATH)
        print(f"Created folder for extra assets: {EXTRA_ASSETS_PATH}")

    # Start server
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

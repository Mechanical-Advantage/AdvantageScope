# Copyright (c) 2021-2025 Littleton Robotics
# http://github.com/Mechanical-Advantage
#
# Use of this source code is governed by a BSD
# license that can be found in the LICENSE file
# at the root directory of this project.

import http.server
import mimetypes
import socketserver
import os
import sys
import json
import urllib
import gzip

PORT = 5808
ROOT = os.path.abspath("static")
IS_SYSTEMCORE = os.uname().nodename == "robot"
EXTRA_ASSETS_PATH = "/home/systemcore/ascope_assets" if IS_SYSTEMCORE else os.path.abspath("ascope_assets")
BUNDLED_ASSETS_PATH = os.path.join(ROOT, "bundledAssets")
ALLOWED_LOG_SUFFIXES = [".wpilog", ".rlog"]  # Hoot not supported
ENABLE_LOG_DOWNLOADS = IS_SYSTEMCORE or "--enable-logs" in sys.argv
WEBROOT = "/as"


class Handler(http.server.SimpleHTTPRequestHandler):
    def _send_response_with_compression(self, status_code, content_type, source_data):
        """Sends a response, compressing it with gzip if the client supports it."""
        use_gzip = "gzip" in self.headers.get("Accept-Encoding", "")

        if use_gzip:
            data = gzip.compress(source_data)
            content_length = len(data)
        else:
            data = source_data
            content_length = len(source_data)

        self.send_response(status_code)
        self.send_header("Content-type", content_type)
        self.send_header("Content-Length", str(content_length))
        if use_gzip:
            self.send_header("Content-Encoding", "gzip")
        self.end_headers()

        self.wfile.write(data)

    def do_GET(self):
        request = urllib.parse.urlparse(self.path)
        query = urllib.parse.parse_qs(request.query)

        # Don't serve directly since all assets are available under "/assets"
        if request.path.startswith(WEBROOT + "/bundledAssets"):
            self.send_error(404, "File not found.")

        # Serve list of asset files
        elif request.path == WEBROOT + "/assets" or request.path == WEBROOT + "/assets/":
            asset_file_list = {}
            for root in [BUNDLED_ASSETS_PATH, EXTRA_ASSETS_PATH]:
                for dirpath, _, filenames in os.walk(root):
                    for filename in filenames:
                        if not filename.startswith("."):
                            path = os.path.join(dirpath, filename)
                            contents = None
                            if filename == "config.json":
                                try:
                                    with open(path, "r") as f:
                                        contents = json.load(f)
                                except:
                                    pass
                            asset_file_list[os.path.relpath(path, root)] = contents
            json_string = json.dumps(asset_file_list, separators=(',', ':'))
            self._send_response_with_compression(200, "application/json", json_string.encode('utf-8'))

        # Serve asset files (bundled or extra)
        elif request.path.startswith(WEBROOT + "/assets"):
            asset_path = urllib.parse.unquote(self.path[len(WEBROOT + "/assets/"):])
            extra_asset_path = os.path.join(EXTRA_ASSETS_PATH, asset_path)
            bundled_asset_path = os.path.join(BUNDLED_ASSETS_PATH, asset_path)
            for path in [extra_asset_path, bundled_asset_path]:
                if os.path.exists(path) and os.path.isfile(path):
                    try:
                        with open(path, 'rb') as f:
                            file_content = f.read()
                            mimetype, _ = mimetypes.guess_type(path)
                            if not mimetype:
                                mimetype = 'application/octet-stream'
                            self._send_response_with_compression(200, mimetype, file_content)
                    except Exception as e:
                        self.send_error(500, f"Error serving file: {e}")
                    return
            self.send_error(404, "File not found")

        # Serve list of logs
        elif request.path == WEBROOT + "/logs" or request.path == WEBROOT + "/logs/":
            files = []
            if ENABLE_LOG_DOWNLOADS:
                if "folder" in query and len(query["folder"]) > 0:
                    folder_path = query["folder"][0]
                    if not os.path.exists(folder_path) or not os.path.isdir(folder_path):
                        self.send_error(404, "Requested folder does not exist")
                        return
                    for filename in [x for x in os.listdir(folder_path) if not x.startswith(".")]:
                        for suffix in ALLOWED_LOG_SUFFIXES:
                            if filename.endswith(suffix):
                                files.append({
                                    "name": filename,
                                    "size": os.path.getsize(os.path.join(folder_path, filename))
                                })
                                break
            json_string = json.dumps(files, separators=(',', ':'))
            self._send_response_with_compression(200, "application/json", json_string.encode("utf-8"))

        # Serve log file
        elif request.path.startswith(WEBROOT + "/logs"):
            if ENABLE_LOG_DOWNLOADS and "folder" in query and len(query["folder"]) > 0:
                filename = urllib.parse.unquote(request.path[len("/logs/"):])
                if any(filename.endswith(suffix) for suffix in ALLOWED_LOG_SUFFIXES):
                    full_path = os.path.join(query["folder"][0], filename)
                    if os.path.exists(full_path):
                        try:
                            with open(full_path, 'rb') as f:
                                file_content = f.read()
                                self._send_response_with_compression(200, "application/octet-stream", file_content)
                        except Exception as e:
                            self.send_error(500, f"Error serving file: {e}")
                        return
            self.send_error(404, "File not found")

        # Serve everything else
        else:
            filepath = self.translate_path(self.path.removeprefix(WEBROOT))
            if os.path.isdir(filepath):
                index_path = os.path.join(filepath, "index.html")
                if os.path.exists(index_path):
                    filepath = index_path
                else:
                    self.send_error(404, f"File not found: {self.path}")
                    return

            if os.path.exists(filepath) and os.path.isfile(filepath):
                try:
                    with open(filepath, "rb") as f:
                        file_content = f.read()
                        mimetype, _ = mimetypes.guess_type(filepath)
                        if not mimetype:
                            mimetype = "application/octet-stream"
                        self._send_response_with_compression(200, mimetype, file_content)
                except Exception as e:
                    self.send_error(500, f"Error serving file: {e}")
            else:
                self.send_error(404, f"File not found: {self.path}")


if __name__ == "__main__":
    # Create extra assets folder
    if not os.path.exists(EXTRA_ASSETS_PATH):
        os.mkdir(EXTRA_ASSETS_PATH)
        print(f"Created folder for extra assets: {EXTRA_ASSETS_PATH}")

    # Warn if log downloads disabled
    if not ENABLE_LOG_DOWNLOADS:
        print("Log downloads are currently disabled. Pass \"--enable-logs\" to override.\nWARNING: When enabled, AdvantageScope Lite provides unrestricted access to all log files on the host filesystem.\n")

    # Start server
    os.chdir(ROOT)
    httpd = socketserver.ThreadingTCPServer(("", PORT), Handler, bind_and_activate=False)
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

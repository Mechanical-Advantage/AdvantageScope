# Copyright (c) 2021-2026 Littleton Robotics
# http://github.com/Mechanical-Advantage
#
# Use of this source code is governed by a BSD
# license that can be found in the LICENSE file
# at the root directory of this project.

import http.server
import mimetypes
import shutil
import socketserver
import os
import sys
import json
import urllib
import gzip
import zipfile

from multipart import parse_options_header, MultipartParser

PORT = 5808
ROOT = os.path.abspath("static")
IS_SYSTEMCORE = hasattr(os, "uname") and os.uname().nodename == "robot"
EXTRA_ASSETS_PATH = "/home/systemcore/ascope_assets" if IS_SYSTEMCORE else os.path.abspath("ascope_assets")
BUNDLED_ASSETS_PATH = os.path.join(ROOT, "bundledAssets")
ALLOWED_LOG_SUFFIXES = [".wpilog", ".wpilogxz", ".rlog", ".log"]
ENABLE_FILESYSTEM_ACCESS = IS_SYSTEMCORE or "--enable-file-access" in sys.argv
WEBROOT = ""
GZIP_COMPRESS_LEVEL = 6
GZIP_MIN_SIZE = 1024
UNCOMPRESSED_SUFFIXES = (".wpilogxz", ".png")


def _resolve_within(base_dir, *paths):
    """Resolves a path relative to base_dir and returns it only if it stays strictly within base_dir."""
    base_real = os.path.realpath(base_dir)
    target_real = os.path.realpath(os.path.join(base_real, *paths))
    try:
        if target_real != base_real and os.path.commonpath([base_real, target_real]) == base_real:
            return target_real
    except ValueError:
        pass
    return None


class Handler(http.server.SimpleHTTPRequestHandler):
    def _send_response_with_compression(self, status_code, content_type, source_data, allow_gzip=True):
        """Sends a response, compressing it with gzip if appropriate."""
        use_gzip = (
            allow_gzip
            and len(source_data) >= GZIP_MIN_SIZE
            and "gzip" in self.headers.get("Accept-Encoding", "")
        )

        if use_gzip:
            data = gzip.compress(source_data, compresslevel=GZIP_COMPRESS_LEVEL)
        else:
            data = source_data

        self.send_response(status_code)
        self.send_header("Content-type", content_type)
        self.send_header("Content-Length", str(len(data)))
        if use_gzip:
            self.send_header("Content-Encoding", "gzip")
        self.end_headers()

        self.wfile.write(data)

    def _send_file_response(self, status_code, content_type, filepath):
        """Reads and sends a file response."""
        try:
            with open(filepath, "rb") as f:
                file_content = f.read()
        except Exception as e:
            self.send_error(500, f"Error serving file: {e}")
            return

        allow_gzip = not filepath.lower().endswith(UNCOMPRESSED_SUFFIXES)
        self._send_response_with_compression(status_code, content_type, file_content, allow_gzip=allow_gzip)

    def do_GET(self):
        request = urllib.parse.urlparse(self.path)
        query = urllib.parse.parse_qs(request.query)

        # Don't serve directly since all assets are available under "/assets"
        if request.path.startswith(WEBROOT + "/bundledAssets"):
            self.send_error(404, f"File not found: {request.path}")

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
        elif request.path.startswith(WEBROOT + "/assets/"):
            asset_path = urllib.parse.unquote(request.path[len(WEBROOT + "/assets/"):])
            for base_dir in [EXTRA_ASSETS_PATH, BUNDLED_ASSETS_PATH]:
                path = _resolve_within(base_dir, asset_path)
                if path and os.path.isfile(path):
                    mimetype, _ = mimetypes.guess_type(path)
                    if not mimetype:
                        mimetype = 'application/octet-stream'
                    self._send_file_response(200, mimetype, path)
                    return
            self.send_error(404, f"File not found: {request.path}")

        # Serve list of logs
        elif request.path == WEBROOT + "/logs" or request.path == WEBROOT + "/logs/":
            files = []
            if ENABLE_FILESYSTEM_ACCESS:
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
            if ENABLE_FILESYSTEM_ACCESS and "folder" in query and len(query["folder"]) > 0:
                filename = urllib.parse.unquote(request.path[len(WEBROOT + "/logs/"):])
                if any(filename.endswith(suffix) for suffix in ALLOWED_LOG_SUFFIXES):
                    full_path = os.path.join(query["folder"][0], filename)
                    if os.path.exists(full_path):
                        self._send_file_response(200, "application/octet-stream", full_path)
                        return
            self.send_error(404, f"File not found: {request.path}")

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
                mimetype, _ = mimetypes.guess_type(filepath)
                if not mimetype:
                    mimetype = "application/octet-stream"
                self._send_file_response(200, mimetype, filepath)
            else:
                self.send_error(404, f"File not found: {self.path}")

    def do_POST(self):
        request = urllib.parse.urlparse(self.path)
        if request.path.startswith(WEBROOT + "/uploadAsset") & ENABLE_FILESYSTEM_ACCESS:
            content_type, options = parse_options_header(self.headers.get("Content-Type", ""))

            if content_type == "multipart/form-data" and 'boundary' in options:
                stream = self.rfile
                boundary = options["boundary"]
                parser = MultipartParser(stream, boundary, content_length=int(self.headers.get("Content-Length", -1)))

                for part in parser:
                    if part.filename:
                        filename = os.path.basename(part.filename.replace("\\", "/"))
                        if not filename.lower().endswith(".zip"):
                            self.send_response(400, "Uploaded asset must be a zip")
                            self.end_headers()
                            continue

                        stem = filename[:-len(".zip")]
                        temp_path = os.path.join(EXTRA_ASSETS_PATH, "AS_TEMP")
                        asset_zip = _resolve_within(EXTRA_ASSETS_PATH, filename)
                        asset_path = _resolve_within(temp_path, stem) if stem and not filename.startswith(".") else None
                        if not asset_zip or not asset_path:
                            self.send_response(400, "Invalid asset filename")
                            self.end_headers()
                            continue

                        try:
                            part.save_as(asset_zip)
                            with zipfile.ZipFile(asset_zip, "r") as zip_ref:
                                zip_ref.extractall(asset_path)
                            os.remove(asset_zip)

                            # recursively extract .zips
                            for dirpath, _, filenames in os.walk(asset_path):
                                for nested_filename in filenames:
                                    if nested_filename.lower().endswith(".zip") and len(nested_filename) > 4:
                                        nested_zip = os.path.join(dirpath, nested_filename)
                                        nested_dest = _resolve_within(dirpath, nested_filename[:-4])
                                        if nested_dest:
                                            with zipfile.ZipFile(nested_zip, "r") as zip_ref:
                                                zip_ref.extractall(nested_dest)
                                            os.remove(nested_zip)

                            # find config folders
                            for dirpath, _, filenames in os.walk(asset_path):
                                for asset_filename in filenames:
                                    if asset_filename == "config.json":
                                        # recursively copy the parent directory to extra assets, overwriting existing files
                                        dirname = os.path.basename(dirpath)
                                        dest_dir = _resolve_within(EXTRA_ASSETS_PATH, dirname)
                                        if dest_dir and dirname != "AS_TEMP":
                                            shutil.copytree(dirpath, dest_dir, dirs_exist_ok=True)
                        finally:
                            if os.path.exists(asset_zip):
                                os.remove(asset_zip)
                            if os.path.exists(temp_path):
                                shutil.rmtree(temp_path)

                        self.send_response(200)
                        self.end_headers()

                # Free up resources after use
                for part in parser.parts():
                    part.close()
        else:
            self.send_response(404)
            self.end_headers()


if __name__ == "__main__":
    # Create extra assets folder
    if not os.path.exists(EXTRA_ASSETS_PATH):
        os.mkdir(EXTRA_ASSETS_PATH)
        print(f"Created folder for extra assets: {EXTRA_ASSETS_PATH}")

    # Warn if filesystem access disabled
    if not ENABLE_FILESYSTEM_ACCESS:
        print("Log downloads and custom asset uploads are currently disabled. Pass \"--enable-file-access\" to override.\nWARNING: When enabled, AdvantageScope Lite provides unrestricted access to all log files on the host filesystem and upload access to the ascope_assets folder.\n")

    # Start server
    os.chdir(ROOT)
    httpd = socketserver.ThreadingTCPServer(("", PORT), Handler, bind_and_activate=False)
    httpd.allow_reuse_address = True
    httpd.daemon_threads = True
    print(f"Serving AdvantageScope Lite on port {PORT}: http://localhost:{PORT}{WEBROOT}")
    try:
        httpd.server_bind()
        httpd.server_activate()
        httpd.serve_forever()
    except KeyboardInterrupt:
        httpd.shutdown()
        httpd.server_close()
        print("\nServer stopped")

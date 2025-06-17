import http.server
import socketserver
import webbrowser
import json
from pathlib import Path
import os

# 设置服务器端口
PORT = 8100

# 自定义请求处理器，添加 CORS 头
class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 添加 CORS 头，允许跨域请求
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        # 处理 OPTIONS 请求
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        # 处理保存文件的 POST 请求
        if self.path == '/save':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            file_path = os.path.join('usecase', 'cases', data['file'])
            
            # 确保目标目录存在
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            try:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(data['content'])
                self.send_response(200)
                self.end_headers()
                self.wfile.write(b'{"status": "success"}')
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(str(e).encode('utf-8'))
        else:
            super().do_POST()

print(f"启动本地服务器在端口 {PORT}...")
print("请使用浏览器访问: http://localhost:8000")
print("按 Ctrl+C 停止服务器")

# 自动打开浏览器
webbrowser.open(f'http://localhost:{PORT}')

# 启动服务器
with socketserver.TCPServer(("", PORT), CORSRequestHandler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n正在关闭服务器...")
        httpd.shutdown() 
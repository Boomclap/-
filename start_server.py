import http.server
import socketserver
import webbrowser
from pathlib import Path

# 设置服务器端口
PORT = 8000

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
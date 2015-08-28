import SimpleHTTPServer
import SocketServer

PORT=8000

handler = SimpleHTTPServer.SimpleHTTPRequestHandler
http = SocketServer.TCPServer(('', PORT), handler)

print "Serving on port", PORT
http.serve_forever()

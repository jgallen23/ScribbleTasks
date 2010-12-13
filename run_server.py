#!/usr/bin/env python

import string,cgi,time
import sys
import os
from os import curdir, sep
import SimpleHTTPServer
import SocketServer
from jinja2 import Environment, FileSystemLoader
TEMPLATE_DIRS = "www/templates"
env = Environment(loader = FileSystemLoader(TEMPLATE_DIRS))
#import pri
sys.path.append(os.path.join(curdir, "ext/appui/external/uimin"))
import uimin

print uimin.read_config("www/config.yaml")

class MyHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):

    def do_GET(self):
        print self.path
        #TODO: Parse path
        if self.path == "/":
            self.send_response(200)
            self.send_header('Content-type',    'text/html')
            self.end_headers()
            template = env.get_template("index.html")
            debug = True
            #TODO: get debug query string
            if debug:
                appui_path = "ext/appui"
                ui_path = ""
            else:
                appui_path = "ui/scripts"
                ui_path = "ui/scripts"
            data = { 'phonegap': False,
                'debug': debug,
                'appui': uimin.get_output('ext/appui/config.yaml', 'js', 'app.lawnchair', path = appui_path, debug = debug),
                'scribbletasks_ui': uimin.get_output('www/config.yaml', 'js', 'scribbletasks', path = ui_path,  debug = debug),
            }
            self.wfile.write(template.render(**data))
            return
        if not self.path.startswith("/ext"):
            self.path = "/www" + self.path
        SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)
        return


def main():
    try:
        SocketServer.ThreadingTCPServer.allow_reuse_address = True
        server = SocketServer.ThreadingTCPServer(('', 8000), MyHandler)
        print 'started server at http://localhost:8080'
        server.serve_forever()
    except KeyboardInterrupt:
        print '^C received, shutting down server'
        server.socket.close()

if __name__ == '__main__':
    main()



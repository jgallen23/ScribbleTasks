#!/usr/bin/env python

import string,cgi,time
import sys
import os
from os import curdir, sep
import SimpleHTTPServer
import SocketServer
from urlparse import urlparse, parse_qs
from jinja2 import Environment, FileSystemLoader
TEMPLATE_DIRS = "www/templates"
env = Environment(loader = FileSystemLoader(TEMPLATE_DIRS))
#import pri
sys.path.append(os.path.join(curdir, "ext/appui/external/uimin"))
import uimin

def generate_template(debug = False, phonegap = False, remote = ''):
    template = env.get_template("index.html")
    data = {
        'phonegap': phonegap,
        'debug': debug,
        'appui_files': uimin.get_file_list('ext/appui/config.yaml', 'js', 'app.lawnchair', debug = debug),
        'appui_path': "ext/appui" if debug else "ui/scripts",
        'ui_files': uimin.get_file_list('www/config.yaml', 'js', 'scribbletasks', debug = debug),
        'ui_path': '' if debug else 'ui/scripts',
        'phonegap_plugin_files': uimin.get_file_list('www/config.yaml', 'js', 'phonegap_plugins', debug = debug),
        'remote': remote,
    }
    return template.render(**data)


class MyHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):

    def do_GET(self):
        o = urlparse(self.path)
        query = parse_qs(o.query)
        #print query
        if o.path == "/":
            self.send_response(200)
            self.send_header('Content-type',    'text/html')
            self.end_headers()
            debug = query.has_key('debug')
            remote = query['remote'][0] if query.has_key('remote') else ''
            self.wfile.write(generate_template(debug = debug, remote = remote))
            return
        if not self.path.startswith("/ext"):
            self.path = "/www" + self.path
        SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)
        return


def main(args):
    if len(args) >= 2 and args[0] == "generate":
        file = args[1]
        phonegap = True if len(args) == 3 and args[2] == "phonegap" else False
        tmp = generate_template(debug = False, phonegap = phonegap)
        f = open(file, 'w')
        f.write(tmp)
        f.close()
    else:
        try:
            SocketServer.ThreadingTCPServer.allow_reuse_address = True
            server = SocketServer.ThreadingTCPServer(('', 8000), MyHandler)
            print 'started server at http://localhost:8080'
            server.serve_forever()
        except KeyboardInterrupt:
            print '^C received, shutting down server'
            server.socket.close()

if __name__ == '__main__':
    main(sys.argv[1:])



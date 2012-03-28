from bottle import route, run, static_file, response, request
import signature_panel
import os, binascii

@route('/')
def index():
    return static_file('index.html', root='public')

@route('/signatures/<filename>')
def get_signature_file(filename):
    return static_file(filename, root='signatures')

@route('/process-signature', method='POST')
def process_signature():
    image = signature_panel.generate_image(request.body.read())
    filename = 'signatures/img-' + binascii.b2a_hex(os.urandom(16)) + '.png'

    # This returns an Image object, which you can save to a file, stream to a database, or manipulate further.
    image.save(filename)
    response.content_type = 'text; charset=utf-8'
    return '/' + filename

@route('/<filename>')
def signature(filename):
    return static_file(filename, root='public')

run(host='localhost', port=8080)
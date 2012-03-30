#! /bin/sh

# copies the canonical source files to the various example directories

cp jquery.signature-panel.js server-image-generators/ruby/example/public
cp jquery.signature-panel.js server-image-generators/python/example/public
cp jquery.signature-panel.js server-image-generators/php/example

cp jquery.signature-panel.css server-image-generators/ruby/example/public
cp jquery.signature-panel.css server-image-generators/python/example/public
cp jquery.signature-panel.css server-image-generators/php/example

cp external/excanvas.compiled.js server-image-generators/ruby/example/public
cp external/excanvas.compiled.js server-image-generators/python/example/public
cp external/excanvas.compiled.js server-image-generators/php/example

cp external/jquery-1.4.4.min.js server-image-generators/ruby/example/public
cp external/jquery-1.4.4.min.js server-image-generators/python/example/public
cp external/jquery-1.4.4.min.js server-image-generators/php/example

cp server-image-generators/ruby/signature-panel.rb server-image-generators/ruby/example

cp server-image-generators/python/signature_panel.py server-image-generators/python/example

cp server-image-generators/php/signature_panel.php server-image-generators/php/example

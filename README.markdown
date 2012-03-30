# SignaturePanel

SignaturePanel is a jQuery plugin that enables you to capture signatures and display them later. It works on the iPad, iPhone, and most common desktop browsers.

SignaturePanel doesn't just capture how the signature appears. It also captures the timing of each gesture so that you have the information you need to replay the signature in real time. By capturing this information, it provides stronger evidence that the signature is genuine.

In addition to the jQuery plugin, SignaturePanel also includes optional server-side libraries that you can use to generate image files from the raw signature data.

## Compatibility

SignaturePanel has been tested in the following browsers:

* IE 6, 7, 8 (requires [ExplorerCanvas](http://code.google.com/p/explorercanvas/))
* IE 9
* Firefox 3.6+
* Safari (OSX)
* Safari (iOS 4+)
* Chrome

SignaturePanel has been tested with jQuery 1.4.4 and later. Earlier versions are likely to work as well but have not been tested.

The optional server-side code to generate images has been tested in the following languages (note that many other versions--both earlier and later--are likely to work as well).:

* Ruby 1.8.7
* Python 2.7.1
* PHP 5.3.6

## Getting Started

The easiest way to get started is with a basic example. This example shows how to capture a signature and display it elsewhere. It optionally loads ExplorerCanvas so that it works in older versions of IE that don't support the HTML5 canvas.

You can find this code at /examples/signature-panel-start.html

    <!DOCTYPE html>
    <html>
    <head>
        <title>SignaturePanel - Getting Started</title>
        <!--[if lt IE 9]><script type="text/javascript" src="../external/excanvas.compiled.js"></script><![endif]-->
        <script type="text/javascript" src="../external/jquery-1.4.4.min.js"></script>
        <script type="text/javascript" src="../jquery.signature-panel.js"></script>
        <link rel="stylesheet" type="text/css" href="../jquery.signature-panel.css" />

        <script type="text/javascript">

            function signatureOK(signatureData) {
                // Show the user the signature they've entered.
                $("#my-target").signaturePanel("drawClickstreamToCanvas", signatureData);
                $("#my-panel").signaturePanel("clear");
            }

            function signatureCancel() {
                alert("The user clicked Cancel.");
            }

            $(document).ready(function() {
                $("#my-panel").signaturePanel({
                    okCallback: signatureOK,
                    cancelCallback: signatureCancel
                });
            });

        </script>

    </head>
    <body>
        <h1>Sign your name below</h1>
        <div id="my-panel" style="width: 500px; height: 300px; border: 10px solid gray"></div>
        <h2>Here's what you signed</h2>
        <canvas id="my-target" height="100" width="250" style="border: 1px solid gray;" ></canvas>
    </body>
    </html>

## Styling SignaturePanel

SignaturePanel comes with two built-in styles: a minimal style that inherits most attributes from the page around it and an iPad style that follows the iPad's visual conventions. SignaturePanel uses minimal markup for its controls so that it is easy to add your own styles to integrate it into your application.

### Using the minimal style

To use the minimal style, all you need to do is include `jquery.signature-panel.css` in your header. This is also a good starting point to use as the basis for your own styles. All styling is optional; SignaurePanel does not depend on the presence of its css file, so you don't need to include it if you're creating your own styles.

### Using the iPad style

Using the iPad style is also straightforward:

* Include `jquery.signature-panel.css` in your header
* Add the class `signature-panel-ipad` to your SignaturePanel `div`
* When initializing the SignaturePanel, set all the `ElementType` properties to `"link"` and set `controlBarHeight: 42`

Here's an example of how to use the iPad style (you can find this code at /examples/signature-panel-styling.html):

    <!DOCTYPE html>
    <html>
    <head>
        <title>SignaturePanel - iPad Styling</title>
        <!--[if lt IE 9]><script type="text/javascript" src="../external/excanvas.compiled.js"></script><![endif]-->
        <script type="text/javascript" src="../external/jquery-1.4.4.min.js"></script>
        <script type="text/javascript" src="../jquery.signature-panel.js"></script>
        <link rel="stylesheet" type="text/css" href="../jquery.signature-panel.css" />

        <script type="text/javascript">

            function signatureOK(signatureData) {
                alert("You clicked OK.")
            }

            $(document).ready(function() {
                $("#my-panel").signaturePanel({
                    okCallback: signatureOK,
                    okElementType: "link",
                    cancelElementType: "link",
                    clearElementType: "link",
                    controlBarHeight: 42
                });
            });

        </script>

    </head>
    <body>
        <h1>Signature Panel Test</h1>
        <h2>Write your signature below</h2>
        <div class="signature-panel-ipad" id="my-panel" style="width: 500px; height: 300px; border: 1px solid gray"></div>
    </body>
    </html>

### Using your own styles

The visual display of the control is governed by a combination of settings and CSS. The control's settings determine the height of the control bar at the bottom, whether each control is a link or a button, and what their captions should be. By default, the control bar is 30 pixels high, OK is a button, and the other controls are links. All other styling is controlled by CSS.

Each element has a class applied so that it's easy to override with CSS. The easiest way to see how everything works is to look at the iPad style in `jquery.signature-panel.css`, which illustrates most of the elements you're likely to need.

Here's the basic structure of the HTML that SignaturePanel generates:

    <div>
        <div class="signature-panel-wrapper">
            <canvas>...</canvas>
            <div class="signature-panel-control"> <!-- Height comes from the controlBarHeight property -->
                <!-- These can be buttons or links depending on the [clear|ok|cancel]ElementType properties -->
                <a class="signature-panel-clear">...</a>
                <button type="button" class="signature-panel-ok">...</button>>
                <a class="signature-panel-cancel">...</a>
            </div>
        </div>
    </div>

## Dynamically creating and destroying SignaturePanel

SignaturePanel is designed to be well-behaved when it is dynamically added and removed from a page. To ensure that SignaturePanel releases its event handlers and cleans up resources, be sure to call `destroy` when you remove it.

## Configurable options

SignaturePanel has a handful of options to configure its appearance and behavior. You pass these options as an argument when you initialize the SignaturePanel.

* __penColor__ (HTML color string; default: "#191970"): the HTML color of the drawing pen
* __penWidth__ (float; default: 3.0): the width of the drawing pen in pixels
* __controlBarHeight__ (integer; default: 30): the height of the control bar in pixels
* __clearCaption__ (string; default: "Clear"): The caption of the _Clear_ button/link
* __clearElementType__ (string: `"button"` or `"link"`; default `"button"`): the type of HTML element to use for _Clear_ (either a button or hyperlink)
* __okCaption__ (string; default: "OK"): The caption of the _OK_ button/link
* __okElementType__ (string: `"button"` or `"link"`; default `"button"`): the type of HTML element to use for _OK_ (either a button or hyperlink)
* __okCallback__ (function): the function to call when the user clicks _OK_. Takes one argument representing the signature data. See the Signature data section below
* __cancelCaption__ (string; default: "Cancel"): The caption of the _Cancel_ button/link
* __cancelElementType__ (string: `"button"` or `"link"`; default `"link"`): the type of HTML element to use for _Cancel_ (either a button or hyperlink)
* __cancelCallback__ (function): the function to call when the user clicks _Cancel_

## Signature data format

SignaturePanel produces a single JavaScript object that provides all the information necessary to reproduce the signature

* __dataVersion__ (integer): version of SignatureData. This will be updated whenever the format of this object changes.
* __canvasWidth__ (float): initial width of the SignaturePanel drawing canvas in pixels
* __canvasHeight__ (float): initial height of the SignaturePanel drawing canvas in pixels
* __penColor__ (string): HTML color value of the pen
* __penWidth__ (float): width of the pen in pixels
* __clickstream__ (array of objects): actual signature data. Each entry has the following:
    * __x__ (float): x coordinate of the event. 0 <= x <= canvasWidth
    * __y__ (float): y coordinate of the event. 0 <= y <= canvasHeight
    * __t__ (float): time of the event in milliseconds relative to the start of the drawing. The first event is always at t=0.
    * __action__ (string): which kind of action this event represents. Possible values are:
        * _gestureStart_: the user has begun to draw a gesture (a signature can contain multiple gestures). There is no an action that explicitly marks the end of a gesture. You will simply receive another gestureStart to indicate that a new gesture is beginning.
        * _gestureContinue_: the user has added a point to the gesture. In other words, the user is actively drawing
        * _gestureSuspend_: the user is actively drawing, but they have gone outside the boundary of the canvas. This gives the linearly interpolated position where the boundary crossing occurred
        * _gestureResume_: the user has continued actively drawing and has re-entered the canvas. This gives the linearly interpolated position where the boundary crossing occurred. Since the user may stop drawing while outside the canvas, you are not guaranteed to get a gestureResume after every gestureSuspend.

## Generating image files on a server

SignaturePanel includes code that you can run on your server to generate image files from the signature data captured on the client.

By default, the function will generate an image with the same pixel measurements as were originally captured on the client. You can also specify the size of the generated image, and SignaturePanel will scale the signature appropriately to fit within these bounds.

### Ruby

The Ruby library uses ImageMagick to generate a `Magick::Image` object, which you can use to write image files or stream the data in a variety of formats (PNG, JPEG, etc.).

To generate the image, you will write code like this:

    require 'signature-panel.rb'
    ...

    post '/process-signature' do
        image = SignaturePanel::GenerateImage(request.body.read)
        filename = 'latest-signature.png'

        image.write(filename)

        # If you want to stream your PNG directly to a database instead of saving a file,
        # you can get a binary stream like this:
        # image.to_blob {self.format = "PNG"}

        content_type :text

        # Send the name of the newly-generated file to the client
        body filename
    end

You can find a full working example (written for the [Sinatra microframework](http://www.sinatrarb.com) at /server-image-generators/ruby/example. The SignaturePanel function will work equally well in Ruby on Rails (and presumably any other Ruby web framework).


### Python

The Python library uses PIL to generate an `Image` object, which you can use to write image files or stream the data in a variety of formats (PNG, JPEG, etc.).

To generate the image, you will write code like this:

    import signature_panel

    ...

    @route('/process-signature', method='POST')
    def process_signature():
        image = signature_panel.generate_image(request.body.read())
        filename = 'latest-signature.png'

        # Since this is an Image object, you can save it to a file, stream it to a database, or manipulate it further.

        image.save(filename)
        response.content_type = 'text; charset=utf-8'

        # Send the name of the newly-generated file to the client
        return filename

You can find a full working example (written for the [Bottle microframework](http://bottlepy.org) at /server-image-generators/python/example. The SignaturePanel function should work equally well in other Python web frameworks as well.

### PHP

The PHP library uses GD to generate an image object, which you can use to write image files or stream the data in a variety of formats (PNG, JPEG, etc.).

To generate the image, you will write code like this:

    <?php
    require_once "signature_panel.php";
    $jsonData = file_get_contents('php://input');
    $image = generate_signature_panel_image($jsonData);

    $filename = "latest-signature.png";

    # Since this is an Image object, you can save it to a file, stream it to a database, or manipulate it further.
    imagepng($image, $filename);

    # Send the name of the newly-generated file to the client
    echo $filename;
    ?>

You can find a full working example at /server-image-generators/php/example.

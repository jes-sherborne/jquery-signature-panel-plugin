# SignaturePanel

A jquery-based panel to capture signatures. Compatible with iPad.

## Compatibility

SignaturePanel has been tested in the following browsers:

* IE 6, 7, 8, 9
* Firefox 3.6+
* Safari (OSX)
* Safari (iOS 4+)
* Chrome

## Getting Started

The easiest way to get started is by example. This page shows how to capture a signature and display it elsewhere. It also optionally loads ExplorerCanvas to so that it works in older versions of IE that don't support the HTML5 canvas.

    <!DOCTYPE html>
    <html>
    <head>
        <title>Signature Panel Test</title>
        <!--[if lt IE 9]><script src="external/excanvas.js"></script><![endif]-->
        <script type="text/javascript" src="external/jquery-1.4.4.js"></script>
        <script type="text/javascript" src="jquery.signature-panel.js"></script>
        <link rel="stylesheet" type="text/css" href="jquery.signature-panel.css" />

        <script type="text/javascript">

            function signatureOK(signatureData) {
                // Show the user the signature they've entered.
                $("#signature-target").signaturePanel("drawClickstreamToCanvas", signatureData);
            }

            function signatureCancel() {
                alert("The user clicked Cancel.");
            }

            $(document).ready(function() {
                $("#signature-panel-1").signaturePanel({
                    okCallback: signatureOK,
                    cancelCallback: signatureCancel
                });
            });

        </script>

    </head>
    <body>
        <h1>Signature Panel Test</h1>
        <h2>Write your signature below</h2>
        <div id="signature-panel-1" style="width: 500px; height: 300px; border: 10px solid gray"></div>
        <h3>Here's what you signed</h3>
        <canvas id="signature-target" height="100px" width="250px" style="border: 1px solid gray;" ></canvas>
    </body>
    </html>
    
## Using the built-in styles

SignaturePanel comes with two built-in styles: a minimal style that inherits most attributes from the page around it and an iPad style that follows the iPad's visual conventions

To use the minimal style, all you need to do is include `jquery.signature-panel.css` in your header. This is also a good starting point to use as the basis for your own styles.

Using the iPad style is also straightforward:

* Include `jquery.signature-panel.css` in your header
* Add the class `signature-panel-ipad` to your signature panel `div`
* When initializing the SignaturePanel, set all the `ElementType` properties to `"link"` and set `controlBarHeight: 42`

Here's an example of how to use the iPad style:

    <!DOCTYPE html>
    <html>
    <head>
        <title>Signature Panel Test</title>
        <!--[if lt IE 9]><script src="external/excanvas.js"></script><![endif]-->
        <script type="text/javascript" src="external/jquery-1.4.4.js"></script>
        <script type="text/javascript" src="jquery.signature-panel.js"></script>
        <link rel="stylesheet" type="text/css" href="jquery.signature-panel.css" />

        <script type="text/javascript">

            function signatureOK(signatureData) {
                alert("You clicked OK.")
            }

            $(document).ready(function() {
                $("#signature-panel-1").signaturePanel({
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
        <div class="signature-panel-ipad" id="signature-panel-1" style="width: 500px; height: 300px; border: 1px solid gray"></div>
    </body>
    </html>

## Using your own styles

SignaturePanel uses minimal markup for its controls so that it is easy to style it to integrate into your application. The control's settings determine the height of the control bar at the bottom, whether each control is a link or a button, and what their captions should be. By default, the control bar is 30 pixels high, OK is a button, and the other controls are links.

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


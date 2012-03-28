<?php
function generate_signature_panel_image($jsonData, $sizeX = 0, $sizeY = 0) {
    if ($sizeX < 0) {
        throw new InvalidArgumentException("$sizeX must be >= 0");
    }
    if ($sizeY < 0) {
        throw new InvalidArgumentException("$sizeY must be >= 0");
    }

    $data = json_decode($jsonData);

    if ($data->dataVersion != 1) {
        throw new Exception("Unsupported data version");
    }
    if ($data->canvasWidth <= 0) {
        throw new Exception("Invalid canvasWidth");
    }
    if ($data->canvasHeight <= 0) {
        throw new Exception("Invalid canvasHeight");
    }
    if ($sizeX == 0 || $sizeY == 0) {
        $sizeX = $data->canvasWidth;
        $sizeY = $data->canvasHeight;
    }

    $scalingFactor = min($sizeX / $data->canvasWidth, $sizeY / $data->canvasHeight);
    $penColor = $data->penColor;
    $penWidth = max($data->penWidth * $scalingFactor, 1);

    $polylines = array();
    $iPolyline = -1;
    $x = 0;
    $y = 0;

    foreach ($data->clickstream as $event) {
        $x = $event->x * $scalingFactor;
        $y = $event->y * $scalingFactor;
        switch ($event->action) {
            case "gestureStart":
            case "gestureResume":
                $iPolyline += 1;
                $polylines[$iPolyline] = array($x, $y);
                break;
            case "gestureContinue":
            case "gestureSuspend":
                if ($iPolyline >= 0) {
                    $polylines[$iPolyline][] = $x;
                    $polylines[$iPolyline][] = $y;
                }
                break;
        }
    }

    return draw_upsampled_polyline($sizeX, $sizeY, $penColor, $penWidth, $polylines);
}


function draw_upsampled_polyline($sizeX, $sizeY, $penColor, $penWidth, $polylines, $upsampleFactor=4) {
    /* GD lacks three things that we need to make the generated image match what the user saw
        * antialiased lines
        * round endcaps on lines
        * round mitred joins between lines

    We emulate antialising by drawing at a larger size (given by the upsample factor) and scaling down
    We emulate the endcaps and mitres by drawing circles at each vertex point.

    As an alternative, you could use a different library (e.g., ImageMagick) that handles these features natively.
    The emulation approach is attractive because GD is nearly ubiquitous whereas alternative graphic libraries
    are less common. */

    $image = imagecreatetruecolor($sizeX * $upsampleFactor, $sizeY * $upsampleFactor);
    imagealphablending($image, false);
    $transparentColor = imagecolorallocatealpha($image, 255, 255, 255, 0);
    imagefilledrectangle($image, 0, 0, $sizeX * $upsampleFactor, $sizeY * $upsampleFactor, $transparentColor);
    imagecolordeallocate($image, $transparentColor);
    imagealphablending($image, true);
    $penColorArray = rgbfromhtmlcolor($penColor);
    $imagePenColor = imagecolorallocate($image, $penColorArray[0], $penColorArray[1], $penColorArray[2]);

    if (count($polylines) > 0) {
        $p = $upsampleFactor * $penWidth / 2;
        $x1 = $upsampleFactor * $polylines[0][0];
        $y1 = $upsampleFactor * $polylines[0][1];
        imagefilledellipse($image, $x1, $y1, $p * 2, $p * 2, $imagePenColor);
        foreach ($polylines as $polyline) {
            for ($i = 0; $i < count($polyline) - 4; $i += 2) {
                $x1 = $upsampleFactor * $polyline[$i];
                $y1 = $upsampleFactor * $polyline[$i + 1];
                $x2 = $upsampleFactor * $polyline[$i + 2];
                $y2 = $upsampleFactor * $polyline[$i + 3];
                $dx = $x2 - $x1;
                $dy = $y2 - $y1;
                $d = hypot($dx, $dy);
                if ($d > 0) {
                    $s = $p / $d;
                    $newPoly = Array($x1 - $s * $dy, $y1 + $s * $dx,
                                     $x2 - $s * $dy, $y2 + $s * $dx,
                                     $x2 + $s * $dy, $y2 - $s * $dx,
                                     $x1 + $s * $dy, $y1 - $s * $dx);
                    imagefilledpolygon($image, $newPoly, 4, $imagePenColor);
                    imagefilledellipse($image, $x2, $y2, $p * 2, $p * 2, $imagePenColor);
                }
            }
        }
    }

    $resizedImage = imagecreatetruecolor($sizeX, $sizeY);
    imagealphablending($resizedImage, true);

    imagecopyresampled($resizedImage, $image, 0, 0, 0, 0, $sizeX, $sizeY, $sizeX * $upsampleFactor, $sizeY * $upsampleFactor);
    imagedestroy($image);

    return $resizedImage;
}

function rgbfromhtmlcolor($color) {
    if ($color[0] === '#') {
        $color = substr($color, 1);
    }

    if (strlen($color) === 6) {
        $rgb = array(hexdec($color[0].$color[1]), hexdec($color[2].$color[3]), hexdec($color[4].$color[5]));
    } elseif (strlen($color) === 3) {
        $rgb = array(hexdec($color[0].$color[0]), hexdec($color[1].$color[1]), hexdec($color[2].$color[2]));
    } else {
        $rgb = array(0, 0, 0);
    }

    return $rgb;
}

?>
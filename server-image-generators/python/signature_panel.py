import json
import Image, ImageDraw, math

def generate_image(jsonData, sizeX=0, sizeY=0):
    """Parses the JSON data from signature-panel to produce a bitmap image"""

    if sizeX < 0:
        raise ValueError("sizeX must be >= 0")
    if sizeY < 0:
        raise ValueError("sizeY must be >= 0")

    data = json.loads(jsonData)

    if data["dataVersion"] != 1:
        raise ValueError("Unsupported data version")
    if data["canvasWidth"] <= 0:
        raise ValueError("Invalid canvasWidth")
    if data["canvasHeight"] <= 0:
        raise ValueError("Invalid canvasHeight")

    if (sizeX == 0 or sizeY == 0):
        sizeX = data["canvasWidth"]
        sizeY = data["canvasHeight"]

    scalingFactor = min([
        sizeX / float(data["canvasWidth"]), 
        sizeY / float(data["canvasHeight"])])
    penColor = data["penColor"]
    penWidth = max([data["penWidth"] * scalingFactor, 1])

    polylines = []

    for event in data["clickstream"]:
        pt = (event["x"] * scalingFactor, event["y"] * scalingFactor)
        if event["action"] in ["gestureStart", "gestureResume"]:
            polylines.append([pt])
        elif event["action"] in ["gestureContinue", "gestureSuspend"]:
            if polylines:
                polylines[-1].append(pt)

    return draw_upsampled_polyline(sizeX, sizeY, penColor, penWidth, polylines)


def draw_upsampled_polyline(sizeX, sizeY, penColor, penWidth, polylines, upsampleFactor=4):
    # PIL lacks three things that we need to make the generated image match what the user saw
    #     * antialiased lines
    #     * round endcaps on lines
    #     * round mitred joins between lines
    #
    # We emulate antialising by drawing at a larger size (given by the upsample factor) and scaling down
    # We emulate the endcaps and mitres by drawing circles at each vertex point.
    #
    # As an alternative, you could use a different library (e.g., ImageMagick) that handles these features natively.
    # The emulation approach is attractive because PIL is nearly ubiquitous whereas alternative graphic libraries
    # are less common.

    def upsample(pt):
        return (upsampleFactor * pt[0], upsampleFactor * pt[1])

    image = Image.new("RGBA", upsample((sizeX, sizeY)), (0, 0, 0, 0))
    drawing = ImageDraw.Draw(image)

    if len(polylines) > 0:
        p = upsampleFactor * penWidth / 2
        x1, y1 = upsample(polylines[0][0])
        drawing.ellipse((x1 - p, y1 - p, x1 + p, y1 + p), fill=penColor)
        for polyline in polylines:
            for i in xrange(0, len(polyline) - 1):
                x1, y1 = upsample(polyline[i])
                x2, y2 = upsample(polyline[i + 1])
                dx = x2 - x1
                dy = y2 - y1
                d = math.sqrt(dx * dx + dy * dy)
                if d > 0:
                    s = p / d
                    newPoly = [x1 - s * dy, y1 + s * dx, x2 - s * dy, y2 + s * dx, x2 + s * dy, y2 - s * dx, x1 + s * dy, y1 - s * dx]
                    drawing.polygon(newPoly, fill=penColor)
                    drawing.ellipse((x2 - p, y2 - p, x2 + p, y2 + p), fill=penColor)

    return image.resize((sizeX, sizeY), Image.ANTIALIAS)

require 'json'
require 'RMagick'

module SignaturePanel
    def SignaturePanel.GenerateImage(jsonData, sizeX=0, sizeY=0)
        raise ArgumentError, "sizeX must be >= 0" if sizeX < 0
        raise ArgumentError, "sizeY must be >= 0" if sizeY < 0

        data = JSON.parse(jsonData)

        raise "Unsupported data version" unless data["dataVersion"] == 1
        raise "Invalid canvasWidth" if data["canvasWidth"] <= 0
        raise "Invalid canvasHeight" if data["canvasHeight"] <= 0

        if (sizeX == 0 || sizeY == 0)
            sizeX = data["canvasWidth"]
            sizeY = data["canvasHeight"]
        end

        scalingFactor = [sizeX / data["canvasWidth"], sizeY / data["canvasHeight"]].min
        penWidth = [data["penWidth"] * scalingFactor, 1].max
        penColor = data["penColor"]

        polylines = []
        iPolyline = -1
        x = 0
        y = 0

        clickstream = data["clickstream"]

        for i in 0...clickstream.length
            x = clickstream[i]["x"] * scalingFactor
            y = clickstream[i]["y"] * scalingFactor
            case clickstream[i]["action"]
                when "gestureStart", "gestureResume"
                    iPolyline += 1;
                    polylines[iPolyline] = [x, y]
                when "gestureContinue"
                    polylines[iPolyline].concat([x, y]) if iPolyline >= 0
                when "gestureSuspend"
                    polylines[iPolyline].concat([x, y]) if iPolyline >= 0
            end
        end

        image = Magick::Image.new(sizeX, sizeY)
        drawing = Magick::Draw.new()

        drawing.stroke_width(penWidth)
        drawing.stroke(penColor)
        drawing.fill_opacity(0)
        drawing.stroke_linecap("round")
        drawing.stroke_linejoin("round")

        for i in 0...polylines.length
            drawing.polyline(*polylines[i])
        end

        drawing.draw(image)
        return image
    end
end

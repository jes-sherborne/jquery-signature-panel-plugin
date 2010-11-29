(function($) {

	var settings = {
		"penColor": "black",
		"penWidth": 3.0,
		"clearCaption": "Clear",
		"okCaption": "OK",
		"cancelCaption": "Cancel",
		"drawPrompt": "Sign here using your mouse or touchscreen",
		"backColor" : "white",
		"borderColor": "gray"
	};

	var state = {
		x : 0,
		y : 0,
		drawing : false,
		startTime : 0
	};

	var internal = {
		getPanelHtml : function ($parentDiv){
			var r = [];

			r.push("<canvas height=\"" + ($parentDiv.height() - 40) + "px\" width=\"" + ($parentDiv.width() + 0.0) + "px\"></canvas>");
			r.push("<div style=\"height: 40px; padding: 2px 6px 2px 6px;\">");
			r.push("<a href=\"#\" class=\"signature-panel-clear\">Clear</a>");
			r.push("</div>");
			return r.join("\n");
		},
		clearCanvas : function ($canvas, context) {
			var canvas = $canvas[0];

			context.save();
			context.closePath();
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.restore();

		},
		processEventLocation : function(event, canvas) {
			var x, y;

			if (event.originalEvent.touches) {
				x = event.originalEvent.touches[0].pageX - canvas.offsetLeft;
				y = event.originalEvent.touches[0].pageY - canvas.offsetTop;
			} else {
				x = event.pageX - canvas.offsetLeft;
				y = event.pageY - canvas.offsetTop;
			}

			return {x: x, y: y};
		}
	};

	var methods = {
		init : function(options) {

			return this.each(function() {
				var $this, data, $canvas, context;

				$this = $(this);

				// Attach data storage to this object
				if (! $this.data("signaturePanel")) {
					$this.data("signaturePanel", {
						clickstream : []
					});
				}
				data = $this.data("signaturePanel");

				// Apply user-supplied options
				if (options) {
					$.extend(settings, options);
				}

				// Create user interface elements
				$this.empty();
				$this.append(internal.getPanelHtml($this));

				$canvas = $this.find("canvas");
				context = $canvas[0].getContext('2d');

				context.lineWidth = settings.penWidth;
				context.strokeStyle = settings.penColor;
				context.fillStyle = "none";

				// Attach event handlers

				$this.find("a.signature-panel-clear").bind("click.signaturePanel", function () {
					internal.clearCanvas($canvas, context);
				});

				$canvas.bind("mousedown.signaturePanel touchstart.signaturePanel", function (event) {
					var location, t;

					t= (new Date).getTime - state.startTime;
					event.preventDefault();
					location = internal.processEventLocation(event, $canvas[0]);
					state.startTime = t;
					state.x = location.x;
					state.y = location.y;
					state.drawing = true;
					context.beginPath();
					context.moveTo(location.x, location.y);
					data.clickstream.push({x: state.x, y: state.y, t: 0, action: "mousedown"});
				});

				$(document).bind("mousemove.signaturePanel touchmove.signaturePanel", function (event) {
					var location, t;

					t= (new Date).getTime - state.startTime;
					if (state.drawing) {
						event.preventDefault();
						location = internal.processEventLocation(event, $canvas[0]);
						context.lineTo(location.x, location.y);
						context.stroke();
						state.x = location.x;
						state.y = location.y;
						data.clickstream.push({x: state.x, y: state.y, t: t, action: "mousemove"});
					}
				});

				$(document).bind("mouseup.signaturePanel touchend.signaturePanel touchcancel.signaturePanel", function (event) {
					if (state.drawing) {
						event.preventDefault();
						context.closePath();
						state.drawing = false;
					}
				});

			});
		},

		destroy : function() {

			return this.each(function() {
				var $this, data, $canvas;

				$this = $(this);
				data = $this.data("signaturePanel");
				$canvas = $this.find("canvas");

				$canvas.unbind(".signaturePanel");
				$(document).unbind(".signaturePanel");

				data.signaturePanel.remove();
				$this.removeData("signaturePanel");
			})
		},

		clear : function() {
			return this.each(function() {
				var $canvas, context;

				$canvas = $this.find("canvas");
				context = $canvas[0].getContext('2d');

				internal.clearCanvas($canvas, context);

			})
		}

	};

	$.fn.signaturePanel = function(method) {

		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === "object" || ! method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error("Method " + method + " does not exist on jQuery.signaturePanel");
		}

	};

})(jQuery);

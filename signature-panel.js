(function($) {

	var settings = {
		"penColor": "black",
		"penWidth": 3.0,
		"clearCaption": "Clear",
		"okCaption": "OK",
		"cancelCaption": "Cancel",
		"okFunction": {},
		"cancelFunction": {}
	};

	var internal = {
		getPanelHtml : function ($parentDiv){
			var r = [];

			r.push("<canvas height=\"" + ($parentDiv.height() - 40) + "px\" width=\"" + ($parentDiv.width() + 0.0) + "px\"></canvas>");
			r.push("<div style=\"height: 40px; padding: 2px 6px 2px 6px;\">");
				r.push("<a href=\"#\" class=\"signature-panel-clear\">" + settings.clearCaption + "</a>");
				r.push("<div style=\"float: right\">");
					r.push("<a href=\"#\" class=\"signature-panel-cancel\">" + settings.cancelCaption + "</a>");
					r.push("<button type=\"button\" class=\"signature-panel-ok\">" + settings.okCaption + "</a>");
				r.push("</div>");
			r.push("</div>");
			return r.join("\n");
		},
		clearCanvas : function ($canvas, context) {
			context.save();
			context.closePath();
			context.clearRect(0, 0, $canvas[0].width, $canvas[0].height);
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
						clickstream: [],
						startTime: 0,
						drawing: false
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
				context.lineCap = "round";
				context.lineJoin = "round";
				context.fillStyle = "none";

				// Attach event handlers

				$this.find("a.signature-panel-clear").bind("click.signaturePanel", function () {
					internal.clearCanvas($canvas, context);
				});

				$this.find("a.signature-panel-cancel").bind("click.signaturePanel", function () {
					internal.clearCanvas($canvas, context);
					if (data.cancelFunction) {
						data.cancelFunction();
					}
				});

				$this.find("button.signature-panel-ok").bind("click.signaturePanel", function () {
					internal.clearCanvas($canvas, context);
					if (data.okFunction) {
						data.okFunction(data.clickstream);
					}
				});

				$canvas.bind("mousedown.signaturePanel touchstart.signaturePanel", function (event) {
					var location, t;

					t= (new Date).getTime - data.startTime;
					event.preventDefault();
					location = internal.processEventLocation(event, $canvas[0]);
					data.startTime = t;
					data.drawing = true;
					context.beginPath();
					context.moveTo(location.x, location.y);
					data.clickstream.push({x: location.x, y: location.y, t: 0, action: "gestureStart"});
				});

				$(document).bind("mousemove.signaturePanel touchmove.signaturePanel", function (event) {
					var location, t;

					t= (new Date).getTime - data.startTime;
					if (data.drawing) {
						event.preventDefault();
						location = internal.processEventLocation(event, $canvas[0]);
						context.lineTo(location.x, location.y);
						context.stroke();
						data.clickstream.push({x: location.x, y: location.y, t: t, action: "gestureContinue"});
					}
				});

				$(document).bind("mouseup.signaturePanel touchend.signaturePanel touchcancel.signaturePanel", function (event) {
					if (data.drawing) {
						event.preventDefault();
						context.closePath();
						data.drawing = false;
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

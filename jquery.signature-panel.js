(function($) {

	var defaults = {
		"penColor": "#191970",
		"penWidth": 3.0,
		"clearCaption": "Clear",
		"okCaption": "OK",
		"cancelCaption": "Cancel",
		"okFunction": null,
		"cancelFunction": null
	};

	var internal = {
		getPanelHtml : function (settings, $parentDiv){
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
		clearHtmlCanvas : function (canvas, context) {
			context.save();
			context.closePath();
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.restore();
		},
		clearSignature: function (canvas, context, data) {
			internal.clearHtmlCanvas(canvas, context);
			data.clearSignature();
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
		},
		calculateBoundaryCrossing: function(location, data) {
			return location;
		}
	};

	var methods = {
		init : function(options) {

			return this.each(function() {
				var $this, data, $canvas, canvas, context;

				$this = $(this);

				// Attach data storage to this object
				if (! $this.data("signaturePanel")) {
					$this.data("signaturePanel", {
						clickstream: [],
						startTime: 0,
						drawState: "none",
						canvasHeight: 0,
						canvasWidth: 0,
						settings: {},
						lastLocation: {},
						getSignatureData: function () {
							return {
								clickstream: this.clickstream,
								penColor: this.settings.penColor,
								penWidth: this.settings.penWidth
							};
						},
						clearSignature: function () {
							this.clickstream = [];
							this.drawState = "none";
						}
					});
				}
				data = $this.data("signaturePanel");

				// Apply user-supplied options
				if (options) {
					$.extend(data.settings, defaults, options);
				}

				// Create user interface elements
				$this.empty();
				$this.append(internal.getPanelHtml(data.settings, $this));

				$canvas = $this.find("canvas");
				canvas = $canvas[0];
				context = $canvas[0].getContext('2d');

				data.canvasHeight = canvas.height;
				data.canvasWidth = canvas.width;

				context.lineWidth = data.settings.penWidth;
				context.strokeStyle = data.settings.penColor;
				context.lineCap = "round";
				context.lineJoin = "round";
				context.fillStyle = "none";

				// Attach event handlers

				$this.find("a.signature-panel-clear").bind("click.signaturePanel", function () {
					internal.clearSignature($canvas[0], context, data);
					return false;
				});

				$this.find("a.signature-panel-cancel").bind("click.signaturePanel", function () {
					internal.clearSignature($canvas[0], context, data);
					if (data.settings.cancelFunction) {
						data.settings.cancelFunction();
					}
					return false;
				});

				$this.find("button.signature-panel-ok").bind("click.signaturePanel", function () {
					if (data.settings.okFunction) {
						data.settings.okFunction(data.getSignatureData());
					}
					return false;
				});

				$canvas.bind("mousedown.signaturePanel touchstart.signaturePanel", function (event) {
					var location, t;

					t= (new Date).getTime - data.startTime;
					event.preventDefault();
					location = internal.processEventLocation(event, $canvas[0]);
					data.startTime = t;
					data.drawState = "draw";
					context.beginPath();
					context.moveTo(location.x, location.y);
					data.lastLocation = location;
					data.clickstream.push({x: location.x, y: location.y, t: 0, action: "gestureStart"});
				});

				$(document).bind("mousemove.signaturePanel touchmove.signaturePanel", function (event) {
					var location, t, inBounds, boundaryLocation, lastLocationInBounds;

					t= (new Date).getTime - data.startTime;

					if ((data.drawState === "draw") || (data.drawState === "suspend")) {
						event.preventDefault();
						location = internal.processEventLocation(event, $canvas[0]);
						inBounds = !((location.x < 0) || (location.x > data.canvasWidth) || (location.y < 0) || (location.y > data.canvasHeight));
					} else {
						return;
					}

					/*  We're catching a number of tricky cases here. We're capturing mouse movements even outside the
						canvas so that we can maintain a continuous gesture for the user even if they draw outside the
						lines. It's tempting to just record all the mouse movements even if they're out-of-bounds, but
						that really isn't OK, because we're not showing those captured points to the user. It would be
						misleading because we're showing the signature to the user, and they would reasonably assume
						that what we're showing is what they're approving when they click OK.

						If we just record the points that occur in bounds, we get ugly (and bogus) connecting lines
						when we cross back into bounds.

						To get around these things, we calculate the boundary crossing point and add it to the list.
						To indicate that the gesture is still continuing, we record it as a suspension.
					 */

					lastLocationInBounds = (data.drawState === "draw");

					if (lastLocationInBounds) {
						if (inBounds) {
							context.lineTo(location.x, location.y);
							context.stroke();
							data.clickstream.push({x: location.x, y: location.y, t: t, action: "gestureContinue"});
							data.lastLocation = location;
						} else {
							boundaryLocation = internal.calculateBoundaryCrossing(location, data);
							context.lineTo(boundaryLocation.x, boundaryLocation.y);
							context.stroke();
							context.closePath();
							data.clickstream.push({x: boundaryLocation.x, y: boundaryLocation.y, t: t, action: "gestureSuspend"});
							data.lastLocation = location;
							data.drawState = "suspend";
						}
					} else {
						if (inBounds) {
							boundaryLocation = internal.calculateBoundaryCrossing(location, data);
							context.beginPath();
							context.moveTo(boundaryLocation.x, boundaryLocation.y);
							data.clickstream.push({x: boundaryLocation.x, y: boundaryLocation.y, t: t, action: "gestureResume"});
							data.lastLocation = location;
							data.drawState = "draw";
						} else {
							data.lastLocation = location;
						}
					}
				});

				$(document).bind("mouseup.signaturePanel touchend.signaturePanel touchcancel.signaturePanel", function (event) {
					if (data.drawState !== "none") {
						event.preventDefault();
						context.closePath();
						data.drawState = "none";
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

		drawClickstreamToCanvas : function(signatureData) {
			return this.each(function() {
				var canvas, context, i, inPath;

				canvas = this;
				context = canvas.getContext("2d");

				internal.clearHtmlCanvas(canvas, context);
				canvas.width = canvas.width;

				//render clickstream
				context.lineWidth = signatureData.penWidth;
				context.strokeStyle = signatureData.penColor;
				context.lineCap = "round";
				context.lineJoin = "round";
				context.fillStyle = "none";

				inPath = false;
				for (i = 0; i < signatureData.clickstream.length; i++) {
					switch (signatureData.clickstream[i].action) {
					case "gestureResume":
						// Same as gestureStart
					case "gestureStart":
						if (inPath) {
							context.stroke();
							context.closePath();
						}
						context.beginPath();
						context.moveTo(signatureData.clickstream[i].x, signatureData.clickstream[i].y);
						inPath = true;
						break;
					case "gestureContinue":
						if (inPath) {
							context.lineTo(signatureData.clickstream[i].x, signatureData.clickstream[i].y);
						}
						break;
					case "gestureSuspend":
						if (inPath) {
							context.stroke();
							context.closePath();
							inPath = false;
						}
						break;
					}
				}
				if (inPath) {
					context.stroke();
					context.closePath();
				}
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

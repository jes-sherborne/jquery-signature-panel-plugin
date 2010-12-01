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
		calculateBoundaryCrossing: function (location, data) {
			var intersect, returnValue, found;

			returnValue = {};
			returnValue.x = location.x;
			returnValue.y = location.y;

			found = false;

			if (!found) {
				intersect = internal.computeLineIntersection(
						0, 0, data.canvasWidth, 0,
						data.lastLocation.x, data.lastLocation.y, location.x, location.y);

				if (intersect.status === "intersect") {
					returnValue.x = intersect.x;
					returnValue.y = intersect.y;
					found = true;
				} else if (intersect.status === "collinear") {
					found = true;
				}
			}

			if (!found) {
				intersect = internal.computeLineIntersection(
						0, 0, 0, data.canvasHeight,
						data.lastLocation.x, data.lastLocation.y, location.x, location.y);

				if (intersect.status === "intersect") {
					returnValue.x = intersect.x;
					returnValue.y = intersect.y;
					found = true;
				} else if (intersect.status === "collinear") {
					found = true;
				}
			}

			if (!found) {
				intersect = internal.computeLineIntersection(
						0, data.canvasHeight, data.canvasWidth, data.canvasHeight,
						data.lastLocation.x, data.lastLocation.y, location.x, location.y);

				if (intersect.status === "intersect") {
					returnValue.x = intersect.x;
					returnValue.y = intersect.y;
					found = true;
				} else if (intersect.status === "collinear") {
					found = true;
				}
			}

			if (!found) {
				intersect = internal.computeLineIntersection(
						data.canvasWidth, 0, data.canvasWidth, data.canvasHeight,
						data.lastLocation.x, data.lastLocation.y, location.x, location.y);

				if (intersect.status === "intersect") {
					returnValue.x = intersect.x;
					returnValue.y = intersect.y;
					found = true;
				} else if (intersect.status === "collinear") {
					found = true;
				}
			}

			// Make sure returned value is within bounds (correcting floating point error)

			if (returnValue.x < 0) {
				returnValue.x = 0;
			} else if (returnValue.x > data.canvasWidth) {
				returnValue.x = data.canvasWidth;
			}
			if (returnValue.y < 0) {
				returnValue.y = 0;
			} else if (returnValue.y > data.canvasHeight) {
				returnValue.y = data.canvasHeight;
			}

			return returnValue;
		},
		computeLineIntersection: function (x1, y1, x2, y2, x3, y3, x4, y4) {
			// Implementation follows http://local.wasp.uwa.edu.au/~pbourke/geometry/lineline2d/

			var n1, n2, d, r1, r2;

			n1 = ((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3));
			n2 = ((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3));
			d = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));

			if (d === 0.0) {
				if ((n1 === 0.0) && (n2 === 0.0)) {
					return {status: "collinear", x: null, y: null};
				} else {
					return {status: "disjoint", x: null, y: null};
				}
			} else {
				r1 = n1/d;
				r2 = n2/d;

				if ((r1 >= 0) && (r1 <= 1) && (r2 >= 0) && (r2 <= 1)) {
					return {status: "intersect", x: x1 + r1 * (x2 - x1), y: y1 + r1 * (y2 - y1)};
				} else {
					return {status: "disjoint", x: null, y: null};
				}
			}
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
								penWidth: this.settings.penWidth,
								canvasHeight: this.canvasHeight,
								canvasWidth: this.canvasWidth
							};
						},
						clearSignature: function () {
							this.clickstream = [];
							this.drawState = "none";
							this.havePath = false;
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
					if (!data.havePath) {
						context.beginPath();
						data.havePath = true;
					}
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
							context.clearRect(0, 0, data.canvasWidth, data.canvasHeight);
							context.stroke();
							data.clickstream.push({x: location.x, y: location.y, t: t, action: "gestureContinue"});
							data.lastLocation = location;
						} else {
							boundaryLocation = internal.calculateBoundaryCrossing(location, data);
							context.lineTo(boundaryLocation.x, boundaryLocation.y);
							context.clearRect(0, 0, data.canvasWidth, data.canvasHeight);
							context.stroke();
							data.clickstream.push({x: boundaryLocation.x, y: boundaryLocation.y, t: t, action: "gestureSuspend"});
							data.lastLocation = location;
							data.drawState = "suspend";
						}
					} else {
						if (inBounds) {
							boundaryLocation = internal.calculateBoundaryCrossing(location, data);
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
				var canvas, context, i, inPath, scalingFactorX, scalingFactorY, scalingFactor, x, y;

				canvas = this;
				context = canvas.getContext("2d");

				internal.clearHtmlCanvas(canvas, context);
				canvas.width = canvas.width;

				if (canvas.width <= 0) {
					scalingFactorX = 0;
				} else {
					scalingFactorX = canvas.width / signatureData.canvasWidth;
				}
				if (canvas.height <= 0) {
					scalingFactorY = 0;
				} else {
					scalingFactorY = canvas.height / signatureData.canvasHeight;
				}
				scalingFactor = Math.min(scalingFactorX, scalingFactorY);

				//render clickstream
				context.lineWidth = signatureData.penWidth * scalingFactor;
				context.strokeStyle = signatureData.penColor;
				context.lineCap = "round";
				context.lineJoin = "round";
				context.fillStyle = "none";
				context.beginPath();

				inPath = false;
				for (i = 0; i < signatureData.clickstream.length; i++) {
					x = signatureData.clickstream[i].x * scalingFactor;
					y = signatureData.clickstream[i].y * scalingFactor;
					switch (signatureData.clickstream[i].action) {
					case "gestureResume":
						context.moveTo(x, y);
						break;
					case "gestureStart":
						context.moveTo(x, y);
						break;
					case "gestureContinue":
						context.lineTo(x, y);
						break;
					case "gestureSuspend":
						context.lineTo(x, y);
						break;
					}
				}
				context.stroke();
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

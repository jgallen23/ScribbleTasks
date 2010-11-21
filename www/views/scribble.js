var Scribble = View.extend({
	init: function(element, width, height, readonly) {
		var self = this;
		this._super(element);
		this.strokeWidth = 3;
		this._scale = null;
		this.strokes = [];
		this.readonly = readonly;
		this.undos = [];
		this.path = null;
		this.canvas = this.find("canvas");
		this.context = this.canvas.getContext('2d');

		if (!this.readonly) {
			this.drawLoop();
		}
	},
	drawPoints: function(points) {
		for (var i = 0, c = points.length; i < c; i++) {
			var point = points[i];
			if (i == 0)
				this.context.moveTo(point[0], point[1]);
			else
				this.context.lineTo(point[0], point[1]);
		}
	},
	drawLoop: function() {
		var self = this;
		var points = [];
		var x = null,
			y = null;
		var skip = false;
		var drawing = false;
		var moved = false;
		var offsetLeft = null,
			offsetRight = null;
		
		var getPoint = function(ev) {
			var x,y;
			if (self.offset == null) {
				self.offset = [self.element.offsetLeft, self.element.offsetTop];
			}
			if (ev.touches) {
				x = ev.touches[0].clientX - self.offset[0] - window.scrollX;
				y = ev.touches[0].clientY - self.offset[1] - window.scrollY;
			} else {
				x = ev.clientX - self.offset[0];
				y = ev.clientY - self.offset[1];
			}
			return [x, y];
		}

		var drawStart = function(e) {
			drawing = true;
			var p = getPoint(e);
			x = p[0];
			y = p[1];
			return event.preventDefault();
		}

		var drawMove = function(e) {
			if (drawing) {
				moved = true;
				var p = getPoint(e)
				points.push(p);
			}
		}

		var drawEnd = function() {
			if (drawing) {
				if (!moved)
					points.push([x, y], [x+2, y+2]);
				drawing = false;
				moved = false;
				points.push(null);
			}
		}

		this.element.addEventListener("mousedown", function(e) { drawStart(e); });
		this.element.addEventListener("mousemove", function(e) { drawMove(e); });
		this.element.addEventListener("mouseup", function(e) { drawEnd(e); });

		this.element.addEventListener("touchstart", function(e) { drawStart(e); });
		this.element.addEventListener("touchmove", function(e) { drawMove(e); });
		this.element.addEventListener("touchend", function(e) { drawEnd(e); });

		var currentStroke = [];
		var done = false;
		setInterval(function __drawLoop() {
			if (!points.length)
				return;
			var start = new Date();
			self.context.beginPath();
			self.context.lineWidth = self.strokeWidth;
			while (points.length && new Date() - start < 10) {
				var p = points.shift();
				if (!p) { //end of stroke
					done = true;
				} else {
					var o = [x, y];
					if (currentStroke.length == 0)
						currentStroke.push(o);
					currentStroke.push(p);
					x = p[0];
					y = p[1];
					self.drawPoints([o, [x, y]]);
				}
			}
			self.context.stroke();
			if (currentStroke.length != 0) {
				if (done) {
					self.strokes.push(currentStroke);
					currentStroke = [];
					done = false;
				}
			}
		}, 30);
	},
	redraw: function() {
		this.context.clearRect(0, 0, this.element.clientWidth, this.element.clientHeight);
		if (this._scale) {
			this.context.scale(this._scale[0], this._scale[1]);
		}
		for (var i = 0; i < this.strokes.length; i++) {
			var s = this.strokes[i];
			this.context.beginPath();
			this.context.lineWidth = this.strokeWidth;
			this.drawPoints(s);
			this.context.stroke();
		}
	},
	undo: function() {
		this.undos.push(this.strokes.last());
		this.strokes.remove(this.strokes.length-1);
		this.redraw();
	},
	redo: function() {
		if (this.undos.length != 0) {
			this.strokes.push(this.undos.last());
			this.undos.remove(this.undos.length - 1);
			this.redraw();
		}
	},
	load: function(json) {
		this.strokes = json;
		this.redraw();
	},
	toJSON: function() {
		return this.strokes;
	},
	scale: function(x, y) {
		this._scale = [x, y];
		this.redraw();	
	},
	clear: function() {
		this.offset = null;
		this.strokes = [];
		this.context.clearRect(0, 0, this.element.clientWidth, this.element.clientHeight);
	}
});

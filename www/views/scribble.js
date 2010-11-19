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
		this.paper = Raphael(this.element, "100%", "100%")
		//this.paper.serialize.init();

		if (!this.readonly) {
			this.drawLoop();
		}
	},
	drawPath: function(path) {
		var rpath = this.paper.path(path);
		var attr = { 'stroke-width': this.strokeWidth };
		if (this._scale) {
			attr['scale'] = this._scale;
		}
		rpath.attr(attr);
		return rpath;
	},
	drawPoints: function(points) {
		var path = this.pathFromPoints(points);
		return p = this.drawPath(path);
	},
	pathFromPoints: function(points) {
		if (!points || points.length == 0) return '';
		var p = [];
		for (var i = 0, c = points.length; i < c; i++) {
			if (i == 0)
				p.push(String.format("M{0},{1}", points[i][0], points[i][1]));
			else
				p.push(String.format("L{0},{1}", points[i][0], points[i][1]));
		}
		return p.join(' ');	
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

		var strokeString = [];
		var currentStroke = [];
		var done = false;
		setInterval(function __drawLoop() {
			var start = new Date();
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
					var p = self.pathFromPoints([o, p]);
					self.drawPath(p);
					//strokeString.push(self.pathFromPoints([o, p]));
				}
			}
			if (currentStroke.length != 0) {
				/*var ps = strokeString.join(' ');*/
				/*console.log(ps);*/
				/*self.drawPath(ps);*/
				if (done) {
					var strokePath = self.pathFromPoints(currentStroke);
					self.strokes.push(strokePath);
					console.log(self.strokes);
					self.redraw();
					currentStroke = [];
					strokeString = [];
					done = false;
				}
			}
		}, 30);
	},
	redraw: function() {
		this.paper.clear();
		for (var i = 0; i < this.strokes.length; i++) {
			var s = this.strokes[i];
			this.drawPath(s);
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
		var json = JSON.parse(json); 
		this.strokes = json;
		this.redraw();
	},
	toJSON: function() {
		//var json = this.paper.serialize.freeze();
		return JSON.stringify(this.strokes);
	},
	scale: function(scale) {
		this._scale = scale;
		this.redraw();	
	},
	clear: function() {
		this.offset = null;
		this.strokes = [];
		this.paper.clear();
	}
});

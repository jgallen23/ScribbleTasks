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
		this.paper = Raphael(this.element, width, height);
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
	},
	drawLoop: function() {
		var self = this;
		var points = [];
		var x = null,
			y = null;
		var skip = false;
		var drawing = false;
		var offsetLeft = null,
			offsetRight = null;
		
		var getPoint = function(ev) {
			var x,y;
			if (self.offset == null) {
				self.offset = [self.element.offsetLeft, self.element.offsetTop];
			}
			if (ev.touches) {
				x = ev.touches[0].pageX - self.offset[0];
				y = ev.touches[0].pageY - self.offset[1];
			} else {
				x = ev.pageX - self.offset[0];
				y = ev.pageY - self.offset[1];
			}
			return [x, y];
		}

		var draw = function(point) {
			if (point) {
				if (skip) {
					skip = false;
				} else {
					var o = [x, y];
					x = point[0];
					y = point[1];
					//draw
					var pathString = "M"+o[0]+" "+o[1]+"L"+x+" "+y;
					return pathString;
				}
			} else {
				skip = true;
			}
			return '';
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
				var p = getPoint(e)
				points.push(p);
			}
		}

		var drawEnd = function() {
			drawing = false;
			if (points.length == 0)
				points.push([x, y], [x+2, y+2]);
			points.push(null);
		}

		this.element.addEventListener("mousedown", function(e) { drawStart(e); });
		this.element.addEventListener("mousemove", function(e) { drawMove(e); });
		this.element.addEventListener("mouseup", function(e) { drawEnd(e); });

		this.element.addEventListener("touchstart", function(e) { drawStart(e); });
		this.element.addEventListener("touchmove", function(e) { drawMove(e); });
		this.element.addEventListener("touchend", function(e) { drawEnd(e); });

		var strokeString = [];
		var tPath = [];
		setInterval(function __drawLoop() {
			var start = new Date();
			while (points.length && new Date() - start < 10) {
				var p = points.shift();
				if (!p) { //end of stroke
					self.strokes.push(strokeString.join(''));
					strokeString = [];
				} else {
					tPath.push(draw(points.shift()));
				}
			}
			if (tPath.length != 0) {
				var ps = tPath.join('');
				strokeString.push(ps);
				self.drawPath(ps);
				tPath = [];
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
		this.undos.push(this.strokes[this.strokes.length-1]);
		this.strokes.remove(this.strokes.length-1);
		this.redraw();
	},
	redo: function() {
		this.strokes.extend(this.undos.shift());
		this.undos = [];	
		this.redraw();
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

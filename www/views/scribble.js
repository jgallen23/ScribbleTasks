var Scribble = View.extend({
	init: function(element, width, height, readonly) {
		var self = this;
		this._super(element);
		this.strokeWidth = 3;
		this.scale = null;
		this.strokes = [];
		this.readonly = readonly;
		this.undos = [];
		this.path = null;
		this.paper = Raphael(this.element, width, height);
		this.paper.serialize.init();

		if (!this.readonly) {
			this.drawLoop();
		}
	},
	drawPath: function(path) {
		var rpath = this.paper.path(path);
		var attr = { 'stroke-width': this.strokeWidth };
		/*if (this.scale) {*/
		/*attr['scale'] = this.scale;*/
		/*}*/
		rpath.attr(attr);
	},
	drawLoop: function() {
		var self = this;
		var points = [];
		var x = null,
			y = null;
		var skip = false;
		var drawing = false;
		
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
			var p = self.getPoint(e);
			x = p[0];
			y = p[1];
			return event.preventDefault();
		}

		var drawMove = function(e) {
			if (drawing) {
				var p = self.getPoint(e)
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

		var path = '';
		setInterval(function() {
			var tPath = '';
			var start = new Date();
			while (points.length && new Date() - start < 10) {
				var p = points.shift();
				if (!p) { //grab last stroke
					self.strokes.push(path);
					path = '';
				} else {
					tPath = draw(points.shift());
					path += tPath;
				}
			}
			if (tPath) {
				self.drawPath(tPath);
			}
		}, 30);
	},
	_draw: function(point) {
		if (point) {
			this.currentPath += this.point_to_svg(point);
			if (this.currentPath)
				this.path.attr({ "stroke-width": 2, path: this.currentPath });
		} else { //done drawing
			var c = this.path.attr();
			c['type'] = this.path.type;
			this.strokes.push(c);
			this.path = null;
			this.points = [];
			this.drawing = false;
			this.moved = false;
            this.currentPath = '';
			this.undos = [];
		}
	},
	getPoint: function(ev) {
		var x,y;
		if (ev.touches) {
			x = ev.touches[0].pageX - this.element.offsetLeft;
			y = ev.touches[0].pageY - this.element.offsetTop;
		} else {
			x = ev.pageX - this.element.offsetLeft;
			y = ev.pageY - this.element.offsetTop;
		}
		return [x, y];
	},
	redraw: function() {
		this.paper.clear();
		for (var i = 0; i < this.strokes.length; i++) {
			var s = this.strokes[i];
			this.drawPath(s);
		}
	},
	/*
	drawStroke: function(stroke) {
		var t = this.paper[stroke.type]();
		if (this.scale) {
			stroke['scale'] = this.scale;
		}
		t.attr(stroke);
	},
	*/
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
		var set = this.paper.serialize.thaw(json);
		this.strokes = [];
		for (var i = 0; i < set.length;i++) {
			var node = set[i];
			var c = node.attr();
			c.type = node.type;
			this.strokes.push(c);
		};
	},
	toJSON: function() {
		var json = this.paper.serialize.freeze();
		return json;
	},
	scale: function(scale) {
		this.scale = scale;
		this.redraw();	
	},
	clear: function() {
		this.strokes = [];
		this.paper.clear();
	}
});

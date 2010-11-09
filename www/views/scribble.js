var Scribble = View.extend({
	init: function(element, width, height, readonly) {
		var self = this;
		this._super(element);
		this._drawing = false;
		this._moved = false;
		this._points = [];
        this._lastPoint = 0;
        this._currentPath = '';
		this._scale = null;
		this._startPoint = null;
		this.strokes = [];
		this.readonly = readonly;
		this.undos = [];
		this.path = null;
		this.paper = Raphael(this.element, width, height);
		this.paper.serialize.init();

		this.element.addEventListener("mousedown", function(e) { self._drawStart(e); });
		this.element.addEventListener("mousemove", function(e) { self._drawMove(e); });
		this.element.addEventListener("mouseup", function(e) { self._drawEnd(e); });

		this.element.addEventListener("touchstart", function(e) { self._drawStart(e); });
		this.element.addEventListener("touchmove", function(e) { self._drawMove(e); });
		this.element.addEventListener("touchend", function(e) { self._drawEnd(e); });

		this._drawLoop();
	},
	_drawLoop: function() {
		var self = this;
		setInterval(function() {
			while (self._points.length) {// && new Date() - start < 10) {
				self._draw(self._points.shift());
			}
		}, 20);
	},
	_draw: function(point) {
		if (point) {
			this._currentPath += this._point_to_svg(point);
			if (this._currentPath)
				this.path.attr({ "stroke-width": 2, path: this._currentPath });
		} else { //done drawing
			var c = this.path.attr();
			c['type'] = this.path.type;
			this.strokes.push(c);
			this.path = null;
			this._points = [];
			this._drawing = false;
			this._moved = false;
            this._currentPath = '';
			this.undos = [];
		}
	},
	_point_to_svg: function(point) {
		if (this._currentPath == "") {
			return "M"+point[0]+","+point[1];
		} else { 
			return "L"+point[0]+","+point[1];
		}
	},
	_points_to_svg: function() {
		if (this._points != null && this._points.length > 1) {
			if (this._currentPath == "") {
				var p = this._points[0];
                this._currentPath = "M" + p[0] + "," + p[1];
			} else {
			}



            if (this._currentPath) {
                for (var i = this._lastPoint, n = this._points.length; i < this._points.length; i++) {
                    var p = this._points[i];
                    this._currentPath += "L" + p[0] + "," + p[1]; 
                }
                return this._currentPath;
            } else {
                var p = this._points[0];
                for (var i = 1, n = this._points.length; i < n; i++) {
                    p = this._points[i];
                    this._currentPath += "L" + p[0] + "," + p[1]; 
                } 
                return this._currentPath;
            }
		} else {
			return "";
		}
	},
	_getPoint: function(ev) {
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
	_drawStart: function(e) {
		if (this.readonly)
			return;
		this._drawing = true;
		var p = this._getPoint(e);
		this._startPoint = p;
		this._points.push(p);
		this.path = this.paper.path();
	},
	_drawMove: function(e) {
		if (this._drawing == true) {
			this._moved = true;
			var p = this._getPoint(e);
			this._points.push(p);
		}
	},
	_drawEnd: function(e) {
		if (this._drawing) {
			if (!this._moved) {
				var p = this._startPoint;
				p = [p[0]+2, p[1]+2]
				this._points.push(p);
			}
			this._points.push(null);
		}
	},
	redraw: function() {
		this.paper.clear();
		for (var i = 0; i < this.strokes.length; i++) {
			var s = this.strokes[i];
			this.drawStroke(s);
		}
	},
	drawStroke: function(stroke) {
		var t = this.paper[stroke.type]();
		if (this._scale) {
			stroke['scale'] = this._scale;
		}
		t.attr(stroke);
	},
	undo: function() {
		this.undos.push(this.strokes[this.strokes.length-1]);
		this.strokes.remove(this.strokes.length-1);
		this.redraw();
	},
	redo: function() {
		this.strokes.extend(this.undos);
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
		this._scale = scale;
		this.redraw();	
	},
	clear: function() {
		this.strokes = [];
		this.paper.clear();
	}
});

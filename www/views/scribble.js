var Scribble = View.extend({
	init: function(element, width, height) {
		var self = this;
		this._super(element);
		this._drawing = false;
		this._points = [];
		this._scale = null;
		this.strokes = [];
		this.readonly = false;
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
		this._points.push(p);
		this.path = this.paper.path();
	},
	_drawMove: function(e) {
		if (this._drawing == true) {
			var p = this._getPoint(e);
			this._points.push(p);

			this.path.attr({ path: this._points_to_svg() });
		}
	},
	_drawEnd: function(e) {
		if (this._drawing) {
			var c = this.path.attr();
			c['type'] = this.path.type;
			this.strokes.push(c);
			this.path = null;
			this._points = [];
			this._drawing = false;
			this.undos = [];
		}
	},
	_points_to_svg: function() {
		if (this._points != null && this._points.length > 1) {
			var p = this._points[0];
			var path = "M" + p[0] + "," + p[1];
			for (var i = 1, n = this._points.length; i < n; i++) {
				p = this._points[i];
				path += "L" + p[0] + "," + p[1]; 
			} 
			return path;
		} else {
			return "";
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

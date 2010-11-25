var AddTaskController = Controller.extend({
	init: function(elementId) {
		this._super(elementId);
		this.star = false;
		this.loadedScribble = false;
		this.scribble = new Scribble(this.view.find('#AddScribble'), ScribbleSize[0], ScribbleSize[1]);
	},
	destroy: function() {
		this.star = null;
		this.scribble = null;
		this._super();
	},
	clear: function() {
		this.setStar(false);
		this.star = false;
		this.loadedScribble = null;
		this.scribble.clear();
	},
	show: function(scribble) {
		APP.currentController = this;
		this.element.style.top = window.scrollY+"px";
		this.element.style.display = "-webkit-box";
		var elem = this.view.find('#AddScribble');
		this.scribble.canvas.height = elem.clientHeight;
		this.scribble.canvas.width = elem.clientWidth;
		//this._super();
		APP.disableScrolling();
		if (scribble) {
			this.setStar(scribble.star);
			this.loadedScribble = scribble;
			this.scribble.load(scribble.path);	
		}
	},
	hide: function() {
		APP.enableScrolling();
		this._super();
	},
	setStar: function(star) {
		this.star = star;
		var starElement = this.view.find(".star");
		if (star) {
			elem.removeClass(starElement, "off");
		} else {
			elem.addClass(starElement, "off");
		}
	},
	addTask: function() {
		if (this.scribble.strokes.length != 0) {
			if (this.loadedScribble) {
				this.loadedScribble.star = this.star;
				this.loadedScribble.path = this.scribble.toJSON();
				this.trigger("add", [this.loadedScribble]);
			} else {
				var task = {
					star: this.star,
					path: this.scribble.toJSON()
				}
				this.trigger("add", [task]);
			}
			this.clear();
		}
	},
	onClick: {
		star: function(e) {
			this.setStar(!this.star);
		},
		add: function(e) {
			this.addTask();	
			this.hide();
			this.trigger("close");
		},
		addAnother: function(e) {
			this.addTask();
		},
		cancel: function(e) {
			this.clear();
			this.trigger("close");
			this.hide();
		},
		undo: function(e) {
			this.scribble.undo();
		},
		redo: function(e) {
			this.scribble.redo();
		}
	}
});

var AddTaskController = Controller.extend({
	init: function(elementId) {
		this._super(elementId);
		this.star = false;
		this.loadedScribble = false;
		this.scribble = new Scribble(this.view.find('#AddScribble'));
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
			this.setPriority(scribble.priority);
			this.setStar(scribble.star);
			this.loadedScribble = scribble;
			this.scribble.load(scribble.path);	
		} else {
			this.setPriority(0);
		}
	},
	hide: function() {
		APP.enableScrolling();
		this._super();
	},
	setPriority: function(priority) {
		this.priority = priority;
		this.view.find("button.priority").setAttribute('data-priority', priority);
		var data = { key: 'add_task', priority: priority }
		this.view.renderAt(this.view.find(".PriorityChooser"), "jstPriorityChooser", data);
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
				this.loadedScribble.priority = this.priority;
				this.loadedScribble.path = this.scribble.toJSON();
				this.loadedScribble.imageData = null;
				this.trigger("add", [this.loadedScribble]);
			} else {
				var task = {
					star: this.star,
					path: this.scribble.toJSON(),
					priority: this.priority
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
		priority: function(e) {
			this.view.find(".PriorityChooser").style.display = "block";
		},
		setPriority: function(e) {
			this.priority = e.target.value;	
			this.setPriority(this.priority);
			this.view.find(".PriorityChooser").style.display = "none";
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

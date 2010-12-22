var AddTaskController = Controller.extend({
	init: function(elementId) {
		this._super(elementId);
		this.star = false;
		this.loadedScribble = false;
		var container = this.view.find("#AddScribble");
		container.appendChild(document.createElement("canvas"));
		this.scribble = new Scribble(container);
		this.tasks = [];
	},
	destroy: function() {
		this.view.find("#AddScribble").innerHTML = "";
		this.star = null;
		this.scribble = null;
		this._super();
	},
	clear: function() {
		this.setStar(false);
		this.star = false;
		this.setPriority(0);
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
		var data = { key: 'add_task', priority: 0 }
		this.view.renderAt(this.view.find(".PriorityChooser"), "jstPriorityChooser", data);
	},
	hide: function() {
		APP.enableScrolling();
		this._super();
	},
	setPriority: function(priority) {
		this.priority = priority;
		this.view.find("button.priority span").className = "priority"+priority;
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
	appendTask: function() {
        var json = this.scribble.toJSON();
        this.scribble.scale(TaskScale, TaskScale);
        var img = this.scribble.imageData();
		if (this.scribble.strokes.length != 0) {
			if (this.loadedScribble) {
				this.loadedScribble.star = this.star;
				this.loadedScribble.priority = this.priority;
				this.loadedScribble.path = json;
				this.loadedScribble.imageData = img;
				this.tasks.push(this.loadedScribble);
				//this.trigger("add", [this.loadedScribble]);
			} else {
				var task = {
					star: this.star,
					path: json,
                    priority: this.priority,
                    imageData: img 
				}
				this.tasks.push(task);
				//this.trigger("add", [task]);
			}
		}
		this.clear();
	},
	onClick: {
		star: function(e) {
			this.setStar(!this.star);
		},
		priority: function(e) {
			this.view.find(".PriorityChooser").style.display = "block";
		},
		setPriority: function(e) {
			if (e.target.nodeName == "SPAN")
				var btn = e.target.parentNode;
			else
				var btn = e.target;
			this.priority = btn.getAttribute('data-priority');	
			this.setPriority(this.priority);
			this.view.find(".PriorityChooser").style.display = "none";
		},
		add: function(e) {
			this.appendTask();	
			this.hide();
			this.trigger("add", [this.tasks]);
			this.trigger("close");
		},
		addAnother: function(e) {
			this.appendTask();
		},
		cancel: function(e) {
			if (this.tasks.length != 0)
				this.trigger("add", [this.tasks]);
			this.clear();
			this.hide();
			this.trigger("close");
		},
		undo: function(e) {
			this.scribble.undo();
		},
		redo: function(e) {
			this.scribble.redo();
		}
	}
});

var AddTaskController = PageController.extend({
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
	setTask: function(scribble) {
		APP.currentController = this;
		//this.element.style.top = window.scrollY+"px";
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
	show: function() {
		this.element.style.display = "-webkit-box";
	},
	hide: function() {
		APP.enableScrolling();
		this._super();
	},
	setPriority: function(priority) {
		this.priority = priority;
		this.view.find("button.priority").setAttribute("data-priority", priority);
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
		if (this.scribble.strokes.length != 0) {
			if (this.loadedScribble) {
				this.loadedScribble.star = this.star;
				this.loadedScribble.priority = this.priority;
				this.loadedScribble.path = this.scribble.toJSON();
				/*this.loadedScribble.imageData = null;*/
				this.tasks.push(this.loadedScribble);
				//this.trigger("add", [this.loadedScribble]);
			} else {
				var task = {
					star: this.star,
					path: this.scribble.toJSON(),
					priority: this.priority
				}
				this.tasks.push(task);
				//this.trigger("add", [task]);
			}
		}
		this.clear();
	},
	actions: {
		star: function(e) {
			this.setStar(!this.star);
		},
		priority: function(e) {
			this.view.find(".PriorityChooser").style.display = "block";
		},
		closePriority: function(e) {
			this.view.find(".PriorityChooser").style.display = "none";
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
			//this.hide();
			this.trigger("add", [this.tasks]);
			this.trigger("close");
		},
		addAnother: function(e) {
			this.appendTask();
		},
		cancel: function(e) {
            var self = this;
            var d = function(index) {
                if (index == 0) {
                    if (self.tasks.length != 0)
                        self.trigger("add", [self.tasks]);
                    self.clear();
                    //self.hide();
                    self.trigger("close");
                }
            }
            if (this.scribble.dirty) {
                var msg = "Are you sure you want to cancel this scribble?";
                if (APP.browser.isPhoneGap) {
                    navigator.notification.confirm(msg, d);
                } else {
                    if (confirm(msg)) d(0);
                }
            } else {
                d(0);
            }
		},
		undo: function(e) {
			this.scribble.undo();
		},
		redo: function(e) {
			this.scribble.redo();
		}
	}
});

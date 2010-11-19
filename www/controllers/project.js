var ScribbleSize = [400, 300];
var ProjectController = Controller.extend({
	init: function(elementId, project) {
		var self = this;
		this._super(elementId);
		this.filter = "incomplete";
		this.project = project;
		this.scribbles = [];

		this.addTaskController = new AddTaskController("AddTask");
		this.addTaskController.bind("add", function(task) { self.addTask(task); });
		this.addTaskController.bind("cancel", function() { APP.enableScrolling(); self.addTaskController.hide(); });
		
		this.scroller = new iScroll("Tasks", { checkDOMChanges: false, desktopCompatibility: true });
		APP.bind("enableScrolling", function() {
			if (self.scroller)
				self.scroller.enabled = true;
		});
		APP.bind("disableScrolling", function() {
			if (self.scroller)
				self.scroller.enabled = false;
		});
		this._handleTitleChange();
		window.addEventListener("resize", function() { self._onResize() });
		this._onResize();
		this.loadTasks();
	},
	destroy: function() {
		console.log("destroy");
		this.scroller = null;
		this.addTaskController.destroy();
		this.addTaskController = null;
		this.project = null;
		this.filter = null;
		this.scribbles = null;
		this.tasks = null;
		this._super();
	},
	onClick: {
		'star': function(e) {
			var index = e.target.parentNode.getAttribute("data-index");
			var task = this.tasks[index];
			e.target.style.opacity = (task.star)?.3:1.0;
			this.starTask(task);
		},
		'add': function(e) {
			this.showAddTask();
		},
		'task': function(e) {
			var task = this.tasks[this.view.findParentWithAttribute(e.target, 'data-index').getAttribute("data-index")];
			this.showAddTask(task);
		},
		'complete': function(e) {
			this.completeTask(this.view.findParentWithAttribute(e.target, 'data-index'));
		},
		'filterAll': function(e) {
			elem.removeClass(this.view.findAll("button."+this.filter), "current");
			elem.addClass(this.view.findAll("button.incomplete"), "current");
			this.filter = "incomplete";
			this.loadTasks();
		},
		'filterComplete': function(e) {
			elem.removeClass(this.view.findAll("button."+this.filter), "current");
			elem.addClass(this.view.findAll("button.complete"), "current");
			this.filter = "complete";
			this.loadTasks();
		},
		'filterStarred': function(e) {
			elem.removeClass(this.view.findAll("button."+this.filter), "current");
			elem.addClass(this.view.findAll("button.starred"), "current");
			this.filter = "starred";
			this.loadTasks();
		},
		'back': function(e) {
			this.parentController.show();
			this.destroy();
			this.hide();
		}
	},
	show: function() {
		this._super();
		this.element.style.display = "-webkit-box";
	},
	_handleTitleChange: function() {
		var self = this;
		var title = this.view.find("[data-type='title']");
		title.addEventListener("focus", function(e) {
			setTimeout(function() {
				e.target.select();
			}, 100);
		});
		var save = function() {
			self.project.name  = title.value;
			self.project.save();
		}
		title.addEventListener("blur", function(e) {
			save();
		});
		title.addEventListener("keydown", function(e) {
			if (e.which == 13) { //enter
				e.target.blur(e);
			}
		});
	},
	_onResize: function() {
		return;
		var h = window.innerHeight - this.view.find("header").clientHeight;
		var footer = this.view.find("footer");
		if (footer.style.display != "none") {
			h -= footer.clientHeight;
		}
		this.view.find(".TaskList").style.height = h+"px";
		this.scroller.refresh();
	},
	loadTasks: function() {
		var self = this;
		this.view.find("[data-type='title']").value = this.project.name;
		this.project.getTasks(function(tasks) {
			tasks = tasks.filter(Task.filters[self.filter]);
			self.tasks = tasks;
			self._render();
		});
	},
	_render: function() {
		var data = { project: this.project, tasks: this.tasks };
		this.view.renderAt("div.TaskList ul", "jstProjectView", data);
		this.drawScribbles();
        var sortable = new SortableController('Tasks');
        var self = this;
        sortable.bind("sorted", function() {
            self.tasksSorted();
        });
		this.view.findAll("div.TaskList li", function(item) {
			addSwipeHandler(item, function(element, direction) {
				if (direction == "right") {
					self.completeTask(element);
				}
			});
		});
		window.scroll(0,0);
		this._onResize();
	},
    tasksSorted: function() {
        var items = this.view.findAll("#Tasks li");
        this.project.taskIds = [];
        for (var i = 0; i < items.length; i++) {
            this.project.taskIds.push(items[i].getAttribute("data-key"));
        }
        this.project.save();
    },
	drawScribbles: function() {
		var self = this;
		for (var i = 0; i < this.tasks.length; i++) {
			var task = this.tasks[i];
			if (task.svg) {
				var s = new Scribble(document.getElementById("Scribble_"+i), ScribbleSize[0]/2, ScribbleSize[1]/2, true);
				s.readonly = true;
				s.load(task.svg);
				s.scale([.5, .5, 0, 0]);
				s.paper.canvas.addEventListener("click", function(e) {
					self.onClick['task'].call(self, e);
				});
				self.scribbles.push(s);
			}
		}
	},
	showAddTask: function(task) {
		this.addTaskController.show(task);
	},
	addTask: function(task) {
		var self = this;
		if (!(task instanceof Task)) {
			task.project = this.project.key;
			task = new Task(task);
		}
		this.project.addTask(task, function(project, task) {
			self.loadTasks();
		});
	},
	starTask: function(task) {
		var self = this;
		task.star = !task.star;
		task.save(function() {
		//	self.loadTasks();
		});
	},
	completeTask: function(taskElement) {
		var self = this;
		var index = taskElement.getAttribute("data-index");
		elem.addClass(this.view.find("li[data-index='"+index+"'] .complete"), "c");
		taskElement.style.opacity = 0;
		var task = self.tasks[index];
		setTimeout(function() {
			if (task.isComplete)
				task.unComplete();
			else
				task.complete();
			task.save(function() {
				self.loadTasks();
			});
		}, 1000);
	}
});

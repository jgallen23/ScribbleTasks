var Snap = false;
var UseImage = true;
var TaskHeight = 165;
var MinTaskHeight = 110;
var TaskScale = 0.6;
var ProjectController = Controller.extend({
	init: function(elementId, project) {
		var self = this;
		this._super(elementId);
		this.project = project;
		this.scribbles = [];
		this.filter = "incomplete";
		this.scrollTo = true;

		if (APP.browser.isMobile) {
			this.scroller = new iScroll("Tasks", { checkDOMChanges: false, desktopCompatibility: false, snap: Snap, momentum: !Snap });
		}
		APP.bind("enableScrolling", function() {
			if (self.scroller)
				self.scroller.enabled = true;
		});
		APP.bind("disableScrolling", function() {
			if (self.scroller)
				self.scroller.enabled = false;
		});
		this._handleTitleChange();

		this.loadTasks();
	},
	destroy: function() {
		if (this.scroller)
			this.scroller.destroy();
		this.scroller = null;
		this.project = null;
		this.filter = null;
		this.scribbles.each(function(s) {
			s.destroy();
		});
		this.scribbles = null;
		this.tasks = null;
		this.view.find("#Tasks").innerHTML = "";
		this._super();
	},
	onClick: {
		'scrollToTop': function(e) {
			if (this.scroller)
				this.scroller.scrollTo(0, 0, '400ms');
			else
				this.view.find(".TaskList").scrollTop = 0;
		},
		'star': function(e) {
			var index = e.target.getAttribute("data-index");
			var task = this.tasks[index];
			if (task.star)
				elem.removeClass(e.target, "off");
			else
				elem.addClass(e.target, "off");
			this.starTask(task);
		},
		'priority': function(e) {
			if (e.target.nodeName == "SPAN")
				e.target.parentNode.nextSibling.style.display = "block";
			else
				e.target.nextSibling.style.display = "block";
			//this.view.find(".PriorityChooser").style.display = "block";
		},
		'setPriority': function(e) {
			if (e.target.nodeName == "SPAN")
				var btn = e.target.parentNode;
			else
				var btn = e.target;
			var index = btn.getAttribute("data-key");
			var task = this.tasks[index];
			var priority = btn.getAttribute("data-priority");
			btn.parentNode.style.display = "none";
			if (task.priority != priority) 
				this.setPriority(task, priority);
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
			this.scrollTo = true;
			this.filter = "incomplete";
			this.loadTasks();
		},
		'filterComplete': function(e) {
			this.scrollTo = true;
			this.filter = "complete";
			this.loadTasks();
		},
		'filterStarred': function(e) {
			this.scrollTo = true;
			this.filter = "star";
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
	loadTasks: function() {
		var self = this;
		this.view.find("[data-type='title']").value = this.project.name;
		this.project.getTasks(function(tasks) {
			tasks = tasks.filter(Task.filters[self.filter]);
			tasks.sort(Task.sort[self.filter]);
			self.tasks = tasks;
			self._render();
		});
	},
	_render: function() {
		var self = this;
		var data = { project: this.project, tasks: this.tasks, useImage: UseImage };

		if (Snap) {
			var height = this.view.find(".TaskList").clientHeight;
			var items = Math.round(height/TaskHeight);
			var itemHeight = height/items;
		} else {
			var itemHeight = TaskHeight;
		}


		this.view.renderAt("div.TaskList ul", "jstProjectView", data);
		if (this.tasks.length != 0) {
			this.drawScribbles(itemHeight);
			this.view.findAll("div.TaskList li", function(item, i) {
				var size = self.tasks[i].height * TaskScale;
				size = (size < MinTaskHeight)?MinTaskHeight:size+10;
				item.style.height = size + "px";
				addSwipeHandler(item, function(element, direction) {
					if (direction == "right") {
						self.completeTask(element);
					}
				});
			});
		}

		elem.removeClass(this.view.findAll("#Project .Toolbar li button"), "current");
		elem.addClass(this.view.findAll("button."+this.filter), "current");

		this.view.find("button.incomplete span").innerHTML = this.project.incompleteCount;
		this.view.find("button.star span").innerHTML = this.project.starCount;

		if (this.scroller) {
			setTimeout(function () { 
				self.scroller.refresh();
			}, 0);
		}
		if (this.scrollTo) {
			if (this.scroller) {
				this.scroller.scrollTo(0, 0, 0);
			} else {
				this.view.find(".TaskList").scrollTop = 0;
			}
			this.scrollTo = false;
		}
	},
	drawScribbles: function(height) {
		var self = this;
		var container = document.querySelector(".task");
		var containerSize = [container.clientWidth-20, height];
		var containerRatio = containerSize[1]/containerSize[0];
		for (var i = 0; i < this.tasks.length; i++) {
			var task = this.tasks[i];
			if (task.path && (!UseImage || (UseImage && !task.imageData))) {
				if (UseImage)
					var s = new Scribble(this.view.find(".TaskList"), true);
				else
					var s = new Scribble(document.getElementById("Scribble_"+i), true);
				/*
				var scale = 0;
				var taskRatio = task.height/task.width;
				if (taskRatio > containerRatio) {
					scale = containerSize[1]/task.height;
				} else {
					scale = containerSize[0]/task.width;
				}
				s.canvas.width = containerSize[0];
				s.canvas.height = containerSize[1];
				if (scale < 1)
					s.scale(scale, scale);
				*/
				s.scale(TaskScale, TaskScale);
				s.load(task.path, task.bounds[0]);
				if (UseImage) {
					task.imageData = s.imageData();
					s.clear();
					var img = new Image();
					img.src = task.imageData;
					var taskNode = this.view.find("#Scribble_"+i);
					taskNode.innerHTML = '';
					taskNode.appendChild(img)
					task.save();
				} else {
					self.scribbles.push(s);
				}
			}
		}
	},
	showAddTask: function(task) {
		var self = this;
		var atc = new AddTaskController("AddTask");
		atc.bind("add", function(task) { 
			self.addTask(task); 
		});
		atc.bind("close", function() {
			APP.enableScrolling(); 
			this.destroy();
		});
		atc.show(task);
	},
	addTask: function(task) {
		var self = this;
		if (!(task instanceof Task)) {
			task.project = this.project.key;
			task = new Task(task);
			if (task.star) {
				APP.data.badgeCount++;
				APP.updateBadge();
			}
		}
		this.project.addTask(task, function(project, task) {
			self.loadTasks();
		});
	},
	starTask: function(task) {
		var self = this;
		task.star = !task.star;
		if (task.star) {
			APP.data.badgeCount++;
			APP.updateBadge();
		} else {
			APP.data.badgeCount--;
			APP.updateBadge();
		}
		task.save(function() {
			self.loadTasks();
		});
	},
	setPriority: function(task, priority) {
		var self = this;
		task.priority = priority;
		task.save(function() {
			self.loadTasks();
		});
	},
	completeTask: function(taskElement) {
		var self = this;
		var index = taskElement.getAttribute("data-index");
		var task = self.tasks[index];
		if (task.isComplete)
			elem.removeClass(this.view.find("li[data-index='"+index+"'] .complete"), "c");
		else
			elem.addClass(this.view.find("li[data-index='"+index+"'] .complete"), "c");
		//taskElement.style.opacity = 0;
		setTimeout(function() {
			if (task.isComplete)
				task.unComplete();
			else
				task.complete();
			task.save(function(t) {
				self.loadTasks();
			});
		}, 200);
	}
});

var TaskHeight = 165;
var MinTaskHeight = 100;
var TaskScale = 0.4;
var PageSize = 15;
var ProjectController = PageController.extend({
	init: function(elementId, project) {
		var self = this;
		this._super(elementId);
		this.project = project;
		this.scribbles = [];
		this.allTasks = null;
		this.filter = "incomplete";
		this.currentPage = 0;
		this.scrollTo = true;

		if (APP.browser.isMobile) {
			this.scroller = new iScroll(this.view.find(".TaskList ul"), { checkDOMChanges: false, desktopCompatibility: false });
			window.addEventListener('orientationChanged', this);
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

		this.view.find(".Loading").style.display = "block";
		this.loadTasks();
	},
	destroy: function() {
		window.removeEventListener('orientationChanged', this);
		if (this.scroller)
			this.scroller.destroy();
		this.scroller = null;
		this.allTasks = null;
		this.project = null;
		this.filter = null;
		this.scribbles.each(function(s) {
			s.destroy();
		});
		this.scribbles = null;
		this.tasks = null;
		this.view.find(".TaskList ul").innerHTML = "";
		this._super();
	},
	handleEvent: function(e) {
		this._super(e);
		var self = this;
		switch (e.type) {
			case "orientationChanged":
				setTimeout(function () { self.scroller.refresh(); }, 0);
				break;
		}
	},
	actions: {
		menu: function(e) {
			var self = this;
			var index = e.target.getAttribute("data-index");
			var task = this.tasks[index];
			var taskMenu = new TaskMenuController("TaskMenu", this.project, task);
			var close = function() {
				self.view.find("[data-type='title']").removeAttribute('readonly');
				taskMenu.hide();
				taskMenu.destroy();
			}
			taskMenu.bind("taskMoved", function() {
				close();	
				self.allTasks = null;
				self.loadTasks();
			});
			taskMenu.bind("taskDeleted", function() {
				close();
				self.allTasks = null;
				self.loadTasks();
			});
			taskMenu.bind("close", function() {
				close();
			});
			this.view.find("[data-type='title']").setAttribute("readonly", "readonly");
			taskMenu.show();
		},
		viewMore: function(e) {
			this.currentPage++;
			this._render();
		},
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
		closePriority: function(e) {
			e.target.parentNode.style.display = "none";
		},
		'priority': function(e) {
			if (e.target.nodeName == "SPAN")
				e.target.parentNode.nextSibling.style.display = "block";
			else
				e.target.nextSibling.style.display = "block";
			//this.view.find(".PriorityChooser").style.display = "block";
		},
		'setPriority': function(e) {
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
			this.trigger("back");
		}
	},
	show: function() {
		this._super();
		this.element.style.display = "-webkit-box";
	},
	getVisibleTasks: function() {
		return this.tasks.slice(0, (this.currentPage+1)*PageSize);
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
		var filter = function() {
			self.tasks = self.allTasks.filter(Task.filters[self.filter]);
			self.tasks.sort(Task.sort[self.filter]);
			self._render();
		};
		if (!self.allTasks) {
			this.project.getTasks(function(tasks) {
				self.allTasks = tasks;
				filter();
			});
		} else {
			filter();
		}
	},
	_render: function() {
		var self = this;
		var tasks = this.getVisibleTasks();
		var data = { project: this.project, tasks: tasks, hasMore: (tasks.length != this.tasks.length), projects: null };

		var itemHeight = TaskHeight;
		
		this.view.find(".Loading").style.display = "none";
		var e = this.view.find("div.TaskList ul");
		this.view.renderAt(e, "jstProjectView", data, function() {
			if (self.tasks.length != 0) {
				self.drawScribbles(itemHeight);
				self.view.findAll("div.TaskList li.taskItem", function(item, i) {
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

			elem.removeClass(self.view.findAll("#Project .Toolbar li button"), "current");
			elem.addClass(self.view.findAll("button."+self.filter), "current");

			self.view.findAll("button.incomplete span", function(elem, i) { elem.innerHTML = self.project.incompleteCount; });
			self.view.findAll("button.star span", function(elem, i) { elem.innerHTML = self.project.starCount; });

			self.enableEvents();

			if (self.scroller) {
				setTimeout(function () { 
					self.scroller.refresh();
				}, 0);
			}
			if (self.scrollTo) {
				if (self.scroller) {
					self.scroller.scrollTo(0, 0, 0);
				} else {
					self.view.find(".TaskList").scrollTop = 0;
				}
				self.scrollTo = false;
			}
		});
	},
	drawScribbles: function(height) {
		var self = this;
		var tasks = this.getVisibleTasks();
		for (var i = 0, c = tasks.length; i < c; i++) {
			var task = tasks[i];
			if (task.path) {
				var elem = document.getElementById("Scribble_"+task.key);
				var s = new Scribble(elem, true);
				s.scale(TaskScale, TaskScale);
				s.load(task.path, task.bounds[0]);
				self.scribbles.push(s);
			} 
		}
	},
	showAddTask: function(task) {
		var self = this;
		var atc = new AddTaskController("AddTask");
		atc.bind("add", function(tasks) { 
			self.addTask(tasks); 
		});
		atc.bind("close", function() {
			APP.enableScrolling(); 
            if (window.innerWidth < 500)
                this.slideUp();
            else
                this.hide();
			this.destroy();
		});
		atc.show();
		atc.setTask(task);
        if (window.innerWidth < 500)
            atc.slideDown();
	},
	addTask: function(tasks) {
		var self = this;
		var add = function(tasks, index,  cb) {
			if (tasks.length == index) {
				cb();
				return;
			}
			var task = tasks[index];
			if (!(task instanceof Task)) { //New Task
				task = new Task(task);
				self.project.addTask(task, function(project, task) {
					self.allTasks.push(task);
					add(tasks, index+1, cb);
				});
			} else { // Update Task
				task.save(function(task) {
					add(tasks, index+1, cb);
				});
			}
		}
		add(tasks, 0, function() {
			setTimeout(function() {
				self.loadTasks();
			}, 50);
		});
	},
	starTask: function(task) {
		this.disableEvents();
		var self = this;
		task.star = !task.star;
		self.loadTasks();
		task.save(function() {
		});
	},
	setPriority: function(task, priority) {
		this.disableEvents();
		var self = this;
		task.priority = priority;
		self.loadTasks();
		task.save(function() {
		});
	},
	completeTask: function(taskElement) {
		this.disableEvents();
		var self = this;
		var index = taskElement.getAttribute("data-index");
		var task = self.tasks[index];
		if (task.isComplete)
			elem.removeClass(this.view.find("li[data-index='"+index+"'] .completedTask"), "c");
		else
			elem.addClass(this.view.find("li[data-index='"+index+"'] .completedTask"), "c");
		//taskElement.style.opacity = 0;
		setTimeout(function() {
			if (task.isComplete)
				task.unComplete();
			else
				task.complete();
			self.loadTasks();
			task.save();
		}, 200);
	}
});

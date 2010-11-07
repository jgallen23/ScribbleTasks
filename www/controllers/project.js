var ScribbleSize = [750, 300];
var ProjectController = Controller.extend({
	init: function(elementId, project) {
		var self = this;
		this._super(elementId);
		this.filter = "incomplete";
		this.project = project;

		this.addTaskController = new AddTaskController("AddTask");
		this.addTaskController.bind("add", function(task) { self.addTask(task); });
		this.addTaskController.bind("cancel", function() { self.enableScrolling(); self.addTaskController.hide(); });

		this.loadTasks();
	},
	onClick: {
		'star': function(e) {
			var index = e.target.parentNode.getAttribute("data-index");
			var task = this.tasks[index];
			this.starTask(task);
		},
		'add': function(e) {
			this.showAddTask();
		},
		'clear': function(e) {
			Project.data.provider.nuke();
			Task.data.provider.nuke();
		},
		'task': function(e) {
			var task = this.tasks[this.view.findParentWithAttribute(e.target, 'data-index').getAttribute("data-index")];
			this.showAddTask(task);
		},
		'complete': function(e) {
			var task = this.tasks[this.view.findParentWithAttribute(e.target, 'data-index').getAttribute("data-index")];
			this.completeTask(task);
		},
		'filterAll': function(e) {
			this.filter = "incomplete";
			this.loadTasks();
		},
		'filterComplete': function(e) {
			this.filter = "complete";
			this.loadTasks();
		},
		'filterStarred': function(e) {
			this.filter = "starred";
			this.loadTasks();
		}
	},
	loadTasks: function() {
		var self = this;
		this.project.getTasks(function(tasks) {
			console.log("tasks");
			tasks = tasks.filter(Task.filters[self.filter]);
			self.tasks = tasks;
			self._render();
		});
	},
	_render: function() {
		var data = { project: this.project, tasks: this.tasks };
		this.view.render("jstProjectView", data);
		this.drawScribbles();
	},
	drawScribbles: function() {
		var self = this;
		for (var i = 0; i < this.tasks.length; i++) {
			var task = this.tasks[i];
			if (task.svg) {
				var s = new Scribble(document.getElementById("Scribble_"+i), ScribbleSize[0]/2, ScribbleSize[1]/2);
				s.readonly = true;
				s.load(task.svg);
				s.scale([.5, .5, 0, 0]);
				s.paper.canvas.addEventListener("click", function(e) {
					self.onClick['task'].call(self, e);
				});
			}
		}
	},
	showAddTask: function(task) {
		this.disableScrolling();
		this.addTaskController.show(task);
	},
	addTask: function(task) {
		this.enableScrolling();
		this.addTaskController.hide();
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
			self.loadTasks();
		});
	},
	completeTask: function(task) {
		if (task.isComplete)
			task.unComplete();
		else
			task.complete();
		var self = this;
		task.save(function() {
			self.loadTasks();
		});
	}
});

var ScribbleSize = [750, 300];
var ProjectController = Class.extend({
	init: function(project) {
		var self = this;
		this.project = project;
		this.view = new ProjectView("Project");
		this.view.bind("star", function(task) { self.starTask(task); });
		this.view.bind("add", function() { self.showAddTask(); });
		this.view.bind("task", function(task) { self.showAddTask(task); });
		this.addTaskView = new AddTaskView("AddTask");
		this.addTaskView.bind("add", function(task) { self.addTask(task); });
		this.addTaskView.bind("cancel", function() { self.enableScrolling(); self.addTaskView.hide(); });

		this.loadTasks();
	},
	loadTasks: function() {
		var self = this;
		Task.data.findByProject(this.project.key, function(tasks) {
			self.view.setTasks(self.project, tasks);
		});
	},
	showAddTask: function(task) {
		this.disableScrolling();
		this.addTaskView.show(task);
	},
	addTask: function(task) {
		this.enableScrolling();
		this.addTaskView.hide();
		var self = this;
		if (!(task instanceof Task)) {
			task.project = this.project.key;
			task = new Task(task);
		}
		task.save(function(task) {
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
	preventScrolling: function(e) {
		e.preventDefault(); 
	},
	enableScrolling: function() {
		document.removeEventListener("touchmove", this.preventScrolling, false);
	},
	disableScrolling: function() {
		document.addEventListener("touchmove", this.preventScrolling, false);
	}
});

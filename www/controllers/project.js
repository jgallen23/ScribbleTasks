var ScribbleSize = [750, 300];
var ProjectController = Class.extend({
	init: function(project) {
		var self = this;
		this.filter = "incomplete";
		this.project = project;
		this.view = new ProjectView("Project");
		this.view.bind("star", function(task) { self.starTask(task); });
		this.view.bind("add", function() { self.showAddTask(); });
		this.view.bind("task", function(task) { self.showAddTask(task); });
		this.view.bind("complete", function(task) { self.completeTask(task); });
		this.view.bind("filterAll", function() { self.filter = "incomplete"; self.loadTasks(); });
		this.view.bind("filterStarred", function() { self.filter = "starred"; self.loadTasks(); });
		this.view.bind("filterComplete", function() { self.filter = "complete"; self.loadTasks(); });
		this.addTaskView = new AddTaskView("AddTask");
		this.addTaskView.bind("add", function(task) { self.addTask(task); });
		this.addTaskView.bind("cancel", function() { self.enableScrolling(); self.addTaskView.hide(); });

		this.loadTasks();
	},
	loadTasks: function() {
		var self = this;
		this.project.getTasks(function(tasks) {
			console.log("tasks");
			tasks = tasks.filter(Task.filters[self.filter]);
			self.view.setTasks(self.project, tasks);
		});
	},
	showAddTask: function(task) {
		this.disableScrolling();
		this.addTaskView.show(task);
	},
	addTask: function(task) {
		console.log("add task");
		this.enableScrolling();
		this.addTaskView.hide();
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

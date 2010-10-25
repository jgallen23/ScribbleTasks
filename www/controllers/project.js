var ProjectController = Class.extend({
	init: function(project) {
		var self = this;
		this.project = project;
		this.view = new ProjectView("Project");
		this.view.bind("star", function(task) { self.starTask(task); });
		this.view.bind("add", function() { self.showAddTask(); });
		this.addTaskView = new AddTaskView("AddTask");
		this.addTaskView.bind("add", function(task) { self.addTask(task); });
		this.addTaskView.bind("cancel", function() { self.addTaskView.hide(); });

		this.loadTasks();
	},
	loadTasks: function() {
		var self = this;
		Task.data.findByProject(this.project.key, function(tasks) {
			self.view.setTasks(self.project, tasks);
		});
	},
	showAddTask: function() {
		this.addTaskView.show();
	},
	addTask: function(task) {
		this.addTaskView.hide();
		var self = this;
		task.project = this.project.key;
		var t = new Task(task);
		t.save(function(task) {
			self.loadTasks();
		});
	},
	starTask: function(task) {
		var self = this;
		task.star = !task.star;
		task.save(function() {
			self.loadTasks();
		});
	}
});

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
		
		this.navBar = new followAlong("Header");

		this.loadTasks();
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
		'clear': function(e) {
			Project.data.provider.nuke();
			Task.data.provider.nuke();
            this.loadTasks();
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
			elem.removeClass(this.view.find("button."+this.filter), "current");
			elem.addClass(this.view.find("button.incomplete"), "current");
			this.filter = "incomplete";
			this.loadTasks();
		},
		'filterComplete': function(e) {
			elem.removeClass(this.view.find("button."+this.filter), "current");
			elem.addClass(this.view.find("button.complete"), "current");
			this.filter = "complete";
			this.loadTasks();
		},
		'filterStarred': function(e) {
			elem.removeClass(this.view.find("button."+this.filter), "current");
			elem.addClass(this.view.find("button.starred"), "current");
			this.filter = "starred";
			this.loadTasks();
		}
	},
	loadTasks: function() {
		var self = this;
		this.view.find(".title").innerHTML = this.project.name;
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
		window.scroll(0,0);
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

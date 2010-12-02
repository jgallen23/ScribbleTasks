var TaskMenuController = Controller.extend({
	init: function(elementId, project, task) {
		this._super(elementId);
		this.task = task;
		this.project = project;
		this.loadProjects();
	},
	destroy: function() {
		this._super();
		this.view.find("select.project").removeEventListener("change", this);
	},
	loadProjects: function() {
		var self = this;
		Project.data.find(function(projects) {
			projects.sort(Project.sort.alpha);
			self.projects = projects;
			self._render();
		});
	},
	_render: function() {
		var data = { projects: this.projects, task: this.task, project: this.project };
		this.view.render("jstTaskMenu", data);
		this.view.find("select.project").addEventListener("change", this);
	},
	onClick: {
		close: function(e) {
			this.hide();
			this.trigger("close");
		},		
		'delete': function(e) {
			var self = this;
			this.project.removeTask(this.task, function() {
				Task.data.remove(self.task, function() {
					self.trigger("taskDeleted");
				});
			});
		}
	},
	handleEvent: function(e) {
		this._super(e);
		var self = this;
		if (e.type == "change") {
			if (e.target.className == "project") {
				var project = this.projects[e.target.value];
				if (project.key != this.project.key) {
					this.project.moveTask(this.task, project, function(project1, project2, task) {
						self.trigger("taskMoved");
					});
				}
			}
		}
	}
});


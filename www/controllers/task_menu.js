var TaskMenuController = Controller.extend({
	init: function(elementId, project, task) {
		var self = this;
		this._super(elementId);
		this.task = task;
		this.project = project;
		if (!this.project && this.task.projectKey) {
			Project.data.get(this.task.projectKey, function(project) {
				self.project = project;
			});
		}
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
		var data = { projects: this.projects, task: this.task };
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
			var d = function(index) {
				if (index == 0) { //OK
					self.project.removeTask(self.task, function() {
						Task.data.remove(self.task, function() {
							self.trigger("taskDeleted");
						});
					});
				}
			}
			var msg = "Are you sure you want to delete that task?";
			if (APP.browser.isPhoneGap) {
				navigator.notification.confirm(msg, d);
			} else {
				if (confirm(msg)) d(0);
			}
		}
	},
	handleEvent: function(e) {
		this._super(e);
		var self = this;
		if (e.type == "change") {
			if (e.target.className == "project") {
				var project = this.projects[e.target.value];
				if (this.project && project.key != this.project.key) {
						this.project.moveTask(this.task, project, function(project1, project2, task) {
							self.trigger("taskMoved");
						});
				} else {
					project.addTask(this.task, function() {
						self.trigger("taskMoved");
					});
				}
			}
		}
	}
});


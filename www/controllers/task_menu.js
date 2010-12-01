var TaskMenuController = Controller.extend({
	init: function(elementId, task) {
		this._super(elementId);
		this.task = task;
		this.loadProjects();
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
	}
});


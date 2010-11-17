var ProjectListController = Controller.extend({
	init: function(elementId) {
		var self = this;
		this._super(elementId);
		this.filter = "active";
		this.projects = null;
		this.loadProjects();
	},
	loadProjects: function() {
		var self = this;
		Project.data.find(function(projects) {
			self.projects = projects;
			self._render();
		});
	},
	_render: function() {
		var data = { projects: this.projects };
		this.view.renderAt("div.ProjectList ul", "jstProjectListView", data);
	},
	showProject: function(project) {
		var projectController = new ProjectController("Project", project);
		projectController.parentController = this;
		this.hide();
		projectController.show();
	},
	show: function() {
		this.loadProjects();
		this._super();
	},
	onClick: {
		'project': function(e) {
			var project = this.projects[parseInt(e.target.getAttribute("data-index"))];
			this.showProject(project);
		},
		'add': function(e) {
			this.showProject(new Project());
		}
	}
});

var ProjectListController = Controller.extend({
	init: function(elementId) {
		var self = this;
		this._super(elementId);
		this.filter = "active";
		this.projects = null;

		if (APP.browser.isMobile) {
			this.scroller = new iScroll("Projects", { checkDOMChanges: false, desktopCompatibility: true });
		}

		this.loadProjects();
	},
	destroy: function() {
		if (this.scroller)
			this.scroller.destroy();
		this.scroller = null;
		this._super();
	},
	loadProjects: function() {
		var self = this;
		APP.data.badgeCount = 0;
		Project.data.find(function(projects) {
			projects.each(function(project) {
				APP.data.badgeCount += project.starCount;
			});
			APP.updateBadge();
			self.projects = projects;
			self.trigger("loaded");
			self._render();
		});
	},
	_render: function() {
		var self = this;
		var data = { projects: this.projects };
		this.view.renderAt("div.ProjectList ul", "jstProjectListView", data);
		if (this.scroller)
			setTimeout(function () { self.scroller.refresh() }, 0)
	},
	showProject: function(project) {
		var projectController = new ProjectController("Project", project);
		projectController.parentController = this;
		this.hide();
		projectController.show();
		return projectController;
	},
	show: function() {
		this.loadProjects();
		this._super();
		this.element.style.display = "-webkit-box";
	},
	onClick: {
		'project': function(e) {
			var project = this.projects[parseInt(e.target.getAttribute("data-index"))];
			this.showProject(project);
		},
		'add': function(e) {
			this.showProject(new Project());
		},
		'clear': function(e) {
			Project.data.provider.nuke();
			Task.data.provider.nuke();
			var self = this;
			setTimeout(function() {
				self.loadProjects();
			}, 1000);
		},

	}
});

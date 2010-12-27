var ProjectListController = PageController.extend({
	init: function(elementId) {
		var self = this;
		this._super(elementId);
		this.filter = "active";
		this.projects = null;

		if (APP.browser.isMobile) {
			this.scroller = new iScroll(this.view.find(".ProjectList ul"), { checkDOMChanges: false, desktopCompatibility: false });
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
		Project.data.find(function(projects) {
			projects.sort(Project.sort.starred);
			self.projects = projects;
			self._render();
		});
	},
	_render: function() {
		var self = this;
		var data = { projects: this.projects };
		this.view.renderAt("div.ProjectList ul", "jstProjectListView", data);
		this.view.find("button.star span").innerHTML = localStorage['totalStarCount'] || 0;
		this.trigger("loaded");
		if (this.scroller) {
			setTimeout(function () { self.scroller.refresh() }, 100)
		}
	},
	showProject: function(project) {
		var projectController = new ProjectController("Project", project);
		var self = this;
		projectController.bind("back", function() {
			/*self.show();*/
			/*this.hide();*/
			self.loadProjects();
			this.slideOut(self);
			this.destroy();
		});
		//this.hide();
		//projectController.show();
		this.slideIn(projectController);
		return projectController;
	},
	showSearch: function(filterName, filter, sort) {
		var self = this;
		var searchController = new SearchController("SearchResults", filterName, filter, sort);
		searchController.bind("back", function() {
			/*self.show();*/
			/*this.hide();*/
			self.loadProjects();
			this.slideOut(self);
			this.destroy();
		});
		/*this.hide();*/
		this.onClick.searchClose.call(this);
		this.slideIn(searchController);
		/*searchController.show();*/
	},
	show: function() {
		this.loadProjects();
		this._super();
		this.element.style.display = "-webkit-box";
	},
	onClick: {
		searchOldTasks: function(e) {
			var oldDate = new Date().getTime() - 1000*60*60*24*14; //secs*mins*hours
			oldDate = new Date().getTime();
			this.showSearch("Old Tasks", function(t) {
				return (!t.isComplete && t.createdOn < oldDate);
			}, function(a, b) {
				return a.createdOn - b.createdOn;
			});
		},
		searchNoProject: function(e) {
			this.showSearch("No Project", function(t) {
				return (!t.isComplete && t.projectKey == null);
			});
		},
		searchIncomplete: function(e) {
			this.showSearch("Incomplete", Task.filters.incomplete);
		},
		searchStarred: function(e) {
			this.showSearch("Starred", Task.filters.star);
		},
		searchHighPriority: function(e) {
			this.showSearch("High Priority", Task.filters.highPriority);
		},
		searchMediumPriority: function(e) {
			this.showSearch("Medium Priority", Task.filters.mediumPriority);
		},
		search: function(e) {
			this.view.find("#SearchPopup").style.display = "-webkit-box";
		},
		searchClose: function(e) {
			this.view.find("#SearchPopup").style.display = "none";
		},
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
		'delete': function(e) {
			var self = this;
			var project = this.projects[parseInt(e.target.getAttribute("data-index"))];
			var a = confirm("Are you sure you want to delete "+project.name);
			if (a) {
				Project.data.remove(project, function() {
					self.loadProjects();
				});				
			}
		},
		'debug': function(e) {
			var self = this;
			var d = new DebugController('DebugMenu');
			d.bind("restored", function() {
				this.hide();
				this.destroy();
				self.loadProjects();
			});
			d.bind("close", function() {
				this.hide();
				this.destroy();
			});
			d.show();
		}

	}
});

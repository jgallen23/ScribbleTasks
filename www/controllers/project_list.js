var ProjectListController = PageController.extend({
	init: function(elementId) {
		var self = this;
		this._super(elementId);
		this.filter = "active";
		this.projects = null;

		if (APP.browser.isMobile) {
			this.scroller = new iScroll(this.view.find(".ProjectList ul"), { checkDOMChanges: false, desktopCompatibility: false });
			window.addEventListener('orientationChanged', this);
		}

		this.view.find(".Loading").style.display = "block";
		this.loadProjects();
	},
	destroy: function() {
		window.removeEventListener('orientationChanged', this);
		if (this.scroller)
			this.scroller.destroy();
		this.scroller = null;
		this._super();
	},
	handleEvent: function(e) {
		this._super(e);
		var self = this;
		switch (e.type) {
			case "orientationChanged":
				setTimeout(function () { self.scroller.refresh(); }, 0);
				break;
		}
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
		this.view.renderAt("div.ProjectList ul", "jstProjectListView", data, function() {
			self.view.find(".Loading").style.display = "none";
			self.view.findAll("button.star span", function(elem) { elem.innerHTML = localStorage['totalStarCount'] || 0 });
			self.trigger("loaded");
			if (self.scroller) {
				setTimeout(function () { self.scroller.refresh() }, 100)
			}
		});
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
		var searchController = new SearchController("SearchResults", this.projects, filterName, filter, sort);
		searchController.bind("back", function() {
			/*self.show();*/
			/*this.hide();*/
			self.loadProjects();
			this.slideOut(self);
			this.destroy();
		});
		/*this.hide();*/
		this.actions.searchClose.call(this);
		this.slideIn(searchController);
		/*searchController.show();*/
	},
	show: function() {
		this.loadProjects();
		this._super();
		this.element.style.display = "-webkit-box";
	},
	actions: {
        refresh: function(e) {
            var self = this;
            this.view.find(".ProjectList ul").innerHTML = "";
            this.view.find(".Loading").style.display = "block";
			APP.debug.updateCounts();
            setTimeout(function() {
               self.loadProjects(); 
            }, 2000);
        },
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
			var d = function(index) {
				if (index == 0) {
					project.remove(function() {
						self.loadProjects();
					});
				}
			}
			var msg = "Are you sure you want to delete "+project.name;
			if (APP.browser.isPhoneGap) {
				navigator.notification.confirm(msg, d);
			} else {
				if (confirm(msg)) d(0);
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

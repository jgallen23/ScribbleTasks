var SearchController = ProjectController.extend({
	init: function(elementId, projects, filterName, filter, sort) {
		this.searchFilterName = filterName;
		this.searchFilter = filter;
		this.sort = sort || Task.sort.incomplete;
		this.projects = {};
		var self = this;
		projects.each(function(project) {
			self.projects[project.key] = project;
		});
		this._super(elementId, null);
	},
	loadTasks: function() {
		var self = this;
		this.view.find("[data-type='title']").innerHTML = this.searchFilterName;
        var filter = function() {
            self.tasks = self.allTasks.filter(self.searchFilter);
			self.tasks.sort(self.sort);
			self._render();
        }
        if (!self.allTasks) {
			Task.data.find(function(tasks) {
				self.allTasks = tasks;
				filter();
			});
        } else {
            filter();
        }
	},
	_render: function() {
		var self = this;
		var tasks = this.getVisibleTasks();
		var data = { tasks: tasks, hasMore: (tasks.length != this.tasks.length), projects: this.projects };

        var minHeight = MinTaskHeight + 30;

		this.view.find(".Loading").style.display = "none";
		this.view.renderAt("div.TaskList ul", "jstProjectView", data, function() {
            if (self.tasks.length != 0) {
                self.drawScribbles();
                self.view.findAll("div.TaskList li.taskItem", function(item, i) {
                    var size = self.tasks[i].height * TaskScale;
                    size = (size < minHeight)?minHeight:size+30;
                    item.style.height = size + "px";
                    addSwipeHandler(item, function(element, direction) {
                        if (direction == "right") {
                            self.completeTask(element);
                        }
                    });
                });
            }

            self.view.findAll("header button.hasCount span", function(elem, i) { elem.innerHTML = self.tasks.length; });
			self.enableEvents();

            if (self.scroller) {
                setTimeout(function () { 
                    self.scroller.refresh();
                }, 0);
            }
            if (self.scrollTo) {
                if (self.scroller) {
                    self.scroller.scrollTo(0, 0, 0);
                } else {
                    self.view.find(".TaskList").scrollTop = 0;
                }
                self.scrollTo = false;
            }
        });
	},

});

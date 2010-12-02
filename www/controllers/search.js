var SearchController = ProjectController.extend({
	init: function(elementId, filterName, filter) {
		this.searchFilterName = filterName;
		this.searchFilter = filter;
		this._super(elementId, null);
	},
	loadTasks: function() {
		var self = this;
		this.view.find("[data-type='title']").value = this.searchFilterName;
		Task.data.find(function(tasks) {
			tasks = tasks.filter(self.searchFilter);
			tasks.sort(Task.sort.incomplete);
			self.tasks = tasks;
			self._render();
		});
	},
	_render: function() {
		var self = this;
		var data = { tasks: this.tasks, useImage: UseImage, canEditTask: false };

		var itemHeight = TaskHeight;

		this.view.renderAt("div.TaskList ul", "jstProjectView", data);
		if (this.tasks.length != 0) {
			this.drawScribbles(itemHeight);
			this.view.findAll("div.TaskList li.taskItem", function(item, i) {
				var size = self.tasks[i].height * TaskScale;
				size = (size < MinTaskHeight)?MinTaskHeight:size+10;
				item.style.height = size + "px";
				addSwipeHandler(item, function(element, direction) {
					if (direction == "right") {
						self.completeTask(element);
					}
				});
			});
		}

		if (this.scroller) {
			setTimeout(function () { 
				self.scroller.refresh();
			}, 0);
		}
		if (this.scrollTo) {
			if (this.scroller) {
				this.scroller.scrollTo(0, 0, 0);
			} else {
				this.view.find(".TaskList").scrollTop = 0;
			}
			this.scrollTo = false;
		}
	},

});

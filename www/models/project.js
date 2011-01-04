var Project = Model.extend({
	init: function(initial) {
		this._data = {
			key: '',
			name: '',
			note: null,
			createdOn: null,
			modifiedOn: null,
			taskIds: []
		}
		this._super(initial);
		this.__defineProperty__("starCount", this.starCount);
		this.__defineProperty__("incompleteCount", this.incompleteCount);

		var fromISODate = function(dateString) {
			return new Date(((dateString || '').replace(/-/g,'/').replace(/[TZ]/g,' ').split(".")[0]));
		}

		if (!this.createdOn)
			this.createdOn = new Date().getTime();

		var needSave = false;
		if (typeof this._data.createdOn === "string") {
			this._data.createdOn = fromISODate(this._data.createdOn).getTime();
			needSave = true;
		}

		if (typeof this._data.modifiedOn === "string") {
			this._data.modifiedOn = fromISODate(this._data.modifiedOn).getTime();
			needSave = true;
		}

		if (needSave)
			this.save();
	},
	starCount: function() {
		return localStorage.getItem(String.format("starCount_{0}", this.key)) || 0;
	},
	incompleteCount: function() {
		return localStorage.getItem(String.format("taskCount_{0}", this.key)) || 0;
	},
	_propertySet: function(prop, value) {
		if (!['completeCount', 'incompleteCount', 'starCount'].contains(prop))
			this._data.modifiedOn = new Date().getTime();
		this._super(prop, value);
	},
	save: function(cb) {
		Project.data.save(this, cb);
	},
	getTasks: function(cb) {
		/*
		this.starCount = 0;
		this.completeCount = 0;
		this.incompleteCount = 0;
		*/
		var self = this;
		Task.data.findByIds(this.taskIds, function(tasks) {
			tasks.each(function(task) {
				task.parent = self;
				//TODO: REMOVE
				/*
				if (!task.projectKey || (self.key && task.projectKey != self.key)) {
					task.projectKey = self.key;
					task.save();
				}
				if (task.isComplete)
					self.completeCount++;
				else {
					self.incompleteCount++;
					if (task.star)
						self.starCount++;
				}
				*/
			});
			cb(tasks);	
			self.save();
		});
	},
	addTask: function(task, cb) {
		var self = this;
		task.project = self;
		task.projectKey = self.key;
		task.save(function(task) {
			if (!self.taskIds.contains(task.key)) {
				self.taskIds = self.taskIds.insert(0, task.key);
				self.save(function(project) {
					APP.notificationCenter.trigger("project.taskAdded", [project, task]);
					if (cb) cb(project, task);
				});
			} else {
				if (cb) cb(self, task);
			}
		});
	},
	removeTask: function(task, cb) {
		var self = this;
		this.taskIds.removeItem(task.key);
		self.save(function(project) {
			APP.notificationCenter.trigger("project.taskRemoved", [self, task]);
			cb(self);
		});
	},
	moveTask: function(task, project, cb) {
		this.removeTask(task, function(project1) {
			project.addTask(task, function(project2, task) {
				cb(project1, project2, task);
			});
		});
	},
	remove: function(cb) {
		var self = this;
		Project.data.remove(this, function() {
			APP.notificationCenter.trigger("project.removed", [self]);
			if (cb) cb();
		});
	}
});
Project.sort = {
	starred: function(a, b) {
		var star = b.starCount - a.starCount;
		if (star == 0) {
			var incomplete = b.incompleteCount - a.incompleteCount;
			if (incomplete == 0) {
				return b.modifiedOn - a.modifiedOn;
			}
			return incomplete
		}
		return star;
	},
	alpha: function(a, b) {
		if (a.name < b.name)
			return -1;
		else if (b.name < a.name)
			return 1;
		else
			return 0;
	}
}
Project.data = new ProjectDataProvider();

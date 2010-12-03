var Project = Model.extend({
	init: function(initial) {
		this._data = {
			key: '',
			name: '',
			note: null,
			createdOn: null,
			modifiedOn: null,
			taskIds: [],
			starCount: 0,
			completeCount: 0,
			incompleteCount: 0
		}
		this._super(initial);
		this.createdOn = new Date();
	},
	_propertySet: function(prop, value) {
		this._data.modifiedOn = new Date();
	},
	save: function(cb) {
		Project.data.save(this, cb);
	},
	getTasks: function(cb) {
		this.starCount = 0;
		this.completeCount = 0;
		this.incompleteCount = 0;
		var self = this;
		var propBind = function(prop, value) {
			self._taskPropertyEvent(prop, value);
		}
		Task.data.findByIds(this.taskIds, function(tasks) {
			tasks.each(function(task) {
				task.parent = self;
				//TODO: REMOVE
				if (!task.projectKey || task.projectKey != self.key) {
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
				task.unbind("propertySet");
				task.bind("propertySet", propBind);
			});
			cb(tasks);	
			self.save();
		});
	},
	_taskPropertyEvent: function(prop, value) {
		//console.log("prop change", prop, value);
		switch (prop) {
			case 'completedOn':
				if (value) {
					this.completeCount++;
					this.incompleteCount--;
					value = false;
				} else {
					this.completeCount--;
					this.incompleteCount++;
					value = true;
				}
			case 'star':
				if (value)
					this.starCount++;
				else
					this.starCount--;
				this.save();
				APP.updateBadge();
				break;	
		}
	},
	addTask: function(task, cb) {
		var self = this;
		task.project = self;
		task.projectKey = self.key;
		task.save(function(task) {
			if (!self.taskIds.contains(task.key)) {
				self.taskIds = self.taskIds.insert(0, task.key);
				self.incompleteCount++;
				if (task.star)
					self.starCount++;
				self.save(function(project) {
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
			cb(self);
		});
	},
	moveTask: function(task, project, cb) {
		this.removeTask(task, function(project1) {
			project.addTask(task, function(project2, task) {
				cb(project1, project2, task);
			});
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

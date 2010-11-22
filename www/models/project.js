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
		Task.data.findByIds(this.taskIds, function(tasks) {
			tasks.each(function(task) {
				task.parent = self;
				if (task.isComplete)
					self.completeCount++;
				else {
					self.incompleteCount++;
					if (task.star)
						self.starCount++;
				}
			});
			cb(tasks);	
		});
	},
	addTask: function(task, cb) {
		var self = this;
		var update = true;
		if (!task.key) {
			update = false;
		}
		task.project = self;
		task.save(function(task) {
			if (!update) {
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
	}
});
Project.data = new ProjectDataProvider();

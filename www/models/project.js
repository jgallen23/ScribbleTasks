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

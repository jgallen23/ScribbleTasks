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
		this.createdOn = new Date();
	},
	_propertySet: function(prop, value) {
		this._data.modifiedOn = new Date();
	},
	save: function(cb) {
		Project.data.save(this, cb);
	},
	getTasks: function(cb) {
		Task.data.findByIds(this.taskIds, function(tasks) {
			cb(tasks);	
		});
	},
	addTask: function(task, cb) {
		var self = this;
		var update = true;
		if (!task.key) {
			update = false;
		}
		task.save(function(task) {
			if (!update) {
				self.taskIds = self.taskIds.insert(0, task.key);
				self.save(function(project) {
					if (cb) cb(project, task);
				});
			} else {
				if (cb) cb(self, task);
			}
		});
	}
});
Project.data = new ProjectDataProvider();

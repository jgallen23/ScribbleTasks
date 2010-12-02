var TaskDataProvider = Class.extend({
	init: function() {
		this.tasks = null;
		this.tasksMap = null;
		this.provider = new Lawnchair({ adaptor: 'webkit', table: 'tasks'});
	},
	find: function(cb) {
		var self = this;
		if (!this.tasks) {
			this.provider.all(function(data) {
				self.tasksMap = {};
				self.tasks = [];
				data.each(function(obj) {
					var t = new Task(obj);
					self.tasks.push(t);
					self.tasksMap[t.key] = t;
				});
				cb(self.tasks);
			});
		} else {
			cb(this.tasks);
		}
	},
	findById: function(id, cb) {
		var self = this;
		this.provider.get(id, function(dbTask) {
			var t = new Task(dbTask);
			cb(t);
		});
	},
	findByIds: function(ids, cb) {
		var self = this;
		this.provider.getMany(ids, function(dbTasks) {
			var tasks = [];
			dbTasks.each(function(task) {
				var t = new Task(task);
				tasks.push(t);
			});
			cb(tasks);
		});
	},
	save: function(task, cb) {
		var self = this;
		var data = task._data;
		var update = true;
		if (!data.key) {
			update = false;
			delete data.key;
		}
		this.provider.save(data, function(data) {
			if (!update) {
				task.key = data.key;
				//self.tasksMap[task.key] = task;
				//self.tasks.push(task); 
			}
			if (cb) cb(task);
		});
	},
	remove: function(task, cb) {
		this.provider.remove(task.key, function(data) {
			cb();
		});
	}
});

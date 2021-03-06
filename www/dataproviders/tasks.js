var TaskDataProvider = Class.extend({
	init: function() {
        var error = function(trans, err) {
            console.log("SQL ERROR" + err.message);
        }
		this.provider = new Lawnchair({ adaptor: 'webkit', table: 'tasks', onError: error });
	},
	find: function(cb) {
		var self = this;
		this.provider.all(function(data) {
			var tasks = [];
			data.each(function(obj) {
				var t = new Task(obj);
				tasks.push(t);
			});
			cb(tasks);
		});
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
			if (cb) cb();
		});
	}
});

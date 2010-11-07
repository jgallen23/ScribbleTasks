var TaskDataProvider = Class.extend({
	init: function() {
		this.tasks = null;
		this.tasksMap = null;
		this.provider = new Lawnchair('tasks');
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
	findByIds: function(ids, cb) {
		var self = this;
		this.find(function(tasks) {
			var tasks = [];
			for (var i = 0; i < ids.length; i++) {
				tasks.push(self.tasksMap[ids[i]]);
			}
			cb(tasks);
		});
	},
	findByProject: function(project, cb) {
		this.find(function(tasks) {
			var filtered = tasks.filter(function(t) {
				return (t.project == project);
			});
			cb(filtered);
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
				self.tasksMap[task.key] = task;
				self.tasks.push(task); 
			}
			if (cb) cb(task);
		});
	}
});

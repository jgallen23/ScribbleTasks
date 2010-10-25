var TaskDataProvider = Class.extend({
	init: function() {
		this.tasks = null;
		this.provider = new Lawnchair('tasks');
	},
	find: function(cb) {
		var self = this;
		if (!this.tasks) {
			this.provider.all(function(data) {
				self.tasks = [];
				data.each(function(obj) {
					self.tasks.push(new Task(obj));
				});
				cb(self.tasks);
			});
		} else {
			cb(this.tasks);
		}
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
				self.tasks.push(task);
			}
			if (cb) cb(task);
		});
	}
});

var ProjectDataProvider = Class.extend({
	init: function() {
		this.projects = null;
		this.provider = new Lawnchair('projects');
	},
	find: function(cb) {
		var self = this;
		if (!this.projects) {
			this.provider.all(function(data) {
				self.projects = [];
				data.each(function(obj) {
					self.projects.push(new Project(obj));
				});
				cb(self.projects);
			});
		} else {
			cb(this.projects);
		}
	},
	save: function(project, cb) {
		var data = project._data;
		var update = true;
		if (!data.key) {
			update = false;
			delete data.key;
		}
		this.provider.save(data, function(data) {
			if (!update) {
				project.key = data.key;
			}
			if (cb) cb(project);
		});
	}
});

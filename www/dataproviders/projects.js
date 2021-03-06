var ProjectDataProvider = Class.extend({
	init: function() {
		this.provider = new Lawnchair({ adaptor: 'webkit', table: 'projects'});
	},
	find: function(cb) {
		var self = this;
		this.provider.all(function(data) {
			var projects = [];
			data.each(function(obj) {
				projects.push(new Project(obj));
			});
			cb(projects);
		});
	},
	get: function(key, cb) {
		var self = this;
		this.provider.get(key, function(data) {
			cb(new Project(data));
		});
	},
	save: function(project, cb) {
		var self = this;
		var data = project._data;
		var update = true;
		if (!data.key) {
			delete data.key;
		}
		this.provider.save(data, function(data) {
			project.key = data.key;
			if (cb) cb(project);
		});
	},
	remove: function(project, cb) {
		//TODO: delete tasks as well
		this.provider.remove(project.key, function(data) {
			cb();
		});
	}
});

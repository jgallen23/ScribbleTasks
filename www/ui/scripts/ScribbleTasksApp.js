var ScribbleTasksApp = Application.extend({
    updateBadge: function() {
		console.log("Badge: "+this.data.badgeCount);
        if (this.browser.isPhoneGap) {
            window.plugins.badge.set(this.data.badgeCount);
        }
	},
	clearImageCache: function() {
		Task.data.find(function(tasks) {
			tasks.each(function(task) {
				task.imageData = "";
				task.save();
			})
		});
    },
    backup: function(cb) {
        var data = {};
        data.projects = [];
        data.tasks = [];
        Project.data.find(function(projects) {
            projects.each(function(project) {
                data.projects.push(project._data);
            });
            Task.data.find(function(tasks) {
                tasks.each(function(task) {
					task._data.imageData = null;
                    data.tasks.push(task._data);
                });
                cb(JSON.stringify(data));
            });
        });
    },
    restore: function(data, callback) {
        data = eval("["+data+"]")[0];
        Project.data.provider.nuke();
        data.projects.each(function(project) {
            var p = new Project(project);
            p.save();
			Task.data.provider.nuke();
			data.tasks.each(function(task) {
				console.log(task);
				var t = new Task(task);
				t.save();
				if (callback) callback();
			});
        });
        
    }
});

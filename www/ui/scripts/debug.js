var debugUtils = {
	clearImageCache: function() {
		Task.data.find(function(tasks) {
			tasks.each(function(task) {
				task.imageData = "";
				task.save();
			})
		});
    },
	generateTestData: function() { 
		Task.data.find(function(tasks) {
			var task = tasks[0];
			console.log(task.projectKey);
			Project.data.get(task.projectKey, function(project) {
				for (var i = 0, c = 50; i < c; i++) {
					var t = new Task();
					t.path = task.path;
					project.addTask(t);	
				}
			});
		});
	},
	resetProjectKeys: function() {
		Task.data.find(function(tasks) {
			tasks.each(function(task) {
				task.projectKey = null;
				task.save(function(task) {
					console.log("saved");
				});
			});
			console.log("Tasks Complete");
		});
		setTimeout(function() {	
			Project.data.find(function(projects) {
				projects.each(function(project) {
					project.getTasks(function(tasks) {
						tasks.each(function(task) {
							if (!task.projectKey)
								console.log("No Project Key");
						});
						
						console.log(tasks.length);
					});
				});
				console.log("Projects Complete");
			});
		}, 30000);
		
	},
	perfTest: function() {

		var fetchTasks1 = function(project, cb) {
			var p = new PerfTest("Fetch Tasks").start();
			Task.data.find(function(tasks) {
				p.end();
				p = new PerfTest("Filter Tasks").start();
				tasks.filter(function(t) {
					return (t.projectKey == project.key);
				});
				p.end();
				cb();
			});
		}

		var fetchTasks2 = function(project) {
			var p = new PerfTest("Fetch Tasks 2").start();
			project.getTasks(function(tasks) {
				p.end();
			});
		}

		var p = new PerfTest("Fetch Projects").start();
		Project.data.find(function(projects) {
			p.end();
			var project = projects[0];
			fetchTasks1(project, function() {
				fetchTasks2(project);
			});
			
			
		});
    },
    generateImages: function() {
        var canvas = document.getElementById("tmpCanvas");
        Task.data.find(function(tasks) {
            tasks.filter(Task.filters.incomplete).each(function(task) {
                canvas.height = 1000;
                canvas.width = 1000;
                var s = new Scribble(canvas, true);
                s.scale(TaskScale, TaskScale);
                s.load(task.path, task.bounds[0]);
                var imgData = s.imageData();
                imageStore.set(task.key, imgData);
            });
        });
    }
}

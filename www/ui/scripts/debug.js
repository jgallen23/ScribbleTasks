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
	updateCounts: function() {
		localStorage.clear();
		var incStar = function(count) {
			var v = localStorage['totalStarCount'] || 0;
			v = parseInt(v) + count
			localStorage.setItem('totalStarCount', v);
		}
		var updateProject = function(project) {
			project.getTasks(function(tasks) {
				var starCount = 0;
				var incompleteCount = 0;
				tasks.each(function(task) {
					if (!task.isComplete) {
						incompleteCount++;
						if (task.star) starCount++;
					}
				});
				localStorage.setItem(String.format("starCount_{0}", project.key), starCount);
				localStorage.setItem(String.format("taskCount_{0}", project.key), incompleteCount);
				incStar(starCount);
				console.log("Set Counts for: "+project.name);
			});
		}

		Project.data.find(function(projects) {
			projects.each(function(project) {
				updateProject(project);
			});
		});
	}
}

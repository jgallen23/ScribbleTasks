var ScribbleTasksApp = Application.extend({
	ready: function() {
		var self = this;
		this._super();
		if (this.browser.isMobile) {
			self.disableScrollingPermanently();
		}
		this.resize(window.innerWidth, window.innerHeight);
		this.debug = debugUtils;
		this.notificationCenter.bind("task.propertySet", function() { self.taskPropertySet.apply(self, arguments)});
		this.notificationCenter.bind("project.taskAdded", function() { self.projectTaskAdded.apply(self, arguments)});
		this.notificationCenter.bind("project.taskRemoved", function() { self.projectTaskRemoved.apply(self, arguments)});
		this.currentController = new ProjectListController("ProjectList");
		this.runTests();
	},
	resize: function(width, height) {
		this._super(width, height);
		/*if (this.browser.isPhoneGap)*/
		/*height -= 20;*/
		if (height < 500) {
			document.querySelector("#AddTask .wrapper").style.height = height+"px";
		}
		var wrapper = document.querySelector("#Wrapper");
		wrapper.style.width = width+"px";
		wrapper.style.height = height+"px";
		height -= (wrapper.offsetTop*2);	
		var containers = document.querySelectorAll(".Container");
		for (var i = 0, c = containers.length; i < c; i++) {
			containers[i].style.height = height+"px";
		}
	},
	runTests: function() {
		var self = this;
		var params = parseQueryString();
		//* Tests
		if (params.test) {
			if (params.test == "1" || params.test == "2" || params.test == "4") {
				var f = false;
				this.currentController.bind("loaded", function() {
					if (f) return;
					var pc = this.showProject(this.projects[0]);
					if (params.test == "2")
						pc.showAddTask();
					if (params.test == "4")
						pc.onClick.menu();
					f = true;

				});
			} else if (params.test == "3") {
				this.currentController.onClick.debug();
			} else if (params.test == "search") {
				this.currentController.bind("loaded", function() {
					//this.onClick.search.call(this);
					this.showSearch("Starred Tasks", Task.filters.star);
				});
			}
		}
		//*/
		return;
		this.backup(function(data) { 
			var textarea = document.createElement("textarea");
			textarea.style.height = "400px";
			textarea.style.width = "100%";

			textarea.value = data;
			document.body.innerHTML = ""; 
			document.body.appendChild(textarea);
		});
	},
	offsetKey: function(key, value) {
		var v = localStorage[key] || 0;
		localStorage.setItem(key, parseInt(v)+value);
	},
	projectTaskAdded: function(project, task) {
		this.offsetKey(String.format("taskCount_{0}", project.key), 1);
		if (task.star) {
			this.offsetKey(String.format("starCount_{0}", task.projectKey), 1);
			this.offsetKey(String.format("totalStarCount", task.projectKey), 1);
			this.updateBadge();
		}
	},
	projectTaskRemoved: function(project, task) {
		this.offsetKey(String.format("taskCount_{0}", project.key), -1);
		if (task.star) {
			this.offsetKey(String.format("starCount_{0}", task.projectKey), -1);
			this.offsetKey(String.format("totalStarCount", task.projectKey), -1);
			this.updateBadge();
		}
	},
	taskPropertySet: function(task, property, value) {
		switch (property) {
			case 'star':
				var val = (value)?1:-1;
				this.offsetKey(String.format("starCount_{0}", task.projectKey), val);
				this.offsetKey(String.format("totalStarCount", task.projectKey), val);
				this.updateBadge();
				break;
			case 'completedOn':
				var val = (value)?-1:1;
				this.offsetKey(String.format("taskCount_{0}", task.projectKey), val);
				if (task.star) {
					this.offsetKey(String.format("starCount_{0}", task.projectKey), val);
					this.offsetKey(String.format("totalStarCount", task.projectKey), val);
					this.updateBadge();
				}
				break;
		}
	},
	taskCreated: function(task) {
		offsetKey(String.format("taskCount_{0}", task.projectKey), 1);	
	},
    updateBadge: function() {
		var count = localStorage['totalStarCount'];
		console.log("Badge: "+count);
        if (this.browser.isPhoneGap) {
            window.plugins.badge.set(count);
        }
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
					if (!task.isComplete) {
						task._data.imageData = null;
						data.tasks.push(task._data);
					}
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
				var t = new Task(task);
				t.save();
				if (callback) callback();
			});
        });
        
	}
});

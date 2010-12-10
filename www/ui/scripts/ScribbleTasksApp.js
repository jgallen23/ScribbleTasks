var ScribbleTasksApp = Application.extend({
	ready: function() {
		var self = this;
		this._super();
		if (this.browser.isMobile) {
			self.disableScrollingPermanently();
		}
		this.resize(window.innerWidth, window.innerHeight);
		this.debug = debugUtils;
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
					this.onClick.search.call(this);
					//c.showSearch("Starred Tasks", Task.filters.star);
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
    updateBadge: function() {
		console.log("Badge: "+this.data.badgeCount);
        if (this.browser.isPhoneGap) {
            window.plugins.badge.set(this.data.badgeCount);
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
				var t = new Task(task);
				t.save();
				if (callback) callback();
			});
        });
        
	}
});

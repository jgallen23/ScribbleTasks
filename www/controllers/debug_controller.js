var DebugController = Controller.extend({
	init: function(elementId) {
		this._super(elementId);
		this.view.find(".restore").style.display = "none";
		this.view.find(".backup").style.display = "none";				
	},
	show: function() {
		this.element.style.display = "-webkit-box";
	},
	actions: {
        oldTasks: function() {
            Task.data.find(function(tasks) {
                tasks = tasks.filter(Task.filters.complete);
                if (confirm(tasks.length)) {
                    for (var i = 0, c = 100; i < c; i++) {
                        Task.data.remove(tasks[i]);
                    }
                }
            });
        },
		updateCounts: function() {
			APP.debug.updateCounts();
		},
		clear: function() {
			APP.debug.clearImageCache();
		},
		backup: function() {
			var self = this;
			APP.backup(function(data) {
				if (APP.browser.isPhoneGap)
					plugins.clipboardPlugin.setText(data);
				self.view.find(".backup textarea").value = data;
				self.view.find(".backup").style.display = "block";				
			});
		},
		close: function() {
			this.trigger("close");
		},
		restore: function() {
			this.view.find(".restore").style.display = "block";
			this.view.find(".restore textarea").value = "";
		},
		restoreNow: function() {
			var self = this;
			APP.restore(this.view.find(".restore textarea").value, function() {
				setTimeout(function() {
					self.trigger("restored");
				}, 1000);
			});
		},
		generateData: function() {
			APP.debug.generateTestData();
		},
		resetProjectKeys: function() {
			APP.debug.resetProjectKeys();
		},
		perfTest: function() {
			APP.debug.perfTest();
		}
	}
});

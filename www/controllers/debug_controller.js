var DebugController = Controller.extend({
	init: function(elementId) {
		this._super(elementId);
		this.view.find(".restore").style.display = "none";
		this.view.find(".backup").style.display = "none";				
	},
	show: function() {
		this.element.style.display = "-webkit-box";
	},
	onClick: {
		clear: function() {
			APP.clearImageCache();
		},
		backup: function() {
			var self = this;
			APP.backup(function(data) {
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
			APP.generateTestData();
		},
		resetProjectKeys: function() {
			APP.resetProjectKeys();
		},
		perfTest: function() {
			APP.perfTest();
		}
	}
});

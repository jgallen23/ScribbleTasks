var ProjectView = TemplateView.extend({
	useLiveClickEvents: true,
	setTasks: function(project, tasks) {
		this.project = project;
		this.tasks = tasks;
		this._render();
	},
	_render: function() {
		var data = { project: this.project, tasks: this.tasks };
		this._super("jstProjectView", data);
		this.drawScribbles();
	},
	drawScribbles: function() {
		var self = this;
		for (var i = 0; i < this.tasks.length; i++) {
			var task = this.tasks[i];
			if (task.svg) {
				var s = new Scribble("Scribble_"+i, ScribbleSize[0]/2, ScribbleSize[1]/2);
				s.readonly = true;
				s.load(task.svg);
				s.scale([.5, .5, 0, 0]);
				s.paper.canvas.addEventListener("click", function(e) {
					self.onClick['task'].call(self, e);
				});
			}
		}
	},
	onClick: {
		'star': function(e) {
			var index = e.target.parentNode.getAttribute("data-index");
			var task = this.tasks[index];
			this.trigger("star", [task]);
		},
		'add': function(e) {
			this.trigger("add", []);
		},
		'clear': function(e) {
			Project.data.provider.nuke();
			Task.data.provider.nuke();
		},
		'task': function(e) {
			var task = this.tasks[this.findParentWithAttribute(e.target, 'data-index').getAttribute("data-index")];
			this.trigger("task", [task]);
		}
	}
});

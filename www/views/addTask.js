var AddTaskView = View.extend({
	useLiveClickEvents: true,
	init: function(element) {
		this._super(element);
		this.star = false;
		this.input = this.find("input");
		this.scribble = new Scribble('AddScribble', 800, 200);
	},
	clear: function() {
		this.input.value = "";
		this.scribble.clear();
	},
	onClick: {
		star: function(e) {
			this.star = true;
			e.target.innerHTML = "S";
		},
		add: function(e) {
			if (this.input.value != "" || this.scribble.strokes.length != 0) {
				var task = {
					name: this.input.value,
					star: this.star,
					svg: this.scribble.toJSON()
				}
				this.trigger("add", [task]);
				this.clear();
			}
		},
		cancel: function(e) {
			this.clear();
			this.trigger("cancel");
		}
	}
});

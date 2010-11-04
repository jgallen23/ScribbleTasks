var AddTaskView = View.extend({
	useLiveClickEvents: true,
	init: function(element) {
		this._super(element);
		this.star = false;
		this.input = this.find("input");
		this.loadedScribble = null;
		this.scribble = new Scribble('AddScribble', ScribbleSize[0], ScribbleSize[1]);
	},
	clear: function() {
		this.input.value = "";
		this.loadedScribble = null;
		this.scribble.clear();
	},
	show: function(scribble) {
		if (scribble) {
			this.loadedScribble = scribble;
			this.scribble.load(scribble.svg);	
		}
		this.element.style.display = "-webkit-box";
	},
	onClick: {
		star: function(e) {
			this.star = true;
			e.target.innerHTML = "S";
		},
		add: function(e) {
			if (this.input.value != "" || this.scribble.strokes.length != 0) {
				if (this.loadedScribble) {
					this.loadedScribble.star = this.star;
					this.loadedScribble.svg = this.scribble.toJSON();
					this.trigger("add", [this.loadedScribble]);
				} else {
					var task = {
						name: this.input.value,
						star: this.star,
						svg: this.scribble.toJSON()
					}
					this.trigger("add", [task]);
				}
				this.clear();
			}
		},
		cancel: function(e) {
			this.clear();
			this.trigger("cancel");
		}
	}
});

var AddTaskController = Controller.extend({
	init: function(elementId) {
		this._super(elementId);
		this.star = false;
		this.input = this.view.find("input");
		this.loadedScribble = false;
		this.scribble = new Scribble(this.view.find('#AddScribble'), ScribbleSize[0], ScribbleSize[1]);
	},
	clear: function() {
		this.input.value = "";
		this.loadedScribble = null;
		this.scribble.clear();
	},
	show: function(scribble) {
		this.element.style.top = window.scrollY+"px";
		this.element.style.display = "-webkit-box";
		var elem = this.view.find('#AddScribble');
		//this._super();
		APP.disableScrolling();
		if (scribble) {
			this.loadedScribble = scribble;
			this.scribble.load(scribble.svg);	
		}
	},
	hide: function() {
		APP.enableScrolling();
		this._super();
	},
	addTask: function() {
		if (this.input.value != "" || this.scribble.strokes.length != 0) {
			if (this.loadedScribble) {
				this.loadedScribble.star = this.star;
				this.loadedScribble.svg = this.scribble.toJSON();
				this.trigger("add", [this.loadedScribble]);
			} else {
				var task = {
					star: this.star,
					svg: this.scribble.toJSON()
				}
				this.trigger("add", [task]);
			}
			this.clear();
		}
	},
	onClick: {
		star: function(e) {
			this.star = true;
			e.target.innerHTML = "S";
		},
		add: function(e) {
			this.addTask();	
			this.hide();
		},
		addAnother: function(e) {
			this.addTask();
		},
		cancel: function(e) {
			this.clear();
			this.trigger("cancel");
		}
	}
});
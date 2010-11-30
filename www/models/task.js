var Task = Model.extend({
	init: function(initial) {
		this._data = {
			key: '',
			name: '',
			path: null,
			star: false,
			note: null,
			priority: 0,
			bounds: null,
			height: null,
			width: null,
			imageData: null,
			completedOn: null,
			createdOn: null,
			modifiedOn: null
		}
		this._super(initial);
		if (!this.createdOn)
			this.createdOn = new Date().getTime();

		if (typeof this._data.createdOn === "string")
			this._data.createdOn = new Date(this._data.createdOn).getTime();

		if (typeof this._data.modifiedOn === "string")
			this._data.modifiedOn = new Date(this._data.modifiedOn).getTime();

		if (this.completedOn && typeof this._data.completedOn === "string") {
			this._data.completedOn = new Date().getTime();
		}

		this.__defineGetter__("isComplete", this._isComplete);
		this.__defineProperty__("star", this._getStar, this._setStar);

		if(this.path)// && !this.bounds)
			this._updateDimensions();
	},
	_propertySet: function(prop, value) {
		this._data.modifiedOn = new Date().getTime();
		this._super(prop, value);
		if (prop == "path") {
			this._updateDimensions();
		}
	},
	_updateDimensions: function() {
		var b = this._getBounds(this._data.path);
		this._data.bounds = b;
		this._data.height = b[1][1] - b[0][1];
		this._data.width = b[1][0] - b[0][0];
		//this.save();
	},
	save: function(cb) {
		Task.data.save(this, cb);
	},
	complete: function() {
		this.completedOn = new Date().getTime();
	},
	unComplete: function() {
		this.completedOn = null;
	},
	_isComplete: function() {
		return (this.completedOn != null)?true:false;
	},
	_getStar: function() {
		return this._data.star;
	},
	_setStar: function(value) {
		this._data.star = value;
	},
	_getBounds: function(path) {
		var minX = 999, maxX = 0, minY = 999, maxY = 0;
		path.each(function(stroke) {
			stroke.each(function(point) {
				if (point[0] < minX)
					minX = point[0];
				if (point[0] > maxX)
					maxX = point[0];
				if (point[1] < minY)
					minY = point[1];
				if (point[1] > maxY)
					maxY = point[1];
			});
		});
		var bounds = [[minX, minY], [maxX, maxY]];
		return bounds;
	}
});
Task.data = new TaskDataProvider();
Task.filters = {
	incomplete: function(t) {
		return !t.isComplete;
	},
	star: function(t) {
		return (!t.isComplete && t.star);
	},
	complete: function(t) {
		return t.isComplete;
	}
}
Task.sort = {
	starred: function(a, b) {
		var s1 = (a.star)?1:0;
		var s2 = (b.star)?1:0;
		var star = s2 - s1;
		if (star == 0) {
			return b.modifiedOn - a.modifiedOn;
		}
		return star;
	},
	incomplete: function(a, b) {
		var s1 = (a.star)?1:0;
		var s2 = (b.star)?1:0;
		var star = s2 - s1;
		if (star == 0) {
			var p = b.priority - a.priority;
			if (p == 0)
				return b.modifiedOn - a.modifiedOn;
			return p;
		}
		return star;
	},
	complete: function(a, b) {
		return b.completedOn - a.completedOn;
	}
}

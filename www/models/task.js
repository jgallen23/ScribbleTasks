var Task = Model.extend({
	init: function(initial) {
		this._data = {
			key: '',
			name: '',
			path: null,
			star: false,
			note: null,
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

		if (this.completedOn && typeof this._data.completedOn === "string")
			this._data.completedOn = new Date(this._data.completedOn).getTime();

		this.__defineGetter__("isComplete", this._isComplete);
		this.__defineProperty__("star", this._getStar, this._setStar);
	},
	_propertySet: function(prop, value) {
		this._data.modifiedOn = new Date().getTime();
		this._super(prop, value);
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
	}
});
Task.data = new TaskDataProvider();
Task.filters = {
	incomplete: function(t) {
		return !t.isComplete;
	},
	starred: function(t) {
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
			return b.modifiedOn - a.modifiedOn;
		}
		return star;
	},
	complete: function(a, b) {
		return b.completedOn - a.completedOn;
	}
}

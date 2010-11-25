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
		this.createdOn = new Date();
		this.__defineGetter__("isComplete", this._isComplete);
		this.__defineProperty__("star", this._getStar, this._setStar);
	},
	_propertySet: function(prop, value) {
		this._data.modifiedOn = new Date();
		this._super(prop, value);
	},
	save: function(cb) {
		Task.data.save(this, cb);
	},
	complete: function() {
		this.completedOn = new Date();
	},
	unComplete: function() {
		this.completedOn = null;
	},
	_isComplete: function() {
		return (this.completedOn)?true:false;
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

var Task = Model.extend({
	init: function(initial) {
		this._data = {
			key: '',
			name: '',
			svg: null,
			star: false,
			project: null,
			note: null,
			completedOn: null,
			createdOn: null,
			modifiedOn: null
		}
		this._super(initial);
		this.createdOn = new Date();
		this.__defineGetter__("isComplete", this._isComplete);
	},
	_propertySet: function(prop, value) {
		this._data.modifiedOn = new Date();
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

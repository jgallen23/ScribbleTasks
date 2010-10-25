var Task = Model.extend({
	init: function(initial) {
		this._data = {
			key: '',
			name: '',
			svg: null,
			star: false,
			project: null,
			note: null,
			completedOn: null
		}
		this._super(initial);
	},
	save: function(cb) {
		Task.data.save(this, cb);
	}
});
Task.data = new TaskDataProvider();

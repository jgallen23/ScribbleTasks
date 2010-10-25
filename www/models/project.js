var Project = Model.extend({
	init: function(initial) {
		this._data = {
			key: '',
			name: '',
			note: null
		}
		this._super(initial);
	},
	save: function(cb) {
		Project.data.save(this, cb);
	}
});
Project.data = new ProjectDataProvider();

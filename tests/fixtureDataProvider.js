var FixtureProvider = Class.extend({
    init: function(fixtureVar) {
        this._data = fixtureVar || [];
    },
    all: function(cb) {
        cb(this._data);
    },
    save: function(obj, cb) {
		if (!obj.key) {
			this._data.push(obj);
			obj.key = 999;
		}
        if (cb) cb(obj);
    }
});

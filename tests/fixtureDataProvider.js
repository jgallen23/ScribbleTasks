var FixtureProvider = Class.extend({
    init: function(fixtureVar) {
        this._data = fixtureVar || [];
    },
    all: function(cb) {
        cb(this._data);
    },
	getMany: function(ids, cb) {
		var items = [];
		this.all(function(data) {
			data.each(function(item) {
				if (ids.contains(item.key))
					items.push(item);
			});
			cb(items);
		});
	},
    save: function(obj, cb) {
		if (!obj.key) {
			this._data.push(obj);
			obj.key = Math.floor(Math.random()*1000);
		}
        if (cb) cb(obj);
    }
});

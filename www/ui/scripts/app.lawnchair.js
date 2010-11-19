
var extendObj = function(target, obj1, obj2) {
	for (var item in obj1) {
		target[item] = obj1[item];
	}
	return (obj2)?extendObj(target, obj2):target;
}

var extendObjStrict = function(target, obj1, obj2) {
	for (var item in obj1) {
		if (target[item] !== undefined)
			target[item] = obj1[item];
	}
	return (obj2)?extendObj(target, obj2):target;
}

String.format = function( text )
{
    //check if there are two arguments in the arguments list
    if ( arguments.length <= 1 )
    {
        //if there are not 2 or more arguments there's nothing to replace
        //just return the original text
        return text;
    }
    //decrement to move to the second argument in the array
    var tokenCount = arguments.length - 2;
    for( var token = 0; token <= tokenCount; token++ )
    {
        //iterate through the tokens and replace their placeholders from the original text in order
        text = text.replace( new RegExp( "\\{" + token + "\\}", "gi" ),
                                                arguments[ token + 1 ] );
    }
    return text;
};
var elem = {
	classRE: function(name) { return new RegExp("(^|\\s)"+name+"(\\s|$)") },
	hasClass: function(el, name){
		return this.classRE(name).test(el.className);
	},
	addClass: function(el, name){
		if (!el.length)
			return !this.hasClass(el, name) && (el.className += (el.className ? ' ' : '') + name);
		else {
			for (var i = 0, c = el.length; i < c; i++) {
				this.addClass(el[i], name);
			}
			return el;
		}

	},
	removeClass: function(el, name){
		if (!el.length)
			return el.className = el.className.replace(this.classRE(name), '');
		else {
			for (var i = 0, c = el.length; i < c; i++) {
				this.removeClass(el[i], name);
			}
			return el;
		}
	}
}
// Array.indexOf( value, begin, strict ) - Return index of the first element that matches value
Array.prototype.indexOf = function( v, b, s ) {
	for( var i = +b || 0, l = this.length; i < l; i++ ) {
		if( this[i]===v || s && this[i]==v ) { return i; }
	}
	return -1;
};

// Array.insert( index, value ) - Insert value at index, without overwriting existing keys
Array.prototype.insert = function( i, v ) {
	if (this.length == 0)
		return [v];
	if( i>=0 ) {
		var a = this.slice(), b = a.splice( i );
		a[i] = v;
		return a.concat( b );
	}
};

Array.prototype.indexOf = function(obj) {
	for (var i = 0; i < this.length; i++) {
		if (obj == this[i])
			return i;
	}
	return -1;
};

Array.prototype.each = function(f) {
	for (var i = 0; i < this.length; i++) {
		f(this[i]);
	}
};

Array.prototype.find = function(f) {
	for (var i = 0; i < this.length; i++) {
		if (f(this[i]))
			return this[i];
	}
};

Array.prototype.filter = function(f) {
	var filter = [];
	for (var i = 0; i < this.length; i++) {
		if (f(this[i]))
			filter.push(this[i]);
	}
	return filter;
};
Array.prototype.contains = function(obj) {
	for (var i = 0; i < this.length; i++) {
		if (obj == this[i])
			return true;
	}
};

Array.prototype.clone = function() {
	var clone = [];
	for (var i = 0; i < this.length; i++) {
		clone.push(this[i]);
	}
	return clone;
};

Array.prototype.remove = function(from, to) {
  this.splice(from, (to || from || 1) + (from < 0 ? this.length : 0));
  return this.length;
};

Array.prototype.extend = function(array) {
	for (var i = 0; i < array.length; i++) {
		this.push(array[i]);
	}
}

Array.prototype.last = function() {
	return this[this.length - 1];
}
if (typeof debug === "undefined") {
	window.debug = console;
}
/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  // The base Class implementation (does nothing)
  this.Class = function(){};
  
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
    
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
    
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" && 
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
            
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
            
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
            
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
    
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
    
    // Populate our constructed prototype object
    Class.prototype = prototype;
    
    // Enforce the constructor to be what we expect
    Class.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
    
    return Class;
  };
})();
var Browser = function() {
	this.isMobile = (navigator.userAgent.match(/iPad|iPhone/i) != null);
	this.isPhoneGap = false;//(this.isMobile && DeviceInfo && DeviceInfo.uuid != null);
}
browser = new Browser();
if (browser.isMobile) {
    INPUT_EVENT = "click";
	INPUT_START_EVENT = "touchstart";
	INPUT_MOVE_EVENT = "touchmove";
	INPUT_END_EVENT = "touchend";
} else {
	INPUT_EVENT = "click";
	INPUT_START_EVENT = "mousedown";
	INPUT_MOVE_EVENT = "mousemove";
	INPUT_END_EVENT = "mouseup";
}
var templateCache = {};
var template = function tmpl(template, data){
	var fn = !/\W/.test(template) ?
	  templateCache[template] = templateCache[template] ||
		tmpl(document.getElementById(template).innerHTML) :
	  new Function("obj",
		"var p=[],print=function(){p.push.apply(p,arguments);};" +
		"with(obj){p.push('" +
		template
		  .replace(/[\r\t\n]/g, "")
		  .split("{!").join("\t")
		  .replace(/((^|!})[^\t]*)'/g, "$1\r")
		  .replace(/\t=(.*?)!}/g, "',$1,'")
		  .split("\t").join("');")
		  .split("!}").join("p.push('")
		  .split("\r").join("\\'")
	  + "');}return p.join('');");
	return data ? fn( data ) : fn;
};

var EventManager = Class.extend({
	init: function() {

	},
	bind: function(event, callback) {
		if (typeof event === "object") {
			for (var key in event) {
				this.bind(key, event[key]);
			}
		} else {
			this.callbacks = this.callbacks || {}
			this.callbacks[event] = this.callbacks[event] || [];
			this.callbacks[event].push(callback);
		}
		return this;
	},
	trigger: function(name, data) {
		this.callbacks = this.callbacks || {}

		var callbacks = this.callbacks[name];

		if (callbacks) {
			for (var i = 0; i < callbacks.length; i++) {
				callbacks[i].apply(this, data || []);
			}
		}

		return this;
	},
	unbind: function(event, callback) {
		this.callbacks = this.callbacks || {}

		if (callback) {
			var callbacks = this.callbacks[event] || [];

			for (var i = 0; i < callbacks.length; i++) {
				if (callbacks[i] === callback) {
					this.callbacks[event].splice(i, 1);
				}
			}
		} else {
			delete this.callbacks[event];
		}
	
		return this;
    },
    handleEvent: function(e) {

    }
});
var Controller = EventManager.extend({
	useLiveClickEvents: true,
	init: function(elementId) {
		this.element = (typeof elementId === "string")?document.getElementById(elementId):elementId;
		if (this.useLiveClickEvents) {
            var self = this;
			this.element.addEventListener(INPUT_EVENT, this); 
        }
		this.view = new View(this.element);
	},
	handleEvent: function(e) {
		var self = this;
		if (e.type == "click") {
			if (e.target.getAttribute('data-onClick') && self.onClick[e.target.getAttribute("data-onClick")]) {
				self.onClick[e.target.getAttribute("data-onClick")].call(self, e);
			}
		}
	},
	destroy: function() {
		if (this.useLiveClickEvents) {
			this.element.removeEventListener(INPUT_EVENT, this);
		}
		this.trigger("destroy");
	},
	show: function() {
		this.view.show();
		this.trigger("show");
	},
	hide: function() {
		this.view.hide();
		this.trigger("hide");
	},
    animate: function(properties, cb) {
		var self = this;
		var endAnimate = function(event) {
            console.log("end animation");
			self.element[0].removeEventListener("webkitTransitionEnd", endAnimate, false);
            return;
			if (cb)
				cb();
		}


		for (prop in properties) {
			this.element.setStyle(prop, properties[prop]);
		}
		this.element[0].addEventListener("webkitTransitionEnd", endAnimate, false);
    },
	animateWithClass: function(className, properties, cb) {

        this.animate(properties, cb);
	}
});
var Application = Controller.extend({
	init: function() {
        window.APP = this;
		this._super.apply(arguments);
		var self = this;

        window.addEventListener("load", function() { 
            if (false && browser.isMobile) {
                document.addEventListener("deviceready", function() { self.ready() }, false);
            } else {
                self.ready() 
            }
        }, false);
		window.addEventListener("resize", function(e) {
			self.resize();
		});
	},
	ready: function() {
		this.trigger("ready");
    },
	resize: function(e) {
		this.trigger("resize", [window.innerWidth, window.innerHeight]);
	},
    preventScrolling: function(e) {
		e.preventDefault(); 
	},
	enableScrolling: function() {
		document.body.style.overflow = "auto";
		document.removeEventListener("touchmove", this.preventScrolling, false);
        this.trigger("enableScrolling");
	},
	disableScrolling: function() {
		document.body.style.overflow = "hidden";
		document.addEventListener("touchmove", this.preventScrolling, false);
        this.trigger("disableScrolling");
    },
    disableScrollingPermanently: function() {
        var self = this;
        this.disableScrolling();
        this.disableScrolling = function() { self.trigger("disableScrolling"); };
        this.enableScrolling = function() { self.trigger("enableScrolling"); };
    }
});
var DataProvider = Class.extend({
	init: function(key) {
	},
	get: function(cb) {
	},
	getById: function(id, cb) {
	},
	save: function(obj, cb) {
		if (cb) cb();
	},
	remove: function(obj, cb) {
	},
	removeAll: function() {
	}
});
var View = EventManager.extend({
	init: function(element) {
		this.element = (typeof element === "string")?document.getElementById(element):element;
	},
	renderAt: function(element, templateId, data) {
		element = (typeof element === "string")?this.find(element):element;
		var tmp = template(templateId, data);
		element.innerHTML = tmp;
	},
	render: function(templateId, data) {
		this.renderAt(this.element, templateId, data);
	},
	find: function(selector) {
		return this.element.querySelector(selector);
	},
	findAll: function(selector, f) {
		var items = this.element.querySelectorAll(selector);
		if (f) {
			for (var i = 0, c = items.length; i < c; i++) {
				f(items[i]);
			}
		}
		return items;
	},
	remove: function() {
		//TODO: unbind all events
		this.element.innerHTML = "";
    },
	show: function() {
		this.element.style.display = "block";
		this.trigger("show");
	},
	hide: function() {
		this.element.style.display = "none";
		this.trigger("hide");
	},
	findParentWithAttribute: function(element, attribute) {
		do {
			if (element.getAttribute(attribute)) 
				return element;
			element = element.parentNode;
		} while (element)
	}
});
var Model = Class.extend({
	init: function(initial) {
		if (!this._data) this._data = {};
		if (initial) {
			extendObjStrict(this._data, initial);
		}
		this.id = '';

		var self = this;
		for (var prop in this._data) {
			var get = function(p) {
				return function() { return self._getProperty(p); }
			}(prop);
			var set = function(p) {
				return function(value) { self._setProperty(p, value); }
			}(prop);
			this.__defineGetter__(prop, get);
			this.__defineSetter__(prop, set);
		}
	},
	_getProperty: function(prop) {
		return this._data[prop];
	},
	_setProperty: function(prop, value) {
		this._data[prop] = value;
		this._propertySet(prop, value);
	},
	_propertySet: function(prop, value) {
	},
	__defineProperty__: function(key, getter, setter) {
		this.__defineGetter__(key, getter);
		if (setter) this.__defineSetter__(key, setter);
	}
});
/**
 * WebkitSQLiteAdaptor
 * ===================
 * Sqlite implementation for Lawnchair.
 *
 */
var WebkitSQLiteAdaptor = function(options) {
	for (var i in LawnchairAdaptorHelpers) {
		this[i] = LawnchairAdaptorHelpers[i];
	}
	this.init(options);
};


WebkitSQLiteAdaptor.prototype = {
	init:function(options) {
		var that = this;
		var merge = that.merge;
		var opts = (typeof arguments[0] == 'string') ? {table:options} : options;

		// default properties
		this.name		= merge('Lawnchair', opts.name	  	);
		this.version	= merge('1.0',       opts.version 	);
		this.table 		= merge('field',     opts.table	  	);
		this.display	= merge('shed',      opts.display 	);
		this.max		= merge(65536,       opts.max	  	);
		this.db			= merge(null,        opts.db		);
		this.perPage    = merge(10,          opts.perPage   );

		// default sqlite callbacks
		this.onError = function(){};
		this.onData  = function(){};

		if("onError" in opts) {
			this.onError = opts.onError;
		}

		// error out on shit browsers
		if (!window.openDatabase)
			throw('Lawnchair, "This browser does not support sqlite storage."');

		// instantiate the store
		this.db = openDatabase(this.name, this.version, this.display, this.max);

		// create a default database and table if one does not exist
		this.db.transaction(function(tx) {
			tx.executeSql("SELECT COUNT(*) FROM " + that.table, [], function(){}, function(tx, error) {
				that.db.transaction(function(tx) {
					tx.executeSql("CREATE TABLE "+ that.table + " (id NVARCHAR(32) UNIQUE PRIMARY KEY, value TEXT, timestamp REAL)", [], function(){}, that.onError);
				});
			});
		});
	},
	save:function(obj, callback) {
		var that = this;
	
		var update = function(id, obj, callback) {
			that.db.transaction(function(t) {
				t.executeSql(
					"UPDATE " + that.table + " SET value=?, timestamp=? WHERE id=?",
					[that.serialize(obj), that.now(), id],
					function() {
						if (callback != undefined) {
							obj.key = id;
							that.terseToVerboseCallback(callback)(obj);
						}
					},
					that.onError
				);
			});
		};
		var insert = function(obj, callback) {
			that.db.transaction(function(t) {
				var id = (obj.key == undefined) ? that.uuid() : obj.key;
				delete(obj.key);
				t.executeSql(
					"INSERT INTO " + that.table + " (id, value,timestamp) VALUES (?,?,?)",
					[id, that.serialize(obj), that.now()],
					function() {
						if (callback != undefined) {
							obj.key = id;
							that.terseToVerboseCallback(callback)(obj);
						}
					},
					that.onError
				);
			});
		};
		if (obj.key == undefined) {
			insert(obj, callback);
		} else {
			this.get(obj.key, function(r) {
				var isUpdate = (r != null);
	
				if (isUpdate) {
					var id = obj.key;
					delete(obj.key);
					update(id, obj, callback);
				} else {
					insert(obj, callback);
				}
			});
		}
	},
	get:function(key, callback) {
		var that = this;
		this.db.transaction(function(t) {
			t.executeSql(
				"SELECT value FROM " + that.table + " WHERE id = ?",
				[key],
				function(tx, results) {
					if (results.rows.length == 0) {
						that.terseToVerboseCallback(callback)(null);
					} else {
						var o = that.deserialize(results.rows.item(0).value);
						o.key = key;
						that.terseToVerboseCallback(callback)(o);
					}
				},
				this.onError
			);
		});
	},
	all:function(callback) {
		var cb = this.terseToVerboseCallback(callback);
		var that = this;
		this.db.transaction(function(t) {
			t.executeSql("SELECT * FROM " + that.table, [], function(tx, results) {
				if (results.rows.length == 0 ) {
					cb([]);
				} else {
					var r = [];
					for (var i = 0, l = results.rows.length; i < l; i++) {
						var raw = results.rows.item(i).value;
						var obj = that.deserialize(raw);
						obj.key = results.rows.item(i).id;
						r.push(obj);
					}
					cb(r);
				}
			},
			that.onError);
		});
	},
	paged:function(page, callback) {
		var cb = this.terseToVerboseCallback(callback);
		var that = this;
		this.db.transaction(function(t) {
		    var offset = that.perPage * (page - 1); // a little offset math magic so users don't have to be 0-based
		    var sql = "SELECT * FROM " + that.table + " ORDER BY timestamp ASC LIMIT ? OFFSET ?";
			t.executeSql(sql, [that.perPage, offset], function(tx, results) {
				if (results.rows.length == 0 ) {
					cb([]);
				} else {
					var r = [];
					for (var i = 0, l = results.rows.length; i < l; i++) {
						var raw = results.rows.item(i).value;
						var obj = that.deserialize(raw);
						obj.key = results.rows.item(i).id;
						r.push(obj);
					}
					cb(r);
				}
			},
			that.onError);
		});
	},
	remove:function(keyOrObj, callback) {
		var that = this;
        if (callback)
            callback = that.terseToVerboseCallback(callback);
		this.db.transaction(function(t) {
			t.executeSql(
				"DELETE FROM " + that.table + " WHERE id = ?",
				[(typeof keyOrObj == 'string') ? keyOrObj : keyOrObj.key],
				callback || that.onData,
				that.onError
			);
		});
	},
	nuke:function(callback) {
		var that = this;
        if (callback)
            callback = that.terseToVerboseCallback(callback);
		this.db.transaction(function(tx) {
			tx.executeSql(
				"DELETE FROM " + that.table,
				[],
				callback || that.onData,
				that.onError
			);
		});
	}
};
/**
 * Lawnchair
 * =========
 * A lightweight JSON document store.
 *
 */
var Lawnchair = function(opts) {
	this.init(opts);
}

Lawnchair.prototype = {
	
	init:function(opts) {
		var adaptors = {
			'webkit':window.WebkitSQLiteAdaptor,
			'gears':window.GearsSQLiteAdaptor,
			'dom':window.DOMStorageAdaptor,
			'cookie':window.CookieAdaptor,
			'air':window.AIRSQLiteAdaptor,
			'userdata':window.UserDataAdaptor,
			'air-async':window.AIRSQLiteAsyncAdaptor,
			'blackberry':window.BlackBerryPersistentStorageAdaptor,
            'couch':window.CouchAdaptor
		};
		this.adaptor = opts.adaptor ? new adaptors[opts.adaptor](opts) : new DOMStorageAdaptor(opts);
		
        // Check for native JSON functions.
        if (!JSON || !JSON.stringify) throw "Native JSON functions unavailable - please include http://www.json.org/json2.js or run on a decent browser :P";
	},
	
	// Save an object to the store. If a key is present then update. Otherwise create a new record.
	save:function(obj, callback) {this.adaptor.save(obj, callback)},
	
	// Invokes a callback on an object with the matching key.
	get:function(key, callback) {this.adaptor.get(key, callback)},

	// Returns whether a key exists to a callback.
	exists:function(callback) {this.adaptor.exists(callback)},
	
	// Returns all rows to a callback.
	all:function(callback) {this.adaptor.all(callback)},
	
	// Removes a json object from the store.
	remove:function(keyOrObj, callback) {this.adaptor.remove(keyOrObj, callback)},
	
	// Removes all documents from a store and returns self.
	nuke:function(callback) {this.adaptor.nuke(callback);return this},
	
	// Returns a page of results based on offset provided by user and perPage option
	paged:function(page, callback) {this.adaptor.paged(page, callback)},
	
	/**
	 * Iterator that accepts two paramters (methods or eval strings):
	 *
	 * - conditional test for a record
	 * - callback to invoke on matches
	 *
	 */
	find:function(condition, callback) {
		var is = (typeof condition == 'string') ? function(r){return eval(condition)} : condition
		  , cb = this.adaptor.terseToVerboseCallback(callback);
	
		this.each(function(record, index) {
			if (is(record)) cb(record, index); // thats hot
		});
	},


	/**
	 * Classic iterator.
	 * - Passes the record and the index as the second parameter to the callback.
	 * - Accepts a string for eval or a method to be invoked for each document in the collection.
	 */
	each:function(callback) {
		var cb = this.adaptor.terseToVerboseCallback(callback);
		this.all(function(results) {
			var l = results.length;
			for (var i = 0; i < l; i++) {
				cb(results[i], i);
			}
		});
	}
// --
};
/**
 * LawnchairAdaptorHelpers
 * =======================
 * Useful helpers for creating Lawnchair stores. Used as a mixin.
 *
 */
var LawnchairAdaptorHelpers = {
	// merging default properties with user defined args
	merge: function(defaultOption, userOption) {
		return (userOption == undefined || userOption == null) ? defaultOption: userOption;
	},

	// awesome shorthand callbacks as strings. this is shameless theft from dojo.
	terseToVerboseCallback: function(callback) {
		return (typeof arguments[0] == 'string') ?
		function(r, i) {
			eval(callback);
		}: callback;
	},

	// Returns current datetime for timestamps.
	now: function() {
		return new Date().getTime();
	},

	// Returns a unique identifier
	uuid: function(len, radix) {
		// based on Robert Kieffer's randomUUID.js at http://www.broofa.com
		var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
		var uuid = [];
		radix = radix || chars.length;

		if (len) {
			for (var i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
		} else {
			// rfc4122, version 4 form
			var r;

			// rfc4122 requires these characters
			uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
			uuid[14] = '4';

			// Fill in random data.  At i==19 set the high bits of clock sequence as
			// per rfc4122, sec. 4.1.5
			for (var i = 0; i < 36; i++) {
				if (!uuid[i]) {
					r = 0 | Math.random() * 16;
					uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8: r];
				}
			}
		}
		return uuid.join('');
	},

	// Serialize a JSON object as a string.
	serialize: function(obj) {
		var r = '';
		r = JSON.stringify(obj);
		return r;
	},

	// Deserialize JSON.
	deserialize: function(json) {
		return eval('(' + json + ')');
	}
};
var LawnchairData = DataProvider.extend({
	init: function(key) {
		this.data = new Lawnchair(key);
	},
	find: function(cb) {
		this.data.all(cb);		
	},
	findById: function(id, cb) {
		this.data.get(id, cb);
	},
	save: function(obj, cb) {
		this.data.save(obj, cb)
	},
	remove: function(obj, cb) {
		this.data.remove(obj.id, cb)
	},
	removeAll: function() {
		this.data.nuke();
	}
});


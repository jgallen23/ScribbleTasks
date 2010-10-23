
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
if (typeof debug === "undefined") {
	window.debug = console;
}

(function () {

var undefined,
    xui,
    window     = this,
    string     = new String('string'), // prevents Goog compiler from removing primative and subsidising out allowing us to compress further
    document   = window.document,      // obvious really
    simpleExpr = /^#?([\w-]+)$/,   // for situations of dire need. Symbian and the such        
    idExpr     = /^#/,
    tagExpr    = /<([\w:]+)/, // so you can create elements on the fly a la x$('<img href="/foo" /><strong>yay</strong>')
    slice      = function (e) { return [].slice.call(e, 0); };
    try { var a = slice(document.documentElement.childNodes)[0].nodeType; }
    catch(e){ slice = function (e) { var ret=[]; for (var i=0; e[i]; i++) ret.push(e[i]); return ret; }; }

window.x$ = window.xui = xui = function(q, context) {
    return new xui.fn.find(q, context);
};

// patch in forEach to help get the size down a little and avoid over the top currying on event.js and dom.js (shortcuts)
if (! [].forEach) {
    Array.prototype.forEach = function(fn) {
        var len = this.length || 0,
            i = 0;
            that = arguments[1]; // wait, what's that!? awwww rem. here I thought I knew ya!
                                 // @rem - that that is a hat tip to your thats :)

        if (typeof fn == 'function') {
            for (; i < len; i++) {
                fn.call(that, this[i], i, this);
            }
        }
    };
}
/**
 * Array Remove - By John Resig (MIT Licensed) 
 */
function removex(array, from, to) {
    var rest = array.slice((to || from) + 1 || array.length);
    array.length = from < 0 ? array.length + from: from;
    return array.push.apply(array, rest);
}

xui.fn = xui.prototype = {

    extend: function(o) {
        for (var i in o) {
            xui.fn[i] = o[i];
        }
    },

    find: function(q, context) {
        var ele = [], tempNode;
            
        if (!q) {
            return this;
        } else if (context == undefined && this.length) {
            ele = this.each(function(el) {
                ele = ele.concat(slice(xui(q, el)));
            }).reduce(ele);
        } else {
            context = context || document;
            // fast matching for pure ID selectors and simple element based selectors
            if (typeof q == string) {
              if (simpleExpr.test(q)) {
                  ele = idExpr.test(q) ? [context.getElementById(q.substr(1))] : context.getElementsByTagName(q);
                  // nuke failed selectors
                  if (ele[0] == null) { 
                    ele = [];
                  }
              // match for full html tags to create elements on the go
              } else if (tagExpr.test(q)) {
                  tempNode = document.createElement('i');
                  tempNode.innerHTML = q;
                  slice(tempNode.childNodes).forEach(function (el) {
                    ele.push(el);
                  });
              } else {
                  // one selector, check if Sizzle is available and use it instead of querySelectorAll.
                  if (window.Sizzle !== undefined) {
                    ele = Sizzle(q);
                  } else {
                    ele = context.querySelectorAll(q);
                  }
              }
              // blanket slice
              ele = slice(ele);
            } else if (q instanceof Array) {
                ele = q;
            } else if (q.toString() == '[object NodeList]') {
                ele = slice(q);
            } else if (q.nodeName || q === window) { // only allows nodes in
                // an element was passed in
                ele = [q];
            }
        }
        // disabling the append style, could be a plugin (found in more/base):
        // xui.fn.add = function (q) { this.elements = this.elements.concat(this.reduce(xui(q).elements)); return this; }
        return this.set(ele);
    },

    /** 
     * Resets the body of elements contained in XUI
     * Note that due to the way this.length = 0 works
     * if you do console.dir() you can still see the 
     * old elements, but you can't access them. Confused?
     */
    set: function(elements) {
        var ret = xui();
        ret.cache = slice(this.length ? this : []);
        ret.length = 0;
        [].push.apply(ret, elements);
        return ret;
    },

    /**
    * Array Unique
    */
    reduce: function(elements, b) {
        var a = [],
        elements = elements || slice(this);
        elements.forEach(function(el) {
            // question the support of [].indexOf in older mobiles (RS will bring up 5800 to test)
            if (a.indexOf(el, 0, b) < 0)
            a.push(el);
        });

        return a;
    },

    /**
     * Has modifies the elements array and reurns all the elements that match (has) a CSS Query
     */
     has: function(q) {
         var list = xui(q);
         return this.filter(function () {
             var that = this;
             var found = null;
             list.each(function (el) {
                 found = (found || el == that);
             });
             return found;
         });
     },

    /**
     * Both an internal utility function, but also allows developers to extend xui using custom filters
     */
    filter: function(fn) {
        var elements = [];
        return this.each(function(el, i) {
            if (fn.call(el, i)) elements.push(el);
        }).set(elements);
    },

    /**
     * Not modifies the elements array and reurns all the elements that DO NOT match a CSS Query
     */
    not: function(q) {
        var list = slice(this);
        return this.filter(function(i) {
            var found;
            xui(q).each(function(el) {
                return found = list[i] != el;
            });
            return found;
        });
    },


    /**
     * Element iterator.
     * 
     * @return {XUI} Returns the XUI object. 
     */
    each: function(fn) {
        // we could compress this by using [].forEach.call - but we wouldn't be able to support
        // fn return false breaking the loop, a feature I quite like.
        for (var i = 0, len = this.length; i < len; ++i) {
            if (fn.call(this[i], this[i], i, this) === false)
            break;
        }
        return this;
    }
};

xui.fn.find.prototype = xui.fn;
xui.extend = xui.fn.extend;

// --- 
/// imports(); 
// ---
/**
 *
 * @namespace {Dom}
 * @example
 *
 * Dom
 * ---
 *	
 * Manipulating the Document Object Model aka the DOM.
 * 
 */
xui.extend({

    /**
	 * For manipulating HTML markup in the DOM.
	 *	
	 * syntax:
	 *
	 * 		x$(window).html( location, html );
	 *
	 * or this method will accept just an html fragment with a default behavior of inner..
	 *
	 * 		x$(window).html( htmlFragment );
	 * 
	 * arguments:
	 * 
	 * - location:string can be one of inner, outer, top, bottom
	 * - html:string any string of html markup or HTMLElement
	 *
	 * example:
	 *
	 *  	x$('#foo').html( 'inner',  '<strong>rock and roll</strong>' );
	 *  	x$('#foo').html( 'outer',  '<p>lock and load</p>' );
	 * 		x$('#foo').html( 'top',    '<div>bangers and mash</div>');
	 *  	x$('#foo').html( 'bottom', '<em>mean and clean</em>');
	 *  	x$('#foo').html( 'remove');	
	 *  	x$('#foo').html( 'before', '<p>some warmup html</p>');
	 *  	x$('#foo').html( 'after', '<p>more html!</p>');
	 * 
	 * or
	 * 
	 * 		x$('#foo').html('<p>sweet as honey</p>');
	 * 
	 */
    html: function(location, html) {
        clean(this);

        if (arguments.length == 0) {
            return this[0].innerHTML;
        }
        if (arguments.length == 1 && arguments[0] != 'remove') {
            html = location;
            location = 'inner';
        }
        if (html.each !== undefined) {
            var that = this;
            html.each(function(el){
                that.html(location, el);
            });
            return this;
        }
        return this.each(function(el) {
            var parent, 
                list, 
                len, 
                i = 0;
            if (location == "inner") { // .html
                if (typeof html == string) {
                    el.innerHTML = html;
                    list = el.getElementsByTagName('SCRIPT');
                    len = list.length;
                    for (; i < len; i++) {
                        eval(list[i].text);
                    }
                } else {
                    el.innerHTML = '';
                    el.appendChild(html);
                }
            } else if (location == "outer") { // .replaceWith
                el.parentNode.replaceChild(wrapHelper(html, el), el);
            } else if (location == "top") { // .prependTo
                el.insertBefore(wrapHelper(html, el), el.firstChild);
            } else if (location == "bottom") { // .appendTo
                el.insertBefore(wrapHelper(html, el), null);
            } else if (location == "remove") {
                el.parentNode.removeChild(el);
            } else if (location == "before") { // .insertBefore
                el.parentNode.insertBefore(wrapHelper(html, el.parentNode), el);
            } else if (location == "after") { // .insertAfter
                el.parentNode.insertBefore(wrapHelper(html, el.parentNode), el.nextSibling);
            }
        });
    },
    
    append: function (html) {
        return this.html(html, 'bottom');
    },
    
    prepend: function (html) {
      return this.html(html, 'top');
    },

    /**
	 * Attribute getter/setter
	 *
	 */
    attr: function(attribute, val) {
        if (arguments.length == 2) {
            return this.each(function(el) {
                el.setAttribute(attribute, val);
            });
        } else {
            var attrs = [];
            this.each(function(el) {
                var val = el.getAttribute(attribute);
                if (val != null)
                attrs.push(val);
            });
            return attrs;
        }
    }
// --
});

// private method for finding a dom element
function getTag(el) {
    return (el.firstChild === null) ? {'UL':'LI','DL':'DT','TR':'TD'}[el.tagName] || el.tagName : el.firstChild.tagName;
}

function wrapHelper(html, el) {
  return (typeof html == string) ? wrap(html, getTag(el)) : html;
}

// private method
// Wraps the HTML in a TAG, Tag is optional
// If the html starts with a Tag, it will wrap the context in that tag.
function wrap(xhtml, tag) {

    var attributes = {},
        re = /^<([A-Z][A-Z0-9]*)([^>]*)>([\s\S]*)<\/\1>/i,
        element,
        x,
        a,
        i = 0,
        attr,
        node,
        attrList;
        
    if (re.test(xhtml)) {
        result = re.exec(xhtml);
        tag = result[1];

        // if the node has any attributes, convert to object
        if (result[2] !== "") {
            attrList = result[2].split(/([A-Z]*\s*=\s*['|"][A-Z0-9:;#\s]*['|"])/i);

            for (; i < attrList.length; i++) {
                attr = attrList[i].replace(/^\s*|\s*$/g, "");
                if (attr !== "" && attr !== " ") {
                    node = attr.split('=');
                    attributes[node[0]] = node[1].replace(/(["']?)/g, '');
                }
            }
        }
        xhtml = result[3];
    }

    element = document.createElement(tag);

    for (x in attributes) {
        a = document.createAttribute(x);
        a.nodeValue = attributes[x];
        element.setAttributeNode(a);
    }

    element.innerHTML = xhtml;
    return element;
}


/**
* Removes all erronious nodes from the DOM.
* 
*/
function clean(collection) {
    var ns = /\S/;
    collection.each(function(el) {
        var d = el,
            n = d.firstChild,
            ni = -1,
            nx;
        while (n) {
            nx = n.nextSibling;
            if (n.nodeType == 3 && !ns.test(n.nodeValue)) {
                d.removeChild(n);
            } else {
                n.nodeIndex = ++ni; // FIXME not sure what this is for, and causes IE to bomb (the setter) - @rem
            }
            n = nx;
        }
    });
}
/**
 *
 * @namespace {Event}
 * @example
 *
 * Event
 * ---
 *	
 * A good old fashioned event handling system.
 * 
 */
xui.extend({
	
	
	/**	
	 *
	 * Register callbacks to DOM events.
	 * 
	 * @param {Event} type The event identifier as a string.
	 * @param {Function} fn The callback function to invoke when the event is raised.
	 * @return self
	 * @example
	 * 
	 * ### on
	 * 
	 * Registers a callback function to a DOM event on the element collection.
	 * 
	 * For more information see:
	 * 
	 * - http://developer.apple.com/webapps/docs/documentation/AppleApplications/Reference/SafariWebContent/HandlingEvents/chapter_7_section_1.html#//apple_ref/doc/uid/TP40006511-SW1
	 *
	 * syntax:
	 *
	 * 		x$('button').on( 'click', function(e){ alert('hey that tickles!') });
	 * 
	 * or...
	 * 
	 * 		x$('a.save').click(function(e){ alert('tee hee!') });
	 *
	 * arguments:
	 *
	 * - type:string the event to subscribe to click|load|etc
	 * - fn:function a callback function to execute when the event is fired
	 *
	 * example:
	 * 	
	 * 		x$(window).load(function(e){
	 * 			x$('.save').touchstart( function(evt){ alert('tee hee!') }).css(background:'grey');	
	 *  	});
	 * 	
	 */
	/*on: function(type, fn) {
	    return this.each(function(el) {
            if (window.addEventListener) {
                el.addEventListener(type, fn, false);
            }
      });
  },*/
  
    on: function(type, fn, details) {
        return this.each(function (el) {
            if (xui.events[type]) {
                var id = _getEventID(el), 
                    responders = _getRespondersForEvent(id, type);
                
                details = details || {};
                details.handler = function (event, data) {
                    xui.fn.fire.call(xui(this), type, data);
                };
                
                // trigger the initialiser - only happens the first time around
                if (!responders.length) {
                    xui.events[type].call(el, details);
                }
            } 
            el.addEventListener(type, _createResponder(el, type, fn), false);
        });
    },

    un: function(type, fn) {
        return this.each(function (el) {
            var id = _getEventID(el), responders = _getRespondersForEvent(id, type), i = responders.length;

            while (i--) {
                if (fn === undefined || fn.guid === responders[i].guid) {
                    el.removeEventListener(type, responders[i], false);
                    removex(cache[id][type], i, 1);
                }
            }

            if (cache[id][type].length === 0) delete cache[id][type];
            for (var t in cache[id]) {
                return;
            }
            delete cache[id];
        });
    },

    fire: function (type, data) {
        return this.each(function (el) {
            if (el == document && !el.dispatchEvent)
                el = document.documentElement;

            var event = document.createEvent('HTMLEvents');
            event.initEvent(type, true, true);
            event.data = data || {};
            event.eventName = type;
          
            el.dispatchEvent(event);
  	    });
  	}
  
// --
});

xui.events = {};

// this doesn't belong on the prototype, it belongs as a property on the xui object
xui.touch = (function () {
  try{
    return !!(document.createEvent("TouchEvent").initTouchEvent)
  } catch(e) {
    return false;
  };
})();

var cache = {};

// lifted from Prototype's (big P) event model
function _getEventID(element) {
    if (element._xuiEventID) return element._xuiEventID;
    return element._xuiEventID = ++_getEventID.id;
}

_getEventID.id = 1;

function _getRespondersForEvent(id, eventName) {
    var c = cache[id] = cache[id] || {};
    return c[eventName] = c[eventName] || [];
}

function _createResponder(element, eventName, handler) {
    var id = _getEventID(element), r = _getRespondersForEvent(id, eventName);

    var responder = function(event) {
        if (handler.call(element, event) === false) {
            event.preventDefault();
            event.stopPropagation();
        } 
    };
    
    responder.guid = handler.guid = handler.guid || ++_getEventID.id;
    responder.handler = handler;
    r.push(responder);
    return responder;
}

/**
 *
 * @namespace {Fx}
 * @example
 *
 * Fx
 * ---
 * 
 * Animations, transforms and transitions for getting the most out of hardware accelerated CSS.
 * 
 */
xui.extend({

	/**
	 *
	 * Tween is a method for transforming a css property to a new value.
	 * 
	 * @param {Object} options [Array|Object]
	 * @param {Function} callback
	 * @return self
	 * @example
	 * 
	 * ### tween
	 *	
	 * syntax:
	 * 
	 * x$(selector).tween(obj, callback);
	 *
	 * arguments:
	 * 
	 * - properties: object an object literal of element css properties to tween or an array containing object literals of css properties to tween sequentially.
	 * - callback (optional): function to run when the animation is complete
	 *
	 * example:
	 *
	 * 	x$('#box').tween({ left:100px, backgroundColor:'blue' });
	 * 	x$('#box').tween({ left:100px, backgroundColor:'blue' }, function() { alert('done!'); });
	 * 	x$('#box').tween([{ left:100px, backgroundColor:'green', duration:.2 }, { right:'100px' }]); 
	 * 
	 */
	// options: duration, after, easing
	tween: function( props, callback ) {
	    
	    // creates an options obj for emile
	    var emileOpts = function(o) {
	        var options = {};
    		"duration after easing".split(' ').forEach( function(p) {
        		if (props[p]) {
        		    options[p] = props[p];
        		    delete props[p];
        		}
    		});
    		return options;
	    }
	    
	    // serialize the properties into a string for emile
	    var serialize = function(props) {
		    var serialisedProps = [], key;
    		if (typeof props != string) {
      		    for (key in props) {
                    serialisedProps.push(key + ':' + props[key]);
    		    }
      		    serialisedProps = serialisedProps.join(';');
    		} else {
    		    serialisedProps = props;
    		}
    		return serialisedProps;
		};
	    
	    
		// queued animations
		if (props instanceof Array) {
		    // animate each passing the next to the last callback to enqueue
		    props.forEach(function(a){
		        
		    });
		}
	
	    
	    
	
	
	    // this branch means we're dealing with a single tween
	    var opts = emileOpts(props);
	    var prop = serialize(props);
		
		return this.each(function(e){
			emile(e, prop, opts, callback);
		});
	}
//---
});
/**
 *
 * @namespace {Style}
 * @example
 *
 * Style
 * ---
 *	
 * Anything related to how things look. Usually, this is CSS.
 * 
 */
function hasClass(el, className) {
    return getClassRegEx(className).test(el.className);
}

// Via jQuery - used to avoid el.className = ' foo';
// Used for trimming whitespace
var rtrim = /^(\s|\u00A0)+|(\s|\u00A0)+$/g;

function trim(text) {
  return (text || "").replace( rtrim, "" );
}

xui.extend({

    /**
	 * 
	 * Sets a single CSS property to a new value.
	 * 
	 * @param {String} prop The property to set.
	 * @param {String} val The value to set the property.
	 * @return self
	 * @example
	 *
	 * ### setStyle
	 *	
	 * syntax: 
	 *
	 * 	x$(selector).setStyle(property, value);
	 *
	 * arguments: 
	 *
	 * - property:string the property to modify
	 * - value:string the property value to set
	 *
	 * example:
	 * 
	 * 	x$('.txt').setStyle('color', '#000');
	 * 
	 */
    setStyle: function(prop, val) {
        return this.each(function(el) {
            el.style[prop] = val;
        });
    },

    /**
	 * 
	 * Retuns a single CSS property. Can also invoke a callback to perform more specific processing tasks related to the property value.
	 * 
	 * @param {String} prop The property to retrieve.
	 * @param {Function} callback A callback function to invoke with the property value.
	 * @return self if a callback is passed, otherwise the individual property requested
	 * @example
	 *
	 * ### getStyle
	 *	
	 * syntax: 
	 *
	 * 	x$(selector).getStyle(property, callback);
	 *
	 * arguments: 
	 * 
	 * - property:string a css key (for example, border-color NOT borderColor)
	 * - callback:function (optional) a method to call on each element in the collection 
	 *
	 * example:
	 *
	 *	x$('ul#nav li.trunk').getStyle('font-size');
	 *	
	 * 	x$('a.globalnav').getStyle( 'background', function(prop){ prop == 'blue' ? 'green' : 'blue' });
	 *
	 */
    getStyle: function(prop, callback) {
        return (callback === undefined) ?
            
            getStyle(this[0], prop) :
            
            this.each(function(el) {
                callback(getStyle(el, prop));
            });
    },

    /**
	 *
	 * Adds the classname to all the elements in the collection. 
	 * 
	 * @param {String} className The class name.
	 * @return self
	 * @example
	 *
	 * ### addClass
	 *	
	 * syntax:
	 *
	 * 	$(selector).addClass(className);
	 * 
	 * arguments:
	 *
	 * - className:string the name of the CSS class to apply
	 *
	 * example:
	 * 
	 * 	$('.foo').addClass('awesome');
	 *
	 */
    addClass: function(className) {
        return this.each(function(el) {
            if (hasClass(el, className) === false) {
              el.className = trim(el.className + ' ' + className);
            }
        });
    },
    /**
	 *
	 * Checks to see if classname is one the element. If a callback isn't passed, hasClass expects only one element in collection
	 * 
	 * @param {String} className The class name.
	 * @param {Function} callback A callback function (optional)
	 * @return self if a callback is passed, otherwise true or false as to whether the element has the class
	 * @example
	 *
	 * ### hasClass
	 *	
	 * syntax:
	 *
	 * 	$(selector).hasClass('className');
	 * 	$(selector).hasClass('className', function(element) {});	 
	 * 
	 * arguments:
	 *
	 * - className:string the name of the CSS class to apply
	 *
	 * example:
	 * 
	 * 	$('#foo').hasClass('awesome'); // returns true or false
	 * 	$('.foo').hasClass('awesome',function(e){}); // returns XUI object
	 *
	 */
    hasClass: function(className, callback) {
        return (callback === undefined && this.length == 1) ?
            hasClass(this[0], className) :
            this.each(function(el) {
                if (hasClass(el, className)) {
                    callback(el);
                }
            });
    },

    /**
	 *
	 * Removes the classname from all the elements in the collection. 
	 * 
	 * @param {String} className The class name.
	 * @return self
	 * @example
	 *
	 * ### removeClass
	 *	
	 * syntax:
	 *
	 * 	x$(selector).removeClass(className);
	 * 
	 * arguments:
	 *
	 * - className:string the name of the CSS class to remove.
	 *
	 * example:
	 * 
	 * 	x$('.bar').removeClass('awesome');
	 * 
	 */
    removeClass: function(className) {
        if (className === undefined) {
            this.each(function(el) {
                el.className = '';
            });
        } else {
            var re = getClassRegEx(className);
            this.each(function(el) {
                el.className = el.className.replace(re, '$1');
            });
        }
        return this;
    },


    /**
	 *
	 * Set a number of CSS properties at once.
	 * 
	 * @param {Object} props An object literal of CSS properties and corosponding values.
	 * @return self
	 * @example	
	 *
	 * ### css
	 *	
	 * syntax: 
	 *
	 * 	x$(selector).css(object);
	 *
	 * arguments: 
	 *
	 * - an object literal of css key/value pairs to set.
	 *
	 * example:
	 * 
	 * 	x$('h2.fugly').css({ backgroundColor:'blue', color:'white', border:'2px solid red' });
	 *  
	 */
    css: function(o) {
        for (var prop in o) {
            this.setStyle(prop, o[prop]);
        }
        return this;
    }
// --
});

function getStyle(el, p) {
    // this *can* be written to be smaller - see below, but in fact it doesn't compress in gzip as well, the commented
    // out version actually *adds* 2 bytes.
    // return document.defaultView.getComputedStyle(el, "").getPropertyValue(p.replace(/([A-Z])/g, "-$1").toLowerCase());
    return document.defaultView.getComputedStyle(el, "").getPropertyValue(p.replace(/[A-Z]/g, function(m){ return '-'+m.toLowerCase();}));
}

// RS: now that I've moved these out, they'll compress better, however, do these variables
// need to be instance based - if it's regarding the DOM, I'm guessing it's better they're
// global within the scope of xui

// -- private methods -- //
var reClassNameCache = {},
    getClassRegEx = function(className) {
        var re = reClassNameCache[className];
        if (!re) {
            // Preserve any leading whitespace in the match, to be used when removing a class
            re = new RegExp('(^|\\s+)' + className + '(?:\\s+|$)');
            reClassNameCache[className] = re;
        }
        return re;
    };
xui.extend({    
    /**
	 * 
	 * Another twist on remoting: lightweight and unobtrusive DOM databinding. Since we are often talking to a server with 
	 * handy JSON objects we added the convienance the map property which allows you to map JSON nodes to DOM elements. 
	 * 
	 * @param {String} url The URL to request.
	 * @param {Object} options The method options including a callback function to invoke when the request returns. 
	 * @return self
	 * @example
	 * 
	 * ### xhrjson 
	 *	
	 * syntax:
	 *
	 * 		xhrjson(url, options);
	 * 
	 * example:
	 *  
	 * The available options are the same as the xhr method with the addition of map. 
	 * 
	 * 		x$('#user').xhrjson( '/users/1.json', {map:{'username':'#name', 'image_url':'img#avatar[@src]'} });
	 * 
	 */
    xhrjson: function(url, options) {
        var that = this;
		    var cb = typeof cb != 'function' ? function(x){return x} : options.callback;

        var callback = function() {
            var o = eval('(' + this.responseText + ')');
            for (var prop in o) {
                xui(options.map[prop]).html(cb(o[prop]));
            }
        };
        options.callback = callback;
        this.xhr(url, options);
        return this;
    }
// --
});
"inner outer top bottom remove before after".split(' ').forEach(function (method) {
  xui.fn[method] = function (html) { return this.html(method, html); };
});

var cache = {};

/**
 *
 * @namespace {Event}
 * @example
 *
 * Event
 * ---
 *	
 * A good new skool fashioned event handling system.
 *
 * - click
 * - load
 * - touchstart
 * - touchmove
 * - touchend
 * - touchcancel
 * - gesturestart
 * - gesturechange
 * - gestureend
 * - orientationchange
 *
 * 
 */

"click load submit touchstart touchmove touchend touchcancel gesturestart gesturechange gestureend orientationchange".split(' ').forEach(function (event) {
  xui.fn[event] = function (fn) { return fn ? this.on(event, fn) : this.fire(event); };
});

// patched orientation support - Andriod 1 doesn't have native onorientationchange events
/*if (true || !('onorientationchange' in document.body)) {*/
/*(function () {*/
/*var w = window.innerWidth, h = window.innerHeight;*/

/*xui(window).on('resize', function () {*/
/*var portraitSwitch = (window.innerWidth < w && window.innerHeight > h) && (window.innerWidth < window.innerHeight),*/
/*landscapeSwitch = (window.innerWidth > w && window.innerHeight < h) && (window.innerWidth > window.innerHeight);*/
/*if (portraitSwitch || landscapeSwitch) {*/
/*window.orientation = portraitSwitch ? 0 : 90; // what about -90? Some support is better than none*/
/*x$('body').fire('orientationchange'); // will this bubble up?*/
/*w = window.innerWidth;*/
/*h = window.innerHeight;*/
/*}*/
/*});*/
/*})();*/
/*}*/
xui.extend({
    nativeAnimate: function (options, callback) {
        this.animationStack = [];
        if (options instanceof Array) {
            for (var i = 0; i < options.length; i++) {
                this.animationStack.push(options[i]);
            }
        } else if (options instanceof Object) {
            this.animationStack.push(options);
        }

        this.start(callback);
        return this;
    },

    // -- private -- //

    // TODO move these methods into the tween method
    animationStack: [],

    start: function (callback) {
        var t = 0,
            len = this.animationStack.length,
            i, options, duration;
        
        for (i = 0; i < this.animationStack.length; i++) {
            options = this.animationStack[i];
            duration = options.duration === undefined ? 0.5 : options.duration;
            // We use setTimeout to stage the animations.
            window.setTimeout(function (s, o, i) {
                s.animate(o);
                if ((i === len - 1) && callback && typeof(callback) === 'function') {
                    callback();
                }
            }, t * 1000 * duration, this, options, i);
            t += duration;
        }

        return this;
    },
  
    animate: function (options) {   
        var that = this,
            opt_after = options.after,
            easing = (options.easing === undefined) ? 'ease-in' : options.easing,
            before = (options.before === undefined) ? function () {} : options.before,
            after = (opt_after === undefined) ? function () {} : function () { opt_after.apply(that); },
            duration = (options.duration === undefined) ? 0.5 : options.duration,
            translate = options.by,
            rotate = options.rotate;
            
        options.easing = options.rotate = options.by = options.before = options.after = options.duration = undefined;
        before.apply(before.arguments);
   
        // this sets duration and easing equation on a style property change
        this.setStyle('-webkit-transition', 'all ' + duration + 's ' + easing);
   
        // sets the starting point and ending point for each css property tween
        this.each(function (el) {
            for (var prop in options) {
                that.setStyle(prop, options[prop]);
            }
    
            if (translate) {
                that.setStyle('-webkit-transform', that.translateOp(translate[0], translate[1]));
            }
            
            if (rotate) {
                that.setStyle('-webkit-transform', that.rotateOp(rotate[0], rotate[1]));
            }
        });

        window.setTimeout(function () { that.setStyle('-webkit-transition', 'none'); }, duration * 1000);
        window.setTimeout(function () { that.setStyle('-webkit-transform', 'none'); }, duration * 1000);
        window.setTimeout(after, duration * 1000);

        return this || that; // haha
    },
    
    translateOp: function (xPixels, yPixels) {
        return 'translate(' + xPixels + 'px, ' + yPixels + 'px)';
    },
    
    rotateOp: function (axis, degree) {
        return 'rotate' + axis.toUpperCase() + '(' + degree + 'deg)';
    }
// --
});
/**
 *
 * @namespace {Form}
 * @example
 *
 *
 * Form
 * ---
 *	
 * Form related
 * 
 */
xui.extend({
    /**
     * 
     * This method is private, it takes a form element and returns a string
     * 
     * @param {Element} form
     * @return encoded querystring
     * 
     */
    _toQueryString: function (docForm) {
        var submitString = '',
            formElement = '',
            lastElementName = '',
            length = docForm.length,
            i;
        
        for (i = 0 ; i < length ; i++) {
            formElement = docForm[i];
            switch (formElement.type) {
            case 'text' :
            case 'select-one' :
            case 'hidden' :
            case 'password' :
            case 'textarea' :
                submitString += formElement.name + '=' + encodeURIComponent(formElement.value) + '&'; 
                break; 
            case 'radio' :
                if (formElement.checked) { 
                    submitString += formElement.name + '=' + encodeURIComponent(formElement.value) + '&'; 
                } 
                break; 
            case 'checkbox' :
                if (formElement.checked)  {
                    if (formElement.name == lastElementName) {
                        if (submitString.lastIndexOf('&') === submitString.length - 1) { 
                            submitString = submitString.substring(0, submitString.length - 1); 
                        } 
                        submitString += ',' + encodeURIComponent(formElement.value); 
                    } else { 
                        submitString += formElement.name + '=' + encodeURIComponent(formElement.value);  
                    } 
                    submitString += '&'; 
                    lastElementName = formElement.name; 
                } 
                break;  
            }
        } 
        submitString = submitString.substring(0, submitString.length - 1); 
        return submitString;
    }
// --
});

xui.extend({
    
	/**
	 * Adds more DOM nodes to the existing element list.
	 */
	add: function(q) {
	  [].push.apply(this, slice(xui(q)));
	  return this.set(this.reduce());
	},

	/**
	 * Pops the last selector from XUI
	 */
	end: function () {	
		return this.set(this.cache || []);	 	
	},

	/**
	 * Returns the first element in the collection.
	 * 
	 * @return Returns a single DOM element.
	 */
	first: function() {
		return this.get(0);
	},

	/**
	 * Returns the element in the collection at the 
	 * given index
	 *
	 * @return Returns a single DOM element
	 * */
	get: function(index) {
		return this[index];
	},
	
	/**
	 * Returns a collection containing the element
	 * at the given index
	 * */
	eq: function(idx1,idx2) {
		idx2 = idx2 ? idx2 + 1 : idx1 + 1;
		return this.set([].slice.call(this, idx1, idx2));
	},

	/**
	 * Returns the size of the collection
	 *
	 * @return Returns an integer size of collection (use xui.length instead)
	 * */
	size: function() {
		return this.length;
	}
// --	
});	

xui.extend({    
    /**
	 * 
	 * Another twist on remoting: lightweight and unobtrusive DOM databinding. Since we are often talking to a server with 
	 * handy JSON objects we added the convienance the map property which allows you to map JSON nodes to DOM elements. 
	 * 
	 * @param {String} url The URL to request.
	 * @param {Object} options The method options including a callback function to invoke when the request returns. 
	 * @return self
	 * @example
	 * 
	 * ### xhrjson 
	 *	
	 * syntax:
	 *
	 * 		xhrjson(url, options);
	 * 
	 * example:
	 *  
	 * The available options are the same as the xhr method with the addition of map. 
	 * 
	 * 		x$('#user').xhrjson( '/users/1.json', {map:{'username':'#name', 'image_url':'img#avatar[@src]'} });
	 * 
	 */
    xhrjson: function(url, options) {
        var that = this;
		    var cb = typeof cb != 'function' ? function(x){return x} : options.callback;

        var callback = function() {
            var o = eval('(' + this.responseText + ')');
            for (var prop in o) {
                xui(options.map[prop]).html(cb(o[prop]));
            }
        };
        options.callback = callback;
        this.xhr(url, options);
        return this;
    }
// --
});
})();
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
	INPUT_EVENT = "touchstart";
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
	}
});
var Controller = Class.extend({
	init: function(element) {
		this.element = element;
	},
	bindClickEvents: function(obj) {
		var self = this;
		var $element = x$(this.element);
		for (var key in obj) {
			x$(key).on(INPUT_EVENT, self._clickEvent(obj[key]));
		}
	},
	_clickEvent: function(f) {
		var self = this;
		return function() {
			f.call(self);
		}
	},
	hide: function() {
		this.element.setStyle("display", "none");
	},
	show: function() {
		this.element.setStyle("display", "block");
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
	init: function(elementId) {
		this.element = document.getElementById(elementId);
        if (this.useLiveClickEvents) {
            var self = this;
            this.element.addEventListener("click", function(e) {
                if (self.onClick[e.target.getAttribute("data-click")]) {
                    self.onClick[e.target.getAttribute("data-click")].call(self, e);
                }
            });
        }
	},
	bindViewEvent: function(selector, eventName, f) {
		this.bindElementEvent(this.element, selector, eventName, f);
	},
	bindElementEvent: function(element, selector, eventName, f) {
		var elements = element.querySelectorAll(selector);
		for (var i = 0; i < elements.length; i++) {
			elements[i].addEventListener(eventName, f);
		}
	},
	find: function(selector) {
		return this.element.querySelector(selector);
	},
	findAll: function(selector) {
		return this.element.querySelectorAll(selector);
	},
	remove: function() {
		//TODO: unbind all events
		this.element.innerHTML = "";
    },
    useLiveClickEvents: false
});
var TemplateView = View.extend({
	_render: function(templateId, data) {
		var tmp = template(templateId, data);
		this.element.innerHTML = tmp;
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
			'blackberry':window.BlackBerryPersistentStorageAdaptor
		};
		this.adaptor = opts.adaptor ? new adaptors[opts.adaptor](opts) : new WebkitSQLiteAdaptor(opts);
		
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
		var is = (typeof condition == 'string') ? function(r){return eval(condition)} : condition;
		var cb = this.adaptor.terseToVerboseCallback(callback);
	
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


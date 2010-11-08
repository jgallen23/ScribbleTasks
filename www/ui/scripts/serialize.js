/*! 
 * raphaeljs.serialize 0.1 beta - Serialization methods for Raphael 
 * 
 * Copyright (c) 2010 Adly Abdullah (slebet...@yahoo.com) 
 * Licensed under the MIT license: 
 * (http://www.opensource.org/licenses/mit-license.php) 
 */ 
Raphael.fn.serialize = { 
  init : function () { 
    // Create all array and add methods: 
    this.serialize.all = []; 
    var all = this.serialize.all; 
    var paper = this; 
    this.serialize.freeze = function () { 
      var json = []; 
      for (var i=all.length;--i>=0;) { 
        var obj = all[i].attr(); 
        obj.type = all[i].type; 
        json.unshift(obj); 
      } 
      return JSON.stringify(json); 
    }; 
    this.serialize.thaw = function (txt) { 
      var json = JSON.parse(txt); 
      var s = paper.set(); 
      for (var i=0,l=json.length;i<l;i++) { 
        s.push(paper[json[i].type]().attr(json[i])); 
      } 
      return s; 
    }; 
    // make init harmless: 
    this.serialize.init = function () {}; 
    // now monkey patch Raphael: 
    var constructors = [ 
      'circle', 'rect', 'ellipse', 
      'image', 'text', 'path' 
    ]; 
    for (var i=constructors.length;--i>=0;) { 
      var c = constructors[i]; 
      this[c] = (function (orig) { 
        return function () { 
          var obj = orig.apply(paper,arguments); 
          all.push(obj); 
          return obj; 
        } 
      })(this[c]) 
    } 
	this.clear = (function(orig) {
		return function() {
			orig.apply(paper, arguments);
            delete all;
			all = [];
		}
	})(this.clear);
  } 
}

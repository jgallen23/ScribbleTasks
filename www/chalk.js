    /* Drawing */
    skip = false;
    count = 0;
    points = [null];
    x = (y = null);
    draw = function(point) {
      var _ref;
      if (point) {
        if (skip) {
          return (skip = false);
        } else {
          context.moveTo(x, y);
          _ref = point;
          x = _ref[0];
          y = _ref[1];
          return context.lineTo(x, y);
        }
      } else {
        return (skip = true);
      }
    };
    canvas.bind("touchstart", function(event) {
      var _ref, touch;
      touch = event.touches[0];
      _ref = [touch.pageX - xOffset, touch.pageY - yOffset];
      x = _ref[0];
      y = _ref[1];
      return event.preventDefault();
    });
    canvas.bind("touchmove", function(event) {
      var touch;
      touch = event.touches[0];
      return points.push([touch.pageX - xOffset, touch.pageY - yOffset]);
    });
    canvas.bind("touchend", function(event) {
      return points.push([x, y], [x, y], null);
    });
    setInterval(function() {
      var start;
      if (!(points.length)) {
        return null;
      }
      start = new Date();
      context.beginPath();
      while (points.length && new Date() - start < 10) {
        draw(points.shift());
      }
      return context.stroke();
    }, 30);

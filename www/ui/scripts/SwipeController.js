window.addSwipeHandler = function(element, callback) {
	var startX = null;
	var startY = null;
	var dx = null;
	var dy = null;

	var touchStart = function(e) {
		startX = e.touches[0].clientX;
		startY = e.touches[0].clientY;	
	}

	var touchMove = function(e) {
		dx = startX - e.touches[0].clientX
		dy = startY - e.touches[0].clientY;
	}

	var touchEnd = function(e) {
		if (Math.abs(dx) > 150 && Math.abs(dy) < 50) {
			if (dx > 0) {
				callback(element, "left");
			} else {
				callback(element, "right");
			}
		}
	}

	element.addEventListener("touchstart", touchStart);
	element.addEventListener("touchmove", touchMove);
	element.addEventListener("touchend", touchEnd);
}

var DomOutline = function(options) {
	options = options || {};

	var pub = {};
	var self = {
		onCaptured : options.onCaptured,
		onClosed : options.onClosed,

		keyExit : [ "ESC" ],
		keyDelete : [ "Delete", "BackSpace" ],
		keyExpand : [ "Space", "Up", "Plus" ],
		keyRecurseCapture : [ "Enter", "Control+C" ],
		keySingledCapture : [ "Control+Enter" ],

		actived : false,
		initialized : false,
		elements : {},
		selected : null
	};

	function initStylesheet() {
		if (self.initialized) {
			return;
		}
		self.initialized = true;

		var css = '.DomOutline_side {' + '    background: #09c;'
				+ '    position: absolute;' + '    z-index: 1000000;' + '}'
				+ '.DomOutline_label {' + '    background: #09c;'
				+ '    border-radius: 2px;' + '    color: #fff;'
				+ '    font: bold 12px/12px Helvetica, sans-serif;'
				+ '    padding: 4px 6px;' + '    position: absolute;'
				+ '    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.25);'
				+ '    z-index: 1000001;' + '}';

		var element = document.createElement('style');
		element.type = 'text/css';
		document.getElementsByTagName('head')[0].appendChild(element);
		element.innerHTML = css;
	}

	function createOutline() {
		self.elements.label = jQuery('<div></div>')
				.addClass('DomOutline_label').appendTo('body');
		self.elements.top = jQuery('<div></div>').addClass('DomOutline_side')
				.appendTo('body');
		self.elements.bottom = jQuery('<div></div>')
				.addClass('DomOutline_side').appendTo('body');
		self.elements.left = jQuery('<div></div>').addClass('DomOutline_side')
				.appendTo('body');
		self.elements.right = jQuery('<div></div>').addClass('DomOutline_side')
				.appendTo('body');
	}

	function removeOutline() {
		jQuery.each(self.elements, function(name, element) {
			element.remove();
		});
	}

	function getScrollTop() {
		if (!self.elements.window) {
			self.elements.window = jQuery(window);
		}
		return self.elements.window.scrollTop();
	}

	function updateOutline() {
		var b = 2;
		var scroll_top = getScrollTop();
		var pos = {
			left : 0,
			top : 0,
			width : 0,
			height : 0,
			right : 0,
			bottom : 0
		};
		var label_text = "";
		if (pub.selected) {
			pos = pub.selected.get(0).getBoundingClientRect();
			label_text = pub.selected.get(0).tagName.toLowerCase();
		}

		var top = pos.top + scroll_top;
		var label_top = Math.max(0, top - 20 - b, scroll_top);
		var label_left = Math.max(0, pos.left - b);

		self.elements.label.css({
			top : label_top,
			left : label_left
		}).text(label_text);
		self.elements.top.css({
			top : Math.max(0, top - b),
			left : pos.left - b,
			width : pos.width + b,
			height : b
		});
		self.elements.bottom.css({
			top : top + pos.height,
			left : pos.left - b,
			width : pos.width + b,
			height : b
		});
		self.elements.left.css({
			top : top - b,
			left : Math.max(0, pos.left - b),
			width : b,
			height : pos.height + b
		});
		self.elements.right.css({
			top : top - b,
			left : pos.left + pos.width,
			width : b,
			height : pos.height + (b * 2)
		});
	}

	function mouseHandler(e) {
		if (e.target.className.indexOf('DomOutline') !== -1) {
			return;
		}
		if (e.target.tagName.toLowerCase().indexOf('body') !== -1) {
			pub.selected = null;
		} else {
			pub.selected = $(e.target);
		}

		updateOutline();
	}

	function keyHandler(e) {
		var keyString = keyEventToString(e);

		if (self.keyExit.indexOf(keyString) > -1) {
			pub.stop();
		} else if (self.keyExpand.indexOf(keyString) > -1) {
			pub.selected = $(pub.selected.parent().get(0));
			updateOutline();
		} else if (self.keyDelete.indexOf(keyString) > -1) {
			if (pub.selected) {
				pub.selected.remove();
				pub.selected = null;
			}
			updateOutline();
		} else if (self.keyRecurseCapture.indexOf(keyString) > -1) {
			if (self.onCaptured && pub.selected) {
				self.onCaptured(pub.selected, true);
			}
		} else if (self.keySingledCapture.indexOf(keyString) > -1) {
			if (self.onCaptured && pub.selected) {
				self.onCaptured(pub.selected, false);
			}
		} else {
			return false;
		}
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	function clickHandler(e) {
		return false;
	}

	pub.start = function() {
		initStylesheet();
		if (self.actived) {
			return;
		}
		self.actived = true;
		createOutline();
		jQuery('body').bind('mousemove.DomOutline', mouseHandler);
		jQuery('body').bind('keyup.DomOutline', keyHandler);
		jQuery('body').bind('click.DomOutline', clickHandler);
	};

	pub.stop = function() {
		self.actived = false;
		removeOutline();
		jQuery('body').unbind('.DomOutline');
		if (self.onClosed) {
			self.onClosed();
		}
	};

	return pub;
};

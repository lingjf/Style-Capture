var DomOutline = function(options) {
	options = options || {};

	var pub = {};
	var self = {
		onCaptured : options.onCaptured,
		onClosed : options.onClosed,

		keyExit : [ "ESC" ],
		keyDelete : [ "Delete", "BackSpace" ],
		keyExpand : [ "Up", "Control+Up", "Space", "Control+Space", "Plus" ],
		keyShrink : [ "Down", "Control+Down" ],
		keyRecurseCapture : [ "Enter", "Control+C" ],
		keySingledCapture : [ "Control+Enter", "Control+X" ],

		omitted : [ 'HTML', 'HEAD', 'BODY' ],
		actived : false,
		initialized : false,
		showchain : true,
		frozen : false,
		elements : {},
		selected : null,
		stacked : []
	};

	function initStylesheet() {
		if (self.initialized) {
			return;
		}
		self.initialized = true;

		var css = ".DomOutline_side {  			\
						background: #09c;		\
						position: absolute;		\
						z-index: 1000000;		\
					}							\
				   .DomOutline_label {			\
						background-color: rgba(0, 153, 204, 0.5);\
						border-radius: 2px;		\
						color: #fff;			\
						font: 12px/12px Helvetica, sans-serif;\
						padding: 4px 4px;		\
						position: absolute;		\
						text-shadow: 0 1px 1px rgba(0, 0, 0, 0.25);\
						z-index: 1000001;		\
					}							\
				   .DomOutline_node {			\
						float: left;			\
						border: none;	margin-right: 4px;\
					} 							\
				   .DomOutline_node:hover {		\
						color: green;  			\
					}							\
				   ";

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
			if (self.showchain) {
				pub.selected.parents().each(
						function(index) {
							label_text = "<div class='DomOutline_node' rel='"
									+ index + "'>" + this.tagName.toLowerCase()
									+ "</div>" + label_text;
						});
			}
			label_text = label_text + "<div class='DomOutline_node'>"
					+ pub.selected.get(0).tagName.toLowerCase() + "</div>";
			// label_text += "<div class='DomOutline_node' cap='singled'>
			// &#8731; </div>";
			// label_text += "<div class='DomOutline_node' cap='recurse'>
			// &#8732; </div>";
		}

		var top = pos.top + scroll_top;
		var label_top = Math.max(0, top - 20 - b, scroll_top);
		var label_left = Math.max(0, pos.left - b);

		self.elements.label.css({
			top : label_top,
			left : label_left
		}).html(label_text);

		$("div.DomOutline_node[rel]").click(function(e) {
			var rel = $(this).attr('rel');
			if (rel) {
				parentSelection(rel);
			}
			return false;
		});
		// $("div.DomOutline_node[cap='singled']").click(function() {
		// self.onCaptured(pub.selected, false);
		// });
		// $("div.DomOutline_node[cap='recurse']").click(function() {
		// self.onCaptured(pub.selected, true);
		// });
		self.elements.top.css({
			top : Math.max(0, top - b),
			left : pos.left - b,
			width : pos.width + b * 2,
			height : b
		});
		self.elements.bottom.css({
			top : top + pos.height,
			left : pos.left - b,
			width : pos.width + b * 2,
			height : b
		});
		self.elements.left.css({
			top : top - b,
			left : Math.max(0, pos.left - b),
			width : b,
			height : pos.height + b * 2
		});
		self.elements.right.css({
			top : top - b,
			left : pos.left + pos.width,
			width : b,
			height : pos.height + b * 2
		});
	}

	function mouseHandler(e) {
		if (self.frozen || e.ctrlKey) {
			return;
		}
		var target = null;
		if (e.target.className.indexOf('DomOutline') > -1) {
			return;
		}
		if (self.omitted.indexOf(e.target.tagName.toUpperCase()) === -1) {
			target = $(e.target);
		}
		if (target && !target.is(pub.selected)) {
			pub.selected = target;
			self.stacked = [ pub.selected ];
			pub.selected.parents().each(function(index) {
				self.stacked.push($(this));
			});
			updateOutline();
		}
	}

	function parentSelection(seq) {
		pub.selected.parents().each(function(index) {
			if (self.omitted.indexOf(this.tagName.toUpperCase()) === -1) {
				if (index == seq) {
					pub.selected = $(this);
				}
			}
		});
		self.frozen = true;
		setTimeout(function() {
			self.frozen = false;
		}, 1000);
		updateOutline();
	}

	function stepSelection(ud) {
		var index = -1;
		for (var i = 0; i < self.stacked.length; i++) {
			if (pub.selected.is(self.stacked[i])) {
				index = i;
				break;
			}
		}
		index += ud;
		if (0 <= index && index <= self.stacked.length - 1) {
			if (self.omitted.indexOf(self.stacked[index].get(0).tagName
					.toUpperCase()) === -1) {
				pub.selected = self.stacked[index];
				updateOutline();
			}
		}
	}

	function keyHandler(e) {
		var keyString = keyEventToString(e);

		if (self.keyExit.indexOf(keyString) > -1) {
			pub.stop();
		} else if (self.keyExpand.indexOf(keyString) > -1) {
			stepSelection(1);
		} else if (self.keyShrink.indexOf(keyString) > -1) {
			stepSelection(-1);
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
			return true;
		}
		e.preventDefault();
		e.stopPropagation();
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
		/* jQuery does NOT support register event at Capture phase */
		// jQuery('body').bind('keyup.DomOutline', keyHandler);
		document.getElementsByTagName('body')[0].addEventListener('keyup',
				keyHandler, true);
	};

	pub.stop = function() {
		self.actived = false;
		removeOutline();
		document.getElementsByTagName('body')[0].removeEventListener('keyup',
				keyHandler, true);
		jQuery('body').unbind('.DomOutline');
		if (self.onClosed) {
			self.onClosed();
		}
	};

	pub.update = function(options) {
		for ( var i in options) {
			if (i === "showchain") {
				self.showchain = options[i];
			}
		}
	};

	return pub;
};

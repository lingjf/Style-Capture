var CopyCSSS = function(options) {
	options = options || {};

	var pub = {};
	var self = {
		initialized : false,
	};

	// https://developer.mozilla.org/en-US/docs/Web/CSS/Shorthand_properties
	function merge(a, b, c, d) {
		if (a === b && b === c && c === d) {
			return [ a ];
		} else if (a === c && b === d) {
			return [ a, d ];
		} else {
			return [ a, b, c, d ];
		}
	}

	function shorthand_background(style) {
		var l = [];
		if (!style["background-color"]) {
			return;
		}
		if (!style["background-image"]) {
			return;
		}
		if (!style["background-repeat"]) {
			return;
		}
		if (!style["background-attachment"]) {
			return;
		}
		if (!style["background-position"]) {
			return;
		}
		l.push(style["background-color"]);
		l.push(style["background-image"]);
		l.push(style["background-repeat"]);
		l.push(style["background-attachment"]);
		l.push(style["background-position"]);

		style["background"] = l.join(" ");

		delete style["background-color"];
		delete style["background-image"];
		delete style["background-repeat"];
		delete style["background-attachment"];
		delete style["background-position"];
		delete style["background-clip"];
		delete style["background-origin"];
		delete style["background-size"];
	}

	function shorthand_border(style) {
		function shorthand_border_color(style) {
			if (!style["border-top-color"]) {
				return false;
			}
			if (!style["border-right-color"]) {
				return false;
			}
			if (!style["border-bottom-color"]) {
				return false;
			}
			if (!style["border-left-color"]) {
				return false;
			}

			var t = style["border-top-color"];
			var r = style["border-right-color"];
			var b = style["border-bottom-color"];
			var l = style["border-left-color"];

			style["border-color"] = merge(t, r, b, l).join(" ");

			delete style["border-top-color"];
			delete style["border-right-color"];
			delete style["border-bottom-color"];
			delete style["border-left-color"];

			return t === r && r === b && b === l;
		}
		function shorthand_border_style(style) {
			if (!style["border-top-style"]) {
				return false;
			}
			if (!style["border-right-style"]) {
				return false;
			}
			if (!style["border-bottom-style"]) {
				return false;
			}
			if (!style["border-left-style"]) {
				return false;
			}

			var t = style["border-top-style"];
			var r = style["border-right-style"];
			var b = style["border-bottom-style"];
			var l = style["border-left-style"];

			style["border-style"] = merge(t, r, b, l).join(" ");

			delete style["border-top-style"];
			delete style["border-right-style"];
			delete style["border-bottom-style"];
			delete style["border-left-style"];

			return t === r && r === b && b === l;
		}
		function shorthand_border_width(style) {
			if (!style["border-top-width"]) {
				return false;
			}
			if (!style["border-right-width"]) {
				return false;
			}
			if (!style["border-bottom-width"]) {
				return false;
			}
			if (!style["border-left-width"]) {
				return false;
			}

			var t = style["border-top-width"];
			var r = style["border-right-width"];
			var b = style["border-bottom-width"];
			var l = style["border-left-width"];

			style["border-width"] = merge(t, r, b, l).join(" ");

			delete style["border-top-width"];
			delete style["border-right-width"];
			delete style["border-bottom-width"];
			delete style["border-left-width"];

			return t === r && r === b && b === l;
		}
		
		var bc = shorthand_border_color(style);
		var bw = shorthand_border_width(style);
		var bs = shorthand_border_style(style);

		if (!style["border-color"]) {
			return;
		}
		if (!style["border-width"]) {
			return;
		}
		if (!style["border-style"]) {
			return;
		}
		
		if (!bc && !bw && !bs) {
			return;
		}

		var c = style["border-color"];
		var w = style["border-width"];
		var s = style["border-style"];

		style["border"] = [ w, s, c ].join(" ");

		delete style["border-color"];
		delete style["border-style"];
		delete style["border-width"];
	}

	function shorthand_border_image(style) {
		delete style["border-image-outset"];
		delete style["border-image-repeat"];
		delete style["border-image-slice"];
		delete style["border-image-source"];
		delete style["border-image-width"];
	}

	function shorthand_border_radius(style) {
		if (!style["border-top-left-radius"]) {
			return;
		}
		if (!style["border-top-right-radius"]) {
			return;
		}
		if (!style["border-bottom-right-radius"]) {
			return;
		}
		if (!style["border-bottom-left-radius"]) {
			return;
		}

		var tl = style["border-top-left-radius"];
		var tr = style["border-top-right-radius"];
		var br = style["border-bottom-right-radius"];
		var bl = style["border-bottom-left-radius"];

		var l = merge(tl, tr, br, bl);

		style["border-radius"] = l.join(" ");
		style["-moz-border-radius"] = l.join(" ");
		style["-webkit-border-radius"] = l.join(" ");

		delete style["border-top-left-radius"];
		delete style["border-top-right-radius"];
		delete style["border-bottom-right-radius"];
		delete style["border-bottom-left-radius"];
	}

	function shorthand_margin(style) {
		if (!style["margin-top"]) {
			return;
		}
		if (!style["margin-right"]) {
			return;
		}
		if (!style["margin-bottom"]) {
			return;
		}
		if (!style["margin-left"]) {
			return;
		}

		var t = style["margin-top"];
		var r = style["margin-right"];
		var b = style["margin-bottom"];
		var l = style["margin-left"];

		style["margin"] = merge(t, r, b, l).join(" ");

		delete style["margin-top"];
		delete style["margin-right"];
		delete style["margin-bottom"];
		delete style["margin-left"];
	}

	function shorthand_padding(style) {
		if (!style["padding-top"]) {
			return;
		}
		if (!style["padding-right"]) {
			return;
		}
		if (!style["padding-bottom"]) {
			return;
		}
		if (!style["padding-left"]) {
			return;
		}

		var t = style["padding-top"];
		var r = style["padding-right"];
		var b = style["padding-bottom"];
		var l = style["padding-left"];

		style["padding"] = merge(t, r, b, l).join(" ");

		delete style["padding-top"];
		delete style["padding-right"];
		delete style["padding-bottom"];
		delete style["padding-left"];
	}
	function shorthand_font(style) {
		// http://www.w3.org/TR/CSS2/fonts.html#font-shorthand
	}
	function shorthand_outline(style) {
		if (!style["outline-color"]) {
			return;
		}
		if (!style["outline-width"]) {
			return;
		}
		if (!style["outline-style"]) {
			return;
		}

		var c = style["outline-color"];
		var w = style["outline-width"];
		var s = style["outline-style"];

		style["outline"] = [ c, w, s ].join(" ");

		delete style["outline-color"];
		delete style["outline-style"];
		delete style["outline-width"];
	}

	function shorthand(style) {
		shorthand_background(style);
		shorthand_border(style);
		shorthand_border_radius(style);
		shorthand_border_image(style);
		shorthand_margin(style);
		shorthand_padding(style);
		shorthand_font(style);
		shorthand_outline(style);
	}

	function importCrossOriginLink() {
		var links = document.querySelectorAll("link[rel='stylesheet']");

		for ( var i = 0; i < links.length; i++) {
			var tmplink = links[i].getAttribute('href');
			if (tmplink.indexOf('http') === 0) {
				/* do nothing */
			} else if (tmplink.substr(0, 2) === '//') {
				tmplink = window.location.protocol + tmplink;
			} else {
				continue;
			}

			var origin = window.location.protocol + '//'
					+ window.location.hostname + ":" + window.location.port
					+ '/';
			if (tmplink.indexOf(origin) !== 0) {
				var http = new XMLHttpRequest();
				http.open("GET", tmplink);
				http.onreadystatechange = function() {
					if (this.readyState === 4) {
						var element = document.createElement('style');
						element.type = 'text/css';
						element.disabled = true;
						document.getElementsByTagName('head')[0]
								.appendChild(element);
						element.innerHTML = this.responseText;
					}
				};
				http.send(null);
			}
		}
	}

	pub.init = function() {
		if (self.initialized) {
			return;
		}
		importCrossOriginLink();
		self.initialized = true;
	};
	
	pub.getFinalStyles = function(element) {
		var product = {};
		var dom = element.get(0);
		var style = window.getComputedStyle(dom, null);
		for (var i = 0, l = style.length; i < l; i++) {
			var name = style[i];
			var value = style.getPropertyValue(name);
			product[name] = value;
		}
		shorthand(product);
		return product;
	};

	pub.getDefaultStyles = function(element) {
		if (window.getDefaultComputedStyle) {
			var product = {};
			var dom = element.get(0);
			var style = window.getDefaultComputedStyle(dom, null);
			for (var i = 0, l = style.length; i < l; i++) {
				var name = style[i];
				var value = style.getPropertyValue(name);
				product[name] = value;
			}
			shorthand(product);
			return product;
		}
		return this.getFinalStyles(element);
	};

	pub.getPseudoStyles = function(element, type) {
		var cc = 0;
		var product = {};
		var sheets = document.styleSheets;
		for ( var i = 0; i < sheets.length; i++) {
			var rules = sheets[i].rules || sheets[i].cssRules;
			for ( var j = 0; rules && j < rules.length; j++) {
				if (!rules[j].selectorText)
					continue;
				var selectors = rules[j].selectorText.split(",");
				for ( var k = 0; k < selectors.length; k++) {
					if (selectors[k].indexOf(":" + type) === -1)
						continue;
					if (!element.is(selectors[k].replace(":" + type, "")))
						continue;
					var css = rules[j].style;
					for ( var l = 0; l < css.length; l++) {
						product[css[l]] = css[css[l]];
						cc += 1;
					}
				}
			}
		}
		shorthand(product);
		return cc > 0 ? product : null;
	};

	return pub;
};

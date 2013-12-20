var CopyCSSS = function(options) {
	options = options || {};

	var pub = {};
	var self = {
		initialized : false,
		sequence : 0,
		including : [],
		excluding : [ "-webkit-perspective-origin", "-webkit-transform-origin" ]
	};

	// https://developer.mozilla.org/en-US/docs/Web/CSS/Shorthand_properties
	function merge4(a, b, c, d) {
		if (a === b && b === c && c === d) {
			return [ a ];
		} else if (a === c && b === d) {
			return [ a, d ];
		} else {
			return [ a, b, c, d ];
		}
	}

	function merge2(a, b) {
		if (a === b) {
			return [ a ];
		} else {
			return [ a, b ];
		}
	}

	function color_plus_keyword(color) {
		var keyword = "";
		try {
			keyword = pusher.color(color).html('keyword');
		} catch (e) {

		}
		return color + "/* " + keyword + " */";
	}

	function shorthand_background(style) {
		// (function shorthand_background_repeat(style) {
		// if (!style["background-repeat-x"]) {
		// return;
		// }
		// if (!style["background-repeat-y"]) {
		// return;
		// }
		// var x = style["background-repeat-x"];
		// var y = style["background-repeat-y"];
		//
		// style["background-repeat"] = merge2(x, y).join(" ");
		//
		// delete style["background-repeat-x"];
		// delete style["background-repeat-y"];
		// })(style);
		// (function shorthand_background_position(style) {
		// if (!style["background-position-x"]) {
		// return;
		// }
		// if (!style["background-position-y"]) {
		// return;
		// }
		// var x = style["background-position-x"];
		// var y = style["background-position-y"];
		//
		// style["background-position"] = [x, y].join(" ");
		//
		// delete style["background-position-x"];
		// delete style["background-position-y"];
		// })(style);

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
		var l = [];
		l.push(color_plus_keyword(style["background-color"]));
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

			var t = color_plus_keyword(style["border-top-color"]);
			var r = color_plus_keyword(style["border-right-color"]);
			var b = color_plus_keyword(style["border-bottom-color"]);
			var l = color_plus_keyword(style["border-left-color"]);

			var m = merge4(t, r, b, l);
			style["border-color"] = m.join(" ");

			delete style["border-top-color"];
			delete style["border-right-color"];
			delete style["border-bottom-color"];
			delete style["border-left-color"];

			return m.length === 1;
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

			var m = merge4(t, r, b, l);
			style["border-style"] = m.join(" ");

			delete style["border-top-style"];
			delete style["border-right-style"];
			delete style["border-bottom-style"];
			delete style["border-left-style"];

			return m.length === 1;
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

			var m = merge4(t, r, b, l);
			style["border-width"] = m.join(" ");

			delete style["border-top-width"];
			delete style["border-right-width"];
			delete style["border-bottom-width"];
			delete style["border-left-width"];

			return m.length === 1;
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

		var l = merge4(tl, tr, br, bl);

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

		style["margin"] = merge4(t, r, b, l).join(" ");

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

		style["padding"] = merge4(t, r, b, l).join(" ");

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

		var c = color_plus_keyword(style["outline-color"]);
		var w = style["outline-width"];
		var s = style["outline-style"];
		if (parseInt(w) !== 0) {
			style["outline"] = [ c, w, s ].join(" ");
		}
		delete style["outline-color"];
		delete style["outline-style"];
		delete style["outline-width"];
	}

	function shorthand_color(style) {
		if (!style["color"]) {
			return;
		}

		style["color"] = color_plus_keyword(style["color"]);
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

		shorthand_color(style);
	}

	function importCrossOriginLink() {
		var links = document.querySelectorAll("link[rel='stylesheet']");

		for (var i = 0; i < links.length; i++) {
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

	function getComputedStyles(element) {
		var product = {};
		var dom = element.get(0);
		var style = window.getComputedStyle(dom, null);
		for (var i = 0; i < style.length; i++) {
			var name = style[i];
			var value = style.getPropertyValue(name);
			product[name] = value;
		}
		return product;
	}

	function getDefaultStyles(element) {
		if (window.getDefaultComputedStyle) {
			var product = {};
			var dom = element.get(0);
			var style = window.getDefaultComputedStyle(dom, null);
			for (var i = 0; i < style.length; i++) {
				var name = style[i];
				var value = style.getPropertyValue(name);
				product[name] = value;
			}
			return product;
		}
		return getComputedStyles(element);
	}

	function getUserStyles(element) {
		var candidates = [];
		var product = {};
		var sheets = document.styleSheets;
		for (var i = 0; i < sheets.length; i++) {
			var rules = sheets[i].rules || sheets[i].cssRules;
			for (var j = 0; rules && j < rules.length; j++) {
				if (!rules[j].selectorText)
					continue;
				var selectors = rules[j].selectorText.split(",");
				for (var k = 0; k < selectors.length; k++) {
					var selector = selectors[k];
					if (!element.is(selector))
						continue;
					var candidate = SPECIFICITY.calculate(selector)[0];
					candidate.style = rules[j].style;
					candidates.push(candidate);
				}
			}
		}
		candidates.sort(function(a, b) {
			return parseInt(a.specificity.split(",").join(""), 10)
					- parseInt(b.specificity.split(",").join(""), 10);
		});
		for (var i = 0; i < candidates.length; i++) {
			var css = candidates[i].style;
			for (var j = 0; j < css.length; j++) {
				product[css[j]] = css[css[j]];
			}
		}
		return product;
	}

	function getPseudoClassStyles(element, type) {
		var candidates = [];
		var product = {};
		var sheets = document.styleSheets;
		for (var i = 0; i < sheets.length; i++) {
			var rules = sheets[i].rules || sheets[i].cssRules;
			for (var j = 0; rules && j < rules.length; j++) {
				if (!rules[j].selectorText)
					continue;
				var selectors = rules[j].selectorText.split(",");
				for (var k = 0; k < selectors.length; k++) {
					var selector = selectors[k];
					if (selector.indexOf(":" + type) === -1)
						continue;
					selector = selector.replace(":" + type, "");
					if (!element.is(selector))
						continue;
					var candidate = SPECIFICITY.calculate(selector)[0];
					candidate.style = rules[j].style;
					candidates.push(candidate);
				}
			}
		}
		candidates.sort(function(a, b) {
			return parseInt(a.specificity.split(",").join(""), 10)
					- parseInt(b.specificity.split(",").join(""), 10);
		});
		for (var i = 0; i < candidates.length; i++) {
			var css = candidates[i].style;
			for (var j = 0; j < css.length; j++) {
				product[css[j]] = css[css[j]];
			}
		}
		return product;
	}

	function getPseudoElementStyles(element, type) {
		return null;
	}

	function copyRecurse(element) {
		var result = [];
		if (element.prop("nodeType") !== Node.ELEMENT_NODE) {
			return result;
		}
		var id = "SC" + (++self.sequence);
		result.push({
			"id" : id,
			"computed" : getComputedStyles(element),
			"pseudo_hover" : getPseudoClassStyles(element, "hover"),
			"pseudo_focus" : getPseudoClassStyles(element, "focus"),
			"pseudo_active" : getPseudoClassStyles(element, "active"),
			"pseudo_before" : getPseudoElementStyles(element, "before"),
			"pseudo_after" : getPseudoElementStyles(element, "after")
		});
		element.contents().each(function(index) {
			result = result.concat(copyRecurse($(this)));
		});
		element.removeAttr('class');
		element.removeAttr('style');
		element.prop('id', id);
		if (element.attr('src')) {
			element.attr('src', element.get(0).src);
		}
		return result;
	}

	function copySingled(element) {
		element.children().remove();
		// it.empty(); this will remove all sub element including text
		var id = "SC" + (++self.sequence);
		var result = [ {
			"id" : id,
			"computed" : getComputedStyles(element),
			"pseudo_hover" : getPseudoClassStyles(element, "hover"),
			"pseudo_focus" : getPseudoClassStyles(element, "focus"),
			"pseudo_active" : getPseudoClassStyles(element, "active"),
			"pseudo_before" : getPseudoElementStyles(element, "before"),
			"pseudo_after" : getPseudoElementStyles(element, "after")
		} ];
		element.removeAttr('class');
		element.removeAttr('style');
		element.prop('id', id);
		if (element.attr('src')) {
			element.attr('src', element.get(0).src);
		}
		return result;
	}

	pub.prepare = function() {
		if (self.initialized) {
			return;
		}
		importCrossOriginLink();
		self.initialized = true;
	};

	pub.copyHTMLStyles = function(element, recurse) {
		var hs = {};
		self.sequence = 0;
		var cloned = element.clone();
		element.after(cloned);
		if (recurse) {
			hs.styles = copyRecurse(cloned);
		} else {
			hs.styles = copySingled(cloned);
		}
		hs.html = cloned.prop('outerHTML');
		cloned.remove();
		return hs;
	};

	pub.simplifyStyles = function(styles) {
		var rules = [], simplified = [];
		for ( var i in styles) {
			var computed = {};
			shorthand(styles[i]['computed']);
			var defaults = getDefaultStyles($("#" + styles[i]['id']));
			shorthand(defaults);
			for ( var j in styles[i]['computed']) {
				var modified = styles[i]['computed'][j] !== defaults[j];
				if (self.including.indexOf(j) > -1
						|| (modified && self.excluding.indexOf(j) < 0)) {
					computed[j] = styles[i]['computed'][j];
				}
			}
			if (!jQuery.isEmptyObject(computed)) {
				rules.push({
					selector : [ "#" + styles[i]['id'] ],
					rule : computed,
					json : JSON.stringify(computed)
				});
			}
			var pseudo_hover = styles[i]['pseudo_hover'];
			if (!jQuery.isEmptyObject(pseudo_hover)) {
				shorthand(pseudo_hover);
				rules.push({
					selector : [ "#" + styles[i]['id'] + ":hover" ],
					rule : pseudo_hover,
					json : JSON.stringify(pseudo_hover)
				});
			}
			var pseudo_focus = styles[i]['pseudo_focus'];
			if (!jQuery.isEmptyObject(pseudo_focus)) {
				shorthand(pseudo_focus);
				rules.push({
					selector : [ "#" + styles[i]['id'] + ":focus" ],
					rule : pseudo_focus,
					json : JSON.stringify(pseudo_focus)
				});
			}
			var pseudo_active = styles[i]['pseudo_active'];
			if (!jQuery.isEmptyObject(pseudo_active)) {
				shorthand(pseudo_active);
				rules.push({
					selector : [ "#" + styles[i]['id'] + ":active" ],
					rule : pseudo_active,
					json : JSON.stringify(pseudo_active)
				});
			}
			var pseudo_before = styles[i]['pseudo_before'];
			if (!jQuery.isEmptyObject(pseudo_before)) {
				shorthand(pseudo_before);
				rules.push({
					selector : [ "#" + styles[i]['id'] + ":before" ],
					rule : pseudo_before,
					json : JSON.stringify(pseudo_before)
				});
			}
			var pseudo_after = styles[i]['pseudo_after'];
			if (!jQuery.isEmptyObject(pseudo_after)) {
				shorthand(pseudo_after);
				rules.push({
					selector : [ "#" + styles[i]['id'] + ":after" ],
					rule : pseudo_after,
					json : JSON.stringify(pseudo_after)
				});
			}
		}

		for ( var i in rules) {
			var merged = false;
			for ( var j in simplified) {
				if (simplified[j].json === rules[i].json) {
					simplified[j].selector.push(rules[i].selector[0]);
					merged = true;
					break;
				}
			}
			if (!merged) {
				simplified.push(rules[i]);
			}
		}

		var result = "";
		for ( var i in simplified) {
			result += simplified[i].selector.join(", ") + " {\n";
			for ( var j in simplified[i].rule) {
				result += "    " + j + ": " + simplified[i].rule[j] + ";\n";
			}
			result += "}\n";
		}
		return result;

	};

	return pub;
};

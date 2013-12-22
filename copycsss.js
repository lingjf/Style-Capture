var CopyCSSS = function(options) {
	options = options || {};

	var pub = {};
	var self = {
		initialized : false,
		sequence : 0,
		including : [],
		excluding : [ "-webkit-perspective-origin", "-webkit-transform-origin",
				"-webkit-column-rule-color", "-webkit-font-smoothing",
				"-webkit-locale", "-webkit-tap-highlight-color",
				"-webkit-text-emphasis-color", "-webkit-text-fill-color",
				"-webkit-text-stroke-color",
				"-webkit-text-decorations-in-effect" ]
	};

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
		var hs = {charset: document.charset};
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
			Simplify.shorthand(styles[i]['computed']);
			var defaults = getDefaultStyles($("#" + styles[i]['id']));
			Simplify.shorthand(defaults);
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
				Simplify.shorthand(pseudo_hover);
				rules.push({
					selector : [ "#" + styles[i]['id'] + ":hover" ],
					rule : pseudo_hover,
					json : JSON.stringify(pseudo_hover)
				});
			}
			var pseudo_focus = styles[i]['pseudo_focus'];
			if (!jQuery.isEmptyObject(pseudo_focus)) {
				Simplify.shorthand(pseudo_focus);
				rules.push({
					selector : [ "#" + styles[i]['id'] + ":focus" ],
					rule : pseudo_focus,
					json : JSON.stringify(pseudo_focus)
				});
			}
			var pseudo_active = styles[i]['pseudo_active'];
			if (!jQuery.isEmptyObject(pseudo_active)) {
				Simplify.shorthand(pseudo_active);
				rules.push({
					selector : [ "#" + styles[i]['id'] + ":active" ],
					rule : pseudo_active,
					json : JSON.stringify(pseudo_active)
				});
			}
			var pseudo_before = styles[i]['pseudo_before'];
			if (!jQuery.isEmptyObject(pseudo_before)) {
				Simplify.shorthand(pseudo_before);
				rules.push({
					selector : [ "#" + styles[i]['id'] + ":before" ],
					rule : pseudo_before,
					json : JSON.stringify(pseudo_before)
				});
			}
			var pseudo_after = styles[i]['pseudo_after'];
			if (!jQuery.isEmptyObject(pseudo_after)) {
				Simplify.shorthand(pseudo_after);
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

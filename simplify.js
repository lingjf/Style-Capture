var Simplify = (function() {

	var pub = {};

	function isLegalColor(value) {
		try {
			pusher.color(value).html();
		} catch (e) {
			return false;
		}
		return true;
	}
	function isTransparent(value) {
		var value_rgba, transparent_rgba;
		try {
			value_rgba = pusher.color(value).html('rgba');
			transparent_rgba = pusher.color('rgba(0,0,0,0)').html('rgba');
		} catch (e) {
			return false;
		}
		return value_rgba === transparent_rgba;
	}
	function isPercentage(value) {
		return /^[+-]?\d+(\.?\d+)?%$/.test(value);
	}
	function isLength(value) {
		return /^[+-]?\d+(\.?\d+)?(px|em|pt|pc|in|cm|mm)?$/.test(value);
	}

	function isInitial(property, value) {
		if (property["isInitial"])
			return property["isInitial"](value);
		if (Array.isArray(property["initial"]))
			return property["initial"].indexOf(value) > -1;
		return value === property["initial"];
	}
	function isLegal(property, value) {
		if (property["isLegal"])
			return property["isLegal"](value);
		if (Array.isArray(property["legals"]))
			return property["legals"].indexOf(value) > -1;
		return value === property["legals"];
	}

	var css_properties = {
		// http://www.w3.org/TR/CSS2/propidx.html
		"background-attachment" : {
			"appliesto" : [],
			"inherited" : false,
			"initial" : [ "scroll", "initial" ],
			"legals" : [ "scroll", "fixed", "inherit", "initial" ],
		},
		"background-color" : {
			"appliesto" : [],
			"inherited" : false,
			"initial" : [ "transparent", "initial" ],
			"isInitial" : function(v) {
				if ([ "transparent", "initial" ].indexOf(v) > -1)
					return true;
				return isTransparent(v);
			},
			"isLegal" : function(v) {
				if ([ "transparent", "inherit", "initial" ].indexOf(v) > -1)
					return true;
				return isLegalColor(v);
			}
		},
		"background-image" : {
			"appliesto" : [],
			"inherited" : false,
			"initial" : [ "none", "initial" ],
			"isLegal" : function(v) {
				if ([ "none", "inherit", "initial" ].indexOf(v) > -1)
					return true;
				return v.indexOf("url") === 0;
			}
		},
		"background-position" : {
			"appliesto" : [],
			"inherited" : false,
			"initial" : [ "0% 0%" ],
			"isInitial" : function(v) {
				var parts = v.split(" ");
				if (parts.length !== 2)
					return false;
				function toPercentage(x) {
					if (isLength(x))
						return '' + parseInt(x) * 100 + '%';
					if (x === "left" || x === "top")
						return "0%";
					if (x === "right" || x === "bottom")
						return "100%";
					if (x === "center")
						return "50%";
					return x;
				}
				var l = [ toPercentage(parts[0]), toPercentage(parts[1]) ]
						.join(" ");
				return l === "0% 0%" || l === "initial, initial";
			},
			"isLegal" : function(v) {
				var keywords = [ "left", "right", "top", "bottom", "center",
						"inherit", "initial" ];
				var parts = v.split(" ");
				for ( var i in parts) {
					if (!isPercentage(parts[i]) && !isLength(parts[i])
							&& keywords.indexOf(parts[i]) === -1)
						return false;
				}
				return true;
			}
		},
		"background-position-x" : {
			"appliesto" : [],
			"inherited" : false,
			"initial" : [ "0%" ],
			"isInitial" : function(v) {
				return v === "0%" || v === "left" || v === "initial"
						|| (isLength(v) && parseInt(v) === 0);
			},
			"isLegal" : function(v) {
				var keywords = [ "left", "right", "center", "inherit",
						"initial" ];
				return isPercentage(v) || isLength(v)
						|| keywords.indexOf(v) > -1;
			}
		},
		"background-position-y" : {
			"appliesto" : [],
			"inherited" : false,
			"initial" : [ "0%" ],
			"isInitial" : function(v) {
				return v === "0%" || v === "top" || v === "initial"
						|| (isLength(v) && parseInt(v) === 0);
			},
			"isLegal" : function(v) {
				var keywords = [ "top", "bottom", "center", "inherit",
						"initial" ];
				return isPercentage(v) || isLength(v)
						|| keywords.indexOf(v) > -1;
			}
		},
		"background-repeat" : {
			"appliesto" : [],
			"inherited" : false,
			"initial" : [ "repeat", "initial" ],
			"legals" : [ "repeat", "repeat-x", "repeat-y", "no-repeat",
					"inherit" ]
		},
		"background-repeat-x" : {
			"appliesto" : [],
			"inherited" : false,
			"initial" : [ "repeat", "initial" ],
			"legals" : [ "repeat", "no-repeat", "inherit", "initial" ]
		},
		"background-repeat-y" : {
			"appliesto" : [],
			"inherited" : false,
			"initial" : [ "repeat", "initial" ],
			"legals" : [ "repeat", "no-repeat", "inherit", "initial" ]
		},
		"padding-bottom" : {
			"appliesto" : [],
			"inherited" : false,
			"initial" : [ "0" ],
			"isInitial" : function(v) {
				return v === "0%" || (isLength(v) && parseInt(v) === 0)
						|| v === "initial";
			},
			"isLegal" : function(v) {
				return isPercentage(v) || isLength(v) || v === "inherit";
			}
		},
		"padding-left" : {
			"appliesto" : [],
			"inherited" : false,
			"initial" : [ "0" ],
			"isInitial" : function(v) {
				return v === "0%" || (isLength(v) && parseInt(v) === 0)
						|| v === "initial";
			},
			"isLegal" : function(v) {
				return isPercentage(v) || isLength(v) || v === "inherit";
			}
		},
		"padding-right" : {
			"appliesto" : [],
			"inherited" : false,
			"initial" : [ "0" ],
			"isInitial" : function(v) {
				return v === "0%" || (isLength(v) && parseInt(v) === 0)
						|| v === "initial";
			},
			"isLegal" : function(v) {
				return isPercentage(v) || isLength(v) || v === "inherit";
			}
		},
		"padding-top" : {
			"appliesto" : [],
			"inherited" : false,
			"initial" : [ "0" ],
			"isInitial" : function(v) {
				return v === "0%" || (isLength(v) && parseInt(v) === 0)
						|| v === "initial";
			},
			"isLegal" : function(v) {
				return isPercentage(v) || isLength(v) || v === "inherit";
			}
		},
		"margin-bottom" : {
			"appliesto" : [],
			"inherited" : false,
			"initial" : [ "0" ],
			"isInitial" : function(v) {
				return v === "0%" || (isLength(v) && parseInt(v) === 0)
						|| v === "initial";
			},
			"isLegal" : function(v) {
				return isPercentage(v) || isLength(v) || v === "auto";
			}
		},
		"margin-left" : {
			"appliesto" : [],
			"inherited" : false,
			"initial" : [ "0" ],
			"isInitial" : function(v) {
				return v === "0%" || (isLength(v) && parseInt(v) === 0)
						|| v === "initial";
			},
			"isLegal" : function(v) {
				return isPercentage(v) || isLength(v) || v === "auto";
			}
		},
		"margin-right" : {
			"appliesto" : [],
			"inherited" : false,
			"initial" : [ "0" ],
			"isInitial" : function(v) {
				return v === "0%" || (isLength(v) && parseInt(v) === 0)
						|| v === "initial";
			},
			"isLegal" : function(v) {
				return isPercentage(v) || isLength(v) || v === "auto";
			}
		},
		"margin-top" : {
			"appliesto" : [],
			"inherited" : false,
			"initial" : [ "0" ],
			"isInitial" : function(v) {
				return v === "0%" || (isLength(v) && parseInt(v) === 0)
						|| v === "initial";
			},
			"isLegal" : function(v) {
				return isPercentage(v) || isLength(v) || v === "auto";
			}
		}
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
			return color;
		}
		return color + "/* " + keyword + " */";
	}

	function shorthand_background_issued(style) {
		/* failed when 'background:0;' */
		(function shorthand_background_repeat(style) {
			var x = style["background-repeat-x"];
			var y = style["background-repeat-y"];
			var z = style["background-repeat"];

			if (!z && (x || y)) {
				if (!x || isInitial(css_properties["background-repeat-x"], x)) {
					x = css_properties["background-repeat-x"]["initial"][0];
				}
				if (!y || isInitial(css_properties["background-repeat-y"], y)) {
					y = css_properties["background-repeat-y"]["initial"][0];
				}

				if (x === "repeat" && y === "repeat") {
					z = "repeat";
				} else if (x === "repeat" && y === "no-repeat") {
					z = "repeat-x";
				} else if (x === "no-repeat" && y === "repeat") {
					z = "repeat-y";
				} else {
					z = "no-repeat";
				}

				style["background-repeat"] = z;
			}
			delete style["background-repeat-x"];
			delete style["background-repeat-y"];
		})(style);

		(function shorthand_background_position(style) {
			var x = style["background-position-x"];
			var y = style["background-position-y"];
			var z = style["background-position"];
			if (!z && (x || y)) {
				if (!x || isInitial(css_properties["background-position-x"], x)) {
					x = css_properties["background-position-x"]["initial"][0];
				}
				if (!y || isInitial(css_properties["background-position-y"], y)) {
					y = css_properties["background-position-y"]["initial"][0];
				}

				style["background-position"] = [ x, y ].join(" ");
			}
			delete style["background-position-x"];
			delete style["background-position-y"];
		})(style);

		if (!style["background"]) {
			var l = [];
			var s = true;
			var shorthandable = function(property) {
				var value = style[property];
				if (!value) {
					return false;
				}
				if (value === "initial") {
					delete style[property];
					return false;
				} else if (isInitial(css_properties[property], value)) {
					delete style[property];
					return true;
				} else {
					if (property === "background-color") {
						value = color_plus_keyword(value);
						style["background-color"] = value;
					}
					l.push(value);
					return true;
				}
			};
			s = shorthandable("background-color") && s;
			s = shorthandable("background-image") && s;
			s = shorthandable("background-repeat") && s;
			s = shorthandable("background-attachment") && s;
			s = shorthandable("background-position") && s;

			if (s && l.length > 1) {
				style["background"] = l.join(" ");
				delete style["background-color"];
				delete style["background-image"];
				delete style["background-repeat"];
				delete style["background-attachment"];
				delete style["background-position"];
			}
		} else {
			delete style["background-color"];
			delete style["background-image"];
			delete style["background-repeat"];
			delete style["background-attachment"];
			delete style["background-position"];
		}
		delete style["background-clip"];
		delete style["background-origin"];
		delete style["background-size"];
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

	function shorthand_margin_issued(style) {
		var c = 0;
		var t = style["margin-top"];
		var r = style["margin-right"];
		var b = style["margin-bottom"];
		var l = style["margin-left"];
		if (!t || isInitial(css_properties["margin-top"], t)) {
			t = css_properties["margin-top"]["initial"][0];
			delete style["margin-top"];
		} else {
			c++;
		}
		if (!r || isInitial(css_properties["margin-right"], r)) {
			r = css_properties["margin-right"]["initial"][0];
			delete style["margin-right"];
		} else {
			c++;
		}
		if (!b || isInitial(css_properties["margin-bottom"], b)) {
			b = css_properties["margin-bottom"]["initial"][0];
			delete style["margin-bottom"];
		} else {
			c++;
		}
		if (!l || isInitial(css_properties["margin-left"], l)) {
			l = css_properties["margin-left"]["initial"][0];
			delete style["margin-left"];
		} else {
			c++;
		}
		if (c > 1) {
			style["margin"] = merge4(t, r, b, l).join(" ");

			delete style["margin-top"];
			delete style["margin-right"];
			delete style["margin-bottom"];
			delete style["margin-left"];
		}
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

	function shorthand_padding_issued(style) {
		var c = 0;
		var t = style["padding-top"];
		var r = style["padding-right"];
		var b = style["padding-bottom"];
		var l = style["padding-left"];
		if (!t || isInitial(css_properties["padding-top"], t)) {
			t = css_properties["padding-top"]["initial"][0];
			delete style["padding-top"];
		} else {
			c++;
		}
		if (!r || isInitial(css_properties["padding-right"], r)) {
			r = css_properties["padding-right"]["initial"][0];
			delete style["padding-right"];
		} else {
			c++;
		}
		if (!b || isInitial(css_properties["padding-bottom"], b)) {
			b = css_properties["padding-bottom"]["initial"][0];
			delete style["padding-bottom"];
		} else {
			c++;
		}
		if (!l || isInitial(css_properties["padding-left"], l)) {
			l = css_properties["padding-left"]["initial"][0];
			delete style["padding-left"];
		} else {
			c++;
		}
		if (c > 1) {
			style["padding"] = merge4(t, r, b, l).join(" ");

			delete style["padding-top"];
			delete style["padding-right"];
			delete style["padding-bottom"];
			delete style["padding-left"];
		}
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

	pub.shorthand = function(style) {
		shorthand_background(style);
		shorthand_border(style);
		shorthand_border_radius(style);
		shorthand_border_image(style);
		shorthand_margin(style);
		shorthand_padding(style);
		shorthand_font(style);
		shorthand_outline(style);

		shorthand_color(style);
	};

	pub.simplifyAuthorStyles = function(styles, simplify, removeDefault) {
		var rules = [], simplified = [];
		for ( var i in styles) {
			var author = styles[i]['author'];
			if (simplify)
				this.shorthand(author);
			if (!jQuery.isEmptyObject(author)) {
				rules.push({
					selector : [ "#" + styles[i]['id'] ],
					rule : author,
					json : JSON.stringify(author)
				});
			}
			var pseudo_hover = styles[i]['pseudo_hover'];
			if (simplify)
				this.shorthand(pseudo_hover);
			if (!jQuery.isEmptyObject(pseudo_hover)) {
				rules.push({
					selector : [ "#" + styles[i]['id'] + ":hover" ],
					rule : pseudo_hover,
					json : JSON.stringify(pseudo_hover)
				});
			}
			var pseudo_focus = styles[i]['pseudo_focus'];
			if (simplify)
				this.shorthand(pseudo_focus);
			if (!jQuery.isEmptyObject(pseudo_focus)) {
				rules.push({
					selector : [ "#" + styles[i]['id'] + ":focus" ],
					rule : pseudo_focus,
					json : JSON.stringify(pseudo_focus)
				});
			}
			var pseudo_active = styles[i]['pseudo_active'];
			if (simplify)
				this.shorthand(pseudo_active);
			if (!jQuery.isEmptyObject(pseudo_active)) {
				rules.push({
					selector : [ "#" + styles[i]['id'] + ":active" ],
					rule : pseudo_active,
					json : JSON.stringify(pseudo_active)
				});
			}
			var pseudo_before = styles[i]['pseudo_before'];
			if (simplify)
				this.shorthand(pseudo_before);
			if (!jQuery.isEmptyObject(pseudo_before)) {
				rules.push({
					selector : [ "#" + styles[i]['id'] + ":before" ],
					rule : pseudo_before,
					json : JSON.stringify(pseudo_before)
				});
			}
			var pseudo_after = styles[i]['pseudo_after'];
			if (simplify)
				this.shorthand(pseudo_after);
			if (!jQuery.isEmptyObject(pseudo_after)) {
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
})();

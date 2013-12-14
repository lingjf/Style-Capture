/*
Copyright 2013 Mike Dunn
http://upshots.org/
Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
(function($) {

	$.fn.getFinalStyles = function() {
		var product = {};
		var dom = this.get(0);
		var style = window.getComputedStyle(dom, null);
		for ( var i = 0, l = style.length; i < l; i++) {
			var name = style[i];
			var value = style.getPropertyValue(name);
			product[name] = value;
		}

		return product;
	};

	$.fn.getDefaultStyles = function() {
		if (window.getDefaultComputedStyle) {
			var product = {};
			var dom = this.get(0);
			var style = window.getDefaultComputedStyle(dom, null);
			for ( var i = 0, l = style.length; i < l; i++) {
				var name = style[i];
				var value = style.getPropertyValue(name);
				product[name] = value;
			}
			return product;
		} else {
			var nodeName = this.prop("nodeName");
			var that = $("<" + nodeName + ">  </" + nodeName + ">");
			$('head').before(that);
			var product = that.getFinalStyles();
			that.remove();
			return product;
		}
	};

	$.fn.getUserStyles = function() {
		var product = {};
		var sheets = document.styleSheets;
		for ( var i in sheets) {
			var rules = sheets[i].rules || sheets[i].cssRules;
			for ( var r in rules) {
				if ($(this).is(rules[r].selectorText)) {
					var css = rules[r].style;
					if (css instanceof CSSStyleDeclaration) {
						for ( var i in css) {
							if ((css[i]).toLowerCase) {
								product[css[i].toLowerCase()] = css[css[i]];
							}
						}
					} else if (typeof css == "string") {
						css = css.split(";");
						for ( var i in css) {
							var l = css[i].split(":");
							product[l[0].trim().toLowerCase()] = l[1].trim();
						}
					}
				}
			}
		}
		return product;
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
		if (style["background-color"]) {
			l.push(style["background-color"]);
		} else {
			l.push("transparent");
		}
		if (style["background-image"]) {
			l.push(style["background-image"]);
		} else {
			l.push("none");
		}
		if (style["background-repeat"]) {
			l.push(style["background-repeat"]);
		} else {
			l.push("repeat");
		}
		if (style["background-attachment"]) {
			l.push(style["background-attachment"]);
		} else {
			l.push("scroll");
		}
		if (style["background-position"]) {
			l.push(style["background-position"]);
		} else {
			l.push("top left");
		}
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

		var tc = style["border-top-color"] || "transparent";
		var ts = style["border-top-style"] || "none";
		var tw = style["border-top-width"] || "medium";
		var rc = style["border-right-color"] || "transparent";
		var rs = style["border-right-style"] || "none";
		var rw = style["border-right-width"] || "medium";
		var bc = style["border-bottom-color"] || "transparent";
		var bs = style["border-bottom-style"] || "none";
		var bw = style["border-bottom-width"] || "medium";
		var lc = style["border-left-color"] || "transparent";
		var ls = style["border-left-style"] || "none";
		var lw = style["border-left-width"] || "medium";

		if ((tw === rw && rw === bw && bw === lw)
				&& (ts === rs && rs === bs && bs === ls)
				&& (tc === rc && rc === bc && bc === lc)) {
			style["border"] = [ tw, ts, tc ].join(" ");
		} else {
			style["border-width"] = merge(tw, rw, bw, lw).join(" ");
			style["border-style"] = merge(ts, rs, bs, ls).join(" ");
			style["border-color"] = merge(tc, rc, bc, lc).join(" ");
		}

		var tl = style["border-top-left-radius"] || "0px";
		var tr = style["border-top-right-radius"] || "0px";
		var br = style["border-bottom-right-radius"] || "0px";
		var bl = style["border-bottom-left-radius"] || "0px";
		var l = merge(tl, tr, br, bl);
		style["border-radius"] = l.join(" ");
		style["-moz-border-radius"] = l.join(" ");
		style["-webkit-border-radius"] = l.join(" ");

		delete style["border-top-color"];
		delete style["border-top-style"];
		delete style["border-top-width"];
		delete style["border-right-color"];
		delete style["border-right-style"];
		delete style["border-right-width"];
		delete style["border-bottom-color"];
		delete style["border-bottom-style"];
		delete style["border-bottom-width"];
		delete style["border-left-color"];
		delete style["border-left-style"];
		delete style["border-left-width"];

		delete style["border-image-outset"];
		delete style["border-image-repeat"];
		delete style["border-image-slice"];
		delete style["border-image-source"];
		delete style["border-image-width"];

		delete style["border-top-left-radius"];
		delete style["border-top-right-radius"];
		delete style["border-bottom-right-radius"];
		delete style["border-bottom-left-radius"];
	}

	function shorthand_margin(style) {
		var t = style["margin-top"] || "0px";
		var r = style["margin-right"] || "0px";
		var b = style["margin-bottom"] || "0px";
		var l = style["margin-left"] || "0px";

		style["margin"] = merge(t, r, b, l).join(" ");

		delete style["margin-top"];
		delete style["margin-right"];
		delete style["margin-bottom"];
		delete style["margin-left"];

	}
	function shorthand_padding(style) {
		var t = style["padding-top"] || "0px";
		var r = style["padding-right"] || "0px";
		var b = style["padding-bottom"] || "0px";
		var l = style["padding-left"] || "0px";
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
		var c = style["outline-color"] || "transparent";
		var w = style["outline-width"] || "medium";
		var s = style["outline-style"] || "none";

		style["outline"] = merge(c, w, s).join(" ");

		delete style["outline-color"];
		delete style["outline-style"];
		delete style["outline-width"];
	}

	function shorthand(style) {
		shorthand_background(style);
		shorthand_border(style);
		shorthand_margin(style);
		shorthand_padding(style);
		shorthand_font(style);
		shorthand_outline(style);
	}

	$.fn.copyStyles = function() {
		var finalStyles = this.getFinalStyles();
		shorthand(finalStyles);
		var defaultStyles = this.getDefaultStyles();
		// shorthand(defaultStyles);
		var userStyles = this.getUserStyles();
		var result = "{\n";
		for ( var i in finalStyles) {
			if (finalStyles[i] !== defaultStyles[i] || userStyles[i]) {
				result += i + ": " + finalStyles[i] + ";\n";
			}
		}
		result += "}\n";
		return result;
	};

})(jQuery);

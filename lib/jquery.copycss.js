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
		for (var i = 0, l = style.length; i < l; i++) {
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
			for (var i = 0, l = style.length; i < l; i++) {
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

	$.fn.copyStyles = function() {
		var finalStyles = this.getFinalStyles();
		var defaultStyles = this.getDefaultStyles();
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

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
(function($){
	
	$.fn.getStyles = function(only, except){
		
		// the map to return with requested styles and values as KVP
		var product = {};
		
		// the style object from the DOM element we need to iterate through
		var style;
		
		// recycle the name of the style attribute
		var name;
		
		// if it's a limited list, no need to run through the entire style object
		if(only && only instanceof Array){
			
			for(var i = 0, l = only.length; i < l; i++){
				// since we have the name already, just return via built-in .css method
				name = only[i];
				product[name] = this.css(name);
			}
			
		} else {
			
			// otherwise, we need to get everything
			var dom = this.get(0);
			
			// standards
			if (window.getComputedStyle) {
				
				// convenience methods to turn css case ('background-image') to camel ('backgroundImage')
				var pattern = /\-([a-z])/g;
				var uc = function (a, b) {
						return b.toUpperCase();
				};			
				var camelize = function(string){
					return string.replace(pattern, uc);
				};
				
				// make sure we're getting a good reference
				if (style = window.getComputedStyle(dom, null)) {
					var camel, value;
					// opera doesn't give back style.length - use truthy since a 0 length may as well be skipped anyways
					if (style.length) {
						for (var i = 0, l = style.length; i < l; i++) {
							name = style[i];
							camel = camelize(name);
							value = style.getPropertyValue(name);
							product[camel] = value;
						}
					} else {
						// opera
						for (name in style) {
							camel = camelize(name);
							value = style.getPropertyValue(name) || style[name];
							product[camel] = value;
						}
					}
				}
			}
			// IE - first try currentStyle, then normal style object - don't bother with runtimeStyle
			else if (style = dom.currentStyle) {
				for (name in style) {
					product[name] = style[name];
				}
			}
			else if (style = dom.style) {
				for (name in style) {
					if (typeof style[name] != 'function') {
						product[name] = style[name];
					}
				}
			}
			
		}
		
		// remove any styles specified...
		// be careful on blacklist - sometimes vendor-specific values aren't obvious but will be visible...  e.g., excepting 'color' will still let '-webkit-text-fill-color' through, which will in fact color the text
		if(except && except instanceof Array){
			for(var i = 0, l = except.length; i < l; i++){
				name = except[i];
				delete product[name];
			}
		}
		
		// one way out so we can process blacklist in one spot
		return product;
	
	};
	
	
	function css2json(css) {
    var s = {};
    if (!css) return s;
    if (css instanceof CSSStyleDeclaration) {
        for (var i in css) {
            if ((css[i]).toLowerCase) {
                s[(css[i]).toLowerCase()] = (css[css[i]]);
            }
        }
    } else if (typeof css == "string") {
        css = css.split("; ");
        for (var i in css) {
            var l = css[i].split(": ");
            s[l[0].toLowerCase()] = (l[1]);
        }
    }
    return s;
	}
	
	
	$.fn.getStyles1 = function(only, except){
		var sheets = document.styleSheets, o = {};
    for (var i in sheets) {
        var rules = sheets[i].rules || sheets[i].cssRules;
        for (var r in rules) {
            if ($(this).is(rules[r].selectorText)) {
                o = $.extend(o, css2json(rules[r].style), css2json($(this).attr('style')));
            }
        }
    }
    return o;
	};
	
	$.fn.copyStyle = function() {
		var styles = this.getStyles1();
		var result = "{\n";
		for (var i in styles) {
			result += i + ": " + styles[i] + ";\n";
		}
		result += "}\n";
		return result;
	}
	
	
	// sugar - source is the selector, dom element or jQuery instance to copy from - only and except are optional
	$.fn.copyCSS = function(source, only, except){
		var styles = $(source).getStyles(only, except);
		this.css(styles);
	};
	
})(jQuery);

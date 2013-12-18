var including = [];
var excluding = [ "-webkit-perspective-origin", "-webkit-transform-origin" ];

function ruletocss(computed, defaults) {
	var result = " {\n";
	for ( var i in computed) {
		var modified = computed[i] !== defaults[i];
		if (modified) {
			// console.log("Modified " + i + ": " + defaults[i] + "-->" +
			// computed[i]);
		} else {
			// console.log("Unchange " + i + ": " + defaults[i] + "---" +
			// computed[i]);
		}

		if (including.indexOf(i) > -1 || (modified && excluding.indexOf(i) < 0)) {
			result += "    " + i + ": " + computed[i] + ";\n";
		}
	}
	result += "}\n";
	return result;
}

function psuedotocss(styles) {
	var result = " {\n";
	for ( var i in styles) {
		result += "    " + i + ": " + styles[i] + ";\n";
	}
	result += "}\n";
	return result;
}

function rulestocss(rules) {
	var result = "";
	for ( var i in rules) {
		result += "#" + rules[i]['id']
				+ ruletocss(rules[i]['computed'], rules[i]['defaults']);
		if (rules[i]['hover']) {
			result += "#" + rules[i]['id'] + ":hover"
					+ psuedotocss(rules[i]['hover']);
		}
		if (rules[i]['focus']) {
			result += "#" + rules[i]['id'] + ":focus"
					+ psuedotocss(rules[i]['focus']);
		}
		if (rules[i]['active']) {
			result += "#" + rules[i]['id'] + ":active"
					+ psuedotocss(rules[i]['active']);
		}
	}
	return result;
}

$(document).ready(
		function() {
			chrome.runtime.getBackgroundPage(function(backgroundPage) {
				$('body').append(" " + backgroundPage.htmlTree + " ");
				var rules = backgroundPage.ruleList;
				setTimeout(function() {
					var copyCSSS = CopyCSSS();
					for ( var i in rules) {
						var el = $("#" + rules[i]['id']);
						rules[i]['defaults'] = copyCSSS.getDefaultStyles(el);
					}
					setTimeout(
							function() {
								$('head').append(
										" <style> " + rulestocss(rules)
												+ " </style> ");
							}, 100);
				}, 50);

			});
		});

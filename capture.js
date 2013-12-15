var including = [];
var excluding = [ "-webkit-perspective-origin", "-webkit-transform-origin" ];

function ruletocss(computed, defaults) {
	var result = " {\n";
	for ( var i in computed) {
		var modified = computed[i] !== defaults[i];
		if (modified) {
			console.log("Modified " + i + ": " + defaults[i] + "-->"
					+ computed[i]);
		} else {
			console.log("Unchange " + i + ": " + defaults[i] + "---"
					+ computed[i]);
		}

		if (including.indexOf(i) > -1 || (modified && excluding.indexOf(i) < 0)) {
			result += "    " + i + ": " + computed[i] + ";\n";
		}
	}
	result += "}\n";
	return result;
}

function rulestocss(rules) {
	var result = "";
	for ( var i in rules) {
		result += "#" + rules[i]['id']
				+ ruletocss(rules[i]['computed'], rules[i]['defaults']);
	}
	return result;
}

$(document).ready(function() {
	chrome.runtime.getBackgroundPage(function(backgroundPage) {
		$('body').append(" " + backgroundPage.htmlTree + " ");
		var rules = backgroundPage.ruleList;
		setTimeout(function() {
			for ( var i in rules) {
				var el = $("#" + rules[i]['id']);
				rules[i]['defaults'] = el.getFinalStyles();
			}
		}, 50);
		setTimeout(function() {
			$('head').append(" <style> " + rulestocss(rules) + " </style> ");
		}, 100);

	});
});

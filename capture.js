
$(document).ready(function() {
	chrome.runtime.getBackgroundPage(function(backgroundPage) {
		var Captured = backgroundPage.Captured;
		$('body').append(" " + Captured.html + " ");
		setTimeout(function() {
			$('head').append("<style>\n" +  CopyCSSS().simplifyStyles(Captured.styles) + "\n</style>");
		}, 50);

	});
});

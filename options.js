
$(document).ready(function() {
	$('#save').click(function() {
		chrome.browserAction.setIcon({
			path : "icon_" + $('#color').val() + ".png"
		});
	});
});

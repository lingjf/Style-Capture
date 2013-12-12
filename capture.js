
$(document).ready(function(){
	chrome.runtime.getBackgroundPage(function(backgroundPage){
		$('head').append(" <style> " + backgroundPage.styleTree + " </style> ");
		$('body').append(" " + backgroundPage.htmlTree + " ");
	});
});

 
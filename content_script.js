
var page = {
	version : "1.0.0",
	copyCSSS : null,
	domOutline : null
};

function initContentScript() {
	page.copyCSSS = CopyCSSS();

	page.domOutline = DomOutline({
		onCaptured : function(element, recurse) {
			var hs = page.copyCSSS.copyHTMLStyles(element, recurse);
			hs.action = "capture";
			chrome.runtime.sendMessage(hs);
		},
		onClosed : function() {
			chrome.runtime.sendMessage({
				action : "closed"
			});
		}
	});

	chrome.runtime.onMessage
			.addListener(function(message, sender, sendResponse) {
				switch (message.action) {
				case "open":
					page.copyCSSS.prepare();
					page.domOutline.update({"showchain": message.ShowSelectedTagChain === "true"});
					page.domOutline.start();
					sendResponse({
						count : "2"
					});
					break;
				case "update":
					page.domOutline.update({"showchain": message.ShowSelectedTagChain === "true"});
					break;
				case "close":
					page.domOutline.stop();
					break;
				}

			});
}

initContentScript();

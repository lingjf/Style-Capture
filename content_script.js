

var page = {
	version : "1.0.0",
	idSeed : 1,
	htmlTree : "",
	styleCss : {}
};

 

function copyHTML(it, recurse) {
	var result = "";
	var nodeType = it.prop("nodeType");
	if (nodeType == 1) {
		var nodeName = it.prop("nodeName").toLowerCase();
		var idName = "SC" + (++page.idSeed);
		page.styleCss[idName] = it.getStyles();
		result += "<" + nodeName;
		result += " id='" + idName + "'";
		result += ">";
		if (recurse) {
			it.contents().each(function(index){
				result += copyHTML($(this), recurse);
			});
		}
		result += "</" + nodeName + ">";
	} else {
		result += it.text();
	}
	return result;
}

function formatCss() {
	var result = "";
	for (var i in page.styleCss) {
		result += "#" + i + "{\n";
		for (var j in page.styleCss[i]) {
			result += j + ": " + page.styleCss[i][j] + ";\n";
		}
		result += "}\n";
	}
	return result;
}

function copyRecurse(element) {
		var result = "";
		var nodeType = element.prop("nodeType");
		if (nodeType == 1) {
			var idName = "SC" + (++page.idSeed);
			result = "#" + idName + " " + element.copyStyle();
			element.contents().each(function(index){
				result += copyRecurse($(this));
			});
			element.removeAttr('class');
			element.prop('id', idName);
		}
		return result;
}

function copySingled(element) {
		var result = "";
		element.children().remove();
		// it.empty(); this will remove all sub element including text
		var idName = "SC" + (++page.idSeed);
		result = "#" + idName + " " + element.copyStyle();
		element.removeAttr('class');
		element.prop('id', idName);
		return result;
}

function copyHTMLandCSS(element, recurse) {
		var hs = {};
		var cloned = element.clone();
		if (recurse) {
				hs.style = copyRecurse(cloned);
		} else {
				hs.style = copySingled(cloned);
		}
		hs.html = cloned.prop('outerHTML');
		return hs;
}

function initContentScript() {
	var domOutline = DomOutline({onCaptured: function(element, recurse){
			var hs = copyHTMLandCSS(element, recurse);
			hs.action = "capture";
			chrome.runtime.sendMessage(hs);
		}, onClosed: function() {
			chrome.runtime.sendMessage({action: "closed"});
		}
	});


	chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
		switch(message.action) {
			case "open":
				domOutline.start();
				sendResponse({count: "2"});
				break;
			case "close":
				domOutline.stop();
				break;
		}
		
	});
}

initContentScript();

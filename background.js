var Captured = {};

var TabState = {};

var Activity = null;

function updateState(tabId, state) {
	if (tabId && state) {
		TabState[tabId] = state;
	}
	var icon = "image/scissor19_default.png";
	if (Activity) {
		if (TabState[Activity] === "loading") {
			icon = "image/scissor19_default.png";
		} else if (TabState[Activity] === "complete") {
			icon = "image/scissor19_already.png";
		} else if (TabState[Activity] === "capturing") {
			icon = "image/scissor19_actived.png";
		} else {
			icon = "image/scissor19_default.png";
		}
	}

	chrome.browserAction.setIcon({
		path : icon
	});

	// chrome.browserAction.setBadgeText({ text : "" });
}

chrome.browserAction.onClicked.addListener(function(tab) {

	Activity = tab.id;

	if (!TabState[Activity]) {
		updateState(Activity, "loading");
	}

	if (TabState[Activity] === "loading") {
		return;
	} else if (TabState[Activity] === "complete") {
		updateState(Activity, "capturing");
		var to = setTimeout(function() {
			updateState(Activity, "complete");
		}, 1000);
		chrome.tabs.sendMessage(Activity, {
			action : "open"
		}, function(response) {
			clearTimeout(to);
		});
	} else if (TabState[Activity] === "capturing") {
		chrome.tabs.sendMessage(Activity, {
			action : "close"
		});
		updateState(Activity, "complete");
	} else {
		console.log("Tab all in unknown status : " + TabState[Activity]);
	}

	// chrome.browserAction.setPopup({popup: "popup.html"});

	// chrome.tabs.executeScript(tab.id,
	// {code:"document.body.style.backgroundColor='" + k + "'"});

	// chrome.tabs.executeScript(tab.id, {file: 'script.js', allFrames: true});
});

chrome.tabs.onCreated.addListener(function(tab) {
	if (tab.highlighted) {
		Activity = tab.id;
	}
	updateState(tab.id, tab.status);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (tab.highlighted) {
		Activity = tabId;
	}
	updateState(tabId, changeInfo.status);
});

chrome.tabs.onActivated.addListener(function(info) {
	Activity = info.tabId;
	updateState();
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if (message.action == "capture") {
		Captured.html = message.html;
		Captured.styles = message.styles;
		Captured.charset = message.charset;
		chrome.tabs.create({
			url : 'capture.html',
			selected : true
		});
	} else if (message.action == "closed") {
		updateState(sender.tab.id, "complete");
	}
});

document.addEventListener('DOMContentLoaded', function() {
	chrome.windows.getAll({
		'populate' : true
	}, function(wins) {
		wins.forEach(function(win) {
			win.tabs.forEach(function(tab) {
				if (tab != undefined && tab.url.indexOf('chrome') !== 0) {
					if (tab.highlighted) {
						Activity = tab.id;
					}
					updateState(tab.id, tab.status);
				}
			});
		});
	});
});

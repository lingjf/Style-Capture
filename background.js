// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var Captured = {};

var TabState = {};

function updateState(tabId, state) {
	if (state) {
		TabState[tabId] = state;
	}
	var icon = "image/scissor19_default.png";
	if (TabState[tabId] === "loading") {
		icon = "image/scissor19_default.png";
	} else if (TabState[tabId] === "loaded") {
		icon = "image/scissor19_already.png";
	} else if (TabState[tabId] === "capturing") {
		icon = "image/scissor19_actived.png";
	} else {
		icon = "image/scissor19_default.png";
	}

	chrome.browserAction.setIcon({
		path : icon
	});

	// chrome.browserAction.setBadgeText({ text : "" });
}

chrome.browserAction.onClicked.addListener(function(tab) {

	if (!TabState[tab.id]) {
		updateState(tab.id, "loading");
	}

	if (TabState[tab.id] === "loading") {
		return;
	} else if (TabState[tab.id] === "loaded") {
		updateState(tab.id, "capturing");
		var to = setTimeout(function() {
			updateState(tab.id, "loaded");
		}, 1000);
		chrome.tabs.sendMessage(tab.id, {
			action : "open"
		}, function(response) {
			clearTimeout(to);
		});
	} else if (TabState[tab.id] === "capturing") {
		chrome.tabs.sendMessage(tab.id, {
			action : "close"
		});
		updateState(tab.id, "loaded");
	} else {

	}

	// chrome.browserAction.setPopup({popup: "popup.html"});

	// chrome.tabs.executeScript(tab.id,
	// {code:"document.body.style.backgroundColor='" + k + "'"});

	// chrome.tabs.executeScript(tab.id, {file: 'script.js', allFrames: true});
});

chrome.tabs.onActivated.addListener(function(info) {
	updateState(info.tabId);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (changeInfo.status == "loading") {
		TabState[tabId] = "loading";
	} else if (changeInfo.status == "complete") {
		TabState[tabId] = "loaded";
	}
	if (tab.highlighted) {
		updateState(tabId);
	}
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
		// chrome.tabs.getCurrent() should not be used in background page
		chrome.tabs.query({
			active : true
		}, function(tabs) {
			TabState[sender.tab.id] = "loaded";
			if (tabs[0].id === sender.tab.id) {
				updateState(tabs[0].id);
			}
		});
	}
});

document.addEventListener('DOMContentLoaded', function() {
	chrome.windows.getAll({
		'populate' : true
	}, function(wins) {
		wins.forEach(function(win) {
			win.tabs.forEach(function(tab) {
				if (tab != undefined && tab.url.indexOf('chrome') !== 0) {
					if (tab.status == "loading") {
						TabState[tab.id] = "loading";
					} else if (tab.status == "complete") {
						TabState[tab.id] = "loaded";
					}
					if (tab.highlighted) {
						updateState(tab.id);
					}
				}
			});
		});
	});
});

// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var htmlTree = "";
var styleTree = "";

var openTabs = {};

chrome.browserAction.onClicked.addListener(function(tab) {
	var openFlag = openTabs[tab.id] === true;

	openTabs[tab.id] = openFlag = !openFlag;

	// chrome.browserAction.setPopup({popup: "popup.html"});

	// chrome.tabs.executeScript(tab.id,
	// {code:"document.body.style.backgroundColor='" + k + "'"});

	// chrome.tabs.executeScript(tab.id, {file: 'script.js', allFrames: true});

	if (openFlag) {
		chrome.tabs.sendMessage(tab.id, {
			action : "open"
		}, function(response) {
			chrome.browserAction.setBadgeText({
				text : "2"
			});
		});
	} else {
		chrome.tabs.sendMessage(tab.id, {
			action : "close"
		});
	}
});

chrome.tabs.onActivated.addListener(function(info) {
	if (openTabs[info.tabId] !== true) {
		chrome.browserAction.setBadgeText({
			text : ""
		});
	} else {
		chrome.browserAction.setBadgeText({
			text : "2"
		});
	}
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if (message.action == "capture") {
		chrome.tabs.create({
			url : 'capture.html',
			selected : true
		});
		htmlTree = message.html;
		styleTree = message.style;
	} else if (message.action == "closed") {
		chrome.browserAction.setBadgeText({
			text : ""
		});
		// chrome.tabs.getCurrent() should not be used in background page
		chrome.tabs.query({
			active : true
		}, function(tabs) {
			openTabs[tabs[0].id] = false;
		});
	}
});
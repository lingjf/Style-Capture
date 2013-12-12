// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var openFlag = false;
var htmlTree = "";
var styleTree = "";

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
		openFlag = false;
	}
});

chrome.browserAction.onClicked.addListener(function(tab) {
	openFlag = !openFlag;

	// chrome.browserAction.setPopup({popup: "popup.html"});

	// chrome.tabs.executeScript(tab.id,
	// {code:"document.body.style.backgroundColor='" + k + "'"});

	// chrome.tabs.executeScript(tab.id, {file: 'jquery.js', allFrames: true});
	// chrome.tabs.executeScript(tab.id, {file: 'content_script.js', allFrames:
	// true});

	if (openFlag) {
		chrome.tabs.sendMessage(tab.id, {
			action : "open"
		}, function(response) {
			chrome.browserAction.setBadgeText({
				text : response.count
			});
		});
	} else {
		chrome.tabs.sendMessage(tab.id, {
			action : "close"
		});
	}

});

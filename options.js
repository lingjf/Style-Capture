var Options = null;

function restoreOptions() {
	var options = Options.get();
	console.log(options);

	if (options["ShowSelectedTagChain"] === "true") {
		$("#ShowSelectedTagChain").button("toggle");
	}
	if (options["styled"] === "Computed_Style") {
		$("#Computed_Style").button("toggle");
	}
	if (options["styled"] === "Author_Style") {
		$("#Author_Style").button("toggle");
	}

	if (options["Simplification"] === "true") {
		$("#Simplification").button("toggle");
	}
	if (options["RemoveDefault"] === "true") {
		$("#RemoveDefault").button("toggle");
	}
}

function broadcastOptions(key, value) {
	var msg = {
		action : "update"
	};
	msg[key] = value;
	chrome.windows.getAll({
		'populate' : true
	}, function(wins) {
		wins.forEach(function(win) {
			win.tabs.forEach(function(tab) {
				if (tab != undefined) {
					chrome.tabs.sendMessage(tab.id, msg);
				}
			});
		});
	});
}

$(document).ready(function() {
	chrome.runtime.getBackgroundPage(function(backgroundPage) {
		Options = backgroundPage.Options;
		restoreOptions();
	});
	$("#ShowSelectedTagChain input").change(function() {
		Options.set({
			"ShowSelectedTagChain" : this.checked ? "true" : "false"
		});
		broadcastOptions("ShowSelectedTagChain", this.checked ? "true" : "false");
	});

	$("#Computed_Style input").change(function() {
		if (this.checked) {
			Options.set({
				"styled" : "Computed_Style"
			});
		}
	});
	$("#Author_Style input").change(function() {
		if (this.checked) {
			Options.set({
				"styled" : "Author_Style"
			});
		}
	});
	$("#Simplification input").change(function() {
		Options.set({
			"Simplification" : this.checked ? "true" : "false"
		});
	});
	$("#RemoveDefault input").change(function() {
		Options.set({
			"RemoveDefault" : this.checked ? "true" : "false"
		});
	});

});

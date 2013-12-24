var Captured;
var Options;

SyntaxHighlighter.defaults['toolbar'] = false;
SyntaxHighlighter.defaults['ruler'] = true;

function copytoClipboard() {
	$('body').append('<textarea id="clipboard_template"/>');
	var clipboard_template = $('#clipboard_template');
	clipboard_template.text(Captured.css + "\n" + Captured.html);
	clipboard_template.select();
	document.execCommand('copy');
	clipboard_template.remove();
}

function generateDownload() {
	/*
	 * http://stackoverflow.com/questions/2153979/chrome-extension-how-to-save-a-file-on-disk
	 */
	var url = window.webkitURL || window.URL || window.mozURL || window.msURL;
	var content = "<html> <head> ";
	content += "<meta charset='" + Captured.charset + "' />\n";
	content += Captured.css;
	content += "\n</head> <body>\n";
	content += Captured.html;
	content += "\n</body> </html>\n";

	var blob = new Blob([ content ], {
		type : 'text/html'
	});
	var a = $('#controls #download a').get(0);
	a.download = 'Style-Capture-Page.html';
	a.href = url.createObjectURL(blob);
	// a.textContent = 'Click here to download captured !';
	a.dataset.downloadurl = [ 'html', a.download, a.href ].join(':');
}

$(document).ready(
		function() {
			chrome.runtime.getBackgroundPage(function(backgroundPage) {
				Captured = backgroundPage.Captured;
				Options = backgroundPage.Options;

				$('.captured#layout').append(" " + Captured.html + " ");

				var opt = Options.get();
				if (opt["styled"] === "Computed_Style") {
					Captured.css = "<style>\n"
							+ CopyCSSS().simplifyStyles(Captured.styles,
									opt["Simplification"] === "true",
									opt["RemoveDefault"] === "true")
							+ "\n</style>";
				} else {
					Captured.css = "<style>\n"
							+ Simplify.simplifyAuthorStyles(Captured.styles,
									opt["Simplification"] === "true",
									opt["RemoveDefault"] === "true")
							+ "\n</style>";
				}

				$('head').append(Captured.css);

				$('.captured#markup pre:nth-child(1)').html(Captured.css);

				$('.captured#markup pre:nth-child(2)').html(Captured.html);

				SyntaxHighlighter.highlight();

				generateDownload();
			});

			$('#controls #source').click(function() {
				$(this).toggleClass('close open');
				$('.captured#layout').toggle();
				$('.captured#markup').toggle();
				$('#controls #clipboard').removeClass('copied');
				$('#controls #clipboard').toggle();
				$('#controls #download').removeClass('downloaded');
				$('#controls #download').toggle();
			});

			$('#controls #clipboard').click(function() {
				copytoClipboard();
				$(this).addClass('copied');
			});

			$('#controls #download').click(function() {
				$(this).addClass('downloaded');
			});

		});

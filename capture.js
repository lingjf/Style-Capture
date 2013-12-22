var Captured;

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

				$('.captured#outlook').append(" " + Captured.html + " ");

				Captured.css = "<style>\n"
						+ CopyCSSS().simplifyStyles(Captured.styles)
						+ "\n</style>";
				$('head').append(Captured.css);

				$('.captured#htmlcss pre:nth-child(1)').html(Captured.css);

				$('.captured#htmlcss pre:nth-child(2)').html(Captured.html);

				SyntaxHighlighter.highlight();

				generateDownload();
			});

			$('#controls #source').click(function() {
				$(this).toggleClass('close open');
				$('.captured#outlook').toggle();
				$('.captured#htmlcss').toggle();
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

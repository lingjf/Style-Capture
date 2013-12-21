var Captured;

SyntaxHighlighter.defaults['toolbar'] = false;
SyntaxHighlighter.defaults['ruler'] = true;

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

			});

			$('#controls #source').click(function() {
				$(this).toggleClass('close open');
				$('.captured#outlook').toggle();
				$('.captured#htmlcss').toggle();
				$('#controls #clipboard').removeClass('copied');
				$('#controls #clipboard').toggle();
				$('#controls #download').toggle();
			});

			$('#controls #clipboard').click(function() {
				$('body').append('<textarea id="clipboard_template"/>');
				var clipboard_template = $('#clipboard_template');
				clipboard_template.text(Captured.css + "\n" + Captured.html);
				clipboard_template.select();
				document.execCommand('copy');
				clipboard_template.remove();
				$(this).addClass('copied');
			});

		});

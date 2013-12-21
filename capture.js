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
				$('#controls #clipboard').toggle();
				$('#controls #download').toggle();
			});

		});

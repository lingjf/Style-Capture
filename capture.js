var Captured;

$(document).ready(
		function() {
			chrome.runtime.getBackgroundPage(function(backgroundPage) {
				Captured = backgroundPage.Captured;
				$('.captured#outlook').append(" " + Captured.html + " ");
				setTimeout(function() {
					Captured.css = "<style>\n"
							+ CopyCSSS().simplifyStyles(Captured.styles)
							+ "\n</style>";
					$('head').append(Captured.css);
					
					$('.captured#htmlcss pre').text(Captured.css + "\n" + Captured.html);
				}, 50);
				
				
			});

			$('#controls #source').click(function() {
				$(this).toggleClass('close open');
				$('.captured#outlook').toggle();
				$('.captured#htmlcss').toggle();
				$('#controls #clipboard').toggle();
				$('#controls #download').toggle();
			});
		});

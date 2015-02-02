var args = arguments[0] || {};

var help_img = HELP_PATH + "help-" + args.current_window+".jpg";
var imageView = Ti.UI.createImageView({ 
		image   				: help_img,
		// height					: icon_size,
		width					  : "100%",
		left						: 0,
		top							: 0
});

$.scrollview.add( imageView );

// easy peazy

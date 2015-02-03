var args = arguments[0] || {};
//var default_path = Ti.Filesystem.applicationDataDirectory; //+"app/assets/";
var help_img = HELP_PATH + "help-" + args.current_window+".jpg";

Ti.API.debug(" >>>>>>>>>>>> " + default_path + help_img);

if( Ti.Filesystem.getFile('.', help_img).exists() ) {
	var imageView = Ti.UI.createImageView({ 
		image   	: help_img,
		width			: "100%",
		left			: 0,
		top				: 0
	}); 
} else {
	var imageView = Ti.UI.createImageView({ 
		image   	: MISSING_PATH + "poi-0-banner.jpg",
		width			: "100%",
		left			: 0,
		top				: 0
	}); 
}
$.scrollView.add( imageView );

// easy peazy

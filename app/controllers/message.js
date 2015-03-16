var args = arguments[0] || {};

var d = new Date();
var dev_img = "http://waterbowl.net/mobile/images/wb-msgs/message-dev.jpg?"+d.getMilliseconds();
var missing_img = MISSING_PATH + "poi-0-banner.jpg";
		// type (fg or bg), alloyObject, actual, missing

var imageView = Ti.UI.createImageView({ 
		image   	: missing_img,
		width		: "100%",
		left		: 0,
		top			: 0
	}); 

$.scrollView.add( imageView );

var params = {
	owner_ID : mySesh.user.owner_ID
}

loadJson(params, "http://waterbowl.net/mobile/user-message.php", "");
loadRemoteImage("fg", imageView, dev_img, missing_img);

var continue_btn = myUi.buildButton( "continue_btn", "continue", "xl" );
$.scrollView.add( continue_btn );
$.scrollView.add( myUi.buildSpacer("horz", 40,  myUi._color_ltpink) );

continue_btn.addEventListener('click', function(){
	mySesh.user.dev_msg_read = 1;
	closeWindowController();
	createWindowController("mapview","","slide_left");
});



// easy peazy
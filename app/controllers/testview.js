
var WindowModule = require('com.waterbowl.winmgr');
var new_window = new WindowModule.LoadWindow();
var test_label = Ti.UI.createLabel( { 
	id: "test_label", width: Ti.UI.SIZE, text: 'waterbowl', top: 6, height: "auto", 
	color: "#ffffff", font:{ fontFamily: 'Raleway-Bold', fontSize: 20 } } );
$.content.add(test_label);					
new_window.setTitle(test_label, "YAY TEXT!");


addToAppWindowStack( $.testview, "testview" );
addMenubar( $.menubar );


var WindowModule = require('com.waterbowl.winmgr');
var new_window = new WindowModule.LoadWindow();


new_window.setTitle($.menubar_debug, "YAY TEXT!");

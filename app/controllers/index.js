//================================================================================
//	Name: goToLogin
//	Purpose: check credentials against backend
//================================================================================
function goToLogin (e) {
	Ti.API.log("* Login clicked *");				// debug message
	if ($.email.value != '' && $.password.value != '') {
		loginRequest.open("POST", "http://www.waterbowl.net/mobile/login.php");
		var params = {
			email: $.email.value,
			pass : $.password.value
		};
		loginRequest.send(params);
	} 
	else {
		var responseAlert = Titanium.UI.createAlertDialog({
			title:	'Login Error',
			message: 'Please fill in both fields.'
		});
		responseAlert.show();
	}    
}

//================================================================================
//	Name: 	goToRegister(e)
//	Purpose:  bounce user to Registration page
//================================================================================
function goToRegister (e) {
 	Ti.API.log("* Register clicked * ");

 	// use this, coupled with lines 107-108 to pass variables to new windows
 	var register = Alloy.createController( "register" ).getView();
 	
 	register.top = 800;
 	register.opacity = 0.15;
	register.open( {
		top: 0,
		opacity: 1,
		duration: 400, 
		curve : Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT
	}); 
}

//========================== Create and Open top level UI components ======================================= 
$.index.open();	
addToAppWindowStack( $.index, "index" );

// check network connection 
if(Titanium.Network.networkType == Titanium.Network.NETWORK_NONE) {
	var alertDialog = Titanium.UI.createAlertDialog({
    title: 'Uh oh',
    message: 'No network connection detected',
    buttonNames: ['OK']
  });
  alertDialog.show();
}

// Check if the device is running iOS 8 or later, before registering for local notifications
if (Ti.Platform.name == "iPhone OS" && parseInt(Ti.Platform.version.split(".")[0]) >= 8) {
  Ti.App.iOS.registerUserNotificationSettings({
    types: [
          Ti.App.iOS.USER_NOTIFICATION_TYPE_ALERT,
          Ti.App.iOS.USER_NOTIFICATION_TYPE_SOUND,
          Ti.App.iOS.UESR_NOTIFICATION_TYPE_BADGE
      ]
  });
  Ti.API.info( "* >> IOS 8 or greater *" );
}
else {
	Ti.API.info( "* << IOS 7 or older *" );
}

// if credentials are already saved in session
if( session.user.email!=null || Ti.App.Properties.getString('user')!="" ) {
	// $.email.value = session.user.email;
	$.email.value = Ti.App.Properties.getString('user');
}
if( session.user.password!=null || Ti.App.Properties.getString('pass')!="" ) {
	$.password.value = session.user.password;
	$.password.value = Ti.App.Properties.getString('pass');
}	

/*  	LOGIN HACK - skip past login screen and go to Map 	*/
// setTimeout ( function() { $.loginBtn.fireEvent('click'); }, 200 );  // wait for the login fields to get populate

/*    To skip to a specific window, uncomment block below and change which window name to jump to		*/

var new_window = Alloy.createController( "map" ).getView();
new_window.open();


// loginRequest.open triggers > loginRequest.onload 
// bounce user to Place View upon successful login
var loginRequest = Titanium.Network.createHTTPClient();
loginRequest.onload = function() {			// parse the JSON response
	var json = this.responseText;	
	var response = JSON.parse(json);			// debug message
	if (response.status == 1) {
		// save credentials locally (globals for now, later more secure)
		session.user.email 		= $.email.value;
		session.user.password = $.password.value;
		session.user.owner_ID = response.owner_ID;
		// TODO: dog info
		
		Ti.API.log( "* Saved Creds: "+session.user.owner_ID+ "/" +session.user.email+ "/" + session.user.password);
	
		// grant entry, bounce user to next page
		$.email.blur();
		$.password.blur();
		
		// take user to the post-login window
		var win = Alloy.createController("map").getView();
		win.open( {transition:Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT} ); 
		//$.index.close();  		
	} else {
		var responseAlert = Titanium.UI.createAlertDialog({
    		title:	'Login Error',
    		message: response.message
		});
		responseAlert.show();
	}
};

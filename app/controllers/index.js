//================================================================================
//	Name: goToLogin
//	Purpose: check credentials against backend
//================================================================================
function goToLogin(e) {
	Ti.API.log("* Login clicked *");				// debug message
	'use strict';
	
	// check network connection 
	if(Titanium.Network.networkType==Titanium.Network.NETWORK_NONE) {
		createSimpleDialog('Uh oh', 'No network connection detected');
	}
	else {
		// temporarily blur the login fields while awaiting response
		email.blur();
		password.blur();
				
		if (email.value != '' && password.value != '') {
			// >> XHR REQUEST
			var loginRequest = Ti.Network.createHTTPClient( {
				// SUCCESS:  On data load
				onload: function(e) {
					var response = JSON.parse(this.responseText);	
					Ti.API.debug(this.responseText);
					// TODO:  should probably put this into a separate function
					if (response.status == 1) {
						// save credentials locally in mySesh global arrays
						mySesh.user.email 		= email.value;
						mySesh.user.password  = password.value;
						mySesh.user.owner_ID  = response.human.owner_ID;
						mySesh.user.name 			= response.human.owner_name;
						mySesh.dog.dog_ID  		= response.dog.dog_ID;
						
						mySesh.dog.current_place_ID        = response.dog.current_place_ID;
						if (response.place!=null) {
						  mySesh.dog.current_place_name      = response.place.name;
						  mySesh.dog.current_place_lat       = response.place.lat;
						  mySesh.dog.current_place_lon       = response.place.lon;
						  mySesh.dog.current_place_geofence_radius = response.place.geofence_radius;
		        }
						mySesh.dog.last_checkin_timestamp  = response.dog.last_checkin_timestamp;
						mySesh.dog.name	 	= response.dog.dog_name;
					
						Ti.App.Properties.setString('user', email.value);
						Ti.App.Properties.setString('pass', password.value);
				
						// TODO: dog info
						Ti.API.log( "*** Saved Creds: "+mySesh.user.owner_ID+ "/" +mySesh.user.email+ "/" + mySesh.user.password);
						Ti.API.log( "*** CURRENT CHECKINS: " + mySesh.dog.current_place_ID );
						
						// take user to the post-login window
						closeWindowController();
						createWindowController( "mapview", "", "slide_left" ); 
					} else {
						// pass on error message from backend 
						createSimpleDialog('Login Error', response.message);
					}
				},
				//  ERROR:  No data received from XHRequest
				onerror: function(e) {
					Ti.API.debug(e.error);
					createSimpleDialog('Error', e.error);
				},
				timeout: 4000 /* in milliseconds */
			} );
			// << XHR REQUEST
			var request_url = SERVER_URL + "login.php";
			loginRequest.open("POST", request_url);
			var params = {
				email : email.value,
				pass  : password.value
			};
			loginRequest.send(params);
			Ti.API.debug ( "SENDING >> " + JSON.stringify(params) + " to >> " + request_url );
		} 
		else {
			createSimpleDialog('Login Error', 'Please fill in both fields.');	
			email.focus();
			password.focus();
		}  
	}  
}

//================================================================================
//	Name: 	goToRegister(e)
//	Purpose:  bounce user to Registration page
//================================================================================
function goToRegister (e) {
	Ti.API.log("* Register clicked * ");
 	createWindowController("register", "", "slide_left"); 
}

//======================== Create and Open top level UI components ==================================== 
$.index.open();	
addToAppWindowStack( $.index, "index" );
//                                         id,       width,  hint,       is_pwd
var email    = myUiFactory.buildTextField("email",   "99%",  "email",    "");
var password = myUiFactory.buildTextField("password", "99%", "password", true);
$.loginStuff.add(email);
$.loginStuff.add(password);

var loginBtn = myUiFactory.buildButton("loginBtn", "login", "large");
loginBtn.addEventListener('click', function(){ goToLogin(); });
$.loginStuff.add(loginBtn);

var regBtn = myUiFactory.buildButton("regBtn", "register", "large");
regBtn.addEventListener('click', function(){ goToRegister(); });
$.loginStuff.add(regBtn);

//var more_btn = myUiFactory.buildFullRowButton("more_btn", "more >"); 
//$.loginStuff.add(more_btn);

// Check if the device is running iOS 8 or later, before registering for local notifications
if (Ti.Platform.name == "iPhone OS" && parseInt(Ti.Platform.version.split(".")[0]) >= 8) {
  Ti.App.iOS.registerUserNotificationSettings({
    types: [
          Ti.App.iOS.USER_NOTIFICATION_TYPE_ALERT,
          Ti.App.iOS.USER_NOTIFICATION_TYPE_SOUND,
          Ti.App.iOS.UESR_NOTIFICATION_TYPE_BADGE
      ]
  });
  Ti.API.info( ">>> IOS 8 or greater *" );
}
else {
	Ti.API.info( ">>> IOS 7 or older *" );
}

Titanium.API.info ('...[~]Available memory: ' + Titanium.Platform.availableMemory);

// if credentials are already saved in mySesh
if( mySesh.user.email!=null || Ti.App.Properties.getString('user')!="" ) {
  email.value = mySesh.user.email;
	email.value = Ti.App.Properties.getString('user');
}
if( mySesh.user.password!=null || Ti.App.Properties.getString('pass')!="" ) {
	password.value = mySesh.user.password;
	password.value = Ti.App.Properties.getString('pass');
}	

/*  	LOGIN HACK - skip past login screen and go to Map 	*/
// Ti.App.Properties.setString('user', '');
// Ti.App.Properties.setString('pass', '');
setTimeout ( function() { loginBtn.fireEvent('click'); }, 300 );  // wait for login fields to populate

/*    To skip to a specific window, uncomment block below and change which window name to jump to		*/
/*
var necessary_args = {
  _place_ID    : 601000001,
	_place_index : 0,
	_place_name  : "Oberieder Park!",
	_enclosure_count : 2
};
createWindowController("provideestimate",necessary_args,"slide_left");
*/

//createWindowController("mapview","","slide_left");

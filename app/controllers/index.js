//================================================================================
//	Name: 		goToLogin
//	Purpose: 	determine whether user is already logged in
//================================================================================
function goToLogin() {
	Ti.API.log("* Login clicked *");				
	if(Titanium.Network.networkType==Titanium.Network.NETWORK_NONE) {
		createSimpleDialog('Uh oh', 'No network connection detected');
	}	else {
		email.blur();				// temporarily blur the login fields while awaiting response
		password.blur();
				
		if (email.value != '' && password.value != '') {
			wbLogin(email.value, password.value);
		} 
		else {
			createSimpleDialog('Login Error', 'Please fill in both fields.');	
			email.focus();
			password.focus();
		}  
	}  
}

//================================================================================
//	Name: wbLogin
//	Purpose: check credentials against backend
//================================================================================
function wbLogin(email, password) {
	// >> XHR REQUEST
	var loginRequest = Ti.Network.createHTTPClient( {
		// SUCCESS:  On data load
		onload: function(e) {
			var response = JSON.parse(this.responseText);	
			Ti.API.debug(this.responseText);
			// TODO:  should probably put this into a separate function
			if (response.status == 1) {
				// save credentials locally in mySesh global arrays
				mySesh.user.email 	 = email;
				mySesh.user.password = password;
				mySesh.user.owner_ID = response.human.owner_ID;
				mySesh.user.name 		 = response.human.owner_name;
				mySesh.dog.dog_ID  	 = response.dog.dog_ID;
				
				mySesh.dog.current_place_ID        = response.dog.current_place_ID;
				if (response.place!=null) {
				  mySesh.dog.current_place_name    = response.place.name;
				  mySesh.dog.current_place_lat     = response.place.lat;
				  mySesh.dog.current_place_lon     = response.place.lon;
				  mySesh.dog.current_place_geofence_radius = response.place.geofence_radius;
        }
				mySesh.dog.last_checkin_timestamp  = response.dog.last_checkin_timestamp;
				mySesh.dog.name	 	= response.dog.dog_name;
			
				Ti.App.Properties.setString('user', email);
				Ti.App.Properties.setString('pass', password);
		
				// TODO: dog info
				Ti.API.log( "*** Saved Creds: "+mySesh.user.owner_ID+ "/" +mySesh.user.email+ "/" + mySesh.user.password);
				Ti.API.log( "*** CURRENT CHECKINS: " + mySesh.dog.current_place_ID );
				
				// take user to the post-login window
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
	loginRequest.open("POST", SERVER_URL+"login.php");
	var params = {
		email : email,
		pass  : password
	};
	loginRequest.send(params);
	Ti.API.info ( "SENDING >> "+JSON.stringify(params) );
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

$.index.backgroundImage = 'images/waterbowl-splash-screen.jpg';

var footer_height = 80;
var content_height = mySesh.device.screenheight - footer_height;
var topView_height = .5 * content_height;
var midView_height = .5 * content_height;

//alert(mySesh.device.screenheight +"["+ topView_height +", "+ midView_height +"]");

// mySesh.device.screenheight - 150

// FIRST THINGS FIRST - IF CREDS ARE SAVED, AUTOLOGIN!
var saved_user = Ti.App.Properties.getString('user');
var saved_pwd = Ti.App.Properties.getString('pass');

if ( saved_user!=null && saved_pwd!=null ) {
	alert( "This: "+ saved_user + "/" + saved_pwd );
	wbLogin(saved_user, saved_pwd);
} else {
	// Build 3 vertically stacked View Containers
	var topView = myUiFactory.buildViewContainer ( "topView", "", "100%", topView_height, 0 );
	var midView = myUiFactory.buildViewContainer ( "midView", "vertical", "100%", midView_height, 0 );
	var botView = myUiFactory.buildViewContainer ( "botView", "", "100%", Ti.UI.FILL, 	0 );
	
	// 																		title, 			 w, 		 h,  font_style, 					    color 			text_align
	var titlebar = myUiFactory.buildLabel("waterbowl", "100%", 60, myUiFactory._text_banner, "#ffffff", "center");
	//                                         id,       width,  hint,       is_pwd
	var email    = myUiFactory.buildTextField("email",   "99%",  "email",    "");
	var password = myUiFactory.buildTextField("password", "99%", "password", true);
	
	var loginBtn = myUiFactory.buildButton("loginBtn", "login", "large");
	loginBtn.addEventListener('click', function(){ goToLogin(); });
	
	var regBtn = myUiFactory.buildButton("regBtn", "register", "large");
	regBtn.addEventListener('click', function(){ goToRegister(); });
	
	var footer = Ti.UI.createImageView({ 
		//height				: icon_size,
		//width				 : icon_size,
		image						: 'images/WB-FooterBar.png',
		backgroundColor : '',  //myUiFactory._color_dkblue,
		bottom					: 0
	});


	// add UI elements to containers		
	topView.add(titlebar);
	midView.add(email);
	midView.add(password);
	midView.add(loginBtn);
	midView.add(regBtn);
	botView.add(footer);

	// add containers to parent view
	$.content.add(topView);
	$.content.add(midView);
	$.content.add(botView);


	// Check if the device is running iOS 8 or later, before registering for local notifications
	if (Ti.Platform.name == "iPhone OS" && parseInt(Ti.Platform.version.split(".")[0]) >= 8) {
	  /*
	  TODO:  turn this on if we use push notifications
	  Ti.App.iOS.registerUserNotificationSettings({
	    types: [
	          Ti.App.iOS.USER_NOTIFICATION_TYPE_ALERT,
	          Ti.App.iOS.USER_NOTIFICATION_TYPE_SOUND,
	          Ti.App.iOS.UESR_NOTIFICATION_TYPE_BADGE
	      ]
	  }); 
	  */
	  Ti.API.info( " > > > IOS 8 or greater *" );
	}
	else {
		Ti.API.info( " > > > IOS 7 or older *" );
	}
	
	Titanium.API.info ('.... [~] Available memory: ' + Titanium.Platform.availableMemory);
	
	// if credentials are already saved in mySesh
	if( Ti.App.Properties.getString('user')!="" ) {
		email.value = Ti.App.Properties.getString('user');
	}
	if( Ti.App.Properties.getString('pass')!="" ) {
			password.value = Ti.App.Properties.getString('pass');
	}	
}

/*  	LOGIN HACK - skip past login screen and go to Map 	*/
// Ti.App.Properties.setString('user', '');
// Ti.App.Properties.setString('pass', '');
// setTimeout ( function() { loginBtn.fireEvent('click'); }, 300 );  // wait for login fields to populate

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

// createWindowController("mapview","","slide_left");

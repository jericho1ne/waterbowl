//================================================================================
//	Name: 		goToLogin
//	Purpose: 	determine whether user is already logged in
//================================================================================
function goToLogin() {
	var emailText 	= email.value;
	var pwdText 	= password.value;


	Ti.API.log("  .... [+] goToLogin :: ["+ emailText +'/'+ pwdText +']');				
	if(Titanium.Network.networkType==Titanium.Network.NETWORK_NONE) {
		createSimpleDialog('Uh oh', 'No network connection detected');
	} else {
		if ( pwdText=='' || emailText=='') {
			createSimpleDialog('Login Error', 'Please fill in both fields.');	
		} 
		else {
			wbLogin( emailText, pwdText );
			Alloy.Globals.loadingMask.show('Loading...', true);
			setTimeout(function(){
				Alloy.Globals.loadingMask.hide();
			}, 800);
		}  
	}  
}

//================================================================================
//	Name: 	goToRegister(e)
//	Purpose:  bounce user to Registration page
//================================================================================
function goToRegister (e) {
	// Ti.API.log("* Register clicked * ");
 	mySesh.clearSavedDogInfo();
 	mySesh.clearSavedUserInfo();
 	createWindowController("register", "", "slide_left"); 
}

//
//
//======================== Create and Open top level UI components ==================================== 
//
//
$.index.open();	
addToAppWindowStack( $.index, "index" );
$.index.backgroundImage = 'images/waterbowl-splash-screen.jpg';

/* 	LOGIN HACK - skip past login screen  			*/
/*var params = {
	_dog_ID: 2,
	_poiInfo: {
		name : "Oberreider",
		place_ID:601000001
	},
	_place_ID:601000001
}
createWindowController("activityhistory", params, "slide_left");
*/


// DIV HEIGHTS
var footer_height = 80;
var content_height = mySesh.device.screenheight - footer_height;
var topView_height = .39 * content_height;
var midView_height = .61 * content_height;
var form_width = myUiFactory._form_width;

// Check if the device is running iOS 8 or later, before registering for local notifications
	/*if (Ti.Platform.name == "iPhone OS" && parseInt(Ti.Platform.version.split(".")[0]) >= 8) { 
	 // TODO:  turn this on if we use push notifications
	  Ti.App.iOS.registerUserNotificationSettings({
	    types: [
	          Ti.App.iOS.USER_NOTIFICATION_TYPE_ALERT,
	          Ti.App.iOS.USER_NOTIFICATION_TYPE_SOUND,
	          Ti.App.iOS.UESR_NOTIFICATION_TYPE_BADGE
	      ]
	  }); 
	  // Ti.API.debug( " > > > IOS 8 or greater *" );
	}
	else {
		//Ti.API.debug( " > > > IOS 7 or older *" );
	} */

// Build 3 vertically stacked View Containers
var topView = myUiFactory.buildViewContainer ( "topView", "", "100%", topView_height, 0 );
var midView = myUiFactory.buildViewContainer ( "midView", "vertical", "100%", midView_height, 0 );
var botView = myUiFactory.buildViewContainer ( "botView", "", "100%", Ti.UI.FILL, 0 );

var titlebar = myUiFactory.buildLabel("waterbowl", Ti.UI.FILL, 80, myUiFactory._text_banner, "#ffffff", "", "center");
//                                    	   id,       width,      hint,       is_pwd
var email    = myUiFactory.buildTextField("email",   form_width,  "email address",    "");
var password = myUiFactory.buildTextField("password", form_width, "password", true);

email.opacity = 0.8;
password.opacity = 0.8;

var loginBtn = myUiFactory.buildButton("loginBtn", "login", "xl");
loginBtn.addEventListener('click', function(){ goToLogin(); });

var regBtn = myUiFactory.buildButton("regBtn", "register", "xl");
regBtn.addEventListener('click', function(){ goToRegister(); });

var footer = Ti.UI.createImageView({ 
	//height		: icon_size,
	//width			: icon_size,
	image			: 'images/WB-FooterBar.png',
	backgroundColor : '',  //myUiFactory._color_dkblue,
	bottom			: 0
});

// add UI elements to containers		
//topView.add( myUiFactory.buildSpacer("horz", 0.35*topView_height) ); 
topView.add(titlebar);
midView.add(email);
midView.add(password);
midView.add( myUiFactory.buildSpacer("horz", 4, "clear") );
midView.add(loginBtn);
midView.add(regBtn);
botView.add(footer);

// add containers to parent view
$.content.add(topView);
$.content.add(midView);
$.content.add(botView);	

if( Ti.App.Properties.getString('email')!=="" ) {
	email.value = Ti.App.Properties.getString('email');
	if( Ti.App.Properties.getString('password')!=="" ) {
		password.value = Ti.App.Properties.getString('password');
	}
}

/*
$.index.addEventListener('focus',function(e) {		// only gets after original page load
	// if a different email was provide in the setup process, use that
	if( mySesh.user.email!="" && (Ti.App.Properties.getString('email')!=mySesh.user.email) ) {
		email.value		= mySesh.user.email;
		// force user to type in their password.  it's good practice at first!
		password.value 	= "";	
	}
	else {
		if( Ti.App.Properties.getString('email')!="" && Ti.App.Properties.getString('password')!="" ) {
			email.value		= Ti.App.Properties.getString('email');
			password.value	= Ti.App.Properties.getString('password');
			// AUTOLOGIN IF CREDENTIALS ARE SAVED
			//	wbLogin(saved_user, saved_pwd);
		}
	}
}); 
*/

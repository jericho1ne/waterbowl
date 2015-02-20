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
			wbLogin( email.value.trim(), password.value.trim() );
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
	// Ti.API.log("* Register clicked * ");
 	mySesh.clearSavedDogInfo();
 	createWindowController("register", "", "slide_left"); 
}

//======================== Create and Open top level UI components ==================================== 
$.index.open();	
addToAppWindowStack( $.index, "index" );
$.index.backgroundImage = 'images/waterbowl-splash-screen.jpg';


// DIV HEIGHTS
var footer_height = 80;
var content_height = mySesh.device.screenheight - footer_height;
var topView_height = .35 * content_height;
var midView_height = .65 * content_height;
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
//Titanium.API.debug ('.... [~] Available memory: ' + Titanium.Platform.availableMemory);	

// FIRST THINGS FIRST - IF CREDS ARE SAVED, AUTOLOGIN!
var saved_user = Ti.App.Properties.getString('user');
var saved_pwd  = Ti.App.Properties.getString('pass');

//if (saved_user=="" || saved_pwd=="") {
	// Build 3 vertically stacked View Containers
	var topView = myUiFactory.buildViewContainer ( "topView", "", 				"100%", topView_height, 0 );
	var midView = myUiFactory.buildViewContainer ( "midView", "vertical", "100%", midView_height, 0 );
	var botView = myUiFactory.buildViewContainer ( "botView", "", 				"100%", Ti.UI.FILL, 0 );
	
	// 																		title, 			 w, 		 h,  font_style, 					    color 			text_align
	var titlebar = myUiFactory.buildLabel("waterbowl", form_width, 60, myUiFactory._text_banner, "#ffffff", "center");
	//                                         id,       width,  hint,       is_pwd
	var email    = myUiFactory.buildTextField("email",   form_width,  "email",    "");
	var password = myUiFactory.buildTextField("password", form_width, "password", true);
	
	var loginBtn = myUiFactory.buildButton("loginBtn", "login", "xl");
	loginBtn.addEventListener('click', function(){ goToLogin(); });
	
	var regBtn = myUiFactory.buildButton("regBtn", "register", "xl");
	regBtn.addEventListener('click', function(){ goToRegister(); });
	
	var footer = Ti.UI.createImageView({ 
		//height				: icon_size,
		//width				  : icon_size,
		image						: 'images/WB-FooterBar.png',
		backgroundColor : '',  //myUiFactory._color_dkblue,
		bottom					: 0
	});

	// add UI elements to containers		
	//topView.add( myUiFactory.buildSpacer("horz", 0.35*topView_height) ); 
	topView.add(titlebar);
	midView.add(email);
	midView.add(password);
	midView.add( myUiFactory.buildSpacer("horz", 4) );
	midView.add(loginBtn);
	midView.add(regBtn);
	botView.add(footer);

	// add containers to parent view
	$.content.add(topView);
	$.content.add(midView);
	$.content.add(botView);
		
//} else {  // AUTOLOGIN IF CREDENTIALS ARE SAVED
//	wbLogin(saved_user, saved_pwd);
//}

/////// FILL IN USER / EMAIL FIELDS IF INFO IS SAVED LOCALLY //////////
/* if( Ti.App.Properties.getString('user')!=""  ) 
	email.value = Ti.App.Properties.getString('user');
if( Ti.App.Properties.getString('pass')!="" ) 
	password.value = saved_pwd;
*/
$.index.addEventListener('focus',function(e) {
	// if credentials are already saved in mySesh
	if( Ti.App.Properties.getString('user')!="" )
		email.value 		= Ti.App.Properties.getString('user');
	if( Ti.App.Properties.getString('pass')!="" )
		password.value	= Ti.App.Properties.getString('pass');
});


/*  	LOGIN HACK - skip past login screen and go to Map 	*/
/* 
//   To skip to a specific window, uncomment block below and change which window name to jump to
var necessary_args = {  _place_ID    : 601000001, };
createWindowController("provideestimate",necessary_args,"slide_left");
*/
//createWindowController("register3","","slide_left");
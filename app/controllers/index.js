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

// DIV HEIGHTS
var footer_height = 80;
var content_height = mySesh.device.screenheight - footer_height;
var topView_height = .39 * content_height;
var midView_height = .61 * content_height;
var form_width = myUi._form_width;

// Build 3 vertically stacked View Containers
var topView = myUi.buildViewContainer ( "topView", "", "100%", topView_height, 0 );
var midView = myUi.buildViewContainer ( "midView", "vertical", "100%", midView_height, 0 );
var botView = myUi.buildViewContainer ( "botView", "", "100%", Ti.UI.FILL, 0 );

var titlebar = myUi.buildLabel("waterbowl", Ti.UI.FILL, 80, myUi._text_banner, "#ffffff", "", "center");
//                                    	   id,       width,      hint,       is_pwd
var email    = myUi.buildTextField("email",   form_width,  "email address",    "");
var password = myUi.buildTextField("password", form_width, "password", true);

email.opacity = 0.8;
password.opacity = 0.8;

var loginBtn = myUi.buildButton("loginBtn", "login", "xl");
loginBtn.addEventListener('click', function(){ goToLogin(); });

var regBtn = myUi.buildButton("regBtn", "register", "xl");
regBtn.addEventListener('click', function(){ goToRegister(); });

var footer = Ti.UI.createImageView({ 
	//height		: icon_size,
	//width			: icon_size,
	image			: 'images/WB-FooterBar.png',
	backgroundColor : '',  //myUi._color_dkblue,
	bottom			: 0
});

// add UI elements to containers		
//topView.add( myUi.buildSpacer("horz", 0.35*topView_height) ); 
topView.add(titlebar);
midView.add(email);
midView.add(password);
midView.add( myUi.buildSpacer("horz", 4, "clear") );
midView.add(loginBtn);
midView.add(regBtn);
botView.add(footer);

// add containers to parent view
$.content.add(topView);
$.content.add(midView);
$.content.add(botView);	

$.index.addEventListener('focus',function(e) {		// only gets after original page load
	Ti.API.log( "  .... [i] saved email :: " +Ti.App.Properties.getString('email') );
	Ti.API.log( "  .... [i] saved pwd   :: " +Ti.App.Properties.getString('password') );

	/*  
	// why oh why doesn't this work.  sonofa...
	email.value = Ti.App.Properties.getString('email');
	email.focus();
	password.value = Ti.App.Properties.getString('password');	
	password.focus();
	*/
}); 

/* 	LOGIN HACK - skip past login screen  			*/
email.value = "jericho1ne@yahoo.com"
password.value = "mihai1";
setTimeout(goToLogin(), 500);
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

//================================================================================
//		Name: checkemail
//		Purpose:  error check user input
//================================================================================
function checkemail(emailAddress) {
	var email_test;
	var str = emailAddress;
	var filter = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
	if (filter.test(str)) {
		email_test = true;

	} else {
		email_test = false;
	}
	return (email_test);
};

//================================================================================
//		Name: 			saveUserDetails ()
//		Purpose:  add new user to database
//================================================================================
function saveUserDetails (email, pwd1, pwd2, city, state, zip) {
	disableAllButtons();
	if (pwd1!='' && pwd2!='' && email!='' && city!='' && state!='') {
		if (pwd1 != pwd2) {
			createSimpleDialog("Passwords do not match","Please handle that and try again");
		} else {
			if ( !checkemail(email) ) {
				createSimpleDialog("Email error","Please enter a valid email");
			}	else {
				// TODO:  ALSO save dog info here locally	
				var params = {
					"email" 	: email,
					"pwd" 		: pwd1,
					"state" 	: state,
					"city"  	: city,
					"zipcode" : zip
				};
				loadJson(params, "http://waterbowl.net/mobile/create-user.php", saveUserInfo);				
			}
		}
	} else {
		createSimpleDialog("Error","All fields are required");
		enableAllButtons();
	}
}

//================================================================================
//		Name: 			saveUserDetails ()
//		Purpose:  add new user to database
//================================================================================
function saveUserInfo(data) {
	Ti.API.debug( "  .... [~] saveUserInfo :: " + JSON.stringify(data) );
	enableAllButtons();
	
	if (data.status==1)
 		createWindowController( "register2", "", "slide_left" ); 
  else	
    createSimpleDialog("Error", data.message);
	// TODO: 			
	//	$.continueBtn.enabled = false;
	//	$.continueBtn.opacity = 0.3;
}

//
// 				LOGIC FLOW
//
//-----------------------------------------------------------------------
//		(0)		Build user login form
//-----------------------------------------------------------------------

// 		(1)  Add section header
$.scrollView.add( myUiFactory.buildMasterSectionHeader("register_header", "account creation") );

var form_width = mySesh.device.screenwidth - myUiFactory._pad_right - myUiFactory._pad_left;
var title_label = myUiFactory.buildLabel( "Welcome to Waterbowl", form_width, myUiFactory._height_header, myUiFactory._text_large, "#ec3c95","left" );	

var get_started = myUiFactory.buildLabel( "Let's get you set up...", form_width, myUiFactory._height_header, myUiFactory._text_medium, "#000000","left" );
var user_email	= myUiFactory.buildTextField("user_email",   	 form_width,  "email",    "");
var user_pwd_1 	= myUiFactory.buildTextField("user_pwd_1", form_width, "password", true);
var user_pwd_2 	= myUiFactory.buildTextField("user_pwd_2", form_width, "re-enter password", true);
var user_city 	= myUiFactory.buildTextField("user_city",  form_width, "home city", false);

var col_width   = (form_width / 2) - (myUiFactory._pad_left + myUiFactory._pad_right);
var sz_row_view = myUiFactory.buildViewContainer ( "sz_row_view", "horizontal", form_width, myUiFactory._height_row+myUiFactory._pad_top, 0 ); 
var user_state	= myUiFactory.buildTextField("user_state", col_width,  "state", false);
var user_zip		= myUiFactory.buildTextField("user_zip",   Ti.UI.FILL, "zip",   false);
sz_row_view.add( user_state );
sz_row_view.add( myUiFactory.buildSpacer("vert", myUiFactory._pad_left) );
sz_row_view.add( user_zip );

var nextBtn = myUiFactory.buildButton( "nextBtn", "next", "xl" );
nextBtn.addEventListener('click',  function(){ 
	saveUserDetails(user_email.value, user_pwd_1.value, user_pwd_2.value, user_city.value, user_state.value, user_zip.value) 
});


// used later to ensure the user has actually filled in the Mark textarea
//var textarea_hint = 'What does '+ mySesh.dog.name +' want to say about this place?';
//var textArea = myUiFactory.buildTextArea( 'What does '+ mySesh.dog.name +' want to say about this place?' );

$.scrollView.add( myUiFactory.buildSpacer("horz", 30) );
$.scrollView.add( title_label );
$.scrollView.add( myUiFactory.buildSpacer("horz", 10) );
$.scrollView.add( get_started );
$.scrollView.add( user_email );
$.scrollView.add( user_pwd_1 );
$.scrollView.add( user_pwd_2 );
$.scrollView.add( user_city );
$.scrollView.add( sz_row_view );
$.scrollView.add( myUiFactory.buildSpacer("horz", 30) );
$.scrollView.add( nextBtn );

// response from create-account.php =========================================================
// TODO:  should be wrapped inside a User.create() function
/*
var createAccountRequest = Titanium.Network.createHTTPClient();
createAccountRequest.onload = function() {
	var json = this.responseText;
	Ti.API.log("*** create-account.php ***" + json);
	Titanium.API.info(json);
	// debug message
	var response = JSON.parse(json);

	if (response.logged == 1) {
		$.email.value     = '';
		$.password1.value = '';
		$.password2.value = '';
	
    createWindowController( "registerpetinfo", "", "slide_left" ); 
	} 
	else {
		createSimpleDialog("Cannot create account", response.message);
	}
	// regardless of success or error, reactivate Submit button
	$.continueBtn.enabled = true;
	$.continueBtn.opacity = 1;
};
*/

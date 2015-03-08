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
//		Name: 		saveUserToDb ()
//		Purpose:  add new user to database
//================================================================================
function saveUserToDb(email, pwd1, pwd2, city, state, zip) {
	disableAllButtons();
	if (pwd1!='' && pwd2!='' && email!='' && city!='' && zip!='' && state!='') {
		if (pwd1 != pwd2) {
			createSimpleDialog("Passwords do not match","Please handle that and try again");
		} else if ( !isValidZip( zip ) ) {
			createSimpleDialog("Zipcode error","Please enter a valid zip code");
		} else {
			if ( !checkemail(email) ) {
				createSimpleDialog("Email error","Please enter a valid email");
			}	else {
				// clear all saved session data on client, it's gametime now
				mySesh.clearSavedDogInfo();
	 			mySesh.clearSavedUserInfo();
				// do save new user's provided email, even though the db call could fail
				mySesh.user.email = email;
				// prep the payload for login script
				var params = {
					"email" 	: email,
					"pwd" 		: pwd1,
					"state" 	: state,
					"city"  	: city,
					"zipcode" : zip
				};
				loadJson(params, "http://waterbowl.net/mobile/create-user.php", saveUserInfoLocally);				
			}
		}
	} else {
		createSimpleDialog("Error","All fields are required");
		enableAllButtons();
	}
}

//================================================================================
//		Name: 		saveUserInfoLocally ()
//		Purpose:  	save user info locally after successful new user db insert
//================================================================================
function saveUserInfoLocally(data) {
	Ti.API.debug( "  .... [~] saveUserInfoLocally :: " + JSON.stringify(data) );
	enableAllButtons();
	
	if (data.status==1) {
		mySesh.user.owner_ID = data.owner_ID;
		Ti.API.debug( "  >>> saveUserInfoLocally :: "+data.email);
		// Ti.App.Properties.setString('email', mySesh.user.email);
		// Ti.App.Properties.setString('password', '');
		createWindowController( "register2", "", "slide_left" ); 
 	}
  else {
  	// clear presaved user email
  	createSimpleDialog("Error", data.message);
  }
}

//
// 				LOGIC FLOW
//
//-----------------------------------------------------------------------
//		(0)		Build user login form
//-----------------------------------------------------------------------

// 		(1)  Add section header
$.scrollView.add( myUi.buildMasterSectionHeader("register_header", "account creation") );

var form_width = myUi._form_width;
												//		title, width, height, font_style, font_color, bg_color, text_align, horz_pad)
var title_label = myUi.buildLabel( "Welcome to Waterbowl", form_width, myUi._height_header, myUi._text_large, "#ec3c95", myUi._color_ltblue, "left",  0);	

var get_started = myUi.buildLabel( "Let's get you set up...", form_width, myUi._height_header, myUi._text_medium, "#000000", myUi._color_ltblue, "left", 0 );
var user_email	= myUi.buildTextField("user_email", form_width,  "email address",    "");
var user_pwd_1 	= myUi.buildTextField("user_pwd_1", form_width, "password", true);
var user_pwd_2 	= myUi.buildTextField("user_pwd_2", form_width, "re-enter password", true);
var user_city 	= myUi.buildTextField("user_city",  form_width, "home city", false);

var col_width   = (form_width / 2) - (myUi._pad_left + myUi._pad_right);
var sz_row_view = myUi.buildViewContainer ( "sz_row_view", "horizontal", form_width, myUi._height_row+myUi._pad_top, 0 ); 
var user_state	= myUi.buildTextField("user_state", col_width,  "state", false);
var user_zip		= myUi.buildTextField("user_zip",   Ti.UI.FILL, "zip",   false);
sz_row_view.add( user_state );
sz_row_view.add( myUi.buildSpacer("vert", myUi._pad_left) );
sz_row_view.add( user_zip );

var nextBtn = myUi.buildButton( "nextBtn", "next", "xl" );
nextBtn.addEventListener('click',  function(){ 
	saveUserToDb(user_email.value, user_pwd_1.value, user_pwd_2.value, user_city.value, user_state.value, user_zip.value) 
});


user_state.addEventListener('focus', function(e) {
	var necessary_args = {
		_dog_name  : "",
		_type    	 : "state",
		_index_val : ""
	};
	// this.blur();
	createWindowController( "uipicker", necessary_args, "slide_left" );
});
var fwd_state_pick_btn = Titanium.UI.createButton({
	backgroundImage		: ICON_PATH + 'caret.png',
	width				: myUi._icon_small,
	height				: myUi._icon_small
});
user_state.rightButton = fwd_state_pick_btn;


$.scrollView.add( myUi.buildSpacer("horz", 30) );
$.scrollView.add( title_label );
$.scrollView.add( myUi.buildSpacer("horz", 10) );
$.scrollView.add( get_started );
$.scrollView.add( user_email );
$.scrollView.add( user_pwd_1 );
$.scrollView.add( user_pwd_2 );
$.scrollView.add( user_city );
$.scrollView.add( sz_row_view );


$.scrollView.add( myUi.buildSpacer("horz", 30) );
$.scrollView.add(nextBtn);

/*
	// regardless of success or error, reactivate Submit button
	$.continueBtn.enabled = true;
	$.continueBtn.backgroundColor = "#cccccc";
	$.continueBtn.opacity = 1;
*/

$.register.addEventListener('focus',function(e){
	if ( mySesh.user.state!="" ) {
		user_state.value = mySesh.user.state; 
	}
});
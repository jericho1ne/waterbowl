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
				// save user's provided email, even though the db call could fail
				Ti.App.Properties.setString('user', email);
				Ti.App.Properties.setString('pass', null);
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
//		Name: 			saveUserInfoLocally ()
//		Purpose:  add new user to database
//================================================================================
function saveUserInfoLocally(data) {
	Ti.API.debug( "  .... [~] saveUserInfoLocally :: " + JSON.stringify(data) );
	enableAllButtons();
	
	if (data.status==1) {
		mySesh.user.owner_ID = data.owner_ID;
		
		Ti.API.debug( "  >>> Ti.App.Properties.setString('user') :: "+data.email);
		// Ti.App.Properties.setString('pass', data.pwd);
		/* var params = {
			"_owner_ID" 	: data.owner_ID,
		}; */
 		createWindowController( "register2", "", "slide_left" ); 
 	}
  else {
  	// clear presaved user email
  	Ti.App.Properties.setString('user', data.email);
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
$.scrollView.add( myUiFactory.buildMasterSectionHeader("register_header", "account creation") );

var form_width = myUiFactory._form_width;
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
var fwd_state_pick_btn =  Titanium.UI.createButton({
	backgroundImage	: ICON_PATH + 'caret.png',
	width						: myUiFactory._icon_small,
	height					: myUiFactory._icon_small
});
user_state.add( fwd_state_pick_btn );


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
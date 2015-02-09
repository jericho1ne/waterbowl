
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
//		Name: 			registerNewUser(e)
//		Purpose:  add new user to database
//================================================================================
function checkUserDetails( ) {
	if ($.password1.value != '' && $.password2.value != '' && $.email.value != '') {
		if ($.password1.value != $.password2.value) {
			createSimpleDialog("Passwords do not match","Please handle that and try again");
		} else {
			if (!checkemail($.email.value)) {
				createSimpleDialog("Email error","Please enter a valid email");
			}
			else {
				// TODO:  save dog info here locally

        createWindowController( "registerpetinfo", "", "slide_left" ); 
        				
				// TODO:  move this AJAX portion registerNewUser to final confirmation page
				/*
				$.continueBtn.enabled = false;
				$.continueBtn.opacity = 0.3;
				createAccountRequest.open("POST", "http://www.waterbowl.net/mobile/create-account.php");
				var params = {
					pwd 	: $.password1.value,
					email : $.email.value,
					lat		: mySesh.geo.lat,
					lon		: mySesh.geo.lon
				};
				createAccountRequest.send(params);
				*/
			}
		}
	} else {
		createSimpleDialog("Error","All fields are required");
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

var form_width = mySesh.device.screenwidth - myUiFactory._pad_right - myUiFactory._pad_left;
var title_label = myUiFactory.buildLabel( "Welcome to Waterbowl", form_width, myUiFactory._height_header, myUiFactory._text_large, "#ec3c95","left" );	


var get_started = myUiFactory.buildLabel( "Let's get you set up...", form_width, myUiFactory._height_header, myUiFactory._text_medium, "#000000","left" );
var user_email	= myUiFactory.buildTextField("email",   	 form_width,  "email",    "");
var user_pwd_1 	= myUiFactory.buildTextField("user_pwd_1", form_width, "password", true);
var user_pwd_2 	= myUiFactory.buildTextField("user_pwd_2", form_width, "re-enter password", true);
var home_city 	= myUiFactory.buildTextField("home_city",  form_width, "home city", false);

var col_width   = (form_width / 2) - (myUiFactory._pad_left + myUiFactory._pad_right);
var sz_row_view = myUiFactory.buildViewContainer ( "sz_row_view", "horizontal", form_width, myUiFactory._height_row+myUiFactory._pad_top, 0 ); 
var state				= myUiFactory.buildTextField("state", col_width, "state", false);
var zip					= myUiFactory.buildTextField("zip", Ti.UI.FILL, "zip", false);
sz_row_view.add(state);
sz_row_view.add( myUiFactory.buildSpacer("vert", myUiFactory._pad_left) );
sz_row_view.add(zip);

var nextBtn = myUiFactory.buildButton( "nextBtn", "next", "xl" );
nextBtn.addEventListener('click', function(e) {
	//alert( JSON.stringify(e) );
	createWindowController("register2","","slide_left");
});	

// used later to ensure the user has actually filled in the Mark textarea
//var textarea_hint = 'What does '+ mySesh.dog.name +' want to say about this place?';
//var textArea = myUiFactory.buildTextArea( 'What does '+ mySesh.dog.name +' want to say about this place?' );

$.scrollView.add( myUiFactory.buildSpacer("horz", 30) );
$.scrollView.add(title_label);
$.scrollView.add( myUiFactory.buildSpacer("horz", 10) );
$.scrollView.add(get_started);
$.scrollView.add(user_email);
$.scrollView.add(user_pwd_1);
$.scrollView.add(user_pwd_2);
$.scrollView.add(home_city);
$.scrollView.add(sz_row_view);
$.scrollView.add( myUiFactory.buildSpacer("horz", 30) );
$.scrollView.add( nextBtn );



// response from create-account.php =========================================================
// TODO:  should be wrapped inside a User.create() function
var createAccountRequest = Titanium.Network.createHTTPClient();
//================================================================================
//		Name: createAccountRequest.onload
//		Purpose:  error check user input
//================================================================================
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
		
		/* 		--- EVERYTHING IS KOSHER, LET USER UPLOAD PHOTO NOW   ----- */
    createWindowController( "registerpetinfo", "", "slide_left" ); 
	} 
	else {
		createSimpleDialog("Cannot create account", response.message);
	}
	// regardless of success or error, reactivate Submit button
	$.continueBtn.enabled = true;
	$.continueBtn.opacity = 1;
};
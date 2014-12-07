
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
					lat		: MYSESSION.geo.lat,
					lon		: MYSESSION.geo.lon
				};
				createAccountRequest.send(params);
				*/
			}
		}
	} else {
		createSimpleDialog("Error","All fields are required");
	}
}


//===========================================================================================
// 				LOGIC FLOW
//-----------------------------------------------------------------------
//
//		(0)		Add window to global stack, display menubar
//
//-----------------------------------------------------------------------

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
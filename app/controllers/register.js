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

// response from create-account.php =========================================================
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
		var alertDialog = Titanium.UI.createAlertDialog({
			title : 'Done!',
			message : response.message,
			buttonNames : ['OK']
		});
		alertDialog.show();

		$.email.value = '';
		$.password1.value = '';
		$.password2.value = '';
	} 
	else {
		var error = Titanium.UI.createAlertDialog({
			title : "Cannot create account",
			message : response.message
		});
		error.show();
	}
	// regardless of success or error, reactivate Submit button
	$.continueBtn.enabled = true;
	$.continueBtn.opacity = 1;
};

//================================================================================
//		Name: 			registerNewUser(e)
//		Purpose:  add new user to database
//================================================================================
function registerNewUser(e) {
	if ($.password1.value != '' && $.password2.value != '' && $.email.value != '') {
		if ($.password1.value != $.password2.value) {
			var error = Titanium.UI.createAlertDialog({
				title : "Passwords do not match",
				message : "Please handle that and try again"
			});
			error.show();
		} else {
			if (!checkemail($.email.value)) {
				var error = Titanium.UI.createAlertDialog({
					title : "Email error",
					message : "Please enter a valid email"
				});
				error.show();
			} else {
				$.continueBtn.enabled = false;
				$.continueBtn.opacity = 0.3;
				//createAccountRequest.open("POST","http://192.168.1.1/mobile/create-account.php")
				createAccountRequest.open("POST", "http://www.waterbowl.net/mobile/create-account.php");
				var params = {
					pwd 	: $.password1.value,
					email : $.email.value
				};
				createAccountRequest.send(params);
			}
		}
	} else {
		var error = Titanium.UI.createAlertDialog({
			title : "Eror",
			message : "All fields are required"
		});
		error.show();
	}
}

function goToNextPage() {
	var new_window = Alloy.createController( "photoupload" ).getView();
	new_window.open();
}
//========================================================================================
sessionVars.windowStack.push( $.register );
Ti.API.info ( "localStack size: " + JSON.stringify( sessionVars.windowStack.length ) );

addToAppWindowStack( $.register, "register" );

$.backBtn.addEventListener('click', function() {
	var currentWindow = sessionVars.windowStack.pop();
	Ti.API.info ( JSON.stringify( "currentWindow:"+currentWindow ) );
	currentWindow.close( { 
		top: 0, opacity: 0.01, duration: 200, 
		curve : Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT
	} );
	currentWindow = null;
});

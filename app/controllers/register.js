
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

//===========================================================================================
// 				LOGIC FLOW
//-----------------------------------------------------------------------
//
//		(0)		Add window to global stack, display menubar
//
//-----------------------------------------------------------------------
addToAppWindowStack( $.register, "register" );
addMenubar( $.menubar );
/*	<ScrollView registerScrollView class="fill_width bg_lt_blue">
			<Label class="form_label top_20">email</Label>
			<TextField id="email"></TextField>
		
			<Label class="form_label top_20">password</Label>
			<TextField id="password1"></TextField>
			<TextField id="password2" class="top_10"></TextField>
			
			<Button id="continueBtn" class="btn_large top_20 bg_dk_gray" onClick="goToNextPage">continue</Button>
			
	 	</ScrollView> */
	 	/*
var registerScrollView = Ti.UI.createScrollView ( {id: "registerScrollView", width: "100%", contentHeight: "auto" } );
var emailLabel				 = Ti.UI.createLabel ( {id: "emailLabel", width: "100%", contentHeight: "auto" } );
var	emailTextField		 = Ti.UI.createTextField 
$.addClass ( registerScrollView, "fill_height bg_lt_blue" );
$.addClass ( emailLabel, "form_label top_20" );

var outerMapContainer = Ti.UI.createView ( { id: "outerMapContainer", width: "100%", height:"50%", contentHeight: "auto" } );
var innerMapContainer = Ti.UI.createView ( { id: "innerMapContainer", width: "100%", contentHeight: "auto" } );
$.addClass ( innerMapContainer, "fill_height" );

outerMapContainer.add ( innerMapContainer );
$.map.add( outerMapContainer );
placeListContainer.add( placeList );
$.map.add( placeListContainer );
	*/

function displayDogHeader(dog) {
	var dog_info 		= dog.sex+" / "+dog.weight+" lbs / "+dog.age+" yrs old";
	var breeds_comp = dog.breed + (dog.breed_2!="" ? " + "+dog.breed_2 : "");
	var form_width 	= mySesh.device.screenwidth - myUi._pad_right - myUi._pad_left;


	var welcome_msg = "Thanks for joining the Waterbowl community!  Log in and connect with other dog owners!";

	$.scrollView.add( myUi.buildPageHeader(dog.ID, "profile", dog.name, dog_info, breeds_comp, "" ) );

	$.scrollView.add( myUi.buildSpacer("horz", 30) );
	$.scrollView.add( myUi.buildLabel( "Account created!", myUi.form_width, Ti.UI.SIZE, myUi._text_large, "#ec3c95", myUi._color_ltblue, "left" ) );	
	$.scrollView.add( myUi.buildSpacer("horz", 10) );
	$.scrollView.add( myUi.buildLabel( welcome_msg, myUi.form_width, Ti.UI.SIZE, myUi._text_medium, "#000000", myUi._color_ltblue, "left" ) );
	$.scrollView.add( myUi.buildSpacer("horz", 30) );
	
	var proceedBtn = myUi.buildButton( "proceedBtn", "proceed", "xxl" );
	
	proceedBtn.addEventListener('click',  function(){ 
		closeWindowController(0);
		closeWindowController(0);
		closeWindowController(0);
		closeWindowController(0);
	});
	$.scrollView.add(proceedBtn);	
}


//---------------------------------------------------------------------------------------------------
var params = {
	dog_ID : mySesh.dog.dog_ID
}

loadJson ( params, "http://waterbowl.net/mobile/get-dog-profile.php", displayDogHeader );
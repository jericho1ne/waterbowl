function displayDogHeader(dog) {
	var dog_info 		= dog.sex+" / "+dog.weight+" lbs / "+dog.age+" yrs old";
	var breeds_comp = dog.breed + (dog.breed_2!="" ? " + "+dog.breed_2 : "");
	var form_width 	= mySesh.device.screenwidth - myUiFactory._pad_right - myUiFactory._pad_left;


	var welcome_msg = "Thanks for joining the Waterbowl community!  Log in and connect with other dog owners!";

	$.scrollView.add( myUiFactory.buildPageHeader(dog.ID, "profile", dog.name, dog_info, breeds_comp, "" ) );

	$.scrollView.add( myUiFactory.buildSpacer("horz", 30) );
	$.scrollView.add( myUiFactory.buildLabel( "Account created!", myUiFactory.form_width, Ti.UI.SIZE, myUiFactory._text_large, "#ec3c95", myUiFactory._color_ltblue, "left" ) );	
	$.scrollView.add( myUiFactory.buildSpacer("horz", 10) );
	$.scrollView.add( myUiFactory.buildLabel( welcome_msg, myUiFactory.form_width, Ti.UI.SIZE, myUiFactory._text_medium, "#000000", myUiFactory._color_ltblue, "left" ) );
	$.scrollView.add( myUiFactory.buildSpacer("horz", 30) );
	
	var proceedBtn = myUiFactory.buildButton( "proceedBtn", "proceed", "xxl" );
	
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
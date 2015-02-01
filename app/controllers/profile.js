Ti.API.debug( " >>> Dog Array - Profile ::  "+ JSON.stringify( mySesh.dog ) );


//  $.user_email.text = mySesh.user.email;
 

// predefined placeholder values until we hit the backend
//var mark_title 	 = "Loading mark title...";			// mark.title
//var mark_text 	 = "Loading mark text...";	// mark.text
//var mark_subtext = "";							// mark.

var dog_info = mySesh.dog.sex+" / "+mySesh.dog.breed+" / "+mySesh.dog.age+" yrs old";
$.scrollview.add( myUiFactory.buildPageHeader(mySesh.dog.dog_ID, "profile", mySesh.dog.name, dog_info, "---") );

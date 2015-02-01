Ti.API.debug( " >>> Dog Array - Profile ::  "+ JSON.stringify( mySesh.dog ) );


//  $.user_email.text = mySesh.user.email;
 

// predefined placeholder values until we hit the backend
//var mark_title 	 = "Loading mark title...";			// mark.title
//var mark_text 	 = "Loading mark text...";	// mark.text
//var mark_subtext = "";							// mark.

$.scrollview.add( myUiFactory.buildPageHeader(mySesh.dog.dog_ID, "profile", mySesh.dog.name, mySesh.dog.breed, mySesh.dog.sex) );

/*
setInterval (function(){
  refreshGlobalValues();
}, 2000);		
*/


//------------------------------------------------------------------------------------------------------
//  This scrollView contains the following top level elements, all dynamically filled in by controller
//	  (0)		headerContainer / miniHeaderContainer
//	  (1)		activityContainer
//					|
//					+-- checkinContainer
//					|
//					+-- estimateContainer
//		(2)		marksContainer
//		(3)		poiDetailContainer
//------------------------------------------------------------------------------------------------------
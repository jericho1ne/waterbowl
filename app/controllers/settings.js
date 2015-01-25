Ti.API.debug( " >>> Dog Array (in Settings):  "+ JSON.stringify( mySesh.dog ) );

if ( isset(mySesh.dog.name) )
  $.dog_name.text   = mySesh.dog.dog_ID;

if ( isset(mySesh.dog.photo) ) 
  $.dog_photo.text  = mySesh.dog.photo;

if ( isset(mySesh.user.email) )
  $.user_email.text = mySesh.user.email;

// 

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
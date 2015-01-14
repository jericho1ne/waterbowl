Ti.API.debug( " >>> Dog Array (in Settings):  "+ JSON.stringify( MYSESSION.dog ) );

if ( isset(MYSESSION.dog.name) )
  $.dog_name.text   = MYSESSION.dog.dog_ID;

if ( isset(MYSESSION.dog.photo) ) 
  $.dog_photo.text  = MYSESSION.dog.photo;

if ( isset(MYSESSION.user.email) )
  $.user_email.text = MYSESSION.user.email;

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
Ti.API.debug( " >>> Dog Array (in Settings):  "+ JSON.stringify( MYSESSION.dog ) );

if ( isset(MYSESSION.dog.name) )
  $.dog_name.text   = MYSESSION.dog.dog_ID;

if ( isset(MYSESSION.dog.photo) ) 
  $.dog_photo.text  = MYSESSION.dog.photo;

if ( isset(MYSESSION.user.email) )
  $.user_email.text = MYSESSION.user.email;



/*
setInterval (function(){
  refreshGlobalValues();
}, 2000);

*/
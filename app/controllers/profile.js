//================================================================================
//		Name:			displayBasicDogInfo( dogInfo, parent_view )
//		Purpose:	
//================================================================================
function displayDogProfile(dog) {
	Ti.API.debug("....[~] displayDogProfile :: "+JSON.stringify(dog) );
	
	//	alert(dog[0].name);
	var dog_info = dog.sex+" / "+dog.weight+" lbs / "+dog.age+" yrs old";
	$.scrollview.add( myUiFactory.buildPageHeader(dog.ID, "profile", dog.name, dog_info, dog.breed ) );
	/*
	var category_icon = ICON_PATH + dogInfo.icon_basic;
	var rating_df = ICON_PATH + "POI-basic-dogfriendliness.png";
	var rating_wb = ICON_PATH + "POI-basic-ratingwb.png";
	parent.add(  myUiFactory.buildInfoBar(category_icon, dogInfo.type, "") );
	parent.add( myUiFactory.buildSeparator() );
	parent.add(  myUiFactory.buildInfoBar(rating_df, "Dog friendliness", dogInfo.rating_dogfriendly+"/5") );
	parent.add( myUiFactory.buildSeparator() );
	parent.add(  myUiFactory.buildInfoBar(rating_wb, "Rating", dogInfo.rating_dogfriendly+"/5") );
	*/
	//-----------------------------------------------------------------------------------------------------------
	//			BASIC INFO
	//-----------------------------------------------------------------------------------------------------------
	var basics_header = myUiFactory.buildSectionHeader("basics_header", "BASIC INFO", 1);
	$.scrollview.add(basics_header);
}

//---------------------------------------------------------------------------------------------------------------
var args = arguments[0] || {};
Ti.API.debug( " >>>  Viewing Profile for [ "+args.dog_ID+" ] :: My Dog's ID [ "+mySesh.dog_ID +" ]" );

var params = {
	dog_ID : args.dog_ID
}
loadJson ( params, "http://waterbowl.net/mobile/get-dog-profile.php", displayDogProfile )


//displayBasicDogInfo(dogInfo, $.scrollview);
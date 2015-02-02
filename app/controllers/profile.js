//================================================================================
//		Name:			displayBasicDogInfo( dogInfo, parent_view )
//		Purpose:	
//================================================================================
function displayBasicInfo(poiInfo, parent) {
	Ti.API.debug("....[~] displayBasicInfo("+dogInfo.place_ID+") called ");
	
	var category_icon = ICON_PATH + dogInfo.icon_basic;
	var rating_df = ICON_PATH + "POI-basic-dogfriendliness.png";
	var rating_wb = ICON_PATH + "POI-basic-ratingwb.png";
	parent.add(  myUiFactory.buildInfoBar(category_icon, dogInfo.type, "") );
	parent.add( myUiFactory.buildSeparator() );
	parent.add(  myUiFactory.buildInfoBar(rating_df, "Dog friendliness", dogInfo.rating_dogfriendly+"/5") );
	parent.add( myUiFactory.buildSeparator() );
	parent.add(  myUiFactory.buildInfoBar(rating_wb, "Rating", dogInfo.rating_dogfriendly+"/5") );
}

//---------------------------------------------------------------------------------------------------------------
var args = arguments[0] || {};
Ti.API.debug( " >>> Dog Array - Profile ::  "+ JSON.stringify( mySesh.dog ) );

var dog_info = mySesh.dog.sex+" / "+mySesh.dog.breed+" / "+mySesh.dog.age+" yrs old";
$.scrollview.add( myUiFactory.buildPageHeader(mySesh.dog.dog_ID, "profile", mySesh.dog.name, dog_info, "---") );

//-----------------------------------------------------------------------------------------------------------
//			BASIC INFO
//-----------------------------------------------------------------------------------------------------------
var basics_header = myUiFactory.buildSectionHeader("basics_header", "BASIC INFO", 1);
$.scrollview.add(basics_header);
//displayBasicDogInfo(dogInfo, $.scrollview);
//================================================================================
//		Name:			displayBasicDogInfo( dogInfo, parent_view )
//		Purpose:	
//================================================================================
function displayDogProfile(dog) {
	Ti.API.debug("....[~] displayDogProfile :: "+JSON.stringify(dog) );
	
	//	alert(dog[0].name);
	var dog_info = dog.sex+" / "+dog.weight+" lbs / "+dog.age+" yrs old";
	$.scrollView.add( myUiFactory.buildPageHeader(dog.ID, "profile", dog.name, dog_info, dog.breed ) );
	
	
	//-----------------------------------------------------------------------------------------------------------
	//			BASIC INFO
	//-----------------------------------------------------------------------------------------------------------
	$.scrollView.add(myUiFactory.buildSectionHeader("basics_header", "BASIC INFO", 1));
	//var category_icon = ICON_PATH + dogInfo.icon_basic;
	var icon_home = ICON_PATH + "icon-dog-homecity.png";
	var icon_hf		= ICON_PATH + "icon-dog-basic-humanfriendliness.png";
	var icon_df		= ICON_PATH +	"icon-dog-basic-dogfriendliness.png";
	var icon_bone = ICON_PATH + "POI-basic-ratingwb.png";
	var icon_help = ICON_PATH + "icon-dog-basic-helpfulness.png";
	
	$.scrollView.add(  myUiFactory.buildInfoBar(icon_home, "City", dog.city) );
	$.scrollView.add( myUiFactory.buildSeparator() );

	$.scrollView.add(  myUiFactory.buildInfoBar(icon_help, "Helpfulness", dog.helpfulness+"/5") );
	$.scrollView.add( myUiFactory.buildSeparator() );
	
	$.scrollView.add(  myUiFactory.buildInfoBar(icon_df, "Dog Friendliness", dog.dog_friendliness_ownerans+"/5") );
	$.scrollView.add( myUiFactory.buildSeparator() );
	
	$.scrollView.add(  myUiFactory.buildInfoBar(icon_hf, "Human Friendliness", dog.human_friendliness_ownerans+"/5") );
	$.scrollView.add( myUiFactory.buildSeparator() );
	
	$.scrollView.add(  myUiFactory.buildInfoBar(icon_bone, "Energy Level", dog.energy_level_ownerans+"/5") );
	
	
	//-----------------------------------------------------------------------------------------------------------
	//			INTRODUCTION
	//-----------------------------------------------------------------------------------------------------------
	$.scrollView.add(myUiFactory.buildSectionHeader("intro_header", "INTRODUCTION", 1));
	var icon_intro = ICON_PATH + "icon-dog-intro.png";
	$.scrollView.add(  myUiFactory.buildInfoBar(icon_intro, dog.intro, "") );
	$.scrollView.add( myUiFactory.buildSeparator() );
}

//---------------------------------------------------------------------------------------------------------------
var args = arguments[0] || {};
Ti.API.debug( " >>>  Viewing Profile for [ "+args.dog_ID+" ] :: My Dog's ID [ "+mySesh.dog_ID +" ]" );

var params = {
	dog_ID : args.dog_ID
}
loadJson ( params, "http://waterbowl.net/mobile/get-dog-profile.php", displayDogProfile )

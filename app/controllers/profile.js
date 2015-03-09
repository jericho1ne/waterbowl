//================================================================================
//		Name:			displayBasicDogInfo( dogInfo, parent_view )
//		Purpose:	
//================================================================================
function displayDogProfile(dog) {
	//-------------------------------------------------------------------------
	//			PREPARE ICONS
	//-------------------------------------------------------------------------
	//var category_icon = ICON_PATH + dogInfo.icon_basic;
	var icon_home 	= ICON_PATH + "dog-basic-homecity.png";
	var icon_hf		= ICON_PATH + "dog-basic-humanfriendliness.png";
	var icon_df		= ICON_PATH + "dog-basic-dogfriendliness.png";
	var icon_bone 	= ICON_PATH + "basic-ratingwb.png";
	var icon_energy = ICON_PATH + "dog-basic-energy.png";
	var icon_help 	= ICON_PATH + "dog-basic-helpfulness.png";
	//-------------------------------------------------------------------------
	//			PROFILE STAT BAR
	//-------------------------------------------------------------------------
	var statBar = [
		{	
			"icon"	: icon_df,
			"amount": dog.dog_friendliness_ownerans
		},
		{	
			"icon"	: icon_hf,
			"amount": dog.human_friendliness_ownerans
		},
		{	
			"icon"	: icon_help,
			"amount": dog.helpfulness
		}
	];	

	var dog_info = dog.sex+" / "+dog.weight+" lbs / "+dog.age+" yrs old";
	var breeds_comp = dog.breed + (dog.breed_2!="" ? " + "+dog.breed_2 : "");
	$.scrollView.add( myUi.buildPageHeader(dog.ID, "profile", dog.name, dog_info, breeds_comp, "", statBar ) );
	
	//-----------------------------------------------------------------------------------------------------------
	//			BASIC INFO
	//-----------------------------------------------------------------------------------------------------------
	$.scrollView.add(myUi.buildSectionHeader("basics_header", "BASIC INFO", 1));
	
	$.scrollView.add( myUi.buildSingleRowInfoBar(icon_home, "Home City:", dog.city) );
	$.scrollView.add( myUi.buildSeparator() );

	$.scrollView.add( myUi.buildSingleRowInfoBar(icon_df, "Dog-Friendliness:", dog.dog_friendliness_ownerans+"/5") );
	$.scrollView.add( myUi.buildSeparator() );
	
	$.scrollView.add( myUi.buildSingleRowInfoBar(icon_hf, "Human-Friendliness:", dog.human_friendliness_ownerans+"/5") );
	$.scrollView.add( myUi.buildSeparator() );
	
	$.scrollView.add( myUi.buildSingleRowInfoBar(icon_energy, "Energy Level:", dog.energy_level_ownerans) );
	$.scrollView.add( myUi.buildSeparator() );

	$.scrollView.add( myUi.buildSingleRowInfoBar(icon_help, "Helpfulness:", dog.helpfulness) );
	//$.scrollView.add( myUi.buildSeparator() );
	
	//-----------------------------------------------------------------------------------------------------------
	//			INTRODUCTION
	//-----------------------------------------------------------------------------------------------------------
	if( dog.intro.trim()!="" ) {
		$.scrollView.add(myUi.buildSectionHeader("intro_header", "INTRODUCTION", 1));
		var icon_intro = ICON_PATH + "dog-intro.png";
		$.scrollView.add( myUi.buildMultiRowInfoBar(icon_intro, dog.intro) );
		//$.scrollView.add( myUi.buildSeparator() );
	}
	//-----------------------------------------------------------------------------------------------------------
	//			FAVORITES
	//-----------------------------------------------------------------------------------------------------------
	showFavorites(dog, $.scrollView );
	
	//-----------------------------------------------------------------------------------------------------------
	//			INTERESTED IN
	//-----------------------------------------------------------------------------------------------------------
	showInterests(dog, $.scrollView );
}

//================================================================================
//		Name:			showInterests(dog, parentObject)
//		Purpose:	
//================================================================================
function showInterests(dog, parentObject) {
	var interests = { 
		"Buddies (Playdates)"	: dog.interested_in_buddies,
    "Walking Group"				: dog.interested_in_buddies_walk,
    "Sitter"							: dog.interested_in_sitter,
    "Walker"							: dog.interested_in_walker,
    "Trainer"							: dog.interested_in_trainer,
    "Groomer"							: dog.interested_in_groomer,
    "Veterinarian"				: dog.interested_in_vet
	};
	var interests_list = myUi.buildViewContainer("interests_list", "vertical", "100%", Ti.UI.SIZE, 0);
	var icon_url = ""; 
	
	var count = 0;
	var length = interests.length;
  for (var k in interests){
    if(interests[k]!="" && interests[k]!="NULL" && interests[k]!=0) {
    	icon_url = ICON_PATH + "poi-feature-waterbowl.png";
    	
    	if (k == "Buddies (Playdates)")	icon_url = ICON_PATH + "dog-interest-buddy.png";
    	else if(k == "Groomer")			icon_url = ICON_PATH + "dog-interest-groomer.png";
    	else if(k == "Walking Group")	icon_url = ICON_PATH + "dog-interest-groupwalk.png";
    	else if(k == "Sitter")			icon_url = ICON_PATH + "dog-interest-sitter.png";
    	else if(k == "Veterinarian")	icon_url = ICON_PATH + "dog-interest-vet.png";
    	
 			interests_list.add(  myUi.buildSingleRowInfoBar(icon_url, k, "") );
			interests_list.add( myUi.buildSeparator() );
			count ++;
    }
	}
	if (count > 0) {
		parentObject.add(myUi.buildSectionHeader("interests_header", "INTERESTED IN", 1));
		parentObject.add( interests_list );  	
	}
}

//================================================================================
//		Name:			showFavorites(dog, parentObject)
//		Purpose:	
//================================================================================
function showFavorites(dog, parentObject) {
	var favorites = [ 
		dog.favorite_general_1,
	    dog.favorite_general_2,
	    dog.favorite_general_3,
	    dog.favorite_general_4,
	    dog.favorite_general_5,
	    dog.favorite_general_6, 
	    dog.favorite_general_7,
	    dog.favorite_general_8,
		dog.favorite_general_9,
		dog.favorite_general_10
	];
	//var interests_list = myUi.buildViewContainer("interests_list", "vertical", "100%", Ti.UI.SIZE, 0);
	var icon_url = ICON_PATH + "dog-favorites-general.png";
	var faves_text = "";
	for (var i=0, len=favorites.length; i<len; i++) {
		if(favorites[i]!="" && favorites[i]!="NULL") 
			faves_text += favorites[i]+", ";
	}
	faves_text = faves_text.substring(0, faves_text.length - 2);		// delete last space and comma
	
	if (faves_text.trim() != "") {	
		parentObject.add(myUi.buildSectionHeader("faves_header", "FAVORITES", 1));
		parentObject.add(  myUi.buildMultiRowInfoBar(icon_url, faves_text, "")  );  	
	}
}



//---------------------------------------------------------------------------------------------------------------

var args = arguments[0] || {};
//Ti.API.debug( " >>>  Viewing Profile for [ "+args.dog_ID+" ] :: My Dog's ID [ "+mySesh.dog_ID +" ]" );

var params = {
	dog_ID : args.dog_ID
}
loadJson ( params, "http://waterbowl.net/mobile/get-dog-profile.php", displayDogProfile );



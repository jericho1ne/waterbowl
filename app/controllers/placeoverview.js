/*************************************************************************
						placeoverview.js  				
*************************************************************************/
//	Waterbowl App	
//	
//	Created by Mihai Peteu Oct 2014
//	(c) 2015 waterbowl
//

/*

poiInfo {													poiFeatures {
    "place_ID"			: "601000001",							"ID"				: "11",
    "name"				: "Oberreider Park",					"poi_ID"			: "601000001",
    "geofence_radius"	: 0.0123106,							"size"				: "Medium",
    "category"			: "601",								"terrain"			: "Woodchips",
    "price_range"		: "",									"grade"				: "Flat",
    "category_type_1"	: "Dog Park",							"water"				: "Yes",
    "category_type_2"	: "",									"shade"				: "Limited",
	"category_type_3"	: "",									"waste"				: "Doggie Pot",
	"rating_wb"			: "4.0",								"offleash"			: "Allowed",
    "rating_dogfriendly": "5.0",								"enclosures"		: "Large Dog Area + Small Dog Area",
    "type"				: "Dog Parks",							"enclosure_count"	: "2",
    "lat"				: "33.971995",							"benches"			: "A few benches",
    "lon"				: "-118.420496",						"fenced"			: "Yes",
    "city"				: "Playa Vista",						"managing_org"		: "",
    "address"			: "Bluff Creek Dr & Seabluff Dr",		"category"			: "601"
    "zip"				: "90094",							}
    "icon"				: "poi-mapmarker-dogpark.png",
    "icon_basic"		: "poi-basic-dogpark.png",
    "icon_color"		: "#986d4f",
    "dist"				: 2.38
}
*/

// getPoiInfo > getPoiDetail > drawEverything

//================================================================================
//		Name:			getRemarks( params )
//		Purpose:		( 1, args._place_ID, mySesh.dog.dog_ID, displayRemarks);
//================================================================================
function getRemarks( params ) {
	Ti.API.debug("  >>> getRemarks params >>> "+ JSON.stringify(params) );
	loadJson(params, "http://waterbowl.net/mobile/get-place-posts.php", displayRemarks);
}

//================================================================================
//		Name:			displayRemarks( data )
//		Purpose:	
//================================================================================
function displayRemarks(data) {
	var remarks = data;
	removeAllChildren($.remarks);	
	
	var marks_header = myUiFactory.buildSectionHeader("marks", "REMARKS", 1);
	$.remarks.add(marks_header); 
	var markBtn = myUiFactory.buildButton( "markBtn", "add remark", "large" );
	$.remarks.add(markBtn);
	
	var necessary_args = {   
		_place_ID    		: args._place_ID,
		_place_name	 		: mySesh.currentPlaceInfo.name,
		_place_city	 		: mySesh.currentPlaceInfo.city,
		_place_bgcolor	: mySesh.currentPlaceInfo.icon_color,
		_place_type  		: 1
	};
	markBtn.addEventListener('click', function(e) {
		createWindowController( "addpost", necessary_args, "slide_left" );
	});
	
	if( remarks.length>0) {
  	// (1)	Need to sort POIs based on proximity
		data.sort(function(a, b) {		// sort by proximity (closest first)
			return (b.ID - a.ID);
		});
		// (2)	Print a list of all the remarks at this POI
    for (var i=0, len=remarks.length; i<len; i++) {
      var photo = PROFILE_PATH + 'dog-'+remarks[i].marking_dog_ID+'-iconmed.jpg';		
      																				// (id, photo_url, photo_caption, time_stamp, description)
		  var mark = myUiFactory.buildFeedRow( remarks[i].marking_dog_ID, myUiFactory._icon_medium, photo, remarks[i].marking_dog_name, remarks[i].time_elapsed, remarks[i].post_text  );
		  $.remarks.add(mark);
		  if ( i < (len-1) )
		   $.remarks.add( myUiFactory.buildSeparator() );
    }
  }
  else {
	  var no_marks_container = myUiFactory.buildViewContainer("", "vertical", "100%", Ti.UI.SIZE, 0);	
		var no_marks_label = myUiFactory.buildLabel( "No remarks yet.  Be the first!", "100%", myUiFactory._height_row+(2*myUiFactory._pad_top), myUiFactory._text_medium, "#000000", "" );	
		no_marks_container.add(no_marks_label);
		$.remarks.add(no_marks_container);
	}
}

//================================================================================
//		Name:			getRecentEstimates()
//		Purpose:	get most recent outdoor park estimates, if any
//================================================================================
function getRecentEstimates() {
	Ti.API.info("*** getRecentEstimates() :: "+JSON.stringify(mySesh.currentPlaceFeatures)+" ] ***");
	//////////////////////		ENCLOSURE ESTIMATES (only if dog park) 	 ////////////////////////////////////
	if (mySesh.currentPlaceFeatures.category==600 || mySesh.currentPlaceFeatures.category==601) {
		var params = {
			place_ID				: mySesh.currentPlaceFeatures.poi_ID, 
			enclosure_count : mySesh.currentPlaceFeatures.enclosure_count
		};
		loadJson(params, "http://waterbowl.net/mobile/get-recent-estimates.php", displayRecentEstimates);	
		//addEstimatesButton();	
	} 
}

//================================================================================
//		Name:			displayRecentEstimates( data )
//		Purpose:	add place estimate modules to Window and fill them in w/ data
//================================================================================
function displayRecentEstimates(data, place_ID) {
	if( data.payload.length>0) {	
	  for (var i=0, len=data.payload.length; i<len; i++) {	
	  	var area_type = "Entire";
	  	if (data.payload[i].size=="Large" || data.payload[i].size=="Small") {
	  		area_type = data.payload[i].size+ " Dog";
	    }
	    // EG: SMALL DOG AREA
	    var dog_size_section_header = myUiFactory.buildSectionHeader("", area_type+" Area", 3);
		  $.estimates.add(dog_size_section_header);
		  
		  // NO RECENT INFO
		  //  var photo_url = mySesh.AWS.url_base+ '/' +mySesh.AWS.bucket_profile+ '/' +data.payload[i].dog_photo;
		  if(data.payload[i].amount==-1) {
		  	// var activity_icon = ICON_PATH + "poi-activity-dogscurrentlyhere.png";
		  	var latest_estimate = myUiFactory.buildSingleRowInfoBar( "", "No recent information", "");
		  }
		  // (photo_icon) 
		  else {
		  	var photo_url = PROFILE_PATH + 'dog-'+data.payload[i].dog_ID+'-iconmed.jpg';		
		  	var latest_estimate = myUiFactory.buildTableRowHeader(data.payload[i].dog_ID, photo_url, data.payload[i].dog_name, data.payload[i].time_elapsed, data.payload[i].amount, ( (data.payload[i].amount==1) ? "dog " : "dogs " )+"here");
		  }
		  $.estimates.add(latest_estimate);
	  }
	}
	else {
	  var nothing_here_container = myUiFactory.buildViewContainer("", "vertical", "100%", Ti.UI.SIZE, 0);	
		var nothing_here = myUiFactory.buildLabel( data.response, "100%", myUiFactory._icon_small+(2*myUiFactory._pad_top), myUiFactory._text_medium, "#000000", "" );	
		nothing_here_container.add(nothing_here);
		$.estimates.add(nothing_here_container);
	}
}

//================================================================================
//		Name:			addEstimatesButton( )
//		Purpose:	LIKE THE TITLE SEZ.  I'M DOING STUFF HERE.
//================================================================================
function addEstimatesButton() {
	//////////		 ONLY ALLOW USER TO PROVIDE ESTIMATE IF CURRENTLY CHECKED IN HERE		 /////////////////////
	if (	mySesh.dog.current_place_ID == args._place_ID ) {
		var estimate_btn = myUiFactory.buildFullRowButton("estimate_btn", "report estimate >"); 
		estimate_btn.addEventListener('click', function(){
		  var necessary_args = {
			  _poiInfo		 : mySesh.currentPlaceInfo,
	   		_poiDetail	 : mySesh.currentPlaceFeatures
	    };
			createWindowController( "provideestimate", necessary_args, "slide_left" );
		});
	}
	// if there are multiple estimates to be seen at this park
	var more_btn = myUiFactory.buildFullRowButton("more_btn", "see history >"); 
	more_btn.addEventListener('click', function(){
		Ti.API.info("...[+] Estimate History button clicked");
		// TODO:  Create gray "see more >" button 
		// 				package estimate info in args._estimates, open if clicked
		var necessary_args = {
			_poiInfo	: mySesh.currentPlaceInfo
		};
		createWindowController( "activityhistory", necessary_args, "slide_left" );
	});
	$.estimates_buttons.add(estimate_btn);
	$.estimates_buttons.add(more_btn);
}

//================================================================================
//		Name:				getPlaceCheckins(place_ID, dog_ID)
//		Purpose:		
//================================================================================
function getPlaceCheckins( place_ID, dog_ID, parent_view ) {
	// Ti.API.info(".... .... getPlaceCheckins [place_ID, dog_ID] ["+ place_ID+", "+dog_ID+"] ");
	var http_query = Ti.Network.createHTTPClient();
	var params = {
		place_ID: place_ID,
		dog_ID	: dog_ID	
	};
	
	http_query.open("POST", "http://waterbowl.net/mobile/get-place-checkins-pdo.php");	
	http_query.send( params );
	http_query.onload = function() {
		var placeJSON = this.responseText;	
		 
		if (placeJSON != "" && placeJSON !="[]") {
	    	var place = JSON.parse( placeJSON );
			/*  use the current checkins to build the activityList  */
	      	displayPlaceCheckins(place, parent_view);
		}
	};
	// return "";	
}

//====================================================================================================
//		Name:				displayPlaceCheckins(data, parentObject)
//		Purpose:		replace full size header w/ smaller version upon downward scroll
//====================================================================================================
function displayPlaceCheckins(data, parentObject) {
	Ti.API.debug(".... [~] displayPlaceCheckins:: ["+ data.checkins.length +"] ");
 	if ( data.you_are_here==1 ) {
    mySesh.dog.current_place_ID = data.checkins.current_place_ID;
  }
  
 	/* got stuff to show!  */
  if( data.checkins.length > 0) {
  	var gray_dog_icon = ICON_PATH + "poi-activity-dogscurrentlyhere.png";
  	var how_many_bar = myUiFactory.buildSingleRowInfoBar( gray_dog_icon, "Members Here Now: ",  data.checkins.length );;
    parentObject.add(how_many_bar);
   
	 	if( data.checkins.length > 4) {
  		// size up parent container so that we can fit two rows, up to 8 thumbnails
  		parentObject.height = (2*myUiFactory._icon_large) + (4*myUiFactory._pad_top) + myUiFactory._icon_medium;  	
  	}
  	else if (data.checkins.length <= 4 ) {
      parentObject.height = (1*myUiFactory._icon_large) + (3*myUiFactory._pad_top) + myUiFactory._icon_medium;
    }
  	
    for (var i=0, len=data.checkins.length; i<len; i++) {		// only calculate array size once
		 	/* only show first 7 elements, leave space for "+ {__} more" cell */
			if (i>=7 && data.checkins.length>8)		
				break;
		  
		  /*  this is my pup, his is checked in at this POI!  Give'im a border!   */
		  var border = 0; 			// this is nobody we know by default (0=other, 1=me, 2=friends)
		  if(data.checkins[i].dog_ID == mySesh.dog.dog_ID)
		  	border = 1;
		  	
		  var dog_image = PROFILE_PATH + 'dog-'+data.checkins[i].dog_ID+'-iconmed.jpg';
		  // Ti.API.debug( "> > > " + dog_image);		 
		  var dog_thumb = myUiFactory.buildProfileThumb(data.checkins[i].dog_ID, dog_image, border, myUiFactory._icon_large);
		  parentObject.add(dog_thumb);
		}
		/*  only if more than 8 checkins here */
		if(data.checkins.length > 8 ) {
			// Ti.API.debug(".... [~] displayPlaceCheckins:: found ["+ JSON.stringify(data.checkins.length) +"] dog(s) ");
			var how_many_more_text = data.checkins.length - 7;
			var how_many_more =  Ti.UI.createLabel( { 
				text:"and "+how_many_more_text+" more", 
				color: "#ec3c95" }
			);
			$.addClass(how_many_more, "thumbnail");
			how_many_more.image = "";
			parentObject.add(how_many_more);
		}				
  }
  /*  got nathin' */
  else {
  	parentObject.height = myUiFactory._icon_small + (2*myUiFactory._pad_top);
    var how_many_bar = myUiFactory.buildSingleRowInfoBar( "", "No members currently here", "" );;
    parentObject.add(how_many_bar);  
  }
}

//=================================================================================
//		Name:				attachMiniHeader(place_ID)
//		Purpose:		replace full size header w/ smaller version upon downward scroll
//=================================================================================
function attachMiniHeader () {
	var a = Ti.UI.createAnimation({
    // top: -8, opacity: 1, duration : 340
    opacity: 1, duration : 340
  });
  $.miniHeaderContainer.animate(a);
}

function hideMiniHeader () {
  var a = Ti.UI.createAnimation({
    // top: -44, opacity: 0, duration : 220
    opacity: 0, duration : 220
  });
  $.miniHeaderContainer.animate(a);
}

//================================================================================
//		Name:			displayBasicInfo( )
//		Purpose:	
//================================================================================
function displayBasicInfo() {
	// Ti.API.debug("....[~] displayBasicInfo("+JSON.stringify(poiInfo)+") called ");
	var categories = [ 	mySesh.currentPlaceInfo.category_type_1,
											mySesh.currentPlaceInfo.category_type_2,
											mySesh.currentPlaceInfo.category_type_3	 ];
											
	var categories_text = "";
	for (var i=0, len=categories.length; i<len; i++) {
		if(categories[i]!="" && categories[i]!="NULL") 
			categories_text += categories[i]+" + ";
	}
	categories_text = categories_text.substring(0, categories_text.length - 2);		// delete last space and comma
	if ( mySesh.currentPlaceInfo.category>=100 && mySesh.currentPlaceInfo.category<=199 ) {
		categories_text += " / " + mySesh.currentPlaceInfo.price_range;
	}
	var category_icon 		 = ICON_PATH + mySesh.currentPlaceInfo.icon_basic;
	var rating_overall		 = ICON_PATH + "poi-basic-ratingwb.png";
	var rating_dogfriendly = ICON_PATH + "poi-features-waterbowl.png";
	$.basics.add( myUiFactory.buildSingleRowInfoBar(category_icon, categories_text, "") );
	$.basics.add( myUiFactory.buildSeparator() );
	$.basics.add( myUiFactory.buildSingleRowInfoBar(rating_dogfriendly, "Dog-Friendliness: ", mySesh.currentPlaceInfo.rating_dogfriendly+"/5") );
	$.basics.add( myUiFactory.buildSeparator() );
	$.basics.add( myUiFactory.buildSingleRowInfoBar(rating_overall, "Overall Rating:", mySesh.currentPlaceInfo.rating_dogfriendly+"/5") );
}

//================================================================================
//		Name:			displayFeaturesHeader()
//		Purpose:	only show header if there is at least one features to list
//================================================================================
function displayFeaturesHeader() {
	var features_header = myUiFactory.buildSectionHeader("features_header", "FEATURES", 1);
	$.features.add(features_header);
}

//================================================================================
//		Name:			displayOutdoorFeatures( poiDetail)
//		Purpose:	
//================================================================================
function displayOutdoorFeatures(poiDetail) {
	Ti.API.debug("....[~] displayOutdoorFeatures("+ JSON.stringify(poiDetail) +") called ");

	var features = { 	
		"Enclosures"		: poiDetail.enclosures,
		"Area Size" 		: poiDetail.size, 
		"Terrain" 			: poiDetail.terrain,
		"Grade"  				: poiDetail.grade,
		"Off-Leash"			: poiDetail.offleash,
		"Fenced" 				: poiDetail.fenced,
		"Water"					: poiDetail.water,
		"Waste Disposal": poiDetail.waste,
		"Shade"					: poiDetail.shade,	
		"Seating"				: poiDetail.benches,
		"Managed By"		: poiDetail.managing_org
	};
	
	//Ti.API.debug("....[~] displayOutdoorFeatures :: " + JSON.stringify(features) );
	var features_list = myUiFactory.buildViewContainer("features_list", "vertical", "100%", Ti.UI.SIZE, 0);
	var icon_url = ""; 
	
	var string_1 = "";
	var string_2 = "";
	var count = 0;
	var length = features.length;
  for (var k in features){
    if(features[k]!="" && features[k]!="NULL") {
    	// THIS IS THE ELSE CASE BASICALLY
    	icon_url = ICON_PATH + "poi-features-waterbowl.png";
			string_1 = k+":";
			string_2 = features[k];

  		// CASES  
			if (k=="Enclosures") {
				icon_url = ICON_PATH + "poi-enclosure-mixed.png";
				string_1 = "";
				string_2 = features[k];
			}
			else if (k=="Area Size") {
				icon_url = ICON_PATH + "poi-features-sizemedium.png";
			}
			else if (k=="Terrain") {
				icon_url = ICON_PATH + "poi-features-dirt.png";
				if   		(poiDetail.terrain=="Sand")			 icon_url = ICON_PATH + "poi-features-sand.png";
				else if (poiDetail.terrain=="Grass")		 icon_url = ICON_PATH + "poi-features-grass.png";
				else if (poiDetail.terrain=="Woodchips") icon_url = ICON_PATH + "poi-features-woodchips.png";
			}
			
			// ADD FEATURES TO LIST
			features_list.add( myUiFactory.buildSingleRowInfoBar(icon_url, string_1, string_2) );
			features_list.add( myUiFactory.buildSeparator() );
			count ++;
    }
	}
	if(count > 0) {
		displayFeaturesHeader();
		$.features.add( features_list );  	
	}
}

//================================================================================
//		Name:			displayHumanFeatures( poiDetail )
//		Purpose:	
//================================================================================
function displayHumanFeatures(poiDetail) {
	Ti.API.debug("  .... [~] displayHumanFeatures("+ JSON.stringify(poiDetail) +") called ");
	var count = 0;
	
	var features = { 	
		"Dogs Allowed Inside"		: poiDetail.dogs_inside,
		"Outdoor Area" 					: poiDetail.outdoor_area, 
		"Dogs Allowed Outside"	: poiDetail.dogs_outside,
		"Waterbowl" 				  	: poiDetail.waterbowl
	};
	// Ti.API.debug("  .... [~] displayHumanFeatures :: " + JSON.stringify(features) );
	var features_list = myUiFactory.buildViewContainer("features_list", "vertical", "100%", Ti.UI.SIZE, 0);
		
	if (poiDetail.dogs_inside !="" && poiDetail.dogs_inside!="NULL") {
		var icon_url = ICON_PATH + "poi-features-dogsallowedinside.png";
		var string_inside = "Dogs Allowed";
		if (poiDetail.dogs_inside != "Yes") {
			icon_url = ICON_PATH + "poi-features-dogsnotallowedinside.png";
			string_inside = "Dogs Not Allowed";	
		} 
		features_list.add(myUiFactory.buildSingleRowInfoBar(icon_url, "Inside: ", string_inside) );
		features_list.add( myUiFactory.buildSeparator() );
		count ++;
	}
	
	if (poiDetail.outdoor_area !="" && poiDetail.outdoor_area!="NULL") {
		if (poiDetail.outdoor_area == "No") {
			var icon_url = ICON_PATH + "poi-basic-dogfriendliness.png";
			features_list.add(myUiFactory.buildSingleRowInfoBar(icon_url, "No Outdoor Area", "") );
		} else {
			var string_1 = "Outdoor Area:";
			var string_2 = "Dogs Allowed";
			var icon_url = ICON_PATH + "poi-features-dogsallowedoutside.png";
			
			if (poiDetail.outdoor_area!="Yes") {
				string_1 = poiDetail.outdoor_area+":";
			}
			if (poiDetail.dogs_outside != "Yes") {
				icon_url = ICON_PATH + "poi-features-dogsnotallowedoutside.png";
				string_2 = "Dogs Not Allowed";
			}			
			features_list.add(myUiFactory.buildSingleRowInfoBar(icon_url, string_1, string_2) );
		}
		features_list.add( myUiFactory.buildSeparator() );
		count ++;
	}
	
	if ( poiDetail.waterbowl!="" && poiDetail.waterbowl!="NULL" ) {
		var icon_url = ICON_PATH + "poi-basic-dogfriendliness.png";
		var wb_text_string = "Yes";
		//features_list.add(myUiFactory.buildSingleRowInfoBar(icon_url, "Waterbowl:", "No") );

		if (poiDetail.waterbowl != "Yes") {
			icon_url = ICON_PATH + "poi-features-nowaterbowl.png";	
			wb_text_string = "No";
		} 
		features_list.add(myUiFactory.buildSingleRowInfoBar(icon_url, "Waterbowl:", wb_text_string) );
		//features_list.add( myUiFactory.buildSeparator() );
		count++;
	}
	
	if (count > 0) {
		displayFeaturesHeader();
		$.features.add( features_list );  	
	}  	
}

//================================================================================
//		Name:			displayPoiFeatures( data )
//		Purpose:	
//================================================================================
function displayPoiFeatures() {
	Ti.API.info("  .... [~] displayPoiFeatures() :: "+JSON.stringify( mySesh.currentPlaceFeatures )+" ***");
	var poiFeatures = mySesh.currentPlaceFeatures;
	
	// alert(" mySesh.dog.current_place_ID #" + mySesh.dog.current_place_ID);
	
	//////////////////////		FEATURES ESTIMATES (only if dog park or human place)   	 /////////////////////////
	//if( status == 1) {
		if ( poiFeatures.category>=600 && poiFeatures.category<=699 ) {
			displayOutdoorFeatures(poiFeatures);
		}
		else if ( poiFeatures.category>=100 && poiFeatures.category<=199 ) {
			displayHumanFeatures(poiFeatures);
		}
	//}
}

//========================================================================================
//		Name:			savePlaceInfoThenGetFeatures ( poiInfo )
//		Purpose:	save poi_common info into mySesh.currentPlaceInfo, then get Features
//========================================================================================
function savePlaceInfoThenGetFeatures( poiInfo ) {
	// TODO: error check for data.status == 1
	mySesh.currentPlaceInfo = poiInfo;
	
 	//-----------------------------------------------------------------------------------
	//				FEATURES (only if category == [] )
	//-----------------------------------------------------------------------------------
	if (  ( poiInfo.category>=600 && poiInfo.category<=699 ) || 
				( poiInfo.category>=100 && poiInfo.category<=199 )  ) {
		var params = {
			place_ID	  : poiInfo.place_ID,
			place_cat		: poiInfo.category
		};
		loadJson(params, "http://waterbowl.net/mobile/get-poi-features.php", drawEverything);
		// Ti.API.debug("  >> PLACEOVERVIEW PARAMS :: ID #" + poiInfo.place_ID + " / cat #" +  poiInfo.category);
	} else {
		drawEverything();
	}
}

//================================================================================
//		Name:			doEverything( poiFeatures )
//		Purpose:	literally trigger all the modules that get drawn on this page
//================================================================================
function drawEverything( poiFeatures ) {
	Ti.API.debug( " .... >>  doEverything(poiInfo) >> "+ JSON.stringify(mySesh.currentPlaceFeatures) );
	var img_fallback = MISSING_PATH + "poi-0-banner.jpg";
	var img_actual   = POI_PATH + mySesh.currentPlaceInfo.banner;
	
	//  fill in miniheader information
	var dist_label_text = mySesh.currentPlaceInfo.dist + " miles away";
	// if( args._came_from=="checkin modal" )		dist_label_text 	= "You're right next to it";

	$.mini_place_name_label.text 			= mySesh.currentPlaceInfo.name;
	$.miniHeaderContainer.backgroundColor 	= mySesh.currentPlaceInfo.icon_color;
	$.mini_place_second_label.text			= mySesh.currentPlaceInfo.city; 
		
	//$.miniHeaderContainer.add( myUiFactory.buildMiniHeader(mySesh.currentPlaceInfo.name, mySesh.currentPlaceInfo.city, mySesh.currentPlaceInfo.icon_color) );
	$.headerContainer.add( myUiFactory.buildPageHeader(mySesh.currentPlaceInfo.place_ID, "poi", mySesh.currentPlaceInfo.name, mySesh.currentPlaceInfo.address, mySesh.currentPlaceInfo.city + ' ' + mySesh.currentPlaceInfo.zip, dist_label_text ) );
	$.headerContainer.zIndex 	= 30;
	$.headerContainer.top 		= 0;
	
	//-----------------------------------------------------------------------------------------------------------
	//			BASIC INFO
	//-----------------------------------------------------------------------------------------------------------
	var basics_header = myUiFactory.buildSectionHeader("basics_header", "BASIC INFO", 1);
	$.basics.add(basics_header);
	displayBasicInfo();
	
	//----------------------------------------------------------------------------------------------------------
	//		 CHECKINS
	//----------------------------------------------------------------------------------------------------------
	var activity_header = myUiFactory.buildSectionHeader("activity_header", "ACTIVITY", 1);
	$.activity.add(activity_header);
	
	// the thumbs of dogs have to display inline-block (and wrap) 
	var whos_here_height = (myUiFactory.getDefaultRowHeight()*2) + 10;
	var whos_here_list = myUiFactory.buildViewContainer("whos_here_list", "horizontal", "100%", whos_here_height, 0);	
	$.activity.add(whos_here_list);
	
	//	get feed of checkins, including your current checkin status; 
	//		add the list to the view we've just created 												
	// Ti.API.info( "looking for checkins at place_ID ["+ args._place_ID + "]" );
	getPlaceCheckins( args._place_ID, mySesh.dog.dog_ID, whos_here_list);	
	
	//----------------------------------------------------------------------------------------------------------
	//		 ESTIMATES / BUTTONS
	//----------------------------------------------------------------------------------------------------------
	if (  mySesh.currentPlaceInfo.category>=600 && mySesh.currentPlaceInfo.category<=699 ) {
		getRecentEstimates();
		addEstimatesButton();	
	}
	//----------------------------------------------------------------------------------------------------------
	//		 FEATURES (HUMAN / OUTDOOR ONLY)
	//----------------------------------------------------------------------------------------------------------
	if (  ( mySesh.currentPlaceInfo.category>=600 && mySesh.currentPlaceInfo.category<=699 ) || 
				( mySesh.currentPlaceInfo.category>=100 && mySesh.currentPlaceInfo.category<=199 )  ) {
		Ti.API.info( "  >>>> poiFeatures.payload :: " + poiFeatures.payload) ;
		mySesh.currentPlaceFeatures = poiFeatures.payload;
		displayPoiFeatures();
	}
	
	//----------------------------------------------------------------------------
	//		   REMARKS (OLD SCHOOL / NO AUTO REFRESH WAY)
	//----------------------------------------------------------------------------
	/*var params = {
		place_type : 1, 
		place_ID   : args._place_ID,
		dog_id     : mySesh.dog.dog_ID
	};
	getRemarks(params, displayRemarks);
	*/	
	
}

//---------------------------------------------------------------------------------------------------------------

// 				LOGIC FLOW

//---------------------------------------------------------------------------------------------------------------
//////	( 0 )		Add window to global stack, display menubar	/////////////////////////////	
var mini_header_display = 0;
var args = arguments[0] || {};

// BLANK OUT GLOBALS
mySesh.currentPlaceFeatures = null;
mySesh.currentPlaceInfo 		= null;

// Ti.API.debug( "PlaceOverview.js :: " + JSON.stringify(args) );

//////	( 2 )		FIGURE OUT WHERE WE CAME FROM ///////////////////////////////////////////
/*
if (args._came_from=="checkin modal") {
	var place_index = getArrayIndexById(mySesh.geofencePlaces, args._place_ID);
	var poiInfo = mySesh.allPlaces[place_index];
} else {  		
	// came here from map marker, therefore place info can be pulled from global array
	var place_index = getArrayIndexById(mySesh.allPlaces, args._place_ID);
	var poiInfo = mySesh.allPlaces[place_index];
}
*/
//////	( 3 )	 	BUILD PLACE HEADER, ACTIVITY, REMARKS, SPECIFIC FEATURES 	///////////////
var params = {	
	place_ID : args._place_ID,
	user_lat	: mySesh.geo.lat,
	user_lon	: mySesh.geo.lon
};
loadJson(params, "http://waterbowl.net/mobile/get-place-info.php", savePlaceInfoThenGetFeatures);	
// doEverything(poiInfo);

//////	( 4 )	 	GET REMARKS ON WINDOW FOCUS  	//////////////////////////////////////////
$.placeoverview.addEventListener('focus',function(e){
	Ti.API.debug (".... [~] Place overview in focus, refreshing marks now.");
 	var params = {
		place_type : 1, 
		place_ID   : args._place_ID,
		dog_id     : mySesh.dog.dog_ID
	};
	setTimeout ( function(){ getRemarks(params, displayRemarks); }, 300);
	
	if (mySesh.currentPlaceFeatures!=null) {
		Ti.API.info(" >>>>>>>>>>>>>>> REMOVING + READDING ESTIMATES " + JSON.stringify(mySesh.currentPlaceFeatures) );
		removeAllChildren($.estimates);
		// removeAllChildren($.estimates_buttons);
		getRecentEstimates();
		/*
		var params = {
			place_ID				: args._place_ID, 
			enclosure_count : mySesh.currentPlaceFeatures.enclosure_count
		};
		setTimeout ( function(){ loadJson(params, "http://waterbowl.net/mobile/get-recent-estimates.php", s); }, 300);
		addEstimatesButton();
	*/	
	}
});

//////	( 5 )	 	ATTACH MINIHEADER  / SCROLLVIEW LISTENER   	/////////////////////////////
$.scrollView.addEventListener('scroll', function(e) {
  if (e.y!=null) {
    var offsetY = e.y;
    var threshold = 173;
    if  ( offsetY >= threshold && offsetY != null && mini_header_display==0 ) {
    	miniHeader = attachMiniHeader();			// show the mini header
   		//Titanium.API.info('* miniHeader attached :: scrollView Y offset= ' + offsetY);
 			mini_header_display = 1;
    }
    else if ( offsetY < threshold && offsetY != null && mini_header_display==1) {
    	miniHeader = hideMiniHeader();			// hide the mini header     	
    	//Titanium.API.info('* miniHeader removed :: scrollView Y offset: ' + offsetY);
   		mini_header_display = 0;
 		}
  } else {
    Titanium.API.info(' * scrollView Y offset is null ');
  }
});


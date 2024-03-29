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
	//Ti.API.debug("  >>> getRemarks params >>> "+ JSON.stringify(params) );
	loadJson(params, "http://waterbowl.net/mobile/get-place-posts.php", displayRemarks);
}

//================================================================================
//		Name:			displayRemarks( data )
//		Purpose:	
//================================================================================
function displayRemarks(data) {
	var remarks = data;
	removeAllChildren($.remarks);	
	
	var marks_header = myUi.buildSectionHeader("marks", "REMARKS", 1);
	$.remarks.add(marks_header); 

	var markBtnContainer = myUi.buildViewContainer ( "", "", "100%", Ti.UI.SIZE, 0, myUi._color_ltblue ); 
	var markBtn = myUi.buildButton( "markBtn", "add remark", "large" );
	markBtnContainer.add(markBtn);
	$.remarks.add(markBtnContainer);
	
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
		  var mark = myUi.buildFeedRow( remarks[i].marking_dog_ID, myUi._icon_medium, photo, remarks[i].marking_dog_name, remarks[i].time_elapsed, remarks[i].post_text  );
		  $.remarks.add(mark);
		  if ( i < (len-1) )
		   $.remarks.add( myUi.buildSeparator() );
    }
  }
  else {
	  var no_marks_container = myUi.buildViewContainer("", "vertical", "100%", Ti.UI.SIZE, 0, myUi._color_ltblue);	
		var no_marks_label = myUi.buildLabel( "No remarks yet.  Be the first!", "100%", myUi._height_row+(2*myUi._pad_top), myUi._text_medium, "#000000", myUi._color_ltblue, "" );	
		no_marks_container.add(no_marks_label);
		$.remarks.add(no_marks_container);
	}
}

//================================================================================
//		Name:			getRecentEstimates()
//		Purpose:	get most recent outdoor park estimates, if any
//================================================================================
function getRecentEstimates() {
	// Ti.API.info("*** getRecentEstimates() :: "+JSON.stringify(mySesh.currentPlaceFeatures)+" ] ***");
	//////////////////////		ENCLOSURE ESTIMATES (only if dog park) 	 ////////////////////////////////////
	if (mySesh.currentPlaceFeatures.category==600 || mySesh.currentPlaceFeatures.category==601) {
		var params = {
			place_ID		: mySesh.currentPlaceFeatures.poi_ID, 
			enclosure_count : mySesh.currentPlaceFeatures.enclosure_count
		};
		loadJson(params, "http://waterbowl.net/mobile/get-recent-estimates.php", displayRecentEstimates);	
		addEstimatesButtons();	
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
	    var dog_size_section_header = myUi.buildSectionHeader("", area_type+" Area", 3);
		  $.estimates.add(dog_size_section_header);
		  
		  // NO RECENT INFO
		  //  var photo_url = mySesh.AWS.url_base+ '/' +mySesh.AWS.bucket_profile+ '/' +data.payload[i].dog_photo;
		  if(data.payload[i].amount==-1) {
		  	// var activity_icon = ICON_PATH + "poi-activity-dogscurrentlyhere.png";
		  	var latest_estimate = myUi.buildSingleRowInfoBar( "", "No recent information reported", "");
		  }
		  // (photo_icon) 
		  else {
		  	var photo_url = PROFILE_PATH + 'dog-'+data.payload[i].dog_ID+'-iconmed.jpg';		
		  	var latest_estimate = myUi.buildEstimateHeader(
		  		data.payload[i].dog_ID, 
		  		photo_url, 
		  		data.payload[i].dog_name+" says", 
		  		data.payload[i].time_elapsed, 
		  		'"'+data.payload[i].amount, 
		  		( (data.payload[i].amount==1) ? "dog " : "dogs " )+'here!"');
		  }
		  $.estimates.add(latest_estimate);
	  }
	}
	else {
	  var nothing_here_container = myUi.buildViewContainer("", "vertical", "100%", Ti.UI.SIZE, 0, myUi._color_ltblue);	 
		var nothing_here = myUi.buildLabel( data.response, "100%", myUi._icon_small+(2*myUi._pad_top), myUi._text_medium, "#000000",  myUi._color_ltblue, "" );	
		nothing_here_container.add(nothing_here);
		$.estimates.add(nothing_here_container);
	}
}

//================================================================================
//		Name:			addEstimatesButtons( )
//		Purpose:	LIKE THE TITLE SEZ.  I'M DOING STUFF HERE.
//================================================================================
function addEstimatesButtons() {
	removeAllChildren($.estimates_buttons);
	//////////		 ONLY ALLOW USER TO PROVIDE ESTIMATE IF CURRENTLY CHECKED IN HERE		 /////////////////////
	if (mySesh.dog.current_place_ID == args._place_ID) {
		var estimate_btn = myUi.buildFullRowButton("estimate_btn", "report estimate >"); 
		estimate_btn.addEventListener('click', function(){
		  var necessary_args = {
				_poiInfo	: mySesh.currentPlaceInfo,
	   			_poiDetail	: mySesh.currentPlaceFeatures
	    	};
			createWindowController( "provideestimate", necessary_args, "slide_left" );
		});
	}
	// if there are multiple estimates to be seen at this park
	var more_btn = myUi.buildFullRowButton("more_btn", "see history >"); 
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
	Ti.API.info("  .... [~] displayPlaceCheckins :: " + JSON.stringify(data) );
	var how_many_bar = myUi.buildSingleRowInfoBar( gray_dog_icon, "Members Here Now: ",  data.checkins.length );
	if ( data.you_are_here==1 ) {
    	mySesh.dog.current_place_ID = data.checkins.current_place_ID;
  	}
  
 	/* got stuff to show!  */
  	if( data.checkins.length > 0) {
	  	var gray_dog_icon = ICON_PATH + "poi-activity-dogscurrentlyhere.png";

	    parentObject.add(how_many_bar);

	    Ti.API.debug(".... [~] displayPlaceCheckins:: ["+ data.checkins.length +"] ");
 	
	  	var thumbs_width = myUi._device.screenwidth - (2*myUi._pad_left);
	  	if( data.checkins.length > 4) {
	  		// size up parent container so that we can fit two rows, up to 8 thumbnails
	  		var thumbs_height = (2*myUi._icon_large) + (3*myUi._pad_top) + myUi._icon_medium;  	
	  	}
	  	else if (data.checkins.length <= 4 ) {
	    	var thumbs_height = (1*myUi._icon_large) + (3*myUi._pad_top) + myUi._icon_medium;
	    }
	    parentObject.height = thumbs_height;
	  	var thumbs_container = myUi.buildViewContainer("", "horizontal", thumbs_width, thumbs_height, 0);

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
			var dog_thumb = myUi.buildProfileThumb(data.checkins[i].dog_ID, dog_image, border, myUi._icon_large);
			thumbs_container.add(dog_thumb);
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
			thumbs_container.add(how_many_more);
		}
		parentObject.add(myUi.buildSpacer("vert", myUi._pad_left, "clear"));
		parentObject.add(thumbs_container);			
  	}
  	/*  got nathin' */
  	else {
  		parentObject.height = myUi._icon_small + (2*myUi._pad_top);
   	 	var how_many_bar = myUi.buildSingleRowInfoBar( "", "No members currently here", "" );;
   		parentObject.add(how_many_bar);  
  	}
}

//=================================================================================
//		Name:		attachMiniHeader(place_ID)
//		Purpose:	replace full size header w/ smaller version upon downward scroll
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
		if (mySesh.currentPlaceInfo.price_range !="") {
			categories_text += " / " + mySesh.currentPlaceInfo.price_range;
		}
	}
	var category_icon 		= ICON_PATH + mySesh.currentPlaceInfo.icon_basic;
	var rating_wb			= ICON_PATH + "poi-basic-ratingwb.png";
	var rating_dogfriendly	= ICON_PATH + "poi-feature-waterbowl.png";
	$.basics.add( myUi.buildMultiRowInfoBar(category_icon, categories_text, "") );
	$.basics.add( myUi.buildSeparator() );
	$.basics.add( myUi.buildSingleRowInfoBar(rating_dogfriendly, "Dog-Friendliness:", mySesh.currentPlaceInfo.rating_dogfriendly+"/5") );
	$.basics.add( myUi.buildSeparator() );
	$.basics.add( myUi.buildSingleRowInfoBar(rating_wb, "Overall Rating:", mySesh.currentPlaceInfo.rating_wb+"/5") );
}

//================================================================================
//		Name:			displayFeaturesHeader()
//		Purpose:	only show header if there is at least one features to list
//================================================================================
function displayFeaturesHeader() {
	var features_header = myUi.buildSectionHeader("features_header", "FEATURES", 1);
	$.features.add(features_header);
}

//================================================================================
//		Name:			displayOutdoorFeatures( poiDetail)
//		Purpose:	
//================================================================================
function displayOutdoorFeatures(poiDetail) {
	//Ti.API.debug("....[~] displayOutdoorFeatures("+ JSON.stringify(poiDetail) +") called ");

	var features = { 	
		"Enclosures"		: poiDetail.enclosures,
		"Area Size" 		: poiDetail.size, 
		"Terrain" 			: poiDetail.terrain,
		"Grade"  			: poiDetail.grade,
		"Off-Leash"			: poiDetail.offleash,
		// "Fenced" 		: poiDetail.fenced,
		"Water"				: poiDetail.water,
		"Waste Disposal"	: poiDetail.waste,
		"Shade"				: poiDetail.shade,	
		"Seating"			: poiDetail.benches,
		"Managed By"		: poiDetail.managing_org
	};
	
	//Ti.API.debug("....[~] displayOutdoorFeatures :: " + JSON.stringify(features) );
	var features_list = myUi.buildViewContainer("features_list", "vertical", "100%", Ti.UI.SIZE, 0, myUi._color_ltblue);
	var icon_url = ""; 
	
	var string_1 = "";
	var string_2 = "";
	var count = 0;
	var length = features.length;
 	
 	for (var k in features){
    	if(features[k]!="" && features[k]!="NULL") {
    		// THIS IS THE ELSE CASE BASICALLY
	    	icon_url = ICON_PATH + "poi-feature-waterbowl.png";
			string_1 = k+":";
			string_2 = features[k];

	  		// CASES  
			if (k=="Enclosures") {
				string_1 = "";
				string_2 = features[k];
				if  	(poiDetail.enclosures=="Mixed Area")	icon_url = ICON_PATH + "poi-enclosure-mixed.png";
				else if	(poiDetail.enclosures=="Open Area")		icon_url = ICON_PATH + "poi-feature-enclosure-open.png";
				else 											icon_url = ICON_PATH + "poi-feature-enclosure-largeandsmall.png";
			}
			else if (k=="Area Size") {
				if (poiDetail.size=="Medium") 		icon_url = ICON_PATH + "poi-feature-sizemedium.png";
				else if (poiDetail.size=="Large") 	icon_url = ICON_PATH + "poi-feature-sizelarge.png";
				else if (poiDetail.size=="Vast") 	icon_url = ICON_PATH + "poi-feature-sizelarge.png";
				else 								icon_url = ICON_PATH + "poi-feature-sizesmall.png";
			}
			else if (k=="Terrain") {
				if  	(poiDetail.terrain=="Sand")			icon_url = ICON_PATH + "poi-feature-sand.png";
				else if (poiDetail.terrain=="Grass")		icon_url = ICON_PATH + "poi-feature-grass.png";
				else if (poiDetail.terrain=="Woodchips")	icon_url = ICON_PATH + "poi-feature-woodchips.png";
				else  										icon_url = ICON_PATH + "poi-feature-dirt.png";
			}
			else if (k=="Grade") {
				if  	(poiDetail.grade=="Hilly")		icon_url = ICON_PATH + "poi-feature-grade-hilly.png";
				else if (poiDetail.grade=="Incline")	icon_url = ICON_PATH + "poi-feature-grade-incline.png";
				else  									icon_url = ICON_PATH + "poi-feature-grade-flat.png";
			}
			else if (k=="Off-Leash") {
				icon_url = ICON_PATH + "poi-feature-offleash.png";
			}
			else if (k=="Water") {
				icon_url = ICON_PATH + "poi-feature-water.png";
			}
			else if (k=="Waste Disposal") {
				icon_url = ICON_PATH + "poi-feature-wastedisposal.png";
			}
			else if (k=="Shade") {
				icon_url = ICON_PATH + "poi-feature-shade.png";
			}
			else if (k=="Seating") {
				icon_url = ICON_PATH + "poi-feature-seating.png";
			}
			else if (k=="Seating") {
				icon_url = ICON_PATH + "poi-feature-seating.png";
			}			
			// ADD FEATURES TO LIST
			features_list.add( myUi.buildSingleRowInfoBar(icon_url, string_1, string_2) );
			features_list.add( myUi.buildSeparator() );
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
		"Dogs Allowed Inside"	: poiDetail.dogs_inside,
		"Outdoor Area" 			: poiDetail.outdoor_area, 
		"Dogs Allowed Outside"	: poiDetail.dogs_outside,
		"Waterbowl" 			: poiDetail.waterbowl
	};
	// Ti.API.debug("  .... [~] displayHumanFeatures :: " + JSON.stringify(features) );
	var features_list = myUi.buildViewContainer("features_list", "vertical", "100%", Ti.UI.SIZE, 0, myUi._color_ltblue);
		
	if (poiDetail.dogs_inside !="" && poiDetail.dogs_inside!="NULL") {
		var icon_url = ICON_PATH + "poi-feature-dogsallowedinside.png";
		var string_inside = "Dogs Allowed";
		if (poiDetail.dogs_inside != "Yes") {
			icon_url = ICON_PATH + "poi-feature-dogsnotallowedinside.png";
			string_inside = "Dogs Not Allowed";	
		} 
		features_list.add(myUi.buildSingleRowInfoBar(icon_url, "Inside:", string_inside) );
		features_list.add( myUi.buildSeparator() );
		count ++;
	}
	
	if (poiDetail.outdoor_area !="" && poiDetail.outdoor_area!="NULL") {
		if (poiDetail.outdoor_area == "No") {
			var icon_url = ICON_PATH + "poi-feature-nooutsidearea.png";
			features_list.add(myUi.buildSingleRowInfoBar(icon_url, "No Outdoor Area", "") );
		} else {
			var string_1 = "Outdoor Area:";
			var string_2 = "Dogs Allowed";
			var icon_url = ICON_PATH + "poi-feature-dogsallowedoutside.png";
			
			if (poiDetail.outdoor_area!="Yes") {
				string_1 = poiDetail.outdoor_area+":";
			}
			if (poiDetail.dogs_outside != "Yes") {
				icon_url = ICON_PATH + "poi-feature-dogsnotallowedoutside.png";
				string_2 = "Dogs Not Allowed";
			}			
			features_list.add(myUi.buildSingleRowInfoBar(icon_url, string_1, string_2) );
		}
		features_list.add( myUi.buildSeparator() );
		count ++;
	}
	
	if ( poiDetail.waterbowl!="" && poiDetail.waterbowl!="NULL" ) {
		var icon_url = ICON_PATH + "poi-basic-dogfriendliness.png";
		var wb_text_string = "Yes";
		//features_list.add(myUi.buildSingleRowInfoBar(icon_url, "Waterbowl:", "No") );

		if (poiDetail.waterbowl != "Yes") {
			icon_url = ICON_PATH + "poi-feature-nowaterbowl.png";	
			wb_text_string = "No";
		} 
		features_list.add(myUi.buildSingleRowInfoBar(icon_url, "Waterbowl:", wb_text_string) );
		//features_list.add( myUi.buildSeparator() );
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
	//Ti.API.info("  .... [~] displayPoiFeatures() :: "+JSON.stringify( mySesh.currentPlaceFeatures )+" ***");
	var poiFeatures = mySesh.currentPlaceFeatures;
	
	// alert(" mySesh.dog.current_place_ID #" + mySesh.dog.current_place_ID);
	
	//////////////////////	FEATURES (only if dog park or human place)   	 /////////////////////////
	//if( status == 1) {
		if ( poiFeatures.category>=600 && poiFeatures.category<=698) {
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
			place_ID	: poiInfo.place_ID,
			place_cat	: poiInfo.category
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
	Ti.API.debug( " .... >>  drawEverything(poiInfo) >> "+ JSON.stringify(poiFeatures) );

	//----------------------------------------------------------------------------------------------------------
	//		 FEATURES (HUMAN / OUTDOOR ONLY)
	//----------------------------------------------------------------------------------------------------------
	if (( mySesh.currentPlaceInfo.category>=600 && mySesh.currentPlaceInfo.category<=698 ) || 
		( mySesh.currentPlaceInfo.category>=100 && mySesh.currentPlaceInfo.category<=199 )) {
		mySesh.currentPlaceFeatures = poiFeatures.payload;
	}
	
	var img_fallback = MISSING_PATH + "poi-0-banner.jpg";
	var img_actual   = POI_PATH + mySesh.currentPlaceInfo.banner;
	
	//  fill in miniheader information
	var dist_label_text = mySesh.currentPlaceInfo.dist.toFixed(1) + " miles away";
	// if( args._came_from=="checkin modal" )		dist_label_text 	= "You're right next to it";

	$.mini_place_name_label.text 			= mySesh.currentPlaceInfo.name;
	$.miniHeaderContainer.backgroundColor 	= mySesh.currentPlaceInfo.icon_color;
	$.mini_place_second_label.text			= mySesh.currentPlaceInfo.city; 
	
	var statBar = [
		{	
			"icon"	: ICON_PATH + 'poi-statbar-dogfriendliness.png',
			"amount": mySesh.currentPlaceInfo.rating_dogfriendly
		},
		{	
			"icon"	: ICON_PATH + 'poi-statbar-ratingwb.png',
			"amount": mySesh.currentPlaceInfo.rating_wb
		}
	];	
	//$.miniHeaderContainer.add( myUi.buildMiniHeader(mySesh.currentPlaceInfo.name, mySesh.currentPlaceInfo.city, mySesh.currentPlaceInfo.icon_color) );
	$.headerContainer.add( myUi.buildPageHeader(mySesh.currentPlaceInfo.place_ID, "poi", mySesh.currentPlaceInfo.name, mySesh.currentPlaceInfo.address, mySesh.currentPlaceInfo.city + ' ' + mySesh.currentPlaceInfo.zip, dist_label_text, statBar ) );
	$.headerContainer.zIndex 	= 30;
	$.headerContainer.top 		= 0;
	
	//-----------------------------------------------------------------------------------------------------------
	//			BASIC INFO
	//-----------------------------------------------------------------------------------------------------------
	var basics_header = myUi.buildSectionHeader("basics_header", "BASIC INFO", 1);
	$.basics.add(basics_header);
	displayBasicInfo();
	
	//----------------------------------------------------------------------------------------------------------
	//		 CHECKINS
	//----------------------------------------------------------------------------------------------------------
	var activity_header = myUi.buildSectionHeader("activity_header", "ACTIVITY", 1);
	$.activity.add(activity_header);
	
	// the thumbs of dogs have to display inline-block (and wrap) 
	var whos_here_width = myUi._device.screenwidth;
	var whos_here_height = (myUi.getDefaultRowHeight()*2) + 10;
	var whos_here_list = myUi.buildViewContainer("whos_here_list", "horizontal", whos_here_width, "", 0, myUi._color_ltblue);	
	$.activity.add(whos_here_list);
	
	//	get feed of checkins, including your current checkin status; 
	//		add the list to the view we've just created 												
	// Ti.API.info( "looking for checkins at place_ID ["+ args._place_ID + "]" );
	getPlaceCheckins( args._place_ID, mySesh.dog.dog_ID, whos_here_list);	
	
	//----------------------------------------------------------------------------------------------------------
	//		 ESTIMATES / BUTTONS
	//----------------------------------------------------------------------------------------------------------
	if (  mySesh.currentPlaceInfo.category>=600 && mySesh.currentPlaceInfo.category<=698 ) {
		getRecentEstimates();
		// addEstimatesButtons();	 // already called inside get RecentEstimates
	}
	//----------------------------------------------------------------------------------------------------------
	//		 FEATURES (HUMAN / OUTDOOR ONLY)
	//----------------------------------------------------------------------------------------------------------
	if (( mySesh.currentPlaceInfo.category>=600 && mySesh.currentPlaceInfo.category<=698 ) || 
		( mySesh.currentPlaceInfo.category>=100 && mySesh.currentPlaceInfo.category<=199 )) {
		// Ti.API.info( "  >>>> poiFeatures.payload :: " + poiFeatures.payload) ;
		displayPoiFeatures();
	}
	
	//----------------------------------------------------------------------------
	//		   REMARKS  (
	//----------------------------------------------------------------------------
	var params = {
		place_type : 1, 
		place_ID   : args._place_ID,
		dog_id     : mySesh.dog.dog_ID
	};
	getRemarks(params, displayRemarks);		
}

//---------------------------------------------------------------------------------------------------------------

// 				LOGIC FLOW

//---------------------------------------------------------------------------------------------------------------
//////	( 0 )		Add window to global stack, display menubar	/////////////////////////////	
var mini_header_display = 0;
var args = arguments[0] || {};

// BLANK OUT GLOBALS
mySesh.currentPlaceFeatures = null;
mySesh.currentPlaceInfo 	= null;

// Ti.API.debug( "PlaceOverview.js :: " + JSON.stringify(args) );

//////	( 1 )	 	BUILD PLACE HEADER, ACTIVITY, REMARKS, SPECIFIC FEATURES 	///////////////
var params = {	
	place_ID 	: args._place_ID,
	user_lat	: mySesh.geo.lat,
	user_lon	: mySesh.geo.lon
};
loadJson(params, "http://waterbowl.net/mobile/get-place-info.php", savePlaceInfoThenGetFeatures);	
// doEverything(poiInfo);

//////	( 2 )	 	GET REMARKS ON WINDOW FOCUS  	//////////////////////////////////////////
$.placeoverview.addEventListener('focus',function(e){
	if(mySesh.flag.poiRemarksChanged == true) {
		Ti.API.debug (".... [~] placeoverview FOCUS :: poiRemarksChanged");
	 	var params = {
			place_type : 1, 
			place_ID   : args._place_ID,
			dog_id     : mySesh.dog.dog_ID
		};
		getRemarks(params, displayRemarks);
		mySesh.flag.poiRemarksChanged = false;
	}
	// only refresh estimates if global flag is pending/true
	if(mySesh.flag.poiEstimatesChanged == true) {
	//if (mySesh.currentPlaceFeatures!=null) {
		Ti.API.info("  .... [~] placeoverview FOCUS :: poiEstimatesChanged " );
		removeAllChildren($.estimates);
		// removeAllChildren($.estimates_buttons);
		getRecentEstimates();
		mySesh.flag.poiEstimatesChanged = false;
	//}
	}
});

//////	( 3 )	 	ATTACH MINIHEADER  / SCROLLVIEW LISTENER   	/////////////////////////////
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


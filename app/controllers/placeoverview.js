//
//	Waterbowl App
//		:: placeoverview.js
//	
//	Created by Mihai Peteu Oct 2014
//	(c) 2014 waterbowl
//
//		Last update Jan 12 2014
//
//================================================================================
//		Name:			getRemarks( params )
//		Purpose:		( 1, args._place_ID, mySesh.dog.dog_ID, displayRemarks);
//================================================================================
function getRemarks( params ) {
	loadJson(params, "http://waterbowl.net/mobile/get-place-posts.php", displayRemarks);
}

//================================================================================
//		Name:			displayRemarks( data )
//		Purpose:	
//================================================================================
function displayRemarks(data) {
	removeAllChildren($.remarks);	
	
	var marks_header = myUiFactory.buildSectionHeader("marks", "REMARKS", 1);
	$.remarks.add(marks_header); 
	var markBtn = myUiFactory.buildButton( "markBtn", "add remark", "large" );
	$.remarks.add(markBtn);
	
	var necessary_args = {   
		_place_ID    		: args._place_ID,
		_place_name	 		: poiInfo.name,
		_place_city	 		: poiInfo.city,
		_place_bgcolor	: poiInfo.icon_color,
		_place_type  		: 1
	};
	markBtn.addEventListener('click', function(e) {
		createWindowController( "addpost", necessary_args, "slide_left" );
	});
	
	if( data.length>0) {
  	// (1)	Need to sort POIs based on proximity
		data.sort(function(a, b) {		// sort by proximity (closest first)
			return (b.ID - a.ID);
		});
		// (2)	Print a list of all the remarks at this POI
    for (var i=0, len=data.length; i<len; i++) {
      var photo = PROFILE_PATH + 'dog-'+data[i].marking_dog_ID+'-iconmed.jpg';		
      																				// (id, photo_url, photo_caption, time_stamp, description)
		  var mark = myUiFactory.buildFeedRow( data[i].marking_dog_ID, myUiFactory._icon_medium, photo, data[i].marking_dog_name, data[i].time_elapsed, data[i].post_text  );
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
//		Name:			getRecentEstimates( place_ID, enclosure_count, callbackFunction )
//		Purpose:		get latest user-provided estimates
//================================================================================
function getRecentEstimates( place_ID, enclosure_count, callbackFunction ) {
	
}

//================================================================================
//		Name:			displayRecentEstimates( data )
//		Purpose:	add place estimate modules to Window and fill them in w/ data
//================================================================================
function displayRecentEstimates(data, place_ID) {
	// +=== last_estimate_view (in XML) =========+
	// |  +-thumb-+ +-- middle --+ +-- right--+  |
	// |  |       | |            | |          |  |
	// |  |       | |            | |          |  |
	// |  |       | |            | |          |  |		
	// |  +-------+ +------------+ +----------+  |		
	// +=========================================+
	if( data.payload.length>0) {	
	  for (var i=0, len=data.payload.length; i<len; i++) {	
	  	var area_type = "Entire";
	  	if (data.payload[i].size=="Large" || data.payload[i].size=="Small") {
	  		area_type = data.payload[i].size+ " Dog";
	    }
	    var dog_size_section_header = myUiFactory.buildSectionHeader("", area_type+" Area", 3);
		  $.activity.add(dog_size_section_header);
		  
		  // var photo_url = mySesh.AWS.url_base+ '/' +mySesh.AWS.bucket_profile+ '/' +data.payload[i].dog_photo;
		  if(data.payload[i].amount==-1) {
		  	var activity_icon = ICON_PATH + "poi-activity-dogscurrentlyhere.png";
		  	var latest_estimate = myUiFactory.buildSingleRowInfoBar( activity_icon, "No recent information", "");
		  }
		  else {
		  	var photo_url = PROFILE_PATH + 'dog-'+data.payload[i].dog_ID+'-iconmed.jpg';		
		  	Ti.API.info( ">>>>>>> PHOTO URL >>>>> "+photo_url);
		  	var latest_estimate = myUiFactory.buildTableRowHeader(data.payload[i].dog_ID, photo_url, data.payload[i].dog_name, data.payload[i].time_elapsed, data.payload[i].amount, ( (data.payload[i].amount==1) ? "dog " : "dogs " )+"here");
		  }
		  $.activity.add(latest_estimate);
	  
	  }
	}
	else {
	  var nothing_here_container = myUiFactory.buildViewContainer("", "vertical", "100%", Ti.UI.SIZE, 0);	
		var nothing_here = myUiFactory.buildLabel( data.response, "100%", myUiFactory._icon_small+(2*myUiFactory._pad_top), myUiFactory._text_medium, "#000000", "" );	
		nothing_here_container.add(nothing_here);
		$.activity.add(nothing_here_container);
	}
	Ti.API.info( ".... [+] >>>>>>> addEstimatesButton :: " + JSON.stringify(data) );
	addEstimatesButton(data);
}

//================================================================================
//		Name:			addEstimatesButton( data )
//		Purpose:	LIKE THE TITLE SEZ.  I'M DOING STUFF HERE.
//================================================================================
function addEstimatesButton(data) {
	var estimate_btn = myUiFactory.buildFullRowButton("estimate_btn", "report estimate >"); 
	estimate_btn.addEventListener('click', function(){
    Ti.API.info( "...[+] Estimate Update button clicked :: " + JSON.stringify(data) );
    var necessary_args = {
		  _place_ID    : args._place_ID,     // 601000001
	    _place_index : place_index,
	    _poiInfo		 : data
    };
		createWindowController( "provideestimate", necessary_args, "slide_left" );
	});
	// if there are multiple estimates to be seen at this park
	var more_btn = myUiFactory.buildFullRowButton("more_btn", "see history >"); 
	more_btn.addEventListener('click', function(){
			Ti.API.info("...[+] Estimate History button clicked");
		// TODO:  Create gray "see more >" button 
		// 				package estimate info in args._estimates, open if clicked
		var necessary_args = {
			_poiInfo	: poiInfo
		};
		createWindowController( "activityhistory", necessary_args, "slide_left" );
	});
	
	$.activity.add(estimate_btn);
	$.activity.add(more_btn);
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
	
	http_query.open("POST", "http://waterbowl.net/mobile/get-place-checkins.php");	
	http_query.send( params );
	http_query.onload = function() {
		var placeJSON = this.responseText;	
	 
	 	if (placeJSON != "" && placeJSON !="[]") {
      var place = JSON.parse( placeJSON );
			/*  use the current checkins to build the activityList  */
      displayPlaceCheckins(place, parent_view);
		}
	};
  return "";	
}

//====================================================================================================
//		Name:				displayPlaceCheckins(dataArray, parentObject)
//		Purpose:		replace full size header w/ smaller version upon downward scroll
//====================================================================================================
function displayPlaceCheckins(data, parentObject) {
	Ti.API.debug(".... [~] displayPlaceCheckins:: ["+ data.checkins.length +"] ");
 	if ( data.you_are_here==1 ) {
    mySesh.dog.current_place_ID = place_ID;
  }
  
 	/* got stuff to show!  */
  if( data.checkins.length > 0) {
  	var how_many_bar = myUiFactory.buildSingleRowInfoBar( ICON_PATH + "poi-activity-dogscurrentlyhere.png", "Members Here Now: ",  data.checkins.length );;
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
//		Name:			displayBasicInfo( poiInfo )
//		Purpose:	
//================================================================================
function displayBasicInfo(poiInfo) {
	// Ti.API.debug("....[~] displayBasicInfo("+JSON.stringify(poiInfo)+") called ");
	var categories = [ 	poiInfo.category_type_1,
											poiInfo.category_type_2,
											poiInfo.category_type_3	 ];
											
	if ( poiInfo.category>=100 && poiInfo.category<=199 ) {
		categories.push(poiInfo.price_range);
	}
	var categories_text = "";
	for (var i=0, len=categories.length; i<len; i++) {
		if(categories[i]!="" && categories[i]!="NULL") 
			categories_text += categories[i]+" / ";
	}
	categories_text = categories_text.substring(0, categories_text.length - 2);		// delete last space and comma
	
	var category_icon 		 = ICON_PATH + poiInfo.icon_basic;
	var rating_dogfriendly = ICON_PATH + "poi-basic-ratingwb.png";
	var rating_overall 		 = ICON_PATH + "poi-features-waterbowl.png";
	$.basics.add( myUiFactory.buildSingleRowInfoBar(category_icon, categories_text, "") );
	$.basics.add( myUiFactory.buildSeparator() );
	$.basics.add( myUiFactory.buildSingleRowInfoBar(rating_dogfriendly, "Dog-Friendliness: ", poiInfo.rating_dogfriendly+"/5") );
	$.basics.add( myUiFactory.buildSeparator() );
	$.basics.add( myUiFactory.buildSingleRowInfoBar(rating_overall, "Overall Rating:", poiInfo.rating_dogfriendly+"/5") );
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
		if (poiDetail.outdoor_area != "Yes") {
			icon_url = ICON_PATH + "poi-features-dogsnotallowedinside.png";
			string_inside = "Dogs Not Allowed";	
		} 
		features_list.add(myUiFactory.buildSingleRowInfoBar(icon_url, "Inside: ", string_inside) );
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
				string_1 = poiDetail.outdoor_area;
			}
			if (poiDetail.dogs_outside != "Yes") {
				icon_url = ICON_PATH + "poi-features-dogsnotallowedoutside.png";
				string_2 = "Dogs Not Allowed";
			}			
			features_list.add(myUiFactory.buildSingleRowInfoBar(icon_url, string_1, string_2) );
		}
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
		count++;
	}
	
	/*
	var length = features.length;
  for (var k in features){
    if(features[k]!="" && features[k]!="NULL") {
  		// call buildSingleRowInfoBar w/ ( image_url, name, value ) 
			if (k=="Outdoor Area") {
				features_list.add(  myUiFactory.buildSingleRowInfoBar(icon_url, "", features[k]) );
			}
			else
				features_list.add(  myUiFactory.buildSingleRowInfoBar(icon_url, k+":", features[k]) );
			//if ( count < (length-1) )
			features_list.add( myUiFactory.buildSeparator() );
    }
    count ++;
	}
	*/
	if (count > 0) {
		displayFeaturesHeader();
		$.features.add( features_list );  	
	}  	
}

//================================================================================
//		Name:			getPoiFeatures( data )
//		Purpose:	
//================================================================================
function getPoiFeatures(data) {
	var status = data.status;
	var poiFeatures = data.payload;
	Ti.API.info("  .... [~] getPoiFeatures() :: "+JSON.stringify(poiFeatures)+" ***");
	//----------------------------------------------------------------------------------------------------------
	//       ESTIMATES (only if dog park)  
	//----------------------------------------------------------------------------------------------------------
	if (poiFeatures.category==600 || poiFeatures.category==601) {
		var params = {
			place_ID				: poiFeatures.poi_ID, 
			enclosure_count : poiFeatures.enclosure_count
		};
		//Ti.API.info("*** getRecentEstimates() for :: "+JSON.stringify(params)+" ] ***");
		loadJson(params, "http://waterbowl.net/mobile/get-recent-estimates.php", displayRecentEstimates);		
	}
	//----------------------------------------------------------------------------------------------------------
	//       FEATURES (only if dog park or human place)  
	//----------------------------------------------------------------------------------------------------------
	if( status == 1) {
		if ( poiFeatures.category>=600 && poiFeatures.category<=699 ) {
			displayOutdoorFeatures(poiFeatures);
		}
		else if ( poiFeatures.category>=100 && poiFeatures.category<=199 ) {
			displayHumanFeatures(poiFeatures);
		}
	}
}


//================================================================================
//		Name:			doEverything( poiInfo )
//		Purpose:	literally trigger all the modules that get drawn on this page
//================================================================================
function doEverything(poiInfo) {
	var img_fallback = MISSING_PATH + "poi-0-banner.jpg";
	var img_actual   = POI_PATH + poiInfo.banner;
	
	//  fill in miniheader information
	var dist_label_text 	= "You're right next to it";    
	if( args._came_from!="checkin modal" )
		dist_label_text 	= poiInfo.dist + " miles away"

	$.mini_place_name_label.text 	= poiInfo.name;
	$.miniHeaderContainer.backgroundColor = poiInfo.icon_color;
	$.mini_place_second_label.text	=	poiInfo.city; 
		
	//$.miniHeaderContainer.add( myUiFactory.buildMiniHeader(poiInfo.name, poiInfo.city, poiInfo.icon_color) );
	$.headerContainer.add( myUiFactory.buildPageHeader(poiInfo.place_ID, "poi", poiInfo.name, poiInfo.address, poiInfo.city + ' ' + poiInfo.zip, dist_label_text ) );
	$.headerContainer.zIndex = 30;
	$.headerContainer.top = 0;
	

	//-----------------------------------------------------------------------------------------------------------
	//			BASIC INFO
	//-----------------------------------------------------------------------------------------------------------
	var basics_header = myUiFactory.buildSectionHeader("basics_header", "BASIC INFO", 1);
	$.basics.add(basics_header);
	displayBasicInfo(poiInfo);
	
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
	
	// TODO:  _gradually_ move all code from Line 40-96 to below; change it up to use class stuff
	
	//----------------------------------------------------------------------------
	//		   REMARKS
	//----------------------------------------------------------------------------
	/* var params = {
		place_type : 1, 
		place_ID   : args._place_ID,
		dog_id     : mySesh.dog.dog_ID
	};
	getRemarks(params, displayRemarks);
	*/
	//------------------------------------------------------------------------------------------------
	//				FEATURES (only if category == [] )
	//-------------------------------------------------------------------------------------------------
	if ( ( poiInfo.category>=600 && poiInfo.category<=699 ) || ( poiInfo.category>=100 && poiInfo.category<=199 ) ) {
		var params = {
			place_ID	  : poiInfo.place_ID,
			place_cat		: poiInfo.category
		};
		// Ti.API.debug("  >> PLACEOVERVIEW PARAMS :: ID #" + poiInfo.place_ID + " / cat #" +  poiInfo.category);
		// need poi features detail in order to call getRecentEstimates and getBasicFeatures
		loadJson(params, "http://waterbowl.net/mobile/get-poi-features.php", getPoiFeatures);
	}
}



//---------------------------------------------------------------------------------------------------------------

// 				LOGIC FLOW

//---------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------
//
//		(_0_)		Add window to global stack, display menubar
//
//-----------------------------------------------------------------------
//var myUiFactory = new UiFactoryModule.UiFactory();
var mini_header_display = 0;
// Ti.API.debug( "PlaceOverview.js :: " + JSON.stringify(mySesh.allPlaces) );
//--------------------------------------------------------------------------------
//
//		(_1_)		Grab incoming variables, set header image and title, build miniheader
//
//--------------------------------------------------------------------------------
var args = arguments[0] || {};

//
////		FIGURE OUT ENTRY VECTOR THEN POPULATE:
////		- Place header, Basic Info, Checkins, Mark+Remarks, and Features
//
if (args._came_from=="checkin modal") {
	var params = {	place_ID : args._place_ID	};
	loadJson(params, "http://waterbowl.net/mobile/get-place-info.php", doEverything);	
} else {  		
	// came here from map marker, therefore place info can be pulled from global array
	var place_index = getArrayIndexById(mySesh.allPlaces, args._place_ID);
	var poiInfo = mySesh.allPlaces[place_index];
	doEverything(poiInfo);
}

$.placeoverview.addEventListener('focus',function(e){
	Ti.API.debug ("  .... [~] Place overview in focus, refreshing marks now.");
 	var params = {
		place_type : 1, 
		place_ID   : args._place_ID,
		dog_id     : mySesh.dog.dog_ID
	};
	setTimeout ( function(){ getRemarks(params, displayRemarks); }, 200);
});

//var how_close = getDistance( mySesh.geo.lat, mySesh.geo.lon, poiInfo.lat, poiInfo.lon );
//alert( how_close + " miles");
//Ti.API.info (  " *  placeArray[" + args._place_ID +"], "+ JSON.stringify( poiInfo )  );


//----------------------------------------------------------------------------
//		 	 ScrollView listener (+ attach sticky mini-header bar)
//----------------------------------------------------------------------------
$.scrollView.addEventListener('scroll', function(e) {
  if (e.y!=null) {
    var offsetY = e.y;
    var threshold = 173;
   
    if  ( offsetY >= threshold && offsetY != null && mini_header_display==0 ) {
    	miniHeader = attachMiniHeader();			// show the mini header
   		//Titanium.API.info(' * scrollView Y offset: ' + offsetY);
 			mini_header_display = 1;
 			//Titanium.API.info( ' * miniHeader attached * ' +  mini_header_display );
    }
    else if ( offsetY < threshold && offsetY != null && mini_header_display==1) {
    	//Ti.API.info (" MINIHEADER CONTENTS: "+ miniHeader);
    	miniHeader = hideMiniHeader();			// hide the mini header
     	
    	//Titanium.API.info(' * scrollView Y offset: ' + offsetY);
   		mini_header_display = 0;
 			//Titanium.API.info( ' * miniHeader removed * ' + mini_header_display );
 		}
    	
  } else {
    Titanium.API.info(' * scrollView Y offset is null');
  }
});


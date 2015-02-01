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
//		Name:			getRemarks( params, callbackFunction )
//		Purpose:		( 1, args._place_ID, mySesh.dog.dog_ID, displayRemarks);
//================================================================================
function getRemarks( params, callbackFunction ) {
	loadJson(params, "http://waterbowl.net/mobile/get-place-posts.php", callbackFunction);
}

//================================================================================
//		Name:			displayRemarks( data )
//		Purpose:	
//================================================================================
function displayRemarks(data) {
  if( data.length>0) {
  	// (1)	Need to sort POIs based on proximity
		data.sort(function(a, b) {		// sort by proximity (closest first)
			return (b.ID - a.ID);
		});
		// (2)	Print a list of all the remarks at this POI
    for (var i=0, len=data.length; i<len; i++) {
      var photo = PROFILE_PATH + 'dog-'+data[i].marking_dog_ID+'-iconmed.jpg';		
      																				// (id, photo_url, photo_caption, time_stamp, description)
		  //var mark = myUiFactory.buildRowMarkSummary( "", photo, data[i].marking_dog_name, data[i].time_elapsed, data[i].post_text  );
		  var mark = myUiFactory.buildFeedRow( "", "large", photo, data[i].marking_dog_name, data[i].time_elapsed, data[i].post_text  );
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
	Ti.API.info("* getRecentEstimates() called *");
	var params = {
		place_ID	: place_ID, 
		enclosure_count : enclosure_count
	};
	loadJson(params, "http://waterbowl.net/mobile/get-recent-estimates.php", callbackFunction);
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
	    var dog_size_section_header = myUiFactory.buildSectionHeader("", area_type+" Area", "");
		  $.activity.add(dog_size_section_header);
		  
		  // var photo_url = mySesh.AWS.url_base+ '/' +mySesh.AWS.bucket_profile+ '/' +data.payload[i].dog_photo;
		  if(data.payload[i].amount==-1) {
		  	var activity_icon = ICON_PATH + "POI-activity-dogscurrentlyhere.png";
		  	var latest_estimate = myUiFactory.buildInfoBar( activity_icon, "No recent estimate", "");
		  }
		  else {
		  	
		  	var photo_url = PROFILE_PATH + 'dog-'+data.payload[i].dog_ID+'-iconmed.jpg';		
		  	var latest_estimate = myUiFactory.buildTableRowHeader("", photo_url, data.payload[i].dog_name, data.payload[i].time_elapsed, data.payload[i].amount, ( (data.payload[i].amount==1) ? "dog " : "dogs " )+"here");
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
	addEstimatesButtons();
}

//================================================================================
//		Name:			addEstimatesButtons( data )
//		Purpose:	LIKE THE TITLE SEZ.  I'M DOING STUFF HERE.
//================================================================================
function addEstimatesButtons() {
	var estimate_btn = myUiFactory.buildFullRowButton("estimate_btn", "update estimate >"); 
	estimate_btn.addEventListener('click', function(){
    Ti.API.info("...[+] Estimate Update button clicked");
    var necessary_args = {
		  _place_ID    : args._place_ID,     // 601000001
	    _place_index : place_index,
	    _poiInfo		: poiInfo
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
  	var how_many_bar = myUiFactory.buildInfoBar( ICON_PATH + "POI-activity-dogscurrentlyhere.png", "Currently here",  data.checkins.length );;
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
		  var dog_thumb = myUiFactory.buildProfileThumb("dog_thumb_"+i, dog_image, border, "large");
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
    var how_many_bar = myUiFactory.buildInfoBar( "", "Nobody currently here", "" );;
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
//		Name:			displayBasicInfo( poiInfo, parent_view )
//		Purpose:	
//================================================================================
function displayBasicInfo(poiInfo, parent) {
	Ti.API.debug("....[~] displayBasicInfo("+poiInfo.place_ID+") called ");
	
	var category_icon = ICON_PATH + poiInfo.icon_basic;
	var rating_df = ICON_PATH + "POI-basic-dogfriendliness.png";
	var rating_wb = ICON_PATH + "POI-basic-ratingwb.png";
	parent.add(  myUiFactory.buildInfoBar(category_icon, poiInfo.type, "") );
	parent.add( myUiFactory.buildSeparator() );
	parent.add(  myUiFactory.buildInfoBar(rating_df, "Dog friendliness", poiInfo.rating_dogfriendly+"/5") );
	parent.add( myUiFactory.buildSeparator() );
	parent.add(  myUiFactory.buildInfoBar(rating_wb, "Rating", poiInfo.rating_dogfriendly+"/5") );
}

//================================================================================
//		Name:			displayFeatures( poiInfo, parent_view)
//		Purpose:	
//================================================================================
function displayFeatures(poiInfo, parent) {
	Ti.API.debug("....[~] displayFeatures("+poiInfo.place_ID+") called ");

	var features = { 	
		"Enclosures"		: poiInfo.enclosures,
		"Size" 					: poiInfo.size, 
		"Terrain" 			: poiInfo.terrain,
		"Grade"  				: poiInfo.grade,
		"Offleash"			: poiInfo.offleash,
		"Fenced" 				: poiInfo.fenced,
		"Water"					: poiInfo.water,
		"Waste Disposal": poiInfo.waste,
		"Shade"					: poiInfo.shade,	
		"Benches"				: poiInfo.benches
	};
	
	//Ti.API.debug("....[~] displayFeatures :: features " + JSON.stringify(features) );
	var features_list = myUiFactory.buildViewContainer("features_list", "vertical", "100%", Ti.UI.SIZE, 0);
	var icon_url = ICON_PATH + "POI-basic-dogfriendliness.png";
	
	var count = 0;
	var length = features.length;
  for (var k in features){
    if(features[k]!="" && features[k]!="NULL") {
  		// call buildInfoBar w/ ( image_url, name, value ) 
			if (k=="Enclosures")
				features_list.add(  myUiFactory.buildInfoBar(icon_url, "", features[k]) );
			else
				features_list.add(  myUiFactory.buildInfoBar(icon_url, k+":", features[k]) );
			//if ( count < (length-1) )
			features_list.add( myUiFactory.buildSeparator() );
    }
    count ++;
	}
	parent.add( features_list );  	
}

//===========================================================================================
// 				LOGIC FLOW
//-----------------------------------------------------------------------
//
//		(_0_)		Add window to global stack, display menubar
//
//-----------------------------------------------------------------------
//var myUiFactory = new UiFactoryModule.UiFactory();
var mini_header_display = 0;

//--------------------------------------------------------------------------------
//
//		(_1_)		Grab incoming variables, set header image and title, build miniheader
//
//--------------------------------------------------------------------------------
var args = arguments[0] || {};
var place_index = getArrayIndexById(mySesh.allPlaces, args._place_ID);

Ti.API.info(" >>>>> PLACEOVERVIEW >>> POI ID + INDEX:: " +args._place_ID + " / " + place_index);
var poiInfo = mySesh.allPlaces[place_index];

var how_close = getDistance( mySesh.geo.lat, mySesh.geo.lon, poiInfo.lat, poiInfo.lon );
//alert( how_close + " miles");
//Ti.API.info (  " *  placeArray[" + args._place_ID +"], "+ JSON.stringify( poiInfo )  );

//----------------------------------------------------------------------------
//
//		(_2_)		Populate place header
//
//----------------------------------------------------------------------------
var bg_image = MISSING_PATH + "poi-0-banner.jpg";
$.headerContainer.backgroundImage = bg_image;

if ( poiInfo.banner != "" ) {
	//bg_image = mySesh.AWS.url_base+'/'+mySesh.AWS.bucket_place+'/'+poiInfo.banner;
	bg_image = POI_PATH + poiInfo.banner;
		 
	// image preloader 
	var c = Titanium.Network.createHTTPClient();
	c.setTimeout(3000);
	c.onload = function() {
	    if(c.status == 200) {
	     	$.headerContainer.backgroundImage = this.responseData;
	    }
	};
	c.open('GET', bg_image);
	c.send();
	// Ti.API.info ( "...(i) banner image [ "+ bg_image +" ]");
}


//  fill in header and miniheader information 
$.place_dist_label.text 	= poiInfo.dist + " miles away";   // TODO: send in distance in miles from backend
//$.mini_place_dist_label.text 	= poiInfo.dist + " mi away"; 

$.place_name_label.text 			= poiInfo.name;
$.place_address_label.text		=	poiInfo.address;
$.place_city_label.text	  		=	poiInfo.city + ' ' + poiInfo.zip;
$.mini_place_name_label.text 	= poiInfo.name;
$.miniHeaderContainer.backgroundColor = poiInfo.icon_color;
$.mini_place_second_label.text	=	poiInfo.city;  // + ' ('+ poiInfo.dist + " mi away)";
//-----------------------------------------------------------------------------------------------------------
//			BASIC INFO
//-----------------------------------------------------------------------------------------------------------
var basics_header = myUiFactory.buildSectionHeader("basics_header", "BASIC INFO", 1);
$.basics.add(basics_header);
displayBasicInfo(poiInfo, $.basics);


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

//----------------------------------------------------------------------------------------------------------
//       ESTIMATES (only if dog park)  
//----------------------------------------------------------------------------------------------------------
if (poiInfo.category==600 || poiInfo.category==601) {
	// TODO:  redo this using class methods
	getRecentEstimates( args._place_ID, poiInfo.enclosure_count, displayRecentEstimates );	
}

//----------------------------------------------------------------------------
//		   REMARKS
//----------------------------------------------------------------------------
var marks_header = myUiFactory.buildSectionHeader("marks", "REMARKS", 1);
$.remarks.add(marks_header); 
var markBtn = myUiFactory.buildButton( "markBtn", "add remark", "large" );
$.remarks.add(markBtn);

var params = {
	place_type : 1, 
	place_ID   : args._place_ID,
	dog_id     : mySesh.dog.dog_ID
};
getRemarks(params, displayRemarks);

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


//------------------------------------------------------------------------------------------------
//				FEATURES (only if category == [] )
//-------------------------------------------------------------------------------------------------
if (poiInfo.category==600 || poiInfo.category==601 || (poiInfo.category>=100 && poiInfo.category<=200) ) {
	var features_header = myUiFactory.buildSectionHeader("features_header", "FEATURES", 1);
	$.features.add(features_header);
	displayFeatures(poiInfo, $.features);
}

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
 			Titanium.API.info( ' * miniHeader attached * ' +  mini_header_display );
    }
    else if ( offsetY < threshold && offsetY != null && mini_header_display==1) {
    	//Ti.API.info (" MINIHEADER CONTENTS: "+ miniHeader);
    	miniHeader = hideMiniHeader();			// hide the mini header
     	
    	//Titanium.API.info(' * scrollView Y offset: ' + offsetY);
   		mini_header_display = 0;
 			Titanium.API.info( ' * miniHeader removed * ' + mini_header_display );
 		}
    	
  } else {
    Titanium.API.info(' * scrollView Y offset is null');
  }
});



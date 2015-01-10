//
//	Waterbowl App
//		:: placeoverview.js
//	
//	Created by Mihai Peteu Oct 2014
//	(c) 2014 waterbowl
//

//================================================================================
//		Name:			getMarks( place_ID, callbackFunction )
//		Purpose:		get latest user-provided marks
//================================================================================
function getMarks( place_ID, callbackFunction ) {
	Ti.API.info("* getMarks() called *");
	var query = Ti.Network.createHTTPClient();
	var params = {
		place_ID	: place_ID
	};
	/*
	query.open("POST", "http://waterbowl.net/mobile/marks-mapshow.php");	
	query.send( params );
	query.onload = function() {
		var jsonResponse = this.responseText;
		var activityData = new Array();												// create empty object container
									
		if (jsonResponse != "" ) {
			var activity = JSON.parse( jsonResponse );
			callbackFunction(activity, place_ID);	
		}
	};
	*/
}

//================================================================================
//		Name:			getRecentEstimates( place_ID, callbackFunction )
//		Purpose:		get latest user-provided estimates
//================================================================================
function getRecentEstimates( place_ID, callbackFunction ) {
	Ti.API.info("* getRecentEstimates() called *");
	var query = Ti.Network.createHTTPClient();
	var params = {
		place_ID	: place_ID, 
		enclosure_count : 2
	};
	
	query.open("POST", "http://waterbowl.net/mobile/get-recent-estimates.php");	
	query.send( params );
	query.onload = function() {
		var jsonResponse = this.responseText;
		var activityData = new Array();												// create empty object container
									
		if (jsonResponse != "" ) {
			var activity = JSON.parse( jsonResponse );
			
			callbackFunction(activity, place_ID);	
		}
	};
}

//================================================================================
//		Name:			displayRecentEstimates( data )
//		Purpose:	add place estimate modules to Window and fill them in w/ data
//================================================================================
function displayRecentEstimates(activity, place_ID) {
	Ti.API.debug( ">>>>>>>>>>> activity.payload.length : " + activity.payload.length);
	// +=== last_estimate_view (in XML) =========+
	// |  +-thumb-+ +-- middle --+ +-- right--+  |
	// |  |       | |            | |          |  |
	// |  |       | |            | |          |  |
	// |  |       | |            | |          |  |		
	// |  +-------+ +------------+ +----------+  |		
	// +=========================================+
	
	if( activity.payload.length > 0) {	
		var large_dog_section_header = myUiFactory.buildSectionHeader("large_dog", "Large Dog Area", 0);
		$.activity.add(large_dog_section_header);
		// var photo_url = MYSESSION.AWS.url_base+ '/' +MYSESSION.AWS.bucket_profile+ '/' +activity[0].dog_photo;
		var photo_url = MYSESSION.WBnet.url_base+ '/' +MYSESSION.WBnet.bucket_profile + '/' +activity[0].dog_photo;		
		// Create latest estimate: dog's photo, name, timestamp, and most recent park estimate
		var last_estimate_large = myUiFactory.buildTableRowHeader("most_recent_update", photo_url, activity[0].dog_name, activity[0].time_elapsed, activity[0].amount, activity[0].amount_suffix);
		$.activity.add(last_estimate_large);
		
		var small_dog_section_header = myUiFactory.buildSectionHeader("small_dog", "Small Dog Area", 0);
		$.activity.add(small_dog_section_header);
		// Create latest estimate: dog's photo, name, timestamp, and most recent park estimate
		var last_estimate_small = myUiFactory.buildTableRowHeader("most_recent_update", photo_url, activity[0].dog_name, activity[0].time_elapsed, activity[0].amount, activity[0].amount_suffix);
		$.activity.add(last_estimate_small);
		
		if( activity.payload.length > 1) {				// if there are multiple estimates to be seen at this park
			var more_btn = myUiFactory.buildFullRowButton("more_btn", "more >"); 
			more_btn.addEventListener('click', function(){
	 			Ti.API.info("...[+] Estimate History button clicked");
				// TODO:  Create gray "see more >" button 
				// 				package estimate info in args._estimates, open if clicked
				var necessary_args = {
					_place_ID  : place_ID
				};
				// createWindowController( "marks", "", "slide_left" );
				createWindowController( "viewparkestimate", necessary_args, "slide_left" );
			});
			$.activity.add(more_btn);
		} 	
	}
	else {
		var nothing_here = myUiFactory.buildLabel( "No recent estimates provided", "100%", this._height_one_row+10, myUiFactory._text_label_large );	
		$.activity.add(nothing_here);
		Ti.API.info(" * no estimates provided... * ");
	}
	var estimate_btn = myUiFactory.buildFullRowButton("estimate_btn", "update >"); 
	estimate_btn.addEventListener('click', function(){
    Ti.API.info("...[+] Estimate Update button clicked");
		var necessary_args = {
			_place_ID    : place_ID,
			_place_index : place_index
		};
		// createWindowController( "marks", "", "slide_left" );
		createWindowController( "provideestimate", necessary_args, "slide_left" );
	});
	$.activity.add(estimate_btn);
}

//====================================================================================================
//		Name:				buildCheckinsList(dataArray, parentObject)
//		Purpose:		replace full size header w/ smaller version upon downward scroll
//====================================================================================================
function buildCheckinsList(data, parentObject) {
	// Ti.API.debug(".... [~] buildActivityList ["+JSON.stringify(data) +"]");
 	/* got stuff to show!  */
  if( data.length > 0) {
  	Ti.API.debug(".... [~] buildActivityList:: found ["+ data.length +"] dog(s) ");
  	var how_many_bar = myUiFactory.buildInfoBar( "", "Currently here",  data.length );;
    parentObject.add(how_many_bar);
    
    var thumb_height = myUiFactory.getDefaultThumbSize();
    var row_height   = myUiFactory.getDefaultRowHeight();

  	if( data.length > 4) {
  		// size up parent container so that we can fit two rows, up to 8 thumbnails
  		parentObject.height = (thumb_height * 2) + row_height + 12;  	
  	}
  	else
      parentObject.height = thumb_height + row_height + 8;
      
    for (var i=0, len=data.length; i<len; i++) {		// only calculate array size once
		  var border = 0; 			// this is nobody we know by default (0=other, 1=me, 2=friends)
		  
		  if(data[i].dog_ID == MYSESSION.dog.dog_ID)
		  	border = 1;
		  	
		 	var dog_image = MYSESSION.WBnet.url_base + '/' + MYSESSION.WBnet.bucket_profile + '/' + data[i].photo;
		  var dog_thumb = myUiFactory.buildImageThumb("dog_thumb_"+i, dog_image, border);
		
		  parentObject.add(dog_thumb);
		  if (i>7)
		  	break;
		}
		if(data.length > 7) {
			var how_many_more_text = data.length - 7;
			var how_many_more =  Ti.UI.createLabel( {text:"and "+how_many_more_text+" more", color: "#ec3c95" } );
			$.addClass(how_many_more, "thumbnail");
			how_many_more.image = "";
			parentObject.add(how_many_more);
		}				
  }
  /*  got nathin' */
  else {
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
//		Name:				getPlaceCheckins(place_ID, dog_ID)
//		Purpose:		
//================================================================================
function getPlaceCheckins( place_ID, dog_ID, parent_view ) {
	Ti.API.info(".... .... getPlaceCheckins [place_ID, dog_ID] ["+ place_ID+", "+dog_ID+"] ");
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
	
			if ( place.here==1 ) {
				MYSESSION.dog.current_place_ID = place_ID;
		    // TODO:  checkout button should be globally available
				// populate checkout button + listener
				// drawCheckoutButton();
			}
			/*  use the current checkins to build the activityList  */
      buildCheckinsList(place.checkins, parent_view);
		}
	};
  return "";	
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
var place_index = args._index;

var poiInfo = MYSESSION.allPlaces[place_index];
var how_close = getDistance( MYSESSION.geo.lat, MYSESSION.geo.lon, poiInfo.lat, poiInfo.lon );
//alert( how_close + " miles");
//Ti.API.info (  " *  placeArray[" + args._place_ID +"], "+ JSON.stringify( poiInfo )  );

//----------------------------------------------------------------------------
//
//		(_2_)		Populate place header
//
//----------------------------------------------------------------------------
var bg_image = "images/missing/place-header.png";
$.headerContainer.backgroundImage = bg_image;

if ( poiInfo.banner != "" ) {
	//bg_image = MYSESSION.AWS.url_base+'/'+MYSESSION.AWS.bucket_place+'/'+poiInfo.banner;
	bg_image = MYSESSION.WBnet.url_base + '/' + MYSESSION.WBnet.bucket_banner + '/' + poiInfo.banner;
		 
	/*  image preloader of sorts  */
	var c = Titanium.Network.createHTTPClient();
	c.setTimeout(4000);
	c.onload = function() {
	    if(c.status == 200) {
	     	$.headerContainer.backgroundImage = this.responseData;
	    }
	};
	c.open('GET', bg_image);
	c.send();
	Ti.API.info ( "...(i) banner image [ "+ bg_image +" ]");
}


/*  fill in header and miniheader information */
$.place_dist_label.text 	= poiInfo.dist + " miles away";   // TODO: send in distance in miles from backend
//$.mini_place_dist_label.text 	= poiInfo.dist + " mi away"; 

$.place_name_label.text 			= poiInfo.name;
$.place_address_label.text		=	poiInfo.address;
$.place_city_label.text	  		=	poiInfo.city + ' ' + poiInfo.zip;
$.mini_place_name_label.text 	= poiInfo.name;
$.miniHeaderContainer.backgroundColor = poiInfo.icon_color;
$.mini_place_second_label.text	=	poiInfo.city;  // + ' ('+ poiInfo.dist + " mi away)";

//----------------------------------------------------------------------------------------------------------
//		(_3_)		CHECKINS
//----------------------------------------------------------------------------------------------------------
var whos_here_section_header = myUiFactory.buildSectionHeader("whos_here", "ACTIVITY", 1);
$.activity.add(whos_here_section_header);

// the thumbs of dogs have to display inline-block (and wrap) 
var whos_here_height = (myUiFactory.getDefaultRowHeight()*2) + 10;
var whos_here_list = myUiFactory.buildViewContainer("whos_here_list", "horizontal", "100%", whos_here_height, 0);	
$.activity.add(whos_here_list);

/* 	get feed of checkins, including your current checkin status; 
		add the list to the view we've just created 												*/
Ti.API.info( "looking for checkins at place_ID ["+ args._place_ID + "]" );
getPlaceCheckins( args._place_ID, MYSESSION.dog.dog_ID, whos_here_list);	


// TODO:  _gradually_ move all code from Line 40-96 to below; change it up to use class stuff

//----------------------------------------------------------------------------------------------------------
//    (_4_)	  ESTIMATES (only if dog park)  
//----------------------------------------------------------------------------------------------------------
if (poiInfo.category==600 || poiInfo.category==601) {
	// TODO:  redo this using class methods
	getRecentEstimates( args._place_ID, displayRecentEstimates );	
}

//----------------------------------------------------------------------------
//		(_6_)	  MARKS
//----------------------------------------------------------------------------
var marks_header = myUiFactory.buildSectionHeader("marks", "MARKS", 1);
$.marks.add(marks_header);

//----------------------------------------------------------------------------
//		(_6_)	 ScrollView listener (+ attach sticky mini-header bar)
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



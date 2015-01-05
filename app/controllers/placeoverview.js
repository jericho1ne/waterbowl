//
//	Waterbowl App
//		:: placeoverview.js
//	
//	Created by Mihai Peteu Oct 2014
//	(c) 2014 waterbowl
//

//================================================================================
//		Name:			getPlaceEstimates( place_ID )
//		Purpose:		get latest user-provided estimates
//================================================================================
function getPlaceEstimates( place_ID ) {
	Ti.API.info("* getPlaceEstimates() called *");
	var query = Ti.Network.createHTTPClient();
	var params = {
		place_ID	: place_ID
	};
	
	query.open("POST", "http://waterbowl.net/mobile/get-place-activity.php");	
	query.send( params );
	query.onload = function() {
		var jsonResponse = this.responseText;
		var activityData = new Array();												// create empty object container
									
		if (jsonResponse != "" && jsonResponse !="[]") {
			var activity = JSON.parse( jsonResponse );
			displayPlaceEstimates(activity, place_ID);	
		}
	};
}

//================================================================================
//		Name:			displayPlaceEstimates( data )
//		Purpose:	add place estimate modules to Window and fill them in w/ data
//================================================================================
function displayPlaceEstimates(activity, place_ID) {
	
	
	//================== BLANK TEMPLATE FOR MOST RECENT ESTIMATE======================
	//					CREATE LATEST FEED ITEM 						
  //
	// +=== last_estimate_view (in XML) ==============+
	// |  +-thumb-+ +-- middle --+ +-- right-------+  |
	// |  |       | |            | |   rightLabelT |  |
	// |  |       | |            | |               |  |
	// |  |       | |            | |   rightLabelT |  |		
	// |  +-------+ +------------+ +---------------+  |		
	// +==============================================+
	// LEFT
	var thumb 	= Ti.UI.createImageView();
	$.addClass( thumb, "thumbnail border_red");
 	// MIDDLE
 	var middle 	= Ti.UI.createView();
	$.addClass( middle, "middle_view border");
 	// RIGHT
 	var right 	= Ti.UI.createView({ text: "???" });
	$.addClass( right, "right_view border");
	// just "latest update" text 
 	var latest_update_static 	= Ti.UI.createLabel({ text: "latest update" });
	$.addClass( latest_update_static, "feed_label_left text_medium_light");
 
	// MIDDLE
	// TODO:  buildNameLabel
	var dog_name_label 			= Ti.UI.createLabel({text: "None so far ...", top: 0});
	$.addClass( dog_name_label, "feed_label_left_md text_medium_bold");
		
	var time_elapsed_label 	= Ti.UI.createLabel({text: "Be the first!", top: 0});
	$.addClass( time_elapsed_label, "feed_label_left text_smal_bold");
	
	// RIGHT
	var dogs_amount_label 	= Ti.UI.createLabel({text: "...", top: 4, width: "100%" });
	$.addClass( dogs_amount_label, "feed_label_center_lg text_number");

 	/*					POPULATE LATEST FEED ITEM 					*/
	//var last_update_photo = MYSESSION.AWS.url_base+ '/' +MYSESSION.AWS.bucket_profile+ '/' +activity[0].dog_photo;
	var last_update_photo = MYSESSION.WBnet.url_base+ '/' +MYSESSION.WBnet.bucket_profile + '/' +activity[0].dog_photo;
	Ti.API.info( "latest update photo: " + last_update_photo  );
	 
	thumb.image = last_update_photo;												// TODO: change storage location	
	dog_name_label.text 			= activity[0].dog_name;				// dog that provided most recent update
	time_elapsed_label.text 	= activity[0].time_elapsed;		// dog that provided most recent update
	dogs_amount_label.text 		= activity[0].amount;					// dog that provided most recent update
	
	var dogs_suffix_text = "dogs here";
	if	( activity[0].amount == 1)
		dogs_suffix_text = "dog here";
		
	var dogs_amount_suffix = Ti.UI.createLabel({text: dogs_suffix_text, top: -2});
	$.addClass( dogs_amount_suffix, "feed_label_center text_medium_light");
	
	middle.add ( dog_name_label );				// add most recent update info to middle and right views
	middle.add ( time_elapsed_label );
	middle.add ( dogs_amount_label );
	middle.add ( dogs_amount_suffix );	
 	//================== END BLANK TEMPLATE FOR MOST RECENT ESTIMATE======================
	
	
	
	/* ensure that there is more than 1 estimate for this park */
	if( activity.length > 1) {
		var more_btn = myUiFactory.buildSmallButton("more_btn", "more >"); 
		Ti.API.debug( "***********temp_button **********" + JSON.stringify(more_btn) );
 		more_btn.addEventListener('click', function(){
 			Ti.API.info("...[+] Estimate History button clicked");
			// TODO:  Create gray "see more >" button 
			// 				package estimate info in args._estimates, open if clicked
			var necessary_args = {
				_place_ID  : place_ID,
				_estimates : activity
			};
			// createWindowController( "marks", "", "slide_left" );
			createWindowController( "viewparkestimate", "", "slide_left" );
		});
		right.add(more_btn);
	} 
	else {
			$.latest_update_static.text = "";
			$.last_update_middle.add ( dog_name_label );	
			$.last_update_middle.add ( time_elapsed_label );
			Ti.API.info(" * no estimates provided... * ");
	}

	// put all the elements together, minding the hierarchy
 	$.container_last_estimate.add(thumb);
 	$.container_last_estimate.add(middle);
  $.container_last_estimate.add(right);		
}

//====================================================================================================
//		Name:				buildActivityList(dataArray, parentObject)
//		Purpose:		replace full size header w/ smaller version upon downward scroll
//====================================================================================================
function buildActivityList(data, parentObject) {
	Ti.API.debug(".... [~] buildActivityList ["+JSON.stringify(data) +"]");
  // WHO'S HERE LIST
  // TODO:  need two labels inside dog_count_container View
  // eg:  CURRECT CHECKINGS (Raleway regular):  6 (Raleway bold)
  /*var dog_count_banner =  Ti.UI.createLabel( {text:"and "+data.length+" more", color: "#ec3c95" } );
	$.addClass(dog_count_banner, "");
	parentObject.add(dog_count_banner);
	*/
  if( data.length > 0) {
  	Ti.API.debug(".... [~] buildActivityList:: found ["+ data.length +"] dog");
  	if( data.length > 4) {
  		// size up parent container so that we can fit two rows, up to 8 thumbnails
  		parentObject.height = parentObject.height * 2;  	
  	}
    for (var i=0, len=data.length; i<len; i++) {		// only calculate array size once
		  var border = 0; 			// this is nobody we know by default (0=other, 1=me, 2=friends)
		  
		  if(data[i].dog_ID == MYSESSION.dog.dog_ID)
		  	border = 1;
		  	
		 	var dog_image = MYSESSION.WBnet.url_base + '/' + MYSESSION.WBnet.bucket_profile + '/' + data[i].photo;
		  var dog_thumb = myUiFactory.buildImageView("dog_thumb_"+i, dog_image, border);
		
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
      buildActivityList(place.checkins, parent_view);
		}
	};
  return "";	
}


//===========================================================================================
// 				LOGIC FLOW
//-----------------------------------------------------------------------
//
//		(0)		Add window to global stack, display menubar
//
//-----------------------------------------------------------------------
var myUiFactory = new UiFactoryModule.UiFactory();
var mini_header_display = 0;

//--------------------------------------------------------------------------------
//
//		(1)		Grab incoming variables, set header image and title, build miniheader
//
//--------------------------------------------------------------------------------
var args 	= arguments[0] || {};
Ti.API.debug ("args._index :" + args._index );
var poiInfo = MYSESSION.allPlaces[args._index];
Ti.API.info (  " *  placeArray[" + args._place_ID +"], "+ JSON.stringify( poiInfo )  );
var how_close = getDistance( MYSESSION.geo.lat, MYSESSION.geo.lon, poiInfo.lat, poiInfo.lon );
// alert( how_close + " miles");

//----------------------------------------------------------------------------
//
//		(2)		Populate place header
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
//
//		(3)		Add the rest of the view containers
//
//----------------------------------------------------------------------------------------------------------
var whos_here_section_header = myUiFactory.buildSectionHeader("whos_here", "WHO'S HERE");
$.scrollView.add(whos_here_section_header);

// the thumbs of dogs have to display inline-block (and wrap) 
var whos_here_height = (myUiFactory.getDefaultRowHeight()*2) + 10;
var whos_here_list = myUiFactory.buildViewContainer("whos_here_list", "horizontal", whos_here_height);	
$.scrollView.add(whos_here_list);

/* 	get feed of checkins, including your current checkin status; 
		add the list to the view we've just created 												*/
Ti.API.info( "looking for checkins at place_ID ["+ args._place_ID + "]" );
getPlaceCheckins( args._place_ID, MYSESSION.dog.dog_ID, whos_here_list);	

var large_dog_section_header = myUiFactory.buildSectionHeader("large_dog", "LARGE DOG AREA");
$.scrollView.add(large_dog_section_header);

// TODO:  _gradually_ move all code from Line 40-96 to below; change it up to use class stuff





//----------------------------------------------------------------------------------------------------------
//    (4)		Most recent estimates
//----------------------------------------------------------------------------------------------------------
// only show Park Estimates if this is indeed a dog park
if (poiInfo.category==601) {
	// TODO:  redo this using class methods
	// getPlaceEstimates( args._place_ID );
	
	/* get feed of estimates */
	//var estimates_section_header = createSectionHeader( "estimates", "park_estimates_label", "PARK ESTIMATES" );
	
	/*
	var park_estimates_label = Ti.UI.createLabel( {id: "park_estimates_label", text: "PARK ESTIMATES"} );
	$.addClass(park_estimates_label, "section_header bg_dk_gray text_medium_medium white");
	$.estimates.add(park_estimates_label);
	
	//estimates_section_header.add(estimates_section_header);
	*/
}

//----------------------------------------------------------------------------
//
//		(3)		Checkin/Checkout button attach + related button listeners
//
//----------------------------------------------------------------------------
/* if (typeof MYSESSION.nearbyPlaces != 'undefined') {
	for (var j=0; j < MYSESSION.nearbyPlaces.length; j++) {
		nearbyPlaceIDs.push( MYSESSION.nearbyPlaces[j].id );
	}
}*/

/*  if we are nearby this place, show manual checkin button   */
/*
if ( how_close < MYSESSION.proximity )  {   
	//	originally we checked for current place IDs presence in nearbyPlaceIDs array
	//	>> nearbyPlaceIDs.indexOf( args._place_ID ) != -1
	//alert("this is nearby!");
	
	var checkinBtn = Ti.UI.createButton ( { 
		id: "checkinBtn", width: 48, height: 48, top: 10, title: "j", backgroundColor: '#58c6d5', borderRadius: 10,
		font:{ fontFamily: 'Sosa-Regular', fontSize: 32 }, color: "#ffffff", 		// 
		textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER, verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER
	} );
	
	$.checkboxHeader.add( checkinBtn );
	MYSESSION.checkinInProgress = true;
	// checkin now officially in progress  <-- TODO: move to checkin.js
	
	checkinBtn.addEventListener('click', function(e) {
		var checkinPage = Alloy.createController("checkin", {
			_place_ID : args._place_ID			// pass in place ID!
		}).getView();
			
		MYSESSION.previousWindow = "placeoverview";
		MYSESSION.currentWindow = "checkin";
		checkinPage.open({
			transition : Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT
		});
	});
} */

///----------------------------------------------------------------------------
//
//		(4)	 ScrollView listener (+ attach sticky mini-header bar)
//
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


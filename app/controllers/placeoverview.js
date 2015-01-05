//
//	Waterbowl App
//		:: placeoverview.js
//	
//	Created by Mihai Peteu Oct 2014
//	(c) 2014 waterbowl
//

//================================================================================
//		Name:			drawCheckoutButton( )
//		Purpose:		add checkout button if we're currently checked in here
//================================================================================
function drawCheckoutButton () {
	//var checkoutBtn = Ti.UI.createButton ( { id: "checkoutBtn", width: 48, height: 48, backgroundImage: "images/icons/checkbox.png" } );
	var checkoutBtn = Ti.UI.createButton ( { 
		id: "checkoutBtn", width: 48, height: 48, top: 10, title: "~", backgroundColor: '#ec3c95', borderRadius: 10,
		font:{ fontFamily: 'Sosa-Regular', fontSize: 32 }, color: "#ffffff", 
		textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER, verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER
	} );
	
	$.checkboxHeader.add( checkoutBtn );
	checkoutBtn.addEventListener('click', function() {	
		var optns = {// build up Checkin modal popup
			options : ['Yes', 'Cancel'],
			cancel : 1,
			selectedIndex : 0,
			destructive : 0,
			title : 'Are you leaving ' + poiInfo['name'] + '?'
		};
		var checkout_dialog = Ti.UI.createOptionDialog(optns);
	
		/* add click listener for "Yes" button */
		checkout_dialog.addEventListener('click', function(e) {// take user to Checkin View
			if (e.index == 0) {			// user clicked OK
				// MYSESSION.dog.current_place_ID = null;
				// MYSESSION.checkedIn = null;
				 
				// ping backend w/ place_ID, owner_ID, dog_ID to check yo self out
		    checkoutFromPlace( poiInfo['id'] );	
		    closeWindowController();
			}
		});
		checkout_dialog.show();
	});	
}	

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
	
 	var latest_update_static 	= Ti.UI.createLabel({ text: "latest update" });
	$.addClass( latest_update_static, "feed_label_left text_medium_light");
 	

	/*			CREATE BLANK TEMPLATE FOR LATEST FEED ITEM 				*/
	// MIDDLE
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
	
 	
	/* ensure that there is more than 1 estimate for this park */
	if( activity.length > 1) {
		var temp_button = Ti.UI.createButton({ 
			font:{ fontFamily: 'Raleway', fontSize: 10 }, title: "more >",
			height : '20', width : '60', borderRadius: 6, 
			color : '#ffffff', backgroundColor : "#ec3c95"
		});
				
 		temp_button.addEventListener('click', function(){
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
		right.add(temp_button);
	} 
	else {
			$.latest_update_static.text = "";
			$.last_update_middle.add ( dog_name_label );	
			$.last_update_middle.add ( time_elapsed_label );
			Ti.API.info(" * no estimates provided... * ");
	}

	// put all the elements together, minding the hierarchy
 	$.latest_estimate_container.add(thumb);
 	$.latest_estimate_container.add(middle);
  $.latest_estimate_container.add(right);		
}

//====================================================================================================
//		Name:				buildActivityList(place_ID)
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
		  // var dog_item_view =  Ti.UI.createView();
		  var dog_thumb =  Ti.UI.createImageView();
		 	// careful with assignment order, classes below have PRESET image placeholder
		  $.addClass( dog_thumb, "thumbnail");  
		  if(data[i].dog_ID == MYSESSION.dog.dog_ID)
		  	$.addClass( dog_thumb, "border_pink");
		 
		  // grab actual photo LAST
		  dog_thumb.image = MYSESSION.WBnet.url_base + '/' + MYSESSION.WBnet.bucket_profile + '/' + data[i].photo;
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
function getPlaceCheckins( place_ID, dog_ID ) {
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
      buildActivityList(place.checkins, $.activityList);
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
var myFactory = new UiFactoryModule.UiFactory();


var mini_header_display = 0;

//--------------------------------------------------------------------------------
//
//		(1)		Grab incoming variables, set header image and title, build miniheader
//
//--------------------------------------------------------------------------------
var args 	= arguments[0] || {};
Ti.API.debug ("args._index :" + args._index );

var poiInfo = MYSESSION.allPlaces[args._index];
// alert( " Args passed: "+JSON.stringify(args) );

var how_close = getDistance( MYSESSION.geo.lat, MYSESSION.geo.lon, poiInfo.lat, poiInfo.lon );
// alert( how_close + " miles");

Ti.API.info (  " *  placeArray[" + args._place_ID +"], "+ JSON.stringify( poiInfo )  );

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

var large_dog_section_header = myFactory.buildSectionHeader("", "LARGE DOG AREA");
$.scrollView.add(large_dog_section_header);
//----------------------------------------------------------------------------------------------------------
//
//		(3)		Who else is here?
//
//----------------------------------------------------------------------------------------------------------
// <TableView id="activityList" separatorStyle="Titanium.UI.iPhone.TableViewSeparatorStyle.NONE" width="100%" class="border_yel" />


//----------------------------------------------------------------------------------------------------------
//    (4)		Most recent estimates
//----------------------------------------------------------------------------------------------------------
/* get feed of checkins, including your current checkin status */
Ti.API.info( "looking for checkins at place_ID ["+ args._place_ID + "]" );
getPlaceCheckins( args._place_ID, MYSESSION.dog.dog_ID );	

// only show Park Estimates if this is indeed a dog park
if (poiInfo.category==601) {
	getPlaceEstimates( args._place_ID );
	
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


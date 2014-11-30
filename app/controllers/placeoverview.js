//
//	Waterbowl App
//		:: placeoverview.js
//	
//	Created by Mihai Peteu Oct 2014
//	(c) 2014 waterbowl
//

//================================================================================
//		Name:				drawCheckoutButton( )
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
			title : 'Are you leaving ' + placeInfo['name'] + '?'
		};
		var checkout_dialog = Ti.UI.createOptionDialog(optns);
	
		/* add click listener for "Yes" button */
		checkout_dialog.addEventListener('click', function(e) {// take user to Checkin View
			if (e.index == 0) {			// user clicked OK
				// mySession.checkin_place_ID = null;
				// mySession.checkedIn = null;
				 
				// TODO: ping backend w/ place_ID, owner_ID, dog_ID 
				checkoutFromPlace( placeInfo['id'] );	
			}
		});
		checkout_dialog.show();
	});	
}	

//================================================================================
//		Name:				getPlaceActivity( place_ID )
//		Purpose:		get latest checkins
//================================================================================
function getPlaceActivity( place_ID ) {
	Ti.API.info("* getPlaceActivity() called *");
	var query = Ti.Network.createHTTPClient();
	var params = {
		place_ID	: place_ID
	};
	
	query.open("POST", "http://waterbowl.net/mobile/place-activity.php");	
	query.send( params );
	query.onload = function() {
		var jsonResponse = this.responseText;
		var activityData = new Array();												// create empty object container
		
		// TODO:  save place feeds incrementally to placeArray[x]['feed'] as they become available
		// TODO:  Ti.App.Properties or to 
		
		/*			CREATE BLANK TEMPLATE FOR LATEST FEED ITEM 				*/
		var dog_name_label 			= Ti.UI.createLabel({text: "None so far ...", top: 0});
		$.addClass( dog_name_label, "feed_label_left_md text_medium_bold");
		
		var time_elapsed_label 	= Ti.UI.createLabel({text: "Be the first!", top: 0});
		$.addClass( time_elapsed_label, "feed_label_left text_medium_bold");
		
		var dogs_amount_label = Ti.UI.createLabel({text: "...", top: 4, width: "100%" });
		$.addClass( dogs_amount_label, "feed_label_center_lg text_number");
					
		if (jsonResponse != "" && jsonResponse !="[]") {
			var activity = JSON.parse( jsonResponse );
			/*					POPULATE LATEST FEED ITEM 					*/
			var last_update_photo = mySession.AWS.url_base+ '/' +mySession.AWS.bucket_profile+ '/' +activity[0].dog_photo;
			Ti.API.info( "latest update photo: " + last_update_photo  );
			 
			$.last_update_thumb.image = last_update_photo;					// TODO: change storage location	
			dog_name_label.text 			= activity[0].dog_name;				// dog that provided most recent update
			time_elapsed_label.text 	= activity[0].time_elapsed;		// dog that provided most recent update
			dogs_amount_label.text 		= activity[0].amount;					// dog that provided most recent update
			
			var dogs_suffix_text = "dogs here";
			if	( activity[0].amount == 1)
				dogs_suffix_text = "dog here";
				
			var dogs_amount_suffix = Ti.UI.createLabel({text: dogs_suffix_text, top: -2});
			$.addClass( dogs_amount_suffix, "feed_label_center text_medium_light");
			
			$.last_update_middle.add ( dog_name_label );				// add most recent update info to middle and right views
			$.last_update_middle.add ( time_elapsed_label );
			$.last_update_right.add ( dogs_amount_label );
			$.last_update_right.add ( dogs_amount_suffix );
			
			activity.sort(function(a,b) {			// 		sort updates based on datetime posted
			  return b.rank - a.rank;
			});
			
			var max = 10;		// activity.length;
		
			/* ensure that there is more than 1 recent checkin */
			if( activity.length > 1) {
				for (var i=1; i<activity.length; i++) {		// optimize loop to only calculate array size once
					///////////// CREATE INDIVIDUAL FEED ITEM  ////////////////////////////////////
					var feed_item_view =  Ti.UI.createView();
					$.addClass( feed_item_view, "feed_item");
					
					///////////// MIDDLE VIEW OF STUFF ////////////////////////////////////////////
					var middle_view = Ti.UI.createView ();
					$.addClass( middle_view, "middle_view");
					
					var thumb = Ti.UI.createImageView ();
					$.addClass( thumb, "thumbnail_sm");
					
					// TODO: change storage location	*ERROR* here
					thumb.image = mySession.AWS.url_base + '/' + mySession.AWS.bucket_profile + '/' + activity[i].dog_photo;		
					
					var status_update_label = Ti.UI.createLabel({text: "...", top: 4});
					$.addClass( status_update_label, "feed_label_left text_medium_bold");
					
					var dog_name_label = Ti.UI.createLabel({text: "..."});
					$.addClass( dog_name_label, "feed_label_left text_medium_light");
					
					status_update_label.text 	= activity[i].dog_name;			// TODO: grab other status updates instead
					
					var dog_suffix = " dogs";
					if (activity[i].amount == 1)
						dog_suffix = " dog";
					dog_name_label.text 			= "Saw " + activity[i].amount + dog_suffix;
					
					middle_view.add(status_update_label);
					middle_view.add(dog_name_label);
					
					///////// RIGHT VIEW OF STUFF ///////////////////////////
					var right_view = Ti.UI.createView();
					var time_elapsed_label = Titanium.UI.createLabel({text: "..."});
					time_elapsed_label.text = activity[i].time_elapsed;
					
					$.addClass( right_view, "right_view");
					$.addClass( time_elapsed_label, "feed_label_right text_medium_light");
					
					right_view.add( time_elapsed_label );
					///////// BUILD FEED ITEM  ///////////////////////////////////
					feed_item_view.add( thumb );
					feed_item_view.add( middle_view );
					feed_item_view.add( right_view );
					
					///////// ADD ITEM TO FEED CONTAINER ////////////////////////
					$.feedContainer.add( feed_item_view );	
					if (i>=max)
						break;	
				}
			}
			//$.feedList.data = activityData;				// populate placeList TableView (defined in XML file, styled in TSS)
		}
		else {
			$.latest_update_static.text = "";
			$.last_update_middle.add ( dog_name_label );	
			$.last_update_middle.add ( time_elapsed_label );
			Ti.API.info(" * no checkins here... * ");
		}		
	};
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
//		Name:				getPlaceInfo(place_ID)
//		Purpose:		get place header info (name, address, bg image, etc)
//================================================================================
function getPlaceInfo( place_ID, owner_ID ) {
	Ti.API.info("* getPlaceInfo("+ place_ID +") called ");
	var http_query = Ti.Network.createHTTPClient();
	var params = {
		place_ID  : place_ID,
		owner_ID	: owner_ID
	};
	
	http_query.open("POST", "http://waterbowl.net/mobile/place-info.php");	
	http_query.send( params );
	http_query.onload = function() {
		var placeJSON = this.responseText;
		Ti.API.info( " * getPlaceInfo JSON: " + placeJSON );
		
		if (placeJSON != "" && placeJSON !="[]") {
			var place = JSON.parse( placeJSON );
	
			if ( place.here==1 ) {
				mySession.checkin_place_ID = place_ID;
				
				/* populate checkout button + listener */
				drawCheckoutButton();
			}
			/*  sanity check :: only replace the stuff that hasn't loaded yet */
			/*
			if ( $.place_name_label.text == "" ) {
				if ( place['name'].length > 36)  {
					$.addClass( $.place_name_label, "text_medium_medium");
				}
				else {
					$.addClass( $.place_name_label, "text_large_medium");
				}
				$.place_name_label.text 	= place['name'];			// add place name header
			}
			if ( $.place_address_label.text == "" )
				$.place_address_label.text=	place['street_address'];		// address, city, zip
			if ( $.place_city_label.text == "")
				$.place_city_label.text	  =	place['city'] +' ' + place['zipcode'];
			if ( place['dist'] != "")
				$.place_dist_label.text 	= place['dist'] + " miles away";   
				 
			//  fill in mini header info 
			if ( $.miniHeaderPlaceName.text == "" )
				$.miniHeaderPlaceName.text = place['name'];	
			*/

		}	
	};
}


//===========================================================================================
// 				LOGIC FLOW
//-----------------------------------------------------------------------
//
//		(0)		Add window to global stack, display menubar
//
//-----------------------------------------------------------------------
addToAppWindowStack( $.placeoverview, "placeoverview" );
addMenubar( $.menubar );
	
var mini_header_display = 0;

//--------------------------------------------------------------------------------
//
//		(1)		Grab incoming variables, set header image and title, build miniheader
//
//--------------------------------------------------------------------------------
var args 	= arguments[0] || {};
Ti.API.info("* placeoverview.js { #" + args._place_ID  + " } * ");	
/*  save globally stored place info into a local variable */
var placeInfo = mySession.placeArray[ args._place_ID ];


/* HACK - show places near NextSpace */
//mySession.lat = 34.024268;
//mySession.lon = -118.394;

var how_close = getDistance( mySession.lat, mySession.lon, mySession.placeArray[args._place_ID].lat, mySession.placeArray[args._place_ID].lon );
// alert( how_close + " miles");

//Ti.API.info (  " *  placeArray[" + args._place_ID +"], "+ JSON.stringify( placeInfo )  );

//----------------------------------------------------------------------------
//
//		(2)		Populate place header + activity feed
//
//----------------------------------------------------------------------------

var bg_image = "images/missing/place-header.png";
$.headerContainer.backgroundImage = bg_image;

if ( placeInfo.banner != "" ) {
	bg_image = mySession.AWS.url_base+'/'+mySession.AWS.bucket_place+'/'+placeInfo.banner;
	/*  image preloader of sorts  */
	var c = Titanium.Network.createHTTPClient();
	c.setTimeout(10000);
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
$.place_dist_label.text 	= placeInfo.dist + " miles away";   // TODO: send in distance in miles from backend
//$.mini_place_dist_label.text 	= placeInfo.dist + " mi away"; 

$.place_name_label.text 			= placeInfo.name;
$.place_address_label.text		=	placeInfo.address;
$.place_city_label.text	  		=	placeInfo.city + ' ' + placeInfo.zip;
$.mini_place_name_label.text 	= placeInfo.name;
$.mini_place_second_label.text	=	placeInfo.city;  // + ' ('+ placeInfo.dist + " mi away)";

/* get feed of checkins, including your current checkin status */
Ti.API.info( "CALLING PLACE INFO WITH THESE GUYS: "+ args._place_ID + " / " + mySession.user.owner_ID );
getPlaceInfo( args._place_ID, mySession.user.owner_ID );		 
/* get feed of estimates */
getPlaceActivity( args._place_ID );

//----------------------------------------------------------------------------
//
//		(3)		Checkin/Checkout button attach + related button listeners
//
//----------------------------------------------------------------------------
/*
if (typeof mySession.placesInGeofence != 'undefined') {
	for (var j=0; j < mySession.placesInGeofence.length; j++) {
		nearbyPlaceIDs.push( mySession.placesInGeofence[j].id );
	}
}
*/

/*  if we are nearby this place, show manual checkin button   */
/*
if ( how_close < mySession.proximity )  {   
	//	originally we checked for current place IDs presence in nearbyPlaceIDs array
	//	>> nearbyPlaceIDs.indexOf( args._place_ID ) != -1
	//alert("this is nearby!");
	
	var checkinBtn = Ti.UI.createButton ( { 
		id: "checkinBtn", width: 48, height: 48, top: 10, title: "j", backgroundColor: '#58c6d5', borderRadius: 10,
		font:{ fontFamily: 'Sosa-Regular', fontSize: 32 }, color: "#ffffff", 		// 
		textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER, verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER
	} );
	
	$.checkboxHeader.add( checkinBtn );
	mySession.checkinInProgress = true;
	// checkin now officially in progress  <-- TODO: move to checkin.js
	
	checkinBtn.addEventListener('click', function(e) {
		var checkinPage = Alloy.createController("checkin", {
			_place_ID : args._place_ID			// pass in place ID!
		}).getView();
			
		mySession.previousWindow = "placeoverview";
		mySession.currentWindow = "checkin";
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
    var threshold = 210;
   
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


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
		
		/*			CREATE BLANK TEMPLATE FOR LATEST FEED ITEM 				*/
		var dog_name_label 			= Ti.UI.createLabel({text: "None so far ...", top: 0});
		$.addClass( dog_name_label, "feed_label_left_md");
		
		var time_elapsed_label 	= Ti.UI.createLabel({text: "Be the first!", top: 0});
		$.addClass( time_elapsed_label, "feed_label_left");
		
		var dogs_amount_label = Ti.UI.createLabel({text: "...", top: 4});
		$.addClass( dogs_amount_label, "feed_label_center_lg");
					
		if (jsonResponse != "" && jsonResponse !="[]") {
			var activity = JSON.parse( jsonResponse );
				
			/*					POPULATE LATEST FEED ITEM 					*/
			var last_update_photo = session.AWS.url_base+ '/' +session.AWS.bucket_profile+ '/' +activity[0].dog_photo;
			Ti.API.info( "latest update photo: " + last_update_photo  );
			 
			$.last_update_thumb.image = last_update_photo;							// TODO: change storage location	
			dog_name_label.text 			= activity[0].dog_name;				// dog that provided most recent update
			time_elapsed_label.text 	= activity[0].time_elapsed;		// dog that provided most recent update
			dogs_amount_label.text 		= activity[0].amount;					// dog that provided most recent update
			
			var dogs_amount_suffix = Ti.UI.createLabel({text: "dogs here", top: -1});
			$.addClass( dogs_amount_suffix, "feed_label_center");
			
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
				for (var i=1; i<max; i++) {		// optimize loop to only calculate array size once
					// Ti.API.info("* "+ activity[i].dog_name + " - " + activity[i].last_update_formatted +" *");
					// var icon = 'images/missing/dog-icon-sm.png';
				
					///////////// CREATE INDIVIDUAL FEED ITEM  ////////////////////////////////////
					var feed_item_view =  Ti.UI.createView();
					$.addClass( feed_item_view, "feed_item");
					
					///////////// MIDDLE VIEW OF STUFF ////////////////////////////////////////////
					var middle_view = Ti.UI.createView ();
					$.addClass( middle_view, "middle_view");
					
					var thumb = Ti.UI.createImageView ();
					$.addClass( thumb, "thumbnail_sm");
					thumb.image = session.AWS.url_base + '/' + session.AWS.bucket_profile + '/' + activity[i].dog_photo;		// TODO: change storage location	
					
					var status_update_label = Ti.UI.createLabel({text: "...", top: 4});
					$.addClass( status_update_label, "feed_label_left");
					
					var dog_name_label = Ti.UI.createLabel({text: "..."});
					$.addClass( dog_name_label, "feed_label_left");
					
					status_update_label.text = activity[i].dog_name + " checked in";			// TODO: grab other status updates instead
					dog_name_label.text 			= activity[i].dog_name + " saw " + activity[i].amount + " dogs 	";
					
					middle_view.add(status_update_label);
					middle_view.add(dog_name_label);
					
					///////// RIGHT VIEW OF STUFF ///////////////////////////
					var right_view = Ti.UI.createView();
					var time_elapsed_label = Titanium.UI.createLabel({text: "..."});
					time_elapsed_label.text = activity[i].time_elapsed;
					
					$.addClass( right_view, "right_view");
					$.addClass( time_elapsed_label, "feed_label_right");
					
					right_view.add( time_elapsed_label );
					///////// BUILD FEED ITEM  ///////////////////////////////////
					feed_item_view.add( thumb );
					feed_item_view.add( middle_view );
					feed_item_view.add( right_view );
					
					///////// ADD ITEM TO FEED CONTAINER ////////////////////////
					$.feedContainer.add( feed_item_view );		
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
    top: -16, opacity: 1, duration : 340
  });
  $.miniHeader.animate(a);
}

function hideMiniHeader () {
  var a = Ti.UI.createAnimation({
    top: -44, opacity: 0, duration : 220
  });
  $.miniHeader.animate(a);
}

//================================================================================
//		Name:				getPlaceInfo(place_ID)
//		Purpose:		get place header info (name, address, bg image, etc)
//================================================================================
function getPlaceInfo( place_ID ) {
	Ti.API.info("* getPlaceInfo("+ place_ID +") called ");
	var query = Ti.Network.createHTTPClient();
	var params = {
		place_ID  : place_ID,
		lat				: session.lat,
		lon				:	session.lon
	};
	
	query.open("POST", "http://waterbowl.net/mobile/place-info.php");	
	query.send( params );
	query.onload = function() {
		var placeJSON = this.responseText;
		Ti.API.info( " * Place JSON: " + placeJSON );
		if (placeJSON != "" && placeJSON !="[]") {
			var place = JSON.parse( placeJSON );

			/*  sanity check :: only replace the stuff that hasn't loaded yet */
			if ( $.place_name_label.text == "" )
				$.place_name_label.text 	= place['name'];			// add place name header
			if ( $.place_address_label.text == "" )
				$.place_address_label.text=	place['street_address'];		// address, city, zip
			if ( $.place_city_label.text == "")
				$.place_city_label.text	  =	place['city'] +' ' + place['zipcode'];
				
			if ( session.placeArray.dist != "")
				$.place_dist_label.text 	= session.placeArray.dist + " miles away";   // TODO: send in distance in miles from backend
				 
			/*  fill in mini header info */
			if ( $.miniHeaderPlaceName.text == "" )
				$.miniHeaderPlaceName.text = place['name'];	
			
			/*  only attempt to set the bg image if it exists */
			if ( place['banner'] != "" ) {
				//var banner_image = session.AWS.url_base+'/'+session.AWS.bucket_place+'/'+place['banner'];
				var banner_image = session.local_banner_path+'/'+place['banner'];
				
				$.headerContainer.backgroundImage = banner_image;		// add place header image
				Ti.API.info( " * Place banner: " + banner_image );
				alert( " * Place banner: " + banner_image );
			}
			
			/*  if viewing place details on a place we're currently, show the checkboxx!!   */
			if ( place_ID == session.checkin_place_ID && session.checkedIn == 1 ) {
				var checkoutBtn = Ti.UI.createButton ( { id: "checkoutBtn", width: 48, height: 48, backgroundImage: "images/icons/checkbox.png" } );
			
				//$.checkboxMiniHeader.image 		= "images/icons/checkbox.png";

				
				$.checkboxHeader.add( checkoutBtn );
				
				checkoutBtn.addEventListener('click', function() {	
					var optns = {// build up Checkin modal popup
						options : ['Yes', 'Cancel'],
						cancel : 1,
						selectedIndex : 0,
						destructive : 0,
						title : 'Are you leaving ' + place['name'] + '?'
					};
					var checkout_dialog = Ti.UI.createOptionDialog(optns);
				
					/* add click listener for "Yes" button */
					checkout_dialog.addEventListener('click', function(e) {// take user to Checkin View
						if (e.index == 0) {// user clicked OK
							session.checkinInProgress = false;
							session.checkin_place_ID = null;
							session.checkedIn = null;
							 
							// TODO: ping checkin.php w/ owner_ID, dog_ID, checkout_timestamp, park_ID 
							// OR simply session.dog_activity_ID, which requires checkin.php to return mysql_last_insert_ID
		
							closeWin();
							/*	
							$.placeoverview.close({
								transition : Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT
							});
							$.placeoverview = null;
							*/
						}
					});
					
					checkout_dialog.show();
				});
								
				/*
				$.checkin_button.addEventListener( "touchstart", touchStartClick );				// assign the touch start & end functions
				$.checkin_button.addEventListener( "touchend", touchEndClick );
				$.checkin_button.addEventListener( "touchcancel", touchEndClick );
				*/
				//checkin_button.text = '';				
			}
		}	
	};
}


//============================================================================
//		Name:			touchStartClick(e)
//		Purpose:		what to do upon checkin button long press
//							- creates a 350ms interval that fires click events
//================================================================================
function touchStartClick(e) {
  if ( !e.source.touchTimer ) {	
      e.source.touchTimer = setInterval(function () {
        e.source.fireEvent("click");
        longPress = 1;
        this.backgroundColor = "#ff38d9";
        this.opacity = "1";
        this.title = "Update";
        Ti.API.info("***** Long Press Start "+ longPress +"*****");
    }, 350);
  }
}

//============================================================================
//		Name:			touchStartClick(e)
//		Purpose:		what to do upon checkin button long press
//							- what do to at the end of the touchStart;  cancels the interval
//================================================================================
function touchEndClick(e) {
  if ( e.source.touchTimer ) {
    clearInterval(e.source.touchTimer);
    if (longPress == 1) {
  		longPress = 0;
  		this.backgroundColor = "#16dd0c";
  		this.opacity = "0.88";
  		Ti.API.info("***** Long Press End *****");
    }
    e.source.touchTimer = null;
  }
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

//-----------------------------------------------------------------------------
//
//		(1)		Grab incoming variables, set header image and title
//
//-----------------------------------------------------------------------------
var args 	= arguments[0] || {};
Ti.API.info("* placeoverview.js { #" + args._place_ID  + " } * ");	
/*  save globally stored place info into a local variable */
var placeInfo = session.placeArray[args._place_ID];

//----------------------------------------------------------------------------
//
//		(2)		Populate place header + activity feed
//
//----------------------------------------------------------------------------
Ti.API.info (  " * placeoverview :: placeArray[" + args._place_ID +"]"+ JSON.stringify( placeInfo )  );

$.headerContainer.backgroundImage = "images/missing/place-header.png";

if ( placeInfo.banner != "" ) {
	var bg_image = session.local_banner_path+'/'+placeInfo.banner;
	// $.headerContainer.backgroundImage 
	bg_image = session.AWS.url_base+'/'+session.AWS.bucket_place+'/'+placeInfo.banner;
	$.headerContainer.backgroundImage = bg_image;
	Ti.API.info ( "...(i) banner image [ "+ bg_image +" ]");
}

if ( placeInfo.dist != "")
	$.place_dist_label.text 	= placeInfo.dist + " miles away";   // TODO: send in distance in miles from backend
		
$.place_name_label.text 		= placeInfo.name;
$.miniHeaderPlaceName.text 	= placeInfo.name;
$.place_address_label.text	=	placeInfo.address;
$.place_city_label.text	  	=	placeInfo.city + ' ' + placeInfo.zip;

// getPlaceInfo( args._place_ID );		// ideally, only called 
getPlaceActivity( args._place_ID );

//----------------------------------------------------------------------------
//
//		(3)		Button listeners
//
//----------------------------------------------------------------------------
// TODO:  refresh / replace feed if newer posts exist
/*
$.refreshBtn.addEventListener('click', function() {			//  BACK button (aka window close)
	Ti.API.info( "* Should be refreshing the feed... *" 	);
	
});
*/

///----------------------------------------------------------------------------
//
//		(4)		Add scrollView listener (and attach sticky mini-header bar)
//
//----------------------------------------------------------------------------
$.scrollView.addEventListener('scroll', function(e) {
  if (e.y!=null) {
    var offsetY = e.y;
   
    if  ( offsetY >= 230 && offsetY != null && mini_header_display==0 ) {
    	miniHeader = attachMiniHeader();			// show the mini header
   		//Titanium.API.info(' * scrollView Y offset: ' + offsetY);
 			mini_header_display = 1;
 			Titanium.API.info( ' * miniHeader attached * ' +  mini_header_display );
    }
    else if ( offsetY < 230 && offsetY != null && mini_header_display==1) {
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


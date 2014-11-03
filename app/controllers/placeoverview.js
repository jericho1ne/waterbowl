//=================================================================================
//		Name:				attachMiniHeader(place_ID)
//		Purpose:		replace full size header w/ smaller version upon downward scroll
//=================================================================================
function attachMiniHeader () {
  var miniHeader = Titanium.UI.createView({
  	 borderRadius: 0, id: "miniHeader", 
  	 backgroundColor:'#ccc', opacity: 0.8,
  	 width:"100%", zIndex: 4,
  	 height: "100dp", top: 0
	});
	return miniHeader;
}


//================================================================================
//		Name:				getActivity(place_ID)
//		Purpose:		get latest checkins
//================================================================================
function getActivity(place_ID) {
	Ti.API.info("* getActivity() called *");
	var query = Ti.Network.createHTTPClient();
	var params = {
		place_ID : place_ID
	};
	
	query.open("POST", "http://waterbowl.net/mobile/activity.php");	
	query.send( params );
	query.onload = function() {
		var jsonResponse = this.responseText;
		var activityData = new Array();												// create empty object container
		
		if (jsonResponse != "") {
			var activityJson = JSON.parse( jsonResponse );
			
			// TODO: add appropriate classes, especially right_view
			///////////// CREATE LATEST FEED ITEM ////////////////////////////////////
			
			//var base_URL = "http://waterbowl.net/app-dev/stable/images/profile/";
			var last_update_photo = sessionVars.AWS.base_url + activityJson[0].dog_photo;
			Ti.API.info( "latest update photo: " + last_update_photo  );
			 
			$.last_update_thumb.image =  last_update_photo;		// TODO: change storage location	
		
			var dog_name_label = Ti.UI.createLabel({text: "...", top: 0});
			$.addClass( dog_name_label, "feed_label_left_md");
			dog_name_label.text = activityJson[0].dog_name;				// dog that provided most recent update
			
			var time_elapsed_label = Ti.UI.createLabel({text: "...", top: 0});
			$.addClass( time_elapsed_label, "feed_label_left");
			time_elapsed_label.text = activityJson[0].time_elapsed;				// dog that provided most recent update
			
			var dogs_amount_label = Ti.UI.createLabel({text: "...", top: 4});
			$.addClass( dogs_amount_label, "feed_label_center_lg");
			dogs_amount_label.text = activityJson[0].amount;				// dog that provided most recent update
			
			var dogs_amount_suffix = Ti.UI.createLabel({text: "dogs here", top: -1});
			$.addClass( dogs_amount_suffix, "feed_label_center");
			
			$.last_update_middle.add ( dog_name_label );				// add most recent update info to middle and right views
			$.last_update_middle.add ( time_elapsed_label );
			
			$.last_update_right.add ( dogs_amount_label );
			$.last_update_right.add ( dogs_amount_suffix );
			
			activityJson.sort(function(a,b) {			// 		sort updates based on datetime posted
			  return b.rank - a.rank;
			});
			
			var max = 10;		// activityJson.length;
		 
			for (var i=1, j=max; i<j; i++) {		// optimize loop to only calculate array size once
				// Ti.API.log("* "+ activityJson[i].dog_name + " - " + activityJson[i].last_update_formatted +" *");
				// var icon = 'images/missing/dog-icon.png';
			
				
				///////////// CREATE INDIVIDUAL FEED ITEM  ////////////////////////////////////
				var feed_item_view =  Ti.UI.createView();
				$.addClass( feed_item_view, "feed_item");
				
				///////////// MIDDLE VIEW OF STUFF ////////////////////////////////////////////
				var middle_view = Ti.UI.createView ();
				$.addClass( middle_view, "middle_view");
				
				var thumb = Ti.UI.createImageView ();
				$.addClass( thumb, "thumbnail_sm");
				thumb.image = sessionVars.AWS.base_url + activityJson[i].dog_photo;		// TODO: change storage location	
				
				var status_update_label = Ti.UI.createLabel({text: "...", top: 4});
				$.addClass( status_update_label, "feed_label_left");
				
				var dog_name_label = Ti.UI.createLabel({text: "..."});
				$.addClass( dog_name_label, "feed_label_left");
				
				status_update_label.text = activityJson[i].dog_name + " checked in";			// TODO: grab other status updates instead
				dog_name_label.text 			= activityJson[i].dog_name + " saw " + activityJson[i].amount + " dogs 	";
				
				middle_view.add(status_update_label);
				middle_view.add(dog_name_label);
				
				///////// RIGHT VIEW OF STUFF ///////////////////////////
				var right_view = Ti.UI.createView();
				var time_elapsed_label = Titanium.UI.createLabel({text: "..."});
				time_elapsed_label.text = activityJson[i].time_elapsed;
				
				$.addClass( right_view, "right_view");
				$.addClass( time_elapsed_label, "feed_label_right");
				
				right_view.add( time_elapsed_label );
				///////// BUILD FEED ITEM  ///////////////////////////////////
				feed_item_view.add( thumb );
				feed_item_view.add( middle_view );
				feed_item_view.add( right_view );
				
				///////// ADD ITEM TO FEED CONTAINER ////////////////////////
				$.feedContainer.add( feed_item_view );
	
				/*
				activityData.push( Ti.UI.createTableViewRow({			// create each TableView row of park info
					dog_ID		: activityJson[i].dog_ID,
					dog_name 	: activityJson[i].dog_name,
					owner_ID  : activityJson[i].owner_ID,
					last_update:	activityJson[i].last_update,
					title 		: activityJson[i].dog_name + " saw " + activityJson[i].amount + " dogs " +
								" - " + activityJson[i].last_update_formatted, 				
					leftImage : icon,																// icon image defined above
					hasChild : true,
					height 		: 80, 																// or: Ti.Platform.displayCaps.platformHeight * 0.04,
					left 			: 1,
					color 		: "#fff",
					width 		: 'auto',
					textAlign : 'left',
					font : {
						fontFamily : 'Helvetica',
						fontWeight : 'normal',
						fontSize : 14
					}
				})); */
					
			}
			//$.feedList.data = activityData;				// populate placeList TableView (defined in XML file, styled in TSS)
		}
	};
}

// default close window action
function closeWindow(e) {
	$.placeoverview.close();
	var lastPage = Alloy.createController( sessionVars.lastWindow ).getView();
	lastPage.open( {transition:Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT} );
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
        Ti.API.log("***** Long Press Start "+ longPress +"*****");
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
  		//this.title = "|/";
  		Ti.API.log("***** Long Press End *****");
    }
    e.source.touchTimer = null;
  }
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//
//			LOGIC FLOW
//
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
var mini_header_display = 0;
var miniHeader;
//-----------------------------------------------------------------------------
//
//		(1)		Grab incoming variables, set header image and title
//
//-----------------------------------------------------------------------------
var args 	= arguments[0] || {};
// var header_image = zeroPad( args._place_id, 4 ) . "-000001-placename.jpg";
Ti.API.log("* placeoverview.js { #" + args._place_id + " } - "+ args._place_name + " | "+ args._mobile_bg+" * ");

$.place_name_label.text = args._place_name;													// add place name header
$.place_addr_label.text =	args._place_address;											// address, city, zip
$.place_city_label.text =	args._place_city +' ' + args._place_zip;
$.place_dist_label.text = args._place_distance + " miles away";   //args._place_dist // TODO: send in distance in miles from backend

$.headerContainer.backgroundImage = "images/places/"+args._mobile_bg;		// add place header image

sessionVars.currentWindow = "placeoverview";									// set current place session variable


//----------------------------------------------------------------------------
//
//		(2)		Populate activity feed
//
//----------------------------------------------------------------------------
getActivity( args._place_id );

//----------------------------------------------------------------------------
//
//		(3)		Add back button listener
//
//----------------------------------------------------------------------------
$.backBtn.addEventListener('click', function() {			//  BACK button (aka window close)
	$.placeoverview.close( { 
		top: 800,
		opacity: 0.2,
		duration: 420, 
		curve : Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT
	} );
	$.placeoverview = null;
});

///----------------------------------------------------------------------------
//
//		(4)		Add scrollView listener (and attach sticky mini-header bar)
//
//----------------------------------------------------------------------------
$.scrollView.addEventListener('scroll', function(e) {
  if (e.y!=null) {
    var offsetY = e.y;
   
    if  ( offsetY >= 230 && offsetY != null && mini_header_display==0 ) {
    	miniHeader = attachMiniHeader();			// build the mini header
    	
    	$.placeoverview.add( miniHeader );
    	
 			Titanium.API.info(' * scrollView Y offset: ' + offsetY);
 			mini_header_display = 1;
 			Titanium.API.info( ' * miniHeader attached * ' +  mini_header_display );
    }
    else if ( offsetY < 230 && offsetY != null && mini_header_display==1) {
    	Ti.API.info (" MINIHEADER CONTENTS: "+ miniHeader);
    	miniHeader = null;  // removeMiniHeader
    	
    	Titanium.API.info(' * scrollView Y offset: ' + offsetY);
   		mini_header_display = 0;
 			Titanium.API.info( ' * miniHeader removed * ' + mini_header_display );
 		}
    	
  } else {
    Titanium.API.info(' * scrollView Y offset is null');
  }
});

//
if ( args._place_id==sessionVars.currentPlace.ID && sessionVars.checkedIn == 1 ) {
	
	
	/*
	var checkin_button = Ti.UI.createButton( { id: "checkin_button" } );
	$.addClass( checkin_button, "checkin_button");
	$.checkinButtonContainer.add( checkin_button );
	*/
	$.checkin_button.opacity = 1;
	
	$.checkin_button.addEventListener( "touchstart", touchStartClick );				// assign the touch start & end functions
	$.checkin_button.addEventListener( "touchend", touchEndClick );
	$.checkin_button.addEventListener( "touchcancel", touchEndClick );

	//checkin_button.text = '';				
}



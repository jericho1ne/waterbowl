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
//		Name:			getMarks( params, callbackFunction )
//		Purpose:		( 1, args._place_ID, MYSESSION.dog.dog_ID, displayMarks);
//================================================================================
function getMarks( params, callbackFunction ) {
	myUiFactory.loadJson(params, "http://waterbowl.net/mobile/get-place-posts.php", callbackFunction);
}

//================================================================================
//		Name:			displayMarks( data )
//		Purpose:	
//================================================================================
function displayMarks(data) {
  if( data.length>0) {	
    for (var i=0, len=data.length; i<len; i++) {
      var photo = MYSESSION.WBnet.url_base+ '/' +MYSESSION.WBnet.bucket_profile + '/' +data[i].dog_photo;		
		  var mark = myUiFactory.buildTableRow( 
		    "", photo, data[i].marking_dog_name, data[i].time_elapsed, data[i].post_text, ""
		  );
		 
		  $.marks.add(mark);
		  if ( i < (len-1) )
		   $.marks.add( myUiFactory.buildSeparator() );
    }
  }
  else {
	  var no_marks_container = myUiFactory.buildViewContainer("", "vertical", "100%", Ti.UI.SIZE, 0);	
		var no_marks_label = myUiFactory.buildLabel( "No marks have been made", "100%", this._height_row+10, myUiFactory._text_medium );	
		no_marks_container.add(no_marks_label);
		$.marks.add(no_marks_container);
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
	myUiFactory.loadJson(params, "http://waterbowl.net/mobile/get-recent-estimates.php", callbackFunction);
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
	    var dog_size_section_header = myUiFactory.buildSectionHeader("", area_type+" Area", 0);
		  $.activity.add(dog_size_section_header);
		  
		  // var photo_url = MYSESSION.AWS.url_base+ '/' +MYSESSION.AWS.bucket_profile+ '/' +data.payload[i].dog_photo;
		  if(data.payload[i].amount==-1) {
		  	var activity_icon = MYSESSION.local_icon_path+'/'+"icon-dog-intro@2x.png";
		  	var latest_estimate = myUiFactory.buildInfoBar( activity_icon, "No recent estimate", "");
		  }
		  else {
		  	var photo_url = MYSESSION.WBnet.url_base+ '/' +MYSESSION.WBnet.bucket_profile + '/' +data.payload[i].dog_photo;		
		  	var latest_estimate = myUiFactory.buildTableRowHeader("", photo_url, data.payload[i].dog_name, data.payload[i].time_elapsed, data.payload[i].amount, data.payload[i].dog_suffix);
		  }
		  $.activity.add(latest_estimate);
	  
	  }
	}
	else {
	  var nothing_here_container = myUiFactory.buildViewContainer("", "vertical", "100%", Ti.UI.SIZE, 0);	
		var nothing_here = myUiFactory.buildLabel( data.response, "100%", this._height_row+10, myUiFactory._text_medium );	
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
	var estimate_btn = myUiFactory.buildFullRowButton("estimate_btn", "update >"); 
	estimate_btn.addEventListener('click', function(){
    Ti.API.info("...[+] Estimate Update button clicked");
    var necessary_args = {
		  _place_ID    : args._place_ID,     // 601000001
	    _place_index : place_index,
      _place_name  : poiInfo.name,
      _enclosure_count : poiInfo.enclosure_count
    };
		createWindowController( "provideestimate", necessary_args, "slide_left" );
	});
	// if there are multiple estimates to be seen at this park
	var more_btn = myUiFactory.buildFullRowButton("more_btn", "more >"); 
	more_btn.addEventListener('click', function(){
			Ti.API.info("...[+] Estimate History button clicked");
		// TODO:  Create gray "see more >" button 
		// 				package estimate info in args._estimates, open if clicked
		var necessary_args = {
			_place_ID  : args._place_ID
		};
		createWindowController( "viewparkestimate", necessary_args, "slide_left" );
	});
	
	$.activity.add(estimate_btn);
	$.activity.add(more_btn);
}

//====================================================================================================
//		Name:				displayPlaceCheckins(dataArray, parentObject)
//		Purpose:		replace full size header w/ smaller version upon downward scroll
//====================================================================================================
function displayPlaceCheckins(data, parentObject) {
	Ti.API.debug(".... [~] displayPlaceCheckins:: ["+ data.checkins.length +"] ");
 	if ( data.you_are_here==1 ) {
    MYSESSION.dog.current_place_ID = place_ID;
  }
  
 	/* got stuff to show!  */
  if( data.checkins.length > 0) {
  	var how_many_bar = myUiFactory.buildInfoBar( "images/icons/icon-dog-social-dogsmet@2x.png", "Currently here",  data.checkins.length );;
    parentObject.add(how_many_bar);
   
	 	if( data.checkins.length > 4) {
  		// size up parent container so that we can fit two rows, up to 8 thumbnails
  		parentObject.height = myUiFactory._height_row * 3.6;  	
  	}
  	else if (data.checkins.length <= 4 ) {
      parentObject.height = myUiFactory._height_row * 2.3;
    }
  	
    for (var i=0, len=data.checkins.length; i<len; i++) {		// only calculate array size once
		  var border = 0; 			// this is nobody we know by default (0=other, 1=me, 2=friends)
		  
		  /* only show first 7 elements (0 through 6), leave space for "+ {__} more" cell */
			if (i>6 && data.checkins.length!=8)		
				break;
		  /*  this is my pup, his is checked in at this POI!  Give'im a border!   */
		  if(data.checkins[i].dog_ID == MYSESSION.dog.dog_ID)
		  	border = 1;
		  	
		 	var dog_image = MYSESSION.WBnet.url_base + '/' + MYSESSION.WBnet.bucket_profile + '/' + data.checkins[i].photo;
		  var dog_thumb = myUiFactory.buildProfileThumb("dog_thumb_"+i, dog_image, border, "large");
		
		  parentObject.add(dog_thumb);
		}
		/*  only if more than 8 checkins here */
		if(data.checkins.length > 8 ) {
			// Ti.API.debug(".... [~] displayPlaceCheckins:: found ["+ JSON.stringify(data.checkins.length) +"] dog(s) ");
 	
			var how_many_more_text = data.checkins.length - 7;
			var how_many_more =  Ti.UI.createLabel( {text:"and "+how_many_more_text+" more", color: "#ec3c95" } );
			$.addClass(how_many_more, "thumbnail");
			how_many_more.image = "";
			parentObject.add(how_many_more);
		}				
  }
  /*  got nathin' */
  else {
  	parentObject.height = myUiFactory._height_row * 0.9;
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

//================================================================================
//		Name:			displayBasicInfo( poiInfo, parent_view )
//		Purpose:	
//================================================================================
function displayBasicInfo(poiInfo, parent) {
	Ti.API.debug("....[~] displayBasicInfo("+poiInfo.place_ID+") called ");
}

//================================================================================
//		Name:			displayFeatures( poiInfo, parent_view)
//		Purpose:	
//================================================================================
function displayFeatures(poiInfo, parent) {
	Ti.API.debug("....[~] displayFeatures("+poiInfo.place_ID+") called ");

	var basics = { 
		size 			: poiInfo.size, 
		terrain 	: poiInfo.terrain,
		grade   	: poiInfo.grade,
		water			: poiInfo.water,
		shade			: poiInfo.shade,
		waste			: poiInfo.waste,
		offleash	: poiInfo.offleash,
		enclosures: poiInfo.enclosures,
		benches		: poiInfo.benches,
		fenced 		: poiInfo.fenced
	};
	
	Ti.API.debug("....[~] displayBasicInfo :: basics " + JSON.stringify(basics) );
	var basics_list = myUiFactory.buildViewContainer("basics_list", "vertical", "100%", Ti.UI.SIZE, 0);
	var icon_url = MYSESSION.local_icon_path+'/'+"icon-poi-basic-dogfriendliness@2x.png";
	
	var count = 0;
	var length = basics.length;
  for (var k in basics){
    if(basics[k]!="" && basics[k]!="NULL") {
    	//basics.splice(k, 1);
  		// call buildInfoBar w/ ( image_url, name, value ) 
			if (k=="enclosures")
				basics_list.add(  myUiFactory.buildInfoBar(icon_url, "", basics[k]) );
			else
				basics_list.add(  myUiFactory.buildInfoBar(icon_url, k, basics[k]) );
			//if ( count < (length-1) )
			basics_list.add( myUiFactory.buildSeparator() );
    }
    count ++;
	}
	parent.add( basics_list );  	
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
	// Ti.API.info ( "...(i) banner image [ "+ bg_image +" ]");
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
//-----------------------
//			BASIC INFO
//-----------------------
var basics_header = myUiFactory.buildSectionHeader("basics_header", "BASIC INFO", 1);
$.basic_info.add(basics_header);
displayBasicInfo(poiInfo, $.basic_info);


//----------------------------------------------------------------------------------------------------------
//		 CHECKINS
//----------------------------------------------------------------------------------------------------------
var activity_header = myUiFactory.buildSectionHeader("activity_header", "ACTIVITY", 1);
$.activity.add(activity_header);

// the thumbs of dogs have to display inline-block (and wrap) 
var whos_here_height = (myUiFactory.getDefaultRowHeight()*2) + 10;
var whos_here_list = myUiFactory.buildViewContainer("whos_here_list", "horizontal", "100%", whos_here_height, 0);	
$.activity.add(whos_here_list);

/* 	get feed of checkins, including your current checkin status; 
		add the list to the view we've just created 												*/
// Ti.API.info( "looking for checkins at place_ID ["+ args._place_ID + "]" );
getPlaceCheckins( args._place_ID, MYSESSION.dog.dog_ID, whos_here_list);	


// TODO:  _gradually_ move all code from Line 40-96 to below; change it up to use class stuff

//----------------------------------------------------------------------------------------------------------
//       ESTIMATES (only if dog park)  
//----------------------------------------------------------------------------------------------------------
if (poiInfo.category==600 || poiInfo.category==601) {
	// TODO:  redo this using class methods
	getRecentEstimates( args._place_ID, poiInfo.enclosure_count, displayRecentEstimates );	
}

//----------------------------------------------------------------------------
//		   MARKS
//----------------------------------------------------------------------------
/*
var marks_header = myUiFactory.buildSectionHeader("marks", "MARKS", 1);
$.marks.add(marks_header);
var params = {
	place_type : 1, 
	place_ID   : args._place_ID,
	dog_id     : MYSESSION.dog.dog_ID
};
getMarks(params, displayMarks);
*/

//----------------------------------------------------------------------------
//				FEATURES
//----------------------------------------------------------------------------
var features_header = myUiFactory.buildSectionHeader("features_header", "FEATURES", 1);
$.features.add(features_header);
displayFeatures(poiInfo, $.features);

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



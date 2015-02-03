

//===============================================================================================
//
//
//===============================================================================================
function getMapPoi() {
	Ti.API.info("...[+] GET POI button clicked on map (anything ongoing? "+mySesh.actionOngoing+")");
	if ( !mySesh.actionOngoing ) {
		Ti.Geolocation.getCurrentPosition(function(e) {
	    if (e.error) {
	    	// myExtendedMap._wbMap.removeAllAnnotations();
	    	getNearbyPoi( mySesh.geo.lat, mySesh.geo.lon, mySesh.geo.view_lat, mySesh.geo.view_lon);
	    	disableAllButtons();  // disable button after first click while we load backend data
	    } 
	    else {  // if no errors
	      //myExtendedMap.centerMapOnLocation(e.coords.latitude, e.coords.longitude, 0.075);
	      mySesh.geo.lon = e.coords.longitude;
	      mySesh.geo.lat = e.coords.latitude;
	      // myExtendedMap._wbMap.removeAllAnnotations();
	      getNearbyPoi( e.coords.latitude, e.coords.longitude, mySesh.geo.view_lat, mySesh.geo.view_lon);
	      disableAllButtons();  // disable button after first click while we load backend data
	    }
	  });
	}  
}
//=============================================================
//	Name:			buildMapMenubar	
//=============================================================
function buildMapMenubar() {	
	// mySesh.device.screenwidth
	var menubar_pad_right  = 20;
	var	menubar_pad_bottom = 20;
	var btn_spacing 			 = 10;
	var main_btn_size 		 = 60; 
	var secondary_btn_size = 40;
	var secondary_pad_right = ( (main_btn_size-secondary_btn_size)/2 )+menubar_pad_right;
	var	secondary_pad_bottom = main_btn_size + menubar_pad_bottom + btn_spacing + ( (main_btn_size-secondary_btn_size)/2 ); 
	
	////////////////////////////////////////////////// RECENTER BUTTON ///////////////////
	var recenterBtn = Ti.UI.createButton( {
		id			: "recenterBtn",	
		backgroundImage : ICON_PATH + 'button-center.png',
		// backgroundColor: '#ffffff', 
		opacity : 1,
		height	: secondary_btn_size, 
		width		: secondary_btn_size,
		bottom	: secondary_pad_bottom,
		right		: secondary_pad_right,
		zIndex  : 100
	} );
	
	////////////////////////////////////////////////// GET POI BUTTON //////////////////////
	var getPoiBtn = Ti.UI.createButton({ 
		id 							: "getPoiBtn",	 
		backgroundImage : ICON_PATH + 'button-waterbowl.png',
		opacity 				: 1,
		zIndex					: 100, 
		height					: main_btn_size, 
		width						: main_btn_size,
		bottom					: menubar_pad_bottom, 
		right						: 20
	});
	
	////////////////////////////////////////////////// SNIFF BUTTON ///////////////////////
  var sniffBtn = Ti.UI.createButton({ 
		id 							: "sniffBtn",	 
		backgroundImage : ICON_PATH + 'button-sniff.png',
		opacity 				: 1,
		zIndex					: 100, 
		height					: main_btn_size, 
		width						: main_btn_size,
		bottom					: menubar_pad_bottom, 
		right						: 90
	});
	
	////////////////////////////////////////////////// MARK BUTTON ////////////////////////
  var markBtn = Ti.UI.createButton({ 
		id 							: "markBtn",	 
		backgroundImage : ICON_PATH + 'button-mark.png',
		opacity 				: 1,
		zIndex					: 100, 
		height					: main_btn_size, 
		width						: main_btn_size,
		bottom					: menubar_pad_bottom, 
		right						: 160
	});
	
	/////////////////////////////////////// ADD BUTTONS TO MAPVIEW ////////////////////////
	$.mapContainer.add(recenterBtn);
	$.mapContainer.add(getPoiBtn);
	$.mapContainer.add(sniffBtn);
	$.mapContainer.add(markBtn);
	
	//====== RECENTER listener ================================================
	recenterBtn.addEventListener('click', function() {			// REFRESH button
    Ti.API.info("...[+] RECENTER button clicked on map");
		Ti.Geolocation.getCurrentPosition(function(e) {
      if (e.error) {			
        // check if running in simulator  if (Titanium.Platform.model != "Simulator")
        Ti.API.debug( ">>> Running in ["+Titanium.Platform.model+"]" );
        createSimpleDialog( "Can't get your location", "Please make sure location services are enabled." );
        // myExtendedMap.centerMapOnLocation(mySesh.geo.lat, mySesh.geo.lon, 0.01);
      } 
      else {  // if no errors, and we're not running in Simulator
        myExtendedMap.centerMapOnLocation(e.coords.latitude, e.coords.longitude, 0.02);
	    }
    });  
  });
  
  //====== WATERBOWL/POI BUTTON CLICK ==========================================
  getPoiBtn.addEventListener( 'click', function() { getMapPoi(); } );
	//======  WATERBOWL/POI BUTTON LONGPRESS ==================================
	getPoiBtn.addEventListener('longpress', function(e) {
		alert("looong press on WB button");
	});
	
	//====== MARK listener ================================================
	markBtn.addEventListener('click', function() {			
		Ti.API.info("...[+] Mark button clicked on map");
		var necessary_args = {
			place_ID  	: 601000001,   // TODO: DO NOT HARDCODE
			place_type 	: 2
		};
		createWindowController( "createmark", necessary_args, "slide_left" );
	});
	//====== SNIFF listener ================================================
	sniffBtn.addEventListener('click', function() {		
    Ti.API.info("...[+] SNIFF button clicked on map");
    // WORKFLOW: 
    //	(0) get current user location
    //	(1) center map on current location, zooming further than recenter btn
    //	(2) remove all map markers
    //	(3) draw Marks
    Ti.Geolocation.getCurrentPosition(function(e) {
      if (e.error) {			
        // check if running in simulator  if (Titanium.Platform.model != "Simulator")
        Ti.API.debug( ">>> Running in ["+Titanium.Platform.model+"]" );
        myExtendedMap._wbMap.removeAllAnnotations();
      	getMarks( myExtendedMap._wbMap, mySesh.geo.lat, mySesh.geo.lon, 1, 0.5, 20 );
      	disableAllButtons();
      } 
      else {  // if no errors
        myExtendedMap.centerMapOnLocation(e.coords.latitude, e.coords.longitude, 0.008);
        mySesh.geo.lon = e.coords.longitude;
        mySesh.geo.lat = e.coords.latitude;
        myExtendedMap._wbMap.removeAllAnnotations();
        getMarks( myExtendedMap._wbMap, e.coords.latitude, e.coords.longitude, 1, 0.5, 20 );
        disableAllButtons();
	    }
    });  
	});
}

//---------------------------------------------------------------------------------------------------
//
// 					p			o				i				s	
//
//=============================================================================
//	Name:			getNearbyPoi ( user_lat, user_lon, view_lat, view_lon )
//=============================================================================
function getNearbyPoi( user_lat, user_lon, view_lat, view_lon ) {
	Ti.API.info("...[~] getNearbyPoi() [ "+user_lat+"/"+user_lon+"  ], view [ "+view_lat+"/"+view_lon+" ]");

  var params = {
		lat       : user_lat,
		lon       : user_lon, 
		view_lat  : view_lat,
		view_lon  : view_lon,
		owner_ID  : mySesh.user.owner_ID
	};
  // loadJson(params, "http://waterbowl.net/mobile/get-places-map.php", refreshAnnotations);
	var place_query = Ti.Network.createHTTPClient();
	place_query.open("POST", "http://waterbowl.net/mobile/get-places-map.php");
	place_query.send(params);
	place_query.onload = function() {
		var jsonResponse = this.responseText;
		var jsonPlaces = [];
		if (jsonResponse != "") {
			var jsonPlaces = JSON.parse(jsonResponse);	
		  Ti.API.info( ".... .... .... .... total map places: " + jsonPlaces.length );	
		  mySesh.allPlaces = jsonPlaces;
			refreshAnnotations(jsonPlaces);
			enableAllButtons();
			// Ti.API.debug( " ******[ mySesh.allPlaces ]********: " + JSON.stringify( mySesh.allPlaces ) );
		}	else {
			createSimpleDialog('No data received', 'Could not load place list');
			enableAllButtons();
		}
	};
}
//=========================================================================
//	Name:			refreshAnnotations()
//	Purpose:	grab POI/locations from backend php file, order by proximity
//=========================================================================
function refreshAnnotations(data) {
	//Ti.API.debug(".... [~] refreshAnnotations data :: "+JSON.stringify(data) );	
	myExtendedMap._wbMap.removeAllAnnotations();
	var temp_annotationArray = [];
	// Create an annotation for each POI in allPlaces session array
	for (var i=0; i<data.length; i++) {
		temp_annotationArray.push ( createMapAnnotation(data[i], i) );		// make sure to pass current array index  
	}
	Alloy.Globals.placeAnnotations = temp_annotationArray; 
	// Ti.API.debug(".... [~] refreshAnnotations temp_annotationArray :: "+JSON.stringify(temp_annotationArray) );	
	myExtendedMap._wbMap.addAnnotations( temp_annotationArray );
}
//=============================================================
//	Name:			createMapAnnotation( place_data, index )
//	Purpose:	build Apple Maps place marker from incoming array
//	Return:		annotation object
//=============================================================
function createMapAnnotation( place_data, index ) {
	//Ti.API.debug (".... [~] Added POI [ " +place_data.place_ID + " ] to map");
	// ADD ANNOTATION BUTTON 
	var anno_button = Ti.UI.createButton({ 
		id			   	    : "poi_btn_"+place_data.place_ID,
		name					  : place_data.name,
		backgroundImage : ICON_PATH + 'button-forward.png',
		zIndex					: 10, 
		height					: 30, 
		width						: 30
	});
	// ADD ANNOTATION BUTTON EVENT LISTENER g
 	anno_button.addEventListener('click', function(e){
 		// Ti.API.debug ( ".... [+] Clicked on >> " + e.source.id );	
		var necessary_args = {
			_place_ID : place_data.place_ID		// pass in array index and placeID so we can hit the backend for more details
		};
		createWindowController( "placeoverview", necessary_args, 'slide_left' );
 	}); 
	// ADD ANNOTATION CONTAINER  	
	return myMapFactory.createAnnotation({
		id        : "poi_anno_"+place_data.place_ID, 
		latitude  : place_data.lat, 
		longitude : place_data.lon,
		title     : place_data.name,
		subtitle  : place_data.city + " (" + place_data.dist + " mi)",
		animate   : false,
		image     : ICON_PATH + place_data.icon, 		// or pull icon from AWS: mySesh.AWS.base_icon_url
		rightView : anno_button
	});
}

//---------------------------------------------------------------------------------------------------
//
// 					m 			a				r				k				s
//
//=========================================================================
//	Name:			refreshMarkAnnotations( map )
//	Purpose:	
//=========================================================================
function refreshMarkAnnotations() {
	myExtendedMap._wbMap.removeAllAnnotations();
	var marksArray = [];
	for (var i=0; i<mySesh.nearbyMarks.length; i++) {
		/* make sure to pass current array index, anything other than array index is useless */
		marksArray.push ( createMarkAnnotation(mySesh.nearbyMarks[i], i) );	  
	}
	myExtendedMap._wbMap.addAnnotations( marksArray );
}
//=============================================================
//	Name:			createMarkAnnotation( mark, index )
//	Purpose:	build Apple Maps place marker from incoming array
//	Return:		annotation object
//=============================================================
function createMarkAnnotation( mark, index ) {
	// Ti.API.info(" annotation marker for MARK:" + JSON.stringify(mark));
	var anno_mark_button = Ti.UI.createButton({ 
		id 							: mark.ID,	 
		backgroundImage : ICON_PATH + 'button-forward.png',
		zIndex					: 100, 
		height					: 30, 
		width						: 30
	});
	anno_mark_button.addEventListener('click', function(e){
	 	// Ti.API.debug ( "...[+] createMarkAnnotation >>>" + JSON.stringify(e.source.name) );
		createWindowController( "markoverview", mark, 'slide_left' );
 	});
	return myMapFactory.createAnnotation({
    id        : mark.ID, 
		latitude  : mark.mark_lat, 
		longitude : mark.mark_lon,
		title     : mark.mark_name,
		subtitle  :	mark.marking_dog_name,
		animate   : false,
		image     : ICON_PATH + 'Mark-MapMarker-4-small.png', 
		rightView : anno_mark_button
	});
}

//=================================================================================
//	Name:			displayGeofencePoi( tableViewObject)
//	Purpose:	use global data array to populate a table view
//=================================================================================
function displayGeofencePoi( tableViewObject ) {
	Ti.API.info("....[~] displayGeofencePoi called");
	tableViewObject.data = null;				// lear existing place scrol list
		
	// (0)  create table view data array
	var placeData = new Array();
	
	// (1)	sort POIs based on proximity
	var nearby = mySesh.geofencePoi;
	nearby.sort(function(a, b) {		// sort by proximity (closest first)
		return parseFloat(a.dist) - parseFloat(b.dist);
	});

	// (2)  find out if currently checked in at any of these places, and if so, re-order data
	var checked_in_index 	= ""; 
	for (var i = 0; i < nearby.length; i++) {
		if ( mySesh.dog.current_place_ID == nearby[i].id ) {
			checked_in_index = i;
			break;
		}
	}
	
	if (checked_in_index!="") {	
		Ti.API.debug( " >>>>>>> nearby[i]: "+JSON.stringify(nearby[checked_in_index]) );
		// grab a copy of only that one element, starting at its position (i)
		var where_at = nearby.slice(checked_in_index, checked_in_index+1);				
		nearby.splice(checked_in_index,1);		// delete that element
		nearby.unshift(where_at[0]);					// place the copy at the front of the array	
	}
	// (3)  build each table row 
	for (var i = 0; i < nearby.length; i++) {
		var dataRow = Ti.UI.createTableViewRow(	{	
		  // object info that is not exposed to user
			name 			: nearby[i].name,
			id 				: nearby[i].id,
			lat 			: nearby[i].lat,
			lon 			: nearby[i].lon,
			distance	: nearby[i].dist,
			hasChild	: false
		});
		//Ti.API.info ("... displayGeofencePoi >> [" + nearby[i].id + "] - "+nearby[i].name );
		
		// leftmost color sliver 
		var colorBlock	 	 = myUiFactory.createColorBlock(nearby[i].icon_color, nearby[i].icon_basic);
				
		/* accomodate long place names */
		var font_size = 14;
    if (nearby[i].name.length > 40 && nearby[i].name.length < 60)
			font_size    = 12;
		else if (nearby[i].name.length > 60)
		  font_size    = 10;
	
    /* IF CURRENTLY CHECKED IN HERE, DISPLAY ALL FANCY  */	  
    // TODO:  createTableView row should be wrapped in a TableRow member function
    var row_bg_color = "#ffffff";
    
		if ( mySesh.dog.current_place_ID == nearby[i].id ) {
  		row_bg_color="#ec3c95";
      var placeLabel = Ti.UI.createLabel({
  			text : nearby[i].name +" -- (currently here)",  height : Ti.UI.SIZE, width : Ti.UI.FILL,
  			left : 8, color : "#ffffff", textAlign : 'left',  
  			font : { fontFamily : 'Raleway-Bold', fontSize : font_size } 
  		});
    }
    else {
  		var placeLabel = Ti.UI.createLabel({
  			text : nearby[i].name,  height : Ti.UI.SIZE, width : Ti.UI.FILL,
  			left : 10, color : "#000000", textAlign : 'left', 
  			font : { fontFamily : 'Raleway', fontSize : font_size } 
  		});
		}
		var contentView = Ti.UI.createView({ 
		  layout : "horizontal", height : 30, width : "100%", 
		  backgroundColor: row_bg_color 
		});
		contentView.add(colorBlock);
		contentView.add(placeLabel);
		//  add the custom row content we've just created
		dataRow.add(contentView);
		placeData.push(dataRow);
		//Ti.API.debug( " >>>>>>> placeData: "+JSON.stringify(dataRow) );
	}
	/* populate placeList TableViewRows*/
	tableViewObject.data = placeData;
}

//=========================================================================================
//	Name:			checkIntoPlace ( place_ID, place_lat, place_lon, place_name )
//	Purpose:	check into a specific place, providing user ID, dog ID, lat, lon to backend
//																		( all available globally except for place_ID )
//						TODO:			Allow selection between multiple dogs
//=========================================================================================
function checkIntoPlace (place_ID, place_lat, place_lon, place_name) {
	/* create an HTTP client object  */ 
	var checkin_http_obj = Ti.Network.createHTTPClient();
	/* create an HTTP client object  */ 
	checkin_http_obj.open("POST", "http://waterbowl.net/mobile/set-place-checkin.php");
	
	var params = {
		place_ID	: place_ID,
		owner_ID	: mySesh.user.owner_ID,
		dog_ID		: mySesh.dog.dog_ID,
		lat				:	mySesh.geo.lat,
		lon				:	mySesh.geo.lon
	};
	
	Ti.API.info ( "... sending stuff to place-checkin.php " + JSON.stringify(params) );
	var response = 0;
	
	/* send a request to the HTTP client object; multipart/form-data is the default content-type header */
	checkin_http_obj.send(params);
	
	/* response data received */
	checkin_http_obj.onload = function() {
		var json = this.responseText;
		if (json != "") {
			Ti.API.info("* checkin JSON " + json);
			var response = JSON.parse(json);
			if (response.status == 1) { 		// success
				Ti.API.log("  [>]  Checkin added successfully ");
	
				// in case we want to look up more info on this specific place in the global place array
			  var place_index = getArrayIndexById( mySesh.geofencePoi, place_ID );
				/*		 save Place ID, checkin state, and timestamp in mySesh  	*/
				// checkin now officially complete
				mySesh.dog.current_place_ID 	= place_ID;
				
				// grab place lat
				mySesh.dog.current_place_lat     = place_lat;
				mySesh.dog.current_place_lon     = place_lon;
				mySesh.dog.current_place_name    = place_name;
				mySesh.dog.current_place_geo_radius = mySesh.geofencePoi[place_index].geo_radius;
				mySesh.dog.last_checkin_timestamp= new Date().getTime();
				
				// Ti.API.info ( "... mySesh.dog: " + JSON.stringify(mySesh.dog) );
				// POPULATE NEARBY PLACE TABLE
  		  setTimeout ( function(){ displayGeofencePoi($.placeListTable); }, 300);
  		  // ADD PLACE LIST CLICK EVENT LISTENER
  		  setTimeout ( function(){ addPlaceListClickListeners($.placeListTable); }, 310);
  		
			  // instead of success message, bounce user to place overview
			  var necessary_args = {
			    _index		: place_index,
		      _place_ID : place_ID		// pass in array index and placeID so we can hit the backend for more details
		    };
        createWindowController( "placeoverview", necessary_args, 'slide_left' );
			} else {
			   createSimpleDialog( response.title, response.message );
			} 
		}
		else
			createSimpleDialog( "Problem", "No data received from server"); 
	};
}

//=========================================================================================
//	Name:			checkoutFromPlace (place_ID)
//	Purpose:	check into a specific place, providing user ID, dog ID, lat, lon to backend
//						TODO:			Allow selection between multiple dogs
//=========================================================================================
function checkoutFromPlace (place_ID) {
  Ti.API.info("...[x] checking out from ["+place_ID+"]");
	/* create an HTTP client object  */ 
	var checkout_http_obj = Ti.Network.createHTTPClient();
	/* create an HTTP client object  */ 
	checkout_http_obj.open("POST", "http://waterbowl.net/mobile/set-place-checkout.php");
	
	var params = {
		place_ID	: place_ID,
		owner_ID	: mySesh.user.owner_ID,
		dog_ID		: mySesh.dog.dog_ID,
	};
	var response = 0;
	/* send a request to the HTTP client object; multipart/form-data is the default content-type header */
	checkout_http_obj.send(params);
	/* response data received */
	checkout_http_obj.onload = function() {
		var json = this.responseText;
		if (json != "") {
			Ti.API.info("* checkout JSON " + json);
			var response = JSON.parse(json);
			if (response.status == 1) { 		// success
				Ti.API.log("  [>]  Checked out from "+ place_ID + " successfully ");
	
				/*		 save Place ID, checkin state, and timestamp in mySesh  	*/
				mySesh.dog.current_place_ID 	= null;
				// POPULATE NEARBY PLACE TABLE
				displayGeofencePoi($.placeListTable);
				// SET CORRECT AMOUNT OF NEARBY PLACES (PLACE LIST LABEL)
    		updatePlaceListLabel($.placeListTitle);
				// createSimpleDialog( "Checked out from", mySesh.dog.current_place_name);
      } else {
			 createSimpleDialog( "Uh oh", response.message ); 
		  }
		}
		else
			createSimpleDialog( "Problem", "No data received from server"); 
	};
	// return response;
}


//=================================================================================
//	Name:			updatePlaceListLabel( LabelObject )
//	Purpose:	use global data array to populate a table view
//=================================================================================
function updatePlaceListLabel(textLabel) {
	var array_size = mySesh.geofencePoi.length;
	if (array_size == 0) {
    textLabel.text = "no nearby places";
	  $.outerMapContainer.height = '100%';
  }
	else if (array_size>1) {
		textLabel.text = "tap to mark one of the " + array_size + " nearby places";
	  $.outerMapContainer.height = '77%';
	}
	else if (array_size==1) {
		textLabel.text = "found " + array_size + " place nearby ";
		if (mySesh.geofencePoi[0].id != mySesh.dog.current_place_ID )
		  textLabel.text += "- tap to mark it.";
    $.outerMapContainer.height = '88%';
  }
}

function removePlaceListClickListeners () {
  placeListObject.removeEventListener('click', function (e) {} );
}

//=================================================================================
//	Name:			addPlaceListClickListeners( placeListObject )
//	Purpose:	add one click listener for all rows in the nearby place TableView 
//=================================================================================
function addPlaceListClickListeners( placeListObject ) {
  placeListObject.removeEventListener('click', placeListListener );
  placeListObject.addEventListener( 'click', placeListListener );
}

//=================================================================================
//	Name:			presentUserCheckinOptions( place )
//	Purpose:	allow user to check in or check out depending on current status 
//=================================================================================
function presentUserCheckinOptions( place ) {;
  var modal_title = 'Mark your presence at';
  if (mySesh.dog.current_place_ID == place.id) {
    var modal_title = 'Are you leaving';
  }
  // modal popup 
	var optns = {
		options : [place.name, 'Cancel'],
		cancel        : 1,
		selectedIndex : 0,
		destructive   : 1,
		title : modal_title
	};
	var checkin_dialog = Ti.UI.createOptionDialog(optns);
	checkin_dialog.show();
	
	// add click listener for "Yes" button 
	// TODO:  
	checkin_dialog.addEventListener('click', function(e_dialog) {
		if (e_dialog.index == 0) {  // user clicked OK
	    if (mySesh.dog.current_place_ID == place.id)	{
			  checkoutFromPlace (place.id);
		  } else {
		    checkIntoPlace(place.id, place.lat, place.lon, place.name);
		  }
		}
	});
} 

//=================================================================================
//	Name:			placeListListener(e)
//	Purpose:	listen for clicks on nearby place list  
//=================================================================================
function placeListListener(e) {
	Ti.API.info("...[o] POI list click [ " + JSON.stringify(e.row) + " ]");
	//Ti.API.info("...[o] event index [ " + e.index + " ]");
	myExtendedMap.centerMapOnLocation(e.row.lat, e.row.lon, 0.03);

  // figure out which annotation index to trigger
  var anno_index = getArrayIndexById( Alloy.Globals.placeAnnotations, e.row.id );
	myExtendedMap._wbMap.selectAnnotation( Alloy.Globals.placeAnnotations[anno_index] );		
	
	// pop up a check in or check out dialog box based on current checkin status
	presentUserCheckinOptions( e.row );
}

//=============================================================================
//	Name:			refreshPlaceListData ()
//=============================================================================
function refreshPlaceListData() {
  Ti.API.debug(".... [~] refreshPlaceListData called ....");
  getPoisInGeofence( myExtendedMap._wbMap, mySesh.geo.lat, mySesh.geo.lon );   // will affect place list
	// POPULATE NEARBY PLACE TABLE
	setTimeout ( function(){ displayGeofencePoi($.placeListTable); }, 600);
	// SET CORRECT AMOUNT OF NEARBY PLACES (PLACE LIST LABEL)
	setTimeout ( function(){ updatePlaceListLabel($.placeListTitle); }, 650);
	// ADD PLACE LIST CLICK EVENT LISTENER
	// remove( PlaceListClickListeners )
	setTimeout ( function(){ addPlaceListClickListeners($.placeListTable); }, 700);
}

//=============================================================================
//	Name:			getPoisInGeofence ( mapObject, user_lat, user_lon )
//	Purpose:	get places in db, plus a smaller subset of nearby ones
//=============================================================================
function getPoisInGeofence( mapObject, user_lat, user_lon ) {
	Ti.API.info("...[~] getPoisInGeofence() user[ "+user_lat+"/"+user_lon+" ]");
  var params = {
		lat       : user_lat,
		lon       : user_lon,
		owner_ID	  : mySesh.user.owner_ID
	};
	loadJson(params, "http://waterbowl.net/mobile/get-places-nearby.php", updatePoisInGeofence);
}
//=============================================================================
//	Name:			updatePoisInGeofence ( data )
//	Purpose:	
//=============================================================================
function updatePoisInGeofence( data ) {
	Ti.API.info( ".... .... .... .... total nearby places: " + data.length );
	if (data.length > 0) {
		mySesh.geofencePoi = data;
			
		// CHECK #1 - Have we left previous place's geofence?  
		// If current_place_ID is not null, and looking up existing place's ID in geofencePOI returns -1
    if (mySesh.dog.current_place_ID>0 && getArrayIndexById(data, mySesh.dog.current_place_ID)==-1 ) {
    	checkoutFromPlace(mySesh.dog.current_place_ID);
   		createSimpleDialog( "Seems you've left", "Automatically checked you out from " + mySesh.dog.current_place_name);
    }
    // CHECK #2 - If there a Checkin modal currently up, then check if situation is still valid 
    //    eg: is the currently displayed place name still part of geofencePoi
	}
}	

//=================================================================================
//	Name:			refreshRAM()
//	Purpose:	debug memory leaks
//=================================================================================
function refreshRAM() {
	$.mem_usage.text = Titanium.Platform.availableMemory.toFixed(2)+" MB available";
}

//=================================================================================
//	Name:			refreshGeo()
//	Purpose:	  
//=================================================================================
function refreshGeo() {
	if(Ti.Network.online ) {
	  var mins_elapsed = Math.round( Date.now() / (1000*60) ) - mySesh.geo.last_acquired;
	  mySesh.geo.geo_trigger_count++;
	  mySesh.geo.last_acquired = Math.round( Date.now() / (1000*60) );    
	     
	  //if (mins_elapsed > mySesh.geo.refresh_interval) {   // only if 2 mins have passed since last geo update
	  // set time last acquired (minutes since start of Unix Epoch)
	      
	  Titanium.Geolocation.getCurrentPosition(function(e) {
	  	if (!e.success || e.error) {
	  		Ti.API.debug( "[[[ refreshGeo ]]] ::  X X X  Problems with Geolocation...  "+e.error);
	  	}
	  	else {   
	    	Ti.API.debug( "[[[ refreshGeo ]]] :: + + + Got location #[" + mySesh.geo.geo_trigger_count + "] "+e.coords.latitude+", "+e.coords.longitude);     	    
				mySesh.geo.geo_trigger_success ++;
				$.geo_success.text = "geo try/success #" + mySesh.geo.geo_trigger_count+"/"+mySesh.geo.geo_trigger_success;
				$.geo_latlng.text = e.coords.latitude.toFixed(4)+"/" +e.coords.longitude.toFixed(4);
	      //$.current_place_ID.text = "Checked in at : "+mySesh.dog.current_place_ID;
	      /* save newly acquired coordinates */
	    	mySesh.geo.lat = e.coords.latitude;
	  	  mySesh.geo.lon = e.coords.longitude;
	      // see if user is still checked in somewhere, and if so, have they left the geofence
	      // getNearbyPoi(e.coords.latitude, e.coords.longitude, mySesh.geo.view_lat, mySesh.geo.view_lon);
	      refreshPlaceListData();
	  	}
		});
	}	else {
	  createSimpleDialog("No data connection","The Internets are required to browse the map.");
		Ti.API.log("No Internet connection...");
	}
}

//=========================================================================================
//	Name:			getMarks 
//	Purpose:	display marks nearby user position, or say there are none
//==========================================================================================
function getMarks( mapObject, user_lat, user_lon, sniff_type, sniff_radius, marks_shown ) {
  var params = {
		lat       					: user_lat,
		lon       					: user_lon, 
		sniff_type 					: sniff_type,
		sniff_radius  			: sniff_radius,
		number_marks_shown 	: marks_shown
	};
	var place_query = Ti.Network.createHTTPClient();
	place_query.open("POST", "http://waterbowl.net/mobile/marks-mapshow.php");
	place_query.send(params);
	place_query.onload = function() {
		var jsonResponse = this.responseText;
		var jsonPlaces = [];
		if (jsonResponse != "") {
			mySesh.nearbyMarks = JSON.parse(jsonResponse);	
		  Ti.API.info( ".... .... .... .... total marks: " + jsonPlaces.length );	
			 // = jsonMarks;			// save incoming JSON array into global storage
			refreshMarkAnnotations(mapObject);
			enableAllButtons();
		} else {
			createSimpleDialog('Loading marks','No data received');
			enableAllButtons();
		}
	};
}

//-----------------------------------------------------------------------------------------------------------------
//
//    TO DO UPON WINDOW LOAD
//
//-----------------------------------------------------------------------------------------------------------------
var args = arguments[0] || {};

/*----------------------------------------------------------------------
 *  	LOADING MAP MODULE
 *-----------------------------------------------------------------------*/
if (Ti.Platform.osname === "iphone")
	myMapFactory = require('ti.map');  // 	Alloy.Globals.Map = require('ti.map');
else if (Ti.Platform.osname == "android")
	myMapFactory = Ti.Map;

//var myMapbox = require('com.polancomedia.mapbox');
//var mapboxView = myMapbox.createView({
//	map		: 'jericho1ne.jg64pjl9'
//});
//$.mapContainer.add(mapboxView);

// (0)	GET GEOLOCATION
Titanium.Geolocation.getCurrentPosition(function(e){
	Ti.API.debug("[ [ [ [ getCurrentPosition called ] ] ] ] ");
	
  // ERROR
  if (!e.success || e.error) {
	  if (Titanium.Platform.model!="Simulator") {
      Ti.API.log('............... Could not find the device location');
  	  createSimpleDialog("Can't get your location","Please check location services are enabled on your mobile device.");
    }
    Ti.API.debug( "GEO ERROR Code: "+ e.code);
    Ti.API.debug( 'ERROR TEXT: ' + JSON.stringify(e.error) );
		mySesh.setGeoLatLon(33.970, -118.4201, -1);
  } 
  // SUCCESS
  else {		
  	// time last GPS fix was acquired (minutes since start of Unix Epoch)
	 	var last_acquired = Math.round( Date.now() / (1000*60) );		
  	mySesh.setGeoLatLon(e.coords.latitude, e.coords.longitude, last_acquired);
  }

  // (1)	DRAW THE MAP
  myExtendedMap.initializeMap(mySesh.geo.lat, mySesh.geo.lon);
 	
 	// (2)  ATTACH MENU BAR ICONS (MARK + SNIFF + SHOW POI)
 	buildMapMenubar();
 	$.mapContainer.add( myExtendedMap._wbMap );
 	
  // (3) GET MAP POIs AND PLACELIST DATA
  getNearbyPoi(mySesh.geo.lat, mySesh.geo.lon, mySesh.geo.view_lat, mySesh.geo.view_lon);
  refreshPlaceListData();
});


	
	
//====================================================================================
// 		Geolocation Change Event Listener
//		Purpose:  
//		1) 	Check for stale checkings
//		2) 	Refresh nearby places table
//		2)  Save latest user location into mySesh.geo.lat, mySesh.geo.lon
//====================================================================================
setInterval(refreshGeo, 20000);			// every X milliseconds
setInterval(refreshRAM, 2000);			// show RAM usage every 2 seconds
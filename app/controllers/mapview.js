var map = {
    top						: 0,
    bottom				: 0,
    latitude			: 0,
    longitude			: 0,
    latitudeDelta	: 0.1,
    longitudeDelta: 0.1,
    display				: "map"
};

/*----------------------------------------------------------------------
 *  	LOADING MAP MODULE
 *-----------------------------------------------------------------------*/
Map = require('ti.map');

//======================================================================================

//=================================================================================
// 	Name:  		drawDefaultMap (lat, lon)
// 	Purpose:	draw default Apple map
//=================================================================================
function drawDefaultMap(lat, lon, delta) {
  Ti.API.log(".... .... .... drawDefaultMap lat/lon/delta: ["+lat+"/"+lon+"/"+delta+"]");
	wbMapView = Map.createView({
		mapType : Map.NORMAL_TYPE, // NORMAL HYBRID SATTELITE
		region : {
			latitude 			: lat,
			longitude 		: lon,
			latitudeDelta : delta,
			longitudeDelta: delta
		},
		id : "wbMapView",
		top 					: 0,
		opacity				: 1,
		zIndex				: 20,
		animate 			: false,
		maxZoom				: 1,
		minZoom				: 2,
		regionFit	 		: true,
		userLocation 	: true,
		enableZoomControls : true
	});
	wbMapView.addEventListener('regionChanged',function(evt) {
		// Ti.API.log( JSON.stringify (evt.source.region) );
		// Ti.API.log( 'regionChanged:'+evt.source.region.latitude+"/"+evt.source.region.longitude );
		MYSESSION.geo.view_lat = evt.source.region.latitude;
		MYSESSION.geo.view_lon = evt.source.region.longitude;
	});
	Ti.API.log("...[~] Map object built ");
	return wbMapView;
}


//=================================================================================
// 	Name:  		initializeMap ()
// 	Purpose:	draw default Apple map
//=================================================================================
function initializeMap(lat, lon) {
	// DRAW MAP
	var wbMapView = drawDefaultMap( MYSESSION.geo.lat, MYSESSION.geo.lon, 0.07  );     // 0.05 
	$.mapContainer.add( wbMapView );
	$.mapContainer.add( buildMarkButton(wbMapView) );
	$.mapContainer.add( buildRefreshButton(wbMapView) );
  $.mapContainer.add( buildRecenterButton(wbMapView) );
}

function refreshMapData() {
  // ADD MARKERS + ANNOTATIONS TO MAP
	getPlacesMap( wbMapView, MYSESSION.geo.lat, MYSESSION.geo.lon, 0, 0);		// will affect map
}

function refreshPlaceListData() {
  Ti.API.debug(".... [~] refreshPlaceListData called ....");
  getPlacesNearby( wbMapView, MYSESSION.geo.lat, MYSESSION.geo.lon );   // will affect place list
	// POPULATE NEARBY PLACE TABLE
	setTimeout ( function(){ displayNearbyPlaces($.placeListTable); }, 600);
	// SET CORRECT AMOUNT OF NEARBY PLACES (PLACE LIST LABEL)
	setTimeout ( function(){ updatePlaceListLabel($.placeListTitle); }, 650);
	// ADD PLACE LIST CLICK EVENT LISTENER
	// remove( PlaceListClickListeners )
	setTimeout ( function(){ addPlaceListClickListeners($.placeListTable); }, 700);
}

//=================================================================================
// 	Name:  		centerMapOnLocation (mapObject, lat, lon, delta )
// 	Purpose:	center map viewpoint on user position
//=================================================================================
function centerMapOnLocation(mapObject, lat, lon, delta) {
	// set bounding box, move the map View/Location
	Ti.API.log("...[~] set Region ["+ lat +" / "+ lon +"]");
	mapObject.setLocation ({
		latitude 			: lat,
		longitude 		: lon,
		latitudeDelta : delta,
		longitudeDelta: delta, 
		animate : true
	});
}

//=============================================================================
//	Name:			getPlacesMap ( mapObject, user_lat, user_lon, view_lat, view_lon )
//	Purpose:	get places in db, plus a smaller subset of nearby ones
//=============================================================================
function getPlacesMap( mapObject, user_lat, user_lon, view_lat, view_lon ) {
	Ti.API.info("...[~] getPlacesMap() user[ "+user_lat+"/"+user_lon+"  ], view [ "+view_lat+"/"+view_lon+" ]");

  var params = {
		lat       : user_lat,
		lon       : user_lon, 
		view_lat  : view_lat,
		view_lon  : view_lon,
		owner_ID  : MYSESSION.user.owner_ID
	};
  // TODO: write a generic function to queryBackend
  // eg:  getJsonData("http://waterbowl.net/mobile/get-places-map.php", params);
  
	/* create an HTTP client object  */
	var place_query = Ti.Network.createHTTPClient();
	/* open the HTTP client object  (locally at http://127.0.0.1/___ )  */
	place_query.open("POST", "http://waterbowl.net/mobile/get-places-map.php");
	/* send a request to the HTTP client object; multipart/form-data is the default content-type header */
	place_query.send(params);
	/* response data is available */
	place_query.onload = function() {
		var jsonResponse = this.responseText;
		// Ti.API.info( "jsonResponse: " + jsonResponse );
		/* create object container, grab places JSON */
		var jsonPlaces = [];
		if (jsonResponse != "") {
			var jsonPlaces = JSON.parse(jsonResponse);	
		  Ti.API.info( ".... .... .... .... total map places: " + jsonPlaces.length );	
			// save incoming JSON array into global storage
			MYSESSION.allPlaces = jsonPlaces;
			refreshAnnotations(mapObject);
			// Ti.API.debug( " ****** MYSESSION.allPlaces ************: " + JSON.stringify( MYSESSION.allPlaces ) );
		}
		else {
			createSimpleDialog('Loading place list','No data received');
		}
	};
}

//=============================================================================
//	Name:			getPlacesNearby ( mapObject, user_lat, user_lon )
//	Purpose:	get places in db, plus a smaller subset of nearby ones
//=============================================================================
function getPlacesNearby( mapObject, user_lat, user_lon ) {
	Ti.API.info("...[~] getPlacesNearby() user[ "+user_lat+"/"+user_lon+" ]");
  var params = {
		lat       : user_lat,
		lon       : user_lon,
		owner_ID	  : MYSESSION.user.owner_ID
	};
  // TODO: write a generic function to queryBackend
  // eg:  getJsonData("http://waterbowl.net/mobile/get-places-nearby.php", params);

	/* create an HTTP client object  */
	var place_query = Ti.Network.createHTTPClient();
	/* open the HTTP client object  (locally at http://127.0.0.1/___ )  */
	place_query.open("POST", "http://waterbowl.net/mobile/get-places-nearby.php");
	
	/* send a request to the HTTP client object; multipart/form-data is the default content-type header */
	place_query.send(params);
	
	/* response data is available */
	place_query.onload = function() {
		var jsonResponse = this.responseText;
		/* create object container, grab places JSON */
		var jsonPlaces = [];
		if (jsonResponse != "") {
			var jsonPlaces = JSON.parse(jsonResponse);	
		  Ti.API.info( ".... .... .... .... total nearby places: " + jsonPlaces.length );	
			MYSESSION.nearbyPlaces = jsonPlaces;
			
		  // CHECK #1 - Have we left previous place's geofence?  Only check this if current_place_ID is not null
      if (MYSESSION.dog.current_place_ID>0 && getArrayIndexById(MYSESSION.nearbyPlaces, MYSESSION.dog.current_place_ID)==-1 ) {
    	  checkoutFromPlace(MYSESSION.dog.current_place_ID);
   		  createSimpleDialog( "Seems you've left", "Automatically checked you out from " + MYSESSION.dog.current_place_name);
    	}
    	// CHECK #2 - If there a Checkin modal currently up, then check if situation is still valid 
    	//    eg: is the currently displayed place name still part of MYSESSION.nearbyPlaces
		}
		else {
			createSimpleDialog('Loading place list','No data received');
		}
	};
}

//=========================================================================
//	Name:			refreshAnnotations( map )
//	Purpose:	grab POI/locations from backend php file, order by proximity
//=========================================================================
function refreshAnnotations(mapObject) {
	/* clear all map markers and annotations */
	mapObject.removeAllAnnotations();
	var annotationArray = [];
	// ALL PLACES ARRAY
	for (var i=0; i<MYSESSION.allPlaces.length; i++) {
		/* make sure to pass current array index, anything other than array index is useless */
		annotationArray.push ( createMapAnnotation(MYSESSION.allPlaces[i], i) );	  
	}
	/* attach all POI marker annotations to map */
	mapObject.addAnnotations( annotationArray );
	MYSESSION.placeAnnotations = annotationArray; 

}

//=============================================================
//	Name:			createMapAnnotation( place_data, index )
//	Purpose:	build Apple Maps place marker from incoming array
//	Return:		annotation object
//=============================================================
function createMapAnnotation( place_data, index ) {
	// Ti.API.info(" annotation marker place_data:" + JSON.stringify(place_data));
	var temp_button = Ti.UI.createButton({ 
		id : place_data.id,
		font:{ fontFamily: 'Sosa-Regular', fontSize: 30 }, title: "p",
		height : '40', width : '40', borderRadius: 6, 
		color : '#ffffff', backgroundColor : "#ec3c95"
	});
 	temp_button.addEventListener('click', function(e){
 		Ti.API.info ( "...[+] Clicked on >>>" + JSON.stringify(e.source.name) );
 		/*  prep all the required data to placeoverview.js */
 		var necessary_args = {
			_index		: index, 
			_place_ID : place_data.id		// pass in array index and placeID so we can hit the backend for more details
		};
		createWindowController( "placeoverview", necessary_args, 'slide_left' );
 	});
	var annotation = Alloy.Globals.Map.createAnnotation({
    id        : place_data.id, 
		latitude  : place_data.lat, 
		longitude : place_data.lon,
		title     : place_data.name,
		subtitle  : place_data.city + " (" + place_data.dist + " mi)",
		animate   : false,
		image     : MYSESSION.local_icon_path+'/'+place_data.icon, 		// or pull icon from AWS: MYSESSION.AWS.base_icon_url
		rightView : temp_button
	});
	return annotation;
}

//==================================================================
//	Name:			buildMarkButton
//	Purpose:	allow user to create a mark at their current location
//	Return:		Button object
//==================================================================
function buildMarkButton( mapObject ) {
  var	markBtn	= Ti.UI.createButton( {			
		id: "markBtn", color: '#ffffff', backgroundColor: '#ec3c95',	zIndex: 22,
		font:{ fontFamily: 'Sosa-Regular', fontSize: 27 }, title: "a", 
		width: Ti.UI.SIZE, bottom: 20, right: 20, opacity: 1,  height: 48, width: 44, borderRadius: 6 });
			
	markBtn.addEventListener('click', function() {			// REFRESH button
		Ti.API.info("...[+] Mark button clicked on map");
		/* will take user to the createmark form */
		// TODO: openWindowController passing in 
		// - dog_ID, dog_current_place_ID, dog_friend_list,
		//   figure out most recent 
		//
		/*
		var necessary_args = {
				_place_ID  : place_ID,
				_estimates : activity
		}; */
		createWindowController( "marks", "", "slide_left" );
		// call stuff		
	});
	
	return markBtn;
}

//=============================================================
//	Name:			buildRefreshButton
//	Purpose:	to reload map places near the new map center
//	Return:		Button object
//=============================================================
function buildRefreshButton( mapObject ) {
	var	refreshBtn	= Ti.UI.createButton( {			
		id: "refreshBtn", color: '#ffffff', backgroundColor: '#ec3c95',	zIndex: 22,
		font:{ fontFamily: 'Sosa-Regular', fontSize: 27 }, title: "y", 
		width: Ti.UI.SIZE, bottom: 76, right: 20, opacity: 0.85,  height: 44, width: 44, borderRadius: 22 });
	
	refreshBtn.addEventListener('click', function() {			// REFRESH button
		Ti.API.info("...[+] Refresh button clicked on map");
		/* will refresh all map elements + rebuild nearbyPlaces table rows */
		
		// Only refresh MAP markers + annotations
		getPlacesMap(
		  mapObject, 
		  MYSESSION.geo.lat, MYSESSION.geo.lon, 
		  MYSESSION.geo.view_lat, MYSESSION.geo.view_lon
		);
		
	});
	
	return refreshBtn;
}

//=============================================================
//	Name:			buildRecenterButton
//	Purpose:	to recenter map on current user position
//	Return:		Button object
//=============================================================
function buildRecenterButton( mapObject ) {
	var	recenterBtn	= Ti.UI.createButton( {			
		id: "refreshBtn", color: '#ffffff', backgroundColor: '#ec3c95',	zIndex: 22,
		font:{ fontFamily: 'Sosa-Regular', fontSize: 27 }, title: "o", 
		width: Ti.UI.SIZE, bottom: 124, right: 20, opacity: 0.85,  height: 44, width: 44, borderRadius: 22 });

  recenterBtn.addEventListener('click', function() {			// REFRESH button
    Ti.API.info("...[+] Recenter button clicked on map");
		Ti.Geolocation.getCurrentPosition(function(e) {
      if (e.error && Titanium.Platform.model!="Simulator") {			// sim always return SF coords
        // Only display error if running in simulator
        Ti.API.debug( ">>> Running in ["+Titanium.Platform.model+"]" );
        createSimpleDialog( "Can't get your location", "Please make sure location services are enabled." );
        centerMapOnLocation(mapObject, MYSESSION.geo.lat, MYSESSION.geo.lon, 0.01);
      } 
      else {
        centerMapOnLocation(mapObject, e.coords.latitude, e.coords.longitude, 0.01);
	    }
    });  
  });
	return recenterBtn;
}

//=================================================================================
//	Name:			displayNearbyPlaces( tableViewObject)
//	Purpose:	use global data array to populate a table view
//=================================================================================
function displayNearbyPlaces( tableViewObject ) {
	Ti.API.info("....[~] displayNearbyPlaces called");
	/* clear existing place scrolling list */
	tableViewObject.data = null;
	//tableViewObject = null;
	// Ti.API.info("... nearbyPlaces >>"+JSON.stringify( MYSESSION.nearbyPlaces ));
		
	// (0)  create table view data array
	var placeData = new Array();
	
	// (1)	sort POIs based on proximity
	var nearby = MYSESSION.nearbyPlaces;
	nearby.sort(function(a, b) {		// sort by proximity (closest first)
		return parseFloat(a.dist) - parseFloat(b.dist);
	});

	// (2)  find out if currently checked in at any of these places, and if so, re-order data
	var checked_in_index 	= ""; 
	for (var i = 0; i < nearby.length; i++) {
		if ( MYSESSION.dog.current_place_ID == nearby[i].id ) {
			checked_in_index = i;
			break;
		}
	}
	
	if (checked_in_index!="") {	
		Ti.API.debug( " >>>>>>> nearby[i]: "+JSON.stringify(nearby[checked_in_index]) );
	
		var where_at = nearby.slice(checked_in_index, checked_in_index+1);		// grab a copy of only that one element, starting at its position (i)
		Ti.API.debug( " >>>>>>> where_at: "+JSON.stringify(where_at) );
		
		nearby.splice(checked_in_index,1);									// delete that element
		nearby.unshift(where_at[0]);						// place the copy at the front of the array
	
		Ti.API.debug( " >>>>>>> nearby: "+JSON.stringify(nearby) );
		
	}
		
	// (3)  build each table row 
	for (var i = 0; i < nearby.length; i++) {
		var dataRow = Ti.UI.createTableViewRow(	{	
		  // object info that is not exposed to user
			name 			: nearby[i].name,
			id 				: nearby[i].id,
			lat 				: nearby[i].lat,
			lon 				: nearby[i].lon,
			distance		: nearby[i].dist,
			hasChild		: false
		});
		Ti.API.info ("... displayNearbyPlaces >> [" + nearby[i].id + "] - "+nearby[i].name );
		
		/* leftmost color sliver */
		var block_bg_color		 = nearby[i].icon_color;
		var colorBlock	 = createColorBlock(block_bg_color);
				
		/* accomodate long place names */
		var font_size = 14;
    if (nearby[i].name.length > 40 && nearby[i].name.length < 60)
			font_size    = 12;
		else if (nearby[i].name.length > 60)
		  font_size    = 10;
	
    /* IF CURRENTLY CHECKED IN HERE, DISPLAY ALL FANCY  */	  
    // TODO:  createTableView row should be wrapped in a TableRow member function
    var row_bg_color = "#ffffff";
    
		if ( MYSESSION.dog.current_place_ID == nearby[i].id ) {
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
		/*  add the custom row content we've just created  */
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
		owner_ID	: MYSESSION.user.owner_ID,
		dog_ID		: MYSESSION.dog.dog_ID,
		lat				:	MYSESSION.geo.lat,
		lon				:	MYSESSION.geo.lon
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
			  var place_index = getArrayIndexById( MYSESSION.nearbyPlaces, place_ID );
				/*		 save Place ID, checkin state, and timestamp in MYSESSION  	*/
				// checkin now officially complete
				MYSESSION.dog.current_place_ID 	= place_ID;
				
				// grab place lat
				MYSESSION.dog.current_place_lat     = place_lat;
				MYSESSION.dog.current_place_lon     = place_lon;
				MYSESSION.dog.current_place_name    = place_name;
				MYSESSION.dog.current_place_geo_radius = MYSESSION.nearbyPlaces[place_index].geo_radius;
				MYSESSION.dog.last_checkin_timestamp= new Date().getTime();
				
				Ti.API.info ( "... MYSESSION.dog: " + JSON.stringify(MYSESSION.dog) );
				// POPULATE NEARBY PLACE TABLE
  		  setTimeout ( function(){ displayNearbyPlaces($.placeListTable); }, 200);
  		  // ADD PLACE LIST CLICK EVENT LISTENER
  		  setTimeout ( function(){ addPlaceListClickListeners($.placeListTable); }, 210);
  		
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
	// return response;
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
		owner_ID	: MYSESSION.user.owner_ID,
		dog_ID		: MYSESSION.dog.dog_ID,
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
	
				/*		 save Place ID, checkin state, and timestamp in MYSESSION  	*/
				MYSESSION.dog.current_place_ID 	= null;
				// POPULATE NEARBY PLACE TABLE
				displayNearbyPlaces($.placeListTable);
				// SET CORRECT AMOUNT OF NEARBY PLACES (PLACE LIST LABEL)
    		updatePlaceListLabel($.placeListTitle);
				// createSimpleDialog( "Checked out from", MYSESSION.dog.current_place_name);
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
	var array_size = MYSESSION.nearbyPlaces.length;
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
		if (MYSESSION.nearbyPlaces[0].id != MYSESSION.dog.current_place_ID )
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
  placeListObject.removeEventListener('click', placeListListener)
  placeListObject.addEventListener('click', placeListListener);
}

//=================================================================================
//	Name:			presentUserCheckinOptions( place )
//	Purpose:	allow user to check in or check out depending on current status 
//=================================================================================
function presentUserCheckinOptions( place ) {;
  var modal_title = 'Mark your presence at';
  if (MYSESSION.dog.current_place_ID == place.id) {
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
	    if (MYSESSION.dog.current_place_ID == place.id)	{
			  checkoutFromPlace (place.id);
		  } else {
		    checkIntoPlace(place.id, place.lat, place.lon, place.name);
		  }
		}
	});
} 

//=================================================================================
//	Name:			placeListListener( event )
//	Purpose:	listen for clicks on nearby place list  
//=================================================================================
function placeListListener(e) {
	Ti.API.info("...[o] POI list click [ " + JSON.stringify(e.row) + " ]");
	Ti.API.info("...[o] event index [ " + e.index + " ]");
	
	centerMapOnLocation(wbMapView, e.row.lat, e.row.lon, 0.03);

  // figure out which annotation index to trigger
  var anno_index = getArrayIndexById( MYSESSION.placeAnnotations, e.row.id );
	wbMapView.selectAnnotation( MYSESSION.placeAnnotations[anno_index] );		
	
	// pop up a check in or check out dialog box based on current checkin status
	presentUserCheckinOptions( e.row );
}


//=================================================================================
//	Name:			refreshGeolocation()
//	Purpose:	  
//=================================================================================
function refreshGeo() {
	Ti.API.debug("[[[[[[[[[[[ refreshGeo called ]]]]]]]]]] ");
  
  if(Ti.Network.online ) {
	  var mins_elapsed = Math.round( Date.now() / (1000*60) ) - MYSESSION.geo.last_acquired;
	  MYSESSION.geo.geo_trigger_count++;
	  $.geo_trigger.text = "Geo trigger #"+MYSESSION.geo.geo_trigger_count;
	  MYSESSION.geo.last_acquired = Math.round( Date.now() / (1000*60) );    
	     
	  //if (mins_elapsed > MYSESSION.geo.refresh_interval) {   // only if 2 mins have passed since last geo update
	  // set time last acquired (minutes since start of Unix Epoch)
	      
	  Titanium.Geolocation.getCurrentPosition(function(e) {
	  	if (!e.success || e.error) {
	  		Ti.API.debug( "  X X X  Problems with Geolocation...  "+e.error);
	  	}
	  	else {   
	    	Ti.API.debug(".... NEW GEO CHECK #[" + MYSESSION.geo.geo_trigger_count + "] "+e.coords.latitude+", "+e.coords.longitude);     	    
				MYSESSION.geo.geo_trigger_success ++;
				$.geo_success.text = "lat/lng rec'd #" + MYSESSION.geo.geo_trigger_success;
				$.geo_latlng.text = e.coords.latitude+"/" +e.coords.longitude;
	      $.current_place_ID.text = "Checked in at : "+MYSESSION.dog.current_place_ID;
	      
	      /* save newly acquired coordinates */
	    	MYSESSION.geo.lat = e.coords.latitude;
	  	  MYSESSION.geo.lon = e.coords.longitude;
	      // see if user is still checked in somewhere 
	      // and if so, have they left the geofence
	      // refreshMapData();
	      refreshPlaceListData();
	  	}
		});
	}	else {
	  createSimpleDialog("No data connection","The Internets are required to browse the map.");
		Ti.API.log("No Internet connection...");
	}
}

//====================================================================================================================
//
//    Things to initialize upon Window load
//
//====================================================================================================================
Titanium.Geolocation.getCurrentPosition(function(e){
	Ti.API.debug("[ [ [ [ getCurrentPosition called ] ] ] ] ");
	// use default Playa Del Rey coordinates
  MYSESSION.geo.lat = 33.970;
  MYSESSION.geo.lon = -118.4201;
	// error occurred
	if (!e.success || e.error) {
	  if (Titanium.Platform.model!="Simulator") {
      Ti.API.log('............... Could not find the device location');
  	  createSimpleDialog("Can't get your location","Please check location services are enabled on your mobile device.");
    }
    Ti.API.debug( "GEO ERROR Code: "+ e.code);
    Ti.API.debug( 'ERROR TEXT: ' + JSON.stringify(e.error) );

  } else {		// RECEIVED COORDINATES
  	// overwrite hardcoded coordinates with device geolocation */
  	if (Titanium.Platform.model!="Simulator") {		
  		// Alternatively, check for Math.round(lat)!=38 && Math.round(lat)!=122 (SF Apple Store)
  		MYSESSION.geo.lat = e.coords.latitude;
  		MYSESSION.geo.lon = e.coords.longitude;
   	 // set time last acquired (minutes since start of Unix Epoch)
	 	 MYSESSION.geo.last_acquired = Math.round( Date.now() / (1000*60) );
  	}
  }
  Ti.API.log("............... lat: " + MYSESSION.geo.lat  + " / lon: " + MYSESSION.geo.lon);
  
  // Go through these steps regardless of whether we receiving an actual lat/lon
  
  // DRAW MAP FOR THE FIRST TIME
  initializeMap();
  
  // Get Map and PlaceList data
  refreshMapData();
  refreshPlaceListData();
});
  
/*
   HACK :: To skip to a specific window, uncomment block below and change which window name to jump to		
*/
var new_args = {
			_index		: 0,
			_place_ID : 601000001	// pass in array index and placeID 
};
setTimeout(function() {
	createWindowController('placeoverview',new_args,'slide_left');
}, 1200);

//====================================================================================
// 		Geolocation Change Event Listener
//		Purpose:  
//		1) 	Check for stale checkings
//		2) 	Refresh nearby places table
//		2)  Save latest user location into MYSESSION.geo.lat, MYSESSION.geo.lon
//====================================================================================
setInterval(refreshGeo, 20000);			// LOOP every 20 seconds

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

//=====================================================================================================================

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
		animate 			: true,
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
// 	Name:  		mapInit ()
// 	Purpose:	draw default Apple map
//=================================================================================
function mapInit(lat, lon) {
	// DRAW MAP
	var wbMapView = drawDefaultMap( MYSESSION.geo.lat, MYSESSION.geo.lon, 0.07  );     // 0.05 
	$.mapContainer.add( wbMapView );
	$.mapContainer.add( buildRefreshButton(wbMapView) );
  $.mapContainer.add( buildRecenterButton(wbMapView) );
   
	// ADD MARKERS + ANNOTATIONS TO MAP
	getPlacesMap( wbMapView, MYSESSION.geo.lat, MYSESSION.geo.lon, 0, 0); // will affect map
	getPlacesNearby( wbMapView, MYSESSION.geo.lat, MYSESSION.geo.lon );   // will affect place list
	// POPULATE NEARBY PLACE TABLE
	setTimeout ( function(){ displayNearbyPlaces($.placeListTable); }, 600);
	// SET CORRECT AMOUNT OF NEARBY PLACES (PLACE LIST LABEL)
	setTimeout ( function(){ updatePlaceListLabel($.placeListTitle); }, 600);
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
		view_lon  : view_lon
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
			MYSESSION.allPlaces = jsonPlaces;
			refreshAnnotations(mapObject);
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
		lon       : user_lon
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
			// refreshAnnotations(mapObject);
		}
		else {
			createSimpleDialog('Loading place list','No data received');
		}
	};
	// set time last acquired (minutes since start of Unix Epoch)
	// TODO:  move this to getLocation!! 
	//   MYSESSION.geo.last_acquired_min = Math.round( Date.now() / (1000*60) );
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
//	Name:			getPlaceIndexById( array, value )
//	Purpose:	build Apple Maps place marker from incoming array
//	Return:		annotation object
//=============================================================
function getPlaceIndexById( array, value ) {
  for (var i=0; i<array.length; i++) {
    if (array[i].id == value) {
      return i;
	 }
  }
  return -1;
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
		animate   : true,
		image     : MYSESSION.local_icon_path+'/'+place_data.icon, 		// or pull icon from AWS: MYSESSION.AWS.base_icon_url
		rightView : temp_button
	});
	return annotation;
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
		width: Ti.UI.SIZE, bottom: 20, right: 20, opacity: 0.85,  height: 34, width: 34, borderRadius: 18 });
	
	refreshBtn.addEventListener('click', function() {			// REFRESH button
		Ti.API.info("...[+] Refresh button clicked on map");
		/* will refresh all map elements + rebuild nearbyPlaces table rows */
		
		// Only refresh MAP markers + annotations
		getPlacesMap(mapObject, 
		  MYSESSION.geo.lat, MYSESSION.geo.lon, 
		  MYSESSION.geo.view_lat, MYSESSION.geo.view_lon);
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
		width: Ti.UI.SIZE, bottom: 20, right: 60, opacity: 0.85,  height: 34, width: 34, borderRadius: 18 });

  recenterBtn.addEventListener('click', function() {			// REFRESH button
    Ti.API.info("...[+] Recenter button clicked on map");
		Ti.Geolocation.getCurrentPosition(function(e) {
      if (e.error) {
        createSimpleDialog( "Can't get you location", "Please make sure location services are enabled." );
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
	Ti.API.info("...[~] displayNearbyPlaces called");
	/* clear existing place scrolling list */
	tableViewObject.data = null;
	//tableViewObject = null;
	// Ti.API.info("... nearbyPlaces >>"+JSON.stringify( MYSESSION.nearbyPlaces ));
		
	/* create table view data array */
	var placeData = new Array();
	
	var nearby = MYSESSION.nearbyPlaces;
	//TODO: see what we used to do back in the day
	nearby.sort(function(a, b) {		// sort by proximity (closest first)
		return parseFloat(a.dist) - parseFloat(b.dist);
	});
	
	/* build each table row */
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
		Ti.API.info ("... displayNearbyPlaces >> [" + nearby[i].id + "] - "+nearby[i].name );
		
		/* leftmost color sliver */
		var block_bg_color		 = nearby[i].icon_color;
		var colorBlock	 = Ti.UI.createView({
			width : 8, height : 25, top:2, left : 6, zIndex : 20, backgroundColor : block_bg_color, borderRadius: 2
		});
		
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
  			text : nearby[i].name +" > HERE <",  height : Ti.UI.SIZE, width : Ti.UI.FILL,
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
	
				/*		 save Place ID, checkin state, and timestamp in MYSESSION  	*/
				// checkin now officially complete
				MYSESSION.dog.current_place_ID 	= place_ID;
				
				// grab place lat
				MYSESSION.dog.current_place_lat     = place_lat;
				MYSESSION.dog.current_place_lon     = place_lon;
				MYSESSION.dog.current_place_name    = place_name;
				MYSESSION.dog.last_checkin_timestamp= new Date().getTime();
				
				Ti.API.info ( "... MYSESSION.dog: " + JSON.stringify(MYSESSION.dog) );
				// POPULATE NEARBY PLACE TABLE
  		  setTimeout ( function(){ displayNearbyPlaces($.placeListTable); }, 1200);
  		  // ADD PLACE LIST CLICK EVENT LISTENER
  		  setTimeout ( function(){ addPlaceListClickListeners($.placeListTable); }, 1210);
  		
				// in case we want to bounce user straight to place overview
			  var place_index = getPlaceIndexById( MYSESSION.placeAnnotations, place_ID );
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
				// populate nearby place table
				// createSimpleDialog( "Goodbye", response.message );
				
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
		textLabel.text = "found " + array_size + " place nearby. tap to mark it.";
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
	checkin_dialog.addEventListener('click', function(e_dialog) {
		if (e_dialog.index == 0) {  // user clicked OK
	    if (MYSESSION.dog.current_place_ID == place.id)	{
			  checkoutFromPlace (place.id);
			  // need to refresh nearbyPlace list
			  // POPULATE NEARBY PLACE TABLE
    		setTimeout ( function(){ displayNearbyPlaces($.placeListTable); }, 400);
    		// SET CORRECT AMOUNT OF NEARBY PLACES (PLACE LIST LABEL)
    		setTimeout ( function(){ updatePlaceListLabel($.placeListTitle); }, 400);
		  } else {
		    checkIntoPlace (place.id, place.lat, place.lon, place.name);
		  }
		}
	});
} 

//=================================================================================
//	Name:			placeListListener( event )
//	Purpose:	center map on whichever  
//=================================================================================
function placeListListener(e) {
	Ti.API.info("...[o] POI list click [ " + JSON.stringify(e.row) + " ]");
	Ti.API.info("...[o] event index [ " + e.index + " ]");
	
	centerMapOnLocation(wbMapView, e.row.lat, e.row.lon, 0.03);

  // figure out which annotation index to trigger
  var anno_index = getPlaceIndexById( MYSESSION.placeAnnotations, e.row.id );
	wbMapView.selectAnnotation( MYSESSION.placeAnnotations[anno_index] );		
	
	// pop up a check in or check out dialog box based on current checkin status
	presentUserCheckinOptions( e.row );
}
 
//=================================================================================
//	Name:			checkGeofenceLeave(lat,lon)
//	Purpose:	center map on whichever  
//=================================================================================
function checkGeofenceLeave(lat,lon) {
  if (MYSESSION.dog.current_place_lat!=null && MYSESSION.dog.current_place_lon!=null) {
    var current_distance = getDistance(lat, lon, MYSESSION.dog.current_place_lat, MYSESSION.dog.current_place_lon);
    if (current_distance > MYSESSION.dog.current_place_geo_radius) {
      createSimpleDialog( "Left Geofence", "Automatically checked you out from " +
        MYSESSION.dog.current_place_name);
      checkoutFromPlace(MYSESSION.dog.current_place_ID);
    }
  }
}



//====================================================================================================================
// do this once upon Window load
//====================================================================================================================

Titanium.Geolocation.getCurrentPosition(function(e){
	if (!e.success || e.error) {
  	Ti.API.log('............... Could not find the device location');
  	createSimpleDialog("Can't get your location","Please check location services on your mobile device.");
    // use default Playa Del Rey coordinates
    MYSESSION.geo.lat = 33.970;
    MYSESSION.geo.lon = -118.4201;
  }
  else {
  	/* overwrite hardcoded coordinates with device geolocation */
  	MYSESSION.geo.lat = e.coords.latitude;
  	MYSESSION.geo.lon = e.coords.longitude;
  }
  Ti.API.log("............... lat: " + MYSESSION.geo.lat  + " / lon: " + MYSESSION.geo.lon);
  // DRAW MAP FOR THE FIRST TIME
  mapInit();
});
  

if(Ti.Network.online ) {  
  // Refresh map and nearby place TableView each time user moves
  Titanium.Geolocation.addEventListener('location',function(){
    Ti.API.info(".... .... .... geolocation changed");
    // TODO:  break map init do stuff after drawDefault because we may
    //        want to redraw POIs and annotations but not map itself
    // mapInit();
    
    Titanium.Geolocation.getCurrentPosition(function(e) {
      if(e.success) {
        if(MYSESSION.dog.current_place_ID != null) {  
          checkGeofenceLeave(e.coords.latitude, e.coords.longitude);
        }
      }
    });
  });
} 
else{
  createSimpleDialog("No data connection","The Internets are required to browse the map.");
	Ti.API.log("No Internet connection...");
}
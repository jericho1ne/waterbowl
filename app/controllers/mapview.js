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
		Ti.API.log( 'regionChanged:'+evt.source.region.latitude+"/"+evt.source.region.longitude );
		MYSESSION.geo.lat = evt.source.region.latitude;
		MYSESSION.geo.lon = evt.source.region.longitude;
	});
	Ti.API.log("...[~] Map object built ");
	return wbMapView;
}

//=================================================================================
// 	Name:  		setRegion ( lat, lon )
// 	Purpose:	center map viewpoint on user position
//=================================================================================
function setRegion(mapObject, lat, lon, delta) {
	// set bounding box, move the map View/Location
	Ti.API.log("...[~] set Region ["+ lat +" / "+ lon +"]");
	var region = {
		latitude 			: lat,
		longitude 		: lon,
		latitudeDelta : delta,
		longitudeDelta: delta, 
		animate : true
	};
	mapObject.setLocation(region);
}

//=============================================================================
//	Name:			getPlaces ( lat, lon )
//	Purpose:	get places in db, plus a smaller subset of nearby ones
//=============================================================================
function getPlaces( mapObject, user_lat, user_lon ) {
	Ti.API.info("* getPlaces() called *");

	/* create an HTTP client object  */
	var place_query = Ti.Network.createHTTPClient();
	/* open the HTTP client object  (locally at http://127.0.0.1/___ )  */
	place_query.open("POST", "http://waterbowl.net/mobile/places.php");
	/* send a request to the HTTP client object; multipart/form-data is the default content-type header */
	var params = {
		lat : user_lat,
		lon : user_lon
	};
	place_query.send(params);
	/* response data is available */
	place_query.onload = function() {
		var jsonResponse = this.responseText;
		/* create object container, grab places JSON */
		var jsonPlaces = [];
		if (jsonResponse != "") {
			var jsonPlaces = JSON.parse(jsonResponse);	
		  Ti.API.info( "* allPlaces: " + jsonPlaces.all.length + "("+jsonPlaces.nearby.length+" nearby)"  );	
			/* save both full list and smaller nearby list to global arrays */
			
			MYSESSION.allPlaces 		= jsonPlaces.all;
			MYSESSION.nearbyPlaces 	= jsonPlaces.nearby;
			
			buildMap(mapObject);
			Ti.API.info( "* MYSESSION.allPlaces sample: " + JSON.stringify( MYSESSION.allPlaces[0] ) );
		}
		else {
			createSimpleDialog('Loading place list','No data received');
		}
	};
	// set time last acquired (minutes since start of Unix Epoch)
	MYSESSION.geo.last_acquired_min = Math.round( Date.now() / (1000*60) );
}

//=========================================================================
//	Name:			buildMap()
//	Purpose:	grab POI/locations from backend php file, order by proximity
//=========================================================================
function buildMap(mapObject) {
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
	//============ REFRESH button =====================================
	var	refreshBtn	= Ti.UI.createButton( {			
		id: "refreshBtn", color: '#ffffff', backgroundColor: '#ec3c95',	zIndex: 22,
		font:{ fontFamily: 'Sosa-Regular', fontSize: 27 }, title: "y", 
		width: Ti.UI.SIZE, bottom: 20, right: 20, opacity: 0.75,  height: 34, width: 34, borderRadius: 18 });
	// mapContainer.add(refreshBtn);
	
	refreshBtn.addEventListener('click', function() {			// REFRESH button
		Ti.API.info("...[+] Refresh button clicked on map");
		/* will refresh all map elements + rebuild nearbyPlaces table rows */
		
		// ADD MARKERS + ANNOTATIONS TO MAP
		getPlaces(mapObject, MYSESSION.geo.lat, MYSESSION.geo.lon);
		// POPULATE NEARBY PLACE TABLE
		setTimeout ( function(){ getNearbyPlaces($.placeListTable); }, 1200);
		// SET CORRECT AMOUNT OF NEARBY PLACES (PLACE LIST LABEL)
		setTimeout ( function(){ updatePlaceListLabel($.placeListTitle); }, 900);
		// ADD PLACE LIST CLICK EVENT LISTENER
		setTimeout ( function(){ addPlaceListClickListeners($.placeListTable); }, 1210);
	});
	
	return refreshBtn;
}

//=================================================================================
//	Name:			getNearbyPlaces( tableViewObject)
//	Purpose:	use global data array to populate a table view
//=================================================================================
function getNearbyPlaces( tableViewObject ) {
	Ti.API.info("...[~] getNearbyPlaces called");
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
	
	/* NEARBY PLACES ARRAY */
	for (var i = 0; i < nearby.length; i++) {
		var dataRow = Ti.UI.createTableViewRow(	{	
		  // object info not exposed to user
			name 			: nearby[i].name,
			id 				: nearby[i].id,
			lat 			: nearby[i].lat,
			lon 			: nearby[i].lon,
			distance	: nearby[i].dist,
			hasChild	: false
		});
		Ti.API.info ("... >> [" + nearby[i].id + "] - "+nearby[i].name );
		
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
//	Name:			checkinAtPlace ( place_ID )
//	Purpose:	check into a specific place, providing user ID, dog ID, lat, lon to backend
//																		( all available globally except for place_ID )
//						TODO:			Allow selection between multiple dogs
//=========================================================================================
function checkinAtPlace (place_ID) {
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
				MYSESSION.checkedIn 				= true;										// checkin now officially complete
				MYSESSION.dog.current_place_ID 	= place_ID;
				MYSESSION.lastCheckIn 			= new Date().getTime();
				MYSESSION.checkinInProgress = false;				// remove "in progress" state	
				
				// POPULATE NEARBY PLACE TABLE
  		  setTimeout ( function(){ getNearbyPlaces($.placeListTable); }, 1200);
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

//=================================================================================
//	Name:			updatePlaceListLabel( LabelObject )
//	Purpose:	use global data array to populate a table view
//=================================================================================
function updatePlaceListLabel(textLabel) {
	var array_size = MYSESSION.nearbyPlaces.length;
	if (array_size == 0)
		textLabel.text = "no nearby places";
	else if (array_size>1)
		textLabel.text = "tap to mark one of the " + array_size + " nearby places";
	else if (array_size==1)
		textLabel.text = "found " + array_size + " place nearby. tap to mark it.";
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
  var modal_title = 'Are you near ' + place.name + '?';
  if (MYSESSION.dog.current_place_ID == place.id) {
    var modal_title = 'Leaving ' + place.name + '?';
  }
  // modal popup 
	var optns = {
		options : ['Yes', 'Cancel'],
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
			MYSESSION.checkinInProgress = false;
		  if (MYSESSION.dog.current_place_ID == place.id)	
			  checkoutFromPlace (place.id);
		  else
		    checkinAtPlace (place.id);
		}
	});
} 

function placeListListener(e) {
	Ti.API.info("...[o] POI list click [ " + JSON.stringify(e.row) + " ]");
	Ti.API.info("...[o] event index [ " + e.index + " ]");
	setRegion(wbMapView, e.row.lat, e.row.lon, 0.02);

  // figure out which annotation index to trigger
  var anno_index = getPlaceIndexById( MYSESSION.placeAnnotations, e.row.id );
	wbMapView.selectAnnotation( MYSESSION.placeAnnotations[anno_index] );		
	
	// pop up a check in or check out dialog box based on current checkin status
	presentUserCheckinOptions( e.row );
	
	//  in case we ever want to listen place list double clicks in the future 
  /*
	Alloy.Globals.placeList_clicks ++;
	Ti.API.info("...[o] clicked on [" + e_row.rowData.id + " - " + e_row.rowData.name + " ]");

	
	if ( Alloy.Globals.placeList_clicks == 2 ) {
		if (Alloy.Globals.placeList_ID == e_row.rowData.id ) {
			goToPlaceOverview ( e_row.rowData.id );		// 2nd click on same place name
			Alloy.Globals.placeList_ID 			= null;
			Alloy.Globals.placeList_clicks 	= 0;
		}
		else {
			Alloy.Globals.placeList_clicks 	= 1;
		}
	}
	// save most recent table view click
	Alloy.Globals.placeList_ID = e_row.rowData.id;	
	*/
}
  
//===========================================================================================================================================

//=================================================================================
//	app:refreshNearbyPlaceList
//=================================================================================
Ti.App.addEventListener("app:refreshNearbyPlaceList", 
  function(e) {
    Ti.API.info ( " *** app:refreshNearbyPlaceList called ***");
    // POPULATE NEARBY PLACE TABLE
    setTimeout ( function(){ getNearbyPlaces($.placeListTable); }, 1000);
    // ADD PLACE LIST CLICK EVENT LISTENER
    setTimeout ( function(){ addPlaceListClickListeners($.placeListTable); }, 1100);
  }
);

if(Ti.Network.online ) { 
  Titanium.Geolocation.getCurrentPosition(function(e){
    var lat = 33.971995;
  	var lon = -118.420496;

		if (!e.success || e.error) {
    	Ti.API.log('Could not find the device location');
    }
    else {
    	/* overwrite hardcoded coordinates with device geolocation */
    	lat = e.coords.latitude;
    	lon = e.coords.longitude;
    }
    Ti.API.log("lat: " + lat + " / lon: " + lon);
    
		// DRAW MAP
		var wbMapView = drawDefaultMap( lat, lon, 0.03 );   
		$.mapContainer.add( wbMapView );
		$.mapContainer.add( buildRefreshButton(wbMapView) );
	
		// ADD MARKERS + ANNOTATIONS TO MAP
		getPlaces( wbMapView, lat, lon );
		// POPULATE NEARBY PLACE TABLE
		setTimeout ( function(){ getNearbyPlaces($.placeListTable); }, 1200);
		// SET CORRECT AMOUNT OF NEARBY PLACES (PLACE LIST LABEL)
		setTimeout ( function(){ updatePlaceListLabel($.placeListTitle); }, 900);
		// ADD PLACE LIST CLICK EVENT LISTENER
		// remove( PlaceListClickListeners )
		setTimeout ( function(){ addPlaceListClickListeners($.placeListTable); }, 1210);
  });
} 
else{
	Ti.API.log("Internet connection is required to use localization features");
}
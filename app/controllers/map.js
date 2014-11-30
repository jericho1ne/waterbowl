//=================================================================================
// 	Name:  		drawDefaultMap (lat, lon)
// 	Purpose:	draw default Apple map
//=================================================================================
function drawDefaultMap(lat, lon) {
	Alloy.Globals.wbMapView = Alloy.Globals.Map.createView({
		mapType : Alloy.Globals.Map.NORMAL_TYPE, // NORMAL HYBRID SATTELITE
		region : {
			latitude : lat,
			longitude : lon,
			latitudeDelta : 0.015,
			longitudeDelta : 0.015
		},
		zoom : 10,
		top : 0,
		enableZoomControls : true,
		minZoomLevel : 2,
		maxZoomLevel : 10,
		id : "wbMapView",
		animate : true,
		regionFit : true,
		userLocation : true
	});
	innerMapContainer.add(Alloy.Globals.wbMapView);

	// Add map to current view
	Ti.API.log("...[~] Default Map Created! ");
	
}

//=================================================================================
// 	Name:  		setRegion ( lat, lon )
// 	Purpose:	center map viewpoint on user position
//=================================================================================
function setRegion(lat, lon) {
	// set bounding box, move the map View/Location
	Ti.API.log("...[~] set Region ["+ lat +" / "+ lon +"]");
	var region = {
		latitude : lat,
		longitude : lon,
		// latitudeDelta : .02, longitudeDelta : .02, // these two determine zoom level
		animate : true
	};
	Alloy.Globals.wbMapView.setLocation(region);
}

//==============================================================
//	Name:			currentLocation()
//	Purpose:	get current lat/lon IF
//						- geolocation services are on AND
//            - 15 minutes have elapsed since previous check
//==============================================================
function currentLocation() {
	if (Titanium.Geolocation.locationServicesEnabled === false) {
		Ti.API.debug('...[!] Device has GPS turned off. ');
		alert('Please turn on Location Services');
	} else {// assuming GPS is turned ON
		Ti.Geolocation.getCurrentPosition(function(e) {
			if (!e.success || e.error) {// uh oh, time to worry
				alert('Unable to find your current location');
				Ti.API.debug(JSON.stringify(e));
				Ti.API.debug(e);
				return;
			} else {// everything is kosher, do the damn thing
				Ti.API.info('...(-+-) location CHANGED [ ' + e.coords.latitude + '/' + e.coords.longitude + ' ]');

				if (mySession.lastCheckIn != null) {
					var current_ts = new Date().getTime();
					minutes_elapsed = Math.round((mySession.lastCheckIn - current_ts ) / (1000 * 60));
					Ti.API.info('...[o] Minutes since last check-in [ ' + minutes_elapsed + ' ] ');
				}
				if (mySession.checkinInProgress != true) {
					/* do a quick check for nearby stuff  */
					// findNearbyPlaces(e.coords.latitude, e.coords.longitude);
				}

				var region = {// Redraw the bounding box, recenter the map View
					latitude : e.coords.latitude,
					longitude : e.coords.longitude,
					animate : true
				};
				Alloy.Globals.wbMapView.setLocation(region);

				var coords = {
					"lat" : e.coords.latitude,
					"lon" : e.coords.longitude
				};
				return coords;
			}
		});
	}
}

//=============================================================
//	Name:		createAnnotation( place_data )
//	Purpose:	build Apple Maps place marker from incoming array
//=============================================================
function createAnnotation( place_data ) {
	//Ti.API.info("map marker place_data:" + JSON.stringify(place_data));
	
	var temp_button = Ti.UI.createButton({ 
		id : place_data.id,
		font:{ fontFamily: 'Sosa-Regular', fontSize: 30 }, title: "p",
		height : '40', width : '40', borderRadius: 6, 
		color : '#ffffff', backgroundColor : "#ec3c95"
	});
		
	//Ti.API.info(" * createAnnotation individual button object: " + temp_button);

 	temp_button.addEventListener('click', function(e){
 		/*  prep all the required data to placeoverview.js */
		goToPlaceOverview(e.source.id);
 	});

	var annotation = Alloy.Globals.Map.createAnnotation({
		latitude : place_data.lat,
		longitude : place_data.lon,
		opacity:  0.8,
		title : place_data.name,
		subtitle : place_data.city + " (" + place_data.dist + " mi)",
		animate : false,
		image : mySession.local_icon_path+'/'+place_data.icon, 			// or, pull icon from AWS: mySession.AWS.base_icon_url
		rightView : temp_button
		//	leftButton : place_data.icon,														// TODO: (optional) create a leftButton imageView
		// 	leftButton : Ti.UI.createButton({  title : '+', height : 36, width : 36, backgroundColor : "#eee" }),
	});
	
	/* -------------- TRIGGER RIGHT BUTTON ON ANNOTATION --------------------- */
	/*
	annotation.addEventListener('click', function(evt) {
		var clicksource = evt.clicksource;
		if (clicksource == 'title') {
			alert(' title !! ');
		}
		if (clicksource == 'rightButton') {// action for right annotation button
			alert(' rightPane !! ');
		} 
		if (clicksource == 'leftButton') {// action for left annotation button
			alert(' leftPane !! ');
		}
	});
	*/
	Alloy.Globals.annotations.push (annotation);
}

//=========================================================================
//	Name:			createPlaceList (e)
//	Purpose:	grab POI/locations from backend php file, order by proximity
//=========================================================================
function createPlaceList() {
	Ti.API.info("* createPlaceList() called *");
	/* clear existing place scrolling list */
	placeListTable.data = null;
	
	/* clear all map markers and annotations */
	Alloy.Globals.wbMapView.removeAllAnnotations();
	
	/* create table view data array */
	var placeData = new Array();
	/* create object container, grab places JSON */
	var jsonPlaces = [];
	
	// TODO:  make the line below work by using an external function or data load class
	//jsonPlaces = setTimeout ( getPlaces(mySession.lat, mySession.lon), 1000 );

	/* create an HTTP client object  */ 
	var place_query = Ti.Network.createHTTPClient();
	/* open the HTTP client object  (locally at http://127.0.0.1/___ )  */
	place_query.open("POST", "http://waterbowl.net/mobile/places.php");
	/* send a request to the HTTP client object; multipart/form-data is the default content-type header */
	var params = {
		lat : mySession.lat,
		lon : mySession.lon
	};
	place_query.send(params);
	/* response data is available */
	place_query.onload = function() {
		var jsonResponse = this.responseText;

		var jsonPlaces = [];
		if (jsonResponse != "") {
			var jsonPlaces = JSON.parse(jsonResponse);	
			Ti.API.info( "* raw jsonResponse from getPlaces: " + JSON.stringify(jsonPlaces) );	
		
			/* save each place array (all/nearby) under local scope */
			var nearbyPlaces 	= jsonPlaces.nearby;
			var allPlaces			= jsonPlaces.all;
			
			nearbyPlaces.sort(function(a, b) {// sort by proximity (closest first)
				return parseFloat(a.dist) - parseFloat(b.dist);
			});
			
			/* ALL PLACES ARRAY */
			for (var h = 0; h < allPlaces.length; h++) {
				createAnnotation(allPlaces[h]);
				
				var current_index = allPlaces[h].id;
				/* insert jsonPlaces.nearby place object, removing 0 elements from global place array */
				// mySession.placeArray = mySession.placeArray.splice(current_index, 0, allPlaces[h]);
				/*  save into global places array */
				mySession.placeArray[ current_index ] = allPlaces[h];
			}
			/* attach all POI marker annotations to map */
			Alloy.Globals.wbMapView.addAnnotations( Alloy.Globals.annotations );
		
			/* NEARBY PLACES ARRAY */
			for (var i = 0; i < nearbyPlaces.length; i++) {
				// Ti.API.info(" * JSON at [i]=" +i+ " : " +JSON.stringify( jsonPlaces[i] )+ " *");
				var hasChildBoolean = false;
				var place_name = nearbyPlaces[i].name;
				
				if ( mySession.checkin_place_ID == nearbyPlaces[i].id ) {
					hasChildBoolean = true;
					place_name = place_name + " ( *here* ) ";
				}	
				var dataRow = Ti.UI.createTableViewRow(	{	// create each TableView row of place info
					//leftImage : jsonPlaces[i].icon,				// as defined above
					id : nearbyPlaces[i].id,
					lat : nearbyPlaces[i].lat,
					lon : nearbyPlaces[i].lon,
					address : nearbyPlaces[i].address,
					city : nearbyPlaces[i].city,
					zip : nearbyPlaces[i].zip,
					name : place_name,
					distance : nearbyPlaces[i].dist,
					hasChild : hasChildBoolean
				});
				Ti.API.info (" >> dataRow:" + dataRow );
				var bg_color = nearbyPlaces[i].icon_color;
		
				var color_block = Ti.UI.createView({
					width : 10, height : 35, left : 0, zIndex : 20,
					backgroundColor : bg_color
				});
				// Ti.API.info(mySession.AWS.base_icon_url + jsonPlaces[i].icon);
				var place_name = nearbyPlaces[i].name;
				var font_size = 14;
				
				if (place_name.length > 40)
					font_size = 12;
				
				// place_name = jsonPlaces[i].id + ' ' + place_name;
				var contentView = Ti.UI.createView({ layout : "horizontal", height : 36, width : "100%" });
				var placeLabel = Ti.UI.createLabel({
					text : place_name,  height : Ti.UI.SIZE, width : Ti.UI.FILL,
					left : 10, color : "#000000", textAlign : 'left', 
					font : { fontFamily : 'Raleway', fontSize : font_size } 
				});
				//$.addClass(placeLabel, "border_red" );
			
				//contentView.add( icon_image );
				contentView.add(color_block);
				contentView.add(placeLabel);
				/*  add the custom row content we've just created  */
				dataRow.add(contentView);
				placeData.push(dataRow);
			}
			/* populate placeList TableViewRows*/
			placeListTable.data = placeData;
		}
		else
			alert ("no data received");
	};
}

//========================================================================
//	Name:			findNearbyPlaces (lat, lon)
//	Purpose:	look for POIs in the immediate area
//========================================================================
function findNearbyPlaces(lat, lon) {
	var place_query = Ti.Network.createHTTPClient();
	place_query.open("POST", "http://waterbowl.net/mobile/place-proximity.php");

	var params = { lat : lat, lon : lon };
	
	// DEBUG / HACK: Search for places near a specific location
	// lat: 34.014,  lon: -118.375,		// West LA
	//var params = { lat: 34.024268,  lon: -118.394 };		// Nextspace 
	place_query.send(params);
	
	place_query.onload = function() {
		var jsonResponse = this.responseText;
		if (jsonResponse != "") {
			Ti.API.info("...[i] nearby locations " + jsonResponse);
			
			/* save up to 5 nearby places to global array */
			var responseArray = JSON.parse(jsonResponse);
			
			/*  if anything is nearby, gotta notify the user  */
			if ( responseArray.nearby > 0) {
				/* build options array, allow user to pick from multiple nearby places */
				var opts = [];
				
				/* make sure to remove any pre-existing data */
				mySession.placesInGeofence = []; 
				
				for (var i=0; i<responseArray.places.length; i++) {
					/* save place ID to global nearby place array */
					mySession.placesInGeofence.push ( responseArray.places[i].id ); 
					//opts.push( responseArray.places[i].name );
				}
				
				/*
				opts.push('Cancel');
				var optns = { 	
					options : opts,
					selectedIndex :  0,
					destructive : mySession.placesInGeofence.length,		// red text, it's the Cancel button so array items + 1
					cancel : mySession.placesInGeofence.length,
					title : 'Check in here?'
				};
				var dialog = Ti.UI.createOptionDialog(optns);

				// TODO:: if only 1 result. pop up Checkin modal; else, show a list of all nearby spots first
				if (mySession.checkinInProgress != true) {
					dialog.show();
					mySession.checkinInProgress = true; 		// should only bug user once
				}

				dialog.addEventListener('click', function(e) {// take user to Checkin View
					Ti.API.info ( "...[i] clicked on " + JSON.stringify(e.index) );
					// user clicked something other than Cancel 
					if (e.index != mySession.placesInGeofence.length) { 
						mySession.checkinInProgress = true;
						// checkin now officially in progress  <-- TODO: move to checkin.js
						var checkinPage = Alloy.createController("checkin", {
							_place_ID : mySession.placesInGeofence[e.index]		// pass in place ID
						}).getView();
						mySession.previousWindow 	= "map";
						mySession.currentWindow 	= "checkin";
						checkinPage.open({});
					} else if (e.index == 1) {// user clicked Cancel
						mySession.checkinInProgress = false;
					}
				}); 
				*/
				/*   ------- END Checkin modal popup     ----- */
		

			}
		}
	};
}

function goToPlaceOverview (place_ID) {
	var place_overview = Alloy.createController("placeoverview", {
		_place_ID : place_ID			// pass in placeID so we can hit the backend for more details
	}).getView();

	/*  quick fade-in animation   */
	place_overview.opacity = 0.1;
	place_overview.open({
		opacity : 1,
		duration : 320,
		curve : Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT
	});
}
//===========================================================================================
// 				LOGIC FLOW
//-----------------------------------------------------------------------
//
//		(0)		Add window to global stack, display menubar
//
//-----------------------------------------------------------------------
addToAppWindowStack($.map, "map");
addMenubar($.menubar);
Titanium.API.info ('...[~]Available memory [map.js]: ' + Titanium.Platform.availableMemory);
//  alert("logged in as UID# "+mySession.user.owner_ID);
/* 	check for nearby places every 6 minutes */
//setInterval(function () { findNearbyPlaces(mySession.lat, mySession.lon) }, 360000 );  	

var placeListContainer = Ti.UI.createView({
	id : "placeListContainer", width : "100%", contentHeight : "auto"
});
$.addClass(placeListContainer, "fill_height bg_lt_blue");

var placeListTitle =  Ti.UI.createLabel({
	id : "placeListTitle",  width : "100%", height: 36, text: "nearby places",
	textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
});
$.addClass(placeListTitle, "bg_lt_pink text_medium_medium white");

var placeListTable = Ti.UI.createTableView({
	id : "placeListTable",
	width : "100%",
	contentHeight : "auto"
});
$.addClass(placeListTable, "fill_height");

var outerMapContainer = Ti.UI.createView({
	id : "outerMapContainer",
	width : "100%",
	height : "70%",
	contentHeight : "auto"
});
var innerMapContainer = Ti.UI.createView({
	id : "innerMapContainer",
	width : "100%",
	contentHeight : "auto"
});
$.addClass(innerMapContainer, "fill_height");

outerMapContainer.add(innerMapContainer);
$.map.add(outerMapContainer);

placeListContainer.add(placeListTitle);
placeListContainer.add(placeListTable);
$.map.add(placeListContainer);

//-----------------------------------------------------------------------
//
//		(1)		Build the map
//
//-----------------------------------------------------------------------
Ti.Geolocation.getCurrentPosition(function(e) {
	if (e.error) {//  hard-coded lat/lon if this fails
		Ti.API.info("...[!] Cannot seem to get your current location ");
	} else {//  or with current geolocation
		mySession.lat = e.coords.latitude;
		mySession.lon = e.coords.longitude;
	}
	// Ti.API.info("*** Drawing the Map ***");
	
	/* draw the map		*/
	drawDefaultMap(mySession.lat, mySession.lon);
	
	/* Grab JSON data and populate Place TableView */
	createPlaceList();
	Titanium.API.info ('...[~]Available memory [map.js, after createPlaceList() call] ' + Titanium.Platform.availableMemory);
});

//-----------------------------------------------------------------------
//
//		(2)		Location Change event listener
//					- make sure Ti.Geolocation.distanceFilter is set in alloy.js!
//-----------------------------------------------------------------------
Ti.Geolocation.addEventListener('location', function() {
	Ti.API.info("...(-+-) location event listener trigger ");
	// update map view and check for nearby places
	currentLocation();
	Titanium.API.info ('...[~]Available memory [map.js, after map move] ' + Titanium.Platform.availableMemory);
});

//-----------------------------------------------------------------------
//
// 		(3) 	Add Click Event Listeners
//
//-----------------------------------------------------------------------
placeListTable.addEventListener('click', function(e_row) {// PLACES TableView
	Ti.API.info("...[o] POI list click [ " + e_row.rowData.name + " ]");
	Ti.API.info("...[o] e_row.index [ " + e_row.index + " ]");
	setRegion(e_row.rowData.lat, e_row.rowData.lon);

	Alloy.Globals.placeList_clicks ++;
	Ti.API.info("...[o] clicked on [" + e_row.rowData.id + " - " + e_row.rowData.name + " ]");
	
	// TODO:  make sure that place annotation opens on TableViewRow click
	// Alloy.Globals.wbMapView.selectAnnotation( 0 );			// Alloy.Globals.annotations[e_row.index]
	
	
	//============================== CHECKIN MODAL POPUP
	var optns = {
		options : ['Yes', 'Cancel'],
		cancel : 1,
		selectedIndex : 0,
		destructive : 1,
		title : 'Check in at ' + e_row.rowData.name + '?'
	};
	var checkin_dialog = Ti.UI.createOptionDialog(optns);
	checkin_dialog.show();
	
	// add click listener for "Yes" button 
	checkin_dialog.addEventListener('click', function(e_dialog) {
		if (e_dialog.index == 0) {// user clicked OK
			mySession.checkinInProgress = false;
			
			checkinAtPlace (e_row.rowData.id);
			// TODO: ping backend w/ owner_ID, dog_ID, checkout_timestamp, park_ID 
			// OR simply mySession.dog_activity_ID, which requires backend API to return mysql_last_insert_ID
		}
	});
	

	//=====================================================
	/*
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
});

Titanium.API.info ('...[~]Available memory [map.js, after placeListTable event listeners added] ' + Titanium.Platform.availableMemory);



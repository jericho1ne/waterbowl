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
			latitudeDelta : 0.01,
			longitudeDelta : 0.01
		},
		zoom : 10,
		top : 0,
		enableZoomControls : true,
		maxZoomLevel : 14,
		minZoomLevel : 2,
		id : "wbMapView",
		animate : true,
		regionFit : true,
		userLocation : true
	});
	innerMapContainer.add(Alloy.Globals.wbMapView);
	// Add map to current view
	Ti.API.log("*** Default Map Created! ***");
}

//=================================================================================
// 	Name:  		setRegion ( lat, lon )
// 	Purpose:	center map viewpoint on user position
//=================================================================================
function setRegion(lat, lon) {
	// set bounding box, move the map View/Location
	Ti.API.log("* - set Region: " + lat + " / " + lon + " *");
	var region = {
		latitude : lat,
		longitude : lon,
		animate : true,
		latitudeDelta : .01, // these two determine zoom level
		longitudeDelta : .01
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
		Ti.API.debug('Device has GPS turned off. ');
		alert('Please turn on the GPS antenna on your device');
	} 
	else {																							// assuming GPS is turned ON
		Ti.Geolocation.getCurrentPosition(function(e) {

			/* Other values that are made available by getCurrentPosition: 
			 
			var alt = e.coords.altitude;
			var heading = e.coords.heading;
			var accuracy = e.coords.accuracy;
			var speed = e.coords.speed;
			var timestamp = e.coords.timestamp;
			var altitudeAccuracy = e.coords.altitudeAccuracy; */

			if (!e.success || e.error) {// uh oh, time to worry
				alert('Unable to find your current location');
				Ti.API.debug(JSON.stringify(e));
				Ti.API.debug(e);
				return;
			} 
			else {																					// everything is kosher, do the damn thing
				Ti.API.info(' ( -+- ) currentLocation: ' + e.coords.latitude + '/' + e.coords.longitude);

				var minutes_elapsed = 100;
				if (sessionVars.lastCheckIn != null) {
					var current_ts = new Date().getTime();
					minutes_elapsed = Math.round((sessionVars.lastCheckIn - current_ts ) / (1000 * 60));
					Ti.API.info(' * Minutes elapsed since last check-in: ' + minutes_elapsed + '* ');
				}
				if (sessionVars.checkinInProgress != true && minutes_elapsed > 10) {
					findNearbyPlaces(e.coords.latitude, e.coords.longitude);		// quick check for nearby stuff		
				}

				var region = {									// Redraw the bounding box, recenter the map View
					latitude : e.coords.latitude,
					longitude : e.coords.longitude,
					animate : true,
					latitudeDelta : .007,
					longitudeDelta : .007
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
//	Name:		createMapMarker( array )
//	Purpose:	build Apple Maps place marker from incoming array
//=============================================================
function createMapMarker(row) {
	var annotation = Alloy.Globals.Map.createAnnotation({
		latitude 	: row.lat,
		longitude : row.lon,
		title 		: row.name,
		subtitle 	: row.city + " (" + row.dist + " mi)",
		animate 	: true,
		image 		: sessionVars.AWS.base_icon_url + row.icon			// pull icon from AWS
		//leftButton : row.icon,																		// TODO: (optional) create a leftButton imageView 
	/*-+++++++++++++++++++++++++++++++++++++++++++++++++
		leftButton : Ti.UI.createButton({
			title : '+',
			height : 36,
			width : 36,
			backgroundColor : "#eee"
		}),
		
		rightView : Ti.UI.createButton({													// TODO:  (optional) create a rightButton imageView 
			title : '>>', height : '36', width : '36', color : '#000', backgroundColor : "#eee"
		})*/
	});
	Alloy.Globals.wbMapView.addAnnotation( annotation );
}

//=========================================================================
//	Name:			createPlaceList (e)
//	Purpose:	grab POI/locations from backend php file, order by proximity
//=========================================================================
function createPlaceList() {
	Ti.API.info("* createPlaceList() called *");
	
	placeList.data = null;													// clear existing place scrolling list
	Alloy.Globals.wbMapView.removeAllAnnotations();		// clear all map markers and annotations
	
	var place_query = Ti.Network.createHTTPClient();
	
	if (sessionVars.owner_ID == 1)				// usually, Mihai=1
		place_query.open("POST", "http://waterbowl.net/mobile/places-admin.php");	
	else
		place_query.open("POST", "http://waterbowl.net/mobile/places.php");	// locally at http://127.0.0.1/*
	
	var params = {
		lat : sessionVars.lat,
		lon : sessionVars.lon
	};
	place_query.send(params);
	place_query.onload = function() {
		var jsonResponse = this.responseText;

		if (jsonResponse != "") {
			var jsonPlaces = JSON.parse(jsonResponse);
	
			jsonPlaces.sort(function(a, b) {							// sort by proximity (closest first)
				return parseFloat(a.dist) - parseFloat(b.dist);
			});

			var placeData = new Array();									// create empty object container
			var max_size = 4;															// fixed maximum, or up to arrayName.length
			
			for (var i = 0; i < jsonPlaces.length; i++) {
				// Ti.API.info(" * JSON  " + jsonPlaces[i].name + " / " + jsonPlaces[i].dist + " *");			
				var dataRow = Ti.UI.createTableViewRow({		// create each TableView row of place info
					//leftImage : jsonPlaces[i].icon,				// as defined above
					id 				: jsonPlaces[i].id,
					lat 			: jsonPlaces[i].lat,
					lon 			: jsonPlaces[i].lon,
					address		: jsonPlaces[i].address,
					city 			: jsonPlaces[i].city,
					zip				: jsonPlaces[i].zip,
					name			: jsonPlaces[i].name,
					distance 	: jsonPlaces[i].dist,
					mobile_bg : jsonPlaces[i].mobile_bg,
					hasChild 	: true
				});
				
				/*
				var icon_image = Ti.UI.createImageView({
  					image: sessionVars.AWS.base_icon_url + jsonPlaces[i].icon, 
  					width:48, height:48, left:2, zIndex: 20			
				});
				*/
				
				var bg_color = jsonPlaces[i].icon_color;
				
				var color_block = Ti.UI.createView( { width: 10, height: 35, left: 0, zIndex: 20, backgroundColor: bg_color	});
				Ti.API.info( sessionVars.AWS.base_icon_url + jsonPlaces[i].icon );
				var contentView = Ti.UI.createView({ 
						layout: "horizontal", height: 36, width: "100%"
				});
				var placeLabel = Ti.UI.createLabel ({ 
					text: jsonPlaces[i].name, height: Ti.UI.SIZE, width: Ti.UI.FILL, left: 10,
					font:{ fontFamily: 'Raleway', fontSize: 14 }, color: "#000000",  textAlign : 'left' } );
				
				//contentView.add( icon_image );
				contentView.add( color_block );
				contentView.add( placeLabel );
        /*  add the custom row content we've just created  */
        dataRow.add( contentView );
        
				placeData.push( dataRow );
				
				createMapMarker(jsonPlaces[i]);
			 
			}
			placeList.data = placeData;				// populate placeList TableView (defined in XML file, styled in TSS)
		}
	};
}

//========================================================================
//	Name:			findNearbyPlaces (lat, lon)
//	Purpose:	look for POIs in the immediate area
//========================================================================
function findNearbyPlaces(lat, lon) {
	var place_query = Ti.Network.createHTTPClient();
	
	if (sessionVars.owner_ID == 1)
		place_query.open("POST", "http://waterbowl.net/mobile/place-proximity-admin.php");	
	else
		place_query.open("POST", "http://waterbowl.net/mobile/place-proximity.php");
		
	// DEBUG / HACK: Search for places near a specific location
	//var params = { lat: 34.024,  lon: -118.394 };
		
	var params = { lat : lat, lon: lon	};
	place_query.send(params);
	place_query.onload = function() {
		var jsonResponse = this.responseText;
		if (jsonResponse != "") {
			Ti.API.info("*** nearby locations " + jsonResponse);
			var placesArray = JSON.parse(jsonResponse);
			if (placesArray.nearby == 1) {
				
				// TODO: 	will need to discern between multiple nearby places
				// 				- selection should be made in first modal or in the checkin Window 

				sessionVars.currentPlace.ID 			= placesArray.places[0].id;					// save to global vars 
				sessionVars.currentPlace.name 		= placesArray.places[0].name;
				//sessionVars.currentPlace.bg_img 	= placesArray.places[0].bg_img;
				sessionVars.currentPlace.city 		= placesArray.places[0].city;

				Ti.API.info("*** close to " + sessionVars.currentPlace.name );
				var optns = {  // build up Checkin modal popup
					options : ['Yes', 'Cancel'],
					cancel : 1,
					selectedIndex : 0,
					destructive : 0,
					title : 'Check in at ' + sessionVars.currentPlace.name  + '?'
				};
				var dialog = Ti.UI.createOptionDialog(optns);

				// TODO:: if only 1 result. pop up Checkin modal; else, show a list of all nearby spots first
				if (sessionVars.checkinInProgress != true)
					dialog.show();													
				
				dialog.addEventListener('click', function(e) {// take user to Checkin View
					if (e.index == 0) {								// user clicked OK
						sessionVars.checkinInProgress = true;			// checkin now officially in progress  <-- TODO: move to checkin.js
						var checkinPage = Alloy.createController("checkin").getView();
						checkinPage.open(
							{ transition : Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT }
						);
					} else if (e.index == 1) {				// user clicked Cancel
						sessionVars.checkinInProgress = false;
					}
				});

			}
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
addToAppWindowStack( $.map, "map" );
addMenubar( $.menubar );

var placeListContainer = Ti.UI.createView ( {id: "placeListContainer", width: "100%", contentHeight: "auto" } );
var placeList					 = Ti.UI.createTableView ( {id: "placeList", width: "100%", contentHeight: "auto" } );
$.addClass ( placeListContainer, "fill_height bg_lt_blue" );
$.addClass ( placeList, "fill_height" );

var outerMapContainer = Ti.UI.createView ( { id: "outerMapContainer", width: "100%", height:"50%", contentHeight: "auto" } );
var innerMapContainer = Ti.UI.createView ( { id: "innerMapContainer", width: "100%", contentHeight: "auto" } );
$.addClass ( innerMapContainer, "fill_height" );

outerMapContainer.add ( innerMapContainer );
$.map.add( outerMapContainer );
placeListContainer.add( placeList );
$.map.add( placeListContainer );
	
//-----------------------------------------------------------------------
//
//		(1)		Build the map
//
//-----------------------------------------------------------------------
Ti.Geolocation.getCurrentPosition(function(e) {
	if (e.error) {			//  hard-coded lat/lon if this fails
		Ti.API.info(" (x) Cannot seem to get your current location (x) ");
	} else {						//  or with current geolocation
		sessionVars.lat = e.coords.latitude;
		sessionVars.lon = e.coords.longitude;
	}
	Ti.API.info("*** Drawing the Map ***");
	drawDefaultMap(sessionVars.lat, sessionVars.lon);		// draw the map
	createPlaceList();								// Grab JSON data and populate Place TableView
});

//-----------------------------------------------------------------------
//
//		(2)		Location change event listener
//					- make sure Ti.Geolocation.distanceFilter is set in alloy.js!
//-----------------------------------------------------------------------
Ti.Geolocation.addEventListener('location', function() {
	Ti.API.info(" ( -+- ) location event listener trigger ");
	currentLocation();			// update map view and check for nearby places
});

//-----------------------------------------------------------------------
//
// 		(3) 	Add Click Event Listeners
//
//-----------------------------------------------------------------------
placeList.addEventListener('click', function(e) {			// PLACES TableView
	Ti.API.info(" * clicked on [ " + e.rowData.name + " ] in POI List");
	setRegion(e.rowData.lat, e.rowData.lon);
	
	var place_ID_clicked_on = e.rowData.id;
	Ti.API.info(" * sending to placeoverview: " + e.rowData.id + ", "+e.rowData.name + " *");
	/*  prep all the required data to placeoverview.js */
	var place_overview = Alloy.createController("placeoverview", { 
			_place_ID : place_ID_clicked_on			// pass in placeID so we can hit the backend for place info
		} ).getView();
	
	/*  save the place details in sessionVars TODO: ?? IS THIS STILL NECESSARY ?? */
	sessionVars.currentPlace.ID 				= e.rowData.id;
	sessionVars.currentPlace.name 			= e.rowData.name;
	sessionVars.currentPlace.address 		= e.rowData.address;
	sessionVars.currentPlace.city 			= e.rowData.city;
	sessionVars.currentPlace.zip 				= e.rowData.zip;
	sessionVars.currentPlace.distance 	= e.rowData.distance;
	sessionVars.currentPlace.mobile_bg 	= e.rowData.mobile_bg;

	// place_overview.open();
	/*  quick fade-in animation   */
	place_overview.opacity = 0.01;
	place_overview.open({
		opacity: 1,
		duration: 360,  
		curve : Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT
	});

});



/*
// TODO:  move this call to alloy.js
$.refreshBtn.addEventListener('click', function() {			// REFRESH button
	createPlaceList();
});
*/


/*
$.wbMapView.addEventListener('click', function(e){	
	Ti.API.info(" * clicked on map in Place List");
});
*/

/*
 if(e.clicksource=='rightPane'){				// action for right annotation button
 }
 else if(e.clicksource=='leftPane'){			// action for left annotation button
 }
*/
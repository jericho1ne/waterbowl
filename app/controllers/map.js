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
		animate : true,
		latitudeDelta : .03, // these two determine zoom level
		longitudeDelta : .03
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
		alert('Please turn on the GPS antenna on your device');
	} else {// assuming GPS is turned ON
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
			} else {// everything is kosher, do the damn thing
				Ti.API.info('...(-+-) currentLocation [ ' + e.coords.latitude + '/' + e.coords.longitude + ' ]');

				var minutes_elapsed = 100;
				if (session.lastCheckIn != null) {
					var current_ts = new Date().getTime();
					minutes_elapsed = Math.round((session.lastCheckIn - current_ts ) / (1000 * 60));
					Ti.API.info('...[o] Minutes since last check-in [ ' + minutes_elapsed + ' ] ');
				}
				if (session.checkinInProgress != true && minutes_elapsed > 10) {
					findNearbyPlaces(e.coords.latitude, e.coords.longitude);
					// quick check for nearby stuff
				}

				var region = {// Redraw the bounding box, recenter the map View
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
//	Name:		createAnnotation( place_data )
//	Purpose:	build Apple Maps place marker from incoming array
//=============================================================
function createAnnotation( place_data ) {
	//Ti.API.info("map marker place_data:" + JSON.stringify(place_data));
	
	var temp_button = Ti.UI.createButton({ 
			title : '>', id : place_data.id,
			height : '40', width : '40', borderRadius: 8, 
			color : '#ffffff', backgroundColor : "#ec3c95"
	});
		
	// Ti.API.info("object: " + temp_button);

 	temp_button.addEventListener('click', function(e){
 		/*  prep all the required data to placeoverview.js */
		goToPlaceOverview(e.source.id);
 	});

	var annotation = Alloy.Globals.Map.createAnnotation({
		latitude : place_data.lat,
		longitude : place_data.lon,
		opacity:  0.8,
		title : place_data.id+" "+place_data.name,
		subtitle : place_data.city + " (" + place_data.dist + " mi)",
		animate : true,
		image : session.local_icon_path+'/'+place_data.icon, 			// or, pull icon from AWS: session.AWS.base_icon_url
		rightView : temp_button
		//	leftButton : place_data.icon,														// TODO: (optional) create a leftButton imageView
		// 	leftButton : Ti.UI.createButton({  title : '+', height : 36, width : 36, backgroundColor : "#eee" }),
	});
	
	/* -------------- TRIGGER RIGHT BUTTON ON ANNOTATION --------------------- */
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
	
	Alloy.Globals.annotations.push (annotation);
}

//=========================================================================
//	Name:			createPlaceList (e)
//	Purpose:	grab POI/locations from backend php file, order by proximity
//=========================================================================
function createPlaceList() {
	// Ti.API.info("* createPlaceList() called *");

	placeListTable.data = null;
	// clear existing place scrolling list
	Alloy.Globals.wbMapView.removeAllAnnotations();
	// clear all map markers and annotations

	var place_query = Ti.Network.createHTTPClient();

	if (session.owner_ID == 1)// usually, Mihai=1
		place_query.open("POST", "http://waterbowl.net/mobile/places-admin.php");
	else
		place_query.open("POST", "http://waterbowl.net/mobile/places.php");
	// locally at http://127.0.0.1/*

	var params = {
		lat : session.lat,
		lon : session.lon
	};
	place_query.send(params);
	place_query.onload = function() {
		var jsonResponse = this.responseText;

		if (jsonResponse != "") {
			var jsonPlaces = JSON.parse(jsonResponse);

			jsonPlaces.sort(function(a, b) {// sort by proximity (closest first)
				return parseFloat(a.dist) - parseFloat(b.dist);
			});

			var placeData = new Array();
			// create empty object container
			var max_size = 4;
			// fixed maximum, or up to arrayName.length

			for (var i = 0; i < jsonPlaces.length; i++) {
				// Ti.API.info(" * JSON at [i]=" +i+ " : " +JSON.stringify( jsonPlaces[i] )+ " *");
				
				var dataRow = Ti.UI.createTableViewRow(	{	// create each TableView row of place info
					//leftImage : jsonPlaces[i].icon,				// as defined above
					id : jsonPlaces[i].id,
					lat : jsonPlaces[i].lat,
					lon : jsonPlaces[i].lon,
					address : jsonPlaces[i].address,
					city : jsonPlaces[i].city,
					zip : jsonPlaces[i].zip,
					name : jsonPlaces[i].name,
					distance : jsonPlaces[i].dist,
					hasChild : false
				});

				/*  save into global places array */
				var current_index = jsonPlaces[i].id;
				session.placeArray[ current_index ] = jsonPlaces[i];

				var bg_color = jsonPlaces[i].icon_color;

				var color_block = Ti.UI.createView({
					width : 10, height : 35, left : 0, zIndex : 20,
					backgroundColor : bg_color
				});
				// Ti.API.info(session.AWS.base_icon_url + jsonPlaces[i].icon);
				var place_name = jsonPlaces[i].name;
				var font_size = 14;
				
				if (place_name.length > 40)
					font_size = 12;
				
				place_name = jsonPlaces[i].id + ' ' + place_name;
						
				var contentView = Ti.UI.createView({ layout : "horizontal", height : 36, width : "100%" });
				var placeLabel = Ti.UI.createLabel({
					text : place_name,  height : Ti.UI.SIZE, width : Ti.UI.FILL,
					left : 10, color : "#000000", textAlign : 'left', 
					font : { fontFamily : 'Raleway', fontSize : font_size } 
				});

				//contentView.add( icon_image );
				contentView.add(color_block);
				contentView.add(placeLabel);
				/*  add the custom row content we've just created  */
				dataRow.add(contentView);
				placeData.push(dataRow);
				createAnnotation(jsonPlaces[i]);
			}
			/* populate placeList TableViewRows*/
			placeListTable.data = placeData;
			/* attach all POI marker annotations to map */
			Alloy.Globals.wbMapView.addAnnotations( Alloy.Globals.annotations );
		}
	};
}

//========================================================================
//	Name:			findNearbyPlaces (lat, lon)
//	Purpose:	look for POIs in the immediate area
//========================================================================
function findNearbyPlaces(lat, lon) {
	var place_query = Ti.Network.createHTTPClient();

	if (session.owner_ID == 1)
		place_query.open("POST", "http://waterbowl.net/mobile/place-proximity-admin.php");
	else
		place_query.open("POST", "http://waterbowl.net/mobile/place-proximity.php");

	// DEBUG / HACK: Search for places near a specific location
	//var params = { lat: 34.024,  lon: -118.394 };

	var params = {
		lat : lat,
		lon : lon
	};
	place_query.send(params);
	place_query.onload = function() {
		var jsonResponse = this.responseText;
		if (jsonResponse != "") {
			Ti.API.info("...[i] nearby locations " + jsonResponse);
			var placesArray = JSON.parse(jsonResponse);
			if (placesArray.nearby == 1) {

				// TODO: 	will need to discern between multiple nearby places
				// 				- selection should be made in first modal or in the checkin Window
				// TODO:  only ask once every 10 minutes; impose sleep command
				
				/* 	save to global vars		*/	
				session.currentPlace.ID = placesArray.places[0].id;
				session.currentPlace.name = placesArray.places[0].name;
				session.currentPlace.city = placesArray.places[0].city;

				// Ti.API.info("*** close to " + session.currentPlace.name);
				var optns = {// build up Checkin modal popup
					options : ['Yes', 'Cancel'],
					cancel : 1,
					selectedIndex : 0,
					destructive : 0,
					title : 'Check in at ' + session.currentPlace.name + '?'
				};
				var dialog = Ti.UI.createOptionDialog(optns);

				// TODO:: if only 1 result. pop up Checkin modal; else, show a list of all nearby spots first
				if (session.checkinInProgress != true) {
					dialog.show();
					session.checkinInProgress = true; 		// should only bug user once
				}

				dialog.addEventListener('click', function(e) {// take user to Checkin View
					Ti.API.info ( "...[i] You see, what we got here is: " + JSON.stringify(e) );
					if (e.index == 0) {// user clicked OK
						session.checkinInProgress = true;
						// checkin now officially in progress  <-- TODO: move to checkin.js
						var checkinPage = Alloy.createController("checkin", {
							//_place_ID : e.source.id			// pass in place info!
						}).getView();
							
						checkinPage.open({
							transition : Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT
						});
					} else if (e.index == 1) {// user clicked Cancel
						session.checkinInProgress = false;
					}
				});

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

var placeListContainer = Ti.UI.createView({
	id : "placeListContainer",
	width : "100%",
	contentHeight : "auto"
});
var placeListTable = Ti.UI.createTableView({
	id : "placeListTable",
	width : "100%",
	contentHeight : "auto"
});
$.addClass(placeListContainer, "fill_height bg_lt_blue");
$.addClass(placeListTable, "fill_height");

var outerMapContainer = Ti.UI.createView({
	id : "outerMapContainer",
	width : "100%",
	height : "50%",
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
		session.lat = e.coords.latitude;
		session.lon = e.coords.longitude;
	}
	// Ti.API.info("*** Drawing the Map ***");
	
	/* draw the map		*/
	drawDefaultMap(session.lat, session.lon);
	
	/* Grab JSON data and populate Place TableView */
	createPlaceList();
	

});

//-----------------------------------------------------------------------
//
//		(2)		Location change event listener
//					- make sure Ti.Geolocation.distanceFilter is set in alloy.js!
//-----------------------------------------------------------------------
Ti.Geolocation.addEventListener('location', function() {
	Ti.API.info("...(-+-) location event listener trigger ");
	currentLocation();
	// update map view and check for nearby places
});

//-----------------------------------------------------------------------
//
// 		(3) 	Add Click Event Listeners
//
//-----------------------------------------------------------------------
placeListTable.addEventListener('click', function(e) {// PLACES TableView
	Ti.API.info("...[o] POI list click [ " + e.rowData.name + " ]");
	setRegion(e.rowData.lat, e.rowData.lon);

	Alloy.Globals.placeList_clicks ++;
	Ti.API.info("...[o] clicked on [" + e.rowData.id + " - " + e.rowData.name + " ]");
	Alloy.Globals.wbMapView.selectAnnotation( Alloy.Globals.annotations[e.index] );
	
	if ( Alloy.Globals.placeList_clicks == 2 ) {
		if (Alloy.Globals.placeList_ID == e.rowData.id ) {
			/* 2nd click on same place name, open it up! */
			goToPlaceOverview ( e.rowData.id );
			Alloy.Globals.placeList_ID 			= null;
			Alloy.Globals.placeList_clicks 	= 0;
		}
		else {
			Alloy.Globals.placeList_clicks 	= 1;
		}
	}
		
	Alloy.Globals.placeList_ID = e.rowData.id;	
});



/*
 // TODO:  move this call to alloy.js
 $.refreshBtn.addEventListener('click', function() {			// REFRESH button
 createPlaceList();
 });
 */


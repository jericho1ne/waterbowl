//=================================================================================
// 	Name:  		drawDefaultMap (lat, lon)
// 	Purpose:	draw default Apple map
//=================================================================================
function drawDefaultMap(lat, lon, delta, parent_object) {
	wbMapView = Alloy.Globals.Map.createView({
		mapType : Alloy.Globals.Map.NORMAL_TYPE, // NORMAL HYBRID SATTELITE
		region : {
			latitude 			: lat,
			longitude 		: lon,
			latitudeDelta : delta,
			longitudeDelta: delta
		},
		id : "wbMapView",
		top 					: 0,
		zIndex				: 20,
		animate 			: true,
		regionFit	 		: true,
		userLocation 	: true,
		enableZoomControls : true
	});
	wbMapView.addEventListener('regionChanged',function(evt) {
		// Ti.API.log( JSON.stringify (evt.source.region) );
		// Ti.API.log( 'regionChanged:'+evt.source.region.latitude+"/"+evt.source.region.longitude) \);
	});
	Ti.API.log("...[~] Default Map Created! ");
	parent_object.add(wbMapView);
	
	return wbMapView;
}

//=================================================================================
// 	Name:  		setRegion ( lat, lon )
// 	Purpose:	center map viewpoint on user position
//=================================================================================
function setRegion(mapObject, lat, lon) {
	// set bounding box, move the map View/Location
	Ti.API.log("...[~] set Region ["+ lat +" / "+ lon +"]");
	var region = {
		latitude : lat,
		longitude : lon,
		animate : true
	};
	mapObject.setLocation(region);
}


//=============================================================
//	Name:			getUserLocation( )
//	Purpose:	build Apple Maps place marker from incoming array
//=============================================================
function getUserLocation() {
	var message = "";
	Ti.Geolocation.getCurrentPosition(function(e) {
		if (e.error) {		
			Ti.API.info("...[!] Cannot seem to get your current location ");
			//  Use hard-coded lat/lon instead (Oberrieder)
			MYSESSION.geo.lat =  33.971995;  
			MYSESSION.geo.lon = -118.420496;
			message = "used the hardcoded coordinates";
		} else {//  or with current geolocation
			MYSESSION.geo.lat = e.coords.latitude;
			MYSESSION.geo.lon = e.coords.longitude;
			message = "used position coordinates" + e.coords.latitude + "/" + e.coords.longitude;
		}
		return Array();
		
		/* draw the map		*/
		drawDefaultMap(MYSESSION.geo.lat, MYSESSION.geo.lon, 0.15, innerMapContainer);
		
		/* grab JSON data and populate Map annotations and nearby placelist TableView */
		/* backend script has fallback coords in case of missing client lat/lon  */
		getPlaces(MYSESSION.geo.lat, MYSESSION.geo.lon);
		MYSESSION.geo.last_acquired = Math.round( Date.now() / (1000 *60) );
		
		Titanium.API.info ('...[~]Available memory [map.js, after getPlaces() call] ' + Titanium.Platform.availableMemory);
	});
}

//=============================================================
//	Name:		createAnnotation( place_data, index )
//	Purpose:	build Apple Maps place marker from incoming array
//=============================================================
function createAnnotation( place_data, index ) {
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
		createWindowController( "placeoverview", necessary_args, "" );
 	});

	var annotation = Alloy.Globals.Map.createAnnotation({
		latitude : place_data.lat,
		longitude : place_data.lon,
		opacity:  0.8,
		title : place_data.name,
		subtitle : place_data.city + " (" + place_data.dist + " mi)",
		animate : false,
		image : MYSESSION.local_icon_path+'/'+place_data.icon, 			// or, pull icon from AWS: MYSESSION.AWS.base_icon_url
		rightView : temp_button
		//	leftButton : place_data.icon,														// TODO: (optional) create a leftButton imageView
		// 	leftButton : Ti.UI.createButton({  title : '+', height : 36, width : 36, backgroundColor : "#eee" }),
	});
	
	Alloy.Globals.annotations.push (annotation);
}

//=============================================================================
//	Name:			getPlaces ( lat, lon )
//	Purpose:	get places in db, plus a smaller subset of nearby ones
//=============================================================================
function getPlaces( user_lat, user_lon ) {
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
		  Ti.API.info( "* allPlaces: " + JSON.stringify(jsonPlaces.all.length) );	
			MYSESSION.nearbyPlaces = jsonPlaces.nearby;
			MYSESSION.allPlaces		 = jsonPlaces.all;
			
			/* add annotations to map */
			if (MYSESSION.nearbyPlaces.length == 0)
				placeListTitle.text = "no nearby places";
			else if (MYSESSION.nearbyPlaces.length>0)
				placeListTitle.text = "found " + MYSESSION.nearbyPlaces.length + " nearby places. tap to mark it!";
			else if (MYSESSION.nearbyPlaces.length==1)
				placeListTitle.text = "found " + MYSESSION.nearbyPlaces.length + " nearby place. tap to mark!";

			buildMap();
			buildNearbyPlaceList();
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
	
	// ALL PLACES ARRAY
	for (var i=0; i<MYSESSION.allPlaces.length; i++) {
		/* make sure to pass current array index or good luck sifting through that fucking array */
		createAnnotation(MYSESSION.allPlaces[i], i);
	}
	
	/* attach all POI marker annotations to map */
	mapObject.addAnnotations( Alloy.Globals.annotations );
}

//=================================================================================
//	Name:			buildNearbyPlaceList()
//	Purpose:	use global MYSESSION.nearbyPlaces array to populate a table view
//=================================================================================
function buildNearbyPlaceList() {
	/* clear existing place scrolling list */
	placeListTable.data = null;
	
	/* create table view data array */
	var placeData = new Array();
	
	//TODO: see what we used to do back in the day
	MYSESSION.nearbyPlaces.sort(function(a, b) {		// sort by proximity (closest first)
		return parseFloat(a.dist) - parseFloat(b.dist);
	});
	
	/* NEARBY PLACES ARRAY */
	for (var i = 0; i < MYSESSION.nearbyPlaces.length; i++) {
		var hasChildBoolean = false;
		var place_name = MYSESSION.nearbyPlaces[i].name;
		
		if ( MYSESSION.checkin_place_ID == MYSESSION.nearbyPlaces[i].id ) {
			hasChildBoolean = true;
			place_name = place_name + " ( *here* ) ";
		}	
		var dataRow = Ti.UI.createTableViewRow(	{	// create each TableView row of place info
			//leftImage : jsonPlaces[i].icon,				// as defined above
			id 	: MYSESSION.nearbyPlaces[i].id,
			lat : MYSESSION.nearbyPlaces[i].lat,
			lon : MYSESSION.nearbyPlaces[i].lon,
			address : MYSESSION.nearbyPlaces[i].address,
			city 		: MYSESSION.nearbyPlaces[i].city,
			zip 		: MYSESSION.nearbyPlaces[i].zip,
			name 		: MYSESSION.place_name,
			distance : MYSESSION.nearbyPlaces[i].dist,
			hasChild : hasChildBoolean
		});
		Ti.API.info (" >> dataRow:" + dataRow );
		
		/* leftmost color sliver */
		var bg_color = MYSESSION.nearbyPlaces[i].icon_color;
		var color_block = Ti.UI.createView({
			width : 10, height : 30, left : 0, zIndex : 20, backgroundColor : bg_color
		});
		var place_name = MYSESSION.nearbyPlaces[i].name;
		var font_size  = 14;
		
		if (place_name.length > 40 && place_name.length < 60)
			font_size    = 12;
		else if (place_name.length > 60)
		  font_size    = 10;
		  
		// place_name = jsonPlaces[i].id + ' ' + place_name;
		var contentView = Ti.UI.createView({ layout : "horizontal", height : 36, width : "100%" });
		var placeLabel = Ti.UI.createLabel({
			text : place_name,  height : Ti.UI.SIZE, width : Ti.UI.FILL,
			left : 10, color : "#000000", textAlign : 'left', 
			font : { fontFamily : 'Raleway', fontSize : font_size } 
		});
		contentView.add(color_block);
		contentView.add(placeLabel);
		/*  add the custom row content we've just created  */
		dataRow.add(contentView);
		placeData.push(dataRow);
	}
	/* populate placeList TableViewRows*/
	placeListTable.data = placeData;
}

//===========================================================================================
// 				LOGIC FLOW
//-----------------------------------------------------------------------
//		(0)		View-related stuff
//-----------------------------------------------------------------------
Titanium.API.info ('...[~]Available memory [map.js]: ' + Titanium.Platform.availableMemory);

var placeListContainer = Ti.UI.createView({
	id : "placeListContainer", width : "100%", contentHeight : "auto"
});
$.addClass(placeListContainer, "fill_height bg_lt_blue");

//============ Nearby place list title =====================================
var placeListTitle =  Ti.UI.createLabel({
	id : "placeListTitle",  width : "100%", height: 36, text: "nearby places",	textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER
});
$.addClass(placeListTitle, "bg_lt_pink text_medium_medium white");

var placeListTable = Ti.UI.createTableView({
	id : "placeListTable", width : "100%", contentHeight : "auto"
});
$.addClass(placeListTable, "fill_height");

//================================================================================================
//										MAP CONTAINER
//================================================================================================
var outerMapContainer = Ti.UI.createView({
	id : "outerMapContainer", width : "100%", height : "75%", contentHeight : "auto"
});

var innerMapContainer = Ti.UI.createView({
	id : "innerMapContainer", width : "100%", contentHeight : "auto"
});
$.addClass(innerMapContainer, "fill_height absolute");
//================================================================================================
//================================================================================================

//============ REFRESH button =====================================
var	refreshBtn	= Ti.UI.createButton( {			
	id: "refreshBtn", color: '#ffffff', backgroundColor: '#000000',	zIndex: 22,
	font:{ fontFamily: 'Sosa-Regular', fontSize: 27 }, title: "y", 
	width: Ti.UI.SIZE, bottom: 20, right: 20, opacity: 0.55,  height: 34, width: 34, borderRadius: 18 });
innerMapContainer.add(refreshBtn);

refreshBtn.addEventListener('click', function() {			// REFRESH button
	Ti.API.info("...[+] Refresh button clicked on map");
	/* will refresh all map elements + rebuild nearbyPlaces table rows */
	getPlaces(MYSESSION.geo.lat, MYSESSION.geo.lon);
});
			
outerMapContainer.add(innerMapContainer);

$.content.add(outerMapContainer);
placeListContainer.add(placeListTitle);
placeListContainer.add(placeListTable);
$.content.add(placeListContainer);

//-----------------------------------------------------------------------
//
//		(1)		Check for geolocation services
//						- if on : build the map
//						- else  : display error message
// 
//-----------------------------------------------------------------------
if (Titanium.Geolocation.locationServicesEnabled === false) {
	Ti.API.debug('...[!] Device has GPS turned off. ');
	createSimpleDialog('Cannot find your location','Please turn on Location Services or certain features will not work'); 
} else {
	var wbMapObject = drawDefaultMap(
			lat, 
			lon, 
			0.03, 
			$.mapContainer	
	);
	// getUserLocation();
}


//-----------------------------------------------------------------------
//
//		(2)		Location Change event listener + setInterval map & POI refresh
//					- you can edit Ti.Geolocation.distanceFilter is set in alloy.js!
//			* this throws an error, therefore commented out indefinitely
//			** using my own goddamn listener for now
//-----------------------------------------------------------------------
// 
// var SIvalue = setInterval( function(){ redrawMap(); }, 360000);



Ti.API.debug(' setInterval return value :' + SIvalue);

if (Titanium.Geolocation.locationServicesEnabled === false) {
	Ti.API.debug('...[!] Device has GPS turned off. ');
	createSimpleDialog('Cannot find your location','Please turn on Location Services or certain features will not work'); 
} else {
	Ti.Geolocation.addEventListener('location', function(e) {
		if ( isset(e.coords.latitude) && isset(e.coords.longitude)) {
			Ti.API.info("...(-+-) location event listener trigger " + JSON.stringify( e ) );
			var current_timestamp = Math.round( Date.now() / (1000 *60) );
			var time_diff = current_timestamp - MYSESSION.geo.last_acquired;
			if (time_diff > 5 || MYSESSION.geo.last_acquired==null) {
				// update map view and check for nearby places
				getPlaces(MYSESSION.geo.lat, MYSESSION.geo.lon);
			}
		}
		// Titanium.API.info ('...[~]Available memory [map.js, after map move] ' + Titanium.Platform.availableMemory);
	});
}

//-----------------------------------------------------------------------
//
// 		(3) 	Add Event Listeners
//
//-----------------------------------------------------------------------
/* 
 $.wbMapView.addEventListener('regionChanged', function(e) {
 	Ti.API.info( " regionChanged ["+evt.latitude+"/"+evt.longitude+"]");
   //if (updateMapTimeout) clearTimeout(updateMapTimeout);
 
    updateMapTimeout = setTimeout(function() {
        // update your map
    }, 50);
}); */

placeListTable.addEventListener('click', function(e_row) {// PLACES TableView
	Ti.API.info("...[o] POI list click [ " + JSON.stringify(e_row) + " ]");
	Ti.API.info("...[o] e_row.index [ " + e_row.index + " ]");
	setRegion(e_row.rowData.lat, e_row.rowData.lon);

	wbMapView.selectAnnotation( e_row.index );			// Alloy.Globals.annotations[e_row.index]
	
	// Alloy.Globals.placeList_clicks ++;
	// Ti.API.info("...[o] clicked on [" + e_row.rowData.id + " - " + e_row.rowData.name + " ]");
	
	// TODO:  make sure that place annotation opens on TableViewRow click
	e.row.id
	//============================== CHECKIN MODAL POPUP
	var optns = {
		options : ['Yes', 'Cancel'],
		cancel : 1,
		selectedIndex : 0,
		destructive : 1,
		title : 'Mark your presence at ' + e_row.source.text + '?'
	};
	var checkin_dialog = Ti.UI.createOptionDialog(optns);
	checkin_dialog.show();
	
	// add click listener for "Yes" button 
	checkin_dialog.addEventListener('click', function(e_dialog) {
		if (e_dialog.index == 0) {// user clicked OK
			MYSESSION.checkinInProgress = false;
			
			checkinAtPlace (e_row.rowData.id);
			// TODO: ping backend w/ owner_ID, dog_ID, checkout_timestamp, park_ID 
			// OR simply MYSESSION.dog_activity_ID, which requires backend API to return mysql_last_insert_ID
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



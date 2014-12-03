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

//========================================================================================================================


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
			// buildNearbyPlaceList();
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
		/* make sure to pass current array index or good luck sifting through that fucking array */
		annotationArray.push ( createAnnotation(MYSESSION.allPlaces[i], i) );
	}
	/* attach all POI marker annotations to map */
	mapObject.addAnnotations( annotationArray );
}

//=============================================================
//	Name:			createAnnotation( place_data, index )
//	Purpose:	build Apple Maps place marker from incoming array
//	Return:		annotation object
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
		image : MYSESSION.local_icon_path+'/'+place_data.icon, 		// or pull icon from AWS: MYSESSION.AWS.base_icon_url
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
		id: "refreshBtn", color: '#ffffff', backgroundColor: '#000000',	zIndex: 22,
		font:{ fontFamily: 'Sosa-Regular', fontSize: 27 }, title: "y", 
		width: Ti.UI.SIZE, bottom: 20, right: 20, opacity: 0.55,  height: 34, width: 34, borderRadius: 18 });
	// mapContainer.add(refreshBtn);
	
	refreshBtn.addEventListener('click', function() {			// REFRESH button
		Ti.API.info("...[+] Refresh button clicked on map");
		/* will refresh all map elements + rebuild nearbyPlaces table rows */
		getPlaces(mapObject, MYSESSION.geo.lat, MYSESSION.geo.lon);
	});
	
	return refreshBtn;
}

//=================================================================================
//	Name:			buildNearbyPlaceList()
//	Purpose:	use global data array to populate a table view
//=================================================================================
function getNearbyPlaces( tableObject ) {
	Ti.API.info("...[~] getNearbyPlaces called");
	/* clear existing place scrolling list */
	tableObject.data = null;
	
	Ti.API.info("... nearbyPlaces >>"+JSON.stringify( MYSESSION.nearbyPlaces ));
		
	/* create table view data array */
	var placeData = new Array();
	
	var nearby = MYSESSION.nearbyPlaces;
	//TODO: see what we used to do back in the day
	nearby.sort(function(a, b) {		// sort by proximity (closest first)
		return parseFloat(a.dist) - parseFloat(b.dist);
	});
	
	/* NEARBY PLACES ARRAY */
	for (var i = 0; i < nearby.length; i++) {
		var hasChildBoolean = false;
		var custom_place_name = nearby[i].name;
		
		if ( MYSESSION.checkin_place_ID == nearby[i].id ) {
			hasChildBoolean 		= true;
			custom_place_name 	= custom_place_name + " ( * here * ) ";
		}	
		
		var dataRow = Ti.UI.createTableViewRow(	{	// create each TableView row of place info
			//leftImage : jsonPlaces[i].icon,				// as defined above
			name 			: nearby[i].name,
			id 				: nearby[i].id,
			lat 			: nearby[i].lat,
			lon 			: nearby[i].lon,
		/*	address		: nearby[i].address,
			city 			: nearby[i].city,
			zip 			: nearby[i].zip, */
			distance	: nearby[i].dist,
			hasChild	: hasChildBoolean
		});
		Ti.API.info (" >> dataRow:" + dataRow );
		
		/* leftmost color sliver */
		var bg_color		 = nearby[i].icon_color;
		var color_block	 = Ti.UI.createView({
			width : 10, height : 32, left : 0, zIndex : 20, backgroundColor : bg_color
		});
		
		var font_size = 14;
		if (custom_place_name.length > 40)
			font_size = 12;
	
		var contentView = Ti.UI.createView({ layout : "horizontal", height : 32, width : "100%" });
		var placeLabel = Ti.UI.createLabel({
			text : custom_place_name,  height : Ti.UI.SIZE, width : Ti.UI.FILL,
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
	tableObject.data = placeData;
}

//=================================================================================
//	Name:			updatePlaceListLabel( LabelObject )
//	Purpose:	use global data array to populate a table view
//=================================================================================
function updatePlaceListLabel(textLabel) {
	var array_size = MYSESSION.nearbyPlaces.length;
	if (array_size == 0)
		textLabel.text = "no nearby places";
	else if (array_size>0)
		textLabel.text = "found " + array_size + " nearby places";
	else if (array_size==1)
		textLabel.text = "found " + array_size + " nearby place";
}
//======================================================================================================================================================
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
		setTimeout ( function(){ getNearbyPlaces($.placeListTable); }, 2000);
		// SET CORRECT PLACE LIST LABEL
		setTimeout ( function(){ updatePlaceListLabel($.placeListTitle); }, 2000);
		
		//=========================== PLACELIST EVENT LISTENER =======================================================
		$.placeListTable.addEventListener('click', function(e_row) {// PLACES TableView
			Ti.API.info("...[o] POI list click [ " + JSON.stringify(e_row) + " ]");
			Ti.API.info("...[o] e_row.index [ " + e_row.index + " ]");
			setRegion(wbMapView, e_row.rowData.lat, e_row.rowData.lon, 0.02);
		
			wbMapView.selectAnnotation( e_row.index );			// Alloy.Globals.annotations[e_row.index]
			
			// Alloy.Globals.placeList_clicks ++;
			// Ti.API.info("...[o] clicked on [" + e_row.rowData.id + " - " + e_row.rowData.name + " ]");
			
			// TODO:  make sure that place annotation opens on TableViewRow click
			
			//============================== CHECKIN MODAL POPUP
			var optns = {
				options : ['Yes', 'Cancel'],
				cancel : 1,
				selectedIndex : 0,
				destructive : 1,
				title : 'Check in at ' + e_row.source.text + '?'
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
		//=========================== / PLACELIST EVENT LISTENER =======================================================
		
		// setTimeout ( function(){ setRegion(wbMapView, 33.971995, -118.420496, 0.15); }, 2000);
	});
	
} 
else{
	Ti.API.log("Internet connection is required to use localization features");
}
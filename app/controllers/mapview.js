/*************************************************************************
					mapview.js  				
*************************************************************************/
//	Waterbowl App
//	
//	Created by Mihai Peteu Oct 2014
//	(c) 2015 waterbowl
//

//==================================================================================================
//	Name:			buildMapMenubar	
//=================================================================================================
function buildMapMenubar() {	
	// mySesh.device.screenwidth
	var menu_pad_right  	= 20;
	var	menubar_pad_bottom 	= 20;
	var btn_spacing 		= 10;
	var main_btn_size 		= 60; 
	var second_btn_size 	= 40;
	var second_pad_right 	 = ( (main_btn_size-second_btn_size)/2 )+menu_pad_right;
	var	secondary_pad_bottom = main_btn_size + menubar_pad_bottom + btn_spacing + ( (main_btn_size-second_btn_size)/2 ); 
	////////////////////////////////////////////////// RECENTER BUTTON ///////////////////
	var recenterBtn = Ti.UI.createButton( {
		id			: "recenterBtn",	
		backgroundImage : ICON_PATH + 'button-center.png',
		// backgroundColor: '#ffffff', 
		opacity : 1,
		height	: second_btn_size, 
		width	: second_btn_size,
		bottom	: secondary_pad_bottom,
		right	: second_pad_right,
		zIndex  : 100
	} );
	////////////////////////////////////////////////// GET POI BUTTON //////////////////////
	var getPoiBtn = Ti.UI.createButton({ 
		id 						: "getPoiBtn",	 
		backgroundImage : ICON_PATH + 'button-waterbowl.png',
		opacity 				: 1,
		zIndex					: 100, 
		height					: main_btn_size, 
		width					: main_btn_size,
		bottom					: menubar_pad_bottom, 
		right					: 20
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
	/////////////////////////////////////// ADD ALL BUTTONS TO MAPVIEW ////////////////////////
	$.mapContainer.add(recenterBtn);
	$.mapContainer.add(getPoiBtn);
	$.mapContainer.add(sniffBtn);
	$.mapContainer.add(markBtn);
	/////////////////////////////////////// ADD RECENTER BTN LISTENER ////////////////////////
	recenterBtn.addEventListener('click', function() {			// REFRESH button
	//Ti.API.debug("...[+] RECENTER button clicked on map");
		Ti.Geolocation.getCurrentPosition(function(e) {
		if (e.error) {			
			// check if running in simulator  if (Titanium.Platform.model != "Simulator")
			// Ti.API.debug( ">>> Running in ["+Titanium.Platform.model+"]" );
			createSimpleDialog( "Can't get your location", "Please make sure location services are enabled." );
			// myMap.centerMapOnLocation(mySesh.geo.lat, mySesh.geo.lon, 0.01);
		}
		else {  // if no errors, and we're not running in Simulator
			// SAVE GEO LAT / LON + TIME ACQUIRED /////////////////////////////////////////////////
			mySesh.geo.geo_trigger_count++;  
			mySesh.xsetGeoLatLon( e.coords.latitude, e.coords.longitude, Math.round( Date.now() / (1000*60) ) - mySesh.geo.last_acquired)
			// CENTER MAP ON USER LOCATION
			myMap.centerMapOnLocation(e.coords.latitude, e.coords.longitude, 0.02);
		}
	});  
  });
 
	///////////////////// 	WATERBOWL/POI BTN - REGULAR 	////////////////////////
	getPoiBtn.addEventListener( 'click', function() { 
		if ( !mySesh.actionOngoing ) {
			disableAllButtons(mySesh.timeout.map_lockout);
			getMapPoi();
		}
	});
	///////////////////// 	WATERBOWL/POI BTN - LONGPRESS 	////////////////////////
	getPoiBtn.addEventListener('longpress', function(e) {
		if (mySesh.dog.dog_ID==1 || mySesh.dog.dog_ID==18) {
			myMap.getNearbyPoi(33.973, -118.421,33.973, -118.421);
			myMap.centerMapOnLocation(33.973, -118.421, 0.05);
		}
	});
	///////////////////// 	MARK BTN LISTENER 	////////////////////////////////////
	markBtn.addEventListener('click', function() {			
		Ti.API.debug("  .... [+] Mark button clicked on map");
		if ( !mySesh.actionOngoing ) {
			var necessary_args = {
				place_ID  	: 601000001,   // TODO: DO NOT HARDCODE
				place_type 	: 2
			};
			createWindowController( "createmark", necessary_args, "slide_left" );
		}
	});
	////////////////////// 	 SNIFF BTN - REGULAR	////////////////////////////////
	sniffBtn.addEventListener('click', function() {		
		Ti.API.debug(" .... [+] SNIFF button clicked on map");
		// WORKFLOW: 
		//	(0) get current user location
		//	(1) center map on current location, zooming further than recenter btn
		//	(2) remove all map markers
		//	(3) draw Marks
		if ( !mySesh.actionOngoing ) {
			disableAllButtons(mySesh.timeout.map_lockout);
			
			Ti.Geolocation.getCurrentPosition(function(e) {	
				if (e.error) {			
					// check if running in simulator  
					// if (Titanium.Platform.model != "Simulator")
					Alloy.Globals.wbMap.removeAllAnnotations();
					Ti.API.debug("  .... [i]   getMarks :: " + mySesh.geo.lat, mySesh.geo.lon );
					myMap.getMarks( mySesh.geo.lat, mySesh.geo.lon, 1, 0.5, 20, function(){
						myMap.getNearbyDogs();
					} );
				} 
				// if no errors
				else {  
					myMap.centerMapOnLocation(e.coords.latitude, e.coords.longitude, 0.008);
					mySesh.geo.lon = e.coords.longitude;
					mySesh.geo.lat = e.coords.latitude;
					Alloy.Globals.wbMap.removeAllAnnotations();
					myMap.getMarks( e.coords.latitude, e.coords.longitude, 1, 0.5, 20, function(){
						 myMap.getNearbyDogs();
					} );
				}
			});
		}
	});
	////////////////////// 	 SNIFF BTN - LONGPRESS	////////////////////////////////
	sniffBtn.addEventListener('longpress', function(e) {
		if (mySesh.dog.dog_ID==1 || mySesh.dog.dog_ID==18) {
			myMap.getNearbyPoi(33.973, -118.421,33.973, -118.421);
			myMap.centerMapOnLocation(33.973, -118.421, 0.05);
		}
	});
}

//===============================================================================================
//	Name:		getMapPoi()
//	Purpose:	provide a centralized action for refreshing map POIs
//===============================================================================================
function getMapPoi() {
	Ti.API.debug("  .... [+] GET POI button clicked on map (anything ongoing? "+mySesh.actionOngoing+")");
	Ti.Geolocation.getCurrentPosition(function(e) {
		if (e.error) {
			// Alloy.Globals.wbMap.removeAllAnnotations();
			myMap.getNearbyPoi( mySesh.geo.lat, mySesh.geo.lon, mySesh.geo.view_lat, mySesh.geo.view_lon);
		} 
		// if no errors
		else { 
			//myMap.centerMapOnLocation(e.coords.latitude, e.coords.longitude, 0.075);
			mySesh.geo.lon = e.coords.longitude;
			mySesh.geo.lat = e.coords.latitude;
			// Alloy.Globals.wbMap.removeAllAnnotations();
			myMap.getNearbyPoi( e.coords.latitude, e.coords.longitude, mySesh.geo.view_lat, mySesh.geo.view_lon);
		}
  	});
}

//=========================================================================================
//	Name:		checkIntoPlace ( place_ID, place_lat, place_lon, place_name )
//	Purpose:	check into a specific place, providing user ID, dog ID, lat, lon to backend
//																		( all available globally except for place_ID )
//	TODO:		Allow selection between multiple dogs
//=========================================================================================
function checkIntoPlace (place_ID, place_name) {
	var checkin_http_obj = Ti.Network.createHTTPClient();
	var params = {
		owner_ID			: mySesh.user.owner_ID,
		dog_ID				: mySesh.dog.dog_ID,
		dog_name			: mySesh.dog.name,
		lat					: mySesh.geo.lat,
		lon					: mySesh.geo.lon,
		current_place_ID 	: place_ID,
		current_place_action: 1
	};
	checkin_http_obj.open("POST", "http://waterbowl.net/mobile/update-dog-location.php");  //set-place-checkin.php
	checkin_http_obj.send(params);
	
	var response = 0;
	
	// xhr onload
	checkin_http_obj.onload = function() {
		// response retrieved from backend
		var json = this.responseText;
		if (json != "") {
			var response = JSON.parse(json);
			if (response.status == 1) { 		// success
				Ti.API.log("  [>]  Checkin added successfully ::  ");
	
				// save last action lat/lon
				mySesh.geo.last_action_lat = mySesh.geo.lat;
				mySesh.geo.last_action_lon = mySesh.geo.lon;

				// in case we want to look up more info on this specific place in the global place array
				var place_index = getArrayIndexById( mySesh.geofencePlaces, place_ID );
				/*		 save Place ID, checkin state, and timestamp in mySesh  	*/
				// checkin now officially complete
				mySesh.dog.current_place_ID 		= place_ID;
				
				// save place lat, lon, and geofence radius
				mySesh.dog.current_place_lat 		= mySesh.geo.lat;
				mySesh.dog.current_place_lon   		= mySesh.geo.lon;
				mySesh.dog.current_place_name    	= place_name;
				mySesh.dog.current_place_geo_radius = mySesh.geofencePlaces[place_index].geofence_radius;
				//Ti.API.info(" >>>>> mySesh.dog.current_place_geo_radius " + mySesh.dog.current_place_geo_radius);
				//Ti.API.info(" >>>>> place_index" + place_index);
				
				mySesh.dog.last_checkin_timestamp= new Date().getTime();
				
				// POPULATE NEARBY PLACE TABLE
				setTimeout ( function(){ refreshPlaceListData("checkIntoPlace"); }, 300);
				// ADD PLACE LIST CLICK EVENT LISTENER
				setTimeout ( function(){ addPlaceListClickListeners($.placeListTable); }, 310);
		
				// center map on user location, get all places in that area
				myMap.centerMapOnLocation(mySesh.geo.lat, mySesh.geo.lon, 0.03);
				myMap.getNearbyPoi( mySesh.geo.lat, mySesh.geo.lon, mySesh.geo.view_lat, mySesh.geo.view_lon );
			

				if ( !mySesh.actionOngoing ) {
					// instead of success message, bounce user to place overview
					var necessary_args = {
						_came_from : "checkin modal", 
						_place_ID  : place_ID		// pass in array index and placeID so we can hit the backend for more details
					};
					createWindowController( "placeoverview", necessary_args, 'slide_left' );
				}
			} else {
			   createSimpleDialog( response.title, response.message );
			} 
		}
		else
			createSimpleDialog( "Problem", "No data received from server"); 
	}; // end xhr onload
}

//=========================================================================================
//	Name:		checkoutFromPlace (place_ID)
//	Purpose:	Check into a specific place, providing user ID, dog ID, lat, lon to backend
//	TODO:		Allow selection between multiple dogs
//=========================================================================================
function checkoutFromPlace (place_ID) {
	var params = {
		owner_ID			: mySesh.user.owner_ID,
		dog_ID				: mySesh.dog.dog_ID,
		dog_name			: mySesh.dog.name,
		lat  				: mySesh.geo.lat,
		lon  				: mySesh.geo.lon,
		current_place_ID 	: mySesh.dog.current_place_ID,
		current_place_action: 0
	};
	Ti.API.debug("  .... [x] checkoutFromPlace :: << "+JSON.stringify(params)+" >>");
	loadJson(params, "http://waterbowl.net/mobile/update-dog-location.php", doClientCheckoutStuff);
}

//=========================================================================================
//	Name:		doClientCheckoutStuff (data)
//	Purpose:	
//=========================================================================================
function doClientCheckoutStuff(data) {
	if (data!="" && data!=null) {
		// Ti.API.debug("* checkout JSON " + json);	
		if (data.status == 1) { 		// success
			// Ti.API.log("  [>]  Checked out from "+ place_ID + " successfully ");
			// save as last action taken
			mySesh.geo.last_action_lat = mySesh.geo.lat;
			mySesh.geo.last_action_lon = mySesh.geo.lon;

			//	 clear vars in mySesh 
			mySesh.dog.current_place_ID 		= null;
			mySesh.dog.current_place_lat 		= null;
			mySesh.dog.current_place_lon	 	= null;
			mySesh.dog.current_place_geo_radius	= null;

			// force place list refresh on window focus
			myUi.refreshPlaceList = 1;

			if (Ti.App.Properties.current_window=="placeoverview") {
				//mySesh.flag.poiEstimatesChanged = true;		// forces a refresh of the estimates buttons in case placeoverview is open
			// closeWindowController(); 
			}
			createSimpleDialog( "Goodbye!", "You've left " + mySesh.dog.current_place_name);
		} 
		else {
			createSimpleDialog( "Uh oh", data.message ); 
		}
	} else {
		createSimpleDialog( "Whoops", "No data received from server"); 
	}
}

//=================================================================================
//	Name:		updateGeofenceTable()
//	Purpose:	use global data array to populate a table view
//=================================================================================
function updateGeofenceTable() {
	$.placeListTitle.height = myUi._height_header;
	
	var array_size = 0;
	
	if (mySesh.geofencePlaces!=[])
		array_size = mySesh.geofencePlaces.length;
	
	// Ti.API.info(">>>>>>>>>>>>>>> updateGeofenceTable array_size :: " + array_size  );
	// (0)	CLEAR PLACE LIST	///////////////////////////////////////////////////////////////////////
	$.placeListTable.data = null;				
	
	if (array_size == 0) {
		Ti.API.info("  .... [x] updateGeofenceTable :: cleared!	");
		$.outerMapContainer.height = '100%';
		//$.placeListTable.opacity = 0;
		//removeAllChildren($.placeListTable);
	} 
	else {
		// (1)  DETERMINE GEOFENCE PLACE LIST TITLE
		if (array_size>1) {
			$.placeListTitle.text = "at one of these places?  mark your presence!";
			$.outerMapContainer.height = mySesh.device.screenheight - ( 2.7 * myUi._height_header );  //  "75%"
		}
		else if (array_size==1) {
			$.placeListTitle.text = array_size + " place nearby ";
			if (mySesh.geofencePlaces[0].id == mySesh.dog.current_place_ID ) {
				$.placeListTitle.text += "- tap to leave current place.";
			} else {
				$.placeListTitle.text += "- tap to mark it.";
			}
			$.outerMapContainer.height = mySesh.device.screenheight - ( 2 * myUi._height_header );// '88%';
		}
		
		// (1)  CREATE AN ARRAY TO HOLD THE TABLE VIEW DATA /////////////////////////////////////////////
		var placeData = new Array();
		
		// (2)	SORT POIs BASED ON PROXIMITY	///////////////////////////////////////////////////////////
		var nearby = mySesh.geofencePlaces;
		nearby.sort(function(a, b) {		// sort by proximity (closest first)
			return parseFloat(a.dist) - parseFloat(b.dist);
		});
	
		// (3)  REORDER LIST TO ACCOMODATE CURRENT CHECK IN AT TOP //////////////////////////////////////
		var checked_in_index 	= ""; 
		for (var i = 0; i < nearby.length; i++) {
			if ( mySesh.dog.current_place_ID == nearby[i].id ) {
				checked_in_index = i;
				break;
			}
		}
		
		if (checked_in_index!="") {	
			// Ti.API.debug( "  >>>> nearby[i]: "+JSON.stringify(nearby[checked_in_index]) );
			// grab a copy of only that one element, starting at its position (i)
			var where_at = nearby.slice(checked_in_index, checked_in_index+1);				
			nearby.splice(checked_in_index,1);		// delete that element
			nearby.unshift(where_at[0]);					// place the copy at the front of the array	
		}
		// (4)  	BUILD EACH TABLE ROW /////////////////////////////////////////////////////////////////
		for (var i = 0; i < nearby.length; i++) {
			var dataRow = Ti.UI.createTableViewRow(	{	
				 // object info that is not exposed to user
				name 	: nearby[i].name,
				id 		: nearby[i].id,
				lat 	: nearby[i].lat,
				lon 	: nearby[i].lon,
				distance: nearby[i].dist.toFixed(1),
				hasChild: false
			});
				
			// (5)  ADD LEFT SIDE ICON //////////////////////////////////////////////////////////////////
			var colorBlock = myUi.createColorBlock(nearby[i].icon_color, nearby[i].icon_basic);
					
			// (6)  ACCOMODATE LONG PLACE NAMES /////////////////////////////////////////////////////////
			var font_size = 14;
		if (nearby[i].name.length > 40 && nearby[i].name.length < 60)
			font_size    = 12;
		else if (nearby[i].name.length > 60)
			font_size    = 10;
		
		// (7)	IF CURRENTLY CHECKED IN HERE, DISPLAY ALL FANCY //////////////////////////////////// 
		// TODO:  createTableView row should be wrapped in a TableRow member function
		var row_bg_color = "#ffffff";
		
			if ( mySesh.dog.current_place_ID == nearby[i].id ) {
				row_bg_color="#ec3c95";
				var placeLabel = Ti.UI.createLabel({
					text : nearby[i].name +" (HERE)",  height : "100%", width : Ti.UI.FILL,
					left : 8, color : "#ffffff", textAlign : 'left',  
					font : { fontFamily : 'Raleway-Bold', fontSize : font_size } 
				});
			}
			else {
				var placeLabel = Ti.UI.createLabel({
					text : nearby[i].name,  height : "100%", width : Ti.UI.FILL,
					left : 10, color : "#000000", textAlign : 'left', 
					font : { fontFamily : 'Raleway', fontSize : font_size } 
				});
			}
			var contentView = Ti.UI.createView({ 
			  layout : "horizontal", 
			  height : myUi._height_header, 
			  width  : "100%", 
			  backgroundColor: row_bg_color 
			});
			contentView.add(colorBlock);
			contentView.add(placeLabel);
			// (8)	FINALLY ADD THE *CUSTOM* TABLE ROW TO PARENT VIEW ////////////////////////////////// 
			dataRow.add(contentView);
			placeData.push(dataRow);
			//Ti.API.debug( " >>>>>>> placeData: "+JSON.stringify(dataRow) );
		} // end for0
		/* populate placeList TableViewRows*/
		$.placeListTable.data = placeData;
		addPlaceListClickListeners($.placeListTable);
	} // if (array_size > 0)
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
function presentUserCheckinOptions( place ) {
  Ti.API.info( "  >>> presentUserCheckinOptions :: " + JSON.stringify(place) + " | mySesh.dog.current_place_ID " + mySesh.dog.current_place_ID );
  var modal_title = 'Mark your presence at '+place.name + '?';
  if (mySesh.dog.current_place_ID == place.id) {
	var modal_title = 'Are you leaving '+place.name+"?";
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
	
	checkin_dialog.addEventListener('click', function(e_dialog) {
		if (e_dialog.index == 0) {  // user clicked OK
			if (mySesh.dog.current_place_ID == place.id)	{
				checkoutFromPlace (place.id);
			} else {
				checkIntoPlace(place.id, place.name);
			}
		}
	});
} 

//=================================================================================
//	Name:			placeListListener(e) 
//	Purpose:	listen for clicks on nearby place list  
//=================================================================================
function placeListListener(e) {
	// Ti.API.debug("...[o] POI list click [ " + JSON.stringify(e.row) + " ]");
	myMap.centerMapOnLocation(e.row.lat, e.row.lon, 0.03);
	// pop up a check in or check out dialog box based on current checkin status
	presentUserCheckinOptions( e.row );
}

//=============================================================================
//	Name:			refreshPlaceListData (client_action)
//=============================================================================
function refreshPlaceListData(client_action) {
	Ti.API.debug(".... [~] refreshPlaceListData called from :: " + client_action);
	getPoisInGeofence( Alloy.Globals.wbMap, mySesh.geo.lat, mySesh.geo.lon, client_action );   // will affect place list
	// SET CORRECT AMOUNT OF NEARBY PLACES (PLACE LIST LABEL)
	setTimeout ( function(){ updateGeofenceTable(); }, 500);
	
	// ADD PLACE LIST CLICK EVENT LISTENER
	// remove( PlaceListClickListeners )
	// setTimeout ( function(){ addPlaceListClickListeners($.placeListTable); }, 700);
}

//=================================================================================
//	Name:			refreshRAM()
//	Purpose:	debug memory leaks
//=================================================================================
function refreshRAM() {
	$.mem_usage.text = Titanium.Platform.availableMemory.toFixed(2)+" MB available";
}

//--------------------------------------------------------------------------------------------------------------

//				G E O F E N C E - R E L A T E D 

//--------------------------------------------------------------------------------------------------------------

//=============================================================================
//	Name:			getPoisInGeofence ( mapObject, user_lat, user_lon )
//	Purpose:	get places in db, plus a smaller subset of nearby ones
//=============================================================================
function getPoisInGeofence( mapObject, user_lat, user_lon, client_action ) {
  var params = {
		lat      		: user_lat,
		lon       		: user_lon,
		owner_ID		: mySesh.user.owner_ID,
		dog_ID			: mySesh.dog.dog_ID,
		client_action	: client_action
	};
	loadJson(params, "http://www.waterbowl.net/mobile/get-places-nearby.php", updatePoisInGeofence);
}

//=============================================================================
//	Name:			updatePoisInGeofence ( data )
//	Purpose:	
//=============================================================================
function updatePoisInGeofence( data ) {
	if ( data.length > 0 ) {
		if ( !arraysEqual(mySesh.geofencePlaces, data) ) {
			mySesh.geofencePlaces = data;
			updateGeofenceTable($.placeListTable);
		} 
		// else { don't refresh geofence tables, no change } 
	} else {
		mySesh.geofencePlaces = [];
		updateGeofenceTable($.placeListTable);
	}
}	

//=============================================================================
//	Name:		testForAutoCheckout ( )
//	Purpose:	
//=============================================================================
function testForAutoCheckout() {
	if (mySesh.dog.current_place_ID > 0) {  // OLD CHECK
		// see if current user lat/lon is out of the geofence of our stored checkin place lat/lon  	
		var dist = getDistance(mySesh.geo.lat, mySesh.geo.lon, mySesh.dog.current_place_lat, mySesh.dog.current_place_lon);
		Ti.API.debug("  .... [x] testForAutoCheckout :: mySesh.dog lat/lon");
		Ti.API.debug("  .....+--"+mySesh.dog.current_place_lat + " / " + mySesh.dog.current_place_lon);
		var threshold = (dist - mySesh.dog.current_place_geo_radius);
		Ti.API.debug( " .....+--dist - geo_radius [" + dist + "-" + mySesh.dog.current_place_geo_radius + "="+threshold+"]" );
		if( threshold >= 0 ) {
			// Call update-dog-location.php on the backend, and doClientCheckoutStuff on the front end
			checkoutFromPlace( mySesh.dog.current_place_ID );
		} 
	} 
}

//=================================================================================
//	Name:			locationCallback()
//	Purpose:	  
//=================================================================================
var locationCallback = function(e) {
	if (!e.success || e.error) {
		// avoid alert window, fail silently
		// createSimpleDialog("Couldn't pinpoint your location", "Error - "+JSON.stringify(e.error) );
		Ti.API.debug( "Couldn't pinpoint your location", "Error - "+JSON.stringify(e.error) );
	}
	else {
		mySesh.geo.geo_trigger_count++;
		// save the last geo location plus the newest one
		mySesh.xsetGeoLatLon( e.coords.latitude, e.coords.longitude, Math.round( Date.now() / (1000*60) ) - mySesh.geo.last_acquired)	
		
		// UNCOMMENT HUD DIV IN MAPVIEW.XML FIRST 
		//$.geo_success.text = "geo try/success #" + mySesh.geo.geo_trigger_count+"/"+mySesh.geo.geo_trigger_success;
		//$.geo_latlng.text  = mySesh.geo.lat.toFixed(4)+"/" +  mySesh.geo.lon.toFixed(4);
		var dist = getDistance(mySesh.geo.lat, mySesh.geo.lon, mySesh.geo.last_action_lat, mySesh.geo.last_action_lon);
		Ti.API.debug( "  .... [~] locationCallback :: dist [ " + dist + " ]"); 
		// Ti.API.debug( "  .... [~] locationCallback :: mySesh.geo [" + JSON.stringify(mySesh.geo) + " ]"); 
		
		if( dist>= mySesh.geo.accuracy_threshold && mySesh.geo.last_action_lat!=null && mySesh.geo.last_action_lon!=null) { 	// 0.006 mi = 31.68 ft
			refreshPlaceListData("locationCallback (moved more than "+mySesh.geo.accuracy_threshold+"mi)");
		} 
		// AUTO CHECKOUT 
		testForAutoCheckout();	
	}
};


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

// WARN USER ABOUT DATA CONNECTION / LACK OF GPS 
if(!Ti.Network.online) {
	createSimpleDialog("No data connection","The Internets are required to browse the map.");
} 
if( Titanium.Geolocation.locationServicesEnabled === false ) {
	createSimpleDialog("GPS is disabled","Without a location, functionality will be limited.");
}

//var myMapbox = require('com.polancomedia.mapbox');
//var mapboxView = myMapbox.createView({
//	map		: 'jericho1ne.jg64pjl9'
//});
//$.mapContainer.add(mapboxView);

// INITIALIZATION STUFF TO BE DONE ONLY ONCE ////////////////////
Titanium.Geolocation.getCurrentPosition(function(e){
	// ERROR
	if (!e.success || e.error) {
		if (Titanium.Platform.model!="Simulator") {
			createSimpleDialog("Can't get your location","Please check location services are enabled on your mobile device.");
			Ti.API.debug( "  .... [x] Could not get location: "+ e.code +" [ "+JSON.stringify(e.error)+" ]");
		}
		mySesh.geo.view_lat = 34.003;
		mySesh.geo.view_lon = -118.433;
		// DRAW THE MAP WITH GENERIC LA COORDINATES
		initializeMap(mySesh.geo.view_lat, mySesh.geo.view_lon);
		// SAVE DOG LOCATION
		//mySesh.saveDogLocation();
	} 
	// SUCCESS
	else {		
		// SAVE GEO.lat/lon, view_lat/view_lon, + time acquired  //////////////
		mySesh.geo.geo_trigger_count++;  
		mySesh.xsetGeoLatLon( e.coords.latitude, e.coords.longitude, Math.round( Date.now() / (1000*60) ) - mySesh.geo.last_acquired)
		mySesh.geo.view_lat = e.coords.latitude;
		mySesh.geo.view_lon = e.coords.longitude;
		mySesh.geo.last_action_lat = e.coords.latitude;
		mySesh.geo.last_action_lon = e.coords.longitude;

		// DRAW THE MAP WITH RECENT COORDINATES
		initializeMap(mySesh.geo.lat, mySesh.geo.lon);
		// SAVE DOG LOCATION
		mySesh.saveDogLocation(0,0,"Mapview Initialization");
	}

	// (2)  ATTACH MENU BAR ICONS (MARK + SNIFF + SHOW POI)
	buildMapMenubar();
	$.mapContainer.add( Alloy.Globals.wbMap );
	
	// (3) GET MAP POIs AND PLACELIST DATA (only fill the view lat/lon the first time)
	mySesh.geo.view_lat = mySesh.geo.lat; 
	mySesh.geo.view_lon = mySesh.geo.lon;
	myMap.getNearbyPoi( mySesh.geo.lat, mySesh.geo.lon, mySesh.geo.view_lat, mySesh.geo.view_lon);

	refreshPlaceListData("Map Initialization");
	//testForAutoCheckout();		// not necessary since this is embedded in the locationCallback
});

// REPEATEDLY TRIGGER ON WINDOW FOCUS //////////////////////////////////////////
$.mapview.addEventListener('focus',function(e) {
	if(myUi.refreshPlaceList) {
		myUi.refreshPlaceList = 0;
		refreshPlaceListData("Window Focus");
	}

	// window regained focus after createmark was closed, so refresh marks+dogs
	if(mySesh.flag.nearbyDogsChanged) {	
		Ti.API.debug("  .... [i] mapview.focus, getMarks, getNearbyDogs");
		Ti.API.debug("  .... [i]   getMarks - focus :: " + mySesh.geo.lat, mySesh.geo.lon );
		Alloy.Globals.wbMap.removeAllAnnotations();
		myMap.getMarks( mySesh.geo.lat, mySesh.geo.lon, 1, 0.5, 20, function(){
			 myMap.getNearbyDogs();
		} ); 
		mySesh.flag.nearbyDogsChanged = false;
	}
}); 

//====================================================================================
// 		Geolocation Change Event Listener
//		Purpose:  
//		1) 	Check for stale checkins
//		2) 	Refresh nearby places table
//		2)  Save latest user location into mySesh.geo.lat, mySesh.geo.lon
//====================================================================================
mySesh.saveLocationTimer();
Titanium.Geolocation.addEventListener('location', locationCallback);
//setInterval(refreshRAM, 2000);			// show RAM usage every 2 seconds


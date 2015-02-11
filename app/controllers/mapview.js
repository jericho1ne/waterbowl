//==================================================================================================================
//	Name:			buildMapMenubar	
//==================================================================================================================
function buildMapMenubar() {	
	// mySesh.device.screenwidth
	var menubar_pad_right  = 20;
	var	menubar_pad_bottom = 20;
	var btn_spacing 			 = 10;
	var main_btn_size 		 = 60; 
	var secondary_btn_size = 40;
	var secondary_pad_right 	= ( (main_btn_size-secondary_btn_size)/2 )+menubar_pad_right;
	var	secondary_pad_bottom 	= main_btn_size + 
															menubar_pad_bottom + btn_spacing + 
															( (main_btn_size-secondary_btn_size)/2 ); 
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
      } else {  // if no errors, and we're not running in Simulator
      	// SAVE GEO LAT / LON + TIME ACQUIRED /////////////////////////////////////////////////
			  mySesh.geo.geo_trigger_count++;  
			  mySesh.xsetGeoLatLon( e.coords.latitude, e.coords.longitude, Math.round( Date.now() / (1000*60) ) - mySesh.geo.last_acquired)
				// CENTER MAP ON USER LOCATION
        myMap.centerMapOnLocation(e.coords.latitude, e.coords.longitude, 0.02);
	    }
    });  
  });
  ///////////////////// 	ADD WATERBOWL/POI BTN LISTENER 	////////////////////////
  getPoiBtn.addEventListener( 'click', function() { 
  	getMapPoi(); 
  });
	//							 WATERBOWL/POI BUTTON LONGPRESS				 												// 
	getPoiBtn.addEventListener('longpress', function(e) {
		alert("looong pressed WB button!");
	});
	/////////////////////////////////////// ADD MARK BTN LISTENER //////////////////
	markBtn.addEventListener('click', function() {			
		Ti.API.debug(mySesh.funcCallCount + "  .... [+] Mark button clicked on map");
		var necessary_args = {
			place_ID  	: 601000001,   // TODO: DO NOT HARDCODE
			place_type 	: 2
		};
		createWindowController( "createmark", necessary_args, "slide_left" );
	});
	/////////////////////////////////////// ADD SNIFF LISTENER /////////////////////
	sniffBtn.addEventListener('click', function() {		
    Ti.API.debug(mySesh.funcCallCount + " .... [+] SNIFF button clicked on map");
    // WORKFLOW: 
    //	(0) get current user location
    //	(1) center map on current location, zooming further than recenter btn
    //	(2) remove all map markers
    //	(3) draw Marks
    Ti.Geolocation.getCurrentPosition(function(e) {
      if (e.error) {			
        // check if running in simulator  if (Titanium.Platform.model != "Simulator")
        Alloy.Globals.wbMap.removeAllAnnotations();
      	myMap.getMarks( mySesh.geo.lat, mySesh.geo.lon, 1, 0.5, 20 );
      	disableAllButtons();
      } else {  // if no errors
        myMap.centerMapOnLocation(e.coords.latitude, e.coords.longitude, 0.008);
        mySesh.geo.lon = e.coords.longitude;
        mySesh.geo.lat = e.coords.latitude;
        Alloy.Globals.wbMap.removeAllAnnotations();
        myMap.getMarks( e.coords.latitude, e.coords.longitude, 1, 0.5, 20 );
        disableAllButtons();
	    }
    });  
	});
}

//===============================================================================================
//	Name:			getMapPoi()
//	Purpose:	provide a centralized action for refreshing map POIs
//===============================================================================================
function getMapPoi() {
	Ti.API.debug(mySesh.funcCallCount + "  .... [+] GET POI button clicked on map (anything ongoing? "+mySesh.actionOngoing+")");
	if ( !mySesh.actionOngoing ) {
		Ti.Geolocation.getCurrentPosition(function(e) {
	    if (e.error) {
	    	// Alloy.Globals.wbMap.removeAllAnnotations();
	    	myMap.getNearbyPoi( mySesh.geo.lat, mySesh.geo.lon, mySesh.geo.view_lat, mySesh.geo.view_lon);
	    	disableAllButtons();  // disable button after first click while we load backend data
	    } else {  // if no errors
	      //myMap.centerMapOnLocation(e.coords.latitude, e.coords.longitude, 0.075);
	      mySesh.geo.lon = e.coords.longitude;
	      mySesh.geo.lat = e.coords.latitude;
	      // Alloy.Globals.wbMap.removeAllAnnotations();
	      myMap.getNearbyPoi( e.coords.latitude, e.coords.longitude, mySesh.geo.view_lat, mySesh.geo.view_lon);
	      disableAllButtons();  // disable button after first click while we load backend data
	    }
	  });
	}  
}

//=========================================================================================
//	Name:			checkIntoPlace ( place_ID, place_lat, place_lon, place_name )
//	Purpose:	check into a specific place, providing user ID, dog ID, lat, lon to backend
//																		( all available globally except for place_ID )
//						TODO:			Allow selection between multiple dogs
//=========================================================================================
function checkIntoPlace (place_ID, place_lat, place_lon, place_name) {
	var checkin_http_obj = Ti.Network.createHTTPClient();
	var params = {
		place_ID	: place_ID,
		owner_ID	: mySesh.user.owner_ID,
		dog_ID		: mySesh.dog.dog_ID,
		lat				:	mySesh.geo.lat,
		lon				:	mySesh.geo.lon
	};
	checkin_http_obj.open("POST", "http://waterbowl.net/mobile/set-place-checkin.php");
	checkin_http_obj.send(params);
	
	// Ti.API.debug ( "... sending stuff to place-checkin.php " + JSON.stringify(params) );
	var response = 0;

	/* response data received */
	checkin_http_obj.onload = function() {
		var json = this.responseText;
		if (json != "") {
			var response = JSON.parse(json);
			if (response.status == 1) { 		// success
				Ti.API.log("  [>]  Checkin added successfully ");
	
				// in case we want to look up more info on this specific place in the global place array
			  var place_index = getArrayIndexById( mySesh.geofencePlaces, place_ID );
				/*		 save Place ID, checkin state, and timestamp in mySesh  	*/
				// checkin now officially complete
				mySesh.dog.current_place_ID 		= place_ID;
				
				// grab place lat
				mySesh.dog.current_place_lat     = place_lat;
				mySesh.dog.current_place_lon     = place_lon;
				mySesh.dog.current_place_name    = place_name;
				mySesh.dog.current_place_geo_radius = mySesh.geofencePlaces[place_index].geo_radius;
				mySesh.dog.last_checkin_timestamp= new Date().getTime();
				
				// Ti.API.debug ( "... mySesh.dog: " + JSON.stringify(mySesh.dog) );
				// POPULATE NEARBY PLACE TABLE
  		  setTimeout ( function(){ refreshPlaceListData(); }, 300);
  		  // ADD PLACE LIST CLICK EVENT LISTENER
  		  setTimeout ( function(){ addPlaceListClickListeners($.placeListTable); }, 310);
  		
  			// center map on user location, get all places in that area
  			myMap.centerMapOnLocation(mySesh.geo.lat, mySesh.geo.lon, 0.03);
  			myMap.getNearbyPoi( mySesh.geo.lat, mySesh.geo.lon, mySesh.geo.view_lat, mySesh.geo.view_lon);
  			
			  // instead of success message, bounce user to place overview
			  var necessary_args = {
					_came_from : "checkin modal", 
		      _place_ID  : place_ID		// pass in array index and placeID so we can hit the backend for more details
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
  // Ti.API.debug("  .... [x] checking out from ["+place_ID+"]");
	var checkout_http_obj = Ti.Network.createHTTPClient();
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
			// Ti.API.debug("* checkout JSON " + json);
			var response = JSON.parse(json);
			if (response.status == 1) { 		// success
				// Ti.API.log("  [>]  Checked out from "+ place_ID + " successfully ");
	
				/*		 save Place ID, checkin state, and timestamp in mySesh  	*/
				mySesh.dog.current_place_ID 	= null;
				// POPULATE NEARBY PLACE TABLE
				refreshPlaceListData();
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
//	Name:			updateGeofenceTable()
//	Purpose:	use global data array to populate a table view
//=================================================================================
function updateGeofenceTable() {
	$.placeListTitle.height = myUiFactory._height_header;
	
	var array_size = mySesh.geofencePlaces.length;
	if (array_size == 0) {
    $.placeListTitle.text = "no nearby places";
	  $.outerMapContainer.height = '100%';
  }
	else if (array_size>1) {
		$.placeListTitle.text = "here at one of these places? mark your presence!";
	  $.outerMapContainer.height = mySesh.device.screenheight - ( 2.5 * myUiFactory._height_header );  //  "75%"
	}
	else if (array_size==1) {
		// alert(mySesh.geofencePlaces[0].id+" / "+mySesh.dog.current_place_ID);
		$.placeListTitle.text = array_size + " place nearby ";
		if (mySesh.geofencePlaces[0].id == mySesh.dog.current_place_ID ) {
			$.placeListTitle.text += "- tap to leave current place.";
		} else {
		  $.placeListTitle.text += "- tap to mark it.";
    }
    $.outerMapContainer.height = mySesh.device.screenheight - ( 2 * myUiFactory._height_header );// '88%';
  }
  
  
  // (0)	CLEAR PLACE LIST	///////////////////////////////////////////////////////////////////////
  $.placeListTable.data = null;				
		
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
		Ti.API.debug( "  >>>> nearby[i]: "+JSON.stringify(nearby[checked_in_index]) );
		// grab a copy of only that one element, starting at its position (i)
		var where_at = nearby.slice(checked_in_index, checked_in_index+1);				
		nearby.splice(checked_in_index,1);		// delete that element
		nearby.unshift(where_at[0]);					// place the copy at the front of the array	
	}
	// (4)  	BUILD EACH TABLE ROW /////////////////////////////////////////////////////////////////
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
			
		// (5)  ADD LEFT SIDE ICON //////////////////////////////////////////////////////////////////
		var colorBlock	 	 = myUiFactory.createColorBlock(nearby[i].icon_color, nearby[i].icon_basic);
				
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
  			text : nearby[i].name +" -- (currently here)",  height : "100%", width : Ti.UI.FILL,
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
		  height : myUiFactory._height_header, 
		  width  : "100%", 
		  backgroundColor: row_bg_color 
		});
		contentView.add(colorBlock);
		contentView.add(placeLabel);
		// (8)	FINALLY ADD THE *CUSTOM* TABLE ROW TO PARENT VIEW ////////////////////////////////// 
		dataRow.add(contentView);
		placeData.push(dataRow);
		//Ti.API.debug( " >>>>>>> placeData: "+JSON.stringify(dataRow) );
	}
	/* populate placeList TableViewRows*/
	$.placeListTable.data = placeData;
	addPlaceListClickListeners($.placeListTable);
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
function presentUserCheckinOptions( place ) {
	Ti.API.info( "  presentUserCheckinOptions :: " + JSON.stringify(place) + " | checkin? " + mySesh.dog.current_place_ID );
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
	Ti.API.debug("...[o] POI list click [ " + JSON.stringify(e.row) + " ]");
	//Ti.API.debug("...[o] event index [ " + e.index + " ]");
	myMap.centerMapOnLocation(e.row.lat, e.row.lon, 0.03);

  // figure out which annotation index to trigger
  // var anno_index = getArrayIndexById( Alloy.Globals.placeAnnotations, e.row.id );
	// Alloy.Globals.wbMap.selectAnnotation( Alloy.Globals.placeAnnotations[anno_index] );		
	
	// pop up a check in or check out dialog box based on current checkin status
	presentUserCheckinOptions( e.row );
}

//=============================================================================
//	Name:			refreshPlaceListData ()
//=============================================================================
function refreshPlaceListData() {
 //  Ti.API.debug(".... [~] refreshPlaceListData called ....");
  getPoisInGeofence( Alloy.Globals.wbMap, mySesh.geo.lat, mySesh.geo.lon );   // will affect place list
	// SET CORRECT AMOUNT OF NEARBY PLACES (PLACE LIST LABEL)
//	setTimeout ( function(){ updateGeofenceTable(); }, 650);
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
function getPoisInGeofence( mapObject, user_lat, user_lon ) {
	//	Ti.API.debug("...[~] getPoisInGeofence() user[ "+user_lat+"/"+user_lon+" ]");
  var params = {
		lat       : user_lat,
		lon       : user_lon,
		owner_ID	: mySesh.user.owner_ID
	};
	loadJson(params, "http://waterbowl.net/mobile/get-places-nearby.php", updatePoisInGeofence);
}

//=============================================================================
//	Name:			updatePoisInGeofence ( data )
//	Purpose:	
//=============================================================================
function updatePoisInGeofence( data ) {
	Ti.API.debug( ".... .... .... .... POIs in geofence: " + data.length );
	if (data.length > 0) {
		mySesh.geofencePlaces = data;
			
		// CHECK #1 - Have we left previous place's geofence?  
		// If current_place_ID is not null, and looking up existing place's ID in geofencePlaces returns -1
    if (mySesh.dog.current_place_ID>0 && getArrayIndexById(data, mySesh.dog.current_place_ID)==-1 ) {
    	checkoutFromPlace( mySesh.dog.current_place_ID );
   		createSimpleDialog( "Seems you've left", "Automatically checked you out from " + mySesh.dog.current_place_name);
    }
    // CHECK #2 - If there a Checkin modal currently up, then check if situation is still valid 
    //    eg: is the currently displayed place name still part of geofencePlaces
	}
	// POPULATE NEARBY PLACE TABLE
	updateGeofenceTable($.placeListTable);
}	


//=================================================================================
//	Name:			refreshGeo()
//	Purpose:	  
//=================================================================================
function refreshGeo() {
	if(Ti.Network.online ) {
		  //if (mins_elapsed > mySesh.geo.refresh_interval) {   // only if 2 mins have passed since last geo update
	  // set time last acquired (minutes since start of Unix Epoch)
	      
	  Titanium.Geolocation.getCurrentPosition(function(e) {
	  	if (!e.success || e.error) {
	  		// Ti.API.debug( "[[[ refreshGeo ]]] ::  X X X  Problems with Geolocation...  "+e.error);
	  	}
	  	else {   
	    	// Ti.API.debug( "[[[ refreshGeo ]]] :: + + + Got location #[" + mySesh.geo.geo_trigger_count + "] "+e.coords.latitude+", "+e.coords.longitude);     	    
	    	
	    	// SAVE GEO LAT / LON + TIME ACQUIRED /////////////////////////////////////////////////
			  mySesh.geo.geo_trigger_count++;  
			  mySesh.xsetGeoLatLon( e.coords.latitude, e.coords.longitude, Math.round( Date.now() / (1000*60) ) - mySesh.geo.last_acquired)

				$.geo_success.text = "geo try/success #" + mySesh.geo.geo_trigger_count+"/"+mySesh.geo.geo_trigger_success;
				$.geo_latlng.text = e.coords.latitude.toFixed(4)+"/" +e.coords.longitude.toFixed(4);
	      //$.current_place_ID.text = "Checked in at : "+mySesh.dog.current_place_ID;
	      // see if user is still checked in somewhere, and if so, have they left the geofence
	      // myMap.getNearbyPoi( e.coords.latitude, e.coords.longitude, mySesh.geo.view_lat, mySesh.geo.view_lon);
	      refreshPlaceListData();
	  	}
		});
	}	else {
	  createSimpleDialog("No data connection","The Internets are required to browse the map.");
		Ti.API.log("No Internet connection...");
	}
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
  // ERROR
  if (!e.success || e.error) {
	  if (Titanium.Platform.model!="Simulator") {
      //Ti.API.log('............... Could not find the device location');
  	  createSimpleDialog("Can't get your location","Please check location services are enabled on your mobile device.");
    	//Ti.API.debug( "GEO ERROR Code: "+ e.code +" [ "+JSON.stringify(e.error)+" ]");
    }
  } 
  // SUCCESS
  else {		
  	// SAVE GEO LAT / LON + TIME ACQUIRED /////////////////////////////////////////////////
		mySesh.geo.geo_trigger_count++;  
		mySesh.xsetGeoLatLon( e.coords.latitude, e.coords.longitude, Math.round( Date.now() / (1000*60) ) - mySesh.geo.last_acquired)
	}

  // (1)	DRAW THE MAP
  initializeMap(mySesh.geo.lat, mySesh.geo.lon);
 	
 	// (2)  ATTACH MENU BAR ICONS (MARK + SNIFF + SHOW POI)
 	buildMapMenubar();
 	$.mapContainer.add( Alloy.Globals.wbMap );
 	
  // (3) GET MAP POIs AND PLACELIST DATA
  myMap.getNearbyPoi( mySesh.geo.lat, mySesh.geo.lon, mySesh.geo.view_lat, mySesh.geo.view_lon);
  refreshPlaceListData();
  
  // HACK!
  /* 	var necessary_args = {
		_came_from : "checkin modal", 
	  _place_ID  : 620000001		// pass in array index and placeID so we can hit the backend for more details
	};
	createWindowController( "placeoverview", necessary_args, 'slide_left' );	 */
});
	
/*
$.mapview.addEventListener('focus',function(e) {
	Ti.API.info(" Mapview in focus, refreshing Place List. Current Place ID# ["+mySesh.dog.current_place_ID+"]");
	refreshPlaceListData();
}); */

//====================================================================================
// 		Geolocation Change Event Listener
//		Purpose:  
//		1) 	Check for stale checkings
//		2) 	Refresh nearby places table
//		2)  Save latest user location into mySesh.geo.lat, mySesh.geo.lon
//====================================================================================
setInterval(refreshGeo, 30000);			// every X milliseconds
//setInterval(refreshRAM, 2000);			// show RAM usage every 2 seconds
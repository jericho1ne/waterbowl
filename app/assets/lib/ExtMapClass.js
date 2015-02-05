function ExtMap(){
  /*		DEBUG MODE!		(Adds borders to stuff)		*/
  this._delta = 0.07;
  Alloy.Globals.wbMap = '';
};

//=================================================================================
// 	Name:  		initializeMap ()
// 	Purpose:	draw default Apple map
//=================================================================================
/*ExtMap.prototype.initializeMap = function(lat, lon) {
	// DRAW MAP
	Alloy.Globals.wbMap = myMapFactory.createView({
		mapType : myMapFactory.NORMAL_TYPE, // NORMAL HYBRID SATTELITE
		region : {
			latitude 			: lat,
			longitude 		: lon,
			latitudeDelta : this._delta,
			longitudeDelta: this._delta,
		}, 
		top 					: 0,
		animate 			: false,
		maxZoom				: 1,
		minZoom				: 2,
		regionFit	 		: true,
		userLocation 	: true,
		enableZoomControls : true
	});
	Alloy.Globals.wbMap.addEventListener('regionChanged',function(e) {
		mySesh.setGeoViewport(e.source.region.latitude, e.source.region.longitude);
	});
	Ti.API.log(".... [~] Map object built ");
	// return Alloy.Globals.wbMap;
}
*/

//=================================================================================
// 	Name:  		centerMapOnLocation (lat, lon, delta )
// 	Purpose:	center map viewpoint on user position
//=================================================================================
ExtMap.prototype.centerMapOnLocation = function(lat, lon, delta) {
	// set bounding box, move the map View/Location
	Ti.API.debug(".... [~] centerMapOnLocation ["+ lat +" / "+ lon +"]");
	Alloy.Globals.wbMap.setLocation ({
		latitude 			: lat,
		longitude 		: lon,
		latitudeDelta : delta,
		longitudeDelta: delta, 
		animate : true
	});
}

//---------------------------------------------------------------------------------------------------

// 					POINTS OF INTEREST	


//================================================================================
//		Name:			loadMapJson
//		Purpose:	standardize HTTP requests
//================================================================================
ExtMap.prototype.loadMapJson = function ( params, url, callbackFunction ) {
	var query = Ti.Network.createHTTPClient();
	query.open("POST", url);	
	query.send( params );
	query.setTimeout(2000);
	query.onload = function() {
		var jsonResponse = this.responseText;
		if (jsonResponse != "" ) {
			var data = JSON.parse( jsonResponse );
			// Ti.API.debug("....[~] UiFactory.loadMapJson ["+JSON.stringify(data)+"]");
			if (callbackFunction!="")	{		
				callbackFunction(data);
			}	else {
				return data;	
			}
		}
		else {
			createSimpleDialog('Error', 'No data received');
			return [];
		}
	};
}

//=====================================================================================================
//	Name:			getNearbyPoi ( user_lat, user_lon, view_lat, view_lon )
//	Purpose:	grab the top X closest places to user position OR center of map view
//=====================================================================================================
ExtMap.prototype.getNearbyPoi = function( user_lat, user_lon, view_lat, view_lon ) {
	Ti.API.info("...[~] getNearbyPoi() [ "+user_lat+"/"+user_lon+"  ], view [ "+view_lat+"/"+view_lon+" ]");
	 var params = {
		lat       : user_lat,
		lon       : user_lon, 
		view_lat  : view_lat,
		view_lon  : view_lon,
		owner_ID  : mySesh.user.owner_ID
	};
	//this.refreshAnnotations(mapObject);
	
	var self = this;
	this.loadMapJson(params, "http://waterbowl.net/mobile/get-places-map.php", function(data) {
		self.refreshAnnotations(data)
	});
}

//=============================================================
//	Name:			createMapAnnotation( place_data, index )
//	Purpose:	build Apple Maps place marker from incoming array
//	Return:		annotation object
//=============================================================
ExtMap.prototype.createMapAnnotation = function( place_data, index ) {
	Ti.API.debug (".... [~] Added POI [ " +place_data.place_ID + " ] to map");
	// ADD ANNOTATION BUTTON 
	var anno_button = Ti.UI.createButton({ 
		id			   	    : "poi_btn_"+place_data.place_ID,
		name					  : place_data.name,
		backgroundImage : ICON_PATH + 'button-forward.png',
		zIndex					: 10, 
		height					: 30, 
		width						: 30
	});
	// ADD ANNOTATION BUTTON EVENT LISTENER g
 	anno_button.addEventListener('click', function(e){
 		// Ti.API.debug ( ".... [+] Clicked on >> " + e.source.id );	
		var necessary_args = {
			_place_ID : place_data.place_ID		// pass in array index and placeID so we can hit the backend for more details
		};
		createWindowController( "placeoverview", necessary_args, 'slide_left' );
 	}); 
	// CREATE AND RETURN ANNOTATION CONTAINER  	
	return myMapFactory.createAnnotation({
		id        : "poi_anno_"+place_data.place_ID, 
		latitude  : place_data.lat, 
		longitude : place_data.lon,
		title     : place_data.name,
		subtitle  : place_data.city + " (" + place_data.dist + " mi)",
		animate   : false,
		image     : ICON_PATH + place_data.icon, 	// or pull icon from AWS: mySesh.AWS.base_icon_url
		rightView : anno_button
	});
}

//=========================================================================
//	Name:			refreshAnnotations( data )
//	Purpose:	grab POI/locations from backend php file, order by proximity
//=========================================================================
ExtMap.prototype.refreshAnnotations = function(data) {	
	/////////////////////// REMOVE ANY EXISTING ANNOTATIONS ////////////////////////
	Alloy.Globals.wbMap.removeAllAnnotations();
	var temp_annotationArray = [];
	mySesh.allPlaces = data;
	Ti.API.debug( "ExtMap.prototype.refreshAnnotations called :: " );
	
	/////////////////////// CREATE ANNOTATION FOR EACH POI IN ARRAY //////////////// 
	for (var i=0; i<mySesh.allPlaces.length; i++) { 
		
		// ADD ANNOTATION BUTTON 
		var anno_button = Ti.UI.createButton({ 
			id			   	    : "poi_btn_"+mySesh.allPlaces[i].place_ID,
			place_ID				: mySesh.allPlaces[i].place_ID,
			name					  : mySesh.allPlaces[i].name,
			backgroundImage : ICON_PATH + 'button-forward.png',
			zIndex					: 10, 
			height					: 30, 
			width						: 30
		});
		// ADD ANNOTATION BUTTON EVENT LISTENER g
		// Ti.API.debug(".... [~] >>>>>>>>>>>>>>>>> :: "+ JSON.stringify(temp_place_ID) );
	 	anno_button.addEventListener('click', function(e){
	 		Ti.API.debug ( ".... [+] Clicked ANNOTATION >> " + e.source.place_ID );	
			var necessary_args = {
				_place_ID : e.source.place_ID		// pass in array index and placeID so we can hit the backend for more details
			};
			createWindowController( "placeoverview", necessary_args, 'slide_left' );
	 	}); 
		
		// CREATE AND RETURN ANNOTATION CONTAINER  	
		var annotation = myMapFactory.createAnnotation({
			id        : "poi_anno_"+mySesh.allPlaces[i].place_ID, 
			latitude  : mySesh.allPlaces[i].lat, 
			longitude : mySesh.allPlaces[i].lon,
			title     : mySesh.allPlaces[i].name,
			subtitle  : mySesh.allPlaces[i].city + " (" + mySesh.allPlaces[i].dist + " mi)",
			animate   : false,
			image     : ICON_PATH + mySesh.allPlaces[i].icon, 	// or pull icon from AWS: mySesh.AWS.base_icon_url
			rightView : anno_button
		});
		// var annotation = createMapAnnotation(, )
		temp_annotationArray.push ( annotation );		// make sure to pass current array index  
	}
	Alloy.Globals.placeAnnotations = temp_annotationArray; 
	/////////////////////// CREATE ANNOTATION FOR EACH POI IN ARRAY //////////////// 
	Alloy.Globals.wbMap.addAnnotations( temp_annotationArray );
	enableAllButtons(); 
}



// ***********  D O N O T F O R G E T T O D O T H E D A M N T H I N G **************
exports.ExtMap = ExtMap;
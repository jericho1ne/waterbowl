function ExtMap(){
  /*		DEBUG MODE!		(Adds borders to stuff)		*/
  this._delta = 0.07;
  Alloy.Globals.wbMap = '';
};

//=================================================================================
// 	Name:  		initializeMap ()
// 	Purpose:	draw default Apple map
//=================================================================================
/*
ExtMap.prototype.initializeMap = function(lat, lon) {
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
		mySesh.xsetGeoViewport(e.source.region.latitude, e.source.region.longitude);
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
	// Ti.API.debug(".... [~] centerMapOnLocation ["+ lat +" / "+ lon +"]");
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


//=========================================================================================
//	Name:			getMarks 
//	Purpose:	display marks nearby user position, or say there are none
//==========================================================================================
ExtMap.prototype.getMarks =  function ( user_lat, user_lon, sniff_type, sniff_radius, marks_shown ) {
	Ti.API.info("...[~] getMarks() [ "+user_lat+"/"+user_lon+"  ] :: sniff [type/radius/how many] : [ "+sniff_type+"/"+sniff_radius+"/"+marks_shown+" ]");
  var params = {
		lat       					: user_lat,
		lon       					: user_lon, 
		sniff_type 					: sniff_type,
		sniff_radius  			: sniff_radius,
		number_marks_shown 	: marks_shown
	};
	
	var self = this;
	this.loadMapJson(params, "http://waterbowl.net/mobile/marks-mapshow.php", function(data) {
		self.refreshMarkAnnotations(data)
	});
}

//=========================================================================
//	Name:			refreshMarkAnnotations( map )
//	Purpose:	
//=========================================================================
ExtMap.prototype.refreshMarkAnnotations = function(data) {
	Alloy.Globals.wbMap.removeAllAnnotations();
	mySesh.nearbyMarks = data;
	var marksAnnoArray = [];
	for (var i=0; i<mySesh.nearbyMarks.length; i++) {
		marksAnnoArray.push ( this.createMarkAnnotation(mySesh.nearbyMarks[i]) );	  
	}
	Alloy.Globals.wbMap.addAnnotations( marksAnnoArray );
	enableAllButtons();
}


//=====================================================================================================
//	Name:			getNearbyPoi ( user_lat, user_lon, view_lat, view_lon )
//	Purpose:	grab the top X closest places to user position OR center of map view
//=====================================================================================================
ExtMap.prototype.getNearbyPoi = function( user_lat, user_lon, view_lat, view_lon ) {
	// Ti.API.debug(" .... [~] getNearbyPoi() [ "+user_lat+"/"+user_lon+"  ], view [ "+view_lat+"/"+view_lon+" ]");
	var params = {
		lat       : user_lat,
		lon       : user_lon, 
		view_lat  : view_lat,
		view_lon  : view_lon,
		owner_ID  : mySesh.user.owner_ID
	};
	var self = this;
	this.loadMapJson(params, "http://waterbowl.net/mobile/get-places-map.php", function(data) {
		self.refreshPoiAnnotations(data)
	});
}

//=============================================================
//	Name:			createPoiAnnotation( place_data )
//	Purpose:	build Apple Maps place marker from incoming array
//	Return:		annotation object
//=============================================================
ExtMap.prototype.createPoiAnnotation = function( poi ) {
	// Ti.API.debug (".... [~] Added POI [ " +poi.place_ID + " ] to map");
	
	// ADD ANNOTATION BUTTON 
	var anno_button = Ti.UI.createButton({ 
		id			   	    : "poi_btn_"+poi.place_ID,
		place_ID				: poi.place_ID,
		name					  : poi.name,
		backgroundImage : ICON_PATH + 'button-forward.png',
		zIndex					: 10, 
		height					: 30, 
		width						: 30
	});
	// ADD ANNOTATION BUTTON EVENT LISTENER 
 	anno_button.addEventListener('click', function(e){
 		Ti.API.debug ( ".... [+] Clicked ANNOTATION >> " + e.source.place_ID );	
		var necessary_args = {
			_came_from : "map marker",
			_place_ID : e.source.place_ID		// pass in array index and placeID so we can hit the backend for more details
		};
		createWindowController( "placeoverview", necessary_args, 'slide_left' );
 	}); 
	// CREATE AND RETURN ANNOTATION CONTAINER  	
	return myMapFactory.createAnnotation({
		id        : "poi_anno_"+poi.place_ID, 
		latitude  : poi.lat, 
		longitude : poi.lon,
		title     : poi.name,
		subtitle  : poi.city + " (" + poi.dist + " mi)",
		animate   : false,
		image     : ICON_PATH + poi.icon, 	// or pull icon from AWS: mySesh.AWS.base_icon_url
		rightView : anno_button
	});
}

//=============================================================
//	Name:			createMarkAnnotation( mark )
//	Purpose:	build native maps place marker from incoming array
//	Return:		annotation object
//=============================================================
ExtMap.prototype.createMarkAnnotation = function( mark ) {
	// Ti.API.info(" annotation marker for MARK:" + JSON.stringify(mark));
	var anno_mark_button = Ti.UI.createButton({ 
		id 							: mark.ID,	 
		backgroundImage : ICON_PATH + 'button-forward.png',
		zIndex					: 100, 
		height					: 30, 
		width						: 30
	});
	anno_mark_button.addEventListener('click', function(e){
		createWindowController( "markoverview", mark, 'slide_left' );
 	});
	return myMapFactory.createAnnotation({
    id        : mark.ID, 
		latitude  : mark.mark_lat, 
		longitude : mark.mark_lon,
		title     : mark.mark_name,
		subtitle  :	mark.marking_dog_name,
		animate   : false,
		image     : ICON_PATH + 'Mark-MapMarker-4-small.png', 
		rightView : anno_mark_button
	});
}

//=========================================================================
//	Name:			refreshPoiAnnotations( data )
//	Purpose:	grab POI/locations from backend php file, order by proximity
//=========================================================================
ExtMap.prototype.refreshPoiAnnotations = function(data) {	
	/////////////////////// REMOVE ANY EXISTING ANNOTATIONS /////////////////
	Alloy.Globals.wbMap.removeAllAnnotations();
	var poiAnnoArray = [];
	mySesh.allPlaces = data;
	// Ti.API.debug( "ExtMap.prototype.refreshPoiAnnotations called :: " );
	/////////////////////// CREATE ANNOTATION FOR EACH POI IN ARRAY ///////// 
	for (var i=0; i<mySesh.allPlaces.length; i++) { 			
		poiAnnoArray.push( this.createPoiAnnotation(mySesh.allPlaces[i]) );		  
	}
	Alloy.Globals.placeAnnotations = poiAnnoArray; 
	/////////////////////// CREATE ANNOTATION FOR EACH POI IN ARRAY ///////////// 
	Alloy.Globals.wbMap.addAnnotations( poiAnnoArray );
	enableAllButtons(); 
}



// ***********  D O N O T F O R G E T T O D O T H E D A M N T H I N G **************
exports.ExtMap = ExtMap;


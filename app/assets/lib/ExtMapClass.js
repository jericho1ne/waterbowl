/*************************************************************************
						ExtMapClass.js  				
*************************************************************************/
//	Waterbowl App
//	
//	Created by Mihai Peteu Jan 2015
//	(c) 2015 waterbowl
//

//=================================================================================
// 	Name:  		ExtMap ()
// 	Purpose:	Initialize class members
//=================================================================================
function ExtMap(){
  /*		DEBUG MODE!		(Adds borders to stuff)		*/
  this._delta = 0.07;
  Alloy.Globals.wbMap = '';
};

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
ExtMap.prototype.getMarks =  function ( user_lat, user_lon, sniff_type, sniff_radius, marks_shown, callBackFn ) {
	Ti.API.info("...[~] getMarks() [ "+user_lat+"/"+user_lon+"  ] :: sniff [type/radius/how many] : [ "+sniff_type+"/"+sniff_radius+"/"+marks_shown+" ]");
  	// GET MARKS /////////////////////////////////
  	var mark_params = {
		lat       			: user_lat,
		lon       			: user_lon, 
		sniff_type 			: sniff_type,
		sniff_radius		: sniff_radius,
		number_marks_shown 	: marks_shown
	};
	var self = this;
	this.loadMapJson(mark_params, "http://waterbowl.net/mobile/marks-mapshow.php", function(data) {
		self.refreshMarkAnnotations(data);
		callBackFn();
	});

}
//=========================================================================================
//	Name:		getNearbyDogs 
//	Purpose:	
//==========================================================================================
ExtMap.prototype.getNearbyDogs = function () {
	// GET NEARBY DOGS /////////////////////////////////
	var dog_params = {
		lat       			: mySesh.geo.lat,
		lon       			: mySesh.geo.lon, 
		dog_ID 				: mySesh.dog.dog_ID,
		buddies				: mySesh.dog.buddies,
		weight_buddy		: mySesh.dog.weight_buddy,
		sniff_type			: 1, 
		sniff_radius		: mySesh.dog.sniff_radius,
		number_dogs_shown 	: 20
	};
	Ti.API.info("...[~] dogs-mapshow() [ "+ JSON.stringify(dog_params) +" ]");
  	
	var self = this;
	this.loadMapJson(dog_params, "http://waterbowl.net/mobile/dogs-mapshow.php", function(data) {
		self.refreshDogAnnotations(data)
	});
}

//=========================================================================
//	Name:			refreshDogAnnotations( map )
//	Purpose:	
//=========================================================================
ExtMap.prototype.refreshDogAnnotations = function(data) {
	Ti.API.debug("  .... [~] refreshDogAnnotations :: " + JSON.stringify(data) );
	// Alloy.Globals.wbMap.removeAllAnnotations();
	mySesh.nearbyDogs = data.payload;
	var dogsAnnoArray = [];

	for (var i=0; i<mySesh.nearbyDogs.length; i++) {
		if (mySesh.nearbyDogs[i].dog_ID!=mySesh.dog.dog_ID)
			dogsAnnoArray.push( this.createDogAnnotation(mySesh.nearbyDogs[i]) );	  
	}
	Alloy.Globals.wbMap.addAnnotations( dogsAnnoArray );
	enableAllButtons();
}

//=========================================================================
//	Name:			refreshMarkAnnotations( map )
//	Purpose:	
//=========================================================================
ExtMap.prototype.refreshMarkAnnotations = function(data) {
	mySesh.nearbyMarks = data;
	var marksAnnoArray = [];
	if (isset(data) && data.length>0) {
		for (var i=0; i<mySesh.nearbyMarks.length; i++) {
			marksAnnoArray.push ( this.createMarkAnnotation(mySesh.nearbyMarks[i]) );	  
		}
		Alloy.Globals.wbMap.addAnnotations( marksAnnoArray );
	}
	else {
		createSimpleDialog("Sorry","No dogs or marks found nearby :( ")
	}	
	enableAllButtons();
}


//=====================================================================================================
//	Name:			getNearbyPoi ( user_lat, user_lon, view_lat, view_lon )
//	Purpose:	grab the top X closest places to user position OR center of map view
//=====================================================================================================
ExtMap.prototype.getNearbyPoi = function( user_lat, user_lon, view_lat, view_lon ) {
	Ti.API.debug("  .... [~] getNearbyPoi :: [ "+user_lat+"/"+user_lon+"  ], view [ "+view_lat+"/"+view_lon+" ]");
	var params = {
		lat       : user_lat,
		lon       : user_lon, 
		view_lat  : view_lat,
		view_lon  : view_lon,
		owner_ID  : mySesh.user.owner_ID
	};
	var self = this;
	this.loadMapJson(params, "http://waterbowl.net/mobile/pois-mapshow.php", function(data) {
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
		id			   	: "poi_btn_"+poi.place_ID,
		place_ID		: poi.place_ID,
		name		  	: poi.name,
		backgroundImage : ICON_PATH + 'button-forward3.png',
		zIndex			: 10, 
		height			: 40, 
		width			: 40
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
		subtitle  : poi.city + " (" + poi.dist.toFixed(1) + " mi)",
		animate   : false,
		image     : ICON_PATH + poi.icon, 	// or pull icon from AWS: mySesh.AWS.base_icon_url
		rightView : anno_button
	});
}

//=============================================================
//	Name:		createMarkAnnotation( mark )
//	Purpose:	build native maps place marker from incoming array
//	Return:		annotation object
//=============================================================
ExtMap.prototype.createMarkAnnotation = function( mark ) {
	// Ti.API.info(" annotation marker for MARK:" + JSON.stringify(mark));
	var anno_mark_button = Ti.UI.createButton({ 
		id 				: mark.ID,	 
		backgroundImage : ICON_PATH + 'button-forward.png',
		zIndex			: 100, 
		height			: 30, 
		width			: 30
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
		image     : ICON_PATH + 'mark-mapmarker-medium.png', 
		rightView : anno_mark_button
	});
}

//=============================================================
//	Name:		createDogAnnotation( mark )
//	Purpose:	
//	Return:		annotation object
//=============================================================
ExtMap.prototype.createDogAnnotation = function( dog ) {
	// 0=stranger, 1=me, 2=buddy
	var icon_stranger 	= ICON_PATH + 'dog1-mapmarker-stranger.png';
	var icon_me 		= ICON_PATH + 'dog1-mapmarker-me.png';
	var icon_buddy 		= ICON_PATH + 'dog1-mapmarker-buddy.png';

	Ti.API.info( "  .... [~] createDogAnnotation :: dog icons :: " + icon_stranger + ' / ' + icon_me );

	var anno_dog_button = Ti.UI.createButton({ 
		dog_id 			: dog.dog_ID,	 
		backgroundImage : ICON_PATH + 'button-forward.png',
		zIndex			: 110, 
		height			: 30, 
		width			: 30
	});
	anno_dog_button.addEventListener('click', function(e){
		var params = { 
			dog_ID 	: dog.dog_ID
		};
		createWindowController( "profile", params, 'slide_left' );
 	});
	return myMapFactory.createAnnotation({
    	id        	: dog.dog_ID, 
		latitude  	: dog.last_lat, 
		longitude 	: dog.last_lon,
		title     	: dog.dog_name,
		subtitle  	: dog.dist + " miles away",
		animate   	: false,
		image     	: icon_stranger, 
		zIndex		: 999,
		rightView 	: anno_dog_button
	});
}

//=========================================================================
//	Name:			refreshPoiAnnotations( data )
//	Purpose:	grab POI/locations from backend php file, order by proximity
//=========================================================================
ExtMap.prototype.refreshPoiAnnotations = function(data) {	
	//Ti.API.debug( "ExtMap.prototype.refreshPoiAnnotations called :: " + JSON.stringify(data.payload) );
	/////////////////////// REMOVE ANY EXISTING ANNOTATIONS /////////////////
	Alloy.Globals.wbMap.removeAllAnnotations();
	var poiAnnoArray = [];
	mySesh.allPlaces = data.payload;
	//var localPlaces = data.payload;
	/////////////////////// CREATE ANNOTATION FOR EACH POI IN ARRAY ///////// 
	if (data.payload!="" && data.payload!=null) {
		for (var i=0; i<data.payload.length; i++) { 			
			poiAnnoArray.push( this.createPoiAnnotation(data.payload[i]) );		  
		}
		Alloy.Globals.placeAnnotations = poiAnnoArray; 
		/////////////////////// CREATE ANNOTATION FOR EACH POI IN ARRAY ///////////// 
		Alloy.Globals.wbMap.addAnnotations( poiAnnoArray );
	}
	enableAllButtons(); 
}



// ***********  D O N O T F O R G E T T O D O T H E D A M N T H I N G **************
exports.ExtMap = ExtMap;


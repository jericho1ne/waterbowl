/*************************************************************************
						SessionClass.js  				
*************************************************************************/
//	Waterbowl App	
//	
//	Created by Mihai Peteu Oct 2014
//	(c) 2015 waterbowl
//

//================================================================================
//	Name: 		Session
//	Purpose: 	Initialize all global vars and arrays
//================================================================================
function Session(){
	this.saveDogLocationInterval = '';
	this.funcCallCount = 0;
	this.actionOngoing = false;
	this.flag = {
		nearbyDogsChanged 	: false,
		placeListChanged	: false,
		poiEstimatesChanged	: false,
		poiRemarksChanged	: false
	};
	this.device = { 
		screenwidth  : Ti.Platform.displayCaps.platformWidth,
		screenheight : Ti.Platform.displayCaps.platformHeight
	};
	this.stringMaxes = {
		poiRemarkMaxLength  : 1600,
		markTitleMaxLength	: 30,
		markRemarkMaxLength : 256,
		dogNameMax			: 30
	};
	this.temp_image = null,
	this.user = {
		owner_ID 		: null,
		name     		: null,
		email			: null,
		state			: null,
		dev_msg_read 	: 0,
		daily_msg_read 	: 0
	};
	this.dog = {
		dog_ID 					: null,
		name					: null,
		sex						: null,
		age						: null,
		birthdate 				: null,
		breed1					: null,
		breed2					: null,
		weight					: null,
		marks_made				: null,
		buddies					: [],
		weight_buddy			: 0.01,		// SNIFF SETTINGS
		sniff_radius			: 0.20,		// SNIFF SETTINGS 	TODO:  fill this in upon login from backend
		location_timer			: 60000,	// milliseconds
		current_place_ID  		: null,
		current_place_name 		: null,
		current_place_geo_radius: null,
		current_place_lat 		: null,
		current_place_lon 		: null,
		last_checkin_timestamp 	: null
	};
	this.geo = {
		accuracy_threshold 	: 0.00621,		// 10m / 30ft (in miles)
		lat					: null, 
		lon					: null,
		last_lat			: null,
		last_lon			: null,
		last_action_lat		: null,
		last_action_lon		: null,
		view_lat      		: null,
		view_lon     		: null,
		geo_trigger_count	: 0,
		geo_trigger_success	: 0,
		refresh_interval 	: 1,
		last_acquired		: 0           // minutes since start of UNIX epoch
	};
	this.windowStack			= [];
	this.allPlaces		     	= [];				// top N places that are near user's location (n=20, 30, etc)
	this.nearbyMarks		    = [];
	this.nearbyDogs				= [];
	this.geofencePlaces    		= []; 			// contains up to N places that are within the geofence
	this.currentPlaceInfo 		= [];
	this.currentPlaceFeatures 	= [];
	this.checkinInProgress	 	= null;
	this.server = {
		AWS: {
			access_key_id		: "AKIAILLMVRRDGDBDZ5XQ",
			secret_access		: "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",
			url_base 			: "http://s3.amazonaws.com",
			// bucket_icon		: "wb-icon",
			bucket_place		: "wb-place",
			bucket_profile		: "wb-profile",
			bucket_uitext		: "wb-ui-text"
		},
		wb_path: {
			// REMOTE PATHS
			url_local		: "http://localhost/wb.net/mobile/",
			url_dev			: "http://www.waterbowl.net/dev/",
			url_live 		: "http://www.waterbowl.net/mobile/",
			bucket_poi		: "images/wb-poi/",
			bucket_mark		: "images/wb-mark/",
			bucket_profile	: "images/wb-profile/",
			bucket_uitext	: "images/wb-ui-text/",
		
			// LOCAL PATHS ARE INSIDE ALLOY.JS
			// TODO: Figure out why these aren't working. Hardcoded in alloy.js for now...
			// icon						: "images/icons/",
			// missing				: "images/missing/"
		}
	};
};
//================================================================================
//		Name:			loadMapJson
//		Purpose:	standardize HTTP requests
//================================================================================
Session.prototype.loadMapJson = function ( params, url, callbackFunction ) {
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

Session.prototype.saveLocationTimer = function() {
	var timer_ms = this.dog.location_timer;
	var self = this;

	this.saveDogLocationInterval = setInterval( function(){ self.saveDogLocation(0,0,"auto report ("+timer_ms+" ms)")}, timer_ms );
}

//=================================================================================
//	Name:		saveDogLocation()
//	Purpose:	track dog location intermittently
//=================================================================================
Session.prototype.saveDogLocation = function(poi_ID, action, client_function) {
	var params = {
		owner_ID			: Number(mySesh.user.owner_ID),
		lat  				: this.geo.lat,
		lon  				: this.geo.lon,
		dog_name			: this.dog.name,
		current_place_ID 	: poi_ID,
		current_place_action: action,
		dog_ID 				: this.dog.dog_ID,
		client_action		: client_function
	}
	Ti.API.info ( "  .... [~] saveDogLocation / Call :: " + JSON.stringify(params) );
	loadJson(params, "http://www.waterbowl.net/mobile/update-dog-location.php", this.saveDogResponse);	
	//$.mem_usage.text = Titanium.Platform.availableMemory.toFixed(2)+" MB available";
} 


//=================================================================================
//	Name:		saveDogResponse()
//	Purpose:	track dog location intermittently
//=================================================================================
Session.prototype.saveDogResponse = function (dog_save_location_data) {
	Ti.API.info ( "  .... [~] saveDogLocation / Response :: " + JSON.stringify(dog_save_location_data) );
}

//================================================================================
//	Name: 		clearSavedDogInfo
//	Purpose: 	Initialize dog array
//================================================================================
Session.prototype.clearSavedDogInfo = function (){
	var key;
	for (key in this.dog) {
    	this.dog[key] = null;
    }
    this.dog.buddies = [];
	this.dog.weight_buddy 	= 0.01;
	this.dog.sniff_radius 	= 0.20;
	this.dog.location_timer = 60000;
    //Ti.API.debug("  >>>> dog info :: "+JSON.stringify(this.dog) );
}

//================================================================================
//	Name: 		clearSavedUserInfo
//	Purpose: 	Initialize user array
//================================================================================
Session.prototype.clearSavedUserInfo = function (){
	var key;
	for (key in this.user) {
    	this.user[key] = null;
    }
    //Ti.API.debug("  >>>> user info :: "+JSON.stringify(this.user) );
}

//================================================================================
//	Name: 	xsetGeoLatLon
//================================================================================
Session.prototype.xsetGeoLatLon = function (lat, lon, how_long_ago){
	this.geo.last_lat 	= this.geo.lat;
	this.geo.last_lon   = this.geo.lon;
	this.geo.lat 		= lat;
	this.geo.lon 		= lon;
	this.geo.last_acquired = how_long_ago;
	//Ti.API.debug("  .... [@] Session.prototype.xsetGeoLatLon (curr) :: "+lat+' / '+lon+' / '+how_long_ago);
	//Ti.API.debug("  .... [@] Session.prototype.xsetGeoLatLon (last) :: "+this.geo.last_lat+' / '+this.geo.last_lon+' / '+how_long_ago);
}
//================================================================================
//		Name:				xsetGeoViewport
//================================================================================
Session.prototype.xsetGeoViewport = function (region_lat, region_lon){
	this.geo.view_lat = region_lat;
	this.geo.view_lon = region_lon;
	// Ti.API.debug( '  .... [~] Session.prototype.regionChanged (xsetGeoViewport) ::'+this.geo.view_lat+"/"+this.geo.view_lon+"******");
}
//================================================================================
//		Name:				getUrl
//		Purpose:		pick between remote-live, remote-dev, and local HTTP requests
//================================================================================
Session.prototype.getUrl = function(server_type) {
	if (server_type=="dev")
		return this.server.wb_path.url_dev;
	else if (server_type=="local")
		return this.server.wb_path.url_local;
	else
		return this.server.wb_path.url_live;
}

exports.Session = Session;

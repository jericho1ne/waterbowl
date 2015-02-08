function Session(){
	this.actionOngoing = false;
	this.device = { 
		screenwidth  : Ti.Platform.displayCaps.platformWidth,
		screenheight : Ti.Platform.displayCaps.platformHeight
	};
	this.stringMaxes = {
		poiRemarkMaxLength  : 1600,
		markTitleMaxLength	: 30,
		markRemarkMaxLength : 256,
		dogNameMax					: 30
	};
	this.user = {
		owner_ID 	: null,
		name     	: null,
		email			:	null,
		password		: null
	};
	this.dog = {
		dog_ID 			: null,
		name				:	null,
		sex					: null,
		age					:	null,
		birthdate 	:	null,
		weight			: null,
		marks_made	: null,
		current_place_ID  				: null,
		current_place_name 				: null,
		current_place_geo_radius	: null,
		current_place_lat 				: null,
		current_place_lon 				: null,
		last_checkin_timestamp 		: null
	};
	this.geo = {
		lat						: null, 
		lon						: null,
		view_lat      : null,
		view_lon      : null,
		geo_trigger_count : 0,
		geo_trigger_success: 0,
		refresh_interval 	: 1,
		last_acquired	: 0           // minutes since start of UNIX epoch
	};
	this.windowStack				= [];
	// this.local_icon_path		:	"images/icons",
	// this.local_banner_path : "images/places",
	this.allPlaces		      =  [];				// top N places that are near user's location (n=20, 30, etc)
	this.nearbyMarks		    =  [];
	this.geofencePoi      =  []; 				// contains up to N places that are within the geofence
	// this.placeAnnotations  =  [];
	this.currentPlace = { 
		ID				: null,
		name			: null,
		mobile_bg	: null,
		address		: null,
		city			: null,
		zip 			: null,
		distance  : null
	};
	this.checkinInProgress	 = null;
	this.server = {
		AWS: {
			access_key_id		: "AKIAILLMVRRDGDBDZ5XQ",
			secret_access		: "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",
			url_base 				: "http://s3.amazonaws.com",
			// bucket_icon		: "wb-icon",
			bucket_place		: "wb-place",
			bucket_profile	: "wb-profile",
			bucket_uitext		: "wb-ui-text"
		},
		wb_path: {
			// REMOTE PATHS
			url_local				: "http://localhost/wb.net/mobile/",
			url_dev					: "http://www.waterbowl.net/dev/",
			url_live 				: "http://www.waterbowl.net/mobile/",
			bucket_poi			: "images/wb-poi/",
			bucket_mark			: "images/wb-mark/",
			bucket_profile	: "images/wb-profile/",
			bucket_uitext		: "images/wb-ui-text/",
		
			// LOCAL PATHS ARE INSIDE ALLOY.JS
			// TODO: Figure out why these aren't working. Hardcoded in alloy.js for now...
			// icon						: "images/icons/",
			// missing				: "images/missing/"
		}
	};
};

//================================================================================
//		Name:				setGeoLatLon
//================================================================================
Session.prototype.setGeoLatLon = function (lat, lon, how_long_ago){
	// Ti.API.debug("  .... [~] Session.prototypesetGeoLatLon :: "+lat+' / '+lon+' / '+how_long_ago)
	this.geo.lat = lat;
	this.geo.lon = lon;
	this.geo.last_acquired = how_long_ago;
}
//================================================================================
//		Name:				setGeoViewport
//================================================================================
Session.prototype.setGeoViewport = function (region_lat, region_lon){
	this.geo.view_lat = region_lat;
	this.geo.view_lon = region_lon;
	// Ti.API.debug( '  .... [~] Session.prototype.regionChanged (setGeoViewport) ::'+this.geo.view_lat+"/"+this.geo.view_lon+"******");
}
//================================================================================
//		Name:				getUrl
//		Purpose:		pick between remote-live, remote-dev, and local HTTP requests
//================================================================================
Session.prototype.getUrl = function(server_type) {
	if 			(server_type=="dev")
		return this.server.wb_path.url_dev;
	else if (server_type=="local")
		return this.server.wb_path.url_local;
	else
		return this.server.wb_path.url_live;
}

exports.Session = Session;

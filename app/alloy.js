//
// 	alloy.js gets executed before index.js or any other view controllers
// 	You have access to all functionality on the `Alloy` namespace.
//
// 	Initializion / Global Variable + Function creation
// 		make things accessible globally by attaching them to the Alloy.Globals object
//=================================================================================

//=========================================================================================
//	Name:			checkinAtPlace (place_ID, owner_ID, estimate)
//	Purpose:	check into a specific place, providing user ID, dog ID, lat, lon to backend
//						TODO:			Allow selection between multiple dogs
//=========================================================================================
function checkinAtPlace (place_ID) {
	/* create an HTTP client object  */ 
	var checkin_http_obj = Ti.Network.createHTTPClient();
	/* create an HTTP client object  */ 
	checkin_http_obj.open("POST", "http://waterbowl.net/mobile/place-checkin.php");
	
	var params = {
		place_ID	: place_ID,
		owner_ID	: mySession.user.owner_ID,
		dog_ID		: mySession.dog.dog_ID,
		lat				:	mySession.lat,
		lon				:	mySession.lon
	};
	
	Ti.API.info ( "... sending stuff to place-checkin.php " + JSON.stringify(params) );
	var response = 0;
	/* send a request to the HTTP client object; multipart/form-data is the default content-type header */
	checkin_http_obj.send(params);
	/* response data received */
	checkin_http_obj.onload = function() {
		var json = this.responseText;
		if (json != "") {
			Ti.API.info("* checkin JSON " + json);
			var response = JSON.parse(json);
			if (response.status == 1) { 		// success
				Ti.API.log("  [>]  Checkin added successfully ");
	
				/*		 save Place ID, checkin state, and timestamp in mySession  	*/
				mySession.checkedIn 				= true;										// checkin now officially complete
				mySession.checkin_place_ID 	= place_ID;
				mySession.lastCheckIn 			= new Date().getTime();
				mySession.checkinInProgress = false;				// remove "in progress" state	
				// in case we want to bounce user straight to place overview
				// var placeoverview = Alloy.createController("placeoverview", { _place_ID: place_ID }).getView();	
				// placeoverview.open();
			}
			alert( response.message ); 
		}
		else
				alert("No data received from server"); 
	};
	return response;
}

//=============================================================================
//	Name:			getPlaces ( lat, lon )
//	Purpose:	get all places in db, plus a smaller subset of nearby ones
//=============================================================================
function getPlaces( user_lat, user_lon ) {
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

		var jsonPlaces = [];
		if (jsonResponse != "") {
			var jsonPlaces = JSON.parse(jsonResponse);	
			Ti.API.info( "* raw jsonResponse from getPlaces: " + JSON.stringify(jsonPlaces) );	
		};
		return jsonPlaces;
	};
}
//=============================================================================
//	Name:			getDistance ( lat1, lon1, lat2, lon2 )
//=============================================================================
function getDistance(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  d = d * 0.621371;
  return Number ( d.toFixed(2) );		// typecast just in case toFixed returns a string...
}

//=============================================================================
//	Name:			deg2rad ( deg )
//=============================================================================
function deg2rad(deg) {
  return deg * (Math.PI/180)
}

//=============================================================================
//	Name:			addMenubar ( parent_object )
//	Purpose:	dynamically build menu bar and attach it to the parent object,
//						which is already positioned in the parent Window
//=============================================================================
function addMenubar( parent_object ) {
	/*  menubar	 - make sure height is exactly the same as #menubar in app.tss	*/
	var menubar 		= Ti.UI.createView( {id: "menubar", width: "100%", layout: "horizontal", top: 0, height: 40, backgroundColor: "#58c6d5", 
											opacity: 1, zIndex: 99, shadowColor: '#222222', shadowRadius: 2, shadowOffset: {x:2, y:2} });
											
	var menuLeft 		= Ti.UI.createView( {id: "menuLeft", width: 44, borderWidth: 0, borderColor: "red" });
	var menuCenter 	= Ti.UI.createView( {id: "wbLogoMenubar", width: "75%", borderWidth: 0, borderColor: "gray", textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER });
	var menuRight 	= Ti.UI.createView( {id: "menuRight", width: 44, right: 0, layout: "horizontal", width: Ti.UI.SIZE });
	
	var backBtn 		= Ti.UI.createButton( {id: "backBtn",	 color: '#ffffff', backgroundColor: '', zIndex: 10,
	font:{ fontFamily: 'Sosa-Regular', fontSize: 24 }, title: 'T', left: 4, width: Ti.UI.SIZE, top: 2, opacity: 1,  height: 34, width: 34, borderRadius: 12 } );
	
	var	infoBtn 		= Ti.UI.createButton( {id: "infoBtn",  color: '#ffffff', backgroundColor: '',	zIndex: 10,
	font:{ fontFamily: 'Sosa-Regular', fontSize: 24 }, title: 'i', right: 2, width: Ti.UI.SIZE, top: 2, opacity: 1, height: 34, width: 34, borderRadius: 12 });
	
	var	refreshBtn	= Ti.UI.createButton( {id: "refreshBtn", color: '#ffffff', backgroundColor: '',	zIndex: 10,
	font:{ fontFamily: 'Sosa-Regular', fontSize: 24 }, title: "y", right: 2, width: Ti.UI.SIZE, top: 2, opacity: 1,  height: 34, width: 34, borderRadius: 12 });
	
	var	settingsBtn	= Ti.UI.createButton( {id: "settingsBtn", color: '#ffffff', backgroundColor: '',zIndex: 10,
	font:{ fontFamily: 'Sosa-Regular', fontSize: 24 }, title: "Y", right: 4, width: Ti.UI.SIZE, top: 2, opacity: 1,  height: 34, width: 34, borderRadius: 12 });
	
	var wbLogoMenubar = Ti.UI.createLabel( 
			{ id: "#wbLogoMenubar", width: Ti.UI.SIZE, text: 'waterbowl', top: 6, height: "auto", 
			color: "#ffffff", font:{ fontFamily: 'Raleway-Bold', fontSize: 20 } } );
	
	//menuLeft.add(backBtn);
	menuCenter.add(wbLogoMenubar);	
	
	/*  don't want users going back to login screen once authenticated */
	if (Ti.App.Properties.current_window != "map") {	
		Ti.API.info(" >> Ti.App.Properties.current_window :"+ Ti.App.Properties.current_window);
		menuLeft.add(backBtn);
	}
	
	/*
	if (Ti.App.Properties.current_window == "map") {	
		menuRight.add(refreshBtn);
		refreshBtn.addEventListener('click', function() {			// REFRESH button
			Ti.API.info("...[+] Refresh button clicked on map");
			// createPlaceList();
		});
	}
	else if (Ti.App.Properties.current_window == "placeoverview") {	
		refreshBtn.addEventListener('click', function() {			// REFRESH button
			Ti.API.info("...[+] Refresh button clicked on placeoverview");
			// TODO: add refresh function for Place Activity feed
		});
	}*/
	// menuRight.add(infoBtn);
	//menuRight.add(refreshBtn);
	menuRight.add(settingsBtn);

	/* Add items to container divs, then add menubar to Window object */
	menubar.add(menuLeft);	
	menubar.add(menuCenter); 
	menubar.add(menuRight);
	parent_object.add( menubar );
	
	backBtn.addEventListener('click', closeWin);
	infoBtn.addEventListener('click', mainInfoBtn);
	settingsBtn.addEventListener('click', showSettings);
	//refreshBtn.addEventListener('click', createPlaceList);
}

//==================================================================================================
//	Name:			uploadFromCamera ( )
//	Purpose:	return file handle of camera photo
//==================================================================================================
function uploadFromCamera() {
	Titanium.Media.showCamera({
		success:function(event) {
			Ti.API.debug( ' * Selected media type was: '+event.mediaType );			// which media type was returned from camera
			if(event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
				uploadToAWS( event.media );	
				// var fileInfoArray = uploadToAWS( event.media );		
				//return fileInfoArray;		
			} else {
				alert("Hmm, this seems to be a "+event.mediaType +". Please select a photo instead.  =) ");
			}
		},
		cancel:function() {
			Ti.API.info( "Camera snapshot canceled by user");
		},
		error:function(error) {
			// called when there's an error
			var a = Titanium.UI.createAlertDialog( {title:'Camera'} );
			if (error.code == Titanium.Media.NO_CAMERA) {
				a.setMessage('Please run this test on device');
			} else {
				a.setMessage('Unexpected error: ' + error.code);
			}
			a.show();
		},
		saveToPhotoGallery:	true,		// necessary??
		allowEditing:	true,		 			// allowEditing and mediaTypes are iOS-only settings
		mediaTypes:[Ti.Media.MEDIA_TYPE_VIDEO,Ti.Media.MEDIA_TYPE_PHOTO]
	});
	return null;
}

//==================================================================================================
//	Name:			uploadFromGallery ( )
//	Purpose:	return file handle of selected media
//==================================================================================================
function uploadFromGallery( photoPlaceholder ) {	
	if (Titanium.Network.online) {
		Titanium.Media.openPhotoGallery({
			success:function(event) {			// success callback fired after media retrieved from gallery 
				Ti.API.info ( event.media );		
				var fileInfoArray = uploadToAWS( event.media, photoPlaceholder );
				//Ti.API.info( fileInfoArray["filename"] + " // " + fileInfoArray["filehandle"] );
				return fileInfoArray;
			}
		});
	} else {
		alert ('Internet connection unavailable');
	}
	return null;
}

//==================================================================================================
//	Name:			uploadToAWS ( event_media, photoPlaceholder )
//	Purpose:	upload files/photos from camera or gallery, display selected image
//					  - event_media is event.media type, placeholder is a Ti ImageView object
//==================================================================================================
function uploadToAWS( event_media, photoPlaceholder ) {  	
	/* 	move file from photo gallery to Ti app data directory first */
	var filename 		= Ti.Platform.createUUID()+".jpg";
	/* 	save recently uploaded photo as current profile photo; update profile photo ImageView image=... */
	mySession.dog.photo = filename;
	//photoPlaceholder.image = filehandle;
	
	/* Returns a File object representing the file identified by the path arguments  */
	var filehandle 	= Ti.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, filename);
	filehandle.write( event_media );
	Ti.API.info ( " >> uploadToAWS: " + filename + " || "  + filehandle);
	Alloy.Globals.AWS.S3.putObject( {
      'BucketName' : 'wb-profile',
     	'ObjectName' : filename, 
      'File' : filehandle,
      'Expires' : 30000
	 	 	}, 
	 	 	function(data, response) {		// success
      	Ti.API.info(" >>> uploadToAWS success  >> " + JSON.stringify(data) );
      	
 	 	}, function(message, error) {		// 
      Ti.API.info( " >>> uploadToAWS message  >> " + message );
      Ti.API.info( " >>> uploadToAWS error >> " + JSON.stringify(error));
 	 	}
 	);
 	return { "filename": filename, "filehandle": filehandle };
}


//=================================================================================
// 	Name:  		addToAppWindowStack ( window_name, win_name )
// 	Purpose:	keep breadcrumb of user navigation + close windows in correct order
//=================================================================================
function addToAppWindowStack( winObject, win_name )  {
	mySession.windowStack.push( winObject );
	Ti.App.Properties.current_window = win_name;
	
	//Ti.API.info ( "windowStack:"+ JSON.stringify( mySession.windowStack ) + " || array size: " + ( mySession.windowStack.length ) );
	Ti.API.info ( "// #[ "+ win_name + " ]=============================================||== Window # " + ( mySession.windowStack.length ) +" =========//" );
}


//=================================================================================
// 	Name:  		closeWin()
// 	Purpose:	generic cleanup function usually attached to Back Button
//=================================================================================
function openWindow( win_name ) {
	var new_window = Alloy.createController( win_name ).getView();
	new_window.open();
	// 	TODO:	create list of properties that need to get passed into new window
	//  TODO: prepare window open animation
	mySession.previousWindow = mySession.currentWindow;
	mySession.currentWindow = win_name;
}

//=================================================================================
// 	Name:  		closeWin()
// 	Purpose:	generic cleanup function usually attached to Back Button
//=================================================================================
function closeWin() {
	var currentWindow = mySession.windowStack.pop();
		
	Ti.API.info( "[x] closing window ["+ Ti.App.Properties.current_window +"]");
	
	currentWindow.close( { 
		top: 0, opacity: 0.01, duration: 200, 
		curve : Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT
	} );
	currentWindow = null;
}

//=================================================================================
// 	Name:  		mainInfoBtn()
// 	Purpose:	generic help function attached to Info Button
//=================================================================================
function mainInfoBtn() {
	Ti.API.info( "[+] info button clicked");
}

//=================================================================================
// 	Name:  		showSettings()
// 	Purpose:	generic settings for user / app
//=================================================================================
function showSettings() {
	Ti.API.info( "[+] settings button clicked");
}

//==========================================================================================
// 	Name:  		zeroPad ( number, width )
// 	Purpose:	add leading zeroes to incoming int; useful for creating same-length filenames
//==========================================================================================
function zeroPad( number, width )  {
  width -= number.toString().length;
  if ( width > 0 ){
    return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
  }
  return number + ""; 			// always return a string
}


//============================================================================================
/*
Ti.API.info('Ti.Platform.displayCaps.density: ' + Ti.Platform.displayCaps.density);
Ti.API.info('Ti.Platform.displayCaps.dpi: ' + Ti.Platform.displayCaps.dpi);
Ti.API.info('Ti.Platform.displayCaps.platformHeight: ' + Ti.Platform.displayCaps.platformHeight);
Ti.API.info('Ti.Platform.displayCaps.platformWidth: ' + Ti.Platform.displayCaps.platformWidth);
if(Ti.Platform.osname === 'android'){
  Ti.API.info('Ti.Platform.displayCaps.xdpi: ' + Ti.Platform.displayCaps.xdpi);
  Ti.API.info('Ti.Platform.displayCaps.ydpi: ' + Ti.Platform.displayCaps.ydpi);
  Ti.API.info('Ti.Platform.displayCaps.logicalDensityFactor: ' + Ti.Platform.displayCaps.logicalDensityFactor);
};
*/

// NextSpace Culver City
// 34.024 / -118.394

var mySession = {
	user : {
		owner_ID: 	null,
		username: 	null,
		password: 	null
	},
	dog : {
		dog_ID : 	null,
		name:		 	null,
		sex: 			null,
		age:			null,
		weight:		null,
		photo:		null
	},
	windowStack		: [],
	currentWindow			: "index", 
	previousWindow		: null,
	local_icon_path		:	"images/icons",
	local_banner_path : "images/places",
	placeArray				: [],				// top N places that are near user's location (n=20, 30, etc)
	placesInGeofence	: [], 			// contains up to N places that are within the geofence
	lat: null, 
	lon: null, 
	currentPlace: { 
		ID				: null,
		name			: null,
		mobile_bg	: null,
		address		: null,
		city			: null,
		zip 			: null,
		distance  : null
	},
	proximity					: 0.26,
	checkinInProgress	: null,
	checkedIn					: null,						// where we are actually checked in (as opposed to currentPlace, which is simply nearby)
	checkin_place_ID	: null, 						// TODO:  consider moving these fields to the local dog arrays 
	lastCheckIn				: null,
	checkinTimestamp	: null,
	AWS : {
		access_key_id		: "AKIAILLMVRRDGDBDZ5XQ",
		secret_access		: "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",
		url_base 				: "http://s3.amazonaws.com",
		// bucket_icon			: "wb-icon",
		bucket_place		: "wb-place",
		bucket_profile	: "wb-profile",
		bucket_uitext		: "wb-ui-text"
	}
};

var winStack = [];			// create window stack array to keep track of what's open
Ti.App.Properties.windowStack = winStack;
Ti.App.Properties.current_window = null;

/*  include amazon AWS module + authorize w/ credentials   */
Alloy.Globals.AWS = require('ti.aws');						
Alloy.Globals.AWS.authorize( mySession.AWS.access_key_id, mySession.AWS.secret_access );

Alloy.Globals.placeList_clicks 	= 0;
Alloy.Globals.placeList_ID 			= null;
/*----------------------------------------------------------------------
 *  	GEOLOCATION
 *-----------------------------------------------------------------------*/
// minimum change in location (meters) which triggers the 'location' eventListener
// 	*** note:	10m triggers too often ***
Ti.Geolocation.distanceFilter = 20;
Ti.Geolocation.purpose = "Receive User Location";
Ti.API.info( "Running on an [" + Ti.Platform.osname + "] device");

// load the map module
if (Ti.Platform.osname === "iphone")	
 	Alloy.Globals.Map = require('ti.map');
else if (Ti.Platform.osname == "android")
	Alloy.Globals.Map = Ti.Map;
	
Alloy.Globals.wbMapView 	= "";
Alloy.Globals.annotations = [];

var longPress;


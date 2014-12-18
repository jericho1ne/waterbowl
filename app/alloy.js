//
// 	alloy.js gets executed before index.js or any other view controllers
// 	You have access to all functionality on the `Alloy` namespace.
//
//	Things made accessible globally by attaching them to the Alloy.Globals object
//
// 	Initializion / Global Variable + Function creation
// 		
//=================================================================================

// CLASS OBJECTS
var geoUtil = function () {
  //=============================================================================
  //	Name:			getDistance ( lat1, lon1, lat2, lon2 )
  //=============================================================================
  function getDistance(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    d = d * 0.621371;
    var formattedDistance = Number( d.toFixed(2) );   // typecast just in case toFixed returns a string...
    Ti.API.debug(".... ..... [#] getDistance - (Pos1) (Pos2) dist: "+
              "("+lat1+","+lon1+") "+
              "("+lat2+","+lon2+") "+
              formattedDistance+"] ");
              
    return formattedDistance;		
  }
  
  //=============================================================================
  //	Name:			deg2rad ( deg )
  //=============================================================================
  function deg2rad(deg) {
    return deg * (Math.PI/180);
  }

};

// var myGeo = new geoUtil();
// Ti.API.debug( "myGeo.deg2rad(90): " + myGeo.deg2rad(90) ); 


//*************************************************************************************************
//===============================================
//	Name:    isset ( value )
//	Desc:	   fail silently if value is undefined
//  Return:   the actual value or null
//===============================================
function isset( value ) {
	if ( typeof value !== 'undefined' )
		return value;
	else
		return null;
}

//=====================================================
//	Name:		 	createSimpleDialog ( title, msg )
//	Purpose:	nice clean way to do alert modals
//=====================================================
function createSimpleDialog (title, msg) {
	var simple_dialog = Titanium.UI.createAlertDialog({
		title		:	title,
		message	: msg 
	});
	simple_dialog.show();
}	

//===========================================================================================
//	Name:		 	createWindowController ( win_name, args, animation[optional])
//	Purpose:	to be the bestest window manager ever
//===========================================================================================
function createWindowController ( win_name, args, animation ) {
	MYSESSION.previousWindow = MYSESSION.currentWindow;
	MYSESSION.currentWindow = win_name;

	var winObject = Alloy.createController(win_name, args).getView();
	addToAppWindowStack( winObject, win_name );
	
	var animStyle = [];
	if (animation=="flip") {
		animStyle = { transition: Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT };
	} 
	else if (animation=="slide_up") {
		winObject.top = 800;
 		winObject.opacity = 0.1;
		animStyle = {	top: 0, opacity: 1,	duration: 320, 
		  curve : Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT }; 
	}
	else if (animation=="slide_left") {
	 	winObject.left = 600;
	 	winObject.top = 0;
 		winObject.opacity = 0.1;
		animStyle = {	left: 0, opacity: 1,	duration: 320, 
		  curve : Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT }; 
	}	
	else if (animation=="slide_right") {
	 	winObject.left = -600;
	  winObject.top = 0;
 		winObject.opacity = 0.1;
		animStyle = {	left: 0, opacity: 1,	duration: 320, 
		  curve : Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT }; 
	}
	else {
		/* default == quick fade-in animation   */
		winObject.opacity = 0.05;
		animStyle = {	opacity:1, duration:280, 
		  curve : Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT };
	}	
	// attach menubar to each new Window controller
	addMenubar(winObject);
	winObject.open( animStyle );
	// status checks
	Ti.API.info( " >>> User Array: "+ JSON.stringify( MYSESSION.user ) );
	Ti.API.info( " >>> Dog Array: "+ JSON.stringify( MYSESSION.dog ) );
	Ti.API.info( " >>> Checkin Place ID : "+ MYSESSION.dog.current_place_ID );
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
  return deg * (Math.PI/180);
}


//======================================================================
//	Name:			getArrayIndexById( array, value )
//	Purpose:	figure out array item's number index via associative key
//======================================================================
function getArrayIndexById( array, value ) {
  for (var i=0; i<array.length; i++) {
    if (array[i].id == value) {
      return i;
	 }
  }
  return -1;
}

//=============================================================================
//	Name:			addMenubar ( parent_object )
//	Purpose:	dynamically build menu bar and attach it to the parent object,
//						which is already positioned in the parent Window
//=============================================================================
function addMenubar( parent_object ) {
	/*  menubar	 - make sure height is exactly the same as #menubar in app.tss	*/
	var menubar = Ti.UI.createView( {
	  id: "menubar", width: "100%", layout: "horizontal", top: 0, height: 32, 
    backgroundColor: "#ffffff", opacity: 1, zIndex: 99 });  // bg color #58c6d5
											
	var menuLeft 		= Ti.UI.createView( {id: "menuLeft", width: 44, borderWidth: 0, borderColor: "red" });
	var menuCenter 	= Ti.UI.createView( {id: "wbLogoMenubar", width: "75%", borderWidth: 0, borderColor: "gray", textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER });
	var menuRight 	= Ti.UI.createView( {id: "menuRight", width: 44, right: 0, layout: "horizontal", width: Ti.UI.SIZE });
	
	var backBtn 		= Ti.UI.createButton( {id: "backBtn",	 color: '#58c6d5', backgroundColor: '', zIndex: 10,
	font:{ fontFamily: 'Sosa-Regular', fontSize: 27 }, title: 'T', left: 4, width: Ti.UI.SIZE, top: 0, opacity: 1,  height: 34, width: 34, borderRadius: 12 } );
	
	var	infoBtn 		= Ti.UI.createButton( {id: "infoBtn",  color: '#58c6d5', backgroundColor: '',	zIndex: 10,
	font:{ fontFamily: 'Sosa-Regular', fontSize: 27 }, title: 'i', right: 2, width: Ti.UI.SIZE, top: 0, opacity: 1, height: 34, width: 34, borderRadius: 12 });
	
	var	settingsBtn	= Ti.UI.createButton( {id: "settingsBtn", color: '#58c6d5', backgroundColor: '',zIndex: 10,
	font:{ fontFamily: 'Sosa-Regular', fontSize: 27 }, title: "Y", right: 4, width: Ti.UI.SIZE, top: 0, opacity: 1,  height: 34, width: 34, borderRadius: 12 });
	
	var wbLogoMenubar = Ti.UI.createLabel( 
			{ id: "wbLogoMenubar", width: Ti.UI.SIZE, text: 'waterbowl', top: 4, height: "auto", 
			color: "#58c6d5", font:{ fontFamily: 'Raleway-Bold', fontSize: 20 } } );
	
	//menuLeft.add(backBtn);
	menuCenter.add(wbLogoMenubar);	
	
	/*  don't want users going back to login screen once authenticated */
	if (Ti.App.Properties.current_window != "mapview") {	
		Ti.API.info(" >> Ti.App.Properties.current_window :"+ Ti.App.Properties.current_window);
		menuLeft.add(backBtn);
		backBtn.addEventListener('click', closeWindowController);
	}
	
	/* only show settings button if not currently on that window */	
	if (Ti.App.Properties.current_window!="index" && Ti.App.Properties.current_window!="settings") {	
		menuRight.add(settingsBtn);
		settingsBtn.addEventListener('click', showSettings);
	}

	// menuRight.add(infoBtn);

	/* Add items to container divs, then add menubar to Window object */
	menubar.add(menuLeft);	
	menubar.add(menuCenter); 
	menubar.add(menuRight);
	parent_object.add( menubar );
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
				createSimpleDialog( "Not a photo", "This seems to be a "+event.mediaType+". Please select a photo instead.  =) "  ); 
			}
		},
		cancel:function() {
			Ti.API.info( "Camera snapshot canceled by user");
		},
		error:function(error) {
			// called when there's an error
			var msg = 'Unexpected error: ' + error.code;
			if (error.code == Titanium.Media.NO_CAMERA) {
				msg = 'Please run this test on device';
			} 
			createSimpleDialog('Camera Error', message);
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
		createSimpleDialog('No network connection', 'Cannot upload photo');
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
	MYSESSION.dog.photo = filename;
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
	MYSESSION.windowStack.push( winObject );
	Ti.App.Properties.current_window = win_name;
	
	//Ti.API.info ( "windowStack:"+ JSON.stringify( MYSESSION.windowStack ) + " || array size: " + ( MYSESSION.windowStack.length ) );
	Ti.API.debug ( "// #[ "+ win_name + " ]=============================================||== Window # " + ( MYSESSION.windowStack.length ) +" =========//" );
}

//=================================================================================
// 	Name:  		closeWindowController()
// 	Purpose:	generic cleanup function usually attached to Back Button
//=================================================================================
function closeWindowController() {
	var currentWindow = MYSESSION.windowStack.pop();
	Ti.API.info( "[x] closing window ["+ Ti.App.Properties.current_window +"]");
	// default close window animation is SLIDE RIGHT
	currentWindow.close( { 
		opacity: 0.1, duration: 300, left: 800,                                                   
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
	createWindowController('settings','','slide_left');
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

/*----------------------------------------------------------------------
 *  	GLOBAL VARIABLES
 *-----------------------------------------------------------------------*/
// NextSpace Culver City  34.024 / -118.394
// Oberrieder 		33.971995 / -118.420496
var MYSESSION = {
	user : {
		owner_ID: 	null,
		email:		 	null,
		password: 	null
	},
	dog : {
		dog_ID : 	null,
		name:		 	null,
		sex: 			null,
		age:			null,
		weight:		null,
		photo:		null,
		current_place_ID  : null,
		current_place_name : null,
		current_place_geo_radius : null,
		current_place_lat : null,
		current_place_lon : null,
		last_checkin_timestamp : null
	},
	windowStack		: [],
	currentWindow			: "index", 
	previousWindow		: null,
	local_icon_path		:	"images/icons",
	local_banner_path : "images/places",
	allPlaces		      : [],				// top N places that are near user's location (n=20, 30, etc)
	nearbyPlaces      : [], 			// contains up to N places that are within the geofence
	placeAnnotations  : [],
	geo: {
		lat						: null, 
		lon						: null,
		view_lat      : null,
		view_lon      : null,
		last_acquired	: 0           // minutes since start of UNIX epoch
	}, 
	currentPlace: { 
		ID				: null,
		name			: null,
		mobile_bg	: null,
		address		: null,
		city			: null,
		zip 			: null,
		distance  : null
	},
	checkinInProgress	: null,
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

// TODO: get rid of this and see what happens; should no longer be in use 
var winStack = [];			// create window stack array to keep track of what's open
Ti.App.Properties.windowStack = winStack;
Ti.App.Properties.current_window = null;

/*  include amazon AWS module + authorize w/ credentials   */
Alloy.Globals.AWS = require('ti.aws');						
Alloy.Globals.AWS.authorize( MYSESSION.AWS.access_key_id, MYSESSION.AWS.secret_access );

Alloy.Globals.placeList_clicks 	= 0;
Alloy.Globals.placeList_ID 			= null;

/*----------------------------------------------------------------------
 *  	GEOLOCATION
 *-----------------------------------------------------------------------*/
// minimum change in location (meters) which triggers the 'location' eventListener
// 	*** Geolocation Threshhold trigger.  Note:	10m triggers too often ***
Ti.Geolocation.distanceFilter = 20;			// 10m=33 ft, 20m=65ft, 30m=100 ft
Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_NEAREST_TEN_METERS;		// ACCURACY_BEST doesn't work on iOS
Ti.Geolocation.purpose = "Receive User Location";
Ti.API.info( "Running on an [" + Ti.Platform.osname + "] device");

/*----------------------------------------------------------------------
 *  	LOADING MAP MODULE
 *-----------------------------------------------------------------------*/
if (Ti.Platform.osname === "iphone")	
 	Alloy.Globals.Map = require('ti.map');
else if (Ti.Platform.osname == "android")
	Alloy.Globals.Map = Ti.Map;


Alloy.Globals.annotations = [];

var longPress;

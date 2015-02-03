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
//	Name:    clearTextAreaContents ( textarea_object )
//	Desc:	   clear hint text on focus / click inside
//=====================================================
function clearTextAreaContents(textarea_object) {
	textarea_object.value = ""; 
}

//=====================================================
//	Name:    disableAllButtons(disableAllButtons)
//=====================================================
function disableAllButtons() {
	mySesh.actionOngoing = true; 
}

//=====================================================
//	Name:    disableAllButtons(disableAllButtons)
//=====================================================
function enableAllButtons() {
	mySesh.actionOngoing = false; 
}

//=====================================================
//	Name:    remoteFileExists ( url )
//	Desc:	   see if the file exists or not
//=====================================================
function remoteFileExists( url ) {
	var http = Titanium.Network.createHTTPClient();
  http.open('HEAD', url, false);
  http.send();
  return http.status!=404;
}

//==========================================================================
//	Name:    loadRemoteImage ( type, img_actual, img_placeholder )
//	Desc:	   if it exists, return actual image, otherwise placeholder
//==========================================================================
function loadRemoteImage( type, alloyObject, img_actual, img_placeholder ) {
	Ti.API.debug( "<< loadRemoteImage >>> "+ img_actual + " | " +remoteFileExists(img_actual));
	
	if( remoteFileExists(img_actual) ) {
		var c = Titanium.Network.createHTTPClient();
		c.setTimeout(3000);
		c.onload = function() {
			if(c.status == 200) {
				(type=="bg") ? alloyObject.backgroundImage = this.responseData : alloyObject.image = this.responseData;
		  	Ti.API.debug( "SUCCESS :: Attaching [ "+img_actual+" ] to headerContainer");
		  } else {
		  	(type=="bg") ? alloyObject.backgroundImage = this.img_placeholder : alloyObject.image = img_placeholder;
		  	// alloyObject.backgroundImage = img_placeholder;
		  	Ti.API.debug( "ERROR :: Could not load remote image attaching [ " +img_placeholder +' ] instead' );
		  }
		};
		c.open('GET', img_actual);
		c.send();
	}	else {
		alloyObject.backgroundImage = img_placeholder;
		Ti.API.debug( "ERROR :: Remote image doesn't exist" );
	}
}

//========================================================================
//	Name:			countCharacters (textAreaObject, charCountLabel)
//========================================================================
function countCharacters(textAreaObject, charCountLabel) {
	Ti.API.debug(textAreaObject.value.length);
	charCountLabel.text = textAreaObject.value.length+" / "+mySesh.stringMaxes.poiRemarkMaxLength;
	if( textAreaObject.value.length > mySesh.stringMaxes.poiRemarkMaxLength ) {
  	textAreaObject.value = textAreaObject.value.substr(0, mySesh.stringMaxes.poiRemarkMaxLength);
  }
}

//=====================================================
//	Name:		 	createSimpleDialog ( title, msg )
//	Purpose:	nice clean way to do alert modals
//	TODO:			move to UiFactory??
//=====================================================
function createSimpleDialog (title, msg) {
	var simple_dialog = Titanium.UI.createAlertDialog({
		title		:	title,
		message	: msg 
	});
	simple_dialog.show();
}	

//================================================================================
//		Name:			loadJson
//		Purpose:	standardize HTTP requests
//================================================================================
function loadJson ( params, url, callbackFunction ) {
	var query = Ti.Network.createHTTPClient();
	query.open("POST", url);	
	query.send( params );
	query.onload = function() {
		var jsonResponse = this.responseText;
		if (jsonResponse != "" ) {
			var data = JSON.parse( jsonResponse );
			// Ti.API.debug("....[~] UiFactory.loadJson ["+JSON.stringify(data)+"]");
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

//===========================================================================================
//	Name:		 	createWindowController ( win_name, args, animation[optional])
//	Purpose:	to be the bestest window manager ever
//===========================================================================================
function createWindowController ( win_name, args, animation ) {
	Ti.API.debug ( "//===================================== [ "+win_name+" ] ===== win # " +
		 ( mySesh.windowStack.length+1 ) +" =========//" );
	Ti.API.debug(":::::::::: createWindowController  " + 
							 "::::: ["+JSON.stringify(args) +"] ::::::::::");

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
	if (OS_ANDROID) 
    winObject.getView().open();
	else
	  winObject.open(animStyle);
	// status checks
	Ti.API.info( ".... [~] createWindowController :: User / Dog [ "+  mySesh.user.name +"/"+ mySesh.dog.name +" ]" );
	if (mySesh.dog.current_place_ID!=0)	
		Ti.API.info( " >>> Checkin Place ID : "+ mySesh.dog.current_place_ID );
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
    if (array[i].place_ID == value) {
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
	var left_width = myUiFactory._icon_small + (2 * myUiFactory._pad_left);
	var right_width_1 = myUiFactory._icon_small + myUiFactory._pad_left;
	var right_width_2 = myUiFactory._icon_small + myUiFactory._pad_left + myUiFactory._pad_right;
	var middle_width = mySesh.device.screenwidth - left_width - (2*right_width_1) - right_width_2;
	
	// DEBUG
	Ti.API.debug(" .... [i] addMenubar :: Ti.App.Properties.current_window [ "+ Ti.App.Properties.current_window +"]");
	
	// PARENT OBJECT ----------------------------------------->	
	var menubar = Ti.UI.createView( {
	  id: "menubar", width: "100%", layout: "horizontal", 
	  top: 0, 
	  height: myUiFactory._icon_small + (2 * myUiFactory._pad_top),
   	// backgroundColor: "#58c6d5", 
    opacity: 0.94, zIndex: 99 
   }); 
				
	// CONTAINER VIEWS --------------------------------------->					
	var menuLeft = Ti.UI.createView( {
		width: left_width,
		//borderWidth: 1, borderColor: "red" 
	});
	var menuCenter 	= Ti.UI.createView( {
		width: middle_width, 
		layout: "horizontal",
		//borderWidth: 1, borderColor: "gray", 
		textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER 
	});
	var menuRight0 	= Ti.UI.createView( {
		//borderWidth:1, borderColor: "black",
		width	: right_width_1
	});
	var menuRight1 	= Ti.UI.createView( {
		//borderWidth: 1, borderColor: "black",
		width: right_width_1
	});
	var menuRight2 	= Ti.UI.createView( {
		//borderWidth: 1, borderColor: "blue",
		width: right_width_2	
	});
	
	// BUTTONS ---------------------------------------------->
	var blankBtn 		= Ti.UI.createButton( {	 
		left: myUiFactory._pad_left,
		top: myUiFactory._pad_top,
		width: myUiFactory._icon_small,
		height: myUiFactory._icon_small,
	} );
	
	var backBtn 		= Ti.UI.createButton( {
		id: "backBtn",	 
		left: myUiFactory._pad_left,
		top: myUiFactory._pad_top,
		width: myUiFactory._icon_small,
		height: myUiFactory._icon_small,
		backgroundImage : "images/icons/" +'mainnav-back.png',
		zIndex	: 100
	} );
	
	var	helpBtn 		= Ti.UI.createButton( {
		id: "helpBtn",
		left: myUiFactory._pad_left,
		top: myUiFactory._pad_top,
		width: myUiFactory._icon_small,
		height: myUiFactory._icon_small,
		backgroundImage : "images/icons/" +'button-info-small.png',  
		zIndex: 100
	});
	
	var	settingsBtn	= Ti.UI.createButton( {
		id: "settingsBtn", 
		left: myUiFactory._pad_left,
		top: myUiFactory._pad_top,
		width: myUiFactory._icon_small,
		height: myUiFactory._icon_small,
		backgroundImage : "images/icons/" +'mainnav-settings.png',
		zIndex: 100,
		opacity: 1
	});
	// TITLE BAR ------------------------------------>
	/* var wbLogoMenubar = Ti.UI.createLabel( 
			{ id: "wbLogoMenubar", width: Ti.UI.SIZE, text: 'waterbowl', top: 4, height: "auto", 
			color: "#ffffff", font:{ fontFamily: 'Raleway-Bold', fontSize: 20 } } );
	menuCenter.add(wbLogoMenubar);	  */
		
	// ADD BACK BUTTON ONLY IF NOT ON MAPVIEW
	if (Ti.App.Properties.current_window != "mapview") {
		menuLeft.add(backBtn);
		backBtn.addEventListener('click', closeWindowController);
	}
	
	// ADD ALL 3 RIGHT BUTTONS IF ON MAPVIEW
	if (Ti.App.Properties.current_window == "mapview") {
		// Only create profile button here
		var img_actual  = PROFILE_PATH + 'dog-'+mySesh.dog.dog_ID+'-iconmed.jpg';
		var img_missing = MISSING_PATH + 'dog-0-iconmed.jpg';
		var profileBtn 		= Ti.UI.createButton( {
			id			: "profileBtn",	 
			left		: myUiFactory._pad_left,
			top			: myUiFactory._pad_top,
			width		: myUiFactory._icon_small,
			height	: myUiFactory._icon_small,
			backgroundImage : img_actual,
			borderWidth		: 2,
			borderColor		: myUiFactory._color_dkpink,
			borderRadius 	: myUiFactory._icon_small/2,
			zIndex	: 100
		} );
		// PIPE DOG ICON THROUGH PRELOADER
		// loadRemoteImage("bg", profileBtn, img_actual, img_missing);
	
		menuRight1.add(profileBtn);
		profileBtn.addEventListener('click', showProfile);
		//menuRight1.add(settingsBtn);
		//settingsBtn.addEventListener('click', showSettings);
		menuRight2.add(helpBtn);
		helpBtn.addEventListener('click', showHelp);
	}	else {
		var last_window_index = mySesh.windowStack.length - 1;
		var help_img = HELP_PATH + "help-" + mySesh.windowStack[last_window_index].id +".jpg";
		//Ti.API.info( ".... [+] Help Button clicked for [ "+mySesh.windowStack[last_window_index].id+" ]");
		if(mySesh.windowStack[last_window_index].id!="help" && Ti.Filesystem.getFile('.', help_img).exists() ) {
			menuRight2.add(helpBtn);
			helpBtn.addEventListener('click', showHelp);
		}
	}
	
	/* Add items to container divs, then add menubar to Window object */
	menubar.add(menuLeft);	
	menubar.add(menuCenter); 
	menubar.add(menuRight0);
	menubar.add(menuRight1);
	menubar.add(menuRight2);
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
	mySesh.dog.photo = filename;
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
	mySesh.windowStack.push( winObject );
	Ti.App.Properties.current_window = win_name;
	//Ti.API.info ( "windowStack:"+ JSON.stringify( mySesh.windowStack ) + " || array size: " + ( mySesh.windowStack.length ) );
}

//=================================================================================
// 	Name:  		closeWindowController()
// 	Purpose:	generic cleanup function usually attached to Back Button
//=================================================================================
function closeWindowController() {
	var currentWindow = mySesh.windowStack.pop();
	Ti.API.info( "[x] closing window ["+ Ti.App.Properties.current_window +"]");
	// default close window animation is SLIDE RIGHT
	currentWindow.close( { 
		opacity: 0.1, duration: 300, left: 800,                                                   
		curve : Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT
	} );
	currentWindow = null;
}

//=============================================================
// 	Name:  		showHelp()
// 	Purpose:	content-specific help function 
//=============================================================
function showHelp() {
	var last_window_index = mySesh.windowStack.length - 1;
	Ti.API.info( ".... [+] Help Button clicked for [ "+mySesh.windowStack[last_window_index].id+" ]");
	var args = { current_window : mySesh.windowStack[last_window_index].id };
	createWindowController('help', args, 'slide_left');
}

//======================================================================
// 	Name:  		showSettings()
// 	Purpose:	generic settings for user / app
//======================================================================
function showSettings() {
	Ti.API.info( "[+] settings button clicked");
	createWindowController('settings','','slide_left');
}

//=================================================================================
// 	Name:  		showProfile()
// 	Purpose:	dog profile view/edit window
//=================================================================================
function showProfile() {
	Ti.API.info( "[+] Profile button clicked");
	var args = { dog_ID : mySesh.dog.dog_ID };
	createWindowController('profile', args,'slide_left');
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
//Ti.API.info('Ti.Platform.displayCaps.density: ' + Ti.Platform.displayCaps.density);
//Ti.API.info('Ti.Platform.displayCaps.dpi: ' + Ti.Platform.displayCaps.dpi);
//Ti.API.info('Ti.Platform.displayCaps.platformHeight: ' + Ti.Platform.displayCaps.platformHeight);
//Ti.API.info('Ti.Platform.displayCaps.platformWidth: ' + Ti.Platform.displayCaps.platformWidth);
// alert('Ti.Platform.displayCaps.platformWidth: ' + Ti.Platform.displayCaps.platformWidth);

/*
if(Ti.Platform.osname === 'android'){
  Ti.API.info('Ti.Platform.displayCaps.xdpi: ' + Ti.Platform.displayCaps.xdpi);
  Ti.API.info('Ti.Platform.displayCaps.ydpi: ' + Ti.Platform.displayCaps.ydpi);
  Ti.API.info('Ti.Platform.displayCaps.logicalDensityFactor: ' + Ti.Platform.displayCaps.logicalDensityFactor);
};
*/

/*----------------------------------------------------------------------
 *  	Instantiate UiFactory
 *-----------------------------------------------------------------------*/
var UiFactoryClass = require('lib/UiFactoryClass');
var myUiFactory = new UiFactoryClass.UiFactory();


/*----------------------------------------------------------------------
 *  	Instantiate ExtendedMap
 *-----------------------------------------------------------------------*/
var ExtendedMapClass = require('lib/ExtendedMapClass');
var myExtendedMap = new ExtendedMapClass.ExtendedMap();

/*----------------------------------------------------------------------
 *  	Instantiate Session class (contains all the app globals)
 *-----------------------------------------------------------------------*/
// include session class library
var SessionClass 	= require('lib/SessionClass');
var mySesh = new SessionClass.Session();

/*	
			DEV vs LIVE vs LOCAL
			options: dev, live, local 			 	 
																					*/
var SERVER_URL 		= mySesh.getUrl("live");
var ICON_PATH 	 	= "images/icons/";
var MISSING_PATH	= "images/missing/";
var HELP_PATH			= "images/help/";

var POI_PATH 			= SERVER_URL + mySesh.server.wb_path.bucket_poi;
var MARK_PATH			= SERVER_URL + mySesh.server.wb_path.bucket_mark;
var PROFILE_PATH 	= SERVER_URL + mySesh.server.wb_path.bucket_profile;
/*----------------------------------------------------------------------
 *  	GLOBAL VARIABLES
 *-----------------------------------------------------------------------*/
// NextSpace Culver City  34.024 / -118.394
// Oberrieder 		33.971995 / -118.420496

// TODO: get rid of this and see what happens; should no longer be in use 
var winStack = [];			// create window stack array to keep track of what's open
Ti.App.Properties.windowStack = winStack;
Ti.App.Properties.current_window = null;

/*  include amazon AWS module + authorize w/ credentials   */
// Alloy.Globals.AWS = require('ti.aws');						
// Alloy.Globals.AWS.authorize( mySesh.AWS.access_key_id, mySesh.AWS.secret_access );

Alloy.Globals.placeList_clicks 	= 0;
Alloy.Globals.placeList_ID 			= null;
Alloy.Globals.placeAnnotations = [];

/*----------------------------------------------------------------------
 *  	GEOLOCATION
 *-----------------------------------------------------------------------*/
// minimum change in location (meters) which triggers the 'location' eventListener
// 	*** Geolocation Threshhold trigger.  Note:	10m triggers too often ***
Ti.Geolocation.distanceFilter = 20;			// 10m=33 ft, 20m=65ft, 30m=100 ft
Ti.Geolocation.accuracy 			= Ti.Geolocation.ACCURACY_NEAREST_TEN_METERS;		// ACCURACY_BEST doesn't work on iOS
Ti.Geolocation.purpose 				= "Receive User Location";
Ti.API.info( "Running on an [" + Ti.Platform.osname + "] device");

// TODO: is this still used by mapview.js??

//Alloy.Globals.wbMap 	= "";


// var longPress;
'use strict';

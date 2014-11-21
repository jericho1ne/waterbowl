//
// 	alloy.js gets executed before index.js or any other view controllers
// 	You have access to all functionality on the `Alloy` namespace.
//
// 	Initializion / Global Variable + Function creation
// 		make things accessible globally by attaching them to the Alloy.Globals object
//=================================================================================

function addMenubar( parent_object ) {
	/*  menubar	 - make sure height is exactly the same as #menubar in app.tss	*/
	var menubar 		= Ti.UI.createView( {id: "menubar", width: "100%", layout: "horizontal", top: 0, height: 44, backgroundColor: "#58c6d5", 
											opacity: 1, zIndex: 99, shadowColor: '#222222', shadowRadius: 2, shadowOffset: {x:2, y:2} });
											
	var menuLeft 		= Ti.UI.createView( {id: "menuLeft", width: "15%", borderWidth: 0, borderColor: "red" });
	var menuCenter 	= Ti.UI.createView( {id: "wbLogoMenubar", width: "60%", borderWidth: 0, borderColor: "gray", textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER });
	var menuRight 	= Ti.UI.createView( {id: "menuRight", right: 0, layout: "horizontal", width: Ti.UI.SIZE, borderWidth: 0, borderColor: "red" });
	
	var backBtn 		= Ti.UI.createButton( {id: "backBtn",	 color: '#fff', backgroundColor: '#ec3c95',	textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER, zIndex: 10,
	font:{ fontFamily: 'Raleway-Bold', fontSize: 14 }, borderWidth: 0, borderColor: "yellow", title: '<<', left: 4, width: Ti.UI.SIZE, top: 4, opacity: 1,  height: 34, width: 34, borderRadius: 4 } );
	var	infoBtn 		= Ti.UI.createButton( {id: "infoBtn",  color: '#fff', backgroundColor: '#ec3c95',	textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER, zIndex: 10,
	font:{ fontFamily: 'Raleway-Bold', fontSize: 14 }, borderWidth: 0, borderColor: "ff0000", title: '(i)', right: 2, width: Ti.UI.SIZE, top: 4, opacity: 1, height: 34, width: 34, borderRadius: 4 });
	var	refreshBtn	= Ti.UI.createButton( {id: "refreshBtn", color: '#fff', backgroundColor: '#ec3c95',	textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER, zIndex: 10,
	font:{ fontFamily: 'Raleway-Bold', fontSize: 14 },  borderWidth: 0, borderColor: "ff0000", title: "%", right: 2, width: Ti.UI.SIZE, top: 4, opacity: 1,  height: 34, width: 34, borderRadius: 4 });
	var	settingsBtn	= Ti.UI.createButton( {id: "settingsBtn", color: '#fff', backgroundColor: '#ec3c95',	textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER, zIndex: 10,
	font:{ fontFamily: 'Raleway-Bold', fontSize: 14 },  borderWidth: 0, borderColor: "ff0000", title: "|=|", left: 4, right: 4, width: Ti.UI.SIZE, top: 4, opacity: 1,  height: 34, width: 34, borderRadius: 4 });
	
	var wbLogoMenubar = Ti.UI.createLabel( 
			{ id: "#wbLogoMenubar", width: Ti.UI.SIZE, text: 'waterbowl', top: 8, height: "auto", 
			color: "#ffffff", font:{ fontFamily: 'Raleway', fontSize: 20 } } );
	
	
	menuLeft.add(backBtn);
	menuCenter.add(wbLogoMenubar);	
	menuRight.add(infoBtn);
	//menuRight.add(refreshBtn);
	menuRight.add(settingsBtn);
	
	menubar.add(menuLeft);	
	menubar.add(menuCenter); 
	menubar.add(menuRight);
	
	parent_object.add( menubar );
	
	backBtn.addEventListener('click', closeWin);
	infoBtn.addEventListener('click', mainInfoBtn);
	settingsBtn.addEventListener('click', showSettings);
	//refreshBtn.addEventListener('click', createPlaceList);

}

/*
function sleep(callback, ms) {
	setTimeout(function() {
		callback();
	}, ms);
} */


//==================================================================================================
//	Name:			uploadFromCamera ( )
//	Purpose:	return file handle of camera photo
//==================================================================================================
function uploadFromCamera() {
	Titanium.Media.showCamera({
		success:function(event) {
			Ti.API.debug( ' * Selected media type was: '+event.mediaType );			// which media type was returned from camera
			if(event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
				var fileInfoArray = uploadToAWS( event.media );		
				return fileInfoArray;		
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
	session.user.dog_photo = filename;
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
	session.windowStack.push( winObject );
	Ti.App.Properties.current_window = win_name;
	
	//Ti.API.info ( "windowStack:"+ JSON.stringify( session.windowStack ) + " || array size: " + ( session.windowStack.length ) );
	Ti.API.info ( "window name:"+ win_name + " || current Windows array size: " + ( session.windowStack.length ) );
}

//=================================================================================
// 	Name:  		closeWin()
// 	Purpose:	generic cleanup function usually attached to Back Button
//=================================================================================
function closeWin() {
	var currentWindow = session.windowStack.pop();
		
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
Ti.API.info('Ti.Platform.displayCaps.density: ' + Ti.Platform.displayCaps.density);
Ti.API.info('Ti.Platform.displayCaps.dpi: ' + Ti.Platform.displayCaps.dpi);
Ti.API.info('Ti.Platform.displayCaps.platformHeight: ' + Ti.Platform.displayCaps.platformHeight);
Ti.API.info('Ti.Platform.displayCaps.platformWidth: ' + Ti.Platform.displayCaps.platformWidth);
if(Ti.Platform.osname === 'android'){
  Ti.API.info('Ti.Platform.displayCaps.xdpi: ' + Ti.Platform.displayCaps.xdpi);
  Ti.API.info('Ti.Platform.displayCaps.ydpi: ' + Ti.Platform.displayCaps.ydpi);
  Ti.API.info('Ti.Platform.displayCaps.logicalDensityFactor: ' + Ti.Platform.displayCaps.logicalDensityFactor);
};


// Bucharest
//var lat = 44.4275;		
//var lon = 26.125;			

// NextSpace Culver City
// 34.024 / -118.394

var session = {
	user : {
		owner_ID: 	null,
		username: 	null,
		password: 	null,
		dog_id: 		null,
		dog_name:		null,
		dog_photo:	null
	},
	windowStack		: [],
	currentWindow	: "index", 
	lastWindow		: null,
	local_icon_path		:	"images/icons",
	local_banner_path : "images/places",
	placeArray		: [],
	// lat: 34.014,  lon: -118.375,		/* 	centered on West LA	 		*/
	// lat: 34.024,  lon: -118.394,			/*	 centered on Nextspace 	*/
	lat: null, lon: null, 
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
	checkedIn					: 1,								// where we are actually checked in (as opposed to currentPlace, which is simply nearby)
	checkin_place_ID	: 1, 
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

/*  saved credentialsand app status in local storage  */
/*
Ti.App.Properties.setString('user', 'email@this.com');
Ti.App.Properties.setString('pass', 'passwod');
*/


var winStack = [];			// create window stack array to keep track of what's open
Ti.App.Properties.windowStack = winStack;
Ti.App.Properties.current_window = null;

/*  include amazon AWS module + authorize w/ credentials   */
Alloy.Globals.AWS = require('ti.aws');						
Alloy.Globals.AWS.authorize( session.AWS.access_key_id, session.AWS.secret_access );

Alloy.Globals.place_list_clicks = 0;
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




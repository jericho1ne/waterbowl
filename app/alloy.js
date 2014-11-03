//
// 	alloy.js gets executed before index.js or any other view controllers
// 	You have access to all functionality on the `Alloy` namespace.
//
// Initializion / Global Variable + Function creation
// 	make things accessible globally by attaching them to the Alloy.Globals object
//=================================================================================

//=================================================================================
// 	Name:  		zeroPad ( number, width )
// 	Purpose:		add leading zeroes to incoming int
//=================================================================================
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

var sessionVars = {
	owner_ID: null,
	username: null,
	password: null,
	currentWindow: "index", 
	lastWindow: null,
	// lat: 34.014,  lon: -118.375,		/* centered on West LA */
	lat: 34.024,  lon: -118.394,		/* centered on Nextspace */
	currentPlace: { 
		ID: 1,
		name: null,
		bg_img: null,
		city: null
	},
	checkinInProgress: null,
	checkedIn: 1,
	lastCheckIn: null,
	checkinTimestamp: null,
	AWS : {
		access_key_id: "AKIAILLMVRRDGDBDZ5XQ",
		secret_access: "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",
		base_url: "http://s3.amazonaws.com/wb-profiles/"
	}
};

Ti.App.Properties.setString('user', 'jericho1ne@yahoo.com');
Ti.App.Properties.setString('pass', 'mihai1');

Alloy.Globals.AWS = require('ti.aws');						// include amazon AWS module + credentials
Alloy.Globals.AWS.authorize( sessionVars.AWS.access_key_id, sessionVars.AWS.secret_access);

/*----------------------------------------------------------------------
 *  	GEOLOCATION
 *-----------------------------------------------------------------------*/
	// minimum change in location (meters) which triggers the 'location' eventListener
	// 	*** note:	10m triggers too often ***
	Ti.Geolocation.distanceFilter = 20;
	Ti.Geolocation.purpose = "Receive User Location";


// Globally define the map to be drawn 
//		(enables future redraws when user postion changes)
Ti.API.info( "Running on an [" + Ti.Platform.osname + "] device");

// load the map module
if (Ti.Platform.osname === "iphone")	
 	Alloy.Globals.Map = require('ti.map');
else if (Ti.Platform.osname == "android")
	Alloy.Globals.Map = Ti.Map;
	
//Alloy.Globals.wbMapView = Alloy.Globals.Map.createView( {mapType:Map.NORMAL_TYPE} );
  
// Globally define place data - manipulated from multiple places
// Ti.App.placeData = new Array();	  ?? necessary ??

var longPress;


// Alloy.Globals.someGlobalFunction = function(){};
/*
var localDogs = Alloy.Collections.dogs;

var dog = Alloy.createModel('dogs', { 
   dog_ID: 		'1',
   dog_name: 	'Odie Won Kenobi',
   owner_ID: 	'1',
   photo: 		'01-odiewon.jpg',
   birth_year:	'1976',
   breed:		'Master Jedi'
});

Ti.API.log("created a dog model containing:" );
Ti.API.log( JSON.stringify( dog ) );
*/	
// add dog to localDogs collection, persist it to the DB
// dogs.add( dog );
// OdieWon.save();


//==================================================================================================
//	Name:			uploadFromCamera ( )
//	Purpose:	return file handle of camera photo
//==================================================================================================
function uploadFromCamera() {
	Titanium.Media.showCamera({
		success:function(event) {
			Ti.API.debug('Our type was: '+event.mediaType);			// which media type was returned from camera
			if(event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
				var fileInfoArray = uploadToAWS( event.media );		
				return fileInfoArray;		
			} else {
				alert("Please select a photo instad.  Not a "+event.mediaType +".  =) ");
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
	Ti.API.info( fileInfoArray["filename"] + " // " + fileInfoArray["filehandle"] );
	return null;
}

//==================================================================================================
//	Name:			uploadFromGallery ( )
//	Purpose:	return file handle of selected media
//==================================================================================================
function uploadFromGallery() {	
	if (Titanium.Network.online) {
		Titanium.Media.openPhotoGallery({
			success:function(event) {			// success callback fired after media retrieved from gallery 
				Ti.API.info ( event.media );		
				var fileInfoArray = uploadToAWS( event.media );
				//Ti.API.info( fileInfoArray["filename"] + " // " + fileInfoArray["filehandle"] );
				return fileInfoArray;
			}
		});
	}
	else {
		alert ('Internet connection unavailable');
	}
	return null;
}

//==================================================================================================
//	Name:			uploadToAWS ( event_media )
//	Purpose:	upload files/photos from camera or gallery
//==================================================================================================
function uploadToAWS( event_media ) {  	 // event_media is event.media type
	// move file from photo gallery to Ti app data directory first
	var filename 		= Ti.Platform.createUUID()+".jpg";
	// Returns a File object representing the file identified by the path arguments
	var filehandle 	= Ti.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, filename);
	filehandle.write( event_media );
	Ti.API.info ( filename + " || "  + filehandle);
	Alloy.Globals.AWS.S3.putObject( {
      'BucketName' : 'wb-profiles',
     	'ObjectName' : filename, 
      'File' : filehandle,
      'Expires' : 30000
	 	 	}, function(data, response) {
      Ti.API.info(JSON.stringify(data));
 	 	}, function(message, error) {
      Ti.API.error(message);
      Ti.API.info(JSON.stringify(error));
 	 	}
 	);
 	return { "filename": filename, "filehandle": filehandle };
}


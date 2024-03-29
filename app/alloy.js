/*************************************************************************
						alloy.js  				
*************************************************************************/
//	Waterbowl App	
//	
//	Created by Mihai Peteu Oct 2014	
//	(c) 2015 waterbowl
//

//=======================================================================
//	Name: 		arraysEqual(arr1, arr2)
//	Desc: 		compare contents of two place array by their poi ID
//  Return: 	true / false
//=======================================================================
function arraysEqual(arr1, arr2) {
	if(arr1.length !== arr2.length)
		return false;
	for(var i = arr1.length; i--;) {
		Ti.API.debug( "  .... >> arraysEqual >> arr1[i] : "+arr1[i].id );
		Ti.API.debug( "  .... >> arraysEqual >> arr2[i] : "+arr2[i].id );
		if(arr1[i].id  !== arr2[i].id )
			return false;
	}
	return true;
}

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

function removeAllChildren(obj) {
	var c = obj.children.slice(0);
	for (var i = 0; i < c.length; ++i) {
		obj.remove(c[i]);
	}
}

function  isValidZip ( zipcode ) {
	return /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zipcode);
}

//=====================================================
//	Name:    clearTextAreaContents ( textarea_object )
//	Desc:	   clear hint text on focus / click inside
//=====================================================
function clearTextAreaContents(textarea_object, default_text) {
	if(textarea_object.value == default_text)
		textarea_object.value = ""; 
}

//=====================================================
//	Name:    disableAllButtons(timeout)
// 	@param timeout - X ms = block for fixed time, 
//					 0 = block until manual removal
//=====================================================
function disableAllButtons(timeout) {
	mySesh.actionOngoing = true;
	// if timeout
	if (timeout != 0) {
		// default to a shorter timeouts
		if (timeout == "") timeout = 1000;
		setTimeout(enableAllButtons, timeout);
	}
}

//=====================================================
//	Name:    enableAllButtons()
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

//================================================================================
//	Name: wbLogin
//	Purpose: check credentials against backend
//================================================================================
function wbLogin(email, password) {
	//alert(email+"/"+password);
	var loginRequest = '';
	// >> XHR REQUEST
	var loginRequest = Ti.Network.createHTTPClient( {
		// SUCCESS:  On data load
		onload: function(e) {
			Ti.API.log(" >> JSON raw response :: " + this.responseText);
			var response = JSON.parse(this.responseText);	
			Ti.API.loge(" >> JSON parsed :: " + response);
			// Ti.API.debug(this.responseText);
			// TODO:  should probably put this into a separate function
			if (response.status == 1) {
				var dog_ID = response.dog.dog_ID;
				
				// save credentials locally 
				Ti.App.Properties.setString('email', email);
				Ti.App.Properties.setString('password', password);
				// save the rest to mySesh global array
				mySesh.user.email 		 = email;
				mySesh.user.owner_ID 		= response.human.owner_ID;
				mySesh.user.name 			= response.human.owner_name;
				mySesh.user.daily_msg_read	= response.human.daily_msg_read;
				mySesh.user.dev_msg_read	= response.human.dev_msg_read;

				// USER HAS VALID ACCOUNT BUT NO DOG PROFILE	//////////////////////////////////////////////////////
				if(dog_ID=="" || dog_ID==null) {
					var modal_title = "Please complete your Dog's profile before proceeding"; 
					var optns = {
						options : ['OK'],
						selectedIndex : 0,
						title : modal_title
					};
					var gotoRegPage2 = Ti.UI.createOptionDialog(optns);
					gotoRegPage2.show();
					gotoRegPage2.addEventListener('click', function(e_dialog) {
						if (e_dialog.index == 0) {  // user clicked OK
							
							closeWindowController();
							createWindowController("register2","","slide_left");
						} else {
							// TODO: figure out if cancel case is necessary
						 } 
					});
				}
				// USER HAS VALID ACCOUNT + VALID DOG PROFILE  //////////////////////////////////////////////////////
				else {
					mySesh.dog.dog_ID  	 	= response.dog.dog_ID;
					mySesh.dog.sex		 	= response.dog.sex;
					mySesh.dog.breed	 	= response.dog.breed;
					mySesh.dog.age		 	= response.dog.age;
					mySesh.dog.birthdate 	=	response.dog.birthdate;
					mySesh.dog.weight	 	= response.dog.weight;
					mySesh.dog.marks_made 	= parseInt(response.dog.marks_made);
					mySesh.dog.name	 		= response.dog.dog_name;
					mySesh.dog.current_place_ID 		= response.dog.current_place_ID;
					mySesh.dog.current_place_geo_radius = response.dog.geofence_radius;
					mySesh.dog.current_place_name 		= response.dog.current_place_name;
					mySesh.dog.current_place_lat		= response.dog.current_place_lat;
					mySesh.dog.current_place_lon		= response.dog.current_place_lon;
					// GRAB ALL DOG RELATE INFO
					/* mySesh.dog.current_place_ID        = response.dog.current_place_ID;
					if (response.place!=null) {
					  mySesh.dog.current_place_name    = response.place.name;
					  mySesh.dog.current_place_lat     = response.place.lat;
					  mySesh.dog.current_place_lon     = response.place.lon;
					  mySesh.dog.current_place_geofence_radius = response.place.geofence_radius;
					}
					mySesh.dog.last_checkin_timestamp  = response.dog.last_checkin_timestamp;
				
					*/
					// TAKE USER TO MAP
					if(mySesh.user.dev_msg_read==1) {
						createWindowController( "mapview", "", "slide_left" ); 	
					} else {
						createWindowController( "message", "", "slide_left" );
					}
				}
			} else {
				// pass on error message from backend 
				createSimpleDialog('Login Error', response.message);
			}
		},
		//  ERROR:  No data received from XHRequest
		onerror: function(e) {
			Ti.API.debug(e.error);
			createSimpleDialog('Unable to login', e.error);
		},
		timeout: 1200 /* in milliseconds */
	} );
	// << XHR REQUEST
	loginRequest.open("POST", SERVER_URL+"login.php");
	var params = {
		email : email,
		pass  : password
	};
	loginRequest.send(params);
	Ti.API.debug ( "SENDING >> "+JSON.stringify(params) );
}

//==========================================================================
//	Name:    loadRemoteImage ( type, alloyObject, img_actual, img_placeholder )
//	Desc:	   if it exists, return actual image, otherwise placeholder
//==========================================================================
function loadRemoteImage( type, alloyObject, img_actual, img_placeholder ) {
	// Ti.API.debug( "    << loadRemoteImage >\>> "+ img_actual + " [ " +remoteFileExists(img_actual) + " ]");
	if( remoteFileExists(img_actual) ) {
		var c = Titanium.Network.createHTTPClient();
		c.setTimeout(3000);
		c.onload = function() {
			if(c.status == 200) {
				(type=="bg") ? alloyObject.backgroundImage = this.responseData : alloyObject.image = this.responseData;
			//Ti.API.debug( "     SUCCESS :: Attached [ "+img_actual+" ] ");
		  } else {
			(type=="bg") ? alloyObject.backgroundImage = this.img_placeholder : alloyObject.image = img_placeholder;
			// alloyObject.backgroundImage = img_placeholder;
			//Ti.API.debug( "     ERROR :: Could not load remote image attaching [ " +img_placeholder +' ] instead' );
		  }
		};
		c.open('GET', img_actual);
		c.send();
	}	else {
		alloyObject.backgroundImage = img_placeholder;
		// Ti.API.debug( "ERROR :: Remote image doesn't exist" );
	}
}

//========================================================================
//	Name:			countCharacters (textAreaObject, charCountLabel)
//========================================================================
function countCharacters(textAreaObject, charCountLabel) {
	// Ti.API.debug(textAreaObject.value.length);
	charCountLabel.text = textAreaObject.value.length+" / "+mySesh.stringMaxes.poiRemarkMaxLength;
	if( textAreaObject.value.length > mySesh.stringMaxes.poiRemarkMaxLength ) {
	textAreaObject.value = textAreaObject.value.substr(0, mySesh.stringMaxes.poiRemarkMaxLength);
  }
}

//=====================================================
//	Name:		createSimpleDialog ( title, msg )
//	Purpose:	nice clean way to do alert modals
//	TODO:		move to UiFactory??
//=====================================================
function createSimpleDialog (title, msg) {
	var simple_dialog = Titanium.UI.createAlertDialog({
		title		:	title,
		message	: msg 
	});
	simple_dialog.show();
}	

//==============================================================
//	Name:		createFancyDialog ( title, options, callbackFunction )
//	Purpose:	even cleaner modal
//==============================================================
function createFancyDialog (title, options, callbackFunction) {
// modal popup 
	var modal_title = 'Log out?';
	var optns = {
		options : ['Yes', 'Cancel'],
		cancel        : 1,
		selectedIndex : 0,
		destructive   : 1,
		title : modal_title
	};
	var logoutDialog = Ti.UI.createOptionDialog(optns);
	logoutDialog.show();
	logoutDialog.addEventListener('click', callbackFunction);
}
//================================================================================
//		Name:			loadJson
//		Purpose:	standardize HTTP requests
//================================================================================
function loadJson ( params, url, callbackFunction ) {
	var query = Ti.Network.createHTTPClient();
	query.open("POST", url);	
	query.send( params );
	query.setTimeout(2000);
	disableAllButtons(mySesh.timeout.remote_load);
	query.onload = function() {
		enableAllButtons();
		var jsonResponse = this.responseText;
		if (jsonResponse != "" ) {
			var data = JSON.parse( jsonResponse );
			// Ti.API.debug("....[~] Alloy.js ["+JSON.stringify(data)+"]");
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
//	Name:		 	ucwords ( str )
//	Purpose:	equivalent of PHP's ucwords
//===========================================================================================
function ucwords(str) {
  return (str + '')
	.replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function($1) {
	  return $1.toUpperCase();
	});
}

//===========================================================================================
//	Name:		 	createWindowController ( win_name, args, animation[optional])
//	Purpose:	to be the bestest window manager ever
//===========================================================================================
function createWindowController ( win_name, args, animation ) {
	Ti.API.info ( "  ===================================== [ "+win_name+" ] === window #" +
		 ( mySesh.windowStack.length+1 ) +" =====================================" );

	// briefly lockout UI buttons so multiple windows don't pop open
	disableAllButtons(mySesh.timeout.ui_lockout);

	Ti.API.debug("  :::: createWindowController :::: args ["+JSON.stringify(args) +"] :::: user [ "+
					JSON.stringify(mySesh.user)+" ] /// [ "+
					JSON.stringify(mySesh.dog)+" ]");

	var winObject = Alloy.createController(win_name, args).getView();
	addToAppWindowStack( winObject, win_name );
	
	var animStyle = [];
	if (animation=="flip") {
		animStyle = { transition: Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT };
	} 
	else if (animation=="slide_up") {
		winObject.top = mySesh.device.screenheight;
		winObject.opacity = 0.1;
		animStyle = {	top: 0, opacity: 1,	duration: 120, 
		  curve : Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT }; 
	}
	else if (animation=="slide_left") {
		winObject.left = mySesh.device.screenwidth;
		winObject.top = 0;
		winObject.opacity = 0.1;
		animStyle = {	left: 0, opacity: 1,	duration: 120, 
			curve : Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT }; 
	}	
	else if (animation=="slide_right") {
		winObject.left = -1 * mySesh.device.screenwidth;
		winObject.top = 0;
		winObject.opacity = 0.1;
		animStyle = {	left: 0, opacity: 1, duration: 80, 
			curve : Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT }; 
	}
	else {
		/* default == quick fade-in animation   */
		winObject.opacity = 0.05;
		animStyle = {	opacity:1, duration:200, 
			curve : Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT };
	}	
	// attach menubar to each new Window controller
	addMenubar(winObject);
	if (OS_ANDROID) 
		winObject.getView().open();
	else {
		winObject.open(animStyle);

		if(win_name!="index") {
			var spinner_time = 500;
			if (win_name=="help") {
				spinner_time = 150;
			}
			// show loading spinner
			Alloy.Globals.loadingMask.show('Loading...', true);
			setTimeout(function(){
				Alloy.Globals.loadingMask.hide();
			}, spinner_time);
		}  
	}
	// status checks
	// if (mySesh.dog.current_place_ID!=0)	Ti.API.info( "  >>> checked in @ place ID #"+ mySesh.dog.current_place_ID+" <<< ");
}

//=============================================================================
//	Name:		getCurrentDate ( )
//=============================================================================
function getCurrentDate() {
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();

	if(dd<10) {
		dd='0'+dd
	} 
	if(mm<10) {
		mm='0'+mm
	} 
	return mm+'/'+dd+'/'+yyyy;
}

//=============================================================================
//	Name:			getDistance ( lat1, lon1, lat2, lon2 )
//=============================================================================
function getDistance(lat1, lon1, lat2, lon2) {
  var R_km = 6371; 							// Radius of the earth in km
  var R_mi = 3958.761;					// Radius of the earth in mi
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
	Math.sin(dLat/2) * Math.sin(dLat/2) +
	Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
	Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R_mi * c; 	// Distance in miles
  return Number ( d.toFixed(4) );		// 4 decimals, in typecast just in case toFixed returns a string...
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
	var left_width = myUi._icon_small + (2 * myUi._pad_left);
	var right_width_1 = myUi._icon_small + myUi._pad_left;
	var right_width_2 = myUi._icon_small + myUi._pad_left + myUi._pad_right;
	var middle_width = mySesh.device.screenwidth - left_width - (2*right_width_1) - right_width_2;
	
	// DEBUG
	Ti.API.debug("  .... [i] addMenubar :: Ti.App.Properties.current_window [[ "+ Ti.App.Properties.current_window +" ]]");
	
	// PARENT OBJECT ----------------------------------------->	
	var menubar = Ti.UI.createView( {
		id: "menubar", width: "100%", layout: "horizontal", 
		top: 0, 
		height: myUi._icon_small + (2 * myUi._pad_top),
	// backgroundColor: "#58c6d5", 
		opacity: 0.94, zIndex: 99 
   }); 
				
	// CONTAINER VIEWS --------------------------------------->					
	var menuLeft = Ti.UI.createView( {
		width: left_width
	});
	var menuCenter 	= Ti.UI.createView( {
		//borderWidth: 1, borderColor: "gray", 
		width: middle_width, 
		layout: "horizontal",
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
	var menuRight2 	= Ti.UI.createView( {		// on mapview, leave open for compass
		//borderWidth: 1, borderColor: "blue",
		width: right_width_2,
		zIndex: 1
	});
	
	// BUTTONS ---------------------------------------------->
	var blankBtn 		= Ti.UI.createButton( {	 
		left: myUi._pad_left,
		top: myUi._pad_top,
		width: myUi._icon_small,
		height: myUi._icon_small,
	} );
	
	var backBtn 		= Ti.UI.createButton( {
		id: "backBtn",	 
		left: myUi._pad_left,
		top: myUi._pad_top,
		width: myUi._icon_small,
		height: myUi._icon_small,
		backgroundImage : ICON_PATH +'mainnav-back.png',
		zIndex	: 100
	} );

	var fwdBtn = Ti.UI.createButton( {
		id: "fwdBtn",	 
		left: myUi._pad_left,
		top: myUi._pad_top,
		width: myUi._icon_small,
		height: myUi._icon_small,
		backgroundImage : ICON_PATH +'button-forward.png',
		zIndex	: 100
	} );
	
	var	helpBtn = Ti.UI.createButton( {
		id: "helpBtn",
		left: myUi._pad_left,
		top: myUi._pad_top,
		width: myUi._icon_small,
		height: myUi._icon_small,
		backgroundImage : ICON_PATH +'button-info.png',  
		zIndex: 100
	});
	
	var	settingsBtn	= Ti.UI.createButton( {
		id: "settingsBtn", 
		left: myUi._pad_left,
		top: myUi._pad_top,
		width: myUi._icon_small,
		height: myUi._icon_small,
		backgroundImage : ICON_PATH +'mainnav-settings.png',
		zIndex: 100,
		opacity: 1
	});
	
	var	logoutBtn	= Ti.UI.createButton( {
		id: "logoutBtn", 
		left: myUi._pad_left,
		top: myUi._pad_top,
		width: myUi._icon_small,
		height: myUi._icon_small,
		backgroundImage : ICON_PATH + "button-logout.png",
		zIndex: 100,
		opacity: 1
	});
	
	// TITLE BAR ------------------------------------>
	/* var wbLogoMenubar = Ti.UI.createLabel( 
			{ id: "wbLogoMenubar", width: Ti.UI.SIZE, text: 'waterbowl', top: 4, height: "auto", 
			color: "#ffffff", font:{ fontFamily: 'Raleway-Bold', fontSize: 20 } } );
	menuCenter.add(wbLogoMenubar);	  */
		
	// ADD BACK BUTTON ONLY IF NOT ON MAPVIEW, REGISTER PAGES, MESSAGE PAGE
	if (Ti.App.Properties.current_window != "mapview" && 
			Ti.App.Properties.current_window != "register2" &&
			Ti.App.Properties.current_window != "register3" &&
			Ti.App.Properties.current_window != "register4" && 
			Ti.App.Properties.current_window != "message") {
		menuLeft.add(backBtn);
		backBtn.addEventListener('click', closeWindowController);
	}
	// DAILY / DEV MESSAGE - FORWARD BTN ONLY
	if (Ti.App.Properties.current_window == "message") {
		menuRight2.add(fwdBtn);

		fwdBtn.addEventListener('click', function(){
			mySesh.user.dev_msg_read = 1;
			closeWindowController();
			createWindowController("mapview","","slide_left");
		});
	}
	// ADD ALL 3 RIGHT BUTTONS IF ON MAPVIEW
	if (Ti.App.Properties.current_window == "mapview") {
		////////// BUILD PROFILE BUTTON //////////////////////////////////////////////////
		var img_actual = PROFILE_PATH + 'dog-'+mySesh.dog.dog_ID+'-iconmed.jpg';
		var profileBtn = myUi.buildProfileThumb(mySesh.dog.dog_ID, img_actual, 1, myUi._icon_small);	// border=1, this means it's ME
		menuRight0.add(profileBtn);
		//////////////////////////////////////////////////////////////////////////////////
		menuRight1.add(helpBtn);
		helpBtn.addEventListener('click', showHelp);
		
		menuLeft.add(logoutBtn);
		logoutBtn.addEventListener('click', logoutUser);
	} else {
		var last_window_index = mySesh.windowStack.length - 1;
		var help_img = HELP_PATH + "help-" + mySesh.windowStack[last_window_index].id + ".jpg";
		if (mySesh.windowStack[last_window_index].id != "help" && Ti.Filesystem.getFile('.', help_img).exists() ) {
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
			Ti.API.debug( "Camera snapshot canceled by user");
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
				Ti.API.debug ( event.media );		
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
	Ti.API.debug ( " >> uploadToAWS: " + filename + " || "  + filehandle);
	Alloy.Globals.AWS.S3.putObject( {
	  'BucketName' : 'wb-profile',
		'ObjectName' : filename, 
	  'File' : filehandle,
	  'Expires' : 30000
			}, 
			function(data, response) {		// success
		Ti.API.debug(" >>> uploadToAWS success  >> " + JSON.stringify(data) );
		
		}, function(message, error) {		// 
	  Ti.API.debug( " >>> uploadToAWS message  >> " + message );
	  Ti.API.debug( " >>> uploadToAWS error >> " + JSON.stringify(error));
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
	//Ti.API.debug ( "windowStack:"+ JSON.stringify( mySesh.windowStack ) + " || array size: " + ( mySesh.windowStack.length ) );
}

//=================================================================================
// 	Name:  		closeWindowController( anim )
// 	Purpose:	generic cleanup function usually attached to Back Button
//=================================================================================
function closeWindowController( anim ) {
	var currentWindow = mySesh.windowStack.pop();
	Ti.API.info( "  [x] closing window ["+ currentWindow.id +"]");
	// default close window animation is SLIDE RIGHT
	if (anim == 0) {
		currentWindow.close();
	}
	else {
		currentWindow.close( { 
			opacity: 0.1, duration: 300, left: 800,                                                   
			curve : Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT
		} );
	}
	currentWindow = null;
}

//=============================================================
// 	Name:  		showHelp()
// 	Purpose:	content-specific help function 
//=============================================================
function showHelp() {
	var last_window_index = mySesh.windowStack.length - 1;
	//Ti.API.debug( ".... [+] Help Button clicked for [ "+mySesh.windowStack[last_window_index].id+" ]");
	var args = { current_window : mySesh.windowStack[last_window_index].id };
	createWindowController('help', args, 'slide_left');
}

//================================================================
// 	Name:  		logoutUser()
// 	Purpose:	erase local creds, take user back to login screen
//================================================================
function logoutUser() {
	// clear username/pass
	// Ti.App.Properties.setString('email', null);
	// Ti.App.Properties.setString('password', null);
	
	// TODO: user createFancyDialog() wrapper

	// modal popup 
	var modal_title = 'Log out?';
	var optns = {
		options : ['Yes', 'Cancel'],
		cancel        : 1,
		selectedIndex : 0,
		destructive   : 1,
		title : modal_title
	};

	var logoutDialog = Ti.UI.createOptionDialog(optns);
	logoutDialog.show();
	logoutDialog.addEventListener('click', function(e_dialog) {
		if (e_dialog.index == 0) {  // user clicked OK
			// stop saveDogLocation from sending location to backend
			clearInterval(mySesh.saveDogLocationInterval);
			
			// kill geolocation listener
			Titanium.Geolocation.removeEventListener('location', function(){} );
			
			// clear out backend
			var params = {
				dog_ID		: mySesh.dog.dog_ID,
				owner_ID	: mySesh.user.owner_ID
			};
			loadJson(params, "http://waterbowl.net/mobile/unload-dog-location.php", unloadDogResponse);

			// clear data on client
			mySesh.clearSavedDogInfo();
			mySesh.clearSavedUserInfo();
			
			// check user out on backend if they're currently checked in (send poiID + zero for action)
			if(mySesh.dog.current_place_ID>0) {
				mySesh.saveDogLocation(mySesh.dog.current_place_ID, 0, "logout");
			}
			
			// close map window, go back to login
			closeWindowController();
			var params = {
				action : "logout"
			};
			createWindowController('index', params, 'slide_right');
		} else {
			// CANCEL CASE
		 } 
	});
}

//======================================================================
// 	Name:  		unloadDogResponse(data)
// 	Purpose:	callback from unload-dog-location.php
//======================================================================
function unloadDogResponse(data) {
	Ti.API.debug("  .... [~] unloadDogResponse :: "+JSON.stringify(data) );
}

//======================================================================
// 	Name:  		uploadImage(imageBlob)
// 	Purpose:	
//======================================================================
function uploadImage(imageBlob, imgContainer, progressBar) {
	var bannerImage = imageBlob.imageAsResized(750, 750);
	var imgFile = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory,'snapshot.png');
	imgFile.write(bannerImage);

	var snapShotImage = Ti.UI.createImageView({ 
		height	: Ti.UI.SIZE,
		width	: Ti.UI.SIZE,
		image	: imgFile.nativePath,
		top		: 0, 
		left	: 0
	});

	// TODO pass in from outside
	imgContainer.add(snapShotImage);
	imgContainer.snapShot = snapShotImage;

	// XHR request
	var xhr = Titanium.Network.createHTTPClient();
	xhr.setRequestHeader("contentType", "multipart/form-data");				
	xhr.open('POST', 'http://waterbowl.net/mobile/upload-image.php');
	xhr.onerror = function(e) {
		Ti.API.info('IN ERROR ' + e.error);
	};
	xhr.onload = function(response) {
		if ( this.responseText != ''){
			var jsonData = JSON.parse(this.responseText);
			if (jsonData.status > 0) {
				// createSimpleDialog('Success', jsonData.message);
				Ti.API.log(" >> MARK IMAGE UPLOADED ");
				Ti.API.log(jsonData.message);
				progressBar.hide();
				enableAllButtons();
			} else {
				//cameraBtn.show();
				createSimpleDialog('Upload Error', jsonData.message);
			}	
		} else {
			//cameraBtn.show();
			alert( "No response from server" );
		}
	};
	xhr.onsendstream = function(e) {
		progressBar.value = e.progress;
	};
	xhr.send({
		'userfile'	: bannerImage,
		'type'		: 'temp',
		'type_ID'	: mySesh.dog.dog_ID
	});
}

//======================================================================
// 	Name:  		showSettings()
// 	Purpose:	generic settings for user / app
//======================================================================
function showSettings() {
	//Ti.API.debug( "[+] settings button clicked");
	createWindowController('settings','','slide_left');
}

//=================================================================================
// 	Name:  		showProfile(ID)
// 	Purpose:	dog profile view/edit window
//=================================================================================
function showProfile(ID) {
	//Ti.API.debug( "[+] Profile button clicked");
	var args = { dog_ID : ID };
	createWindowController('profile', args, 'slide_left');
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

function initializeMap(lat, lon) {
	// DRAW MAP
	Alloy.Globals.wbMap = myMapFactory.createView({
		mapType : myMapFactory.NORMAL_TYPE, // NORMAL HYBRID SATTELITE
		region : {
			latitude 		: lat,
			longitude 		: lon,
			latitudeDelta	: 0.07,
			longitudeDelta	: 0.07,
		}, 
		top 				: 0,
		animate 			: false,
		maxZoom				: 1,
		minZoom				: 2,
		regionFit	 		: true,
		userLocation 		: true,
		enableZoomControls	: true
	});
	Alloy.Globals.wbMap.addEventListener('regionChanged',function(e) {
		mySesh.xsetGeoViewport(e.source.region.latitude, e.source.region.longitude);
	});
	// Ti.API.log(".... [~] Map object built ");
}

//============================================================================================
//Ti.API.info('Ti.Platform.displayCaps.density: ' + Ti.Platform.displayCaps.density);
//Ti.API.info('Ti.Platform.displayCaps.dpi: ' + Ti.Platform.displayCaps.dpi);
//Ti.API.info('Ti.Platform.displayCaps.platformHeight: ' + Ti.Platform.displayCaps.platformHeight);
//Ti.API.info('Ti.Platform.displayCaps.platformWidth: ' + Ti.Platform.displayCaps.platformWidth);
// alert('Ti.Platform.displayCaps.platformWidth: ' + Ti.Platform.displayCaps.platformWidth);

/*----------------------------------------------------------------------
 *  	Instantiate UiFactory
 *-----------------------------------------------------------------------*/
var UiFactoryClass = require('lib/UiFactoryClass');
var myUi = new UiFactoryClass.UiFactory();

/*----------------------------------------------------------------------
 *  	Instantiate Session class (contains all the app globals)
 *-----------------------------------------------------------------------*/
// include session class library
var SessionClass 	= require('lib/SessionClass');
var mySesh = new SessionClass.Session();


/*----------------------------------------------------------------------
 *  	Instantiate ExtMap
 *-----------------------------------------------------------------------*/
//var ExtMapClass = require('lib/ExtMapClass');
var myMap = new ExtMapClass.ExtMap();
Alloy.Globals.wbMap = '';


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
var winStack = [];			// create window stack array to keep track of what's open
Ti.App.Properties.windowStack = winStack;
Ti.App.Properties.current_window = null;

/*  include amazon AWS module + authorize w/ credentials   */
// Alloy.Globals.AWS = require('ti.aws');						
// Alloy.Globals.AWS.authorize( mySesh.AWS.access_key_id, mySesh.AWS.secret_access );

Alloy.Globals.placeList_clicks 	= 0;
Alloy.Globals.placeList_ID 		= null;
Alloy.Globals.placeAnnotations	= [];
// Loading screen
Alloy.Globals.loadingMask = Alloy.createWidget("nl.fokkezb.loading");

/*----------------------------------------------------------------------
 *  	GEOLOCATION
 *-----------------------------------------------------------------------*/
// minimum change in location (meters) which triggers the 'location' eventListener
// 	*** Geolocation Threshhold trigger.  IN METRES.  Note:	10m triggers too often ***
Ti.Geolocation.distanceFilter 	= 10;			// 10m=33 ft, 20m=65ft, 30m=100 ft
Ti.Geolocation.frequency		= 1;
Ti.Geolocation.accuracy 		= Ti.Geolocation.ACCURACY_NEAREST_TEN_METERS;		// ACCURACY_NEAREST_TEN_METERS, ACCURACY_BEST doesn't work on iOS
//Ti.Geolocation.purpose 			= "Receive User Location";
// Ti.API.debug( "Running on an [" + Ti.Platform.osname + "] device");


'use strict';



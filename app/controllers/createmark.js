//========================================================================
//	Name:			saveRemark ()
//========================================================================
function saveRemark(title, text_content, textarea_hint) {
	// Ti.API.info( 	"  .... [i] snapShotImage.image :: " +" [" + $.mapContainer.snapShot +"] ");

	if ( title!='' && text_content!='' && text_content!=textarea_hint ) {
		disableAddMarkBtn();
		var query = Ti.Network.createHTTPClient();
		query.open("POST", SERVER_URL+"mark-create2.php");
		var params = {
			owner_ID	: mySesh.user.owner_ID,
			owner_name	: mySesh.user.name,
			dog_ID 		: mySesh.dog.dog_ID,		// mySesh.dog.dog_ID,
			dog_name 	: mySesh.dog.name, 
			lat			: mySesh.geo.lat,
			lon         : mySesh.geo.lon,
			city        : "unknown",
			zip			: "unknown",
			country 	: "unknown",
			mark_photo	: 1,
			mark_name  	: title,
			post_text	: text_content,
			post_wbflag	: ((poiSwitch.value==true)?1:0)
		};
		Ti.API.log( "  .... [+]  saveRemark :: " + JSON.stringify(params) );
		
		// (1) :::: ATTEMPT TO LOAD REMOTE DATA ::::
		query.send(params);
		query.onload = function() {
			var json = this.responseText;
			if (json != "") {
				// (2) :::: IF WE GET SUM JSON ::::
				var response = JSON.parse(json);
				if (response.status == 1) { 		// success
					Ti.API.log("  [>]  Info added successfully ");
					// (3) :::: SAVE THE SET OF MARKS TO GLOBAL ARRAY ::::
					mySesh.dog.marks_made = mySesh.dog.marks_made + 1;
					createSimpleDialog('Nice!',response.message + " ("+mySesh.dog.marks_made+" so far) ");
					
					// (4) :::: INCREMENT THE  dog.marks_made GLOBAL VARIABLE, HIT BACKEND SCRIPT ::::
					// TODO: stuff above
					
					// (5) :::: REFRESH MAP MARKS ON MAPVIEW ::::					
					myMap.getMarks( mySesh.geo.lat, mySesh.geo.lon, 1, 0.5, 20, function(){
			      		 myMap.getNearbyDogs(mySesh.user.lat, mySesh.user.lon);
			      	} );
      				//disableAllButtons();
     		
      				// (6) :::: CLOSE WINDOW, RETURN TO MAPVIEW ::::
					closeWindowController();				
				} else {
					enableAddMarkBtn();
					createSimpleDialog( "Problems Houston", response.message); 
				}
			}	else {
				enableAddMarkBtn();
				createSimpleDialog( "Server timeout", "No data received"); 
			}
			//		addMarkBtn.focus();			
		};
	} else {
		createSimpleDialog("Error", "Please fill in both Title and Mark");
	}
}

//=================================================================================
// 	Name:  		drawDefaultMap (lat, lon)
// 	Purpose:	draw default Apple map
//=================================================================================
function drawDefaultMap(lat, lon, delta) {
  Ti.API.log("  .... [~] drawDefaultMap lat/lon/delta: ["+lat+"/"+lon+"/"+delta+"]");
	var tempMap = myMapFactory.createView({
		mapType : myMapFactory.NORMAL_TYPE, // NORMAL HYBRID SATTELITE
		region : {
			latitude 		: lat,
			longitude 		: lon,
			latitudeDelta 	: delta,
			longitudeDelta	: delta
		},
		id : "markMapView",
		top 		: 0,
		opacity		: 1,
		zIndex		: 20,
		animate 	: false,	
		maxZoom		: 1,
		minZoom		: 2,
		regionFit	: true,
		userLocation: true,
		enableZoomControls : true
	});
	Ti.API.log("...[~] Map object built ");
	return tempMap;
}

// ADD / REMOVE LISTENER SHORTCUTS
function enableAddMarkBtn() {
	addMarkBtn.addEventListener('click', function(e){ saveRemark(title_input.value, textArea.value, textarea_hint); });
}
function disableAddMarkBtn() {
	addMarkBtn.removeEventListener('click', function(e){ saveRemark(title_input.value, textArea.value, textarea_hint); });
}

//=================================================================================
//	Name:  		takeMarkImage ()
//	Purpose: 	trigger device camera
//=================================================================================
function takeMarkImage() {
	// markCameraBtn.hide();
	Titanium.Media.showCamera({
		///////   	SUCCESS
		success : function(event) {
			removeAllChildren($.mapContainer);
			progress_bar.show();
			
			var imageBlob = event.media;
			var bannerImage = imageBlob.imageAsResized(750, 750);
			var img = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory,'snapshot.png');
	        img.write(bannerImage);
	        
	        var snapShotImage = Ti.UI.createImageView({ 
				height	: Ti.UI.SIZE,
				width	: Ti.UI.SIZE,
				image	: img.nativePath,
				top		: 0, 
				left	: 0
			});
	      	$.mapContainer.add(snapShotImage);
	      	$.mapContainer.snapShot = snapShotImage;
	      	//mySesh.temp_image = bannerImage;

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
			      	if (jsonData.status>0) {
			        	// createSimpleDialog('Success', jsonData.message);
			        	Ti.API.log( "   >> MARK IMAGE UPLOADED" );
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
		    	progress_bar.value = e.progress;
		    };
		    xhr.send({
				'userfile'	: bannerImage,
				'type'		: 'temp',
				'type_ID'	: mySesh.user.owner_ID
		    });
       	},
		/////////		CANCEL
		cancel : function() {
		},
		/////////		ERROR
		error : function(error) {
		},
		allowImageEditing : true
	});
}



//==============================================================================================================================
/* TODO:  
	 Full size header 

		"	Terra's Mark #103
			Mark Title And Stuff...
			Playa Vista, CA 90094
			2.2 mi away 	

*/

var args = arguments[0] || {};		// returns empty array instead of undefined thanks to the ||

// Ti.API.debug(JSON.stringify(data));
Ti.API.debug(" >>> args in CreateMark: "+JSON.stringify(args));

// (1)  Create + Add map to the appropriate parent view; center on user's current location
var markMapView 	= drawDefaultMap( mySesh.geo.lat, mySesh.geo.lon, 0.012 ); 
$.mapContainer.add( markMapView );

$.createmark.addEventListener('focus',function(e) {
	var markCameraBtn = Ti.UI.createButton( {
			id			: "markCameraBtn",	
			backgroundImage : ICON_PATH + 'button-photoupload.png',
			// backgroundColor: '#ffffff', 
			opacity : 1,
			height	: 70, 
			width	: 70,
			top  	: 234,
			right	: 20,
	 		zIndex  : 101
	} );
	markCameraBtn.addEventListener('click', function(e) { takeMarkImage(); } );
	$.mapContainer.add( markCameraBtn );
 });	

// (1.5)  Add progress bar to page
var progress_bar = myUiFactory.buildProgressBar("Uploading Profile Image");
$.mapContainer.add(progress_bar);

var parentContainer  = myUiFactory.buildViewContainer("markParent", "vertical", "100%", Ti.UI.SIZE, 0, myUiFactory._color_ltblue);
var form_width = myUiFactory._form_width;

var title_label = myUiFactory.buildLabel( "Title", form_width, myUiFactory._height_row, myUiFactory._text_medium, "#000000", myUiFactory._color_ltblue, "left" );	
var title_input = myUiFactory.buildTextField("mark_title", form_width, "Add a memorable title", false);
var textarea_label = myUiFactory.buildLabel( "Message:", form_width, myUiFactory._height_row, myUiFactory._text_medium, "#000000", myUiFactory._color_ltblue, "left" );
// used later to ensure the user has actually filled in the Mark textarea
var textarea_hint = 'What does '+ mySesh.dog.name +' want to say about this place?';

var textArea = Ti.UI.createTextArea({
	borderWidth		: 0,
 	borderColor		: '#bbbbbb',
 	borderRadius	: 5,
 	color 			: '#888888',
 	font 			: { fontFamily: 'Raleway-Medium', fontSize: 14 },
 	keyboardType 	: Titanium.UI.KEYBOARD_DEFAULT,
 	returnKeyType   : Titanium.UI.RETURNKEY_DEFAULT,
 	textAlign 		: 'left',
 	value  			: textarea_hint,
 	top 			: 1,
 	width 			: form_width, 
 	height 			: 90
});

var addMarkBtn = myUiFactory.buildButton( "addMarkBtn", "mark", "large" );

// "IS THIS A POI" SWITCH
var yesNoContainer  = myUiFactory.buildViewContainer("yesnoContainer", "horizontal", myUiFactory._device.screenwidth, 40, 0, myUiFactory._color_ltblue);
var yes_label		= myUiFactory.buildLabel( "Yes", 30, myUiFactory._height_header, myUiFactory._text_small, "#888888", myUiFactory._color_ltblue, "left" );
var no_label 	 	= myUiFactory.buildLabel( "No", 20, myUiFactory._height_header, myUiFactory._text_small, "#000000", myUiFactory._color_ltblue, "left" );
var switch_label 	= myUiFactory.buildLabel( "Is this a dog friendly place or business?", form_width, myUiFactory._height_header, myUiFactory._text_medium, "#000000", myUiFactory._color_ltblue, "left" );
var poiSwitch 		= Ti.UI.createSwitch({
  value: false, left: myUiFactory._pad_left,
  width: 60, height:20
});
poiSwitch.addEventListener('change',function(e){
  Ti.API.info('  .... [+] poiSwitch value: ' + poiSwitch.value);
  if(poiSwitch.value==true) {
  	yes_label.color = "#000000";
  	no_label.color = "#888888";
  } if(poiSwitch.value==false) {
  	yes_label.color = "#888888";
  	no_label.color = "#000000";
  }

});

// ADD EVERYTHING TO WINDOW
// original mark section header + first mark
parentContainer.add( myUiFactory.buildSectionHeader("mark_header", "MARKING THIS SPOT", 1) );
// title of mark
parentContainer.add( myUiFactory.buildSpacer("horz", myUiFactory._pad_top, "clear") );
parentContainer.add(title_label);
parentContainer.add(title_input);

// mark text
parentContainer.add(textarea_label);
parentContainer.add(textArea);

// poi?
parentContainer.add(switch_label);
yesNoContainer.add(no_label);
yesNoContainer.add(poiSwitch);
yesNoContainer.add(yes_label);
parentContainer.add(yesNoContainer);

// add Mark button
parentContainer.add(addMarkBtn);
$.markForm.add(parentContainer);

addMarkBtn.addEventListener	('click', function(e) { saveRemark(title_input.value, textArea.value, textarea_hint); });
textArea.addEventListener	('focus', function(e) { clearTextAreaContents(textArea); });


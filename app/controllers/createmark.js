//========================================================================
//	Name:			saveRemark ()
//========================================================================
function saveRemark(title, text_content, textarea_hint, img) {
	// Ti.API.info( 	"  .... [i] snapShotImage.image :: " +" [" + $.mapContainer.snapShot +"] ");
	if (!mySesh.actionOngoing) {
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
						// (3) ::::  Increment marks_made global var ::::
						mySesh.dog.marks_made = mySesh.dog.marks_made + 1;				

						// (4) :::: Success Dialog Modal ::::
						var optns = {
							options : ['OK'],
							selectedIndex : 0,
							title : 'Nice!' + response.message + " ("+mySesh.dog.marks_made+" so far) "
						};
						var done_dialog = Ti.UI.createOptionDialog(optns);
						done_dialog.show();
						done_dialog.addEventListener('click', function(e_dialog) {
							if (e_dialog.index == 0) {  // user clicked OK
							    closeWindowController();
							}
						});
						
						// (5) :::: Set flag to refresh map marks on mapview ::::	
						mySesh.flag.nearbyDogsChanged = true;	
						
	      				// (6) :::: Close window, return to map ::::
	      				imgFile = null;
						// 	closeWindowController();		
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
	else {
		createSimpleDialog("Please wait", "Your photo is still uploading");
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
	if (!mySesh.actionOngoing) {
		Titanium.Media.showCamera({			//showCamera OR openPhotoGallery (for testing on emulator)
			///////   	SUCCESS
			success : function(event) {
				disableAllButtons();
				removeAllChildren($.mapContainer);

				var imageBlob = event.media;
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
		      	$.mapContainer.add(snapShotImage);
		      	$.mapContainer.snapShot = snapShotImage;
				
				$.mapContainer.add(progress_bar);
				progress_bar.zIndex = 999;
				progress_bar.top = (myUi._device.screenwidth/2)-20;
				progress_bar.show();
		     	
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
				        	Ti.API.log("   >> MARK IMAGE UPLOADED");
				        	progress_bar.hide();
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
				enableAllButtons();
			},
			/////////		ERROR
			error : function(error) {
			},
			allowImageEditing : true
		});
	}
	else {
		createSimpleDialog("Please wait", "Your photo is still uploading");
	}
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
var markMapView = drawDefaultMap( mySesh.geo.lat, mySesh.geo.lon, 0.012 ); 
var pad_left = 2*myUi._pad_left;
$.mapContainer.add( markMapView );

$.createmark.addEventListener('focus',function(e) {
	var markCameraBtn = Ti.UI.createButton( {
			id			: "markCameraBtn",	
			backgroundImage : ICON_PATH + 'button-photoupload.png',
			// backgroundColor: '#ffffff', 
			opacity : 1,
			height	: 70, 
			width	: 70,
			top  	: myUi._device.screenwidth - 80 -(2*myUi._pad_left),
			right	: 2*myUi._pad_left,
	 		zIndex  : 101
	} );
	markCameraBtn.addEventListener('click', function(e) { takeMarkImage(); } );
	$.mapContainer.add( markCameraBtn );
 });	

// (1.5)  Add progress bar to page
var progress_bar = myUi.buildProgressBar("uploading mark image");

var parentContainer  = myUi.buildViewContainer("markParent", "vertical", "100%", Ti.UI.SIZE, 0, myUi._color_ltblue);
var form_width = myUi._form_width;

var title_label = myUi.buildLabel( "Title:", form_width, 20, myUi._text_medium, "#000000", myUi._color_ltblue, "left" );	
var title_input = myUi.buildTextField("mark_title", form_width, "Add a memorable title", false);
var textarea_label = myUi.buildLabel( "Message:", form_width, 40, myUi._text_medium, "#000000", myUi._color_ltblue, "left" );
// used later to ensure the user has actually filled in the Mark textarea
var textarea_hint = 'What does '+ mySesh.dog.name +' want to say about this place?';
var textArea = myUi.buildTextArea(textarea_hint, 90);
var character_count =  myUi.buildLabel( "0 / "+mySesh.stringMaxes.poiRemarkMaxLength, form_width, 16, myUi._text_tiny, "#000000", myUi._color_ltblue, "center", "" );

var addMarkBtn = myUi.buildButton( "addMarkBtn", "mark", "large" );
var createmark_reward_text = "For each new dog-friendly location found, "+ mySesh.dog.name +" will be awarded +10 Helpfulness for being the first to mark it!"
// "IS THIS A POI" SWITCH
var createmark_ispoi_text   = "Is this mark for a dog-friendly place/business?  Notify us so we can officially mark it as a Waterbowl location!";
var yesNoContainer  = myUi.buildViewContainer("yesnoContainer", "horizontal", myUi._device.screenwidth, 40, 0, myUi._color_ltblue);
yesNoContainer.left = pad_left;
var yes_label		= myUi.buildLabel( "Yes", 60, myUi._height_header, myUi._text_small, "#888888", myUi._color_ltblue, "center", 0);
var no_label 	 	= myUi.buildLabel( "No", 40, myUi._height_header, myUi._text_small, "#000000", myUi._color_ltblue, "center", 0);
var switch_label 	= myUi.buildLabel( createmark_ispoi_text, form_width, 68, myUi._text_medium, "#000000", myUi._color_ltblue, "left", pad_left);

var rewardContainer = myUi.buildViewContainer("rewardContainer", "horizontal", myUi._device.screenwidth, 60, 10, '');
var reward_label	
	= myUi.buildLabel( createmark_reward_text, form_width, Ti.UI.SIZE, 
			myUi._text_small, myUi._color_dkpink, "", "center", "");
reward_label.left = pad_left;

rewardContainer.add(reward_label);

var poiSwitch = Ti.UI.createSwitch({
  value: false, left: myUi._pad_left,
  width: 60, height:20
});
poiSwitch.addEventListener('change',function(e){
	if(poiSwitch.value==true) {
  		yes_label.color = "#000000";
  		no_label.color = "#888888";
  	} 
  	else if(poiSwitch.value==false) {
  		yes_label.color = "#888888";
  		no_label.color = "#000000";
  	}
});

// ADD EVERYTHING TO WINDOW
// original mark section header + first mark
parentContainer.add( myUi.buildSectionHeader("mark_header", "MARKING THIS SPOT", 1) );
// title of mark
parentContainer.add( myUi.buildSpacer("horz", myUi._pad_top, "clear") );
parentContainer.add(title_label);
parentContainer.add(title_input);

// mark text
parentContainer.add(textarea_label);
parentContainer.add(textArea);
parentContainer.add(character_count);
parentContainer.add(myUi.buildSpacer("horz", 10, "clear"));
// poi?
parentContainer.add(switch_label);
yesNoContainer.add(no_label);
yesNoContainer.add(poiSwitch);
yesNoContainer.add(yes_label);
parentContainer.add(yesNoContainer);

// add Mark button
parentContainer.add(addMarkBtn);
parentContainer.add(myUi.buildSpacer("horz", myUi._pad_top, "clear"));
parentContainer.add(rewardContainer );
parentContainer.add(myUi.buildSpacer("horz", 40, "clear"));
$.markForm.add(parentContainer);

addMarkBtn.addEventListener('click', function(e) { saveRemark(title_input.value, textArea.value, textarea_hint); });
textArea.addEventListener('change', function(e) { countCharacters(textArea, character_count); });
textArea.addEventListener('focus', function(e) { clearTextAreaContents(textArea, textarea_hint); });


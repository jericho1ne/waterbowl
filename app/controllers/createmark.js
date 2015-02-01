//========================================================================
//	Name:			saveRemark ()
//========================================================================
function saveRemark(title, text_content, textarea_hint) {
	if ( title!='' && text_content!='' && text_content!=textarea_hint ) {
		var query = Ti.Network.createHTTPClient();
		query.open("POST", SERVER_URL+"mark-create.php");
		var params = {
			owner_ID 		: mySesh.user.owner_ID,
			owner_name	: mySesh.user.name,
			dog_ID 	 		: mySesh.dog.dog_ID,		// mySesh.dog.dog_ID,
			dog_name 		: mySesh.dog.name, 
			lat					: mySesh.geo.lat,
			lon         : mySesh.geo.lon,
			city        : "unknown",
			zip					: "unknown",
			country 		: "unknown",
			mark_name   : title,
			post_text		: text_content
		};
		Ti.API.log( "* Sending info to PHP " + JSON.stringify(params) );
		
		query.send(params);
		query.onload = function() {
			var json = this.responseText;
			if (json != "") {
				disableAddMarkBtn();
				var response = JSON.parse(json);
				if (response.status == 1) { 		// success
					Ti.API.log("  [>]  Info added successfully ");
					mySesh.dog.marks_made = mySesh.dog.marks_made + 1;
					createSimpleDialog('Nice!',response.message + " ("+mySesh.dog.marks_made+" so far) ");
					// TODO:  increment dog.marks_made global variable 
					closeWindowController();				// close current window and bounce user to Map View
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
  Ti.API.log(".... .... .... drawDefaultMap lat/lon/delta: ["+lat+"/"+lon+"/"+delta+"]");
	var tempMap = myMapFactory.createView({
		mapType : myMapFactory.NORMAL_TYPE, // NORMAL HYBRID SATTELITE
		region : {
			latitude 			: lat,
			longitude 		: lon,
			latitudeDelta : delta,
			longitudeDelta: delta
		},
		id : "markMapView",
		top 					: 0,
		opacity				: 1,
		zIndex				: 20,
		animate 			: false,	
		maxZoom				: 1,
		minZoom				: 2,
		regionFit	 		: true,
		userLocation 	: true,
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
//===========================================================================================================
var args = arguments[0] || {};		// returns empty array instead of undefined thanks to the ||
// Ti.API.debug(JSON.stringify(data));
Ti.API.debug(" >>> args in CreateMark: "+JSON.stringify(args));

// (1)  Create + Add map to the appropriate parent view; center on user's current location
var markMapView = drawDefaultMap( mySesh.geo.lat, mySesh.geo.lon, 0.07 );     // 0.05 
$.mapContainer.add( markMapView );

// (2)  Add original mark section header + first mark
$.markForm.add( myUiFactory.buildSectionHeader("mark_header", "MARKING THIS SPOT", 1) );

var form_width = mySesh.device.screenwidth - myUiFactory._pad_right - myUiFactory._pad_left;
var title_label = myUiFactory.buildLabel( "Mark Title", form_width, myUiFactory._height_header, myUiFactory._text_medium, "#000000","left" );	
var title_input = myUiFactory.buildTextField("mark_title", form_width, "Add a memorable title", false);
var textarea_label = myUiFactory.buildLabel( "Mark Text", form_width, myUiFactory._height_header, myUiFactory._text_medium, "#000000","left" );
// used later to ensure the user has actually filled in the Mark textarea
var textarea_hint = 'What does '+ mySesh.dog.name +' want to say about this place?';

var textArea = Ti.UI.createTextArea({
  borderWidth: 0,
  borderColor: '#bbb',
  borderRadius: 5,
  color: '#888',
  font: { fontFamily: 'Raleway-Medium', fontSize: 14 },
  keyboardType    : Titanium.UI.KEYBOARD_DEFAULT,
 	returnKeyType   : Titanium.UI.RETURNKEY_DEFAULT,
  textAlign: 'left',
  value: textarea_hint,
  top: 1,
  width: form_width, 
  height : 90
});

var addMarkBtn = myUiFactory.buildButton( "addMarkBtn", "mark", "large" );

$.markForm.add(title_label);
$.markForm.add(title_input);
$.markForm.add(textarea_label);
$.markForm.add(textArea);
$.markForm.add(addMarkBtn);
addMarkBtn.addEventListener('click', function(e){ saveRemark(title_input.value, textArea.value, textarea_hint); });
textArea.addEventListener('focus', function(e){ clearTextAreaContents(textArea); });


/* TODO:  

(0) Map base layer, centered on user location (list POIs or other nearby Marks?)

(1) Full size header 

		"	Terra's Mark #103
			Mark Title And Stuff...
			Playa Vista, CA 90094
			2.2 mi away 	

(2)	"MARKING THIS SPOT" section header
*/
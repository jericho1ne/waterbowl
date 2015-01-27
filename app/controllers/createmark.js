//========================================================================
//	Name:			saveRemark ()
//========================================================================
function saveRemark(place_ID, title, text_content, textarea_hint) {
	if ( title!='' && text_content!='' && text_content!=textarea_hint ) {
		createSimpleDialog("Saving: "+title, text_content);
		// TODO: save to db
		
		closeWindowController();
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
	markMapView = myMap.createView({
		mapType : Map.NORMAL_TYPE, // NORMAL HYBRID SATTELITE
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
	return markMapView;
}

//===========================================================================================================
var args = arguments[0] || {};		// returns empty array instead of undefined thanks to the ||
// var data = [].slice.call(arguments);
// Ti.API.debug(JSON.stringify(data));
Ti.API.debug(" >>> args on CreateMark: "+JSON.stringify(args));

// (1)  Create + Add map to the appropriate parent view; center on user's current location
var markMapView = drawDefaultMap( mySesh.geo.lat, mySesh.geo.lon, 0.07 );     // 0.05 
$.mapContainer.add( markMapView );

// (2)  Add original mark section header + first mark
$.markForm.add( myUiFactory.buildSectionHeader("mark_header", "MARKING THIS SPOT", 1) );

var form_width = mySesh.device.screenwidth - myUiFactory._pad_right - myUiFactory._pad_left;
var title_label = myUiFactory.buildLabel( "Mark Title", form_width, myUiFactory._height_header, myUiFactory._text_medium, "left" );	
//                                         	  id,          type,      hint,   is_pwd
var title_input = myUiFactory.buildTextField("mark_title", form_width, " Add a memorable title", false);
var textarea_label = myUiFactory.buildLabel( "Mark Text", form_width, myUiFactory._height_header, myUiFactory._text_medium, "left" );	

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
addMarkBtn.addEventListener('click', function(e){ saveRemark("", title_input.value, textArea.value, textarea_hint); });

textArea.addEventListener('focus', function(e){ clearTextAreaContents(textArea); });



/* TODO:  

(-1) Need a function that is attached to any clears the 

			function clearContents(element) {
			  element.value = '';
			}

(0) Map base layer, centered on user location (list POIs or other nearby Marks?)

(1) Full size header 

		"	Terra's Mark #103
			Mark Title And Stuff...
			Playa Vista, CA 90094
			2.2 mi away 	

(2)	"MARKING THIS SPOT" section header

(3) 2 x Label & Text Area pairs

		Title														Jan 21, 2015
		+--------------------------------------------+
		| Add a memorable title 										 |
		+--------------------------------------------+
		Mark Text
		+--------------------------------------------+
		| What does Terra say about this place?      |
		+--------------------------------------------+
		
		
(4) "mark" Button

*/
//===========================================================================================================
var args = arguments[0] || {};		// returns empty array instead of undefined thanks to the ||
// var data = [].slice.call(arguments);
// Ti.API.debug(JSON.stringify(data));

//Ti.API.debug(JSON.stringify(args));

// (2)  Add original mark section header + first mark
$.scrollView.add( myUiFactory.buildSectionHeader("mark_header", "MARKING THIS SPOT", 1) );


var title_label = myUiFactory.buildLabel( "Mark Title", "100%", myUiFactory._height_row+10, myUiFactory._text_medium );	
//                                         	  id,          type,      hint,   is_pwd
var title_input = myUiFactory.buildTextField("mark_title", "regular", "password", false);
var textarea_label = myUiFactory.buildLabel( "Mark Text", "100%", myUiFactory._height_row+10, myUiFactory._text_medium );	
var textArea = Ti.UI.createTextArea({
  borderWidth: 2,
  borderColor: '#bbb',
  borderRadius: 5,
  color: '#888',
  font: { fontFamily: 'Raleway-Medium', fontSize: 14 },
  keyboardType    : Titanium.UI.KEYBOARD_DEFAULT,
 	returnKeyType   : Titanium.UI.RETURNKEY_DEFAULT,
  textAlign: 'left',
  value: 'What does '+ mySesh.dog.name +' want to say about this place?',
  top: 8,
  width: "100%", height : 110
});

$.scrollView.add(title_label);
$.scrollView.add(title_input);
$.scrollView.add(textarea_label);
$.scrollView.add(textArea);

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
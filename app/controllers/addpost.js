//========================================================================
//	Name:			saveRemark (place_ID, place_type, text_content)
//========================================================================
function saveRemark(place_ID, place_type, text_content) {
	if (	text_content.length > 0  && 
				text_content.length <= mySesh.stringMaxes.poiRemarkMaxLength ) {
		disableAddMarkBtn();
		var query = Ti.Network.createHTTPClient();
		query.open("POST", SERVER_URL+"add-response-post.php");
		var params = {
			place_ID  	: place_ID,
			place_type 	: place_type,
			owner_ID 		: mySesh.user.owner_ID,
			owner_name	: mySesh.user.name,
			dog_ID 	 		: mySesh.dog.dog_ID,	
			dog_name 		: mySesh.dog.name, 
			post_text		: text_content
		};
		Ti.API.log( "* Sending info to PHP " + JSON.stringify(params) );
	
		query.send(params);
		query.onload = function() {
			var json = this.responseText;
			if (json != "") {
				var response = JSON.parse(json);
				if (response.status == 1) { 		// success
					mySesh.flag.poiRemarksChanged = true;
					// createSimpleDialog('Success','Your mark was saved!');
					closeWindowController();		// close current window and bounce user to Place Overview
				} else {
					enableAddMarkBtn();
					createSimpleDialog( "Problems Houston", response.message); 
				}
			}	else {
				enableAddMarkBtn();
				createSimpleDialog( "Server timeout", "No data received"); 
			}
		};
	}
	else if (text_content.length > mySesh.stringMaxes.poiRemarkMaxLength){ 
		createSimpleDialog( "Uh oh", "You've exceeded the maximum character length ("+
													mySesh.stringMaxes.poiRemarkMaxLength+")."); 
	}
	else {
		createSimpleDialog( "Uh oh", "Please type a message before submitting."); 
	}
}

// ADD / REMOVE LISTENER SHORTCUTS
function enableAddMarkBtn() {
	addMarkBtn.addEventListener('click', function(e){ saveRemark(args._place_ID,args._place_type,textArea.value); });
}
function disableAddMarkBtn() {
	addMarkBtn.removeEventListener('click', function(e){ saveRemark(args._place_ID,args._place_type,textArea.value); });
}
//======================================================================================================
var args = arguments[0] || {};

var miniHeader = myUi.buildMiniHeader(args._place_name, args._place_city, args._place_bgcolor);		// send place name, subtitle, and bg color
var create_marks_header = myUi.buildSectionHeader("create_marks_header", "ADD REMARK TO THIS SPOT", 1);
var pad_left = 2*myUi._pad_left;
var form_width = myUi._device.screenwidth - (2*pad_left);
// TODO:  display today's date 
								// title, width, 		height, 	font_style, 	  font_color, bg_color, 		text_align, horz_pad
var title 	= myUi.buildLabel( 'Message:', form_width, 40, myUi._text_medium, "#000000", myUi._color_ltblue, "left", pad_left);	
var text_area_hint = 'What does '+ mySesh.dog.name +' want to say about this place?';
var textArea = myUi.buildTextArea( text_area_hint, 90 );
var character_count =  myUi.buildLabel( "0 / "+mySesh.stringMaxes.poiRemarkMaxLength, form_width, Ti.UI.SIZE, myUi._text_tiny, "#000000", myUi._color_ltblue, "center", "" );
var addMarkBtn = myUi.buildButton( "addMarkBtn", "add remark", "large" );

$.scrollView.add(miniHeader);
$.scrollView.add(create_marks_header);
$.scrollView.add(title); 
$.scrollView.add(textArea);
$.scrollView.add(character_count);
$.scrollView.add( myUi.buildSpacer("horz", 10, myUi._color_ltblue) ); 
$.scrollView.add(addMarkBtn);

textArea.addEventListener('focus',  function(e) { clearTextAreaContents(textArea, text_area_hint); });
textArea.addEventListener('change', function(e) { countCharacters(textArea, character_count); });
addMarkBtn.addEventListener('click', function(e){ saveRemark(args._place_ID, args._place_type, textArea.value); });

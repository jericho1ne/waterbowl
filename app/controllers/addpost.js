function countCharacters(text_content) {
	Ti.API.debug(text_content.length);
	
	character_count.text = text_content.length+" / "+mySesh.stringMaxes.poiRemarkMaxLength;
}

//========================================================================
//	Name:			saveRemark ()
//========================================================================
function saveRemark(place_ID, place_type, text_content) {
	if (text_content.length>0 && text_content.length<=mySesh.stringMaxes.poiRemarkMaxLength) {
		addMarkBtn.removeEventListener('click', function(e){ saveRemark(textArea.value); });
		var query = Ti.Network.createHTTPClient();
		query.open("POST", SERVER_URL+"add-response-post.php");
		var params = {
			place_ID  	: place_ID,
			place_type 	: place_type,
			owner_ID 		: mySesh.user.owner_ID,
			owner_name	: mySesh.user.name,
			dog_ID 	 		: mySesh.dog.dog_ID,		// mySesh.dog.dog_ID,
			dog_name 		: mySesh.dog.name, 
			post_text		: text_content
		};
		Ti.API.log( "* Sending info to PHP " + JSON.stringify(params) );
	
		var response = 0;
		query.send(params);
		query.onload = function() {
			var json = this.responseText;
			if (json != "") {
				Ti.API.info("* checkin JSON " + json);
				var response = JSON.parse(json);
				if (response.status == 1) { 		// success
					Ti.API.log("  [>]  Info added successfully ");
					createSimpleDialog('Success','Your mark was saved!');
					// close current window and bounce user to Place Overview
					closeWindowController();
				}
				else {
					addMarkBtn.addEventListener('click', function(e){ saveRemark(textArea.value); });
					createSimpleDialog( "Problems Houston", response.message); 
				}
			}
			else {
				addMarkBtn.addEventListener('click', function(e){ saveRemark(textArea.value); });
				createSimpleDialog( "Server timeout", "No data received"); 
			}
				
			//		addMarkBtn.focus();
			
		};
	}
	else if (text_content.length>mySesh.stringMaxes.poiRemarkMaxLength){ 
		createSimpleDialog( "Uh oh", "You've exceeded the maximum character length ("+
													mySesh.stringMaxes.poiRemarkMaxLength+")."); 
	}
	else {
		createSimpleDialog( "Uh oh", "Please type a message before submitting."); 
	}
	//return response;
}

//===========================================================================================================
var args = arguments[0] || {};
$.mini_place_name_label.text = args._place_name;
$.mini_place_second_label.text		= args._place_city;

var create_marks_header = myUiFactory.buildSectionHeader("create_marks_header", "ADD REMARK TO THIS SPOT", 1);

// TODO:  ALIGN LEFT
var action_call =  myUiFactory.buildLabel( mySesh.dog.name+" says", "100%", myUiFactory._height_row, myUiFactory._text_medium_bold );	
// TODO:  display today's date and live character count
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

$.scrollView.add(create_marks_header); 
$.scrollView.add(action_call); 
$.scrollView.add(textArea);
textArea.addEventListener('focus', function(e){ clearTextAreaContents(textArea); });


var character_count =  myUiFactory.buildLabel( "0 / "+mySesh.stringMaxes.poiRemarkMaxLength, "100%", myUiFactory._height_row, myUiFactory._text_tiny );
$.scrollView.add(character_count);
var addMarkBtn = myUiFactory.buildButton( "addMarkBtn", "add remark", "large" );
$.scrollView.add(addMarkBtn);

addMarkBtn.addEventListener('click', function(e){ saveRemark(args._place_ID, args._place_type, textArea.value); });

textArea.addEventListener('change', function(e){ countCharacters(textArea.value); });
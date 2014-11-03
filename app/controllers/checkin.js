//===========================================================
//	name:			updateLabel(e)
//	purpose:	display slider estimate ranges
//===========================================================
function updateLabel(e){
	Ti.API.log( "* Slider: "+ e.value + " * " );
  //$.slider_label.text = String.format("%3f", e.value);
  var text_estimate = "";
  var int_estimate = "";
  
  var slider_val = Math.round(e.value);
  
  if (slider_val == 1)	{
    	text_estimate = 'No dogs :(';
    	int_estimate = '0';
    }
    else if (slider_val == 2) {
    	text_estimate = "One lonely dog…";
			int_estimate = '1';
		}
		else if (slider_val == 3) {
    	text_estimate = "A few pups";
    	int_estimate = '2-3';
		}
    else if (slider_val == 4)	{
    	text_estimate = "Some dogs";
    	int_estimate = '4-6';
		}
    else if (slider_val == 5)	{
    	text_estimate	= "Many dogs";
    	int_estimate = '7-10';
		}
		else if (slider_val == 6) {
			text_estimate = "A lot of dogs!";
			int_estimate = '11-15';
		}
   	else if (slider_val == 7)	{
   		text_estimate = 'It\'s a full park.';
   		int_estimate = '16+';
		}
		$.slider_label.text 	= text_estimate;
		$.slider_int_val.text = int_estimate;
}

//========================================================================
//	Name:			checkIn ( )
//	Purpose:	send owner_ID, estimate, timestamp to updateEstimates(); 
//						close current window if db insert is successful
//========================================================================
function checkIn() {
	var estimate = Math.round( $.slider.value );
	
	Ti.API.log( "* Checked in to place ID "+ 
		sessionVars.currentPlace.ID + " / " +
		sessionVars.owner_ID + " / " + estimate + " * " );
	
	updateEstimates(sessionVars.currentPlace.ID, sessionVars.owner_ID, estimate);
}

//========================================================================
//	Name:			updateEstimates (park_ID, owner_ID, estimate)
//	Purpose:	check into a park - user_estimates table
//	TODO:			Allow selection between multiple dogs
//========================================================================
function updateEstimates (park_ID, owner_ID, estimate) {
	
	var grabParks = Ti.Network.createHTTPClient();
	grabParks.open("POST", "http://waterbowl.net/mobile/checkin.php");
	var params = {
		park_ID : park_ID,
		owner_ID : owner_ID,
		estimate: estimate
	};
	var response = 0;
	grabParks.send(params);
	grabParks.onload = function() {
		var json = this.responseText;
		if (json != "") {
			Ti.API.info("* checkin JSON " + json);
			var response = JSON.parse(json);
			if (response.status == 1) { 		// success
				Ti.API.log("* Checked in Successfully *");
				//~~~~~~~~~~ SAVE ALL OF THIS IN SESSIONVARS ~~~~~~~~~~~~~~
				sessionVars.checkin = true;										// checkin now officially complete
				var timestamp = new Date().getTime();
				
				sessionVars.lastCheckIn = timestamp;
				sessionVars.checkinInProgress = false;				// remove "in progress" state
				Ti.API.log("* timestamp: "+ timestamp +" *");
				// close current window and bounce user to Place Overview
				$.checkin.close();
				$.checkin = null;
				var placeoverview = Alloy.createController("placeoverview").getView();
				placeoverview.open();
			}
			else
				alert("Check in failed."); 
		}
		else
				alert("No JSON data received."); 
	};
	return response;
}

sessionVars.currentWindow = "checkin";

$.backBtn.addEventListener('click', function() {
	$.checkin.close( { 
		transition : Ti.UI.iPhone.AnimationStyle.FLIP_FROM_RIGHT, 
		duration: 300, 
		curve : Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT
	} );
	
	$.checkin = null;
});

// initial value set
$.slider_label.text = ""; 		
$.slider_int_val.text = "";

$.place_checkin.text = sessionVars.currentPlace.name;
Ti.API.log( "* Checking in at "+ sessionVars.currentPlace.name +"(" + sessionVars.currentPlace.ID +")" );

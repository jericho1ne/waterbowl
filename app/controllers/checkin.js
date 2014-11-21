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
			text_estimate = "A lot of dogs";
			int_estimate = '11-15';
		}
   	else if (slider_val == 7)	{
   		text_estimate = 'It\'s full of dogs!';
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
		session.currentPlace.ID + " / " +
		session.user.owner_ID + " / " + estimate + " * " );
	
	updateEstimates(session.currentPlace.ID, session.user.owner_ID, estimate);
}

//========================================================================
//	Name:			updateEstimates (place_ID, owner_ID, estimate)
//	Purpose:	check into a place - user_estimates table
//	TODO:			Allow selection between multiple dogs
//========================================================================
function updateEstimates (place_ID, owner_ID, estimate) {
	
	var grabPlaces = Ti.Network.createHTTPClient();
	grabPlaces.open("POST", "http://waterbowl.net/mobile/checkin.php");
	
	var params = {
		place_ID : place_ID,
		owner_ID : owner_ID,
		estimate: estimate
	};
	
	var response = 0;
	grabPlaces.send(params);
	grabPlaces.onload = function() {
		var json = this.responseText;
		if (json != "") {
			Ti.API.info("* checkin JSON " + json);
			var response = JSON.parse(json);
			if (response.status == 1) { 		// success
				Ti.API.log("* Checked in Successfully *");
	
				// close current window and bounce user to Place Overview
				$.checkin.close();
				$.checkin = null;
				
				/*		 save Place ID, checkin state, and timestamp in session  	*/
				session.checkedIn = true;										// checkin now officially complete
				var timestamp = new Date().getTime();
				session.checkin_place_ID 	= place_ID;
				session.lastCheckIn 			= timestamp;
				session.checkinInProgress = false;				// remove "in progress" state
				
				var placeoverview = Alloy.createController("placeoverview", { _place_ID: place_ID }).getView();	
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

//===========================================================================================
// 				LOGIC FLOW
//-----------------------------------------------------------------------
//
//		(0)		Add window to global stack, display menubar
//
//-----------------------------------------------------------------------
addToAppWindowStack( $.checkin, "checkin" );
addMenubar( $.menubar );

var args 	= arguments[0] || {};
//Ti.API.info("* checkin.js { #" + args._place_ID  + " } * ");	


// initial value set
$.slider_label.text = ""; 		
$.slider_int_val.text = "";

$.place_checkin.text = session.currentPlace.name;
Ti.API.log( "* Checking in at "+ session.currentPlace.name +"(" + session.currentPlace.ID +")" );


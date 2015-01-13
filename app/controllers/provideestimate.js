//
//	Waterbowl App
//		:: checkin.js
//	
//	Created by Mihai Peteu Oct 2014
//	(c) 2014 waterbowl
//

//===========================================================
//	name:			updateLabel(e, slider_label, slider_value)
//	purpose:	display slider estimate ranges
//===========================================================
function updateLabel(e, slider_label, slider_value){
	Ti.API.log( " *** Slider: "+ e.value + " * " );
  // slider_label.text = String.format("%3f", e.value);
  var text_estimate = "";
  var int_estimate  = "";
  
  var slider_val = Math.round(e.value);
  
  if (slider_val == 0)	{
		text_estimate = 'No estimate provided';
    int_estimate = '--';
  }
    
	else if (slider_val == 1)	{
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
	slider_label.text = text_estimate;
	slider_value.text = int_estimate;
}

//========================================================================
//	Name:			updateEstimates (place_ID, owner_ID, estimate)
//	Purpose:	check into a place - user_estimates table
//	TODO:			Allow selection between multiple dogs
//========================================================================
function updateEstimates (place_ID, value_1, value_2) {
	Ti.API.debug(".... [~] updateEstimates: "+value_1+" "+value_2);
	
	alert("estimate_scale values:  large dog "+value_1+" / small dog "+value_2 );
	/*
	var grabPlaces = Ti.Network.createHTTPClient();
	grabPlaces.open("POST", "http://waterbowl.net/mobile/set-place-estimate.php");
	
	Ti.API.log( "* Saving estimate  @ place_ID " + place_ID + 
		" | owner_ID: " + MYSESSION.user.owner_ID + 
		" | estimate: " + estimate + 
		" | @ ["+ MYSESSION.geo.lat +', '+ MYSESSION.geo.lon+ "]" );
	
	var params = {
		place_ID : place_ID,
		owner_ID : MYSESSION.user.owner_ID,
		estimate: estimate,
		lat:	MYSESSION.geo.lat,
		lon:	MYSESSION.geo.lon
	};
	
	var response = 0;
	grabPlaces.send(params);
	grabPlaces.onload = function() {
		var json = this.responseText;
		if (json != "") {
			Ti.API.info("* checkin JSON " + json);
			var response = JSON.parse(json);
			if (response.status == 1) { 		// success
				Ti.API.log("  [>]  Estimate added successfully ");
	
				// close current window and bounce user to Place Overview
				$.provideestimate.close();
				$.provideestimate = null;
				
				//		 save Place ID, checkin state, and timestamp in MYSESSION  	
				MYSESSION.checkedIn = true;									// checkin now officially complete
				var timestamp = new Date().getTime();
				MYSESSION.lastCheckIn 			= timestamp;
				MYSESSION.checkinInProgress = false;				// remove "in progress" state
				
				// if placeoverview is already open, then don't do anything
				// otherwise, the Map window sent us here, so we have to open placeoverview window
				if  (MYSESSION.previousWindow != "placeoverview" ) {
					var placeoverview = Alloy.createController("placeoverview", { _place_ID: place_ID }).getView();	
					placeoverview.open();
				}
			}
			else
				alert("Unable to save estimate"); 
		}
		else
				alert("No data received from server"); 
	};
	return response;
	*/
}


//===========================================================================================
// 				LOGIC FLOW
//-----------------------------------------------------------------------
//
//		(0)		Add window to global stack, display menubar
//
//-----------------------------------------------------------------------
var args = arguments[0] || {};
Ti.API.debug( " >>> Provide Estimate (@top) >>> "+JSON.stringify(args));
	
var park_name       = args._place_name;
var enclosure_count = args._enclosure_count;
var section_header = myUiFactory.buildSectionHeader("park_name", park_name, 2)
var call_to_action = myUiFactory.buildLabel( "How many dogs are playing here?", "100%", 50,  myUiFactory._text_label_medium );		

// backend script doesn't care if there are one or two sliders on the page
// only needs to know if place_estimate.enclosure_type is mixed, large, or small

/*   both large and small dog areas       */
var scroll_view = myUiFactory.buildScrollView('scroll_view');
scroll_view.add(section_header);
scroll_view.add(call_to_action);

/*   Mixed area, if this be the only slider  
     If a second one follows, it becomes the Large Dogs slider        */
var slider1 			= myUiFactory.buildSlider("slider1", 0, 7, '');
var slider1_label = myUiFactory.buildLabel( "0", "100%", "auto", myUiFactory._text_label_medium );
var slider1_value = myUiFactory.buildLabel( "?", "100%", "auto", myUiFactory._text_label_banner );   

if (enclosure_count==1)  
  scroll_view.add( myUiFactory.buildSectionHeader("", "Entire Area", 1) );	
else if (enclosure_count==2)  
  scroll_view.add( myUiFactory.buildSectionHeader("", "Large Dog Area", 1) );	
  
scroll_view.add(slider1);	
scroll_view.add(slider1_label);	
scroll_view.add(slider1_value);
scroll_view.add( myUiFactory.buildSpacer(20, "") );      // pass in size, color

/* And the following slider will be for Small Dogs  */
if (enclosure_count==2) {   // 
  scroll_view.add( myUiFactory.buildSeparator() );	
  scroll_view.add( myUiFactory.buildSectionHeader("", "Small Dog Area", 1) );	
  
  var slider2 			= myUiFactory.buildSlider("slider2", 0, 7, '');
  var slider2_label = myUiFactory.buildLabel( "0", "100%", "auto", myUiFactory._text_label_medium );
  var slider2_value = myUiFactory.buildLabel( "?", "100%", "auto", myUiFactory._text_label_banner ); 

  scroll_view.add(slider2_label);	
  scroll_view.add(slider2_value);
  scroll_view.add(slider2);	
  scroll_view.add( myUiFactory.buildSpacer(20, "") );      // pass in size, color
}    
/*   SLIDE EVENT LISTENERS      */
slider1.addEventListener('change', function(e){
  updateLabel(e, slider1_label, slider1_value);
});
if (enclosure_count==2) {
  slider2.addEventListener('change', function(e){
    updateLabel(e, slider2_label, slider2_value);
  });
}
  
//  add save estimate button
var save_est_btn   = myUiFactory.buildButton( "save_est_btn", "save estimate", "medium" );
scroll_view.add(save_est_btn);
$.content.add( scroll_view );

save_est_btn.addEventListener('click', function(e) {
	// var estimate = ;
	updateEstimates(args._place_ID, Math.round(slider1.value), Math.round(slider2.value) );
});


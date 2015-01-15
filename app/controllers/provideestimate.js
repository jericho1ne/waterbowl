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
		text_estimate = 'Move slider to provide estimate';
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
	
	// alert("estimate_scale values:  large dog "+value_1+" / small dog "+value_2 );
	
	var grabPlaces = Ti.Network.createHTTPClient();
	grabPlaces.open("POST", "http://waterbowl.net/mobile/set-place-estimate.php");
	
	
	var params = {
		place_ID : place_ID,
		owner_ID : MYSESSION.user.owner_ID,
		dog_ID 	 : MYSESSION.dog.dog_ID,
		value_1  : value_1,
		value_2  : value_2,
		lat:	MYSESSION.geo.lat,
		lon:	MYSESSION.geo.lon
	};
		Ti.API.log( "* Sending info to PHP " + JSON.stringify(params) );

	var response = 0;
	grabPlaces.send(params);
	grabPlaces.onload = function() {
		var json = this.responseText;
		if (json != "") {
			Ti.API.info("* checkin JSON " + json);
			var response = JSON.parse(json);
			if (response.status == 1) { 		// success
				Ti.API.log("  [>]  Estimate added successfully ");
				createSimpleDialog("Result", message);
				// close current window and bounce user to Place Overview
				closeWindowController();
			}
			else
				createSimpleDialog( "Problems Houston", response.message); 
		}
		else
			createSimpleDialog( "Server timeout", "No data received"); 
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
var args = arguments[0] || {};
Ti.API.debug( " >>> Provide Estimate (@top) >>> "+JSON.stringify(args));
	
var park_name       = args._poiInfo.name;
var enclosure_count = args._poiInfo.enclosure_count;

$.miniHeaderContainer.backgroundColor = args._poiInfo.icon_color;
$.mini_place_name_label.text		= park_name;
$.mini_place_second_label.text	=	args._poiInfo.city;  // + ' ('+ poiInfo.dist + " mi away)";

//var miniheader = myUiFactory.buildMiniHeader(park_name, , ); 
//$.sliders.add(miniheader);

//var section_header = myUiFactory.buildSectionHeader("park_name", park_name, 2)
//$.sliders.add(section_header);
var call_to_action = myUiFactory.buildLabel( "How many dogs are playing here?", "100%", 40, myUiFactory._text_medium,"center" );		

// backend script doesn't care if there are one or two sliders on the page
// only needs to know if place_estimate.enclosure_type is mixed, large, or small

$.sliders.add(call_to_action);

/*   Mixed area, if this be the only slider  
     If a second one follows, it becomes the Large Dogs slider        */


																			//  	title, width, height, font_style, text_align 
var slider1_label = myUiFactory.buildLabel( "0", "100%", "auto", myUiFactory._text_medium, "" );
var slider1_value = myUiFactory.buildLabel( "?", "100%", "auto", myUiFactory._text_banner, "" );   
var slider1 			= myUiFactory.buildSlider("slider1", 0, 7, 0);

if (enclosure_count==1)  
  $.sliders.add( myUiFactory.buildSectionHeader("", "Entire Area", 1) );	
else if (enclosure_count==2)  
  $.sliders.add( myUiFactory.buildSectionHeader("", "Large Dog Area", 1) );	

$.sliders.add( myUiFactory.buildSpacer("horz", 10) );      // pass in vert/horz, and dp size 
$.sliders.add(slider1_label);	
$.sliders.add(slider1_value);
$.sliders.add(slider1);	
$.sliders.add( myUiFactory.buildSpacer("horz", 20) );      // pass in vert/horz, and dp size


// And the following slider will be for Small Dogs 
if (enclosure_count==2) {   // 
  $.sliders.add( myUiFactory.buildSectionHeader("", "Small Dog Area", 1) );	
  
  var slider2 			= myUiFactory.buildSlider("slider2", 0, 7, 0);
  var slider2_label = myUiFactory.buildLabel( "0", "100%", "auto", myUiFactory._text_medium, "" );
  var slider2_value = myUiFactory.buildLabel( "?", "100%", "auto", myUiFactory._text_banner, "" ); 

	$.sliders.add( myUiFactory.buildSpacer("horz", 10) );      // pass in vert/horz, and dp size
  $.sliders.add(slider2_label);	
  $.sliders.add(slider2_value);
  $.sliders.add(slider2);	
  $.sliders.add(myUiFactory.buildSpacer("horz", 20));     // pass in vert/horz, and dp size
}    
//  SLIDE EVENT LISTENERS     
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
$.sliders.add(save_est_btn);
//$.content.add( $.sliders );

save_est_btn.addEventListener('click', function(e) {
	// var estimate = ;
	if (enclosure_count==1)
		updateEstimates(args._place_ID, Math.round(slider1.value), -1);
	else if (enclosure_count==2)
		updateEstimates(args._place_ID, Math.round(slider1.value), Math.round(slider2.value) );
});

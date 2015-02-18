//================================================================================
//		Name:			getPlaceEstimates( place_ID, callbackFunction )
//		Purpose:		get latest user-provided estimates
//================================================================================
function getAllEstimates( place_ID, callbackFunction ) {
	Ti.API.info("* getPlaceEstimates() called *");
	var query = Ti.Network.createHTTPClient();
	var params = {
		place_ID	: place_ID
	};
	//query.open("POST", "http://waterbowl.net/mobile/get-estimates.php");	
	query.open("POST", "http://waterbowl.net/mobile/get-place-activity-pdo.php");	
	query.send( params );
	query.onload = function() {
		var jsonResponse = this.responseText;
		
		if (jsonResponse != "" ) {
			var activity = JSON.parse( jsonResponse );
			Ti.API.debug(" OKAY WTFF " +JSON.stringify(activity) );
			callbackFunction(activity);	
		}
	};
}

//================================================================================
//		Name:			  displayAllEstimates( payload )
//		Purpose:		
//================================================================================
function displayAllEstimates(payload) {
	var estimate_list = myUiFactory.buildViewContainer("estimate_list", "vertical", "100%", Ti.UI.SIZE, 0);	
	
	if(payload.status>0) {
	  // generate table rows for each item in activity array   
	  for (var i=0, len=payload.data.length; i<len; i++) {			// optimize loop to only calculate array size once
	  	var photo_url = PROFILE_PATH + 'dog-'+payload.data[i].dog_ID+'-iconmed.jpg';	
	  	var message = "";
	  	// Create latest estimate: dog's photo, name, timestamp, and message type (checkin / estimate / etc)
	  	if (payload.data[i].activity_type=="estimate") {
	  		var message = "Saw " + payload.data[i].amount + " dogs in "+payload.data[i].enclosure_type+" Dog area";
	  		if(payload.data[i].amount == 1) 
		 	 		message	 = "Saw " + payload.data[i].amount + " dog in "+payload.data[i].enclosure_type+" Dog area";
		 	} else if (payload.data[i].activity_type=="checkin") {
		  	var message = "Decided to check in here";
		  } 
	  	var est_view = myUiFactory.buildFeedRow(payload.data[i].dog_ID, myUiFactory._icon_medium, photo_url, payload.data[i].dog_name, payload.data[i].time_elapsed.fmt_time, message);
	  	estimate_list.add(est_view);
	  	// THROW IN A SEPARATOR AFTER EACH ROW	
	  	if ( i < (len-1) )
			   estimate_list.add( myUiFactory.buildSeparator() );
	  }
  } else {		// NO ACTIVITY TO DISPLAY
  	estimate_list.add( myUiFactory.buildSingleRowInfoBar( "", "No recent information", "") );
  }
  $.scrollView.add( estimate_list );
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var args = arguments[0] || {};
var miniHeader = myUiFactory.buildMiniHeader(args._poiInfo.name, args._poiInfo.city, args._poiInfo.icon_color);
// TODO:  Add park name at top of page, text only, super large
var section_header = myUiFactory.buildSectionHeader("recent_estimates", "Recent Activity", 1);

$.scrollView.add(miniHeader);
$.scrollView.add(section_header);
getAllEstimates(args._poiInfo.place_ID, displayAllEstimates);


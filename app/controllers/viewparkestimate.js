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
	query.open("POST", "http://waterbowl.net/mobile/get-estimates.php");	
	query.send( params );
	query.onload = function() {
		var jsonResponse = this.responseText;
		if (jsonResponse != "" ) {
			var activity = JSON.parse( jsonResponse );
			callbackFunction(activity);	
		}
	};
}

//================================================================================
//		Name:			  displayAllEstimates( data )
//		Purpose:		
//================================================================================
function displayAllEstimates(data) {
  // generate table rows for each item in activity array 
  var estimate_list = myUiFactory.buildViewContainer("estimate_list", "vertical", "100%", Ti.UI.SIZE, 0);	
  for (var i=0, len=data.length; i<len; i++) {			// optimize loop to only calculate array size once
  	var photo_url = PROFILE_PATH + 'dog-'+data[i].dog_ID+'-iconmed.jpg';	
  	// Create latest estimate: dog's photo, name, timestamp, and most recent park estimate
  	var dogs_here_suffix = " dogs here in "+data[i].enclosure_type+" dog area";
  	if(data[i].amount == 1) 
	  	dogs_here_suffix = " dog here in "+data[i].enclosure_type+" dog area";
	  	
  	var enclosure = data[i].enclosure_type+" dogs"; //data[i].amount_suffix;
  	
  	var est_view = myUiFactory.buildTableRow("estimate_"+i, photo_url, data[i].dog_name, data[i].time_elapsed, data[i].amount, enclosure);
  	estimate_list.add(est_view);
  	
  	if ( i < (len-1) )
		   estimate_list.add( myUiFactory.buildSeparator() );
  }	
  $.scrollView.add( estimate_list );
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var args = arguments[0] || {};
// var estimates = args._estimates;

// TODO:  Add park name at top of page, text only, super large
var section_header = myUiFactory.buildSectionHeader("recent_estimates", "Recent Activity", 1);
$.scrollView.add(section_header);

getAllEstimates(args._place_ID, displayAllEstimates);


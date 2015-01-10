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
  	var photo_url = MYSESSION.WBnet.url_base+ '/' +MYSESSION.WBnet.bucket_profile + '/' +data[i].dog_photo;		
  
  	// Create latest estimate: dog's photo, name, timestamp, and most recent park estimate
  	var suffix = data[i].enclosure_type+" dog area"; //data[i].amount_suffix;
  	
  	var est_view = myUiFactory.buildTableRow("estimate_"+i, photo_url, data[i].dog_name, data[i].time_elapsed, data[i].amount, suffix);
  	estimate_list.add(est_view);
  	
  	var separator = myUiFactory.buildSeparator();
  	estimate_list.add(separator);
  }	
  $.scrollView.add( estimate_list );
}

var args = arguments[0] || {};
// var estimates = args._estimates;

// TODO:  Add park name at top of page, text only, super large
var section_header = myUiFactory.buildSectionHeader("recent_estimates", "Recent Estimates", 0);
$.scrollView.add(section_header);

getAllEstimates(args._place_ID, displayAllEstimates);


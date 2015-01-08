var args = arguments[0] || {};
var estimateArray = args._estimates;

// Ti.API.debug( args._estimates )

var section_header = myUiFactory.buildSectionHeader("recent_estimates", "Recent Estimates", 0);
$.scrollView.add(section_header);

// generate table rows for each item in activity array 
for (var i=0, len=estimateArray.length; i<len; i++) {			// optimize loop to only calculate array size once
	Ti.API.info("estimateArray["+i+"]:" + JSON.stringify(estimateArray[i]) ); 
	// var photo_url = MYSESSION.AWS.url_base+ '/' +MYSESSION.AWS.bucket_profile+ '/' +_estimates[i].dog_photo;
	var photo_url = MYSESSION.WBnet.url_base+ '/' +MYSESSION.WBnet.bucket_profile + '/' +estimateArray[i].dog_photo;		

	// Create latest estimate: dog's photo, name, timestamp, and most recent park estimate
	var estimate = myUiFactory.buildTableRow("estimate_"+i, photo_url, estimateArray[i].dog_name, estimateArray[i].time_elapsed, estimateArray[i].amount);
	$.scrollView.add(estimate);
	
	var separator = myUiFactory.buildSeparator();
	$.scrollView.add(separator);
}	


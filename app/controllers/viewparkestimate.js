var args = arguments[0] || {};
var estimates = args._estimates;

// Ti.API.debug( args._estimates )
// TODO:  Add park name at top of page, text only, super large
var section_header = myUiFactory.buildSectionHeader("recent_estimates", "Recent Estimates", 0);
$.scrollView.add(section_header);

// generate table rows for each item in activity array 
for (var i=0, len=estimates.length; i<len; i++) {			// optimize loop to only calculate array size once
	Ti.API.info("estimates["+i+"]:" + JSON.stringify(estimates[i]) ); 
	// var photo_url = MYSESSION.AWS.url_base+ '/' +MYSESSION.AWS.bucket_profile+ '/' +_estimates[i].dog_photo;
	var photo_url = MYSESSION.WBnet.url_base+ '/' +MYSESSION.WBnet.bucket_profile + '/' +estimates[i].dog_photo;		

	// Create latest estimate: dog's photo, name, timestamp, and most recent park estimate
	var suffix = estimates[i].enclosure_type+" dog area"; //estimates[i].amount_suffix;
	
	var est_view = myUiFactory.buildTableRow("estimate_"+i, photo_url, estimates[i].dog_name, estimates[i].time_elapsed, estimates[i].amount, suffix);
	$.scrollView.add(est_view);
	
	var separator = myUiFactory.buildSeparator();
	$.scrollView.add(separator);
}	


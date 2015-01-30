//================================================================================
//		Name:			getPlaceEstimates( place_ID, callbackFunction )
//		Purpose:		get latest user-provided estimates
//================================================================================
function getMarkOverview( original_mark) {
	Ti.API.info("* getPlaceEstimates() called *");
	var query = Ti.Network.createHTTPClient();
	var params = {
		place_type : 2,
		place_ID 	 : original_mark.ID,
		dog_ID  	 : mySesh.dog.dog_ID
	};
	//loadJson(	params, "http://waterbowl.net/mobile/get-place-posts.php",  displayMark );
	// alert( data.marking_dog_name );
	
	query.open("POST", "http://waterbowl.net/mobile/get-place-posts.php");	
	query.send( params );
	query.onload = function() {
		var jsonResponse = this.responseText;
		if (jsonResponse != "" ) {
			var data = JSON.parse( jsonResponse );
			displayMark(data, original_mark);
		}
		else {
			// TODO: pop up error message, no data received
			return "";
		}
	};
	
}

//================================================================================
//		Name:			displayMark(data) 
//		Purpose:	get original mark + remarks at this place
//================================================================================
function displayMark(data, original_mark) {
	// Ti.API.debug( "*displayRemarks ["+JSON.stringify(data)+"]" );
  // alert(JSON.stringify(original_mark));
	if( data.length>0) {	
		var last_one = data.length-1;
		
  	// (1)  Need to sort POIs based on proximity
		data.sort(function(a, b) {		// sort by proximity (closest first)
			return (b.ID - a.ID);
		});
		
		// (2)  Add original mark section header + first mark
		$.scrollView.add( myUiFactory.buildSectionHeader("mark_header", "ORIGINAL MARK", 1) );
		var photo = PROFILE_PATH + 'dog-'+data[last_one].marking_dog_ID+'-iconmed.jpg';		
 		var mark = myUiFactory.buildRowMarkSummary( "", photo, data[last_one].marking_dog_name, data[last_one].time_elapsed, data[last_one].post_text  );
		$.scrollView.add(mark);
		
		// (3)  Add the remarks section header to the parent view
		var overview_header = myUiFactory.buildSectionHeader("overview_header", "REMARKS", 1);
		$.scrollView.add(overview_header);

    // (4)  Add remark button and link it to addpost.js
		var addRemarkBtn = myUiFactory.buildButton( "addRemarkBtn", "add remark", "large" );
		$.scrollView.add(addRemarkBtn);
		var necessary_args = {   // 
			_place_ID    : original_mark.ID,
			_place_name	 : original_mark.mark_name,
			_place_city	 : original_mark.mark_city,
			_place_type  : 2
		};
		Ti.API.debug( "*displayRemarks :: necessary_args ["+JSON.stringify(necessary_args)+"]" );

 
		addRemarkBtn.addEventListener('click', function(e) {
			createWindowController( "addpost", necessary_args, "slide_left" );
		});
		// (5) parent mark is the only one, notify user
		if (data.length == 1) {
			var no_marks_container = myUiFactory.buildViewContainer("", "vertical", "100%", Ti.UI.SIZE, 0);	
			var no_marks_label = myUiFactory.buildLabel( "No remarks yet.  Be the first!", "100%", myUiFactory._icon_small + (2* myUiFactory._pad_top), myUiFactory._text_medium, "#000000", "");	
			no_marks_container.add(no_marks_label);
			$.scrollView.add(no_marks_container);
		}
		// (6) if more than just the parent mark, display all child remarks next
	  else {
			for (var i=0, len=data.length; i<(len-1); i++) {
	      var photo = PROFILE_PATH + 'dog-'+data[i].marking_dog_ID+'-iconmed.jpg';		
	      																				// (id, photo_url, photo_caption, time_stamp, description)
			  var mark = myUiFactory.buildRowMarkSummary( "", photo, data[i].marking_dog_name, data[i].time_elapsed, data[i].post_text  );
			  $.scrollView.add(mark);
			  if ( i < (len-2) )
			    $.scrollView.add( myUiFactory.buildSeparator() );
	    }
 		}
  }
  
}


//================================================================================================
var args = arguments[0] || {};
//var mark_ID =  args._mark_ID;
// predefined placeholder values until we hit the backend
var mark_title 	 = "Loading mark title...";			// mark.title
var mark_text 	 = "Loading mark text...";	// mark.text
var mark_subtext = "";							// mark.

//if(args.length>0) {
	mark_title	 = args.mark_name;
	mark_text		 = args.mark_city;
	mark_subtext = args.dist+" miles away";

	var header_size = mySesh.device.screenwidth;
	
	// if(marks.length > 0)
	
	// try Ti.UI.SIZE for height for the veritcal containers  // also width = 100 or Ti.UI.SIZE
	var headerContainer = myUiFactory.buildViewContainer("headerContainer", "vertical", Ti.UI.SIZE, header_size, -30);	
	
	var headerTop     = myUiFactory.buildViewContainer("headerTop", "horizontal", "100%", "40%", 0);	
	var headerBottom  = myUiFactory.buildViewContainer("headerBottom", "vertical", "100%", Ti.UI.SIZE, 0);	
	var headerStatBar = myUiFactory.buildViewContainer("headerStatBar", "horizontal", "100%", 20, 0);	
				
	var mark_title_label	 = myUiFactory.buildLabel(mark_title, "100%", 30, myUiFactory._text_large, "#000000", "left");
	var mark_text_label 	 = myUiFactory.buildLabel(mark_text, "100%", 30, myUiFactory._text_medium, "#000000", "left");	
	var mark_subtext_label = myUiFactory.buildLabel(mark_subtext, "100%", 30, myUiFactory._text_medium, "#000000", "left");			
	
	headerBottom.add(mark_title_label);
	headerBottom.add(mark_text_label);
	headerBottom.add(mark_subtext_label);
	
	headerContainer.add(headerTop);
	headerContainer.add(headerBottom);
	
	$.scrollView.add(headerContainer);
	
	var bg_image = MISSING_PATH + "mark-0-banner.jpg";
	headerContainer.backgroundImage = bg_image;
	
	getMarkOverview(args);
//} else {
//	createSimpleDialog("No data", "Back we go to the map view");
//	closeWindowController();
//}

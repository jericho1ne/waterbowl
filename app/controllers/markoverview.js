/*************************************************************************
						markoverview.js  				
*************************************************************************/
//	Waterbowl App
//	
//	Created by Mihai Peteu Oct 2015
//	(c) 2015 waterbowl
//

//================================================================================
//		Name:			getMarkOverview( original_mark )
//		Purpose:	
//================================================================================
function getMarkOverview( original_mark ) {
	Ti.API.info("* getMarkOverview() called *");
	var query = Ti.Network.createHTTPClient();
	var params = {
		place_type : 2,
		place_ID 	 : original_mark.ID,
		dog_ID  	 : mySesh.dog.dog_ID
	};
	query.open("POST", "http://waterbowl.net/mobile/get-place-posts.php");	
	query.send( params );
	query.onload = function() {
		var jsonResponse = this.responseText;
		if (jsonResponse != "" ) {
			var data = JSON.parse( jsonResponse );
			displayRemarks(data);
		} else {
			createSimpleDialog("No data received", "Cannot get Marks from database");// TODO: pop up error message, no data received
		}
	};
}

//================================================================================
//		Name:			displayRemarks(data) 
//		Purpose:	get original mark + remarks at this place
//================================================================================
function displayRemarks(data) {
	// Ti.API.debug( "*displayRemarks ["+JSON.stringify(data)+"]" );
	removeAllChildren($.remarks);	
  	// Ti.API.debug( ">>>>>>> displayRemarks :: " + JSON.stringify(data) );
	if( data.length>0) {	
		var last_one = data.length-1;
		
  		// (1)  Need to sort POIs based on proximity
		data.sort(function(a, b) {		// sort by proximity (closest first)
			return (b.ID - a.ID);
		});
		
		// (2)  Add original mark section header + first mark
		$.remarks.add( myUiFactory.buildSectionHeader("mark_header", "ORIGINAL MARK", 1) );
		var photo = PROFILE_PATH + 'dog-'+data[last_one].marking_dog_ID+'-iconmed.jpg';		
 		var original_mark = myUiFactory.buildFeedRow( data[last_one].marking_dog_ID, myUiFactory._icon_large, photo, data[last_one].marking_dog_name, data[last_one].time_elapsed, data[last_one].post_text );		
		$.remarks.add(original_mark);
		
		// (3)  Add the remarks section header to the parent view
		var overview_header = myUiFactory.buildSectionHeader("overview_header", "REMARKS", 1);
		$.remarks.add(overview_header);

	    // (4)  Add remark button and link it to addpost.js
		var remarkBtnContainer = myUiFactory.buildViewContainer ( "", "", "100%", Ti.UI.SIZE, 0, myUiFactory._color_ltblue ); 
		var addRemarkBtn = myUiFactory.buildButton( "addRemarkBtn", "add remark", "large" );
		remarkBtnContainer.add(addRemarkBtn);
		$.remarks.add(remarkBtnContainer);
		
		var necessary_args = {   // 
			_place_ID    : data[last_one].mark_ID,
			_place_name	 : args.mark_name,
			_place_city	 : args.mark_city,
			_place_bgcolor : "#f1d523",
			_place_type  : 2
		};
		addRemarkBtn.addEventListener('click', function(e) {
			Ti.API.debug( ".... [+] addRemarkBtn :: necessary_args ["+JSON.stringify(necessary_args)+"]" );
			createWindowController( "addpost", necessary_args, "slide_left" );
		});
		// (5) parent mark is the only one, notify user
		if (data.length == 1) {
			var no_marks_container = myUiFactory.buildViewContainer("", "vertical", "100%", Ti.UI.SIZE, 0, myUiFactory._color_ltblue);	
			var no_marks_label = myUiFactory.buildLabel( "No remarks yet.  Be the first!", "100%", myUiFactory._icon_small + (2* myUiFactory._pad_top), myUiFactory._text_medium, "#000000", myUiFactory._color_ltblue, "", 0);	
			no_marks_container.add(no_marks_label);
			$.remarks.add(no_marks_container);
		}
		// (6) if more than just the parent mark, display all child remarks next
		else {
			for (var i=0, len=data.length; i<(len-1); i++) {
	    		var photo = PROFILE_PATH + 'dog-'+data[i].marking_dog_ID+'-iconmed.jpg';		
				var mark = myUiFactory.buildFeedRow ( "mark_"+i, myUiFactory._icon_medium, photo, data[i].marking_dog_name, data[i].time_elapsed, data[i].post_text );
				$.remarks.add(mark);
			  	if ( i < (len-2) )
			    	$.remarks.add( myUiFactory.buildSeparator() );
	    	}
 		}
	}
}

//================================================================================================
var args = arguments[0] || {};

// predefined placeholder values until we hit the backend
var mark_title 	 = "Loading mark title...";			
var mark_text 	 = "Loading mark text...";	
var mark_subtext = "";							  

mark_title	 	= args.mark_name;
mark_text		= args.mark_city;
mark_subtext 	= args.dist+" miles away";

$.header.add( myUiFactory.buildPageHeader(args.ID, "mark", mark_title, mark_text, mark_subtext, "") );
// (1) 	getMarkOverview gets the mark info from mark_common
// (2) 	then it calls getRemarks, which populates the table below original mark

$.markoverview.addEventListener('focus',function(e){
	Ti.API.debug ("  .... [~] Place overview in focus, refreshing marks now.");
	getMarkOverview(args);
});


	

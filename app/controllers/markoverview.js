//================================================================================================
var args = arguments[0] || {};

//getAllEstimates(args._place_ID, displayAllEstimates);

var header_size = MYSESSION.device.screenwidth;

mark_title 	 = "Pull this from database!";
mark_text 	 = "Lorem Ipsum Dollar SOmething";
mark_subtext = "Playa Del Rey OR ";

// try Ti.UI.SIZE for height for the veritcal containers  // also width = 100 or Ti.UI.SIZE
var headerContainer = myUiFactory.buildViewContainer("headerContainer", "vertical", Ti.UI.SIZE, header_size, -30);	

var headerTop     = myUiFactory.buildViewContainer("headerTop", "horizontal", "100%", 100, 0);	
var headerBottom  = myUiFactory.buildViewContainer("headerBottom", "vertical", "100%", Ti.UI.SIZE, 0);	
var headerStatBar = myUiFactory.buildViewContainer("headerStatBar", "horizontal", "100%", 20, 0);	

				
var mark_title_label	 = myUiFactory.buildLabel(mark_title, "100%", 30, myUiFactory._text_large, "left");
var mark_text_label 	 = myUiFactory.buildLabel(mark_text, "100%", 30, myUiFactory._text_medium, "left");	
var mark_subtext_label = myUiFactory.buildLabel(mark_subtext, "100%", 30, myUiFactory._text_medium, "left");			

headerBottom.add(mark_title_label);
headerBottom.add(mark_text_label);
headerBottom.add(mark_subtext_label);

headerContainer.add(headerTop);
headerContainer.add(headerBottom);

$.scrollView.add(headerContainer);

var bg_image = "images/missing/mark-0-banner.jpg";
headerContainer.backgroundImage = bg_image;

var mark_overview_header = myUiFactory.buildSectionHeader("mark_overview_header", "Mark Detail", 1);
$.scrollView.add(mark_overview_header);
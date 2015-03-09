/* 
	1. Parks/Outdoors			Brown			"#986d4f"
	2. Stores (Retail)		Green			"#34b44a"
	3. Vets								Red				"#ee3d3b"
	4. Boarding/Dogsit		Blue			"#9a52a0"
	5. Pet Care Services 	Purple		"#9a52a0"
	6. Food/Restaurant		Orange		"#f5851f"
	7. General						Gray			"#787578"
	
	X. Pee Mark 										"#f1d523"
*/

function UiFactory(){
 	/*		DEBUG MODE!		(Adds borders to stuff)		*/
 	//this._debug = 1;
   
  	/*		SPACING & PADDING				*/
  	this._spacer_size = 4;
  	this._pad_left  = 6;
  	this._pad_right = 6;
  	this._pad_top   = 6;

  	/*		DEVICE SCREEN WIDTH & HEIGHT			*/
 	this._device = { 
		screenwidth  : Ti.Platform.displayCaps.platformWidth,
		screenheight : Ti.Platform.displayCaps.platformHeight
	};

	/*   COLORS									*/
  	this._color_white  = "#ffffff";
  	this._color_black  = "#000000";
  	this._color_ltblue = "#dcf1fc";
  	this._color_dkblue = "#58c6d5";	
  	this._color_ltgray = "#cccccc"; 	// "#bab9b9";
  	this._color_dkgray = "#525252";
  	this._color_dkpink = "#ec3c95";
  	this._color_ltpink = "#f7bdd7";
   
  	/*   TEXT																												*/
  	this._base_font = 14;			// medium(28pt), large(36pt)

  	this._text_banner		= { fontFamily: 'Raleway', 			fontSize: 3.000 * this._base_font, color: "#ffffff" };	// large banners
  	this._text_xl			= { fontFamily: 'Raleway-Medium',	fontSize: 2.000 * this._base_font };	// 36 pt
 	this._text_large		= { fontFamily: 'Raleway-Bold', 	fontSize: 1.285 * this._base_font };	// 36 pt
  	this._text_medium		= { fontFamily: 'Raleway-Medium',	fontSize: this._base_font }; 	// 28 pt
  	this._text_medium_bold= { fontFamily: 'Raleway-Bold',		fontSize: this._base_font }; 	// 28 pt
  
	this._text_small  	= { fontFamily: 'Raleway', fontSize: 0.900 * this._base_font };
	this._text_tiny   	= { fontFamily: 'Raleway', fontSize: 0.650 * this._base_font };		// timestamps and small labels
	
	/* 	Numbers											*/
	this._number_large 	= { fontFamily: 'Futura-Medium', fontSize: 1.500 * this._base_font };
	this._number_medium = { fontFamily: 'Futura-Medium', fontSize: 0.900 * this._base_font };
	this._number_small	= { fontFamily: 'Futura-Medium', fontSize: 0.750 * this._base_font };
	this._number_tiny 	= { fontFamily: 'Futura-Medium', fontSize: 0.600 * this._base_font };
		
	/*  HEIGHTS & WIDTHS	 */	
	this._height_row   		 = 45;				// 90	// 60px/pt? (medium), 90px/pt? (large)
	this._height_header 	 = 0.66667 * this._height_row ;			// 30px/pt? (small)
	this._height_subheader = 0.5 * this._height_row ;
	
	this._form_width  	= this._device.screenwidth - (2*this._pad_right) - (2*this._pad_left);;
	this._button_width  = 200;
	
	/*  IMAGES AND ICONS      */
	this._base_icon_size = 30;
	this._icon_xsmall  = 0.8 * this._base_icon_size;
	this._icon_small  = 1.000 * this._base_icon_size;		//  30x30 px equivalent
	this._icon_medium = 1.333 * this._base_icon_size;		//  40x40 px equivalent, base size
	this._icon_large  = 2.333 * this._base_icon_size;		//  70x70 px equivalent
};

/*******************************************************************************************************************
*		Name:  		buildViewContainer ( id, layout_orientation, view_width, view_height, top, bg_color [optional] )
*		Purpose:  create dark gray section title/divider
*******************************************************************************************************************/
UiFactory.prototype.buildViewContainer = function(id, layout_orientation, view_width, view_height, top, bg_color) {
	if ( isset(bg_color) && bg_color!="" ) {
		var view_container = Ti.UI.createView( { 
			//borderColor 	: this._color_ltpink, 	borderWidth	: 1, 	
			id			: id, 
			layout		: layout_orientation,
			top			: top,  
			width		: view_width,
			height 		: view_height,
			backgroundColor : bg_color
		});
	}
	else {
		var view_container = Ti.UI.createView( { 
			//borderColor 	: this._color_ltpink, 	borderWidth	: 1, 
			id			: id, 
			layout		: layout_orientation,
			top			: top,  
			width		: view_width,
			height 		: view_height
		});
	}
	return view_container;
};

/*************************************************************************************************
*		Name:  		buildLabel ( title, width, height, font_style, font_color, bg_color, text_align, horz_pad) )  
*											     eg: value, width, font_style, text_or_number (affects font used)
*		Purpose:  	create a label given 
**************************************************************************************************/
UiFactory.prototype.buildLabel = function(title, width, height, font_style, font_color, bg_color, text_align, horz_pad) {
	var align =  Ti.UI.TEXT_ALIGNMENT_CENTER;
	var background_color = "";
	
	if (bg_color!=="")
		background_color = bg_color;

	if (text_align=="left") {
		align = Ti.UI.TEXT_ALIGNMENT_LEFT;		
	}
	else if (text_align=="right") {
		align = Ti.UI.TEXT_ALIGNMENT_RIGHT;
	}
	else {
		align =  Ti.UI.TEXT_ALIGNMENT_CENTER;
	}

	if (text_align=="center") {
		var label = Ti.UI.createLabel( {	
			//borderColor : "#000000", borderWidth	: 1, 
			text 			: title,
			font			: font_style,
			backgroundColor : background_color,
			width			: width,
			height 			: height,
			color			: font_color,
			textAlign		: align
		});
	} else if (text_align=="left") {
		var label = Ti.UI.createLabel( {	
			//borderColor : "#000000", borderWidth	: 1, 
			text 			: title,
			font			: font_style,
			backgroundColor : background_color,
			width			: width,
			height 			: height,
			left  			: horz_pad,
			color			: font_color,
			textAlign		: align
		});
	} else {
		var label = Ti.UI.createLabel( {	
			//borderColor : "#000000", borderWidth	: 1, 
			text 			: title,
			font			: font_style,
			backgroundColor : background_color,
			width			: width,
			height 			: height,
			right 			: horz_pad,		// DONT DO IT IT"LL FUCK THINGS UP
			color			: font_color,
			textAlign		: align
		});
	}
	return label;
}

/************************************************************
*		Name:  		buildSpacer ( orientation, size, bg_color [optional] ) 
*		Purpose:  horizontal rule lookalike
************************************************************/
UiFactory.prototype.buildSpacer = function( orientation, size, bg_color ){
	var width = '100%';
	var height = 10;
	var background_color = this._color_ltblue;
	if (bg_color=="clear")
		background_color = "";

	if (size=="")
		size = this._spacer_size;
	
	if (orientation=="vert") {
		width = size;
		height = Ti.UI.SIZE;
	}
	else if (orientation=="horz") {
		width = Ti.UI.SIZE;
		height = size;
	}
	
	var spacer = Ti.UI.createView({
 		width	: width,
		height	: height,
    	top		: 0,
    	left    : 0, 
    	backgroundColor : background_color
 	});
 	return spacer;
}

/*****************************************************************************************
*	Name: 		buildProgressBar ( msg_text ) 
*	Purpose:  	build a photo upload progress bar that updates while data is sent to server
*******************************************************************************************/
UiFactory.prototype.buildProgressBar = function(msg_text) {
	//var progBarContainer = this.buildViewContainer( "", "horizontal", this._device.screenwidth, 80, 0, );
	var height = 40;

	return Titanium.UI.createProgressBar({
		width 		: this._form_width,
		height 		: height,
		min 		: 0,
		max 		: 1,
		value 		: 0,
		style 		: Titanium.UI.iPhone.ProgressBarStyle.PLAIN,
		top 		: 4,
		message 	: msg_text,
		opacity     : 0.85,
		font 		: this._text_medium,
		color 		: this._color_dkpink,
		backgroundColor : "#000000",
		borderRadius : height/4
	});
	//progBarContainer.add(progressBar);
	//return progBarContainer;
}

/******************************************************************************************
*	Name: 		buildPageHeader ( view_id, type, txt_title, txt_1, txt_2, txt_3 ) 
*	Purpose:  	build top of page profile; type = ("mark", "profile", "poi")
*******************************************************************************************/
UiFactory.prototype.buildPageHeader = function(id, type, txt_title, txt_1, txt_2, txt_3, statBar) {
	// width and height of parent object == this._device.screenwidth
	//Ti.API.info( "  .... [i] statBar :: " + JSON.stringify(statBar) );
	var headerContainer = this.buildViewContainer("headerContainer_"+id, "vertical", this._device.screenwidth, this._device.screenwidth, 0, "");
	var leftPad = 2*this._pad_left;
	var labelWidth = this._device.screenwidth - 2*leftPad;
	
	// determine heights of child containers
	var h_statbar_height	= this._icon_xsmall + this._pad_top;
	var h_info_height 		= (3*this._height_header);
	var	h_top_height		= this._device.screenwidth - h_info_height - h_statbar_height;  
	
	var headerTop 			= this.buildViewContainer("headerTop_"+id, 	"vertical", 	this._device.screenwidth, h_top_height, 0, "");		// blank div
	var headerInfo 			= this.buildViewContainer("headerInfo_"+id, "vertical", 	this._device.screenwidth, h_info_height, 0, "");
	// headerInfo.left     	= this._pad_left;
	
	// header stat bar should be separate function
	var headerStatBar = this.buildViewContainer("headerStatBar", "horizontal", "100%", h_statbar_height, 0, "");	
	
	var statBarContainer = this.buildViewContainer("headerStatBar", "horizontal", this._form_width, this._icon_small, 0, "");	
	if(isset(statBar)) {
		var mainScope = this;
		statBar.forEach(function(stat) {
			if(stat.amount=="")
				stat.amount = "N/A";
			//Ti.API.info( " >>>>>>>> forEach ICON  :: " + stat.icon );
			//Ti.API.info( " >>>>>>>> forEach STAT :: " + stat.amount );
	    	var image = mainScope.buildIcon("", stat.icon, "xsmall"); 
	    	// 									title, 		 width, 	 height, font_style, 		font_color, bg_color, text_align, horz_pad
			var label = mainScope.buildLabel(stat.amount, Ti.UI.SIZE, "100%", mainScope._number_medium, "#ffffff", "", "left", "");	
			image.top = 0;
			image.left = mainScope._pad_left;
			label.top = -2;
			statBarContainer.add(image);
			statBarContainer.add(mainScope.buildSpacer("vert", 4, "clear"));
			statBarContainer.add(label);
			statBarContainer.add(mainScope.buildSpacer("vert", 10, "clear"));
	  	});
	}
	

	statBarContainer.left = leftPad;
	statBarContainer.top = 3;

	headerStatBar.add(statBarContainer);
	headerStatBar.backgroundColor = "#333333";
	headerStatBar.opacity = 0.95;
	headerStatBar.bottom = 0;


	var title_label	 	= this.buildLabel(txt_title,labelWidth, 24, this._text_large,  "#ffffff", "", "left", "");
	var text_label 	 	= this.buildLabel(txt_1,	labelWidth, 18, this._text_medium, "#ffffff", "", "left", "");	
	var subtext1_label 	= this.buildLabel(txt_2,	labelWidth, Ti.UI.SIZE, this._text_medium, "#ffffff", "", "left", "");
	if(txt_3!=null || txt_3!="")	
		var subtext2_label = this.buildLabel(txt_3, labelWidth, Ti.UI.SIZE, this._text_medium, "#ffffff", "", "left", "");	
			
	headerInfo.backgroundImage = "images/ui/header-overlay-black.png";

	//  use gray waterbowl icon (POI placeholder) as default banner image  
	var img_placeholder = ""; 
	var img_actual   	  = "";
	
	if (type == "profile")	{
		img_placeholder = MISSING_PATH + "dog-0-banner.jpg";
		img_actual   	= PROFILE_PATH + "dog-"+ id +"-banner.jpg";
	}
	else if (type == "mark") { 
		img_placeholder = MISSING_PATH + "mark-0-banner.jpg";
		img_actual   	= MARK_PATH 	 + "mark-"+ id +"-banner.jpg";
	}
	else  { //  (type == "poi") {
		img_placeholder = MISSING_PATH + "poi-0-banner.jpg";
		img_actual   	= POI_PATH 		 + "poi-"+ id +"-banner.jpg";
	}
	
	loadRemoteImage("bg", headerContainer, img_actual, img_placeholder);   // pass in actual + fallback image
	// TODO: MAKES SURE bg_image IS NOT BLANK / SET TIME OUT / PROMISE ??
	// headerContainer.backgroundImage = img_placeholder;
	
	// center content column, leave padding on both sides
	var headerContent = this.buildViewContainer("hRight", "vertical", labelWidth, Ti.UI.SIZE, 0, "");	
	headerContent.add( this.buildSpacer("horz", this._pad_top, "clear") );
	headerContent.add(title_label);
	headerContent.add(text_label);
	headerContent.add(subtext1_label);
	if(txt_3!=null || txt_3!="")	
		headerContent.add(subtext2_label);
	
	// add right column
	headerInfo.add(headerContent);

	// blank top space
	headerContainer.add(headerTop);
	// all the text content
	headerContainer.add(headerInfo);
	// statistics bar
	headerContainer.add(headerStatBar);
	return headerContainer;
}

/***********************************************************************************
*		Name:  		buildHeaderContainer ( place_name, city, bg_color )  
*		Purpose:    finish this mon!
************************************************************************************/
UiFactory.prototype.buildHeaderContainer = function(place_name, city, bg_color) {
	var view_container = this.buildViewContainer ( "", "horizontal", "100%", 60, 0, bg_color ); 
	
	view_container.add( this.buildSpacer("vert", this._pad_left) );
	
	var column_right = Ti.UI.createView( {
		layout			: "vertical",
		backgroundColor : bg_color, 
		// borderColor     : ((this._debug == 1) ? this._color_dkpink : ''), borderWidth			: ((this._debug == 1) ? 1 : ''), 
		top				: this._pad_top,  
		width			: "100%",
		height 			: "100%"
	});
	
	column_right.add( this.buildSpacer("horz", "10%") );
	column_right.add( this.buildLabel(place_name, "100%", "40%", this._text_large, "#000000", "", "left", "" ) );
	column_right.add( this.buildLabel(city, "100%", "50%", this._text_medium, "#000000", "", "left", "") );
	
	view_container.add(column_right);
	
	return view_container;
}


/************************************************************
*		Name:  		buildProfileThumb ( id, image, border, size ) 
*		Purpose:  build image thumbnails
*		Notes:	  border: 0=others, 1=me, 2=friends
************************************************************/
UiFactory.prototype.buildProfileThumb = function(id, image, border, size){
	var borderColor = "";
	var borderWidth = 0;
	var img_placeholder = MISSING_PATH + 'dog-0-iconmed.jpg';
	//Ti.API.info( "  .... [~] buildProfileThumb image :: [ " + image + " ]" );
	if (border==1) {
		borderColor = this._color_dkpink;
		borderWidth = 2;
	} else if (border==2) {
		borderColor = this._color_dkblue;
		borderWidth = 2;
	}
	var profile_img = Ti.UI.createImageView({ 
		id				: id, 
		image   		: img_placeholder,
		width			: size,
		height			: size,
		backgroundColor : this._color_ltgray,
		left			: this._pad_left,
		top				: this._pad_top,
		borderColor		: borderColor,
		borderRadius	: size/2,
		borderWidth		: borderWidth
	});
	loadRemoteImage( "fg", profile_img, image, img_placeholder );
	profile_img.addEventListener('click', function(){ showProfile(id)} );
	return profile_img; 
	
	/*
	var profileBtn 		= Ti.UI.createButton({
		id							: id,	 
		backgroundImage : image,
		width						: size,
		height					: size,
		backgroundColor : this._color_ltgray,
		left						: this._pad_left,
		top							: this._pad_top,
		borderColor			: borderColor,
		borderRadius 		: size/2,
		borderWidth			: borderWidth
	});
	profileBtn.addEventListener('click', function(){ showProfile(id)} );
	return profileBtn;	
	*/
}

/************************************************************
*		Name:  		buildIcon ( id, image, size ) 
*		Purpose:  build icons baby
************************************************************/
UiFactory.prototype.buildIcon = function(id, image, size){
	if(image=="")
		image = 'images/missing/WB-Icon-Placeholder.png';
	
	if (size === parseInt(size, 10))	icon_size = parseInt(size);
	else if (size == "xsmall")		icon_size = this._icon_xsmall;
	else if (size == "small")		icon_size = this._icon_small;		//	small 
	else if (size == "medium")	icon_size = this._icon_medium; 	//	medium (base size)
	else if (size == "large")		icon_size = this._icon_large;		//	large
	else												icon_size = this._icon_medium;	//	default to medium 
			
	var image_view = Ti.UI.createImageView({ 
		id							: id, 
		image   				: image,
		height					: icon_size,
		width					  : icon_size,
		//backgroundColor : this._color_ltgray,
		left						: this._pad_left,
		right						: 2,
		top							: 7.5
	});
	return image_view;
}

/***********************************************************************************
*		Name:  		buildSlider (  )  
*		Purpose:  
************************************************************************************/
UiFactory.prototype.buildSlider = function(id, min_value, max_value, start_value, bg_color) {
	if (start_value=="" && start_value!=0) {
     	start_value = Math.round( (max_value - min_value) / 2 );
	}

  	return Ti.UI.createSlider( { 
	    id      : id, 
	    width   : this._form_width, 
	    height  : "auto", 
	    top     : 6,
	    opacity : 0.7,  
	    min     : min_value, 
	    max     : max_value, 
	    value   : start_value,
	    borderRadius    : 14, 
	    backgroundColor : bg_color
  	});
}


/***********************************************************************************
*		Name:  		buildMiniHeader ( place_name, city, bg_color )  
*		Purpose:  
************************************************************************************/
UiFactory.prototype.buildMiniHeader = function(place_name, subtitle, bg_color) {
	var miniHeader 				= this.buildViewContainer("", "vertical", "100%", this._icon_small+(3*this._pad_top), 0);	
	miniHeader.backgroundColor 	= bg_color;		
											//	 ( title, 		width, height, 				font_style, font_color, bg_color, text_align, horz_pad
	var name_label				= this.buildLabel( place_name, "100%", this._height_header, this._text_large, "#ffffff", "center", 0 );
	var subtitle_label			= this.buildLabel( subtitle, "100%", this._height_header, this._text_medium, "#ffffff", "center", 0 );	
	name_label.top 				= 0;
	subtitle_label.top 			= -14;
	miniHeader.add(name_label);
	miniHeader.add(subtitle_label);
	return miniHeader;
}

/***********************************************************************************
*		Name:  		buildTextArea ( title, hint_text )  
*		Purpose:  
************************************************************************************/
UiFactory.prototype.buildTextArea = function( hint_text, height ) {
	//var textAreaView = this.buildViewContainer("", "vertical", "100%", Ti.UI.SIZE, 0);	
	var text_area_width = this._device.screenwidth-(4*this._pad_left);
	var textArea = Ti.UI.createTextArea({
		id				: "actual_text_area",
	  	color			: '#888888',
	  	textAlign		: 'left',
	 	value			: hint_text,
	  	left			: 2*this._pad_left,
	  	width			: text_area_width, 
	  	height 			: height,
	  	font 			: { fontFamily: 'Raleway-Medium', fontSize: 14 },
	  	keyboardType    : Titanium.UI.KEYBOARD_DEFAULT,
	 	returnKeyType   : Titanium.UI.RETURNKEY_DEFAULT
	});
	return textArea;
}

/*

.. +---+ +------------------+  ..
.. | T | |   L1   |   L2    |  ..
.. +---+ +------------------+  ..

*/
/***********************************************************************************
*		Name:  		buildSingleRowInfoBar ( image_url, name, value )  
*		Purpose:  generic single row bar with photo or icon / thing name  / thing value
************************************************************************************/
UiFactory.prototype.buildSingleRowInfoBar = function(image_url, name, value) {
	var div_height 		= this._icon_small + (2* this._pad_top); 	
	var col_1_width 	= this._icon_medium;
	var spacer_width 	= 2 * this._pad_left;
	// if both L and R labels are not blank, subtract the extra padding amount. 
	// always subtract padding before 
	var col_2_width = this._device.screenwidth - col_1_width - (3*spacer_width);
	
	var view_container 	= this.buildViewContainer ( "", "horizontal", this._device.screenwidth, div_height, 0, this._color_ltblue); 
  
  	var column_1 = this.buildViewContainer ( "column_1", "", 			col_1_width, div_height, 0, "" ); 
  	var column_2 = this.buildViewContainer ( "column_2", "horizontal", 	col_2_width, div_height, 0, "" );
  	
  	if (image_url!="") {
  		var image = this.buildIcon("", image_url, "small"); 
		column_1.add(image);
  	}

	if (name!="") {						// title, width, height, font_style, font_color, bg_color, text_align, horz_pad
		var name_label  = this.buildLabel( name, Ti.UI.SIZE, "100%", this._text_medium, "#000000", this._color_ltblue, "left", 0);
		column_2.add( this.buildSpacer( "vert", (0.5*spacer_width), "clear") );
		column_2.add(name_label);
		//column_2.add( this.buildSpacer( "vert", 2, "clear") );
	}
	if (value_label!="") {
		//Ti.API.info( "  .... [i] buildSingleRowInfoBar :: "+ name + " " + value);
		var value_label = this.buildLabel( value, Ti.UI.SIZE, "100%", this._text_medium_bold, "#000000", this._color_ltblue, "left", 0 );
		column_2.add( this.buildSpacer( "vert", (0.5*spacer_width), "clear") );
		column_2.add(value_label);
	}
	// add spacer to pad beginning and end of row
	view_container.add( this.buildSpacer( "vert", spacer_width, "clear") );
	view_container.add(column_1);
	view_container.add(column_2);
  	view_container.add( this.buildSpacer( "vert", spacer_width, "clear") );

  	return view_container;
}

/***********************************************************************************
*		Name:  		buildMultiRowInfoBar ( image_url, name, value )  
*		Purpose:  generic single row bar with photo or icon / thing name  / thing value
************************************************************************************/
UiFactory.prototype.buildMultiRowInfoBar = function(image_url, text_content) {
	// iphone 5s		~528 pixels available for text label / 40 chars per line = 13.2 px / char
	// iphone 6			~? pixels available for text label / 40 chars per line = 13 px / char

	// calculate thumbnail and text content view widths
	var col_1_width = this._icon_medium;
	var spacer_width = 2 * this._pad_left;
	var col_2_width = this._device.screenwidth - col_1_width - (2*spacer_width);
	  
	// if text is two lines or less
	var min_div_height  = this._icon_small + (2*this._pad_top);
	var div_height 		= ( ( Math.round( text_content.length / (col_2_width / 9) ) ) * 13) + (2*this._pad_top);
	
	if (min_div_height > div_height)	
		div_height = min_div_height;
		
	// done with math on dimensions, now build the parent container
		 								//         id, layout_orientation, view_width, view_height, top, bg_color
	var view_container = this.buildViewContainer ( "", "horizontal", this._device.screenwidth, div_height, 0, this._color_ltblue); 
	// semi-square smaller left icon column, multi-row text on the right
	var column_1 = this.buildViewContainer ( "column_1", "", col_1_width, this._icon_medium+this._pad_top, 0, "" ); 
	var column_2 = this.buildViewContainer ( "column_2", "horizontal", col_2_width, Ti.UI.SIZE, 0, "" );
	column_1.left = 2*this._pad_left;

	if (image_url!="") {
		var image = this.buildIcon("", image_url, "small"); 
		column_1.add(image);
	}
	//column_2.add( this.buildSpacer( "vert", 10, "clear" ) );
		
	var text_box = this.buildLabel( text_content, col_2_width-(2*this._pad_right), Ti.UI.FILL, this._text_medium, "#000000", this._color_ltblue, "left", this._pad_left);
	//	column_2.add( this.buildSpacer( "vert", 2, "clear" ) );
	column_2.add(text_box);

	view_container.add(column_1);
	view_container.add(column_2);
	return view_container;
}

/*
	+=== buildFeedRow ========================+
	|	 column_1        column_2             | 
	|  +-thumb--+ +--_row_1----------------+  |
	|  |        | |   name	  |	timestamp  |  |
	|  |  dog   | +--_row_2----------------+  |
	|  | photo  | |   description		   |  |		
	|  +--------+ +------------------------+  |		
	+=========================================+  
 */
/****************************************************************************************************************
*	Name:  		buildFeedRow ( id, thumb_size, photo_url, photo_caption, time_stamp, description ) 
*	Purpose:  	modified format for feed items (marks, estimates, etc)
*   Used by:  	Marks display, etc
****************************************************************************************************************/
UiFactory.prototype.buildFeedRow = function(id, thumb_size, photo_url, photo_caption, time_stamp, description) {
  	//Ti.API.debug( ">>>>> buildFeedRow time_stamp:"+ time_stamp); 
 	var row1_height = this._height_header; 
  	var row2_height = thumb_size - this._pad_top;
	// DETERMINE VIEW CONTAINER WIDTHS
	var pad_left = 2*this._pad_left;
	var pad_right = 2*this._pad_right;
  	var column_1_width 	= Math.floor( thumb_size + pad_left );		
	var column_2_width 	= Math.floor( this._device.screenwidth - column_1_width );
	var name_width		= Math.floor(0.6 * column_2_width);

	var timestamp_width = Math.floor(0.4 * column_2_width)-pad_right;
	var multiline_row2_height = Math.round(description.length / (column_2_width / 13.3) * 11)+this._pad_top;
	
	//Ti.API.info( "  .... [i] this._device.screenwidth :: "+this._device.screenwidth );
	//Ti.API.info( "  .... [i] col1 col2 name ts :: "+column_1_width+','+column_2_width+','+name_width+','+timestamp_width );
	
  	if (multiline_row2_height > row2_height) {
 		row2_height = multiline_row2_height;
	}
	var total_height = row1_height + row2_height;
		
  	// BUILD VIEWS  							   id,     orientation  	view_width      view_height  top)
	var view_container = this.buildViewContainer ( "feedRow_"+id, "horizontal", "100%", total_height, 0, "" ); 
  
	var column_1 = this.buildViewContainer ( "col_1", "horizontal", column_1_width, total_height,  0, this._color_ltblue ); 
	var column_2 = this.buildViewContainer ( "col_2", "vertical", 	column_2_width, total_height,  0, this._color_ltblue );
		
	var dog_photo = this.buildProfileThumb(id, photo_url, 0, thumb_size);			// pass along thumb size that was sent in
	dog_photo.left = pad_left;
	column_1.add(dog_photo);
		
	// COLUMN 2 :: BUILD NAME + TIMESTAMP CONTAINER
	var column_2_row_1 		= this.buildViewContainer ( "", "horizontal", "100%", row1_height, 0, this._color_ltblue ); 
	var dog_name_label  	= this.buildLabel( photo_caption, name_width, row1_height, this._text_medium_bold, "#000000", this._color_ltblue, "left", this._pad_left );		
	var time_stamp_label	= this.buildLabel( time_stamp, 	  timestamp_width, 	row1_height, this._text_medium,  "#000000", this._color_ltblue, "right", 0);
	// COLUMN 2 :: BUILD DESCRIPTION CONTAINER
	var column_2_row_2 		= this.buildViewContainer ( "", "horizontal", column_2_width, row2_height, 0, this._color_ltblue );
	var description_label 	= this.buildLabel( description, column_2_width-pad_left, row2_height, this._text_medium, "#000000", this._color_ltblue, "left", this._pad_left );
	
	// ADJUST VERTICAL SPACING
	//dog_name_label.top = 2;
	//description_label.top = -4;
	
	// ADD ALL CONTAINERS TO PARENT OBJECT
	column_2_row_1.add(dog_name_label);
	column_2_row_1.add(time_stamp_label);
	column_2_row_2.add(description_label);
	
	column_2.add(column_2_row_1);
	column_2.add(column_2_row_2);
	view_container.add(column_1);
	view_container.add(column_2);
	return view_container;
};

//
	// +=== buildEstimateHeader =================+
	// |  +-thumb-+ +- col_one -+ +- col_two -+  |
	// |  |       | |           | |           |  |
	// |  |       | |           | |           |  |		
	// |  +-------+ +-----------+ +-----------+  |		
	// +=========================================+
/*********************************************************************************************************************
*		Name:  		buildEstimateHeader ( id, photo_url, photo_caption, time_stamp, amount, amount_suffix )  
*             eg: photo_url, dog name, timestamp, amount, amount suffix
*		Purpose:  
*********************************************************************************************************************/
UiFactory.prototype.buildEstimateHeader = function(id, photo_url, photo_caption, time_stamp, amount, amount_suffix) {
  	var div_height 		= this._icon_large + (2*this._pad_top);
  	var photo_width 	= this._icon_large + (3*this._pad_left);
  	var middle_width 	= 0.6 * (this._device.screenwidth - photo_width);
  	var right_width 	= 0.4 * (this._device.screenwidth - photo_width);
	
	var view_container = this.buildViewContainer ( "rowHeader_"+id, "horizontal", "100%", div_height, 0, this._color_ltblue ); 
   
	// all labels below will be 100% of the parent view
 	var column_1 = this.buildViewContainer ( "", "vertical", photo_width, div_height, 0, this._color_ltblue ); 
	var dog_photo = this.buildProfileThumb(id, photo_url, 0, this._icon_large);
	dog_photo.left = 2*this._pad_left;
	column_1.add(dog_photo);
	
	var column_2 = this.buildViewContainer ( "", "vertical", middle_width, div_height, 0, this._color_ltblue ); 
	//var column_2_row_1 = this.buildViewContainer ( "", "vertical", "100%", div_height, 0 ); 

	var dog_name_label   		= this.buildLabel( photo_caption, "98%", "49%", this._text_medium_bold, "#000000", "", "left", this._pad_left );		
	var time_stamp_label 		= this.buildLabel( time_stamp,  	"98%", "49%", this._text_medium, "#000000", "", "left", this._pad_left);
	//
	column_2.add(dog_name_label);
	column_2.add(time_stamp_label);

	column_2.add( this.buildSpacer("vert", this._pad_left, "clear") );
	//column_2.add(column_2_row_1);
	
	var column_3 = this.buildViewContainer ( "", "vertical", right_width, div_height, 0, this._color_ltblue  ); 
												// (title, width, height, font_style, font_color, bg_color, text_align, horz_pad)
  	var amount_label 		 = this.buildLabel( amount, 	 "100%", "49%", this._number_large, "#000000", "", "", "");   // number!
	var amount_suffix_label	 = this.buildLabel( amount_suffix, "100%", "49%", this._text_medium, "#000000", "", "", "" );
	column_3.add(amount_label);
	column_3.add(amount_suffix_label);
	
	view_container.add(column_1);
	view_container.add(column_2);
	view_container.add(column_3);
	return view_container;
};


/***********************************************************************
*		Name:  		getDefaultRowHeight()
*		Purpose:  calling Window needs to know what to set view height to
************************************************************************/
UiFactory.prototype.getDefaultRowHeight = function() {
	return this._height_row;
};


/************************************************************
*		Name:  		buildScrollView () 
*		Purpose:  
************************************************************/
UiFactory.prototype.buildScrollView = function(id){ 
  	return Ti.UI.createScrollView( {
    	id               : id,
    	backgroundColor  : this._color_ltblue,
		layout           : 'vertical', 
		width						 : Ti.UI.SIZE,
		contentHeight    : 'auto',
		showVerticalScrollIndicator: "true",
		showHorizontalScrollIndicator: "true" } 
	);
}
/***********************************************************************
*		Name:  		getDefaultThumbSize()
*		Purpose:  
************************************************************************/
UiFactory.prototype.getDefaultThumbSize = function() {
	return this._icon_medium;
};

/************************************************************
*		Name:  		buildSeparator () 
*		Purpose:  horizontal rule lookalike
************************************************************/
UiFactory.prototype.buildSeparator = function(){
	var separator = Ti.UI.createView({
 		backgroundColor : this._color_ltgray,
 		width			: Ti.UI.FILL,
		height			: 1,
   	 	bottom			: 0,
    	top				: 0
 	});
 	return separator;
}

/*********************************************************************************
*		Name:  		buildSectionHeader ( view_id, title, size={0,1,2} )
*							size 0 = sub-section, 1 = miniheader, 2 = lg banner  
*		Purpose:  create dark section title/divider
*********************************************************************************/
UiFactory.prototype.buildSectionHeader = function(view_id, title, size) {
	// create the parent view, set bg color
	// default is size=0, smaller subsection header
	//Ti.API.debug( " >>> SECTION HEADER >>> id, title, size [ "+ view_id+", "+title+", "+size+" ]");
	
	/*  sub section header      */
	var label_text_color= this._color_black;
	var view_bg_color 	= this._color_ltblue;
	var font 			= this._text_medium;
	var view_height		= this._height_header;
	
	/*  ADD/CREATE dk pink section header  */
	if (size == 0) {        
	  label_text_color	= this._color_white;
		view_bg_color	= this._color_dkpink;
		font            = this._text_medium_bold;
	}
	/*  DISPLAY dk blue section header  */
	else if (size == 1) {        
	  label_text_color	= this._color_white;
		view_bg_color   = this._color_dkblue;
		font            = this._text_medium_bold;
	}
	/*  supa large banner      */
	else if (size == 2) {  
		label_text_color= this._color_black;
		view_bg_color 	= this._color_ltblue;
		font            = this._text_large;
	}
	else if (size == 3) {  			// Subheader, slimmest one possible
		label_text_color= this._color_black;
		view_bg_color 	= this._color_ltgray;
		font            = this._text_medium;
		view_height		= this._height_subheader;
	}

	var view_container = Ti.UI.createView( { 
		id				: view_id, 
		backgroundColor : view_bg_color, 
		height			: view_height,
		width  			: Ti.UI.FILL
	});
	// build a sexy label
	var section_label = Ti.UI.createLabel( {	
		id		: view_id+"_label", 
		text	: title,
		left  	: 2*this._pad_left,
		height  : Ti.UI.SIZE,     
		font	: font,
		color	: label_text_color
	});
	// if subsection, also add an HR separator above
	if(size==0)
		view_container.add( this.buildSeparator() );
	// place the label inside the parent view
	view_container.add(section_label);
	return view_container;
};

/*********************************************************************************
*		Name:  		buildMasterSectionHeader ( view_id, title )				 
*		Purpose:  WHAT IT DO
*********************************************************************************/
UiFactory.prototype.buildMasterSectionHeader = function(view_id, title) {
	var view_container = Ti.UI.createView( { 
		id							: view_id, 
		backgroundColor : this._color_dkblue, 
		height			   	: this._height_row
	});
	var section_label = Ti.UI.createLabel( {	
		id				: view_id+"_label", 
		text			: title,
		textAlign : Ti.UI.TEXT_ALIGNMENT_CENTER,
		height		: Ti.UI.SIZE,     
		font			: this._text_large,
		color			: this._color_white
	});	
	view_container.add(section_label);
	return view_container;	
}

/************************************************************
*		Name:  		buildTextField ( id, width, hint, is_pwd )
*		Purpose:  create small test button
************************************************************/
UiFactory.prototype.buildTextField = function(id, width, hint, is_pwd) {
	if (width=="")
		width = this._device.screenwidth - this._pad_right - this._pad_left;
		
  var text_field = Ti.UI.createTextField( {
  	id              : id,
  	backgroundColor : "#ffffff", 
    color           : this._color_dkgray, 
    width           : width, 
    height          : this._height_row, 
    top             : this._pad_top, 
    paddingLeft		: 16,
    opacity         : 1,
  	font            : this._text_medium,
  	keyboardType    : Titanium.UI.KEYBOARD_DEFAULT,
  	returnKeyType   : Titanium.UI.RETURNKEY_DEFAULT,
  	textAlign       : Ti.UI.TEXT_ALIGNMENT_LEFT,
  	hintText        : hint,
  	passwordMask    : is_pwd,
    autocorrect     : false,
    autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE
  } );
  return text_field;
}

/************************************************************
*		Name:  		buildButton ( btn_ID, btn_title, type )
*		Purpose:  create small test button
************************************************************/
UiFactory.prototype.buildButton = function(id, title, type) {
	// defaults (small button)
	var view_height 	= this._icon_medium+10;
	var btn_height 	= 34; // this._icon_medium;
	var btn_width 	= this._button_width;
	var font   		= this._text_small;

	if (type == "header") { 
	    font   = this._text_large;
	}
	else if (type == "large") {  
	    font   = this._text_large;
	}
	else if (type == "medium") {
	    font   = this._text_medium;
	}
	else if (type == "xl") {
	    font   = this._text_xl;
	    btn_height += 10;
	}
	else if (type == "xxl") {
		font   = this._text_xl;
	    btn_height += 10;
	    btn_width = this._form_width;
	}

	var borderRadius = btn_height/6;
 
  	var view_container = Ti.UI.createView( { 
		id				: id, 
		layout			: "",
		backgroundColor : "none", 
		// borderColor  : ((this._debug == 1) ? this._color_ltpink : ''), borderWidth			: ((this._debug == 1) ? 1 : ''), 
		width			: "100%",
		height 			: view_height
	});
	var button = Ti.UI.createButton( {
		id				: id+"_btn",	 
		title			: title, 
		color			: this._color_white, 
		backgroundColor : this._color_dkpink, 
		font			: font, 
		textAlign       : Ti.UI.TEXT_ALIGNMENT_CENTER,
 	 	width			: btn_width, 
		height			: btn_height, 
		opacity         : 1,
		borderRadius	: borderRadius,
		// borderColor    : "#ffffff", borderWidth     : 2
	} );
	view_container.add(button);
	return view_container;
}

//===========================================================================================
//	Name:		 	createColorBlock (block_bg_color)
//	Purpose:		simple nearby place list ui element
//===========================================================================================
UiFactory.prototype.createColorBlock = function(bg_color, icon_basic) {
	var temp_view = Ti.UI.createView({
		width : this._icon_small, height : this._icon_small, top:0, left : 6, 
		//backgroundColor : bg_color, borderRadius: 2,
		 zIndex : 20
	});
	// this.buildIcon( "", ICON_PATH+icon_basic, small );
	temp_view.add( this.buildIcon( "", ICON_PATH+icon_basic, 18 ) );
	// temp_view.add(place_label);
	return temp_view;
}

/************************************************************
*		Name:  		buildFullRowButton ( btn_ID, btn_title )
*		Purpose:  create small test button
************************************************************/
UiFactory.prototype.buildFullRowButton = function(id, title) {
  var view_container = this.buildViewContainer ( "", "horizontal", "100%", this._height_header, 0, this._color_ltblue ); 
  view_container.add( this.buildSeparator() );
  var column_1 = this.buildViewContainer ( "", "", "49%", this._height_header, 6, this._color_ltblue ); 
  var column_2 = this.buildViewContainer ( "", "", "50%", this._height_header, 6, this._color_ltblue );
	
	var button = Ti.UI.createButton( {
		id				: id,	 
		title			: title, 
		color			: this._color_dkpink, 
		backgroundColor : this._color_ltblue, 
		font			: this._text_medium_bold, 
		textAlign       : "right",
		width			: "100%", 
		right			: this._pad_right,				
	} );
	
	column_2.add(button);
	view_container.add(column_1);
	view_container.add(column_2);
	return view_container;
}

/************************************************************
*		Name:  		buildNameLabel (id, title)
*		Purpose:  default dog name label and styling
************************************************************/
UiFactory.prototype.buildNameLabel = function(id, title) {	
	var label = Ti.UI.createLabel( {	
		id		: id, 
		text	: title,
		font	: this._text_medium,
		color	: this._color_black,
		height: "auto", 
		width : "auto", 
		left  : this._pad_left 
	});
	return label;
}

 
//finally, export the module
//you MUST export it in this manner, not using methods.export = !
exports.UiFactory = UiFactory;
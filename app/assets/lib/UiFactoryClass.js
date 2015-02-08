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
 	this._debug = 0;
   
  /*		SPACING & PADDING				*/
  this._spacer_size = 4;
  this._pad_left  = 7.5;
  this._pad_right = 7.5;
  this._pad_top   = 7.5;

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
  this._color_ltgray = "#cccccc"; // "#bab9b9";
  this._color_dkgray = "#525252";
  this._color_dkpink = "#ec3c95";
  this._color_ltpink = "#feaaff";
   
  /*   TEXT																												*/
  this._base_font = 14;			// medium(28pt), large(36pt)

  this._text_banner			 	= { fontFamily: 'Raleway', 				fontSize: 3.000 * this._base_font, color: "#ffffff" };	// large banners
  this._text_large				= { fontFamily: 'Raleway-Bold', 	fontSize: 1.285 * this._base_font };	// 36 pt
  this._text_medium				= { fontFamily: 'Raleway-Medium',	fontSize: this._base_font }; 	// 28 pt
  this._text_medium_bold	= { fontFamily: 'Raleway-Bold',		fontSize: this._base_font }; 	// 28 pt
  
	this._text_small  			= { fontFamily: 'Raleway', 				fontSize: 0.900 * this._base_font };
	this._text_tiny   			= { fontFamily: 'Raleway', 				fontSize: 0.650 * this._base_font };		// timestamps and small labels
	
	/* 	Numbers											*/
	this._number_large 			= { fontFamily: 'Futura-Medium', fontSize: 1.500 * this._base_font };
	this._number_medium 		= { fontFamily: 'Futura-Medium', fontSize: 0.900 * this._base_font };
	this._number_small			= { fontFamily: 'Futura-Medium', fontSize: 0.750 * this._base_font };
	this._number_tiny 			= { fontFamily: 'Futura-Medium', fontSize: 0.600 * this._base_font };
		
	/*  HEIGHTS & WIDTHS	 */	
	this._height_row   		 = 45;				// 90	// 60px/pt? (medium), 90px/pt? (large)
	this._height_header 	 = 0.66667 * this._height_row ;			// 30px/pt? (small)
	this._height_subheader = 0.5 * this._height_row ;
	
	this._form_width  	= "70%";
	this._button_width  = 200;
	
	/*  IMAGES AND ICONS      */
	this._base_icon_size = 30;
	this._icon_small  = 1.000 * this._base_icon_size;		//  30x30 px equivalent
	this._icon_medium = 1.333 * this._base_icon_size;		//  40x40 px equivalent, base size
	this._icon_large  = 2.333 * this._base_icon_size;		//  70x70 px equivalent
};

/************************************************************
*		Name:  		buildViewContainer ( id, layout_orientation, view_width, view_height, top )
*		Purpose:  create dark gray section title/divider
************************************************************/
UiFactory.prototype.buildViewContainer = function(id, layout_orientation, view_width, view_height, top) {
	// create the parent view
	var view_container = Ti.UI.createView( { 
		id							: id, 
		layout					: layout_orientation,
		//backgroundColor : this._color_ltblue, 
		//borderColor     : ((this._debug == 1) ? this._color_ltpink : ''), borderWidth	: ((this._debug == 1) ? 1 : ''), 	
		top							: top,  
		width						: view_width,
		height 					: view_height
	});
	return view_container;
};

/*************************************************************************************************
*		Name:  		buildLabel ( title, width, height, font_style, font_color, text_align )  
*											     eg: value, width, font_style, text_or_number (affects font used)
*		Purpose:  create a label given 
**************************************************************************************************/
UiFactory.prototype.buildLabel = function(title, width, height, font_style, font_color, text_align) {
	var left_pad = 0;
	var align =  Ti.UI.TEXT_ALIGNMENT_CENTER;
	
	if (text_align=="left") {
		align =  Ti.UI.TEXT_ALIGNMENT_LEFT;
		left_pad = this._pad_left;
	}
	else if (text_align=="right")
		align =  Ti.UI.TEXT_ALIGNMENT_RIGHT;
	else
		align =  Ti.UI.TEXT_ALIGNMENT_CENTER;
		
	var label = Ti.UI.createLabel( {	
		//id	: something+"_label", 
		text	: title,
		font	:	font_style,
		width	: width,
		height: height,
		left  : left_pad,
		color	: font_color,
		//top		: 0,
		// borderColor : ((this._debug == 1) ? this._color_black : ''), borderWidth	: ((this._debug == 1) ? 1 : ''), 
		textAlign		: align
	});
	return label;
}

/*****************************************************************
*		Name:  		buildPageHeader ( view_id, type, txt_title, txt_1, txt_2, txt_3 ) 
*		Purpose:  build top of page profile, mark or place headers
*							type can be:  "mark", "profile", "poi"
*****************************************************************/
UiFactory.prototype.buildPageHeader = function(id, type, txt_title, txt_1, txt_2, txt_3) {
	// width and height of parent object == this._device.screenwidth
	var headerContainer = this.buildViewContainer("headerContainer_"+id, "vertical", this._device.screenwidth, this._device.screenwidth, 0);
	
	var label_width = this._device.screenwidth - this._pad_right;
	
	// determine heights of child containers
	var h_statbar_height= this._icon_small + this._pad_top;
	var h_info_height 	= (3*this._height_header);
	var	h_top_height		= this._device.screenwidth - h_info_height - h_statbar_height;  
	
	var headerTop 			= this.buildViewContainer("headerTop_"+id, 	"vertical", 	this._device.screenwidth, h_top_height, 0);		// blank div
	var headerInfo 			= this.buildViewContainer("headerInfo_"+id, "vertical", 	this._device.screenwidth, h_info_height, 0);
	
	// header stat bar should be separate function
	var headerStatBar 	= this.buildViewContainer("headerStatBar", 	"horizontal", "100%", h_statbar_height, 0);	
	headerStatBar.backgroundColor = "#222222";
	headerStatBar.bottom = 0;
	
	var title_label	 = myUiFactory.buildLabel(txt_title, label_width, 24, this._text_large,  "#ffffff", "left");
	var text_label 	 = myUiFactory.buildLabel(txt_1,	 	 label_width, 18, this._text_medium, "#ffffff", "left");	
	var subtext1_label = myUiFactory.buildLabel(txt_2, 	 label_width, Ti.UI.SIZE, this._text_medium, "#ffffff", "left");
	
	if(txt_3!=null || txt_3!="")	
		var subtext2_label = myUiFactory.buildLabel(txt_3, 	 label_width, Ti.UI.SIZE, this._text_medium, "#ffffff", "left");	
			
	headerInfo.backgroundImage = "images/ui/header-overlay-black.png";

	//  use gray waterbowl icon (POI placeholder) as default banner image  
	var img_placeholder = ""; 
	var img_actual   	  = "";
	
	if (type == "profile")	{
		img_placeholder = MISSING_PATH + "dog-0-banner.jpg";
		img_actual   	  = PROFILE_PATH + "dog-"+ id +"-banner.jpg";
	}
	else if (type == "mark") { 
		img_placeholder = MISSING_PATH + "mark-0-banner.jpg";
		img_actual   	  = MARK_PATH 	 + "mark-"+ id +"-banner.jpg";
	}
	else  { //  (type == "poi") {
		img_placeholder = MISSING_PATH + "poi-0-banner.jpg";
	  img_actual   	  = POI_PATH 		 + "poi-"+ id +"-banner.jpg";
	}
	
	loadRemoteImage("bg", headerContainer, img_actual, img_placeholder);   // pass in actual + fallback image
	// TODO: MAKES SURE bg_image IS NOT BLANK / SET TIME OUT / PROMISE ??
	// headerContainer.backgroundImage = img_placeholder;
		
	headerInfo.add( this.buildSpacer("horz", this._pad_top) );
	headerInfo.add(title_label);
	headerInfo.add(text_label);
	headerInfo.add(subtext1_label);
	if(txt_3!=null || txt_3!="")	
		headerInfo.add(subtext2_label);
	
	headerContainer.add(headerTop);
	headerContainer.add(headerInfo);
	headerContainer.add(headerStatBar);
	return headerContainer;
}

/***********************************************************************************
*		Name:  		buildHeaderContainer ( place_name, city, bg_color )  
*		Purpose:  TODO: finish this mon!
************************************************************************************/
UiFactory.prototype.buildHeaderContainer = function(place_name, city, bg_color) {
	var view_container = this.buildViewContainer ( "", "horizontal", "100%", 60, 0 ); 
	
	
	view_container.add( this.buildSpacer("vert", this._pad_left) );
	
	var column_right = Ti.UI.createView( {
		layout					: "vertical",
		backgroundColor : bg_color, 
		// borderColor     : ((this._debug == 1) ? this._color_dkpink : ''), borderWidth			: ((this._debug == 1) ? 1 : ''), 
		top							: this._pad_top,  
		width						: "100%",
		height 					: "100%"
	});
	
	column_right.add( this.buildSpacer("horz", "10%") );
	column_right.add( this.buildLabel(place_name, "100%", "40%", this._text_large, "#000000", "left") );
	column_right.add( this.buildLabel(city, "100%", "50%", this._text_medium, "#000000", "left") );
	
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
	var img_placeholder = 'images/missing/WB-PetProfilePic-Placeholder.png';
	
	// if(image=="")	image = 'images/missing/WB-PetProfilePic-Placeholder.png';
	var borderWidth = 0;
			
	if (border==1) {
		borderColor = this._color_dkpink;
		borderWidth = 2;
	}
	else if (border==2) {
		borderColor = this._color_dkblue;
		borderWidth = 2;
	}
	
	/*
	var image_view = Ti.UI.createImageView({ 
		id							: id, 
		image   				: image,
		width					  : icon_size,
		height					: icon_size,
		backgroundColor : this._color_ltgray,
		left						: this._pad_left,
		top							: this._pad_left,
		borderColor			: borderColor,
		borderRadius		: icon_size/2,
		borderWidth			: borderWidth
	});
	return image_view; */
	 
	var profileBtn 		= Ti.UI.createButton( {
		id							: id,	 
		backgroundImage : (remoteFileExists(image) ? image : img_placeholder),
		width						: size,
		height					: size,
		backgroundColor : this._color_ltgray,
		left						: myUiFactory._pad_left,
		top							: myUiFactory._pad_top,
		borderColor			: borderColor,
		borderRadius 		: size/2,
		borderWidth			: borderWidth
	} );
	
	// loadRemoteImage("bg", profileBtn, image, img_placeholder);
	profileBtn.addEventListener('click', function(){ showProfile(id)} );
	return profileBtn;
}

/************************************************************
*		Name:  		buildIcon ( id, image, size ) 
*		Purpose:  build icons baby
************************************************************/
UiFactory.prototype.buildIcon = function(id, image, size){
	if(image=="")
		image = 'images/missing/WB-Icon-Placeholder.png';
	
	if (size === parseInt(size, 10))	icon_size = parseInt(size);
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
UiFactory.prototype.buildSlider = function(id, min_value, max_value, start_value) {
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
    backgroundColor : ''
  });
}


/***********************************************************************************
*		Name:  		buildMiniHeader ( place_name, city, bg_color )  
*		Purpose:  
************************************************************************************/
UiFactory.prototype.buildMiniHeader = function(place_name, subtitle, bg_color) {
	var miniHeader = this.buildViewContainer("", "vertical", "100%", this._icon_small+(2*this._pad_top), 0);	
	miniHeader.backgroundColor = bg_color;
	var name_label			= this.buildLabel( place_name, "100%", this._height_header, this._text_large, "#ffffff", "center" );
	var subtitle_label	= this.buildLabel( subtitle, "100%", this._height_header, this._text_medium, "#ffffff", "center" );	
	name_label.top = 0;
	subtitle_label.top = -14;
	miniHeader.add(name_label);
	miniHeader.add(subtitle_label);
	return miniHeader;
}

/***********************************************************************************
*		Name:  		buildTextArea ( title, hint_text )  
*		Purpose:  
************************************************************************************/
UiFactory.prototype.buildTextArea = function( hint_text ) {
	//var textAreaView = this.buildViewContainer("", "vertical", "100%", Ti.UI.SIZE, 0);	
	var text_area_width = this._device.screenwidth-(2*this._pad_left);
	var textArea = Ti.UI.createTextArea({
		id						: "actual_text_area",
	  borderWidth		: 1,
	  borderColor		: '#bbbbbb',
	  borderRadius	: 5,
	  color					: '#888888',
	  textAlign			: 'left',
	  value					: hint_text,
	  left					: this._pad_left,
	  width					: text_area_width, 
	  height 				: 90,
	  font: { fontFamily: 'Raleway-Medium', fontSize: 14 },
	  keyboardType    : Titanium.UI.KEYBOARD_DEFAULT,
	 	returnKeyType   : Titanium.UI.RETURNKEY_DEFAULT
	});
	return textArea;
}


/***********************************************************************************
*		Name:  		buildSingleRowInfoBar ( image_url, name, value )  
*		Purpose:  generic single row bar with photo or icon / thing name  / thing value
************************************************************************************/
UiFactory.prototype.buildSingleRowInfoBar = function(image_url, name, value) {
  var div_height = this._icon_small + (2* this._pad_top); // this._height_row-10;
	var view_container = this.buildViewContainer ( "", "horizontal", "100%", div_height, 0 ); 
  
  var column_1 = this.buildViewContainer ( "column_1", "", this._icon_medium+this._pad_left, div_height, 0 ); 
  if (image_url!="") {
  	var image = this.buildIcon("", image_url, "small"); 
		column_1.add(image);
  }
  var column_2 = this.buildViewContainer ( "column_2", "horizontal", Ti.UI.FILL, div_height, 0 );
  //column_2.add( this.buildSpacer( "vert", 10 ) );
	
	if (name!="") {
		var name_label  = this.buildLabel( name, Ti.UI.SIZE, "100%", this._text_medium, "#000000", "left");
		column_2.add(name_label);
		column_2.add( this.buildSpacer( "vert", 2 ) );
	}
	if (value_label!="") {
		var value_label = this.buildLabel( value, Ti.UI.SIZE, "100%", this._text_medium_bold, "#000000", "left" );
  	column_2.add(value_label);
	}
	view_container.add(column_1);
	view_container.add(column_2);
  return view_container;
}

/***********************************************************************************
*		Name:  		buildMultiRowInfoBar ( image_url, name, value )  
*		Purpose:  generic single row bar with photo or icon / thing name  / thing value
************************************************************************************/
UiFactory.prototype.buildMultiRowInfoBar = function(image_url, text_content) {
  // iphone 5s		~528 pixels available for text label / 40 chars per line = 13.2 px / char
  // iphone 6			~? pixels available for text label / 40 chars per line = 13 px / char
  // iphone 6+		~? pixels available for text label / 40 chars per line = 13 px / char
  
 	// calculate thumbnail and text content view widths
  var col_1_w = Math.floor(this._icon_medium+this._pad_left);
  var col_2_w = Math.floor(this._device.screenwidth - col_1_w);
  
  // if text is two lines or less
  var div_height = Math.floor(this._icon_medium + this._pad_top);
 	// if text is longer than 2 lines, perform dynamic div height calculation;  assumes each character is ~13px wide
 	if (text_content.length > 78) {
 		div_height = Math.floor( (text_content.length / (col_2_w / 13) ) * 10)+this._pad_top;
	}
	var view_container = this.buildViewContainer ( "", "horizontal", "100%", div_height, 0 ); 
  
  var column_1 = this.buildViewContainer ( "column_1", "", 					 col_1_w, this._icon_medium+this._pad_top, 0 ); 
	var column_2 = this.buildViewContainer ( "column_2", "horizontal", col_2_w, Ti.UI.SIZE, 0 );

  if (image_url!="") {
  	var image = this.buildIcon("", image_url, "small"); 
		column_1.add(image);
  }
   //column_2.add( this.buildSpacer( "vert", 10 ) );
	
	var text_box = this.buildLabel( text_content, col_2_w-(2*this._pad_right), "100%", this._text_medium, "#000000", "left");
	//	column_2.add( this.buildSpacer( "vert", 2 ) );
	column_2.add(text_box);

	view_container.add(column_1);
	view_container.add(column_2);
  return view_container;
}

/*
				  +=== buildFeedRow ========================+
				  |	 column_1        column_2               | 
				  |  +-thumb--+ +--_row_1----------------+  |
				  |  |        | |   name	  	timestamp  |  |
				  |  |  dog   | +--_row_2----------------+  |
				  |  | photo  | |   description			     |  |		
				  |  +--------+ +------------------------+  |		
				  +=========================================+  
 */
/****************************************************************************************************************
*		Name:  		buildFeedRow ( id, thumb_size, photo_url, photo_caption, time_stamp, description ) 
*		Purpose:  modified format for feed items (marks, estimates, etc)
*   Used by:  Marks display, etc
****************************************************************************************************************/
UiFactory.prototype.buildFeedRow = function(id, thumb_size, photo_url, photo_caption, time_stamp, description) {
  //Ti.API.debug( ">>>>> buildFeedRow time_stamp:"+ time_stamp); 
  var row1_height = this._height_header; 
  var row2_height = thumb_size - this._pad_top;
	// DETERMINE VIEW CONTAINER WIDTHS
  var column_1_width 	= Math.floor( thumb_size + this._pad_left + this._pad_right );		
	var column_2_width 	= Math.floor( this._device.screenwidth - column_1_width );
	var col_2_name_width= Math.floor( (0.55 * column_2_width)-this._pad_left );
	var col_2_ts_width  = Math.floor( (0.45 * column_2_width)-this._pad_left );

	var multiline_row2_height = Math.round(description.length / (column_2_width / 13.3) * 11)+this._pad_top;
	
  if (multiline_row2_height > row2_height) {
 		row2_height = multiline_row2_height;
	}
	var total_height = row1_height + row2_height;
	
	/*
	Ti.API.info("SCREEN SIZE :: "+this._device.screenwidth +"x"+this._device.screenheight);
	Ti.API.info("COLUMNS :: C1="+column_1_width +" C2="+column_2_width+"[ "+col_2_name_width+","+col_2_ts_width+" ]");
	Ti.API.info("ROW HEIGHTS [1 / 2 / TOTAL] :: [ "+row1_height+" / "+row2_height+" / "+total_height+" ]");
	*/	
  // BUILD VIEWS (COLUMN 3 is a spacer)    id,     orientation  	view_width      view_height  top)
	var view_container = this.buildViewContainer ( "feedRow_"+id, "horizontal", "100%", total_height, 0 ); 
  
	var column_1 = this.buildViewContainer ( "col_1", "horizontal", column_1_width, total_height,  0 ); 
	var column_2 = this.buildViewContainer ( "col_2", "vertical", 	column_2_width, total_height,  0 );
		
	var dog_photo = this.buildProfileThumb(id, photo_url, 0, thumb_size);			// pass along thumb size that was sent in
	column_1.add(dog_photo);
		
	// COLUMN 2 :: BUILD NAME + TIMESTAMP CONTAINER
	var column_2_row_1 		= this.buildViewContainer ( "", "horizontal", "100%", row1_height, 0 ); 
	var dog_name_label  	= this.buildLabel( photo_caption, col_2_name_width, row1_height, this._text_medium_bold, "#000000", "left" );		
	var time_stamp_label	= this.buildLabel( time_stamp, 		col_2_ts_width, 	row1_height, this._text_medium, 			  "#000000", "right");
	// COLUMN 2 :: BUILD DESCRIPTION CONTAINER
	var column_2_row_2 		= this.buildViewContainer ( "", "horizontal", column_2_width, row2_height, 0 );
	var description_label = this.buildLabel( description, column_2_width-(2*this._pad_right), row2_height, this._text_medium, "#000000", "left" );
	
	// ADJUST VERTICAL SPACING
	dog_name_label.top = 2;
	description_label.top = -4;
	
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
	// +=== buildTableRowHeader =================+
	// |  +-thumb-+ +- col_one -+ +- col_two -+  |
	// |  |       | |           | |           |  |
	// |  |       | |           | |           |  |		
	// |  +-------+ +-----------+ +-----------+  |		
	// +=========================================+
/*********************************************************************************************************************
*		Name:  		buildTableRowHeader ( id, photo_url, photo_caption, time_stamp, amount, amount_suffix )  
*             eg: photo_url, dog name, timestamp, amount, amount suffix
*		Purpose:  
*********************************************************************************************************************/
UiFactory.prototype.buildTableRowHeader = function(id, photo_url, photo_caption, time_stamp, amount, amount_suffix) {
  var div_height 		= this._icon_large + (2*this._pad_top);
  var photo_width 	= this._icon_large + (2*this._pad_left);
  var middle_width 	= 0.5 * (this._device.screenwidth - photo_width);
  var right_width 	= 0.5 * (this._device.screenwidth - photo_width);
	
	var view_container = this.buildViewContainer ( "rowHeader_"+id, "horizontal", "100%", div_height, 0 ); 
   
	// all labels below will be 100% of the parent view
  var column_1 = this.buildViewContainer ( "", "vertical", photo_width, div_height, 0 ); 
	var dog_photo = this.buildProfileThumb(id, photo_url, 0, this._icon_large);
	column_1.add(dog_photo);
	
	var column_2 = this.buildViewContainer ( "", "vertical", middle_width, div_height, 0 ); 
	//var column_2_row_1 = this.buildViewContainer ( "", "vertical", "100%", div_height, 0 ); 

	var dog_name_label   		= this.buildLabel( photo_caption,  	"100%", "49%", this._text_medium_bold, "#000000", "left" );		
	var time_stamp_label 		= this.buildLabel( time_stamp,  	"100%", "49%", this._text_tiny, "#000000", "left");
	//
	column_2.add(dog_name_label);
	column_2.add(time_stamp_label);

	column_2.add( this.buildSpacer("vert", this._pad_left) );
	//column_2.add(column_2_row_1);
	
	var column_3 = this.buildViewContainer ( "", "vertical", right_width, div_height, 0 ); 
  var amount_label 		 		= this.buildLabel( amount, 		  	"100%", "49%", this._number_large, "#000000", "" );   // number!
	var amount_suffix_label = this.buildLabel( amount_suffix, "100%", "49%", this._text_medium, "#000000", "" );
	column_3.add(amount_label);
	column_3.add(amount_suffix_label);
	
	view_container.add(column_1);
	view_container.add(column_2);
	view_container.add(column_3);
	return view_container;
};


/****************************************************************************
*		Name:  		buildRowMarkSummary ( id, left, middle, right )  eg: photo_url, dog name, timestamp, amount, amount description
*		Purpose:  modified format for feed items (marks, estimates, etc)
*   Used by:  Marks display, etc
***************************************************••••••••••••••••••••••*********/
/*UiFactory.prototype.buildRowMarkSummary = function(id, photo_url, photo_caption, time_stamp, description) {
  var div_height = this._icon_large + (2*this._pad_top);
	var view_container = this.buildViewContainer ( id, "horizontal", "100%", div_height, 0 ); 

  // DETERMINE VIEW CONTAINER WIDTHS
	var column_1_width = this._icon_large + (2*this._pad_left);
	var column_2_width = this._device.screenwidth - column_1_width - this._pad_right;
  
	var column_1 = this.buildViewContainer ( "col_1", "horizontal",	column_1_width, div_height, 0 ); 
	var column_2 = this.buildViewContainer ( "col_2", "vertical", column_2_width, div_height, 0 );
		
	var dog_photo = this.buildProfileThumb("last_updated_by_photo", photo_url, 0, "large");
	column_1.add(dog_photo);
	view_container.add(column_1);
	
	// all labels below will be 100% of the parent view (column_2)
	
	var col_2_row_1 			= this.buildViewContainer ( "", "horizontal", "100%", "30%", 0 ); 
	var dog_name_label  	= this.buildLabel( photo_caption, "50%", "100%", this._text_medium_bold, "#000000", "left" );		
	var time_stamp_label	= this.buildLabel( time_stamp,  "50%", "100%", this._text_tiny, "#000000", "right");
	col_2_row_1.add(dog_name_label);
	col_2_row_1.add(time_stamp_label);
	
	var col_2_row_2 = this.buildViewContainer ( "row_two", "horizontal", "100%", "70%", 0 );
	var textarea 		= this.buildLabel( description, "100%", "100%", this._text_medium, "#000000", "left" );
	col_2_row_2.add(textarea);
	col_2_row_2.add(this.buildSpacer("horz", this._pad_right));
  column_2.add(col_2_row_1);
	column_2.add(col_2_row_2);
	
	view_container.add(column_2);
	return view_container;
}; */


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
 		width		: '98%',
		height	: 1,
    bottom	: 0,
    top			: 0
 	});
 	return separator;
}
    
/************************************************************
*		Name:  		buildSpacer ( orientation, size[optional] ) 
*		Purpose:  horizontal rule lookalike
************************************************************/
UiFactory.prototype.buildSpacer = function(  orientation, size ){
	var width = '100%';
	var height = 10;
	var bg_color = '';
	
	if (this._debug)
		bg_color = this._color_white;
		
	if (size=="")
		size = this._spacer_size;
	
	if (orientation=="vert") {
		width = size;
		height = "100%";
	}
	else if (orientation=="horz") {
		width = "100%";
		height = size;
	}
	
	var spacer = Ti.UI.createView({
 		width				: width,
		height			: height,
    bottom			: 0,
    top					: 0
    // backgroundColor : bg_color
 	});
 	return spacer;
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
	var label_text_color = this._color_black;
	var view_bg_color 	 = this._color_ltblue;
	var font 						 = this._text_medium;
	var view_height 		 = this._height_header;
	
	/*  ADD/CREATE dk pink section header  */
	if (size == 0) {        
	  label_text_color = this._color_white;
		view_bg_color    = this._color_dkpink;
		font             = this._text_medium_bold;
	}
	/*  DISPLAY dk blue section header  */
	else if (size == 1) {        
	  label_text_color = this._color_white;
		view_bg_color    = this._color_dkblue;
		font             = this._text_medium_bold;
	}
	/*  supa large banner      */
	else if (size == 2) {  
		label_text_color = this._color_black;
		view_bg_color 	 = this._color_ltblue;
		font             = this._text_large;
	}
	else if (size == 3) {  			// Subheader, slimmest one possible
		label_text_color = this._color_black;
		view_bg_color 	 = this._color_ltgray;
		font             = this._text_medium;
		view_height			 = this._height_subheader;
	}
	
	var view_container = Ti.UI.createView( { 
		id							: view_id, 
		backgroundColor : view_bg_color, 
		height			   	: view_height
	});
	// build a sexy label
	var section_label = Ti.UI.createLabel( {	
		id		: view_id+"_label", 
		text	: title,
		left  : this._pad_left,
		height: Ti.UI.SIZE,     
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

/************************************************************
*		Name:  		buildTextField ( id, width, hint, is_pwd )
*		Purpose:  create small test button
************************************************************/
UiFactory.prototype.buildTextField = function(id, width, hint, is_pwd) {
	if (width=="")
		width = this._device.screenwidth - this._pad_right - this._pad_left;
		
  var text_field = Ti.UI.createTextField( {
  	id              : id,
  	backgroundColor : '#ffffff', 
    color           : this._color_dkgray, 
    width           : width, 
    height          : 34, 
    top             : 1, 
    opacity         : 1,
  	font            : this._text_medium,
  	keyboardType    : Titanium.UI.KEYBOARD_DEFAULT,
  	returnKeyType   : Titanium.UI.RETURNKEY_DEFAULT,
  	textAlign       : Ti.UI.TEXT_ALIGNMENT_CENTER,
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
  var btn_height 		= 34; // this._icon_medium;
  var borderRadius  = btn_height/2;
  
  var font   				= this._text_small;

  if (type == "header") {  
    font   = this._text_large;
  }
  else if (type == "large") {  
    font   = this._text_large;
  }
  else if (type == "medium") {
    font   = this._text_medium;
  }

  var view_container = Ti.UI.createView( { 
		id							: id, 
		layout					: "",
		backgroundColor : "none", 
		// borderColor     : ((this._debug == 1) ? this._color_ltpink : ''), borderWidth			: ((this._debug == 1) ? 1 : ''), 
		width						: "100%",
		height 					: view_height
	});
	var button 		= Ti.UI.createButton( {
		id							: id+"_btn",	 
		title						: title, 
		color						: this._color_white, 
		backgroundColor : this._color_dkpink, 
		font						: font, 
		textAlign       : Ti.UI.TEXT_ALIGNMENT_CENTER,
  	width						: this._button_width, 
		height					: btn_height, 
		opacity         : 1,
		borderRadius		: borderRadius 
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
  var view_container = this.buildViewContainer ( "", "horizontal", "99%", this._height_header, 0 ); 
  view_container.add( this.buildSeparator() );
  var column_1 = this.buildViewContainer ( "", "", "49%", this._height_header, 6 ); 
  var column_2 = this.buildViewContainer ( "", "", "50%", this._height_header, 6 );
	
	var button 		= Ti.UI.createButton( {
		id							: id,	 
		title						: title, 
		color						: this._color_dkpink, 
		backgroundColor : this._color_ltblue, 
		font						: this._text_medium_bold, 
		textAlign       : "right",
		width						: "100%", 
		right						: this._pad_right,				
		borderColor     : ((this._debug == 1) ? this._color_black : ''), borderWidth : ((this._debug == 1) ? 1 : ''), 
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
/* 
	1. Parks/Outdoors			Brown			"#986d4f"
	2. Stores (Retail)		Green			"#34b44a"
	3. Vets								Red				"#ee3d3b"
	4. Boarding/Dogsit		Blue			"#9a52a0"
	5. Pet Care Services 	Purple		"#9a52a0"
	6. Food/Restaurant		Orange		"#f5851f"
	7. General						Gray			"#787578"
*/

function UiFactory(){
  /*		DEBUG MODE!		(Adds borders to stuff)		*/
  this._debug = 0;
   
  /*		SPACING & PADDING				*/
  this._spacer_size = 4;
  this._pad_left  = 7.5;
  this._pad_right = 7.5;
  this._pad_top   = 7.5;
   
  /*   COLORS									*/
  this._color_white  = "#ffffff";
  this._color_black  = "#000000";
  this._color_ltblue = "#dcf1fc";
  this._color_dkblue = "#58c6d5";
  this._color_ltgray = "#bab9b9";
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
		
	/*  HEIGHTS & WIDTHS		 */	
	this._height_row   	= 45;				// 90	// 60px/pt? (medium), 90px/pt? (large)
	this._height_header = 0.66667 * this._height_row ;			// 30px/pt? (small)
	
	this._form_width  	= "70%";
	this._button_width  = 200;
	
	/*  IMAGES AND ICONS      */
	this._base_icon_size = 30;
	this._icon_small  = 1.000 * this._base_icon_size;		//  30x30 px equivalent
	this._icon_medium = 1.333 * this._base_icon_size;		//  40x40 px equivalent, base size
	this._icon_large  = 2.333 * this._base_icon_size;		//  70x70 px equivalent
};

//================================================================================
//		Name:			loadJson
//		Purpose:	standardize HTTP requests
//================================================================================
UiFactory.prototype.loadJson = function( params, url, callbackFunction ) {
	Ti.API.info("* getRecentEstimates() called *");
	var query = Ti.Network.createHTTPClient();
	query.open("POST", url);	
	query.send( params );
	query.onload = function() {
		var jsonResponse = this.responseText;
		
		if (jsonResponse != "" ) {
			var data = JSON.parse( jsonResponse );
			// Ti.API.debug("....[~] UiFactory.loadJson ["+JSON.stringify(data)+"]");
			if (callbackFunction!="")			
				callbackFunction(data);
			return data;	
		}
	};
}

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
		borderColor     : this._color_ltpink, 	
		borderWidth			: this._debug,
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
		
	var label = Ti.UI.createLabel( {	
		//id	: something+"_label", 
		text	: title,
		font	:	font_style,
		width	: width,
		height: height,
		left  : left_pad,
		color	: font_color,
		borderColor : this._color_dkblue,
		borderWidth : this._debug,
		textAlign		: align
		//top   : 0
	});
	return label;
}

/************************************************************
*		Name:  		buildProfileThumb ( id, image, border, size ) 
*		Purpose:  build image thumbnails
*		Notes:	  border: 0=others, 1=me, 2=friends
************************************************************/
UiFactory.prototype.buildProfileThumb = function(id, image, border, size){
	var borderColor = "";
	 	
	if(image=="")
		image = 'images/missing/WB-PetProfilePic-Placeholder.png';
	var borderWidth = 0;
	
	if 			(size == "small")		icon_size = this._icon_small;		//	small 
	else if (size == "medium")	icon_size = this._icon_medium; 	//	medium
	else if (size == "large")		icon_size = this._icon_large;		//	large
	else												icon_size = this._icon_medium;	//	default to medium 
			
	if (border==1) {
		borderColor = this._color_dkpink;
		borderWidth = 2;
	}
	else if (border==2) {
		borderColor = this._color_dkblue;
		borderWidth = 2;
	}
	var image_view = Ti.UI.createImageView({ 
		id							: id, 
		image   				: image,
		height					: icon_size,
		width					  : icon_size,
		backgroundColor : this._color_ltgray,
		left						: this._pad_left,
		top							: this._pad_left,
		borderColor			: borderColor,
		borderRadius		: icon_size/2,
		borderWidth			: borderWidth
	});
	return image_view;
}

/************************************************************
*		Name:  		buildIcon ( id, image, size ) 
*		Purpose:  build icons baby
************************************************************/
UiFactory.prototype.buildIcon = function(id, image, size){
	if(image=="")
		image = 'images/missing/WB-Icon-Placeholder.png';
	
	if 			(size == "small")		icon_size = this._icon_small;		//	small 
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
    borderColor     : this._color_dkblue,
    borderWidth     : 0,
    borderRadius    : 14, 
    backgroundColor : ''
  });
}

/***********************************************************************************
*		Name:  		buildHeader ( place_name, city, bg_color )  
*		Purpose:  TODO: finish this mon!
************************************************************************************/
UiFactory.prototype.buildHeader = function(place_name, city, bg_color) {
	var view_container = this.buildViewContainer ( "", "horizontal", "100%", 60, 0 ); 
	
	view_container.add( this.buildSpacer("vert", this._pad_left) );
	
	var column_right = Ti.UI.createView( {
			layout					: "vertical",
			backgroundColor : bg_color, 
			borderColor     : this._color_dkpink, 	
			borderWidth			: this._debug,
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

/***********************************************************************************
*		Name:  		buildMiniHeader ( place_name, city, bg_color )  
*		Purpose:  
************************************************************************************/
UiFactory.prototype.buildMiniHeader = function(place_name, subtitle, bg_color) {
	var miniHeader = this.buildViewContainer("", "vertical", "100%", this._icon_small+(2*this._pad_top), 0);	
	miniHeader.backgroundColor = bg_color;
	var name_label			= this.buildLabel( place_name, "100%", this._height_header, this._text_large, "#ffffff", "" );
	var subtitle_label	= this.buildLabel( subtitle, "100%", this._height_header, this._text_medium, "#ffffff", "" );	
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
	var text_area_width = mySesh.device.screenwidth-(2*this._pad_left);
	var textArea = Ti.UI.createTextArea({
		id						: "actual_text_area",
	  borderWidth		: 1,
	  borderColor		: '#bbb',
	  borderRadius	: 5,
	  color					: '#888',
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
*		Name:  		buildInfoBar ( image_url, name, value )  
*		Purpose:  generic single row bar with photo or icon / thing name  / thing value
************************************************************************************/
UiFactory.prototype.buildInfoBar = function(image_url, name, value) {
  var div_height = this._icon_small + (2* this._pad_top); // this._height_row-10;
	// var padding = this._height_row - this._icon_medium;
	var view_container = this.buildViewContainer ( "", "horizontal", "100%", div_height, 0 ); 
  
  var column_1 = this.buildViewContainer ( "column_1", "", this._icon_medium+this._pad_left, div_height, 0 ); 
  if (image_url!="") {
  	//image_url = 'images/missing/WB-PetProfilePic-Placeholder.png';
		var image = this.buildIcon("", image_url, "small"); 
		column_1.add(image);
  }
  var column_2 = this.buildViewContainer ( "column_2", "horizontal", Ti.UI.FILL, div_height, 0 );
  column_2.add( this.buildSpacer( "vert", 10 ) );
	
	if (name!="") {
		var name_label  = this.buildLabel( name, Ti.UI.SIZE, "100%", this._text_medium, "#000000", "left");
	}
  var value_label = this.buildLabel( value, Ti.UI.SIZE, "100%", this._text_medium_bold, "#000000", "left" );
	
	if (name!="") {
		column_2.add(name_label);
		column_2.add( this.buildSpacer( "vert", 2 ) );
	}
	
	column_2.add(value_label);
	
	view_container.add(column_1);
	view_container.add(column_2);
  return view_container;
}


	// +=== buildTableRow ==========================+
	//			col_1			 col_2
	// |  +-thumb-+ +--row_one---------------+ |
	// |  |       | |   name	  	timestamp  | |
	// |  |  dog  | +--row_two---------------+ |
	// |  | photo | |   desc+amount			     | |		
	// |  +-------+ +------------------------+ |		
	// +=======================================+
/****************************************************************************
*		Name:  		buildTableRow ( id, left, middle, right )  eg: photo_url, dog name, timestamp, amount, amount description
*		Purpose:  modified format for feed items (marks, estimates, etc)
*   Used by:  Marks display, etc
***************************************************••••••••••••••••••••••*********/
UiFactory.prototype.buildTableRow = function(id, photo_url, photo_caption, time_stamp, amount, amount_desc) {
  var div_height = this._icon_medium+(2*this._pad_top);
  Ti.API.debug( ">>>>> time_stamp:"+ time_stamp);
  if (amount_desc=="") 
    div_height += 30;
    
	var view_container = this.buildViewContainer ( id, "horizontal", "100%", div_height, 0 ); 
  // view_container.add( this.buildSeparator() );
	var column_3_width = this._pad_right;
  var column_1_width = this._icon_medium+(2*this._pad_left);
	var column_2_width = mySesh.device.screenwidth - column_3_width - column_1_width;
  
	var column_1 = this.buildViewContainer ( "col_1", "", 				column_1_width, div_height, 0 ); 
	var column_2 = this.buildViewContainer ( "col_2", "vertical", column_2_width, div_height, 0 );
	var column_3 = this.buildViewContainer ( "col_3", "", 				column_3_width, "100%", 		0 );
		
	var dog_photo = this.buildProfileThumb("last_updated_by_photo", photo_url, 0, "medium");
	column_1.add(dog_photo);
		
	// all labels below will be 100% of the parent view (column_2)
	var col_2_row_1 = this.buildViewContainer ( "", "horizontal", "100%", "50%", 0 ); 
	var col_2_row_2 = this.buildViewContainer ( "", "horizontal", "100%", "50%", 0 );
	
	var dog_name_label  	= this.buildLabel( photo_caption, "50%", "100%", this._text_medium_bold, "#000000", "left" );		
	var time_stamp_label	= this.buildLabel( time_stamp, "50%", "100%", this._text_tiny, "#000000", "left");
	var amount_label      = this.buildLabel( amount_desc, "100%", "100%", this._text_medium, "#000000", "left" );
	
	col_2_row_1.add(dog_name_label);
	col_2_row_1.add(time_stamp_label);
	col_2_row_2.add(amount_label);
	/*
	if (amount_desc=="") {  // blank label, where is this used?
    var textarea = this.buildLabel( amount, "100%", "100%", this._text_medium, "#000000", "left" );
    // var textarea = this.buildButton( "", "100%", "100%", this._text_medium, "#000000", "left" );
	  col_2_row_2.add(textarea);
	}
	
	else {																	// title, 			width, height, font_style, text_align)
    var hybrid_label = this.buildLabel( amount +" "+amount_desc, "100%", "100%", this._text_medium, "#000000", "left" );
  	//var amount_label 		 	= this.buildLabel( amount, 		 	Ti.UI.FILL, "100%", this._number_medium, "#000000", "" );  
  	col_2_row_2.add(hybrid_label);
    //col_2_row_2.add(amount_label);
	}
*/
	
 // col_2_row_2.add(this.buildSpacer("horz", this._pad_right));
  column_2.add(col_2_row_1);
	column_2.add(col_2_row_2);
	
	view_container.add(column_1);
	view_container.add(column_2);
	view_container.add(column_3);
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
  var middle_width 	= 0.5 * (mySesh.device.screenwidth - photo_width);
  var right_width 	= 0.5 * (mySesh.device.screenwidth - photo_width);
	
	var view_container = this.buildViewContainer ( id, "horizontal", "100%", div_height, 0 ); 
   
	// all labels below will be 100% of the parent view
  var column_1 = this.buildViewContainer ( "", "vertical", photo_width, div_height, 0 ); 
	var dog_photo = this.buildProfileThumb("last_updated_by_photo", photo_url, 0, "large");
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
UiFactory.prototype.buildRowMarkSummary = function(id, photo_url, photo_caption, time_stamp, description) {
  var div_height = this._icon_large+(this._pad_left*2);
	var view_container = this.buildViewContainer ( id, "horizontal", "100%", div_height, 0 ); 
  // view_container.add( this.buildSeparator() );

	var column_3_width = this._pad_right;
  var column_1_width = this._icon_large+(2*this._pad_left);
	var column_2_width = mySesh.device.screenwidth - column_3_width - column_1_width;
  
	var column_1 = this.buildViewContainer ( "col_1", "", 				column_1_width, div_height, 0 ); 
	var column_2 = this.buildViewContainer ( "col_2", "vertical", column_2_width, div_height, 0 );
	var column_3 = this.buildViewContainer ( "col_3", "", 				column_3_width, "100%", 		0 );
		
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
    top					: 0,
    borderColor : this._color_black,
    borderWidth : this._debug,
    backgroundColor : bg_color
 	});
 	return spacer;
}
/************************************************************
*		Name:  		buildMediumIcon ( id, image ) 
*		Purpose:  build icons for info bars
************************************************************/
UiFactory.prototype.buildMediumIcon = function(id, image){
  var image_view = Ti.UI.createImageView({ 
		//id							: id, 
		image   				: image,
		height					: this._icon_medium,
		width					  : this._icon_medium,
		left						: this._pad_left,
		right						: 2,
		//top							: this._pad_top-2,
		//borderColor			: borderColor,
		//borderRadius		: this._icon_medium/2,
		borderWidth			: this._debug
	});
	return image_view;
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
	
	var view_container = Ti.UI.createView( { 
		id							: view_id, 
		backgroundColor : view_bg_color, 
		height			   	: this._height_header,
		borderColor     : this._color_white,
		borderWidth			: this._debug
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
	var form_width = mySesh.device.screenwidth - this._pad_right - this._pad_left;
	if (width=="")
		width = form_width;
		
  var text_field = Ti.UI.createTextField( {
  	id              : id,
  	backgroundColor : '#ffffff', 
    color           : this._color_dkgray, 
    width           : form_width, 
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
		borderColor     : this._color_ltpink, 	
		borderWidth			: this._debug,
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
		opacity         : 0.88,
		borderRadius		: borderRadius 
	} );
	
	view_container.add(button);
	
	return view_container;
}

/************************************************************
*		Name:  		buildFullRowButton ( btn_ID, btn_title )
*		Purpose:  create small test button
************************************************************/
UiFactory.prototype.buildFullRowButton = function(id, title) {
  var view_container = this.buildViewContainer ( "", "horizontal", "99%", this._height_header+(2*this._pad_top), 0 ); 
  view_container.add( this.buildSeparator() );
  var column_1 = this.buildViewContainer ( "", "", "49%", this._height_header, 0 ); 
  var column_2 = this.buildViewContainer ( "", "", "50%", this._height_header, 0 );
	
	var button 		= Ti.UI.createButton( {
		id							: id,	 
		title						: title, 
		color						: this._color_dkpink, 
		backgroundColor : this._color_ltblue, 
		font						: this._text_medium_bold, 
		textAlign       : "right",
		width						: "100%", 
		height					: "100%",
		top     				: this._pad_top,
		right						: this._pad_right,				
		borderColor     : this._color_black, 
		borderWidth     : this._debug
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
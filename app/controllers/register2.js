

//
// 				LOGIC FLOW
//
//-----------------------------------------------------------------------
//		(0)		Build dog info registration form
//-----------------------------------------------------------------------
// 		(1)  Add section header
$.scrollView.add( myUiFactory.buildMasterSectionHeader("register_header", "account setup 2/3") );

var form_width = mySesh.device.screenwidth - myUiFactory._pad_right - myUiFactory._pad_left;
var title_label = myUiFactory.buildLabel( "All about your dog", form_width, myUiFactory._height_header, myUiFactory._text_large, "#ec3c95","left" );	

$.scrollView.add( myUiFactory.buildSpacer("horz", 30) );
$.scrollView.add(title_label);
$.scrollView.add( myUiFactory.buildSpacer("horz", 10) );
var dog_intro = "Waterbowl is all about your four-legged friend.  We'll need some basic information about him/her to create your dog's profile.";

$.scrollView.add( myUiFactory.buildLabel( dog_intro, form_width, Ti.UI.SIZE, myUiFactory._text_medium, "#000000","left" ) );
$.scrollView.add( myUiFactory.buildSpacer("horz", 10) );
var dog_name  = myUiFactory.buildTextField("dog_name",  form_width,  "your dog's name", false)
$.scrollView.add( dog_name );

//var sex_row_view = myUiFactory.buildViewContainer ( "sex_row_view", "horizontal", form_width, myUiFactory._height_row+(2*myUiFactory._pad_top), 0 ); 
//var sex_label = myUiFactory.buildLabel( "gender", 0.4*form_width, "100%", myUiFactory._text_medium, "#000000", "left" );	
var sex_button_bar = Ti.UI.iOS.createTabbedBar({
    labels					: ['Male', 'Female'],   
    backgroundColor	: myUiFactory._color_dkpink,   
    top							: myUiFactory._pad_top,   
    style						: Titanium.UI.iPhone.SystemButtonStyle.BAR,   
    height					: myUiFactory._height_row,   
    width						: form_width // (0.6*form_width) - (2* myUiFactory._pad_left)
});
//sex_row_view.add(sex_label);
//sex_row_view.add( myUiFactory.buildSpacer("vert", myUiFactory._pad_left) );
//sex_row_view.add(sex_button_bar);
//$.scrollView.add(sex_row_view);
$.scrollView.add(sex_button_bar);

var dog_breed1 = myUiFactory.buildTextField("dog_breed1",  form_width,  "select your dog's breed", false);
var dog_breed2 = myUiFactory.buildTextField("dog_breed2",  form_width,  "and a second one if you wish", false);

var dropdown_button =  Titanium.UI.createButton({
	backgroundImage	: ICON_PATH + 'button-forward.png',
	width						: myUiFactory._icon_small,
	height					: myUiFactory._icon_small
});
dog_breed1.rightButton = dropdown_button;
dog_breed2.rightButton = dropdown_button;

$.scrollView.add( dog_breed1 );
$.scrollView.add( dog_breed2 );
$.scrollView.add( myUiFactory.buildTextField("dog_size", 	 form_width,  "size", 		 false) );
$.scrollView.add( myUiFactory.buildTextField("dog_bdate",  form_width,  "birthdate", false) );
$.scrollView.add( myUiFactory.buildSpacer("horz", 30) );
var nextBtn = myUiFactory.buildButton( "nextBtn", "next", "xl" );
nextBtn.addEventListener('click', function(e) {
	//alert( JSON.stringify(e) );
	createWindowController("register3","","slide_left");
});	
$.scrollView.add(nextBtn);




///////////////////// 		EVENT LISTENERS				///////////////////////////////////////////
dog_breed1.addEventListener('focus', function(e) {
	var necessary_args = {
		_dog_name : dog_name.value,
		_type    		: "breed",
		_index_val 	: 1
	};
	this.blur();
	createWindowController( "uipicker", necessary_args, "slide_left" );
});

/*dog_breed2.addEventListener('focus', function(e) {
	var necessary_args = {
		_dog_name : dog_name.value,
		_type    		: "breed",
		_index_val 	: 2
	};
	this.blur();
	createWindowController( "uipicker", necessary_args, "slide_left" );
});
*/

// ON FOCUS PAGE LISTENER

$.register2.addEventListener('focus',function(e){
	//Ti.UI.debug(" **** window has focus **** ");
	if (dog_breed1.value == "")
		dog_breed1.value = mySesh.dog.breed1; 
	if (dog_breed2.value == "")
		dog_breed2.value = mySesh.dog.breed2; 
	
	Ti.API.debug( "  >> mySesh.dog.breed1 >> " + mySesh.dog.breed1 );
});


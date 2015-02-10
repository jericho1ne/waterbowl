

//
// 				LOGIC FLOW
//
//-----------------------------------------------------------------------
//		(0)		Build dog info registration form
//-----------------------------------------------------------------------
// 		(1)  Add section header
$.scrollView.add( myUiFactory.buildMasterSectionHeader("register_header", "account setup 2/3") );

var form_width = mySesh.device.screenwidth - myUiFactory._pad_right - myUiFactory._pad_left;
var title_label = myUiFactory.buildLabel( "All about your dog", form_width, myUiFactory._height_header, myUiFactory._text_large, myUiFactory._color_dkpink, "left" );	

//		PAGE TITLE 
var dog_intro = "Waterbowl is all about your four-legged friend.  We'll need some basic information about him/her to create your dog's profile.";

//   DOG NAME
var dog_intro = myUiFactory.buildLabel( dog_intro, form_width, Ti.UI.SIZE, myUiFactory._text_medium, "#000000","left" );
var dog_name  = myUiFactory.buildTextField("dog_name",  form_width,  "your dog's name", false)

//   DOG NAME
var sex_button_bar = Ti.UI.iOS.createTabbedBar({
    labels					: ['Male', 'Female'],   
    backgroundColor	: myUiFactory._color_dkpink,       
    height					: myUiFactory._height_row,   
    width						: form_width // (0.6*form_width) - (2* myUiFactory._pad_left)
});
//sex_row_view.add( myUiFactory.buildSpacer("vert", myUiFactory._pad_left) );


//   FWD ARROW BUTTONS
var fwd_button_1 =  Titanium.UI.createButton({
	backgroundImage	: ICON_PATH + 'button-forward.png',
	width						: myUiFactory._icon_small,
	height					: myUiFactory._icon_small
});
var fwd_button_2 =  Titanium.UI.createButton({
	backgroundImage	: ICON_PATH + 'button-forward.png',
	width						: myUiFactory._icon_small,
	height					: myUiFactory._icon_small
});
var fwd_button_3 =  Titanium.UI.createButton({
	backgroundImage	: ICON_PATH + 'button-forward.png',
	width						: myUiFactory._icon_small,
	height					: myUiFactory._icon_small
});
var fwd_button_4 =  Titanium.UI.createButton({
	backgroundImage	: ICON_PATH + 'button-forward.png',
	width						: myUiFactory._icon_small,
	height					: myUiFactory._icon_small
});

var dog_breed1 = myUiFactory.buildTextField("dog_breed1",  form_width,  "select your dog's breed", false);
var dog_breed2 = myUiFactory.buildTextField("dog_breed2",  form_width,  "and a second one if you wish", false);
var dog_weight 	 = myUiFactory.buildTextField("dog_weight", 	 form_width,  "weight (lbs)", 		 false);
var dog_bdate	 = myUiFactory.buildTextField("dog_bdate",   form_width,  "birthdate", false);

dog_breed1.rightButton	= fwd_button_1;
dog_breed2.rightButton 	= fwd_button_2;
dog_weight.rightButton 		= fwd_button_3;
dog_bdate.rightButton 	= fwd_button_4;

var nextBtn = myUiFactory.buildButton( "nextBtn", "next", "xl" );
nextBtn.addEventListener('click', function(e) {
	//alert( JSON.stringify(e) );
	createWindowController("register3","","slide_left");
});	

/////////////////// ADD UI ELEMENTS TO PAGE ///////////////////////
$.scrollView.add( myUiFactory.buildSpacer("horz", 20) );
$.scrollView.add(title_label);
$.scrollView.add( myUiFactory.buildSpacer("horz", 20) );
$.scrollView.add( dog_intro );
$.scrollView.add( myUiFactory.buildSpacer("horz", 20) );

$.scrollView.add( dog_name );
$.scrollView.add( myUiFactory.buildSpacer("horz", 10) );
$.scrollView.add(sex_button_bar);
$.scrollView.add( myUiFactory.buildSpacer("horz", 10) );

$.scrollView.add( dog_breed1 );
$.scrollView.add( dog_breed2 );
$.scrollView.add( dog_weight );
$.scrollView.add( dog_bdate );

$.scrollView.add( myUiFactory.buildSpacer("horz", 20) );
$.scrollView.add(nextBtn);


///////////////////// 		EVENT LISTENERS				///////////////////////////////////////////
dog_breed1.addEventListener('focus', function(e) {
	var necessary_args = {
		_dog_name  : dog_name.value,
		_type    		: "breed",
		_index_val 	: 1
	};
	// this.blur();
	createWindowController( "uipicker", necessary_args, "slide_left" );
});

dog_breed2.addEventListener('focus', function(e) {
	var necessary_args = {
		_dog_name : dog_name.value,
		_type    		: "breed",
		_index_val 	: 2
	};
	this.blur();
	createWindowController( "uipicker", necessary_args, "slide_left" );
});

dog_weight.addEventListener('focus', function(e) {
	var necessary_args = {
		_dog_name  : dog_name.value,
		_type    		: "weight",
		_index_val 	: ''
	};
	this.blur();
	createWindowController( "uipicker", necessary_args, "slide_left" );
});


// ON FOCUS PAGE LISTENER

$.register2.addEventListener('focus',function(e){
	//Ti.UI.debug(" **** window has focus **** ");
	if (dog_breed1.value=="" || mySesh.dog.breed1!=dog_breed1.value)
		dog_breed1.value = mySesh.dog.breed1; 
	if (dog_breed2.value=="" || mySesh.dog.breed2!=dog_breed2.value)
		dog_breed2.value = mySesh.dog.breed2; 
	if (dog_weight.value=="" || mySesh.dog.weight!=dog_weight.value)
		dog_weight.value = mySesh.dog.weight;
	Ti.API.debug( "  >> mySesh.dog.breed1 >> " + mySesh.dog.breed1 );
});


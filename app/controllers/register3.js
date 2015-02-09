
function gotoPhotoUpload() {
  createWindowController( "photoupload", "", "slide_left" ); 
}



//
// 				LOGIC FLOW
//
//-----------------------------------------------------------------------
//		(0)		Build dog info registration form
//-----------------------------------------------------------------------
// 		(1)  Add section header
$.scrollView.add( myUiFactory.buildMasterSectionHeader("register_header", "account setup 3/3") );

var form_width = mySesh.device.screenwidth - myUiFactory._pad_right - myUiFactory._pad_left;
var title_label = myUiFactory.buildLabel( "Profile Photo", form_width, myUiFactory._height_header, myUiFactory._text_large, "#ec3c95","left" );	

$.scrollView.add( myUiFactory.buildSpacer("horz", 30) );
$.scrollView.add(title_label);
$.scrollView.add( myUiFactory.buildSpacer("horz", 10) );
var dog_intro = "Waterbowl is all about your four-legged friend.  We'll need some basic information about him/her to create your dog's profile.";

$.scrollView.add( myUiFactory.buildLabel( dog_intro, form_width, Ti.UI.SIZE, myUiFactory._text_medium, "#000000","left" ) );
$.scrollView.add( myUiFactory.buildSpacer("horz", 10) );
$.scrollView.add( myUiFactory.buildTextField("dog_name",  form_width,  "your dog's name", false) );

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

$.scrollView.add( myUiFactory.buildTextField("dog_breed",  form_width,  "select your dog's breed", false) );
$.scrollView.add( myUiFactory.buildTextField("dog_size", 	 form_width,  "size", 		 false) );
$.scrollView.add( myUiFactory.buildTextField("dog_bdate",  form_width,  "birthdate", false) );
$.scrollView.add( myUiFactory.buildSpacer("horz", 30) );
var nextBtn = myUiFactory.buildButton( "nextBtn", "next", "xl" );
nextBtn.addEventListener('click', function(e) {
	//alert( JSON.stringify(e) );
	createWindowController("register4","","slide_left");
});	
$.scrollView.add(nextBtn);
/*

$.age_picker_dummy.addEventListener('click',function(){
    _date.animate({bottom:0, duration: 500});
    toolbar_pick.animate({bottom:266, duration: 500});
});
*/
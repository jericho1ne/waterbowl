
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

var form_width 		= mySesh.device.screenwidth - myUiFactory._pad_right - myUiFactory._pad_left;
var title_label	 	= myUiFactory.buildLabel( mySesh.dog.name + "'s Furry Mug", form_width, myUiFactory._height_header, myUiFactory._text_large, "#ec3c95","left" );	

var dog_intro 		= "Last step! All we now is a clear photo of your dog so they are easily identifiable by other Waterbowl members.";
var warning 			= "Note:  No humans or other dogs allowed.  This one is just for "+mySesh.dog.name+".";

var galleryBtn 		= myUiFactory.buildButton( "galleryBtn", "upload from gallery", "xxl" );
var cameraBtn 		= myUiFactory.buildButton( "cameraBtn", "use camera", "xxl" );

$.scrollView.add( myUiFactory.buildSpacer("horz", 20) );
$.scrollView.add( title_label );
$.scrollView.add( myUiFactory.buildSpacer("horz", 10) );

$.scrollView.add( myUiFactory.buildLabel( dog_intro, form_width, Ti.UI.SIZE, myUiFactory._text_medium, "#000000","left" ) );
$.scrollView.add( myUiFactory.buildSpacer("horz", 10) );
$.scrollView.add( myUiFactory.buildLabel( warning, form_width, Ti.UI.SIZE, myUiFactory._text_large, "#ec3c95","left" ) );

$.scrollView.add( myUiFactory.buildSpacer("horz", 30) );

galleryBtn.addEventListener('click', function(e) {
	alert("clicked gallery");
});
	
	
cameraBtn.addEventListener('click', function(e) {
	alert("clicked camera");
});

$.scrollView.add(galleryBtn);
$.scrollView.add(cameraBtn);
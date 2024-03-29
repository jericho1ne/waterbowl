//=====================================================================
//		Name: 		saveDogInfo ()
//		Purpose:  advance to next register window if succesful
//=====================================================================
function saveDogInfo(data) {
	Ti.API.debug( "  .... [~] saveDogInfo :: " + JSON.stringify(data) );
	enableAllButtons();
	
	if (data.status==1) {
		if (data.dog_ID!="" && data.dog_ID!=null) {
 			mySesh.dog.dog_ID = data.dog_ID;
 			Ti.API.debug( "mySesh.dog.dog_ID saved :: [ "+ mySesh.dog.dog_ID +" ]");
 		}
 		createWindowController( "register3", "", "slide_left" ); 
  }
  else	
    createSimpleDialog("Error", data.message);
	
	// TODO: gray out or fade out button while backend call is executed
	//	$.btn.opacity = 0.3;
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// 		DOG NAME, BREED, WEIGHT, LOGIC FLOW
//
//		(0)		Build dog info registration form
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var args = arguments[0] || {};
var form_width = myUi._form_width;

// 		HEADER
$.scrollView.add( myUi.buildMasterSectionHeader("register_header", "account setup 2/3") );

var title_label = myUi.buildLabel( "All about your dog", form_width, myUi._height_header, myUi._text_large, myUi._color_dkpink,  myUi._color_ltblue, "left" );	

//		PAGE INTRO 
var dog_intro = "Waterbowl is all about your four-legged friend.  We'll need some basic information about him/her to create your dog's profile.";

//   DOG NAME
var dog_intro = myUi.buildLabel( dog_intro, form_width, Ti.UI.SIZE, myUi._text_medium, "#000000", myUi._color_ltblue, "left" );
var dog_name  = myUi.buildTextField("dog_name",  form_width,  "your dog's name", false)

//   DOG NAME
var gender_tabs = Ti.UI.iOS.createTabbedBar({
    labels					: ['Male', 'Female'],   
    backgroundColor	: myUi._color_dkpink,       
    height					: myUi._height_row,  
    indexOf         : 1, 
    width						: form_width // (0.6*form_width) - (2* myUi._pad_left)
});
//sex_row_view.add( myUi.buildSpacer("vert", myUi._pad_left) );


//   FWD ARROW BUTTONS
var fwd_button_1 =  Titanium.UI.createButton({
	backgroundImage	: ICON_PATH + 'caret.png',
	width			: myUi._icon_small,
	height			: myUi._icon_small
});
var fwd_button_2 =  Titanium.UI.createButton({
	backgroundImage	: ICON_PATH + 'caret.png',
	width			: myUi._icon_small,
	height			: myUi._icon_small
});
var fwd_button_3 =  Titanium.UI.createButton({
	backgroundImage	: ICON_PATH + 'caret.png',
	width			: myUi._icon_small,
	height			: myUi._icon_small
});
var fwd_button_4 =  Titanium.UI.createButton({
	backgroundImage	: ICON_PATH + 'caret.png',
	width			: myUi._icon_small,
	height			: myUi._icon_small
});

var dog_breed1 = myUi.buildTextField("dog_breed1",  form_width, "select your dog's breed", false);
var dog_breed2 = myUi.buildTextField("dog_breed2",  form_width, "and a second one if you wish", false);
var dog_weight = myUi.buildTextField("dog_weight",  form_width, "weight (lbs)", 		 false);
var dog_bdate  = myUi.buildTextField("dog_bdate", form_width, "birthdate", false);

if (mySesh.dog.breed1=="" || mySesh.dog.breed1==null) {
	dog_breed2.opacity = 0;
	dog_breed2.height = 0;
}
else {
	// TODO: nything here??
}


dog_breed1.rightButton	= fwd_button_1;
dog_breed2.rightButton 	= fwd_button_2;
dog_weight.rightButton 	= fwd_button_3;
dog_bdate.rightButton 	= fwd_button_4;

// var owner_ID = (args._owner_ID=="")

var nextBtn = myUi.buildButton( "nextBtn", "next", "xl" );
	nextBtn.addEventListener('click',  function(dog){ 
		disableAllButtons(0);	
		
		// Ti.API.info( " >>>>>> dog_name " + ucwords(dog_name.value) );
		var dog_gender = "";
		if (gender_tabs.index==0)
			dog_gender = "M";
		else if (gender_tabs.index==1)
			dog_gender = "F";

		dog_weight_int = dog_weight.value.replace(" lbs", "");
		// Ti.API.info ( "  >>> DOG GENDER : " + dog_gender );
		if (mySesh.user.owner_ID!='' && 
				dog_name.value			!='' && 
				dog_gender					!='' && 
				dog_breed1.value		!='' && 
				dog_bdate.value			!='' && 
				dog_weight.value		!='') {
			
		
			mySesh.dog.name 	= ucwords(dog_name.value);
			mySesh.dog.sex  	= dog_gender;
			mySesh.dog.breed1 = dog_breed1.value;
			mySesh.dog.breed2 = (dog_breed2.value!="- None -" ? dog_breed2.value : "");
			// TODO: calculate age
			
			var dog = {
				"owner_ID" 	: mySesh.user.owner_ID,
				"name" 			: ucwords(dog_name.value),
				"sex" 			: dog_gender,
				"breed"  		: dog_breed1.value,
				"breed2" 		: (dog_breed2.value!="- None -" ? dog_breed2.value : ""),
				"birthdate" : dog_bdate.value,
				"weight" 		: dog_weight_int
			};
			Ti.API.info("  .... [~] dog :: " + JSON.stringify(dog) );
			loadJson(dog, "http://waterbowl.net/mobile/create-dog.php", saveDogInfo);	
		}	else {
			createSimpleDialog("Error","Please fill out all of the fields");
			enableAllButtons();
		}
});

/////////////////// ADD UI ELEMENTS TO PAGE ///////////////////////
$.scrollView.add( myUi.buildSpacer("horz", 20) );
$.scrollView.add(title_label);
$.scrollView.add( myUi.buildSpacer("horz", 20) );
$.scrollView.add( dog_intro );
$.scrollView.add( myUi.buildSpacer("horz", 20) );

$.scrollView.add( dog_name );
$.scrollView.add( myUi.buildSpacer("horz", 8) );
$.scrollView.add( gender_tabs );
$.scrollView.add( myUi.buildSpacer("horz", 4) );

$.scrollView.add( dog_breed1 );
$.scrollView.add( dog_breed2 );
$.scrollView.add( dog_weight );
$.scrollView.add( dog_bdate );

$.scrollView.add( myUi.buildSpacer("horz", 20) );
$.scrollView.add(nextBtn);
$.scrollView.add( myUi.buildSpacer("horz", 30) );


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

dog_bdate.addEventListener('focus', function(e) {
	var necessary_args = {
		_dog_name  : dog_name.value,
		_type    		: "birthdate",
		_index_val 	: ''
	};
	this.blur();
	createWindowController( "uipicker", necessary_args, "slide_left" );
});


////////////// ON FOCUS PAGE LISTENER ////////////////////////////
$.register2.addEventListener('focus',function(e){
	// BREEDS
	if ( mySesh.dog.breed1!="" && mySesh.dog.breed1!=null ) {
		dog_breed1.value = mySesh.dog.breed1; 
		/*dog_breed2.animate({
			opacity	  : 1,
			height		: 45,
			duration	: 300, 
			curve			: Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT
		});*/
		// 	DON'T POPULATE 2ND BREED LIST IF THE DOG IS A MUTT
		if(mySesh.dog.breed1!="A Beautiful Mix") {
			dog_breed2.opacity = 1;
			dog_breed2.height  = myUi._height_row;
		}
	} 
	if (dog_breed2.value=="" || mySesh.dog.breed2!=dog_breed2.value)
		dog_breed2.value = mySesh.dog.breed2; 
	if (dog_breed2.value==dog_breed1.value && dog_breed1.value != "")
		dog_breed2.value = "- None -";
	
	// WEIGHT
	if (dog_weight.value=="" || mySesh.dog.weight!=dog_weight.value) {
		if (mySesh.dog.weight!=null) {
			dog_weight.value = mySesh.dog.weight + " lbs";
		}
	}
	// BDATE CHECKS
	if (dog_bdate.value=="" || mySesh.dog.birthdate!=dog_bdate.value)
		dog_bdate.value = mySesh.dog.birthdate;

});


function genderToggled() {
	Ti.API.info('Switch value: ' + $.gender_toggle.value);
	if ($.gender_toggle.value == true) {
		$.female_label.backgroundColor = "#cccccc";
		$.male_label.backgroundColor = "";
	}
	else {
		$.male_label.backgroundColor = "#cccccc";
		$.female_label.backgroundColor = "";
	}
		
}

function gotoPhotoUpload() {
  createWindowController( "photoupload", "", "slide_left" ); 
}

function ageChanged() {
	Ti.API.info('Age changed to: ' + $.age_picker.value);
}

function gender_male() {
	alert("itzaBoy");
}

function gender_female() {
	alert("itzaGirl");
}

//===========================================================================
$.gender_button_bar.addEventListener('click', function(e) {
	//alert( JSON.stringify(e) );
	if (e.index == 0) {  
		mySesh.dog.sex = "F";
	}
	else if (e.index == 1) {
		mySesh.dog.sex = "M";
	}
});	

$.age_picker_dummy.addEventListener('click',function(){
    _date.animate({bottom:0, duration: 500});
    toolbar_pick.animate({bottom:266, duration: 500});
});
/*
if ($.gender_toggle.value == true)
	$.female_label.backgroundColor = "#cccccc";
else
	$.male_label.backgroundColor = "#cccccc";
*/
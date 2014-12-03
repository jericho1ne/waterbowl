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
	var new_window = Alloy.createController( "photoupload" ).getView();
	new_window.open();
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
addToAppWindowStack( $.registerpetinfo, "registerpetinfo" );
addMenubar( $.menubar );

$.gender_button_bar.addEventListener('click', function(e) {
	//alert( JSON.stringify(e) );
	if (e.index == 0) {  
		MYSESSION.dog.sex = "F";
	}
	else if (e.index == 1) {
		MYSESSION.dog.sex = "M";
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
addToAppWindowStack( $.photoupload, "photoupload" );
addMenubar( $.menubar );

/* 								photo upload buttons									*/
$.galleryBtn.addEventListener('click', function() {
	Ti.API.info( " * inside of galleryBtn click listener * " + this.parent );
	uploadFromGallery( $.photoPlaceholder );	
});

$.cameraBtn.addEventListener('click', function() {
	uploadFromCamera( $.photoPlaceholder );	
});


function createAccount() {
	Ti.API.info (" * createAccount btn clicked ");
	
	// TODO:  if photo shows up inside IMageView, trigger success modal
		/*
		var alertDialog = Titanium.UI.createAlertDialog({
			title : 'Account Created!',
			message : response.message,
			buttonNames : ['OK']
		});
		alertDialog.show();
	*/
}



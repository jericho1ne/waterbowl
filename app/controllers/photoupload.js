
/* 								photo upload buttons									*/
$.galleryBtn.addEventListener('click', function() {
	Ti.API.info( " * galleryBtn clicked, calling uploadFromGallery * " );
	uploadFromGallery( $.photoPlaceholder );	
});

/*
$.cameraBtn.addEventListener('click', function() {
	uploadFromCamera( $.photoPlaceholder );	
});
*/

function createAccount() {
	Ti.API.info (" * createAccount btn clicked ");
	
	// TODO:  if photo shows up inside IMageView, trigger success modal
		/*
		 createSimpleDialog('Account Created!', response.message);
	*/
}



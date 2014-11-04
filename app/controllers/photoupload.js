var args = arguments[0] || {};

function uploadPhoto() {
	
}


$.galleryBtn.addEventListener('click', function() {
	Ti.API.info( " * inside of galleryBtn click listener * " + this.parent );
	uploadFromGallery( $.photoPlaceholder );	
});



$.cameraBtn.addEventListener('click', function() {
	uploadFromCamera( $.photoPlaceholder );	
});


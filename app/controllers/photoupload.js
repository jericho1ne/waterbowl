var args = arguments[0] || {};

function uploadPhoto() {
	
}


$.galleryBtn.addEventListener('click', function() {
	uploadFromGallery( $.photoPlaceholder );	
});



$.cameraBtn.addEventListener('click', function() {
	uploadFromCamera( $.photoPlaceholder );	
});


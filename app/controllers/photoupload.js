
addToAppWindowStack( $.photoupload, "photoupload" )


$.backBtn.addEventListener('click', function() {
	var currentWindow = sessionVars.windowStack.pop();
	Ti.API.info ( JSON.stringify( "currentWindow:"+currentWindow ) );
	currentWindow.close( { 
		top: 0, opacity: 0.01, duration: 200, 
		curve : Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT
	} );
	currentWindow = null;
});

//--------------------------------------------------------------
function uploadPhoto() {
	// TODO:  save dog name and photo filename to db
	// 				pop up success modal, send user back to login screen automatically
}



/* 								photo upload buttons									*/
$.galleryBtn.addEventListener('click', function() {
	Ti.API.info( " * inside of galleryBtn click listener * " + this.parent );
	uploadFromGallery( $.photoPlaceholder );	
});

$.cameraBtn.addEventListener('click', function() {
	uploadFromCamera( $.photoPlaceholder );	
});



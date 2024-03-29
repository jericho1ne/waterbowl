
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
$.scrollView.add( myUi.buildMasterSectionHeader("register_header", "account setup 3/3") );

var dog_name = (mySesh.dog.name==null ? "your dog" : mySesh.dog.name);
var form_width 		= myUi._form_width;
var title_label	 	= myUi.buildLabel( (dog_name=="your dog" ? ucwords(dog_name) : dog_name) + "'s Furry Mug", form_width, myUi._height_header, myUi._text_large, "#ec3c95", myUi._color_ltblue,"left" );	

var dog_intro 		= "Last step! All we now is a clear photo of your dog so they are easily identifiable by other Waterbowl members.";
var warning 		= "Note:  No humans or other dogs allowed in your pet's profile photo...  This one is just for "+dog_name+".";

var galleryBtn 		= myUi.buildButton( "galleryBtn", "upload from gallery", "xxl" );
var cameraBtn 		= myUi.buildButton( "cameraBtn", "use camera", "xxl" );

$.scrollView.add( myUi.buildSpacer("horz", 20) );
$.scrollView.add( title_label );
$.scrollView.add( myUi.buildSpacer("horz", 10) );

$.scrollView.add( myUi.buildLabel( dog_intro, form_width, Ti.UI.SIZE, myUi._text_medium, "#000000", myUi._color_ltblue,"left" ) );
$.scrollView.add( myUi.buildSpacer("horz", 10) );
$.scrollView.add( myUi.buildLabel( warning, form_width, Ti.UI.SIZE, myUi._text_medium, "#ec3c95", myUi._color_ltblue,"left" ) );

$.scrollView.add( myUi.buildSpacer("horz", 30) );

$.scrollView.add(galleryBtn);
$.scrollView.add(cameraBtn);
  
////////////// PHOTO UPLOAD PROGRESS BAR ///////////////////////////////////////////////////
var progress_bar = myUi.buildProgressBar("uploading profile image");
$.scrollView.add(progress_bar);

 
////////////// PHOTO GALLERY TRIGGER ///////////////////////////////////////////////////
galleryBtn.addEventListener('click', function(e) {
	progress_bar.show();
	cameraBtn.hide();
	galleryBtn.hide();
	Titanium.Media.openPhotoGallery({
		///////   	SUCCESS  	////////////
		success : function(event) {
		    var image 		= event.media;
			var resized_img = image.imageAsResized(750, 750);
		    var xhr 		= Titanium.Network.createHTTPClient();
			xhr.setRequestHeader("contentType", "multipart/form-data");				
		    xhr.open('POST', 'http://waterbowl.net/mobile/upload-image.php');
		    xhr.onerror = function(e) {
		        Ti.API.info('IN ERROR ' + e.error);
		    };
		    xhr.onload = function(response) {
				if ( this.responseText != '') {
			      	var jsonData = JSON.parse(this.responseText);
			      	if (jsonData.status > 0) {
			        	// createSimpleDialog('Success', jsonData.message);
			        	createWindowController('register4','',"slide_left");
			      	} 
			      	else {
			      		cameraBtn.show();
						galleryBtn.show();
			      		createSimpleDialog('Upload Error', jsonData.message);
			      	}	
			    } 
			    else {
	      			cameraBtn.show();
					galleryBtn.show();
					alert( "No response from server" );
		    	}
		    };
		    xhr.onsendstream = function(e) {
		    	progress_bar.value = e.progress;
		    };
		    xhr.send({
				'userfile'	: resized_img,
				'type'		: 'dog',
				'type_ID'	: mySesh.dog.dog_ID		// last dog inserted ID from register2
		    });
		    // Ti.API.debug("    >>> image, dog, mySesh.dog.dog_ID, Banner :: [" + resized_img, 'dog', mySesh.dog.dog_ID, + 'banner' +"]");
		},
		/////////		CANCEL  	////////////
	  	cancel : function() {
		},
		/////////		ERROR  	////////////
		error : function(error) {
	  	},
	  	allowImageEditing : true
	});
});

////////////// CAMERA BUTTON TRIGGER ///////////////////////////////////////////////////
cameraBtn.addEventListener('click', function(e) {
	progress_bar.show();
	cameraBtn.hide();
	galleryBtn.hide();

	Titanium.Media.showCamera({
		///////   	SUCCESS
		success : function(event) {
	    var image 		= event.media;
	    var resized_img = image.imageAsResized(750, 750);
	    
	    // XHR request
	    var xhr = Titanium.Network.createHTTPClient();
		xhr.setRequestHeader("contentType", "multipart/form-data");				
	    xhr.open('POST', 'http://waterbowl.net/mobile/upload-image.php');
	    xhr.onerror = function(e) {
	        Ti.API.info('IN ERROR ' + e.error);
	    };
	    xhr.onload = function(response) {
			if ( this.responseText != ''){
	      		var jsonData = JSON.parse(this.responseText);
		      	if (jsonData.status>0) {
		        	// createSimpleDialog('Success', jsonData.message);
		        	createWindowController('register4','',"slide_left");
		        	// TODO:  take user to register4 screen where they get to see the fully built profile
		      	} else {
		      		cameraBtn.show();
					galleryBtn.show();
		      		createSimpleDialog('Upload Error', jsonData.message);
		      	}	
	     	} else {
      			cameraBtn.show();
				galleryBtn.show();
				alert( "No response from server" );
			}
		};
	    xhr.onsendstream = function(e) {
	    	progress_bar.value = e.progress;
	    };
	    xhr.send({
			'userfile'	: resized_img,
			'type'		: 'dog',
			'type_ID'	: mySesh.dog.dog_ID	// last dog inserted ID from register2
	    });
	    Ti.API.debug("    >>> image, dog, mySesh.dog.dog_ID, Banner :: [" + image, mySesh.dog.dog_ID +"]");  
		},
		/////////		CANCEL
		cancel : function() {
		},
		/////////		ERROR
		error : function(error) {
		},
	  allowImageEditing : true
	});
});

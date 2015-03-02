
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

var dog_name = (mySesh.dog.name==null ? "your dog" : mySesh.dog.name);
var form_width 		= myUiFactory._form_width;
var title_label	 	= myUiFactory.buildLabel( dog_name + "'s Furry Mug", form_width, myUiFactory._height_header, myUiFactory._text_large, "#ec3c95", myUiFactory._color_ltblue,"left" );	

var dog_intro 		= "Last step! All we now is a clear photo of your dog so they are easily identifiable by other Waterbowl members.";
var warning 			= "Note:  No humans or other dogs allowed.";

var galleryBtn 		= myUiFactory.buildButton( "galleryBtn", "upload from gallery", "xxl" );
var cameraBtn 		= myUiFactory.buildButton( "cameraBtn", "use camera", "xxl" );

$.scrollView.add( myUiFactory.buildSpacer("horz", 20) );
$.scrollView.add( title_label );
$.scrollView.add( myUiFactory.buildSpacer("horz", 10) );

$.scrollView.add( myUiFactory.buildLabel( dog_intro, form_width, Ti.UI.SIZE, myUiFactory._text_medium, "#000000", myUiFactory._color_ltblue,"left" ) );
$.scrollView.add( myUiFactory.buildSpacer("horz", 10) );
$.scrollView.add( myUiFactory.buildLabel( warning, form_width, Ti.UI.SIZE, myUiFactory._text_large, "#ec3c95", myUiFactory._color_ltblue,"left" ) );

$.scrollView.add( myUiFactory.buildSpacer("horz", 30) );

$.scrollView.add(galleryBtn);
$.scrollView.add(cameraBtn);
  
////////////// PHOTO UPLOAD PROGRESS BAR ///////////////////////////////////////////////////
var progress_bar = myUiFactory.buildProgressBar("Uploading Profile Image");
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
		    var xhr 	= Titanium.Network.createHTTPClient();
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
				'userfile'		: resized_img,
				'type'			: 'dog',
				'type_ID'		: mySesh.dog.dog_ID		// last dog inserted ID from register2
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

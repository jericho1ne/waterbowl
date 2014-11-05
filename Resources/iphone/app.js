function zeroPad(number, width) {
    width -= number.toString().length;
    if (width > 0) return new Array(width + (/\./.test(number) ? 2 : 1)).join("0") + number;
    return number + "";
}

function uploadFromCamera() {
    Titanium.Media.showCamera({
        success: function(event) {
            Ti.API.debug(" * Selected media type was: " + event.mediaType);
            if (event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
                var fileInfoArray = uploadToAWS(event.media);
                return fileInfoArray;
            }
            alert("Hmm, this seems to be a " + event.mediaType + ". Please select a photo instead.  =) ");
        },
        cancel: function() {
            Ti.API.info("Camera snapshot canceled by user");
        },
        error: function(error) {
            var a = Titanium.UI.createAlertDialog({
                title: "Camera"
            });
            a.setMessage(error.code == Titanium.Media.NO_CAMERA ? "Please run this test on device" : "Unexpected error: " + error.code);
            a.show();
        },
        saveToPhotoGallery: true,
        allowEditing: true,
        mediaTypes: [ Ti.Media.MEDIA_TYPE_VIDEO, Ti.Media.MEDIA_TYPE_PHOTO ]
    });
    return null;
}

function uploadFromGallery(photoPlaceholder) {
    Titanium.Network.online ? Titanium.Media.openPhotoGallery({
        success: function(event) {
            Ti.API.info(event.media);
            var fileInfoArray = uploadToAWS(event.media, photoPlaceholder);
            return fileInfoArray;
        }
    }) : alert("Internet connection unavailable");
    return null;
}

function uploadToAWS(event_media, photoPlaceholder) {
    var filename = Ti.Platform.createUUID() + ".jpg";
    sessionVars.user.dog_photo = filename;
    photoPlaceholder.image = filehandle;
    var filehandle = Ti.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, filename);
    filehandle.write(event_media);
    Ti.API.info(filename + " || " + filehandle);
    Alloy.Globals.AWS.S3.putObject({
        BucketName: "wb-profiles",
        ObjectName: filename,
        File: filehandle,
        Expires: 3e4
    }, function(data) {
        Ti.API.info(JSON.stringify(data));
    }, function(message, error) {
        Ti.API.error(message);
        Ti.API.info(JSON.stringify(error));
    });
    return {
        filename: filename,
        filehandle: filehandle
    };
}

var Alloy = require("alloy"), _ = Alloy._, Backbone = Alloy.Backbone;

Ti.API.info("Ti.Platform.displayCaps.density: " + Ti.Platform.displayCaps.density);

Ti.API.info("Ti.Platform.displayCaps.dpi: " + Ti.Platform.displayCaps.dpi);

Ti.API.info("Ti.Platform.displayCaps.platformHeight: " + Ti.Platform.displayCaps.platformHeight);

Ti.API.info("Ti.Platform.displayCaps.platformWidth: " + Ti.Platform.displayCaps.platformWidth);

if ("android" === Ti.Platform.osname) {
    Ti.API.info("Ti.Platform.displayCaps.xdpi: " + Ti.Platform.displayCaps.xdpi);
    Ti.API.info("Ti.Platform.displayCaps.ydpi: " + Ti.Platform.displayCaps.ydpi);
    Ti.API.info("Ti.Platform.displayCaps.logicalDensityFactor: " + Ti.Platform.displayCaps.logicalDensityFactor);
}

var sessionVars = {
    user: {
        owner_ID: null,
        username: null,
        password: null,
        dog_id: null,
        dog_name: null,
        dog_photo: null
    },
    windowStack: [],
    currentWindow: "index",
    lastWindow: null,
    lat: 34.024,
    lon: -118.394,
    currentPlace: {
        ID: 1,
        name: null,
        bg_img: null,
        city: null
    },
    checkinInProgress: null,
    checkedIn: 1,
    lastCheckIn: null,
    checkinTimestamp: null,
    AWS: {
        access_key_id: "AKIAILLMVRRDGDBDZ5XQ",
        secret_access: "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",
        base_url: "http://s3.amazonaws.com/wb-profiles/"
    }
};

Ti.App.Properties.setString("user", "jericho1ne@yahoo.com");

Ti.App.Properties.setString("pass", "mihai1");

var winStack = [];

Ti.App.Properties.windowStack = winStack;

Ti.App.Properties.current_window_name = null;

Alloy.Globals.AWS = require("ti.aws");

Alloy.Globals.AWS.authorize(sessionVars.AWS.access_key_id, sessionVars.AWS.secret_access);

Ti.Geolocation.distanceFilter = 20;

Ti.Geolocation.purpose = "Receive User Location";

Ti.API.info("Running on an [" + Ti.Platform.osname + "] device");

"iphone" === Ti.Platform.osname ? Alloy.Globals.Map = require("ti.map") : "android" == Ti.Platform.osname && (Alloy.Globals.Map = Ti.Map);

var longPress;

Alloy.createController("index");
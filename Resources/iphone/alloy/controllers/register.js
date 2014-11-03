function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function checkemail(emailAddress) {
        var email_test;
        var str = emailAddress;
        var filter = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        email_test = filter.test(str) ? true : false;
        return email_test;
    }
    function registerNewUser() {
        if ("" != $.nickname.value && "" != $.password1.value && "" != $.password2.value && "" != $.email.value) if ($.password1.value != $.password2.value) {
            var error = Titanium.UI.createAlertDialog({
                title: "Passwords do not match",
                message: "Please handle that and try again"
            });
            error.show();
        } else if (checkemail($.email.value)) {
            $.createBtn.enabled = false;
            $.createBtn.opacity = .3;
            createAccountRequest.open("POST", "http://www.waterbowl.net/mobile/create-account.php");
            var params = {
                nick: $.nickname.value,
                pwd: $.password1.value,
                email: $.email.value
            };
            createAccountRequest.send(params);
        } else {
            var error = Titanium.UI.createAlertDialog({
                title: "Email error",
                message: "Please enter a valid email"
            });
            error.show();
        } else {
            var error = Titanium.UI.createAlertDialog({
                title: "Eror",
                message: "All fields are required"
            });
            error.show();
        }
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "register";
    if (arguments[0]) {
        {
            __processArg(arguments[0], "__parentSymbol");
        }
        {
            __processArg(arguments[0], "$model");
        }
        {
            __processArg(arguments[0], "__itemTemplate");
        }
    }
    var $ = this;
    var exports = {};
    var __defers = {};
    $.__views.register = Ti.UI.createWindow({
        exitOnClose: "true",
        fullscreen: "false",
        horizontalWrap: "true",
        backgroundColor: "#DCF1FC",
        id: "register"
    });
    $.__views.register && $.addTopLevelView($.__views.register);
    $.__views.menubar = Ti.UI.createView({
        layout: "horizontal",
        height: 36,
        width: "100%",
        top: 18,
        backgroundColor: "#58c6d5",
        borderColor: "#ffffff",
        borderWidth: 0,
        opacity: 1,
        zIndex: 99,
        id: "menubar"
    });
    $.__views.register.add($.__views.menubar);
    $.__views.menuLeft = Ti.UI.createView({
        layout: "vertical",
        height: "100%",
        width: "20%",
        borderColor: "#000",
        borderWidth: 0,
        id: "menuLeft"
    });
    $.__views.menubar.add($.__views.menuLeft);
    $.__views.backBtn = Ti.UI.createButton({
        color: "#fff",
        backgroundColor: "#ec3c95",
        width: Ti.UI.SIZE,
        height: 28,
        borderRadius: 14,
        borderWidth: 0,
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        zIndex: 10,
        font: {
            fontFamily: "Raleway-Bold",
            fontSize: 13
        },
        title: "<<",
        opacity: 1,
        left: 2,
        id: "backBtn"
    });
    $.__views.menuLeft.add($.__views.backBtn);
    $.__views.menuCenter = Ti.UI.createView({
        layout: "vertical",
        height: "100%",
        width: "60%",
        borderColor: "#000",
        borderWidth: 0,
        id: "menuCenter"
    });
    $.__views.menubar.add($.__views.menuCenter);
    $.__views.wbLogoMenubar = Ti.UI.createLabel({
        font: {
            fontFamily: "Raleway-Light",
            fontSize: 18,
            color: "#ffffff"
        },
        width: Ti.UI.SIZE,
        height: 28,
        color: "#ffffff",
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
        text: "waterbowl",
        top: 0,
        id: "wbLogoMenubar"
    });
    $.__views.menuCenter.add($.__views.wbLogoMenubar);
    $.__views.menuRight = Ti.UI.createView({
        layout: "vertical",
        height: "100%",
        width: Ti.UI.FILL,
        borderColor: "#000",
        borderWidth: 0,
        id: "menuRight"
    });
    $.__views.menubar.add($.__views.menuRight);
    $.__views.infoBtn = Ti.UI.createButton({
        color: "#fff",
        backgroundColor: "#ec3c95",
        width: Ti.UI.SIZE,
        height: 28,
        borderRadius: 14,
        borderWidth: 0,
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        zIndex: 10,
        font: {
            fontFamily: "Raleway-Bold",
            fontSize: 13
        },
        title: "(i)",
        opacity: 1,
        right: 2,
        id: "infoBtn"
    });
    $.__views.menuRight.add($.__views.infoBtn);
    $.__views.__alloyId7 = Ti.UI.createScrollView({
        layout: "vertical",
        contentHeight: "auto",
        showVerticalScrollIndicator: "true",
        showHorizontalScrollIndicator: "true",
        id: "__alloyId7"
    });
    $.__views.register.add($.__views.__alloyId7);
    $.__views.__alloyId8 = Ti.UI.createLabel({
        font: {
            fontFamily: "Raleway-Light",
            fontSize: 14,
            color: "#ffffff"
        },
        width: "100%",
        height: 26,
        color: "#000000",
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
        text: "email",
        id: "__alloyId8"
    });
    $.__views.__alloyId7.add($.__views.__alloyId8);
    $.__views.email = Ti.UI.createTextField({
        autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
        autocorrect: false,
        backgroundColor: "#ffffff",
        color: "#777477",
        width: "50%",
        height: 30,
        font: {
            fontFamily: "Raleway-Light",
            fontSize: 14
        },
        keyboardType: Titanium.UI.KEYBOARD_DEFAULT,
        returnKeyType: Titanium.UI.RETURNKEY_DEFAULT,
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        hintText: "email address",
        id: "email"
    });
    $.__views.__alloyId7.add($.__views.email);
    $.__views.__alloyId9 = Ti.UI.createLabel({
        font: {
            fontFamily: "Raleway-Light",
            fontSize: 14,
            color: "#ffffff"
        },
        width: "100%",
        height: 26,
        color: "#000000",
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
        text: "password",
        id: "__alloyId9"
    });
    $.__views.__alloyId7.add($.__views.__alloyId9);
    $.__views.password1 = Ti.UI.createTextField({
        autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
        autocorrect: false,
        backgroundColor: "#ffffff",
        color: "#777477",
        width: "50%",
        height: 30,
        font: {
            fontFamily: "Raleway-Light",
            fontSize: 14
        },
        keyboardType: Titanium.UI.KEYBOARD_DEFAULT,
        returnKeyType: Titanium.UI.RETURNKEY_DEFAULT,
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        hintText: "pick something tricky",
        passwordMask: true,
        id: "password1"
    });
    $.__views.__alloyId7.add($.__views.password1);
    $.__views.password2 = Ti.UI.createTextField({
        autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
        autocorrect: false,
        backgroundColor: "#ffffff",
        color: "#777477",
        width: "50%",
        height: 30,
        font: {
            fontFamily: "Raleway-Light",
            fontSize: 14
        },
        keyboardType: Titanium.UI.KEYBOARD_DEFAULT,
        returnKeyType: Titanium.UI.RETURNKEY_DEFAULT,
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        hintText: "one more time please",
        passwordMask: true,
        id: "password2"
    });
    $.__views.__alloyId7.add($.__views.password2);
    $.__views.__alloyId10 = Ti.UI.createLabel({
        font: {
            fontFamily: "Raleway-Light",
            fontSize: 14,
            color: "#ffffff"
        },
        width: "100%",
        height: 26,
        color: "#000000",
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
        text: "your name or nickname",
        id: "__alloyId10"
    });
    $.__views.__alloyId7.add($.__views.__alloyId10);
    $.__views.nickname = Ti.UI.createTextField({
        autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
        autocorrect: false,
        backgroundColor: "#ffffff",
        color: "#777477",
        width: "50%",
        height: 30,
        font: {
            fontFamily: "Raleway-Light",
            fontSize: 14
        },
        keyboardType: Titanium.UI.KEYBOARD_DEFAULT,
        returnKeyType: Titanium.UI.RETURNKEY_DEFAULT,
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        hintText: "this is not required",
        id: "nickname"
    });
    $.__views.__alloyId7.add($.__views.nickname);
    $.__views.uploadGalleryPhoto = Ti.UI.createButton({
        color: "#fff",
        backgroundColor: "#ec3c95",
        width: "50%",
        height: 35,
        borderRadius: 3,
        borderWidth: 0,
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        zIndex: 10,
        font: {
            fontFamily: "Raleway-Bold",
            fontSize: 13
        },
        title: "Choose from Gallery",
        id: "uploadGalleryPhoto"
    });
    $.__views.__alloyId7.add($.__views.uploadGalleryPhoto);
    uploadFromGallery ? $.__views.uploadGalleryPhoto.addEventListener("click", uploadFromGallery) : __defers["$.__views.uploadGalleryPhoto!click!uploadFromGallery"] = true;
    $.__views.uploadCameraPhoto = Ti.UI.createButton({
        color: "#fff",
        backgroundColor: "#ec3c95",
        width: "50%",
        height: 35,
        borderRadius: 3,
        borderWidth: 0,
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        zIndex: 10,
        font: {
            fontFamily: "Raleway-Bold",
            fontSize: 13
        },
        title: "Take a Snapshot",
        id: "uploadCameraPhoto"
    });
    $.__views.__alloyId7.add($.__views.uploadCameraPhoto);
    uploadFromCamera ? $.__views.uploadCameraPhoto.addEventListener("click", uploadFromCamera) : __defers["$.__views.uploadCameraPhoto!click!uploadFromCamera"] = true;
    $.__views.createBtn = Ti.UI.createButton({
        color: "#fff",
        backgroundColor: "#ec3c95",
        width: "50%",
        height: 35,
        borderRadius: 3,
        borderWidth: 0,
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        zIndex: 10,
        font: {
            fontFamily: "Raleway-Bold",
            fontSize: 13
        },
        title: "create account",
        id: "createBtn"
    });
    $.__views.__alloyId7.add($.__views.createBtn);
    registerNewUser ? $.__views.createBtn.addEventListener("click", registerNewUser) : __defers["$.__views.createBtn!click!registerNewUser"] = true;
    exports.destroy = function() {};
    _.extend($, $.__views);
    var createAccountRequest = Titanium.Network.createHTTPClient();
    createAccountRequest.onload = function() {
        var json = this.responseText;
        Ti.API.log("*** create-account.php ***" + json);
        Titanium.API.info(json);
        var response = JSON.parse(json);
        if (1 == response.logged) {
            var alertDialog = Titanium.UI.createAlertDialog({
                title: "Done!",
                message: response.message,
                buttonNames: [ "OK" ]
            });
            alertDialog.show();
            $.email.value = "";
            $.password1.value = "";
            $.password2.value = "";
            $.nickname.value = "";
        } else {
            var error = Titanium.UI.createAlertDialog({
                title: "Cannot create account",
                message: response.message
            });
            error.show();
        }
        $.createBtn.enabled = true;
        $.createBtn.opacity = 1;
    };
    Ti.UI.createAnimation({
        transform: Ti.UI.create2DMatrix().scale(.5),
        duration: 500,
        curve: Titanium.UI.ANIMATION_CURVE_LINEAR
    });
    $.backBtn.addEventListener("click", function() {
        $.register.close({
            top: 800,
            opacity: .2,
            duration: 420,
            curve: Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT
        });
        $.register = null;
    });
    __defers["$.__views.uploadGalleryPhoto!click!uploadFromGallery"] && $.__views.uploadGalleryPhoto.addEventListener("click", uploadFromGallery);
    __defers["$.__views.uploadCameraPhoto!click!uploadFromCamera"] && $.__views.uploadCameraPhoto.addEventListener("click", uploadFromCamera);
    __defers["$.__views.createBtn!click!registerNewUser"] && $.__views.createBtn.addEventListener("click", registerNewUser);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function goToLogin() {
        Ti.API.log("* Login clicked *");
        if ("" != $.email.value && "" != $.password.value) {
            loginRequest.open("POST", "http://www.waterbowl.net/mobile/login.php");
            var params = {
                email: $.email.value,
                pass: $.password.value
            };
            loginRequest.send(params);
        } else {
            var responseAlert = Titanium.UI.createAlertDialog({
                title: "Login Error",
                message: "Please fill in both fields."
            });
            responseAlert.show();
        }
    }
    function goToRegister() {
        Ti.API.log("* Register clicked * ");
        var register = Alloy.createController("register").getView();
        register.top = 800;
        register.opacity = .15;
        register.open({
            top: 0,
            opacity: 1,
            duration: 400,
            curve: Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT
        });
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "index";
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
    $.__views.index = Ti.UI.createWindow({
        exitOnClose: true,
        fullscreen: "false",
        horizontalWrap: "true",
        backgroundColor: "#DCF1FC",
        height: Ti.UI.FILL,
        zIndex: 1,
        layout: "vertical",
        width: "100%",
        backgroundImage: "images/waterbowl-splash-screen.jpg",
        id: "index"
    });
    $.__views.index && $.addTopLevelView($.__views.index);
    $.__views.appTitle = Ti.UI.createLabel({
        font: {
            fontFamily: "Raleway-ExtraLight",
            fontSize: 36
        },
        width: "100%",
        height: 26,
        color: "#ffffff",
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
        top: 160,
        zIndex: 2,
        shadowColor: "#777477",
        shadowOffset: {
            x: 1,
            y: 1
        },
        shadowRadius: 2,
        text: "waterbowl",
        id: "appTitle"
    });
    $.__views.index.add($.__views.appTitle);
    $.__views.loginStuff = Ti.UI.createView({
        layout: "vertical",
        height: Ti.UI.SIZE,
        top: 20,
        width: "100%",
        id: "loginStuff"
    });
    $.__views.index.add($.__views.loginStuff);
    $.__views.email = Ti.UI.createTextField({
        autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
        autocorrect: false,
        backgroundColor: "#ffffff",
        color: "#777477",
        width: "50%",
        height: 25,
        font: {
            fontFamily: "Raleway-Light",
            fontSize: 14
        },
        keyboardType: Titanium.UI.KEYBOARD_DEFAULT,
        returnKeyType: Titanium.UI.RETURNKEY_DEFAULT,
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        hintText: "Email",
        zIndex: 2,
        opacity: .9,
        id: "email"
    });
    $.__views.loginStuff.add($.__views.email);
    $.__views.password = Ti.UI.createTextField({
        autocapitalization: Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE,
        autocorrect: false,
        backgroundColor: "#ffffff",
        color: "#777477",
        width: "50%",
        height: 25,
        font: {
            fontFamily: "Raleway-Light",
            fontSize: 14
        },
        keyboardType: Titanium.UI.KEYBOARD_DEFAULT,
        returnKeyType: Titanium.UI.RETURNKEY_DEFAULT,
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        top: 10,
        hintText: "Password",
        passwordMask: true,
        zIndex: 2,
        opacity: .9,
        id: "password"
    });
    $.__views.loginStuff.add($.__views.password);
    $.__views.loginBtn = Ti.UI.createButton({
        color: "#fff",
        backgroundColor: "#777477",
        width: "50%",
        height: 50,
        borderRadius: 3,
        borderWidth: 0,
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        zIndex: 2,
        font: {
            fontFamily: "Raleway-Bold",
            fontSize: 20
        },
        top: 10,
        title: "login",
        opacity: .9,
        id: "loginBtn"
    });
    $.__views.loginStuff.add($.__views.loginBtn);
    goToLogin ? $.__views.loginBtn.addEventListener("click", goToLogin) : __defers["$.__views.loginBtn!click!goToLogin"] = true;
    $.__views.registerBtn = Ti.UI.createButton({
        color: "#fff",
        backgroundColor: "#ec3c95",
        width: "50%",
        height: 50,
        borderRadius: 3,
        borderWidth: 0,
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        zIndex: 2,
        font: {
            fontFamily: "Raleway-Bold",
            fontSize: 20
        },
        top: 10,
        title: "register",
        opacity: .9,
        id: "registerBtn"
    });
    $.__views.loginStuff.add($.__views.registerBtn);
    goToRegister ? $.__views.registerBtn.addEventListener("click", goToRegister) : __defers["$.__views.registerBtn!click!goToRegister"] = true;
    $.__views.footerContainer = Ti.UI.createView({
        layout: "vertical",
        height: Ti.UI.FILL,
        top: 80,
        borderWidth: 0,
        borderColor: "#fff",
        zIndex: 3,
        width: "100%",
        id: "footerContainer"
    });
    $.__views.index.add($.__views.footerContainer);
    $.__views.footer = Ti.UI.createImageView({
        image: "images/WB-FooterBar-White.png",
        opacity: 1,
        bottom: 0,
        width: "100%",
        id: "footer"
    });
    $.__views.footerContainer.add($.__views.footer);
    $.__views.__alloyId1 = Ti.UI.createView({
        layout: "vertical",
        height: Ti.UI.FILL,
        backgroundColor: "#58c6d5",
        id: "__alloyId1"
    });
    $.__views.footerContainer.add($.__views.__alloyId1);
    exports.destroy = function() {};
    _.extend($, $.__views);
    Ti.API.info("*** index.js ***");
    if (true && parseInt(Ti.Platform.version.split(".")[0]) >= 8) {
        Ti.App.iOS.registerUserNotificationSettings({
            types: [ Ti.App.iOS.USER_NOTIFICATION_TYPE_ALERT, Ti.App.iOS.USER_NOTIFICATION_TYPE_SOUND, Ti.App.iOS.UESR_NOTIFICATION_TYPE_BADGE ]
        });
        Ti.API.info("* Running IOS 8 or greater *");
    } else Ti.API.info("* Running IOS 7 or older *");
    $.index.open();
    sessionVars.windowStack.push($.index);
    Ti.API.info("localStack size: " + JSON.stringify(sessionVars.windowStack.length));
    (null != sessionVars.user.email || "" != Ti.App.Properties.getString("user")) && ($.email.value = Ti.App.Properties.getString("user"));
    if (null != sessionVars.user.password || "" != Ti.App.Properties.getString("pass")) {
        $.password.value = sessionVars.user.password;
        $.password.value = Ti.App.Properties.getString("pass");
    }
    var go_here = "register";
    var new_window = Alloy.createController(go_here).getView();
    new_window.open();
    var loginRequest = Titanium.Network.createHTTPClient();
    loginRequest.onload = function() {
        var json = this.responseText;
        var response = JSON.parse(json);
        if (1 == response.status) {
            sessionVars.user.email = $.email.value;
            sessionVars.user.password = $.password.value;
            sessionVars.user.owner_ID = response.owner_ID;
            Ti.API.log("* Saved Creds: " + sessionVars.user.owner_ID + "/" + sessionVars.user.email + "/" + sessionVars.user.password);
            $.email.blur();
            $.password.blur();
            var win = Alloy.createController("map").getView();
            win.open({
                transition: Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT
            });
        } else {
            var responseAlert = Titanium.UI.createAlertDialog({
                title: "Login Error",
                message: response.message
            });
            responseAlert.show();
        }
    };
    __defers["$.__views.loginBtn!click!goToLogin"] && $.__views.loginBtn.addEventListener("click", goToLogin);
    __defers["$.__views.registerBtn!click!goToRegister"] && $.__views.registerBtn.addEventListener("click", goToRegister);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
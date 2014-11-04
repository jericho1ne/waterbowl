function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function updateLabel(e) {
        Ti.API.log("* Slider: " + e.value + " * ");
        var text_estimate = "";
        var int_estimate = "";
        var slider_val = Math.round(e.value);
        if (1 == slider_val) {
            text_estimate = "No dogs :(";
            int_estimate = "0";
        } else if (2 == slider_val) {
            text_estimate = "One lonely dog…";
            int_estimate = "1";
        } else if (3 == slider_val) {
            text_estimate = "A few pups";
            int_estimate = "2-3";
        } else if (4 == slider_val) {
            text_estimate = "Some dogs";
            int_estimate = "4-6";
        } else if (5 == slider_val) {
            text_estimate = "Many dogs";
            int_estimate = "7-10";
        } else if (6 == slider_val) {
            text_estimate = "A lot of dogs!";
            int_estimate = "11-15";
        } else if (7 == slider_val) {
            text_estimate = "It's a full park.";
            int_estimate = "16+";
        }
        $.slider_label.text = text_estimate;
        $.slider_int_val.text = int_estimate;
    }
    function checkIn() {
        var estimate = Math.round($.slider.value);
        Ti.API.log("* Checked in to place ID " + sessionVars.currentPlace.ID + " / " + sessionVars.owner_ID + " / " + estimate + " * ");
        updateEstimates(sessionVars.currentPlace.ID, sessionVars.owner_ID, estimate);
    }
    function updateEstimates(park_ID, owner_ID, estimate) {
        var grabParks = Ti.Network.createHTTPClient();
        grabParks.open("POST", "http://waterbowl.net/mobile/checkin.php");
        var params = {
            park_ID: park_ID,
            owner_ID: owner_ID,
            estimate: estimate
        };
        var response = 0;
        grabParks.send(params);
        grabParks.onload = function() {
            var json = this.responseText;
            if ("" != json) {
                Ti.API.info("* checkin JSON " + json);
                var response = JSON.parse(json);
                if (1 == response.status) {
                    Ti.API.log("* Checked in Successfully *");
                    sessionVars.checkin = true;
                    var timestamp = new Date().getTime();
                    sessionVars.lastCheckIn = timestamp;
                    sessionVars.checkinInProgress = false;
                    Ti.API.log("* timestamp: " + timestamp + " *");
                    $.checkin.close();
                    $.checkin = null;
                    var placeoverview = Alloy.createController("placeoverview").getView();
                    placeoverview.open();
                } else alert("Check in failed.");
            } else alert("No JSON data received.");
        };
        return response;
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "checkin";
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
    $.__views.checkin = Ti.UI.createWindow({
        exitOnClose: "true",
        fullscreen: "false",
        horizontalWrap: "true",
        backgroundColor: "#777477",
        id: "checkin"
    });
    $.__views.checkin && $.addTopLevelView($.__views.checkin);
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
        top: 4,
        opacity: 1,
        left: 2,
        title: "<<",
        id: "backBtn"
    });
    $.__views.checkin.add($.__views.backBtn);
    $.__views.__alloyId0 = Ti.UI.createScrollView({
        layout: "vertical",
        contentHeight: "auto",
        showVerticalScrollIndicator: "true",
        showHorizontalScrollIndicator: "true",
        id: "__alloyId0"
    });
    $.__views.checkin.add($.__views.__alloyId0);
    $.__views.place_checkin = Ti.UI.createLabel({
        font: {
            fontFamily: "Raleway-Light",
            fontSize: 24,
            fontWeight: "bold"
        },
        width: "100%",
        height: 50,
        color: "#000000",
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
        top: 70,
        backgroundColor: "#ccc",
        id: "place_checkin"
    });
    $.__views.__alloyId0.add($.__views.place_checkin);
    $.__views.question = Ti.UI.createLabel({
        font: {
            fontFamily: "Raleway-Light",
            fontSize: 22,
            color: "#ffffff"
        },
        width: "100%",
        height: 100,
        color: "#000000",
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
        text: "How many dogs are playing here?",
        id: "question"
    });
    $.__views.__alloyId0.add($.__views.question);
    $.__views.slider = Ti.UI.createSlider({
        top: "4%",
        height: 50,
        backgroundColor: "#ffffff",
        borderWidth: 0,
        borderRadius: 12,
        min: "1",
        max: "7",
        width: "85%",
        value: "4",
        id: "slider"
    });
    $.__views.__alloyId0.add($.__views.slider);
    updateLabel ? $.__views.slider.addEventListener("change", updateLabel) : __defers["$.__views.slider!change!updateLabel"] = true;
    $.__views.slider_int_val = Ti.UI.createLabel({
        font: {
            fontFamily: "Raleway-Light",
            fontSize: 36,
            fontWeight: "bold"
        },
        width: "100%",
        height: 40,
        color: "#000000",
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
        top: "0%",
        left: "0",
        id: "slider_int_val"
    });
    $.__views.__alloyId0.add($.__views.slider_int_val);
    $.__views.slider_label = Ti.UI.createLabel({
        font: {
            fontFamily: "Raleway-Light",
            fontSize: 24
        },
        width: "100%",
        height: 40,
        color: "#000000",
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
        top: "0%",
        left: "0",
        id: "slider_label"
    });
    $.__views.__alloyId0.add($.__views.slider_label);
    $.__views.checkInBtn = Ti.UI.createButton({
        color: "#fff",
        backgroundColor: "#ec3c95",
        width: "40%",
        height: 40,
        borderRadius: 3,
        borderWidth: 0,
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        zIndex: 10,
        font: {
            fontFamily: "Raleway-Bold",
            fontSize: 18
        },
        title: "Check In",
        top: "10%",
        id: "checkInBtn"
    });
    $.__views.__alloyId0.add($.__views.checkInBtn);
    checkIn ? $.__views.checkInBtn.addEventListener("click", checkIn) : __defers["$.__views.checkInBtn!click!checkIn"] = true;
    exports.destroy = function() {};
    _.extend($, $.__views);
    sessionVars.currentWindow = "checkin";
    $.backBtn.addEventListener("click", function() {
        $.checkin.close({
            transition: Ti.UI.iPhone.AnimationStyle.FLIP_FROM_RIGHT,
            duration: 300,
            curve: Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT
        });
        $.checkin = null;
    });
    $.slider_label.text = "";
    $.slider_int_val.text = "";
    $.place_checkin.text = sessionVars.currentPlace.name;
    Ti.API.log("* Checking in at " + sessionVars.currentPlace.name + "(" + sessionVars.currentPlace.ID + ")");
    __defers["$.__views.slider!change!updateLabel"] && $.__views.slider.addEventListener("change", updateLabel);
    __defers["$.__views.checkInBtn!click!checkIn"] && $.__views.checkInBtn.addEventListener("click", checkIn);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
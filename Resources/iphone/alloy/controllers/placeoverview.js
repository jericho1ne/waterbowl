function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function attachMiniHeader() {
        var miniHeader = Titanium.UI.createView({
            borderRadius: 0,
            id: "miniHeader",
            backgroundColor: "#ccc",
            opacity: .8,
            width: "100%",
            zIndex: 4,
            height: "100dp",
            top: 0
        });
        return miniHeader;
    }
    function getActivity(place_ID) {
        Ti.API.info("* getActivity() called *");
        var query = Ti.Network.createHTTPClient();
        var params = {
            place_ID: place_ID
        };
        query.open("POST", "http://waterbowl.net/mobile/activity.php");
        query.send(params);
        query.onload = function() {
            var jsonResponse = this.responseText;
            new Array();
            if ("" != jsonResponse && "[]" != jsonResponse) {
                var activityJson = JSON.parse(jsonResponse);
                var last_update_photo = sessionVars.AWS.base_url + activityJson[0].dog_photo;
                Ti.API.info("latest update photo: " + last_update_photo);
                $.last_update_thumb.image = last_update_photo;
                var dog_name_label = Ti.UI.createLabel({
                    text: "...",
                    top: 0
                });
                $.addClass(dog_name_label, "feed_label_left_md");
                dog_name_label.text = activityJson[0].dog_name;
                var time_elapsed_label = Ti.UI.createLabel({
                    text: "...",
                    top: 0
                });
                $.addClass(time_elapsed_label, "feed_label_left");
                time_elapsed_label.text = activityJson[0].time_elapsed;
                var dogs_amount_label = Ti.UI.createLabel({
                    text: "...",
                    top: 4
                });
                $.addClass(dogs_amount_label, "feed_label_center_lg");
                dogs_amount_label.text = activityJson[0].amount;
                var dogs_amount_suffix = Ti.UI.createLabel({
                    text: "dogs here",
                    top: -1
                });
                $.addClass(dogs_amount_suffix, "feed_label_center");
                $.last_update_middle.add(dog_name_label);
                $.last_update_middle.add(time_elapsed_label);
                $.last_update_right.add(dogs_amount_label);
                $.last_update_right.add(dogs_amount_suffix);
                activityJson.sort(function(a, b) {
                    return b.rank - a.rank;
                });
                var max = 10;
                for (var i = 1, j = max; j > i; i++) {
                    var feed_item_view = Ti.UI.createView();
                    $.addClass(feed_item_view, "feed_item");
                    var middle_view = Ti.UI.createView();
                    $.addClass(middle_view, "middle_view");
                    var thumb = Ti.UI.createImageView();
                    $.addClass(thumb, "thumbnail_sm");
                    thumb.image = sessionVars.AWS.base_url + activityJson[i].dog_photo;
                    var status_update_label = Ti.UI.createLabel({
                        text: "...",
                        top: 4
                    });
                    $.addClass(status_update_label, "feed_label_left");
                    var dog_name_label = Ti.UI.createLabel({
                        text: "..."
                    });
                    $.addClass(dog_name_label, "feed_label_left");
                    status_update_label.text = activityJson[i].dog_name + " checked in";
                    dog_name_label.text = activityJson[i].dog_name + " saw " + activityJson[i].amount + " dogs 	";
                    middle_view.add(status_update_label);
                    middle_view.add(dog_name_label);
                    var right_view = Ti.UI.createView();
                    var time_elapsed_label = Titanium.UI.createLabel({
                        text: "..."
                    });
                    time_elapsed_label.text = activityJson[i].time_elapsed;
                    $.addClass(right_view, "right_view");
                    $.addClass(time_elapsed_label, "feed_label_right");
                    right_view.add(time_elapsed_label);
                    feed_item_view.add(thumb);
                    feed_item_view.add(middle_view);
                    feed_item_view.add(right_view);
                    $.feedContainer.add(feed_item_view);
                }
            }
        };
    }
    function touchStartClick(e) {
        e.source.touchTimer || (e.source.touchTimer = setInterval(function() {
            e.source.fireEvent("click");
            longPress = 1;
            this.backgroundColor = "#ff38d9";
            this.opacity = "1";
            this.title = "Update";
            Ti.API.log("***** Long Press Start " + longPress + "*****");
        }, 350));
    }
    function touchEndClick(e) {
        if (e.source.touchTimer) {
            clearInterval(e.source.touchTimer);
            if (1 == longPress) {
                longPress = 0;
                this.backgroundColor = "#16dd0c";
                this.opacity = "0.88";
                Ti.API.log("***** Long Press End *****");
            }
            e.source.touchTimer = null;
        }
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "placeoverview";
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
    $.__views.placeoverview = Ti.UI.createWindow({
        exitOnClose: true,
        fullscreen: "false",
        horizontalWrap: "true",
        backgroundColor: "#58c6d5",
        height: Ti.UI.FILL,
        zIndex: 1,
        layout: "vertical",
        width: "100%",
        id: "placeoverview"
    });
    $.__views.placeoverview && $.addTopLevelView($.__views.placeoverview);
    $.__views.menubar = Ti.UI.createView({
        layout: "horizontal",
        height: 36,
        width: "100%",
        top: 18,
        backgroundColor: "#58c6d5",
        opacity: 1,
        zIndex: 99,
        shadowColor: "#222222",
        shadowRadius: 3,
        shadowOffset: {
            x: 2,
            y: 2
        },
        verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
        id: "menubar"
    });
    $.__views.placeoverview.add($.__views.menubar);
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
        top: 4,
        opacity: 1,
        left: 2,
        title: "<<",
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
    $.__views.refreshBtn = Ti.UI.createButton({
        color: "#fff",
        backgroundColor: "#ec3c95",
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 0,
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        zIndex: 10,
        font: {
            fontFamily: "Raleway-Bold",
            fontSize: 13
        },
        title: "%",
        opacity: 1,
        right: 2,
        id: "refreshBtn"
    });
    $.__views.menuRight.add($.__views.refreshBtn);
    $.__views.scrollView = Ti.UI.createScrollView({
        layout: "vertical",
        contentHeight: "auto",
        showVerticalScrollIndicator: "true",
        showHorizontalScrollIndicator: "true",
        backgroundColor: "#fff",
        id: "scrollView",
        height: "100%",
        width: "100%"
    });
    $.__views.placeoverview.add($.__views.scrollView);
    $.__views.headerContainer = Ti.UI.createView({
        layout: "vertical",
        height: "50%",
        top: 0,
        width: "100%",
        backgroundImage: "images/places/obrd-header.jpg",
        id: "headerContainer"
    });
    $.__views.scrollView.add($.__views.headerContainer);
    $.__views.headerTop = Ti.UI.createView({
        layout: "vertical",
        height: "60%",
        width: "100%",
        top: 20,
        left: 0,
        id: "headerTop"
    });
    $.__views.headerContainer.add($.__views.headerTop);
    $.__views.__alloyId2 = Ti.UI.createView({
        layout: "vertical",
        height: 100,
        width: "100%",
        id: "__alloyId2"
    });
    $.__views.headerTop.add($.__views.__alloyId2);
    $.__views.__alloyId3 = Ti.UI.createView({
        layout: "vertical",
        height: Ti.UI.FILL,
        width: 100,
        id: "__alloyId3"
    });
    $.__views.headerTop.add($.__views.__alloyId3);
    $.__views.__alloyId4 = Ti.UI.createView({
        layout: "vertical",
        height: "100%",
        width: Ti.UI.FILL,
        right: 0,
        id: "__alloyId4"
    });
    $.__views.headerTop.add($.__views.__alloyId4);
    $.__views.checkin_button = Ti.UI.createButton({
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
        opacity: 0,
        id: "checkin_button"
    });
    $.__views.__alloyId4.add($.__views.checkin_button);
    $.__views.headerBottom = Ti.UI.createView({
        layout: "vertical",
        height: Ti.UI.SIZE,
        width: "100%",
        left: 0,
        top: -6,
        opacity: .7,
        backgroundColor: "#ffffff",
        id: "headerBottom"
    });
    $.__views.headerContainer.add($.__views.headerBottom);
    $.__views.place_name_label = Ti.UI.createLabel({
        font: {
            fontFamily: "Raleway-Light",
            fontSize: 20
        },
        width: Ti.UI.SIZE,
        height: "auto",
        color: "#000000",
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
        left: 6,
        id: "place_name_label",
        text: ".place name."
    });
    $.__views.headerBottom.add($.__views.place_name_label);
    $.__views.place_addr_label = Ti.UI.createLabel({
        font: {
            fontFamily: "Raleway-Light",
            fontSize: 12
        },
        width: Ti.UI.SIZE,
        height: "auto",
        color: "#000000",
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
        left: 6,
        id: "place_addr_label",
        text: ".street addr."
    });
    $.__views.headerBottom.add($.__views.place_addr_label);
    $.__views.place_city_label = Ti.UI.createLabel({
        font: {
            fontFamily: "Raleway-Light",
            fontSize: 12
        },
        width: Ti.UI.SIZE,
        height: "auto",
        color: "#000000",
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
        left: 6,
        id: "place_city_label",
        text: ".city zip."
    });
    $.__views.headerBottom.add($.__views.place_city_label);
    $.__views.place_dist_label = Ti.UI.createLabel({
        font: {
            fontFamily: "Raleway-Light",
            fontSize: 12
        },
        width: Ti.UI.SIZE,
        height: "auto",
        color: "#000000",
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
        left: 6,
        id: "place_dist_label",
        text: ".distance."
    });
    $.__views.headerBottom.add($.__views.place_dist_label);
    $.__views.__alloyId5 = Ti.UI.createView({
        layout: "horizontal",
        height: 65,
        width: "100%",
        left: 0,
        top: 0,
        backgroundColor: "#58c6d5",
        id: "__alloyId5"
    });
    $.__views.scrollView.add($.__views.__alloyId5);
    $.__views.last_update_thumb = Ti.UI.createImageView({
        image: "images/missing/dog-icon.png",
        height: 60,
        width: 60,
        borderRadius: 14,
        left: 4,
        top: 2,
        id: "last_update_thumb"
    });
    $.__views.__alloyId5.add($.__views.last_update_thumb);
    $.__views.last_update_middle = Ti.UI.createView({
        layout: "vertical",
        height: "100%",
        width: "50%",
        left: 2,
        borderColor: "#ccc",
        borderWidth: 0,
        id: "last_update_middle"
    });
    $.__views.__alloyId5.add($.__views.last_update_middle);
    $.__views.__alloyId6 = Ti.UI.createLabel({
        font: {
            fontFamily: "Raleway-Light",
            fontSize: 12
        },
        width: Ti.UI.SIZE,
        height: "auto",
        color: "#000000",
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
        left: 6,
        text: "latest update",
        id: "__alloyId6"
    });
    $.__views.last_update_middle.add($.__views.__alloyId6);
    $.__views.last_update_right = Ti.UI.createView({
        layout: "vertical",
        height: "100%",
        width: Ti.UI.FILL,
        left: 0,
        borderColor: "#000",
        borderWidth: 0,
        id: "last_update_right"
    });
    $.__views.__alloyId5.add($.__views.last_update_right);
    $.__views.feedContainer = Ti.UI.createView({
        layout: "vertical",
        height: Titanium.UI.SIZE,
        width: "100%",
        top: 0,
        backgroundColor: "#777477",
        id: "feedContainer"
    });
    $.__views.scrollView.add($.__views.feedContainer);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var mini_header_display = 0;
    var miniHeader;
    var args = arguments[0] || {};
    Ti.API.log("* placeoverview.js { #" + args._place_id + " } - " + args._place_name + " | " + args._mobile_bg + " * ");
    $.place_name_label.text = args._place_name;
    $.place_addr_label.text = args._place_address;
    $.place_city_label.text = args._place_city + " " + args._place_zip;
    $.place_dist_label.text = args._place_distance + " miles away";
    $.headerContainer.backgroundImage = "images/places/" + args._mobile_bg;
    sessionVars.currentWindow = "placeoverview";
    getActivity(args._place_id);
    $.backBtn.addEventListener("click", function() {
        $.placeoverview.close({
            top: 800,
            opacity: .2,
            duration: 320,
            curve: Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT
        });
        $.placeoverview = null;
    });
    $.refreshBtn.addEventListener("click", function() {
        Ti.API.info("* Should be refreshing the feed... *");
    });
    $.scrollView.addEventListener("scroll", function(e) {
        if (null != e.y) {
            var offsetY = e.y;
            if (offsetY >= 230 && null != offsetY && 0 == mini_header_display) {
                miniHeader = attachMiniHeader();
                $.placeoverview.add(miniHeader);
                Titanium.API.info(" * scrollView Y offset: " + offsetY);
                mini_header_display = 1;
                Titanium.API.info(" * miniHeader attached * " + mini_header_display);
            } else if (230 > offsetY && null != offsetY && 1 == mini_header_display) {
                Ti.API.info(" MINIHEADER CONTENTS: " + miniHeader);
                miniHeader = null;
                Titanium.API.info(" * scrollView Y offset: " + offsetY);
                mini_header_display = 0;
                Titanium.API.info(" * miniHeader removed * " + mini_header_display);
            }
        } else Titanium.API.info(" * scrollView Y offset is null");
    });
    if (args._place_id == sessionVars.currentPlace.ID && 1 == sessionVars.checkedIn) {
        $.checkin_button.opacity = 1;
        $.checkin_button.addEventListener("touchstart", touchStartClick);
        $.checkin_button.addEventListener("touchend", touchEndClick);
        $.checkin_button.addEventListener("touchcancel", touchEndClick);
    }
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
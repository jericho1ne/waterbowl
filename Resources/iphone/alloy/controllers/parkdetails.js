function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "parkdetails";
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
    $.__views.parkdetails = Ti.UI.createWindow({
        exitOnClose: true,
        fullscreen: "false",
        horizontalWrap: "true",
        backgroundColor: "#DCF1FC",
        height: Ti.UI.FILL,
        zIndex: 1,
        layout: "vertical",
        width: "100%",
        id: "parkdetails"
    });
    $.__views.parkdetails && $.addTopLevelView($.__views.parkdetails);
    $.__views.park_name = Ti.UI.createLabel({
        font: {
            fontFamily: "Raleway-Light",
            fontSize: 14
        },
        width: "100%",
        height: 26,
        color: "#000000",
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
        id: "park_name"
    });
    $.__views.parkdetails.add($.__views.park_name);
    $.__views.address = Ti.UI.createLabel({
        font: {
            fontFamily: "Raleway-Light",
            fontSize: 14
        },
        width: "100%",
        height: 26,
        color: "#000000",
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        verticalAlign: Ti.UI.TEXT_VERTICAL_ALIGNMENT_CENTER,
        id: "address"
    });
    $.__views.parkdetails.add($.__views.address);
    exports.destroy = function() {};
    _.extend($, $.__views);
    arguments[0] || {};
    Titanium.UI.currentWindow;
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
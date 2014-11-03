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
    this.__controllerPath = "dogs";
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
    $.__views.dogs = Ti.UI.createWindow({
        exitOnClose: true,
        fullscreen: "false",
        horizontalWrap: "true",
        backgroundColor: "#58c6d5",
        height: Ti.UI.FILL,
        zIndex: 1,
        layout: "vertical",
        width: "100%",
        id: "dogs"
    });
    $.__views.dogs && $.addTopLevelView($.__views.dogs);
    exports.destroy = function() {};
    _.extend($, $.__views);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
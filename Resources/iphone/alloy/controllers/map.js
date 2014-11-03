function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function drawDefaultMap(lat, lon) {
        Alloy.Globals.wbMapView = Alloy.Globals.Map.createView({
            mapType: Alloy.Globals.Map.NORMAL_TYPE,
            region: {
                latitude: lat,
                longitude: lon,
                latitudeDelta: .01,
                longitudeDelta: .01
            },
            zoom: 10,
            top: 0,
            enableZoomControls: true,
            maxZoomLevel: 14,
            minZoomLevel: 2,
            id: "wbMapView",
            animate: true,
            regionFit: true,
            userLocation: true
        });
        $.mapContainer.add(Alloy.Globals.wbMapView);
        Ti.API.log("*** Default Map Created! ***");
    }
    function setRegion(lat, lon) {
        Ti.API.log("* - set Region: " + lat + " / " + lon + " *");
        var region = {
            latitude: lat,
            longitude: lon,
            animate: true,
            latitudeDelta: .01,
            longitudeDelta: .01
        };
        Alloy.Globals.wbMapView.setLocation(region);
    }
    function currentLocation() {
        if (false === Titanium.Geolocation.locationServicesEnabled) {
            Ti.API.debug("Device has GPS turned off. ");
            alert("Please turn on the GPS antenna on your device");
        } else Ti.Geolocation.getCurrentPosition(function(e) {
            if (!e.success || e.error) {
                alert("Unable to find your current location");
                Ti.API.debug(JSON.stringify(e));
                Ti.API.debug(e);
                return;
            }
            Ti.API.info(" ( -+- ) currentLocation: " + e.coords.latitude + "/" + e.coords.longitude);
            var minutes_elapsed = 100;
            if (null != sessionVars.lastCheckIn) {
                var current_ts = new Date().getTime();
                minutes_elapsed = Math.round((sessionVars.lastCheckIn - current_ts) / 6e4);
                Ti.API.info(" * Minutes elapsed since last check-in: " + minutes_elapsed + "* ");
            }
            true != sessionVars.checkinInProgress && minutes_elapsed > 10 && findNearbyPlaces(e.coords.latitude, e.coords.longitude);
            var region = {
                latitude: e.coords.latitude,
                longitude: e.coords.longitude,
                animate: true,
                latitudeDelta: .007,
                longitudeDelta: .007
            };
            Alloy.Globals.wbMapView.setLocation(region);
            var coords = {
                lat: e.coords.latitude,
                lon: e.coords.longitude
            };
            return coords;
        });
    }
    function createMapMarker(row) {
        var annotation = Alloy.Globals.Map.createAnnotation({
            latitude: row.lat,
            longitude: row.lon,
            title: row.name,
            subtitle: row.city + " (" + row.dist + " mi)",
            animate: true,
            image: "images/icons/map-marker.png",
            leftButton: "images/icons/map-marker.png",
            rightView: Ti.UI.createButton({
                title: ">>",
                height: "36",
                width: "36",
                color: "#000",
                backgroundColor: "#eee"
            })
        });
        Alloy.Globals.wbMapView.addAnnotation(annotation);
    }
    function createPlaceList() {
        Ti.API.info("* createPlaceList() called *");
        $.placeList.data = null;
        Alloy.Globals.wbMapView.removeAllAnnotations();
        var place_query = Ti.Network.createHTTPClient();
        99 == sessionVars.owner_ID ? place_query.open("POST", "http://waterbowl.net/mobile/places-admin.php") : place_query.open("POST", "http://waterbowl.net/mobile/places.php");
        var params = {
            lat: sessionVars.lat,
            lon: sessionVars.lon
        };
        place_query.send(params);
        place_query.onload = function() {
            var jsonResponse = this.responseText;
            if ("" != jsonResponse) {
                var jsonPlaces = JSON.parse(jsonResponse);
                Ti.API.log("* JSON array " + jsonPlaces);
                jsonPlaces.sort(function(a, b) {
                    return parseFloat(a.dist) - parseFloat(b.dist);
                });
                var placeData = new Array();
                for (var i = 0; i < jsonPlaces.length; i++) {
                    var icon = "images/icons/map-park.png";
                    placeData.push(Ti.UI.createTableViewRow({
                        id: jsonPlaces[i].id,
                        lat: jsonPlaces[i].lat,
                        lon: jsonPlaces[i].lon,
                        title: jsonPlaces[i].name,
                        address: jsonPlaces[i].address,
                        city: jsonPlaces[i].city,
                        zip: jsonPlaces[i].zip,
                        distance: jsonPlaces[i].dist,
                        mobile_bg: jsonPlaces[i].mobile_bg,
                        leftImage: icon,
                        hasChild: true,
                        height: 34,
                        left: 4,
                        color: "#fff",
                        width: "auto",
                        textAlign: "left",
                        font: {
                            fontSize: 14
                        }
                    }));
                    createMapMarker(jsonPlaces[i]);
                }
                $.placeList.data = placeData;
            }
        };
    }
    function findNearbyPlaces(lat, lon) {
        var place_query = Ti.Network.createHTTPClient();
        1 == sessionVars.owner_ID ? place_query.open("POST", "http://waterbowl.net/mobile/place-proximity-admin.php") : place_query.open("POST", "http://waterbowl.net/mobile/place-proximity.php");
        var params = {
            lat: lat,
            lon: lon
        };
        place_query.send(params);
        place_query.onload = function() {
            var jsonResponse = this.responseText;
            if ("" != jsonResponse) {
                Ti.API.info("*** nearby locations " + jsonResponse);
                var placesArray = JSON.parse(jsonResponse);
                if (1 == placesArray.nearby) {
                    sessionVars.currentPlace.ID = placesArray.places[0].id;
                    sessionVars.currentPlace.name = placesArray.places[0].name;
                    sessionVars.currentPlace.city = placesArray.places[0].city;
                    Ti.API.info("*** close to " + sessionVars.currentPlace.name);
                    var optns = {
                        options: [ "Yes", "Cancel" ],
                        cancel: 1,
                        selectedIndex: 0,
                        destructive: 0,
                        title: "Check in at " + sessionVars.currentPlace.name + "?"
                    };
                    var dialog = Ti.UI.createOptionDialog(optns);
                    true != sessionVars.checkinInProgress && dialog.show();
                    sessionVars.checkinInProgress = true;
                    dialog.addEventListener("click", function(e) {
                        if (0 == e.index) {
                            var checkinPage = Alloy.createController("checkin").getView();
                            checkinPage.open({
                                transition: Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT
                            });
                        } else 1 == e.index && (sessionVars.checkinInProgress = false);
                    });
                }
            }
        };
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "map";
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
    $.__views.map = Ti.UI.createWindow({
        exitOnClose: true,
        fullscreen: "false",
        horizontalWrap: "true",
        backgroundColor: "#58c6d5",
        height: Ti.UI.FILL,
        zIndex: 1,
        layout: "vertical",
        width: "100%",
        id: "map"
    });
    $.__views.map && $.addTopLevelView($.__views.map);
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
    $.__views.map.add($.__views.backBtn);
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
    $.__views.map.add($.__views.refreshBtn);
    $.__views.mapContainer = Ti.UI.createView({
        layout: "vertical",
        height: "60%",
        width: "100%",
        top: 0,
        id: "mapContainer"
    });
    $.__views.map.add($.__views.mapContainer);
    $.__views.placeListContainer = Ti.UI.createView({
        layout: "vertical",
        height: Ti.UI.FILL,
        width: "100%",
        id: "placeListContainer"
    });
    $.__views.map.add($.__views.placeListContainer);
    $.__views.placeList = Ti.UI.createTableView({
        color: "#efefef",
        bottom: 0,
        height: 150,
        width: "100%",
        backgroundColor: "#58c6d5",
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        borderColor: "#fff",
        zIndex: 2,
        borderRadius: 0,
        opacity: .96,
        scrollable: true,
        borderWidth: 0,
        scrollIndicatorStyle: Ti.UI.iPhone.ScrollIndicatorStyle.BLACK,
        showVerticalScrollIndicator: true,
        id: "placeList"
    });
    $.__views.placeListContainer.add($.__views.placeList);
    exports.destroy = function() {};
    _.extend($, $.__views);
    $.map.open();
    sessionVars.currentWindow = "map";
    Ti.Geolocation.getCurrentPosition(function(e) {
        if (e.error) Ti.API.info(" (x) Cannot seem to get your current location (x) "); else {
            sessionVars.lat = e.coords.latitude;
            sessionVars.lon = e.coords.longitude;
        }
        Ti.API.info("*** Drawing the Map ***");
        drawDefaultMap(sessionVars.lat, sessionVars.lon);
        createPlaceList();
    });
    Ti.Geolocation.addEventListener("location", function() {
        Ti.API.info(" ( -+- ) location event listener trigger ");
        currentLocation();
    });
    $.placeList.addEventListener("click", function(e) {
        Ti.API.info(" * clicked on [ " + e.rowData.title + " ] in POI List");
        setRegion(e.rowData.lat, e.rowData.lon);
        Ti.API.info(" * sending to placeoverview: " + e.rowData.id + ", " + e.rowData.title + " *");
        var place_overview = Alloy.createController("placeoverview", {
            _place_id: e.rowData.id,
            _place_name: e.rowData.title,
            _place_address: e.rowData.address,
            _place_city: e.rowData.city,
            _place_zip: e.rowData.zip,
            _place_distance: e.rowData.distance,
            _mobile_bg: e.rowData.mobile_bg
        }).getView();
        place_overview.top = 800;
        place_overview.opacity = .15;
        place_overview.open({
            top: 0,
            opacity: 1,
            duration: 400,
            curve: Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT
        });
    });
    $.refreshBtn.addEventListener("click", function() {
        createPlaceList();
    });
    $.backBtn.addEventListener("click", function() {
        $.map.close();
        $.map = null;
    });
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;
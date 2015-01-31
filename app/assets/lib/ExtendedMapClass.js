function ExtendedMap(){
  /*		DEBUG MODE!		(Adds borders to stuff)		*/
  this._delta = 0.07;
  this._wbMap = '';
};


//=================================================================================
// 	Name:  		initializeMap ()
// 	Purpose:	draw default Apple map
//=================================================================================
ExtendedMap.prototype.initializeMap = function(lat, lon) {
	// DRAW MAP
	this._wbMap = myMapFactory.createView({
		mapType : myMapFactory.NORMAL_TYPE, // NORMAL HYBRID SATTELITE
		region : {
			latitude 			: lat,
			longitude 		: lon,
			latitudeDelta : this._delta,
			longitudeDelta: this._delta,
		}, 
		top 					: 0,
		animate 			: false,
		maxZoom				: 1,
		minZoom				: 2,
		regionFit	 		: true,
		userLocation 	: true,
		enableZoomControls : true
	});
	this._wbMap.addEventListener('regionChanged',function(evt) {
		// Ti.API.log( 'regionChanged:'+evt.source.region.latitude+"/"+evt.source.region.longitude );
		mySesh.setGeoViewport(evt.source.region.latitude, evt.source.region.longitude);
	});
	Ti.API.log(".... [~] Map object built ");
	// return this._wbMap;
}


//=================================================================================
// 	Name:  		centerMapOnLocation (lat, lon, delta )
// 	Purpose:	center map viewpoint on user position
//=================================================================================
ExtendedMap.prototype.centerMapOnLocation = function(lat, lon, delta) {
	// set bounding box, move the map View/Location
	Ti.API.debug(".... [~] centerMapOnLocation ["+ lat +" / "+ lon +"]");
	this._wbMap.setLocation ({
		latitude 			: lat,
		longitude 		: lon,
		latitudeDelta : delta,
		longitudeDelta: delta, 
		animate : true
	});
}

exports.ExtendedMap = ExtendedMap;
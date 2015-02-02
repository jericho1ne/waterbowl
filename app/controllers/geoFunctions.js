// constructor

/*
var test_var = "...";

exports.deg2rad = function(deg) {
  Ti.API.info("deg2rad class function called");
    return deg * (Math.PI/180);
}
*/
  
//finally, export the module
//you MUST export it in this manner, not using methods.export = !
// exports.geoUntil = geoUntil;

 /*

exports.geoUtil = function() {
  //=============================================================================
  //	Name:			getDistance ( lat1, lon1, lat2, lon2 )
  //=============================================================================
  function getDistance(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    d = d * 0.621371;
    return Number ( d.toFixed(2) );		// typecast just in case toFixed returns a string...
  }

  //=============================================================================
  //	Name:			deg2rad ( deg )
  //=============================================================================
 

geoUntil.prototype.setTitle = function( label_object, value ){
   this._name = value;  
   label_object.text = this._name;
};
  function deg2rad(deg) {
    return deg * (Math.PI/180);
  }

}

geoUntil.prototype.setTitle = function( label_object, value ){
   this._name = value;  
   label_object.text = this._name;
};
 
geoUntil.prototype.getName = function(){
    return this._name;
};
  */
  
/*
geoUntil.prototype.ACCESS_LEVELS = {
    PUBLIC: 'public',
    PRIVATE: 'private'
};
*/


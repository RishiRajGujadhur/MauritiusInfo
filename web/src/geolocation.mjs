// Called only after a user action. Never stores coordinates or writes them to URLs.
export function requestGPS(geolocation=globalThis.navigator?.geolocation) {
  return new Promise((resolve,reject)=>{
    if(!geolocation){reject(new Error('GPS is unavailable in this browser. Choose a town in Visit filters instead.'));return;}
    geolocation.getCurrentPosition(position=>{
      const {latitude,longitude,accuracy}=position.coords;
      if(!Number.isFinite(latitude)||Math.abs(latitude)>90||!Number.isFinite(longitude)||Math.abs(longitude)>180){reject(new Error('GPS returned an invalid location. Please try again.'));return;}
      resolve({point:[latitude,longitude],accuracy:Number.isFinite(accuracy)&&accuracy>=0?accuracy:null});
    },error=>reject(new Error(error.code===1?'Location permission was denied. Allow location in your browser settings, then try again.':error.code===3?'GPS timed out. Please try again, or choose a town in Visit filters.':'Your location could not be found. Please try again, or choose a town in Visit filters.')),{timeout:12000,maximumAge:60000,enableHighAccuracy:true});
  });
}

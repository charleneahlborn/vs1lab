// File origin: VS1LAB A2

/* eslint-disable no-unused-vars */

// This script is executed when the browser loads index.html.

// "console.log" writes to the browser's console. 
// The console window must be opened explicitly in the browser.
// Try to find this output in the browser...
console.log("The geoTagging script is going to start...");

// Here the API used for geolocations is selected
// The following declaration is a 'mockup' that always works and returns a fixed position.
var GEOLOCATION_API = {
    getCurrentPosition: function(onsuccess) {
        onsuccess({
            "coords": {
                "latitude": 49.013790,
                "longitude": 8.390071,
                "altitude": null,
                "accuracy": 39,
                "altitudeAccuracy": null,
                "heading": null,
                "speed": null
            },
            "timestamp": 1775140116396
        });
    }
};

// This is the real API.
// If there are problems with it, comment out the line.
GEOLOCATION_API = navigator.geolocation;

//clas LocationHelper removed
//class MapManager removed


const mapManager = new MapManager();

/**
 * A function to retrieve the current location and update the page.
 * It is called once the page has been fully loaded.
 */

function updateLocation() {
    // Auslesen von Formularfeldern mit Koordinaten 
    const existingLat = document.getElementById("ipt_latitude").value;
    const existingLon = document.getElementById("ipt_longitude").value;

    const removePlaceholders = () => {
        const placeholderImg = document.getElementById("mapView"); 
        const placeholderText = document.querySelector("#map span");
        if (placeholderImg){
            placeholderImg.remove();
        } 
        if (placeholderText){
            placeholderText.remove();
        } 
    };

    const mapElement = document.getElementById("map");
    const tagsJson = mapElement.dataset.tags;
    const tags = JSON.parse(tagsJson);

    // Bedingte ausführung von LocationHelper.findLocation()
    
    if(existingLat && existingLon){
        mapManager.initMap(existingLat, existingLon);
        mapManager.updateMarkers(existingLat, existingLon, tags);
        removePlaceholders();
    } else{
        LocationHelper.findLocation((locationHelper) => {
            const lat = locationHelper.latitude;
            const lon = locationHelper.longitude;

            document.getElementById("ipt_latitude").value = lat;
            document.getElementById("ipt_longitude").value = lon;

            document.getElementById("hidden_latitude").value = lat;
            document.getElementById("hidden_longitude").value = lon;

            mapManager.initMap(lat, lon); 
            mapManager.updateMarkers(lat, lon, tags);
            removePlaceholders();
        });
    } 
}


document.addEventListener("DOMContentLoaded", updateLocation);
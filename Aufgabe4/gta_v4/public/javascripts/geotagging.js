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

/**
 * Aktualisiert das Discovery-Widget (Ergebnisliste und Karte) mit neuen Tags.
 * @param {Array} tags - Ein Array von GeoTag-Objekten.
 */
function updateDiscoveryWidget(tags) {
    // 1. Ergebnisliste aktualisieren
    // Hinweis: Prüfe, ob die ID "discoveryResults" mit deiner HTML-Datei übereinstimmt.
    const resultsList = document.getElementById('discoveryResults');
    if (resultsList) {
        // Alte Liste leeren
        resultsList.innerHTML = ''; 
        
        // Neue Listenelemente generieren
        tags.forEach(tag => {
            const li = document.createElement('li');
            li.textContent = `${tag.name} (${tag.latitude}, ${tag.longitude}) ${tag.hashtag}`;
            resultsList.appendChild(li);
        });
    }

    // 2. Karte aktualisieren
    // Wir holen uns die aktuellen Koordinaten aus den versteckten Feldern
    const lat = document.getElementById("hidden_latitude").value;
    const lon = document.getElementById("hidden_longitude").value;
    
    // updateMarkers aufrufen, um die neuen Pins auf der Karte zu setzen
    mapManager.updateMarkers(lat, lon, tags);
}

function initAjaxForms() {
    const taggingForm = document.getElementById('tag-form');
    const discoveryForm = document.getElementById('discoveryFilterForm');

    // --- 1. AJAX Aufruf für das Tagging Formular (HTTP POST) ---
    if (taggingForm) {
        taggingForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!taggingForm.checkValidity()) {
                taggingForm.reportValidity(); 
                return; 
            }

            // Formulardaten auslesen
            const formData = new FormData(taggingForm);
            
            // GeoTag-Objekt für den JSON-Body erstellen (Tipp 1)
            const geoTag = {
                name: formData.get('name'),
                latitude: formData.get('latitude'),
                longitude: formData.get('longitude'),
                hashtag: formData.get('hashtag')
            };

            // Fetch API für POST Request aufrufen
            fetch('/api/geotags', {
                method: 'POST',
                headers: {
                    // Wichtig: Dem Server mitteilen, dass wir JSON senden (Tipp 2)
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(geoTag)
            })
            .then(response => response.json()) //Rückübersetzung
            .then(updatedTags => {
                // Nach erfolgreichem Speichern das UI aktualisieren
                updateDiscoveryWidget(updatedTags);
                // Optional: Formular nach dem Absenden leeren
                // taggingForm.reset(); 
            })
            .catch(error => console.error('Fehler beim Senden des neuen Tags:', error));
        });  
    }

    // --- 2. AJAX Aufruf für das Discovery Formular (HTTP GET) ---
    if (discoveryForm) {
        discoveryForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!discoveryForm.checkValidity()) {
                discoveryForm.reportValidity();
                return;
            }

            // Suchbegriff und aktuelle Koordinaten auslesen
            const formData = new FormData(discoveryForm);
            const searchTerm = formData.get('searchterm') || '';
            const lat = document.getElementById("hidden_latitude").value;
            const lon = document.getElementById("hidden_longitude").value;

            // Query-Parameter für die URL zusammenbauen
            const queryParams = new URLSearchParams({
                searchterm: searchTerm,
                latitude: lat,
                longitude: lon
            }).toString();

            // Fetch API für GET Request mit Query Parametern aufrufen
            fetch(`/api/geotags?${queryParams}`, {
                method: 'GET'
            })
            .then(response => response.json())
            .then(filteredTags => {
                // Bei erfolgreicher Antwort das UI mit den gefilterten Tags aktualisieren
                updateDiscoveryWidget(filteredTags);
            })
            .catch(error => console.error('Fehler beim Filtern der Tags:', error));
        });
    }
}

/*
function initAjaxForms() {
    const taggingForm = document.getElementById('tag-form');
    const discoveryForm = document.getElementById('discoveryFilterForm');

    if (taggingForm) {
        taggingForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!taggingForm.checkValidity()) {
                taggingForm.reportValidity(); 
                return; 
            }
        });
    }

    if (discoveryForm) {
        discoveryForm.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!discoveryForm.checkValidity()) {
                discoveryForm.reportValidity();
                return;
            }
        });
    }
} */

document.addEventListener("DOMContentLoaded", () => {
    updateLocation();
    initAjaxForms();
}); 
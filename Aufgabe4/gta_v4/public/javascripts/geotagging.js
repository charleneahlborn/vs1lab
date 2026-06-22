// File origin: VS1LAB A2

/* eslint-disable no-unused-vars */

// This script is executed when the browser loads index.html.

// "console.log" writes to the browser's console. 
// The console window must be opened explicitly in the browser.
// Try to find this output in the browser...
console.log("The geoTagging script is going to start...");

// Here the API used for geolocations is selected
// The following declaration is a 'mockup' that always works and returns a fixed position.
/* var GEOLOCATION_API = {
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
*/
// This is the real API.
// If there are problems with it, comment out the line.
var GEOLOCATION_API = navigator.geolocation;

const mapManager = new MapManager();

// Pagination-State
let currentPage = 1;
const PAGE_SIZE = 5;
let totalPages = 1;

// Aktueller Suchkontext (wird bei Suche/Tag-Hinzufügen gesetzt)
let currentSearch = { latitude: '', longitude: '', searchterm: '' };

function updateLocation() {
    const existingLat = document.getElementById("ipt_latitude").value;
    const existingLon = document.getElementById("ipt_longitude").value;

    const removePlaceholders = () => {
        const placeholderImg = document.getElementById("mapView");
        const placeholderText = document.querySelector("#map span");
        if (placeholderImg) placeholderImg.remove();
        if (placeholderText) placeholderText.remove();
    };

    if (existingLat && existingLon) {
        currentSearch.latitude = existingLat;
        currentSearch.longitude = existingLon;
        mapManager.initMap(existingLat, existingLon);
        removePlaceholders();
        fetchAndDisplay(1);
    } else {
        LocationHelper.findLocation((locationHelper) => {
            const lat = locationHelper.latitude;
            const lon = locationHelper.longitude;

            document.getElementById("ipt_latitude").value = lat;
            document.getElementById("ipt_longitude").value = lon;
            document.getElementById("hidden_latitude").value = lat;
            document.getElementById("hidden_longitude").value = lon;

            currentSearch.latitude = lat;
            currentSearch.longitude = lon;

            mapManager.initMap(lat, lon);
            removePlaceholders();
            fetchAndDisplay(1);
        });
    }
}

// Hauptfunktion: lädt eine Seite vom Server und aktualisiert UI
async function fetchAndDisplay(page) {
    currentPage = page;

    const params = new URLSearchParams({
        latitude: currentSearch.latitude,
        longitude: currentSearch.longitude,
        page: currentPage,
        limit: PAGE_SIZE
    });

    if (currentSearch.searchterm) {
        params.append('searchterm', currentSearch.searchterm);
    }

    const response = await fetch(`/api/geotags?${params.toString()}`);
    const data = await response.json();

    totalPages = Math.ceil(data.totalCount / PAGE_SIZE) || 1;

    updateList(data.tags);
    updateMap(data.tags);
    updatePaginationUI();
}

function updateList(tags) {
    const ul = document.getElementById('discoveryResults');
    ul.innerHTML = '';
    tags.forEach(tag => {
        const li = document.createElement('li');
        li.textContent = `${tag.name} (${tag.latitude}, ${tag.longitude}) ${tag.hashtag}`;
        ul.appendChild(li);
    });
}

function updateMap(tags) {
    mapManager.updateMarkers(currentSearch.latitude, currentSearch.longitude, tags);
}

function updatePaginationUI() {
    document.getElementById('page-info').textContent = `Seite ${currentPage} / ${totalPages}`;
    document.getElementById('btn-prev').disabled = currentPage <= 1;
    document.getElementById('btn-next').disabled = currentPage >= totalPages;
}

function changePage(delta) {
    const newPage = currentPage + delta;
    if (newPage < 1 || newPage > totalPages) return;
    fetchAndDisplay(newPage);
}

/**
 * Aktualisiert das Discovery-Widget (Ergebnisliste und Karte) mit neuen Tags.
 * @param {Array} tags - Ein Array von GeoTag-Objekten.
 */
function updateDiscoveryWidget(tags) {
    const resultsList = document.getElementById('discoveryResults');
    if (resultsList) {
  
        resultsList.innerHTML = ''; 
        
        tags.forEach(tag => {
            const li = document.createElement('li');
            li.textContent = `${tag.name} (${tag.latitude}, ${tag.longitude}) ${tag.hashtag}`;
            resultsList.appendChild(li);
        });
    }

    const lat = document.getElementById("hidden_latitude").value;
    const lon = document.getElementById("hidden_longitude").value;
    

    mapManager.updateMarkers(lat, lon, tags);
}


function initAjaxForms() {
    const taggingForm = document.getElementById('tag-form');
    const discoveryForm = document.getElementById('discoveryFilterForm'); 


    if (taggingForm) {
        taggingForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            if (!taggingForm.checkValidity()) {
                taggingForm.reportValidity();
                return;
            }

            const formData = new FormData(taggingForm);
            const name = formData.get('name');
            const lat = formData.get('latitude');
            const lon = formData.get('longitude');
            const hashtag = formData.get('hashtag');

            try {

                await fetch('/api/geotags', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, latitude: lat, longitude: lon, hashtag })
                });

                const searchInput = discoveryForm ? discoveryForm.querySelector('input[name="searchterm"]') : null;
                const activeSearch = searchInput ? searchInput.value : '';


                currentSearch.latitude = lat;
                currentSearch.longitude = lon;
                currentSearch.searchterm = activeSearch;
                

                const nameInput = taggingForm.querySelector('input[name="name"]');
                const hashtagInput = taggingForm.querySelector('input[name="hashtag"]');
                if (nameInput) nameInput.value = '';
                if (hashtagInput) hashtagInput.value = '';
                

                let checkUrl = `/api/geotags?latitude=${lat}&longitude=${lon}&limit=1`;
                if (activeSearch) {
                    checkUrl += `&searchterm=${encodeURIComponent(activeSearch)}`;
                }

                const checkRes = await fetch(checkUrl);
                const checkData = await checkRes.json();
                
                const lastPage = Math.ceil(checkData.totalCount / PAGE_SIZE) || 1;
                
                fetchAndDisplay(lastPage);
                
            } catch (error) {
                console.error('Fehler beim Speichern des neuen Tags:', error);
            }
        });
    }


    if (discoveryForm) {
        discoveryForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            if (!discoveryForm.checkValidity()) {
                discoveryForm.reportValidity();
                return;
            }

            const formData = new FormData(discoveryForm);
            const searchterm = formData.get('searchterm') || '';
            
            const lat = document.getElementById('hidden_latitude').value;
            const lon = document.getElementById('hidden_longitude').value;

            currentSearch.latitude = lat;
            currentSearch.longitude = lon;
            currentSearch.searchterm = searchterm;

            fetchAndDisplay(1);
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    updateLocation();
    initAjaxForms();
}); 
const getLocationBtn = document.getElementById('getLocationBtn');
const latitudeSpan = document.getElementById('latitude');
const longitudeSpan = document.getElementById('longitude');
const placeNameSpan = document.getElementById('placeName');
const messageBox = document.getElementById('message');
const mapDiv = document.getElementById('map');
const lastLatSpan = document.getElementById('lastLat');
const lastLonSpan = document.getElementById('lastLon');
const lastPlaceSpan = document.getElementById('lastPlace');

let map = null;
let marker = null;

function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function displayMessage(text, type = '') {
    messageBox.textContent = text;
    messageBox.className = 'message-box';
    if (type) {
        messageBox.classList.add(type);
    }
}

function initializeOrUpdateMap(lat, lon) {
    const defaultZoom = 15;

    if (map === null) {
        map = L.map('map').setView([lat, lon], defaultZoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        marker = L.marker([lat, lon]).addTo(map)
            .bindPopup('Your Location')
            .openPopup();
    } else {
        map.setView([lat, lon], defaultZoom);
        marker.setLatLng([lat, lon]);
        marker.setPopupContent('Your Location').openPopup();
    }
}

async function getPlaceName(lat, lon) {
   const nominatimApiUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

    try {
        const response = await fetch(nominatimApiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        const displayName = data.display_name || 'Place name not found.';
        placeNameSpan.textContent = displayName;
        if (marker) {
            marker.setPopupContent(`<b>Your Location:</b><br>${displayName}`).openPopup();
        }

        // Store current successful location in cookies for 30 days
        setCookie('lastLat', lat.toFixed(6), 30);
        setCookie('lastLon', lon.toFixed(6), 30);
        setCookie('lastPlace', displayName, 30);

    } catch (error) {
        console.error('Error fetching place name:', error);
        placeNameSpan.textContent = 'Could not retrieve place name.';
        displayMessage('Error getting place name. Check console for details.', 'error');
    }
}

function success(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    latitudeSpan.textContent = lat.toFixed(6);
    longitudeSpan.textContent = lon.toFixed(6);
    displayMessage('Location found successfully! Updating map and getting place name...', 'success');
    initializeOrUpdateMap(lat, lon);
    getPlaceName(lat, lon);
}

function error(err) {
    let errorMessage = 'An unknown error occurred.';

    switch (err.code) {
        case err.PERMISSION_DENIED:
            errorMessage = "Permission Denied: You denied the request for Geolocation. Please allow location access in your browser settings.";
            break;
        case err.POSITION_UNAVAILABLE:
            errorMessage = "Position Unavailable: Location information is unavailable.";
            break;
        case err.TIMEOUT:
            errorMessage = "Timeout: The request to get user location timed out.";
            break;
        case err.UNKNOWN_ERROR:
            errorMessage = "Unknown Error: An unknown error occurred.";
            break;
    }
    displayMessage(`Error: ${errorMessage}`, 'error');

    latitudeSpan.textContent = 'N/A';
    longitudeSpan.textContent = 'N/A';
    placeNameSpan.textContent = 'N/A';

    if (map) {
        map.remove();
        map = null;
    }
    marker = null;
}

getLocationBtn.addEventListener('click', () => {
    displayMessage('Finding your location...', '');
    latitudeSpan.textContent = 'N/A';
    longitudeSpan.textContent = 'N/A';
    placeNameSpan.textContent = 'N/A';

    if ("geolocation" in navigator) {
        const options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };
        navigator.geolocation.getCurrentPosition(success, error, options);
    } else {
        displayMessage("Geolocation is not supported by your browser.", 'error');
    }
});

displayMessage('Click "Get My Location" to begin.', '');

window.onload = () => {
    const lastLat = getCookie('lastLat');
    const lastLon = getCookie('lastLon');
    const lastPlace = getCookie('lastPlace');

    if (lastLat && lastLon) {
        lastLatSpan.textContent = lastLat;
        lastLonSpan.textContent = lastLon;
        lastPlaceSpan.textContent = lastPlace || 'N/A';
        initializeOrUpdateMap(parseFloat(lastLat), parseFloat(lastLon));
        displayMessage('Map initialized with last known location. Click "Get My Location" for current.', '');
    } else {
        initializeOrUpdateMap(13.0827, 80.2707); // Chennai coordinates
        displayMessage('Click "Get My Location" to begin.', '');
    }
};
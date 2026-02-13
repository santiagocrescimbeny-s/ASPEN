/* ============================================
   MAP MANAGEMENT WITH LEAFLET
   ============================================ */

let mapInstance = null;
let mapMarker = null;
let geocoderControl = null;

// Initialize map
function initializeMap() {
    // Wait for map container to be visible
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // Remove existing map if it exists
    if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
    }

    // Default center: New Zealand (Auckland)
    const defaultLat = -36.8485;
    const defaultLng = 174.7633;
    const defaultZoom = 12;

    // Create map
    mapInstance = L.map('map').setView([defaultLat, defaultLng], defaultZoom);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(mapInstance);

    // Add geocoder control (search by street, number, place)
    if (L.Control && L.Control.geocoder) {
        geocoderControl = L.Control.geocoder({
            defaultMarkGeocode: false,
            placeholder: 'Buscar calle, número, lugar...'
        })
        .on('markgeocode', function(e) {
            const latlng = e.geocode.center;
            addMarker(latlng.lat, latlng.lng, e.geocode && e.geocode.name ? e.geocode.name : '');
        })
        .addTo(mapInstance);
    }

    // Initialize with current location if exists
    const currentLocation = AppCore.getLocation();
    if (currentLocation) {
        addMarker(currentLocation.lat, currentLocation.lng, currentLocation.address || '');
    } else {
        addMarker(defaultLat, defaultLng);
    }

    // Map click handler
    mapInstance.on('click', (e) => {
        addMarker(e.latlng.lat, e.latlng.lng);
    });

    // Fix Leaflet map sizing issue
    setTimeout(() => {
        mapInstance.invalidateSize();
    }, 100);
}

// Add marker to map
function addMarker(lat, lng, addr) {
    // Remove existing marker
    if (mapMarker) {
        mapInstance.removeLayer(mapMarker);
    }

    // Create new marker with custom icon
    mapMarker = L.circleMarker([lat, lng], {
        radius: 10,
        fillColor: '#0066cc',
        color: '#1a365d',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    }).addTo(mapInstance);

    // Add popup
    mapMarker.bindPopup(`
        <div style="text-align: center; font-family: Arial; font-size: 12px;">
            <strong>Ubicación Seleccionada</strong><br>
            Lat: ${lat.toFixed(5)}<br>
            Lng: ${lng.toFixed(5)}
        </div>
    `).openPopup();

    // Center map on marker
    mapInstance.setView([lat, lng], 13);

    // Update input fields
    document.getElementById('mapLat').value = lat.toFixed(5);
    document.getElementById('mapLng').value = lng.toFixed(5);
    const addrEl = document.getElementById('mapAddress');

    if (addr && addr.length) {
        if (addrEl) addrEl.value = addr;
        if (mapMarker) {
            mapMarker.bindPopup(`
                <div style="text-align: center; font-family: Arial; font-size: 12px;">
                    <strong>Ubicación Seleccionada</strong><br>
                    ${addr ? addr + '<br>' : ''}
                    Lat: ${lat.toFixed(5)}<br>
                    Lng: ${lng.toFixed(5)}
                </div>
            `).openPopup();
        }
        return;
    }

    if (addrEl) addrEl.value = '';
    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
        .then(res => res.json())
        .then(data => {
            const display = data && (data.display_name || data.name) ? (data.display_name || data.name) : '';
            if (addrEl) addrEl.value = display;
            if (mapMarker) {
                mapMarker.bindPopup(`
                    <div style="text-align: center; font-family: Arial; font-size: 12px;">
                        <strong>Ubicación Seleccionada</strong><br>
                        ${display ? display + '<br>' : ''}
                        Lat: ${lat.toFixed(5)}<br>
                        Lng: ${lng.toFixed(5)}
                    </div>
                `).openPopup();
            }
        }).catch(() => {});
}

// Allow manual input of coordinates
document.addEventListener('DOMContentLoaded', () => {
    const latInput = document.getElementById('mapLat');
    const lngInput = document.getElementById('mapLng');

    if (latInput && lngInput) {
        latInput.addEventListener('change', () => {
            const lat = parseFloat(latInput.value);
            const lng = parseFloat(lngInput.value);
            if (lat && lng && mapInstance) {
                addMarker(lat, lng);
            }
        });

        lngInput.addEventListener('change', () => {
            const lat = parseFloat(latInput.value);
            const lng = parseFloat(lngInput.value);
            if (lat && lng && mapInstance) {
                addMarker(lat, lng);
            }
        });
    }

    // Wire up search input/button inside modal
    const searchBtn = document.getElementById('mapSearchBtn');
    const searchInput = document.getElementById('mapSearchInput');
    // Attach the handler when the elements exist (do not depend on optional geocoder control)
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const q = searchInput.value && searchInput.value.trim();
            if (!q) return;
            // Use Nominatim search directly for reliability
            const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&limit=5`;
            fetch(url)
                .then(r => r.json())
                .then(results => {
                    if (results && results.length) {
                        const r = results[0];
                        const lat = parseFloat(r.lat);
                        const lon = parseFloat(r.lon);
                        const display = r.display_name || q;
                        addMarker(lat, lon, display);
                        const addrEl = document.getElementById('mapAddress'); if (addrEl) addrEl.value = display;
                    } else {
                        alert('No se encontró la dirección');
                    }
                }).catch(err => {
                    console.error('Geocode error', err);
                    alert('Error al buscar la dirección');
                });
        });
    }
});

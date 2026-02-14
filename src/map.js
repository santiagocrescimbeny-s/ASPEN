let mapInstance = null;
let mapMarker = null;
let geocoderControl = null;

function initializeMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
    }

    const defaultLat = -36.8485;
    const defaultLng = 174.7633;
    const defaultZoom = 12;

    mapInstance = L.map('map').setView([defaultLat, defaultLng], defaultZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(mapInstance);

    if (L.Control && L.Control.geocoder) {
        geocoderControl = L.Control.geocoder({
            defaultMarkGeocode: false,
            placeholder: 'Buscar calle, número, lugar...'
        })
            .on('markgeocode', function (e) {
                const latlng = e.geocode.center;
                addMarker(latlng.lat, latlng.lng, e.geocode && e.geocode.name ? e.geocode.name : '');
            })
            .addTo(mapInstance);
    }

    const currentLocation = AppCore.getLocation();
    if (currentLocation) {
        addMarker(currentLocation.lat, currentLocation.lng, currentLocation.address || '');
    } else {
        addMarker(defaultLat, defaultLng);
    }

    mapInstance.on('click', (e) => {
        addMarker(e.latlng.lat, e.latlng.lng);
    });

    setTimeout(() => {
        mapInstance.invalidateSize();
    }, 100);
}

function addMarker(lat, lng, addr) {
    if (mapMarker) {
        mapInstance.removeLayer(mapMarker);
    }

    mapMarker = L.circleMarker([lat, lng], {
        radius: 10,
        fillColor: '#0066cc',
        color: '#1a365d',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
    }).addTo(mapInstance);

    mapMarker.bindPopup(`
        <div style="text-align: center; font-family: Arial; font-size: 12px;">
            <strong>Ubicación Seleccionada</strong><br>
            Lat: ${lat.toFixed(5)}<br>
            Lng: ${lng.toFixed(5)}
        </div>
    `).openPopup();

    mapInstance.setView([lat, lng], 13);

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
        }).catch(() => { });
}

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

    const searchBtn = document.getElementById('mapSearchBtn');
    const searchInput = document.getElementById('mapSearchInput');
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const q = searchInput.value && searchInput.value.trim();
            if (!q) return;
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

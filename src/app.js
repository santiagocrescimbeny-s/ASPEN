// ============ VARIABLES GLOBALES ============
let currentWeekStart = getMonday(new Date());
let selectedLocation = null;
let allWeeksData = {};
let map = null;
let mapMarker = null;
let currentEditingDayIndex = null;

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// ============ UTILIDADES DE FECHA ============
function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function formatDateDisplay(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
    });
}

function getDayName(dayIndex) {
    return daysOfWeek[dayIndex];
}

function getWeekKey(weekStart) {
    return formatDate(weekStart);
}

function calculateHours(startTime, endTime, amBreak, pmBreak) {
    if (!startTime || !endTime) return 0;

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startTotalMin = startHour * 60 + startMin;
    const endTotalMin = endHour * 60 + endMin;

    let totalMin = endTotalMin - startTotalMin;
    
    // Manejar caso donde la hora final es del día siguiente (poco común en jornadas)
    if (totalMin < 0) {
        totalMin += 24 * 60;
    }
    
    if (amBreak) totalMin -= 30;
    // Only deduct AM break per requirements

    if (totalMin < 0) totalMin = 0;

    return (totalMin / 60).toFixed(2);
}

// ============ INICIALIZACIÓN ============
document.addEventListener('DOMContentLoaded', function() {
    loadDataFromStorage();
    updateWeekDisplay();
    setupEventListeners();
    renderTimesheetTable();
    updateStats();
    initMap();
    loadLocation();
});

// ============ EVENT LISTENERS ============
function setupEventListeners() {
    // Navegación de semanas
    document.getElementById('prevWeekBtn').addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        updateWeekDisplay();
        renderTimesheetTable();
        updateStats();
    });

    document.getElementById('nextWeekBtn').addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        updateWeekDisplay();
        renderTimesheetTable();
        updateStats();
    });

    // Toggle de pago semanal con animación
    document.getElementById('weekPaidToggle').addEventListener('change', function() {
        const weekKey = getWeekKey(currentWeekStart);
        if (!allWeeksData[weekKey]) allWeeksData[weekKey] = {};
        allWeeksData[weekKey].paid = this.checked;
        saveDataToStorage();
        renderTimesheetTable();
        updatePaidStatus();
        
        // Mostrar notificación
        const message = this.checked ? '✅ Semana marcada como pagada' : '❌ Semana marcada como no pagada';
        if (Utils && Utils.showNotification) {
            Utils.showNotification(message, this.checked ? 'success' : 'warning');
        }
    });

    // Modal de ubicación
    document.getElementById('openMapBtn').addEventListener('click', openMapModal);
    document.getElementById('confirmLocationBtn').addEventListener('click', confirmLocation);
    document.getElementById('closeMapBtn').addEventListener('click', closeMapModal);
    
    const mapCloseBtn = document.getElementById('mapModal').querySelector('.close');
    if (mapCloseBtn) {
        mapCloseBtn.addEventListener('click', closeMapModal);
    }

    // Modal de edición
    document.getElementById('editDayForm').addEventListener('submit', saveEditedDay);
    
    const editCloseBtn = document.getElementById('editDayModal').querySelector('.close');
    if (editCloseBtn) {
        editCloseBtn.addEventListener('click', closeEditModal);
    }

    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', function(event) {
        const mapModal = document.getElementById('mapModal');
        const editModal = document.getElementById('editDayModal');
        if (event.target === mapModal) closeMapModal();
        if (event.target === editModal) closeEditModal();
    });

    // Export PDF
    document.getElementById('exportBtn').addEventListener('click', exportToPDF);
}

// ============ DISPLAY DE SEMANA ============
function updateWeekDisplay() {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const startStr = currentWeekStart.toLocaleDateString('es-ES', options);
    const endStr = weekEnd.toLocaleDateString('es-ES', options);

    document.getElementById('weekRange').textContent = `Semana: ${startStr} - ${endStr}`;

    // Actualizar toggle de pago
    const weekKey = getWeekKey(currentWeekStart);
    const isPaid = allWeeksData[weekKey]?.paid || false;
    document.getElementById('weekPaidToggle').checked = isPaid;
    updatePaidStatus();
}

function updatePaidStatus() {
    const toggle = document.getElementById('weekPaidToggle').checked;
    const statusText = document.getElementById('paidStatus');
    
    if (toggle) {
        statusText.textContent = '✅ Pagado';
        statusText.style.color = 'var(--color-success)';
    } else {
        statusText.textContent = '❌ No Pagado';
        statusText.style.color = 'var(--color-danger)';
    }
}

// ============ TABLA TIMESHEET ============
function renderTimesheetTable() {
    const tbody = document.getElementById('timesheetBody');
    tbody.innerHTML = '';

    const weekKey = getWeekKey(currentWeekStart);
    if (!allWeeksData[weekKey]) {
        allWeeksData[weekKey] = { days: [] };
    }

    const weekData = allWeeksData[weekKey];
    const isPaid = weekData.paid || false;

    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(currentWeekStart);
        dayDate.setDate(dayDate.getDate() + i);
        const dateStr = formatDate(dayDate);

        let dayData = weekData.days && weekData.days[i] ? weekData.days[i] : {
            date: dateStr,
            day: getDayName(i),
            orchard: '',
            workType: '',
            startTime: '',
            endTime: '',
            amBreak: false,
            pmBreak: false,
            notes: ''
        };

        if (!weekData.days) weekData.days = [];
        if (!weekData.days[i]) weekData.days[i] = dayData;

        const hours = calculateHours(dayData.startTime, dayData.endTime, dayData.amBreak, dayData.pmBreak);

        const row = document.createElement('tr');
        row.className = `paid-${isPaid}`;
        row.innerHTML = `
            <td class="day-cell">${dayData.day}</td>
            <td>${dayData.date}</td>
            <td><input type="text" class="input-text" value="${dayData.orchard || ''}" data-field="orchard" data-day="${i}"></td>
            <td><input type="text" class="input-text" value="${dayData.workType || ''}" data-field="workType" data-day="${i}"></td>
            <td><input type="time" class="input-time" value="${dayData.startTime || ''}" data-field="startTime" data-day="${i}" onchange="updateHours(${i})"></td>
            <td class="checkbox-cell">
                <input type="checkbox" ${dayData.amBreak ? 'checked' : ''} data-field="amBreak" data-day="${i}" onchange="updateHours(${i})">
            </td>
            <td class="checkbox-cell">
                <input type="checkbox" ${dayData.pmBreak ? 'checked' : ''} data-field="pmBreak" data-day="${i}" onchange="updateHours(${i})">
            </td>
            <td><input type="time" class="input-time" value="${dayData.endTime || ''}" data-field="endTime" data-day="${i}" onchange="updateHours(${i})"></td>
            <td class="hours-cell">${hours} hrs</td>
            <td class="notes-cell" style="font-size: 1.5rem;">${dayData.notes || '✓'}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-primary" onclick="openEditDay(${i})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-sm btn-danger" onclick="clearDay(${i})">
                    <i class="fas fa-trash"></i> Limpiar
                </button>
            </td>
        `;

        tbody.appendChild(row);

        // Agregar listeners para cambios en inputs
        row.querySelectorAll('[data-field]').forEach(input => {
            input.addEventListener('change', function() {
                saveDayData(this.dataset.day, this.dataset.field, this.value, this.type === 'checkbox' ? this.checked : this.value);
            });
        });
    }

    updatePaidStatus();
}

// ============ ACTUALIZACIÓN DE DATOS ============
function saveDayData(dayIndex, field, value, actualValue = value) {
    const weekKey = getWeekKey(currentWeekStart);
    if (!allWeeksData[weekKey]) allWeeksData[weekKey] = { days: [] };
    if (!allWeeksData[weekKey].days[dayIndex]) {
        allWeeksData[weekKey].days[dayIndex] = {
            date: formatDate(new Date(currentWeekStart).setDate(currentWeekStart.getDate() + parseInt(dayIndex))),
            day: getDayName(dayIndex)
        };
    }

    allWeeksData[weekKey].days[dayIndex][field] = actualValue;
    saveDataToStorage();
    renderTimesheetTable();
    updateStats();
}

function updateHours(dayIndex) {
    const weekKey = getWeekKey(currentWeekStart);
    const row = document.querySelector(`tr:nth-child(${dayIndex + 1})`);
    
    if (row) {
        const startTime = row.querySelector('[data-field="startTime"]').value;
        const endTime = row.querySelector('[data-field="endTime"]').value;
        const amBreak = row.querySelector('[data-field="amBreak"]').checked;
        const pmBreak = row.querySelector('[data-field="pmBreak"]').checked;

        const hours = calculateHours(startTime, endTime, amBreak, pmBreak);
        row.querySelector('.hours-cell').textContent = `${hours} hrs`;

        // Guardar datos
        if (allWeeksData[weekKey] && allWeeksData[weekKey].days[dayIndex]) {
            allWeeksData[weekKey].days[dayIndex].startTime = startTime;
            allWeeksData[weekKey].days[dayIndex].endTime = endTime;
            allWeeksData[weekKey].days[dayIndex].amBreak = amBreak;
            allWeeksData[weekKey].days[dayIndex].pmBreak = pmBreak;
            saveDataToStorage();
        }
    }
}

function clearDay(dayIndex) {
    if (confirm('¿Está seguro que desea limpiar el día?')) {
        const weekKey = getWeekKey(currentWeekStart);
        if (allWeeksData[weekKey] && allWeeksData[weekKey].days[dayIndex]) {
            allWeeksData[weekKey].days[dayIndex] = {
                date: allWeeksData[weekKey].days[dayIndex].date,
                day: allWeeksData[weekKey].days[dayIndex].day,
                orchard: '',
                workType: '',
                startTime: '',
                endTime: '',
                amBreak: false,
                pmBreak: false,
                notes: ''
            };
            saveDataToStorage();
            renderTimesheetTable();
            updateStats();
        }
    }
}

// ============ MODAL EDICIÓN ============
function openEditDay(dayIndex) {
    currentEditingDayIndex = dayIndex;
    const weekKey = getWeekKey(currentWeekStart);
    const dayData = allWeeksData[weekKey].days[dayIndex];

    document.getElementById('editDate').value = dayData.date || '';
    document.getElementById('editDay').value = dayData.day || '';
    document.getElementById('editOrchard').value = dayData.orchard || '';
    document.getElementById('editWorkType').value = dayData.workType || '';
    document.getElementById('editStartTime').value = dayData.startTime || '';
    document.getElementById('editEndTime').value = dayData.endTime || '';
    document.getElementById('editAMBreak').checked = dayData.amBreak || false;
    document.getElementById('editPMBreak').checked = dayData.pmBreak || false;
    document.getElementById('editNotes').value = dayData.notes || '';

    document.getElementById('editDayModal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('editDayModal').classList.remove('active');
    currentEditingDayIndex = null;
}

function saveEditedDay(e) {
    e.preventDefault();
    
    const weekKey = getWeekKey(currentWeekStart);
    const dayData = allWeeksData[weekKey].days[currentEditingDayIndex];

    dayData.date = document.getElementById('editDate').value;
    dayData.day = document.getElementById('editDay').value;
    dayData.orchard = document.getElementById('editOrchard').value;
    dayData.workType = document.getElementById('editWorkType').value;
    dayData.startTime = document.getElementById('editStartTime').value;
    dayData.endTime = document.getElementById('editEndTime').value;
    dayData.amBreak = document.getElementById('editAMBreak').checked;
    dayData.pmBreak = document.getElementById('editPMBreak').checked;
    dayData.notes = document.getElementById('editNotes').value;

    saveDataToStorage();
    closeEditModal();
    renderTimesheetTable();
    updateStats();
}

// ============ MODAL MAPA ============
function openMapModal() {
    document.getElementById('mapModal').classList.add('active');
    setTimeout(() => {
        if (map) map.invalidateSize();
    }, 300);
}

function closeMapModal() {
    document.getElementById('mapModal').classList.remove('active');
}

function initMap() {
    // Usar Google Maps si está disponible
    const container = document.getElementById('map');
    if (!container) return;

    // Coordenadas por defecto (California Orchards region)
    const defaultLat = 37.3382;
    const defaultLng = -121.8863;

    try {
        if (typeof google !== 'undefined' && google.maps) {
            map = new google.maps.Map(container, {
                zoom: 12,
                center: { lat: defaultLat, lng: defaultLng },
                mapTypeId: 'hybrid',
                styles: [
                    {
                        "featureType": "all",
                        "elementType": "labels.text.fill",
                        "stylers": [{"color": "#523735"}]
                    },
                    {
                        "featureType": "water",
                        "elementType": "geometry.fill",
                        "stylers": [{"color": "#d3d3d3"}]
                    }
                ]
            });

            mapMarker = new google.maps.Marker({
                map: map,
                position: { lat: defaultLat, lng: defaultLng },
                draggable: true,
                title: "Ubicación del Huerto - Arrastra para mover"
            });

            // Agregar listener para click en el mapa
            map.addListener('click', (e) => {
                mapMarker.setPosition(e.latLng);
            });

            // Permitir arrastrar el marcador
            mapMarker.addListener('drag', (e) => {
                // El marcador se mueve mientras se arrastra
            });
        } else {
            // Fallback si Google Maps no está disponible
            container.innerHTML = `
                <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    font-size: 1.2rem;
                    border-radius: 8px;
                ">
                    <div style="text-align: center;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">📍</div>
                        <p>Ingresa latitud: <input type="number" id="manualLat" step="0.0001" placeholder="37.3382" style="color: black; width: 100px;"></p>
                        <p>Ingresa longitud: <input type="number" id="manualLng" step="0.0001" placeholder="-121.8863" style="color: black; width: 100px;"></p>
                    </div>
                </div>
            `;
            
            // Guardar coordenadas manuales
            document.getElementById('manualLat').addEventListener('change', function() {
                if (!mapMarker) {
                    mapMarker = { position: {} };
                }
                mapMarker.position = {
                    lat: () => parseFloat(this.value),
                    lng: () => parseFloat(document.getElementById('manualLng').value)
                };
            });

            document.getElementById('manualLng').addEventListener('change', function() {
                if (!mapMarker) {
                    mapMarker = { position: {} };
                }
                mapMarker.position = {
                    lat: () => parseFloat(document.getElementById('manualLat').value),
                    lng: () => parseFloat(this.value)
                };
            });
        }
    } catch (e) {
        console.log('No se pudo inicializar el mapa:', e);
        container.innerHTML = '<p style="padding: 1rem; color: #6b7280;">Error al cargar el mapa. Intenta recargar la página.</p>';
    }
}

function confirmLocation() {
    if (mapMarker && mapMarker.getPosition) {
        // Google Maps Marker
        const position = mapMarker.getPosition();
        selectedLocation = {
            lat: position.lat(),
            lng: position.lng(),
            address: `Lat: ${position.lat().toFixed(4)}, Lng: ${position.lng().toFixed(4)}`
        };
    } else if (mapMarker && mapMarker.position) {
        // Fallback manual
        selectedLocation = {
            lat: typeof mapMarker.position.lat === 'function' ? mapMarker.position.lat() : 37.3382,
            lng: typeof mapMarker.position.lng === 'function' ? mapMarker.position.lng() : -121.8863,
            address: `Ubicación Manual`
        };
    } else {
        alert('Por favor, selecciona una ubicación en el mapa');
        return;
    }
    
    saveLocationToStorage();
    displayLocation();
    closeMapModal();
}

function loadLocation() {
    const stored = localStorage.getItem('orchardLocation');
    if (stored) {
        selectedLocation = JSON.parse(stored);
        displayLocation();
    }
}

function saveLocationToStorage() {
    localStorage.setItem('orchardLocation', JSON.stringify(selectedLocation));
}

function displayLocation() {
    const display = document.getElementById('selectedLocation');
    if (selectedLocation) {
        display.innerHTML = `
            <strong>📍 Ubicación Guardada</strong><br>
            ${selectedLocation.address}<br>
            <small style="color: #6b7280;">Lat: ${selectedLocation.lat.toFixed(4)}, Lng: ${selectedLocation.lng.toFixed(4)}</small>
        `;
    } else {
        display.innerHTML = '<p>Sin ubicación seleccionada</p>';
    }
}

// ============ ESTADÍSTICAS ============
function updateStats() {
    const weekKey = getWeekKey(currentWeekStart);
    const weekData = allWeeksData[weekKey];

    let totalHours = 0;
    let daysWorked = 0;

    if (weekData && weekData.days) {
        weekData.days.forEach((day, index) => {
            if (day && day.startTime && day.endTime) {
                const hours = parseFloat(calculateHours(day.startTime, day.endTime, day.amBreak, day.pmBreak));
                totalHours += hours;
                daysWorked++;
            }
        });
    }

    document.getElementById('totalHours').textContent = `${totalHours.toFixed(2)} hrs`;
    document.getElementById('daysWorked').textContent = daysWorked;
}

// ============ ALMACENAMIENTO ============
function saveDataToStorage() {
    localStorage.setItem('timesheetData', JSON.stringify(allWeeksData));
}

function loadDataFromStorage() {
    const stored = localStorage.getItem('timesheetData');
    if (stored) {
        allWeeksData = JSON.parse(stored);
    }
}

// ============ EXPORTAR PDF ============
function exportToPDF() {
    const weekKey = getWeekKey(currentWeekStart);
    const weekData = allWeeksData[weekKey];
    const isPaid = weekData?.paid || false;

    let content = `
    <h1>Timesheet - Orchard Pro</h1>
    <p>Semana: ${document.getElementById('weekRange').textContent}</p>
    <p>Estado de Pago: ${isPaid ? '✅ Pagado' : '❌ No Pagado'}</p>
    <table border="1" style="border-collapse: collapse; width: 100%;">
        <thead>
            <tr style="background-color: #2d5016; color: white;">
                <th>Día</th>
                <th>Fecha</th>
                <th>Huerto</th>
                <th>Tipo de Trabajo</th>
                <th>Inicio</th>
                <th>AM Break</th>
                <th>PM Break</th>
                <th>Fin</th>
                <th>Horas</th>
                <th>Notas</th>
            </tr>
        </thead>
        <tbody>
    `;

    if (weekData && weekData.days) {
        weekData.days.forEach(day => {
            if (day) {
                const hours = calculateHours(day.startTime, day.endTime, day.amBreak, day.pmBreak);
                content += `
                    <tr>
                        <td>${day.day}</td>
                        <td>${day.date}</td>
                        <td>${day.orchard || '-'}</td>
                        <td>${day.workType || '-'}</td>
                        <td>${day.startTime || '-'}</td>
                        <td>${day.amBreak ? 'X' : '-'}</td>
                        <td>${day.pmBreak ? 'X' : '-'}</td>
                        <td>${day.endTime || '-'}</td>
                        <td>${hours}</td>
                        <td>${day.notes || '-'}</td>
                    </tr>
                `;
            }
        });
    }

    content += `
        </tbody>
    </table>
    `;

    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`
        <html>
        <head>
            <title>Timesheet Export</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { border-collapse: collapse; width: 100%; margin-top: 20px; }
                th, td { padding: 10px; text-align: left; border: 1px solid #ddd; }
                th { background-color: #2d5016; color: white; }
                tr:nth-child(even) { background-color: #f2f2f2; }
                h1 { color: #2d5016; }
            </style>
        </head>
        <body>
            ${content}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Función auxiliar para cerrar modal (para el HTML)
function closeEditModal() {
    document.getElementById('editDayModal').classList.remove('active');
    currentEditingDayIndex = null;
}

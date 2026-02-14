/* ============================================
   TIMESHEET RENDERING & MANAGEMENT
   ============================================ */

let editingEntryId = null;

function renderTimesheet() {
    const tbody = document.getElementById('timesheetBody');
    const data = AppCore.getTimesheetData();
    tbody.innerHTML = '';

    // Group entries by date so multiple entries on same day appear in a single row
    const grouped = data.reduce((acc, entry) => {
        const key = entry.date || 'unknown';
        if (!acc[key]) acc[key] = [];
        acc[key].push(entry);
        return acc;
    }, {});

    // iterate dates in chronological order
    Object.keys(grouped).sort().forEach(dateKey => {
        const entries = grouped[dateKey];
        // combine fields
        const day = entries[0].day || '-';
        const orchards = entries.map(e => e.orchard || '-').filter(Boolean).join('<br>');
        const workTypes = entries.map(e => e.workType || '-').filter(Boolean).join('<br>');
        const addresses = entries.map(e => (e.location && e.location.address) ? e.location.address : '-').filter(Boolean).join('<br>');
        const starts = entries.map(e => e.startTime || '-').join('<br>');
        const ends = entries.map(e => e.endTime || '-').join('<br>');
        const amBreaks = entries.map(e => e.amBreak ? '✓' : '-').join('<br>');
        const pmBreaks = entries.map(e => e.pmBreak ? '✓' : '-').join('<br>');
        const totalHours = entries.reduce((s, e) => s + (parseFloat(e.hours) || 0), 0);
        const notes = entries.map(e => e.notes || '-').join('<br>');

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${day}</td>
            <td>${formatDateForDisplay(dateKey)}</td>
            <td>${orchards}</td>
            <td>${workTypes}</td>
            <td>${addresses}</td>
            <td>${starts}</td>
            <td style="text-align:center">${amBreaks}</td>
            <td style="text-align:center">${pmBreaks}</td>
            <td>${ends}</td>
            <td class="cell-hours">${totalHours > 0 ? totalHours.toFixed(2) + ' hrs' : '-'}</td>
            <td class="cell-notes">${notes}</td>
            <td class="cell-actions">
                <button class="action-btn edit" onclick="openEditModal(${entries[0].id})" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete" onclick="deleteEntry(${entries[0].id})" title="Eliminar"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function createRow(entry) {
    const row = document.createElement('tr');

    const start = entry.startTime || '-';
    const end = entry.endTime || '-';

    row.innerHTML = `
        <td>${entry.day || '-'}</td>
        <td>${formatDateForDisplay(entry.date)}</td>
        <td>${entry.orchard || '-'}</td>
        <td>${entry.workType || '-'}</td>
        <td>${entry.location && entry.location.address ? entry.location.address : '-'}</td>
        <td>${start}</td>
        <td style="text-align:center">${entry.amBreak ? '✓' : '-'}</td>
        <td style="text-align:center">${entry.pmBreak ? '✓' : '-'}</td>
        <td>${end}</td>
        <td class="cell-hours">${entry.hours > 0 ? entry.hours.toFixed(2) + ' hrs' : '-'}</td>
        <td class="cell-notes">${entry.notes || '-'}</td>
        <td class="cell-actions">
            <button class="action-btn edit" onclick="openEditModal(${entry.id})" title="Editar"><i class="fas fa-edit"></i></button>
            <button class="action-btn delete" onclick="deleteEntry(${entry.id})" title="Eliminar"><i class="fas fa-trash"></i></button>
        </td>
    `;

    return row;
}

function formatDateForDisplay(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr + 'T00:00:00');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

/* ============================================
   MODAL MANAGEMENT
   ============================================ */

function openEditModalForNew() {
    editingEntryId = null;
    // Clear fields
    const today = new Date();
    const elDate = document.getElementById('editDate'); if (elDate) {
        elDate.value = today.toISOString().split('T')[0];
    }
    autoSetDayOfWeek();
    const elOrch = document.getElementById('editOrchard'); if (elOrch) elOrch.value = '';
    const workEl = document.getElementById('editWorkType'); if (workEl) workEl.value = '';
    const locDisplay = document.getElementById('editLocationDisplay'); if (locDisplay) locDisplay.textContent = 'Sin ubicación seleccionada';
    AppCore.setLocation(null);
    const sText = document.getElementById('editStartTimeText'); if (sText) sText.value = '';
    const sToggle = document.getElementById('editStartAmPmToggle'); if (sToggle) sToggle.checked = false;
    const sLabel = document.getElementById('editStartAmPmLabel'); if (sLabel) sLabel.textContent = 'AM';
    const eText = document.getElementById('editEndTimeText'); if (eText) eText.value = '';
    const eToggle = document.getElementById('editEndAmPmToggle'); if (eToggle) eToggle.checked = true;
    const eLabel = document.getElementById('editEndAmPmLabel'); if (eLabel) eLabel.textContent = 'PM';
    const amB = document.getElementById('editAMBreak'); if (amB) amB.checked = false;
    const pmB = document.getElementById('editPMBreak'); if (pmB) pmB.checked = false;
    const notes = document.getElementById('editNotes'); if (notes) notes.value = '';
    const hoursEl = document.getElementById('editHoursResult'); if (hoursEl) hoursEl.textContent = '0.00 hrs';
    const modalEl = document.getElementById('editModal'); if (modalEl) modalEl.classList.add('show');
}

function openEditModal(id) {
    const data = AppCore.getTimesheetData();
    const entry = data.find(e => e.id === id);
    if (!entry) return;

    editingEntryId = id;
    const elDate = document.getElementById('editDate'); if (elDate) elDate.value = entry.date || '';
    const elDay = document.getElementById('editDay'); if (elDay) elDay.value = entry.day || '';
    const elOrch = document.getElementById('editOrchard'); if (elOrch) elOrch.value = entry.orchard || '';
    const workEl = document.getElementById('editWorkType'); if (workEl) workEl.value = entry.workType || '';
    // populate location display if available
    const locDisplay = document.getElementById('editLocationDisplay');
    if (entry.location && entry.location.address) {
        if (locDisplay) locDisplay.textContent = entry.location.address;
        AppCore.setLocation(entry.location);
    } else {
        if (locDisplay) locDisplay.textContent = 'Sin ubicación seleccionada';
        AppCore.setLocation(null);
    }

    const s = entry.startTime ? convert24To12(entry.startTime) : { h: '', m: '00', ampm: 'AM' };
    const e = entry.endTime ? convert24To12(entry.endTime) : { h: '', m: '00', ampm: 'PM' };

    const sText = document.getElementById('editStartTimeText'); if (sText) sText.value = s.h ? `${s.h}:${s.m}` : '';
    const sToggle = document.getElementById('editStartAmPmToggle'); if (sToggle) sToggle.checked = (s.ampm === 'PM');
    const sLabel = document.getElementById('editStartAmPmLabel'); if (sLabel) sLabel.textContent = s.ampm;

    const eText = document.getElementById('editEndTimeText'); if (eText) eText.value = e.h ? `${e.h}:${e.m}` : '';
    const eToggle = document.getElementById('editEndAmPmToggle'); if (eToggle) eToggle.checked = (e.ampm === 'PM');
    const eLabel = document.getElementById('editEndAmPmLabel'); if (eLabel) eLabel.textContent = e.ampm;

    const amEl = document.getElementById('editAMBreak'); if (amEl) amEl.checked = !!entry.amBreak;
    const pmEl = document.getElementById('editPMBreak'); if (pmEl) pmEl.checked = !!entry.pmBreak;
    const notes = document.getElementById('editNotes'); if (notes) notes.value = entry.notes || '';

    const modalEl = document.getElementById('editModal'); if (modalEl) modalEl.classList.add('show');
    updateEditHours();
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('show');
    editingEntryId = null;
}

function convert12hTo24(hourStr, minStr, ampm) {
    // hourStr can be 'HH' or 'HH:MM' or a number string
    if (!hourStr) return '';
    let h = 0;
    let m = 0;
    if (typeof hourStr === 'string' && hourStr.includes(':')) {
        const parts = hourStr.split(':').map(Number);
        h = parts[0];
        m = parts[1] || 0;
    } else {
        h = parseInt(hourStr, 10);
        m = parseInt(minStr || '0', 10);
    }
    if (isNaN(h) || isNaN(m)) return '';
    if (ampm === 'AM') {
        if (h === 12) h = 0;
    } else {
        if (h !== 12) h = h + 12;
    }
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

function convert24To12(timeStr) {
    if (!timeStr) return { h: '', m: '', ampm: 'AM' };
    const [hh, mm] = timeStr.split(':').map(Number);
    let ampm = 'AM';
    let h = hh;
    if (hh === 0) { h = 12; ampm = 'AM'; }
    else if (hh === 12) { h = 12; ampm = 'PM'; }
    else if (hh > 12) { h = hh - 12; ampm = 'PM'; }
    else { ampm = 'AM'; }
    return { h: String(h), m: String(mm).padStart(2, '0'), ampm };
}

function updateEditHours() {
    const startText = normalizeTimeInput(document.getElementById('editStartTimeText').value);
    const startIsPm = document.getElementById('editStartAmPmToggle').checked;

    const endText = normalizeTimeInput(document.getElementById('editEndTimeText').value);
    const endIsPm = document.getElementById('editEndAmPmToggle').checked;

    const amBreak = document.getElementById('editAMBreak').checked;
    const pmBreak = document.getElementById('editPMBreak').checked;

    const start = convert12hTo24(startText, null, startIsPm ? 'PM' : 'AM');
    const end = convert12hTo24(endText, null, endIsPm ? 'PM' : 'AM');

    const hours = AppCore.calculateHours(start, end, amBreak, pmBreak);
    document.getElementById('editHoursResult').textContent = (isNaN(hours) ? '0.00' : hours.toFixed(2)) + ' hrs';
}

function saveEditedDay() {
    const date = document.getElementById('editDate').value;
    const day = document.getElementById('editDay').value;
    const orchard = document.getElementById('editOrchard').value;
    const workTypeEl = document.getElementById('editWorkType');
    const workType = workTypeEl ? workTypeEl.value : '';

    const startText = normalizeTimeInput(document.getElementById('editStartTimeText').value);
    const startIsPm = document.getElementById('editStartAmPmToggle').checked;
    const endText = normalizeTimeInput(document.getElementById('editEndTimeText').value);
    const endIsPm = document.getElementById('editEndAmPmToggle').checked;

    const startTime = convert12hTo24(startText, null, startIsPm ? 'PM' : 'AM');
    const endTime = convert12hTo24(endText, null, endIsPm ? 'PM' : 'AM');

    const amBreak = document.getElementById('editAMBreak').checked;
    const pmBreak = document.getElementById('editPMBreak').checked;
    const notes = document.getElementById('editNotes').value;

    const hours = AppCore.calculateHours(startTime, endTime, amBreak, pmBreak);

    if ((startTime && endTime) && hours === 0) {
        showEditAlert('Las horas calculadas están por debajo de los breaks', 'error');
        return;
    }

    const location = AppCore.getLocation();

    if (editingEntryId) {
        const success = AppCore.updateEntryById(editingEntryId, {
            date,
            day,
            orchard,
            workType,
            startTime,
            endTime,
            amBreak,
            pmBreak,
            notes,
            location,
            hours
        });

        if (success) {
            renderTimesheet();
            closeEditModal();
            showEditAlert('Jornada actualizada', 'success');
        } else {
            showEditAlert('Error al actualizar jornada', 'error');
        }
    } else {
        const newId = AppCore.addEntry({
            date,
            day,
            orchard,
            workType,
            startTime,
            endTime,
            amBreak,
            pmBreak,
            notes,
            location,
            hours
        });
        if (newId) {
            // If date is not in current view, switch to it so user sees the new entry
            const currentWeekStart = AppCore.getCurrentWeekStart();
            const entryDate = new Date(date + 'T00:00:00');
            const entryWeekStart = new Date(entryDate);
            const day = entryWeekStart.getDay();
            const diff = entryWeekStart.getDate() - day + (day === 0 ? -6 : 1);
            entryWeekStart.setDate(diff); // Set to Monday of entry week

            // Compare week starts (using time value to ignore object identity)
            // Normalize time to midnight to be safe
            currentWeekStart.setHours(0, 0, 0, 0);
            entryWeekStart.setHours(0, 0, 0, 0);

            if (currentWeekStart.getTime() !== entryWeekStart.getTime()) {
                AppCore.goToDate(date);
            } else {
                renderTimesheet();
            }

            closeEditModal();
            showEditAlert('Jornada agregada', 'success');
        } else {
            showEditAlert('Error al guardar jornada', 'error');
        }
    }
}

function deleteEntry(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta jornada?')) return;
    const success = AppCore.deleteEntryById(id);
    if (success) {
        renderTimesheet();
        showEditAlert('Jornada eliminada', 'success');
    }
}

// Show edit alert
function showEditAlert(message, type) {
    let alertBox = document.getElementById('editAlert');

    if (!alertBox) {
        alertBox = document.createElement('div');
        alertBox.id = 'editAlert';
        alertBox.className = 'alert';
        document.querySelector('#editModal .modal-body').insertBefore(alertBox, document.querySelector('#editModal .modal-body').firstChild);
    }

    alertBox.className = `alert alert-${type} show`;
    alertBox.textContent = message;
    alertBox.style.display = 'block';

    setTimeout(() => {
        alertBox.style.display = 'none';
    }, 3000);
}

/* ============================================
   EXPORT FUNCTIONS (UI)
   ============================================ */

function exportToPDF() {
    const user = AppCore.getCurrentUser();
    const data = AppCore.getTimesheetData();
    const weekStart = AppCore.getCurrentWeekStart();

    // Build HTML content for PDF
    const htmlContent = buildPDFContent(user, data, weekStart);

    // PDF options
    const options = {
        margin: 10,
        filename: `Timesheet_${user.firstName}_${user.lastName}_${weekStart.toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' }
    };

    // Generate PDF
    html2pdf().set(options).from(htmlContent).save();
}

// Build PDF content
function buildPDFContent(user, data, weekStart) {
    const monthNames = ['Enero', 'Feb', 'Mar', 'Abr', 'Mayo', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const endDate = new Date(weekStart);
    endDate.setDate(endDate.getDate() + 6);

    const weekDescriptor = `${weekStart.getDate()} al ${endDate.getDate()} de ${monthNames[weekStart.getMonth()]}`;

    let totalHours = 0;
    let daysWorked = 0;
    let tableRows = '';

    data.forEach((day, index) => {
        if (day.hours > 0) {
            totalHours += parseFloat(day.hours);
            daysWorked++;
        }

        const dateObj = new Date(day.date + 'T00:00:00');
        const dateDisplay = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;

        tableRows += `
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${day.day}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${dateDisplay}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${day.workType || '-'}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${day.orchard || '-'}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${day.startTime || '-'}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${day.endTime || '-'}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold; color: #0066cc;">${day.hours > 0 ? day.hours.toFixed(2) : '-'}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${day.notes || '-'}</td>
            </tr>
        `;
    });

    const avgHours = daysWorked > 0 ? (totalHours / daysWorked).toFixed(2) : 0;

    const content = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.4; font-size:12px;">
            <style>
                table { width:100%; border-collapse: collapse; table-layout: fixed; }
                th, td { word-wrap: break-word; overflow-wrap: break-word; }
                th { font-size:11px; }
                td { font-size:11px; }
                .pdf-header { background: #1a365d; color: white; padding: 12px; border-radius:6px; text-align:center; }
                .small-muted { font-size:10px; color:#666; }
            </style>
            <div class="pdf-header">
                <h1 style="margin:0; font-size:20px;">AgriTime Pro</h1>
                <p class="small-muted" style="margin:6px 0 0 0;">Reporte de Jornadas Laborales</p>
            </div>
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1a365d 0%, #2c5aa0 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                <h1 style="margin: 0 0 10px 0; font-size: 28px;">🌾 AgriTime Pro</h1>
                <p style="margin: 0; font-size: 14px;">Reporte de Jornadas Laborales</p>
            </div>

            <!-- User Info -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; border-left: 4px solid #0066cc;">
                    <p style="margin: 0 0 8px 0; font-weight: bold; color: #1a365d;">Información del Trabajador</p>
                    <p style="margin: 5px 0;"><strong>Nombre:</strong> ${user.firstName} ${user.lastName}</p>
                    <p style="margin: 5px 0;"><strong>IRD:</strong> ${user.ird}</p>
                    <p style="margin: 5px 0;"><strong>Pasaporte:</strong> ${user.passport}</p>
                </div>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; border-left: 4px solid #22b55f;">
                    <p style="margin: 0 0 8px 0; font-weight: bold; color: #1a365d;">Información Adicional</p>
                    <p style="margin: 5px 0;"><strong>Domicilio:</strong> ${user.address}</p>
                    <p style="margin: 5px 0;"><strong>Tax Code:</strong> ${user.taxCode}</p>
                    <p style="margin: 5px 0;"><strong>Período:</strong> Semana del ${weekDescriptor}</p>
                </div>
            </div>

            <!-- Timesheet Table -->
            <div style="margin-bottom: 20px;">
                <h3 style="color: #1a365d; border-bottom: 2px solid #0066cc; padding-bottom: 10px; margin-bottom: 15px;">Detalle de Jornadas</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                    <thead>
                        <tr style="background: linear-gradient(135deg, #1a365d 0%, #2c5aa0 100%); color: white;">
                            <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">Día</th>
                            <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">Fecha</th>
                            <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">Tipo de Trabajo</th>
                            <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">Huerto</th>
                            <th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">Inicio</th>
                            <th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold;">Fin</th>
                            <th style="border: 1px solid #ddd; padding: 12px; text-align: center; font-weight: bold; background: #0066cc;">Horas</th>
                            <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">Notas</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>

            <!-- Summary -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #0066cc; text-align: center;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Horas Totales</p>
                    <p style="margin: 0; font-size: 24px; font-weight: bold; color: #0066cc;">${totalHours.toFixed(2)}</p>
                </div>
                <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; border-left: 4px solid #1a365d; text-align: center;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Días Trabajados</p>
                    <p style="margin: 0; font-size: 24px; font-weight: bold; color: #1a365d;">${daysWorked}</p>
                </div>
                <div style="background: #efe; padding: 15px; border-radius: 8px; border-left: 4px solid #22b55f; text-align: center;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Promedio/Día</p>
                    <p style="margin: 0; font-size: 24px; font-weight: bold; color: #22b55f;">${avgHours}</p>
                </div>
            </div>

            <!-- Footer -->
            <div style="border-top: 2px solid #ddd; padding-top: 15px; text-align: center; font-size: 12px; color: #999;">
                <p style="margin: 0;">Generado por AgriTime Pro - ${new Date().toLocaleDateString('es-AR')}</p>
                <p style="margin: 5px 0 0 0;">Este documento fue generado automáticamente y es válido sin firma.</p>
            </div>
        </div>
    `;

    return content;
}

/* ============================================
   MODAL CONTROL
   ============================================ */

// Open map modal
function openMapModal() {
    document.getElementById('mapModal').classList.add('show');
    setTimeout(() => {
        initializeMap();
    }, 100);
}

// Close map modal
function closeMapModal() {
    document.getElementById('mapModal').classList.remove('show');
}

// Confirm location
function confirmLocation() {
    const lat = parseFloat(document.getElementById('mapLat').value);
    const lng = parseFloat(document.getElementById('mapLng').value);

    const address = (document.getElementById('mapAddress') && document.getElementById('mapAddress').value) ? document.getElementById('mapAddress').value : '';

    if (lat && lng) {
        AppCore.setLocation({ lat, lng, address });
        // update edit modal display if open
        const locDisplay = document.getElementById('editLocationDisplay'); if (locDisplay) locDisplay.textContent = address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        closeMapModal();
    } else {
        alert('Por favor, selecciona una ubicación válida en el mapa');
    }
}

// Close modals on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeEditModal();
        closeMapModal();
    }
});

// Close modals on background click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        if (e.target.id === 'editModal') closeEditModal();
        if (e.target.id === 'mapModal') closeMapModal();
    }
});

// Auto-set day-of-week when date changes in edit modal
function autoSetDayOfWeek() {
    const dateVal = document.getElementById('editDate').value;
    if (!dateVal) return;
    const d = new Date(dateVal + 'T00:00:00');
    const names = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const name = names[d.getDay()];
    const daySelect = document.getElementById('editDay');
    if (daySelect) {
        daySelect.value = name;
    }
}

// Wire small UI events
document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('editDate');
    if (dateInput) dateInput.addEventListener('change', autoSetDayOfWeek);

    const locBtn = document.getElementById('locationInfoBtn');
    if (locBtn) locBtn.addEventListener('click', openMapModal);

    // Time input helpers and toggle wiring
    const startText = document.getElementById('editStartTimeText');
    const endText = document.getElementById('editEndTimeText');
    const startToggle = document.getElementById('editStartAmPmToggle');
    const endToggle = document.getElementById('editEndAmPmToggle');
    const startLabel = document.getElementById('editStartAmPmLabel');
    const endLabel = document.getElementById('editEndAmPmLabel');

    if (startText) startText.addEventListener('input', onStartTimeInput);
    if (endText) endText.addEventListener('input', onEndTimeInput);
    // format on blur (user requested formatting after leaving input)
    if (startText) startText.addEventListener('blur', onStartTimeBlur);
    if (endText) endText.addEventListener('blur', onEndTimeBlur);
    if (startToggle) startToggle.addEventListener('change', () => {
        if (startLabel) startLabel.textContent = startToggle.checked ? 'PM' : 'AM';
        updateEditHours();
    });
    if (endToggle) endToggle.addEventListener('change', () => {
        if (endLabel) endLabel.textContent = endToggle.checked ? 'PM' : 'AM';
        updateEditHours();
    });
});

function normalizeTimeInput(val) {
    if (!val) return '';
    const t = val.trim();
    // Accept digits only patterns: 1..4 digits
    if (/^\d{1,4}$/.test(t)) {
        if (t.length <= 2) { // hours only
            return String(parseInt(t, 10)) + ':00';
        }
        if (t.length === 3) { // HMM -> H:MM
            const h = String(parseInt(t.slice(0, 1), 10));
            const mm = String(parseInt(t.slice(1), 10)).padStart(2, '0');
            return h + ':' + mm;
        }
        if (t.length === 4) { // HHMM -> HH:MM
            const h = String(parseInt(t.slice(0, 2), 10));
            const mm = String(parseInt(t.slice(2), 10)).padStart(2, '0');
            return h + ':' + mm;
        }
    }
    // If H:MM or HH:MM ensure padding and convert 24h->12h if needed
    const m = t.match(/^(\d{1,2}):(\d{1,2})$/);
    if (m) {
        let hh = parseInt(m[1], 10);
        const mm = String(parseInt(m[2], 10)).padStart(2, '0');
        // Convert 24h style to 12h display (user-facing)
        if (hh === 0) {
            hh = 12; // 00 -> 12 AM
        } else if (hh > 12) {
            hh = hh - 12;
        }
        return String(hh) + ':' + mm;
    }
    return t;
}

function onStartTimeInput() {
    const el = document.getElementById('editStartTimeText');
    if (!el) return;
    updateEditHours();
}

function onEndTimeInput() {
    const el = document.getElementById('editEndTimeText');
    if (!el) return;
    updateEditHours();
}

function onStartTimeBlur() {
    const el = document.getElementById('editStartTimeText');
    if (!el) return;
    const original = el.value && el.value.trim();
    const formatted = normalizeTimeInput(original);
    if (formatted) el.value = formatted;
    // If user typed 24h format (e.g., 17:00) detect and set AM/PM toggle
    const std = (original || '').match(/^(\d{1,2}):(\d{2})$/);
    if (std) {
        const origH = parseInt(std[1], 10);
        const toggle = document.getElementById('editStartAmPmToggle');
        const label = document.getElementById('editStartAmPmLabel');
        if (toggle) {
            if (origH === 0) { toggle.checked = false; if (label) label.textContent = 'AM'; }
            else if (origH === 12) { toggle.checked = true; if (label) label.textContent = 'PM'; }
            else if (origH > 12) { toggle.checked = true; if (label) label.textContent = 'PM'; }
            else { toggle.checked = false; if (label) label.textContent = 'AM'; }
        }
    }
    updateEditHours();
}

function onEndTimeBlur() {
    const el = document.getElementById('editEndTimeText');
    if (!el) return;
    const original = el.value && el.value.trim();
    const formatted = normalizeTimeInput(original);
    if (formatted) el.value = formatted;
    const std = (original || '').match(/^(\d{1,2}):(\d{2})$/);
    if (std) {
        const origH = parseInt(std[1], 10);
        const toggle = document.getElementById('editEndAmPmToggle');
        const label = document.getElementById('editEndAmPmLabel');
        if (toggle) {
            if (origH === 0) { toggle.checked = false; if (label) label.textContent = 'AM'; }
            else if (origH === 12) { toggle.checked = true; if (label) label.textContent = 'PM'; }
            else if (origH > 12) { toggle.checked = true; if (label) label.textContent = 'PM'; }
            else { toggle.checked = false; if (label) label.textContent = 'AM'; }
        }
    }
    updateEditHours();
}

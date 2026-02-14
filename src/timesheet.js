let editingEntryId = null;

function renderTimesheet() {
    const tbody = document.getElementById('timesheetBody');
    if (!tbody) return;
    const data = window.AppCore.getTimesheetData();
    tbody.innerHTML = '';

    const grouped = data.reduce((acc, entry) => {
        const key = entry.date || 'unknown';
        if (!acc[key]) acc[key] = [];
        acc[key].push(entry);
        return acc;
    }, {});

    Object.keys(grouped).sort().forEach(dateKey => {
        const entries = grouped[dateKey];
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
                <button class="action-btn edit" onclick="window.openEditModal('${entries[0].id}')" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete" onclick="window.deleteEntry('${entries[0].id}')" title="Eliminar"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Global exposure
window.renderTimesheet = renderTimesheet;

function formatDateForDisplay(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr + 'T00:00:00');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function openEditModalForNew() {
    editingEntryId = null;
    const today = new Date();
    const elDate = document.getElementById('editDate'); if (elDate) {
        elDate.value = today.toISOString().split('T')[0];
    }
    autoSetDayOfWeek();
    const elOrch = document.getElementById('editOrchard'); if (elOrch) elOrch.value = '';
    const workEl = document.getElementById('editWorkType'); if (workEl) workEl.value = '';
    const locDisplay = document.getElementById('editLocationDisplay'); if (locDisplay) locDisplay.textContent = 'Sin ubicación seleccionada';
    window.AppCore.setLocation(null);
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
window.openEditModalForNew = openEditModalForNew;

function openEditModal(id) {
    const data = window.AppCore.getTimesheetData();
    const entry = data.find(e => e.id === id);
    if (!entry) return;

    editingEntryId = id;
    const elDate = document.getElementById('editDate'); if (elDate) elDate.value = entry.date || '';
    const elDay = document.getElementById('editDay'); if (elDay) elDay.value = entry.day || '';
    const elOrch = document.getElementById('editOrchard'); if (elOrch) elOrch.value = entry.orchard || '';
    const workEl = document.getElementById('editWorkType'); if (workEl) workEl.value = entry.workType || '';

    const locDisplay = document.getElementById('editLocationDisplay');
    if (entry.location && entry.location.address) {
        if (locDisplay) locDisplay.textContent = entry.location.address;
        window.AppCore.setLocation(entry.location);
    } else {
        if (locDisplay) locDisplay.textContent = 'Sin ubicación seleccionada';
        window.AppCore.setLocation(null);
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
window.openEditModal = openEditModal;

function closeEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) modal.classList.remove('show');
    editingEntryId = null;
}
window.closeEditModal = closeEditModal;

function convert12hTo24(hourStr, minStr, ampm) {
    if (!hourStr) return '';
    let h = 0, m = 0;
    if (typeof hourStr === 'string' && hourStr.includes(':')) {
        const parts = hourStr.split(':').map(Number);
        h = parts[0]; m = parts[1] || 0;
    } else {
        h = parseInt(hourStr, 10); m = parseInt(minStr || '0', 10);
    }
    if (isNaN(h) || isNaN(m)) return '';
    if (ampm === 'AM') { if (h === 12) h = 0; } else { if (h !== 12) h = h + 12; }
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

function convert24To12(timeStr) {
    if (!timeStr) return { h: '', m: '', ampm: 'AM' };
    const [hh, mm] = timeStr.split(':').map(Number);
    let ampm = 'AM', h = hh;
    if (hh === 0) h = 12; else if (hh === 12) ampm = 'PM'; else if (hh > 12) { h = hh - 12; ampm = 'PM'; }
    return { h: String(h), m: String(mm).padStart(2, '0'), ampm };
}

function updateEditHours() {
    const startText = normalizeTimeInput(document.getElementById('editStartTimeText')?.value, 'editStartAmPmToggle', 'editStartAmPmLabel');
    const startIsPm = document.getElementById('editStartAmPmToggle')?.checked;
    const endText = normalizeTimeInput(document.getElementById('editEndTimeText')?.value, 'editEndAmPmToggle', 'editEndAmPmLabel');
    const endIsPm = document.getElementById('editEndAmPmToggle')?.checked;
    const amBreak = document.getElementById('editAMBreak')?.checked;
    const pmBreak = document.getElementById('editPMBreak')?.checked;

    const start = convert12hTo24(startText, null, startIsPm ? 'PM' : 'AM');
    const end = convert12hTo24(endText, null, endIsPm ? 'PM' : 'AM');

    const hours = window.AppCore.calculateHours(start, end, amBreak, pmBreak);
    const resEl = document.getElementById('editHoursResult');
    if (resEl) resEl.textContent = (isNaN(hours) ? '0.00' : hours.toFixed(2)) + ' hrs';
}
window.updateEditHours = updateEditHours;

async function saveEditedDay() {
    const date = document.getElementById('editDate').value;
    const day = document.getElementById('editDay').value;
    const orchard = document.getElementById('editOrchard').value;
    const workType = document.getElementById('editWorkType')?.value || '';
    const startText = normalizeTimeInput(document.getElementById('editStartTimeText').value, 'editStartAmPmToggle', 'editStartAmPmLabel');
    const startIsPm = document.getElementById('editStartAmPmToggle').checked;
    const endText = normalizeTimeInput(document.getElementById('editEndTimeText').value, 'editEndAmPmToggle', 'editEndAmPmLabel');
    const endIsPm = document.getElementById('editEndAmPmToggle').checked;
    const startTime = convert12hTo24(startText, null, startIsPm ? 'PM' : 'AM');
    const endTime = convert12hTo24(endText, null, endIsPm ? 'PM' : 'AM');
    const amBreak = document.getElementById('editAMBreak').checked;
    const pmBreak = document.getElementById('editPMBreak').checked;
    const notes = document.getElementById('editNotes').value;
    const hours = window.AppCore.calculateHours(startTime, endTime, amBreak, pmBreak);
    const location = window.AppCore.getLocation();

    if ((startTime && endTime) && hours === 0) {
        showEditAlert('Las horas calculadas están por debajo de los breaks', 'error');
        return;
    }

    if (editingEntryId) {
        const success = await window.AppCore.updateEntryById(editingEntryId, {
            date, day, orchard, workType, startTime, endTime, amBreak, pmBreak, notes, location, hours
        });
        if (success) {
            closeEditModal();
            showEditAlert('Jornada actualizada', 'success');
        } else {
            showEditAlert('Error al actualizar jornada', 'error');
        }
    } else {
        const newId = await window.AppCore.addEntry({
            date, day, orchard, workType, startTime, endTime, amBreak, pmBreak, notes, location, hours
        });
        if (newId) {
            closeEditModal();
            showEditAlert('Jornada agregada', 'success');
        } else {
            showEditAlert('Error al guardar jornada', 'error');
        }
    }
}
window.saveEditedDay = saveEditedDay;

async function deleteEntry(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta jornada?')) return;
    const success = await window.AppCore.deleteEntryById(id);
    if (success) {
        showEditAlert('Jornada eliminada', 'success');
    }
}
window.deleteEntry = deleteEntry;

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
    setTimeout(() => { alertBox.style.display = 'none'; }, 3000);
}

function exportToPDF() {
    const user = window.AppCore.getCurrentUser();
    const data = window.AppCore.getTimesheetData();
    const weekStart = window.AppCore.getCurrentWeekStart();
    const htmlContent = buildPDFContent(user, data, weekStart);
    const options = {
        margin: 10,
        filename: `Timesheet_${user.firstName}_${user.lastName}_${weekStart.toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' }
    };
    html2pdf().set(options).from(htmlContent).save();
}
window.exportToPDF = exportToPDF;

function buildPDFContent(user, data, weekStart) {
    const monthNames = ['Enero', 'Feb', 'Mar', 'Abr', 'Mayo', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const endDate = new Date(weekStart);
    endDate.setDate(endDate.getDate() + 6);
    const weekDescriptor = `${weekStart.getDate()} al ${endDate.getDate()} de ${monthNames[weekStart.getMonth()]}`;
    let totalHours = 0, daysWorked = 0, tableRows = '';

    data.forEach((day) => {
        if (day.hours > 0) { totalHours += parseFloat(day.hours); daysWorked++; }
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
    return `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.4; font-size:12px;">
            <div style="background: linear-gradient(135deg, #1a365d 0%, #2c5aa0 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">🥝 Orchard Time</h1>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; border-left: 4px solid #0066cc;">
                    <p><strong>Nombre:</strong> ${user.firstName} ${user.lastName}</p>
                    <p><strong>IRD:</strong> ${user.ird}</p>
                </div>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; border-left: 4px solid #22b55f;">
                    <p><strong>Período:</strong> Semana del ${weekDescriptor}</p>
                    <p><strong>Tax Code:</strong> ${user.taxCode}</p>
                </div>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                <thead>
                    <tr style="background: #1a365d; color: white;">
                        <th style="padding: 10px; border: 1px solid #ddd;">Día</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Fecha</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Trabajo</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Huerto</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Inicio</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Fin</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Horas</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">Notas</th>
                    </tr>
                </thead>
                <tbody>${tableRows}</tbody>
            </table>
            <div style="display: flex; gap: 20px; justify-content: center;">
                <p><strong>Total:</strong> ${totalHours.toFixed(2)} hrs</p>
                <p><strong>Días:</strong> ${daysWorked}</p>
                <p><strong>Promedio:</strong> ${avgHours} hrs/día</p>
            </div>
        </div>
    `;
}

function openMapModal() {
    document.getElementById('mapModal').classList.add('show');
    if (window.initializeMap) setTimeout(() => { window.initializeMap(); }, 100);
}
window.openMapModal = openMapModal;

function closeMapModal() {
    document.getElementById('mapModal').classList.remove('show');
}
window.closeMapModal = closeMapModal;

function confirmLocation() {
    const lat = parseFloat(document.getElementById('mapLat').value);
    const lng = parseFloat(document.getElementById('mapLng').value);
    const address = document.getElementById('mapAddress')?.value || '';
    if (lat && lng) {
        window.AppCore.setLocation({ lat, lng, address });
        const locDisplay = document.getElementById('editLocationDisplay'); if (locDisplay) locDisplay.textContent = address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        closeMapModal();
    } else {
        alert('Por favor, selecciona una ubicación válida en el mapa');
    }
}
window.confirmLocation = confirmLocation;

function autoSetDayOfWeek() {
    const dateVal = document.getElementById('editDate').value;
    if (!dateVal) return;
    const d = new Date(dateVal + 'T00:00:00');
    const names = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const el = document.getElementById('editDay'); if (el) el.value = names[d.getDay()];
}
window.autoSetDayOfWeek = autoSetDayOfWeek;

function normalizeTimeInput(val, toggleId, labelId) {
    if (!val) return '';
    const t = val.trim();
    let hh, mm;

    // Handle formats like 1500 or 900
    if (/^\d{1,4}$/.test(t)) {
        if (t.length <= 2) {
            hh = parseInt(t, 10);
            mm = 0;
        } else if (t.length === 3) {
            hh = parseInt(t.slice(0, 1), 10);
            mm = parseInt(t.slice(1), 10);
        } else {
            hh = parseInt(t.slice(0, 2), 10);
            mm = parseInt(t.slice(2), 10);
        }
    } else {
        const m = t.match(/^(\d{1,2}):(\d{1,2})$/);
        if (m) {
            hh = parseInt(m[1], 10);
            mm = parseInt(m[2], 10);
        }
    }

    if (hh !== undefined) {
        if (toggleId && labelId) {
            const toggle = document.getElementById(toggleId);
            const label = document.getElementById(labelId);
            if (hh >= 12) {
                if (toggle) toggle.checked = true;
                if (label) label.textContent = 'PM';
                if (hh > 12) hh -= 12;
            } else {
                if (hh === 0) hh = 12;
                if (toggle) toggle.checked = false;
                if (label) label.textContent = 'AM';
            }
        } else {
            if (hh === 0) hh = 12; else if (hh > 12) hh -= 12;
        }
        return String(hh) + ':' + String(mm).padStart(2, '0');
    }
    return t;
}

function onStartTimeInput() { updateEditHours(); }
window.onStartTimeInput = onStartTimeInput;
function onEndTimeInput() { updateEditHours(); }
window.onEndTimeInput = onEndTimeInput;

function onStartTimeBlur() {
    const el = document.getElementById('editStartTimeText'); if (!el) return;
    const formatted = normalizeTimeInput(el.value, 'editStartAmPmToggle', 'editStartAmPmLabel');
    if (formatted) el.value = formatted;
    updateEditHours();
}
window.onStartTimeBlur = onStartTimeBlur;

function onEndTimeBlur() {
    const el = document.getElementById('editEndTimeText'); if (!el) return;
    const formatted = normalizeTimeInput(el.value, 'editEndAmPmToggle', 'editEndAmPmLabel');
    if (formatted) el.value = formatted;
    updateEditHours();
}
window.onEndTimeBlur = onEndTimeBlur;

document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('editDate');
    if (dateInput) dateInput.addEventListener('change', autoSetDayOfWeek);
    const locBtn = document.getElementById('locationInfoBtn');
    if (locBtn) locBtn.addEventListener('click', openMapModal);
});

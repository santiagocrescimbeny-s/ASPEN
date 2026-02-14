const AppCore = (() => {
    let currentUser = null;
    let currentWeekStart = null;
    let selectedLocation = null;
    let timesheetData = [];

    const WORK_TYPES = [
        'Tutoring', 'Riego', 'Cosecha', 'Podas',
        'Mantenimiento', 'Fertilización', 'Inspección', 'Empaque'
    ];

    const STORAGE_KEY = 'agritime_timesheet_';
    const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    function init(user) {
        currentUser = user;
        currentWeekStart = getMonday(new Date());
        loadTimesheetData();
        updateUI();
    }

    function getMonday(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }

    function getWeekKey() {
        return STORAGE_KEY + currentUser.email + '_' + currentWeekStart.toISOString().split('T')[0];
    }

    function loadTimesheetData() {
        const stored = localStorage.getItem(getWeekKey());
        if (stored) {
            timesheetData = JSON.parse(stored);
        } else {
            initializeWeekData();
        }
    }

    function initializeWeekData() {
        timesheetData = [];
        saveTimesheetData();
    }

    function saveTimesheetData() {
        localStorage.setItem(getWeekKey(), JSON.stringify(timesheetData));
    }

    function updateUI() {
        updateHeader();
        updateSidebar();
        renderTimesheet();
    }

    function updateHeader() {
        const lang = (typeof I18n !== 'undefined' && I18n.getLang) ? I18n.getLang() : 'es';
        const monthNamesEs = ['Enero', 'Feb', 'Mar', 'Abr', 'Mayo', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthNames = lang === 'en' ? monthNamesEn : monthNamesEs;

        const startDate = currentWeekStart;
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);

        const weekText = (lang === 'en')
            ? `Week: ${String(startDate.getDate()).padStart(2, '0')}/${String(startDate.getMonth() + 1).padStart(2, '0')}/${startDate.getFullYear()} - ${String(endDate.getDate()).padStart(2, '0')}/${String(endDate.getMonth() + 1).padStart(2, '0')}/${endDate.getFullYear()}`
            : `Semana del ${startDate.getDate()} al ${endDate.getDate()} de ${monthNames[startDate.getMonth()]}`;

        const weekDisplayEl = document.getElementById('weekDisplay'); if (weekDisplayEl) weekDisplayEl.textContent = weekText;
        const weekDateEl = document.getElementById('weekDate'); if (weekDateEl) weekDateEl.valueAsDate = new Date(startDate);
        const weekRangeEl = document.getElementById('weekRange'); if (weekRangeEl) weekRangeEl.textContent = weekText;

        const userNameEl = document.getElementById('userName'); if (userNameEl) userNameEl.textContent = `${currentUser.firstName} ${currentUser.lastName}`;

        const paidKey = STORAGE_KEY + 'paid_' + currentUser.email + '_' + startDate.toISOString().split('T')[0];
        const paid = localStorage.getItem(paidKey) === '1';
        const weekToggle = document.getElementById('weekPaidToggle'); if (weekToggle) weekToggle.checked = paid;
        setPaymentStatus(paid, false);
    }

    function updateSidebar() {
        document.getElementById('sidebarUserName').textContent =
            `${currentUser.firstName} ${currentUser.lastName}`;
        document.getElementById('sidebarUserIRD').textContent = currentUser.ird;
        document.getElementById('sidebarUserAddress').textContent = currentUser.address;

        updateStatistics();
    }

    function updateStatistics() {
        let totalHours = 0;
        const datesWithHours = new Set();
        timesheetData.forEach(entry => {
            if (entry.hours > 0) {
                totalHours += parseFloat(entry.hours);
                datesWithHours.add(entry.date);
            }
        });
        const daysWorked = datesWithHours.size;
        const avgHours = daysWorked > 0 ? (totalHours / daysWorked).toFixed(2) : 0;

        document.getElementById('totalHours').textContent = totalHours.toFixed(2);
        document.getElementById('daysWorked').textContent = daysWorked;
        document.getElementById('avgHours').textContent = avgHours;
    }

    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function calculateHours(startTime, endTime, amBreak, pmBreak) {
        if (!startTime || !endTime) return 0;

        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);

        const startTotalMin = startHour * 60 + startMin;
        let endTotalMin = endHour * 60 + endMin;

        if (endTotalMin < startTotalMin) endTotalMin += 24 * 60;

        let diffMinutes = endTotalMin - startTotalMin;

        let breakMinutes = 0;
        if (amBreak) breakMinutes += 30;

        const totalMinutes = diffMinutes - breakMinutes;
        const hours = totalMinutes / 60;

        return Math.max(0, parseFloat(hours.toFixed(2)));
    }

    function addEntry(entry) {
        const newEntry = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            date: entry.date || formatDate(new Date()),
            day: entry.day || '',
            orchard: entry.orchard || '',
            workType: entry.workType || '',
            location: entry.location || null,
            startTime: entry.startTime || '',
            endTime: entry.endTime || '',
            amBreak: entry.amBreak || false,
            pmBreak: entry.pmBreak || false,
            notes: entry.notes || '',
            hours: entry.hours || 0
        };
        const entryWeekStart = getMonday(new Date(newEntry.date + 'T00:00:00'));
        const entryWeekKey = STORAGE_KEY + currentUser.email + '_' + entryWeekStart.toISOString().split('T')[0];
        const currentWeekKey = getWeekKey();

        if (entryWeekKey !== currentWeekKey) {
            const stored = localStorage.getItem(entryWeekKey);
            const arr = stored ? JSON.parse(stored) : [];
            arr.push(newEntry);
            localStorage.setItem(entryWeekKey, JSON.stringify(arr));
            return newEntry.id;
        }

        timesheetData.push(newEntry);
        saveTimesheetData();
        updateUI();
        return newEntry.id;
    }

    function updateEntryById(id, data) {
        const idx = timesheetData.findIndex(e => e.id === id);
        if (idx === -1) return false;
        const hours = calculateHours(data.startTime, data.endTime, data.amBreak, data.pmBreak);
        timesheetData[idx] = {
            ...timesheetData[idx],
            ...data,
            hours
        };
        saveTimesheetData();
        updateUI();
        return true;
    }

    function deleteEntryById(id) {
        const idx = timesheetData.findIndex(e => e.id === id);
        if (idx === -1) return false;
        timesheetData.splice(idx, 1);
        saveTimesheetData();
        updateUI();
        return true;
    }

    function saveDay(dayIndex, data) {
        if (dayIndex >= 0 && dayIndex < timesheetData.length) {
            const hours = calculateHours(
                data.startTime,
                data.endTime,
                data.amBreak,
                data.pmBreak
            );

            timesheetData[dayIndex] = {
                ...timesheetData[dayIndex],
                ...data,
                hours: hours
            };

            saveTimesheetData();
            updateUI();
            return true;
        }
        return false;
    }

    function deleteDay(dayIndex) {
        if (dayIndex >= 0 && dayIndex < timesheetData.length) {
            timesheetData[dayIndex] = {
                ...timesheetData[dayIndex],
                orchard: '',
                workType: '',
                startTime: '',
                endTime: '',
                amBreak: false,
                pmBreak: false,
                notes: '',
                hours: 0
            };
            saveTimesheetData();
            updateUI();
            return true;
        }
        return false;
    }

    function previousWeek() {
        currentWeekStart = new Date(currentWeekStart);
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        loadTimesheetData();
        updateUI();
    }

    function nextWeek() {
        currentWeekStart = new Date(currentWeekStart);
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        loadTimesheetData();
        updateUI();
    }

    function goToDate(date) {
        currentWeekStart = getMonday(new Date(date));
        loadTimesheetData();
        updateUI();
    }

    function getTimesheetData() {
        return timesheetData;
    }

    function setLocation(location) {
        selectedLocation = location;
        updateLocationDisplay();
    }

    function getLocation() {
        return selectedLocation;
    }

    function updateLocationDisplay() {
        const locationDisplay = document.getElementById('locationDisplay');
        if (!locationDisplay) return;
        if (selectedLocation) {
            locationDisplay.innerHTML = `
                <p><strong>Lat:</strong> ${selectedLocation.lat.toFixed(5)}</p>
                <p><strong>Lng:</strong> ${selectedLocation.lng.toFixed(5)}</p>
            `;
        } else {
            locationDisplay.innerHTML = '<p class="text-muted">Sin ubicación seleccionada</p>';
        }
    }

    function setPaymentStatus(paid, persist = true) {
        const indicator = document.getElementById('paymentIndicator');
        const status = document.getElementById('paymentStatus');

        if (paid) {
            if (indicator) { indicator.className = 'payment-indicator paid'; indicator.textContent = '✅ Pagado'; }
            if (status) status.textContent = 'Pagado';
        } else {
            if (indicator) { indicator.className = 'payment-indicator unpaid'; indicator.textContent = '❌ No Pagado'; }
            if (status) status.textContent = 'No Pagado';
        }

        if (persist && currentUser && currentWeekStart) {
            const paidKey = STORAGE_KEY + 'paid_' + currentUser.email + '_' + currentWeekStart.toISOString().split('T')[0];
            try {
                localStorage.setItem(paidKey, paid ? '1' : '0');
            } catch (e) { }
        }
    }

    function getCurrentWeekStart() {
        return new Date(currentWeekStart);
    }

    function getCurrentUser() {
        return currentUser;
    }

    return {
        init,
        saveDay,
        deleteDay,
        addEntry,
        updateEntryById,
        deleteEntryById,
        previousWeek,
        nextWeek,
        goToDate,
        getTimesheetData,
        setLocation,
        getLocation,
        setPaymentStatus,
        getCurrentWeekStart,
        getCurrentUser,
        calculateHours,
        updateUI
    };
})();

function initializeApp(user) {
    AppCore.init(user);
}

function prevWeek() {
    AppCore.previousWeek();
}

function nextWeek() {
    AppCore.nextWeek();
}

function goToWeek() {
    const dateInput = document.getElementById('weekDate').value;
    if (dateInput) {
        AppCore.goToDate(new Date(dateInput));
    }
}

function updatePaymentStatus() {
    const toggle = document.getElementById('weekPaidToggle').checked;
    AppCore.setPaymentStatus(toggle);
}

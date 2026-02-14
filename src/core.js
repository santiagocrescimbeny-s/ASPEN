import { db } from './firebase-config.js';
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const AppCore = (() => {
    let currentUser = null;
    let currentWeekStart = null;
    let selectedLocation = null;
    let timesheetData = [];

    const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    async function init(user) {
        currentUser = user;
        currentWeekStart = getMonday(new Date());
        await loadTimesheetData();
        updateUI();
    }

    function getMonday(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }

    function getWeekKey(date) {
        const d = getMonday(date);
        return d.toISOString().split('T')[0];
    }

    async function loadTimesheetData() {
        if (!currentUser) return;

        const weekStr = getWeekKey(currentWeekStart);
        const q = query(
            collection(db, "timesheets"),
            where("uid", "==", currentUser.uid),
            where("weekStart", "==", weekStr)
        );

        try {
            const querySnapshot = await getDocs(q);
            timesheetData = [];
            querySnapshot.forEach((doc) => {
                timesheetData.push({ id: doc.id, ...doc.data() });
            });
        } catch (e) {
            console.error("Error loading timesheet data:", e);
        }
    }

    function updateUI() {
        // These updates are still DOM-based, they will be triggered after data is loaded
        updateHeader();
        updateSidebar();
        if (window.renderTimesheet) window.renderTimesheet();
    }

    function updateHeader() {
        const lang = (window.I18n && window.I18n.getLang) ? window.I18n.getLang() : 'es';
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

        // Payment status in Firestore
        loadPaymentStatus();
    }

    async function loadPaymentStatus() {
        const weekStr = getWeekKey(currentWeekStart);
        const paymentId = `${currentUser.uid}_${weekStr}`;
        const paymentDoc = await getDoc(doc(db, "payments", paymentId));
        const paid = paymentDoc.exists() && paymentDoc.data().paid;

        const weekToggle = document.getElementById('weekPaidToggle'); if (weekToggle) weekToggle.checked = paid;
        setPaymentStatusDisplay(paid);
    }

    function updateSidebar() {
        if (!currentUser) return;
        document.getElementById('sidebarUserName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
        document.getElementById('sidebarUserIRD').textContent = currentUser.ird || '-';
        document.getElementById('sidebarUserAddress').textContent = currentUser.address || '-';
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
        let [endHour, endMin] = endTime.split(':').map(Number);

        let startTotalMin = startHour * 60 + startMin;
        let endTotalMin = endHour * 60 + endMin;

        // If end time is before start time, it likely crosses midnight
        if (endTotalMin < startTotalMin) endTotalMin += 24 * 60;

        let diffMinutes = endTotalMin - startTotalMin;
        let breakMinutes = 0;
        if (amBreak) breakMinutes += 30;
        if (pmBreak) breakMinutes += 30;

        const totalMinutes = diffMinutes - breakMinutes;
        return Math.max(0, parseFloat((totalMinutes / 60).toFixed(2)));
    }

    async function addEntry(entry) {
        const weekStr = getWeekKey(new Date(entry.date + 'T00:00:00'));
        const newEntry = {
            uid: currentUser.uid,
            weekStart: weekStr,
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
            hours: entry.hours || 0,
            createdAt: new Date().toISOString()
        };

        try {
            const docRef = await addDoc(collection(db, "timesheets"), newEntry);
            if (weekStr === getWeekKey(currentWeekStart)) {
                timesheetData.push({ id: docRef.id, ...newEntry });
                updateUI();
            }
            return docRef.id;
        } catch (e) {
            console.error("Error adding entry:", e);
            return null;
        }
    }

    async function updateEntryById(id, data) {
        const hours = calculateHours(data.startTime, data.endTime, data.amBreak, data.pmBreak);
        const updateData = { ...data, hours };

        try {
            await updateDoc(doc(db, "timesheets", id), updateData);
            const idx = timesheetData.findIndex(e => e.id === id);
            if (idx !== -1) {
                timesheetData[idx] = { ...timesheetData[idx], ...updateData };
                updateUI();
            }
            return true;
        } catch (e) {
            console.error("Error updating entry:", e);
            return false;
        }
    }

    async function deleteEntryById(id) {
        try {
            await deleteDoc(doc(db, "timesheets", id));
            const idx = timesheetData.findIndex(e => e.id === id);
            if (idx !== -1) {
                timesheetData.splice(idx, 1);
                updateUI();
            }
            return true;
        } catch (e) {
            console.error("Error deleting entry:", e);
            return false;
        }
    }

    async function previousWeek() {
        currentWeekStart = new Date(currentWeekStart);
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        await loadTimesheetData();
        updateUI();
    }

    async function nextWeek() {
        currentWeekStart = new Date(currentWeekStart);
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        await loadTimesheetData();
        updateUI();
    }

    async function goToDate(date) {
        currentWeekStart = getMonday(new Date(date));
        await loadTimesheetData();
        updateUI();
    }

    async function setPaymentStatus(paid) {
        if (!currentUser || !currentWeekStart) return;
        const weekStr = getWeekKey(currentWeekStart);
        const paymentId = `${currentUser.uid}_${weekStr}`;

        try {
            await setDoc(doc(db, "payments", paymentId), {
                uid: currentUser.uid,
                weekStart: weekStr,
                paid: paid,
                updatedAt: new Date().toISOString()
            });
            setPaymentStatusDisplay(paid);
        } catch (e) {
            console.error("Error setting payment status:", e);
        }
    }

    function setPaymentStatusDisplay(paid) {
        const indicator = document.getElementById('paymentIndicator');
        const status = document.getElementById('paymentStatus');
        if (paid) {
            if (indicator) { indicator.className = 'payment-indicator paid'; indicator.textContent = '✅ Pagado'; }
            if (status) status.textContent = 'Pagado';
        } else {
            if (indicator) { indicator.className = 'payment-indicator unpaid'; indicator.textContent = '❌ No Pagado'; }
            if (status) status.textContent = 'No Pagado';
        }
    }

    return {
        init,
        addEntry,
        updateEntryById,
        deleteEntryById,
        previousWeek,
        nextWeek,
        goToDate,
        getTimesheetData: () => timesheetData,
        setLocation: (loc) => { selectedLocation = loc; },
        getLocation: () => selectedLocation,
        setPaymentStatus,
        getCurrentWeekStart: () => new Date(currentWeekStart),
        getCurrentUser: () => currentUser,
        calculateHours,
        updateUI
    };
})();

// Re-importing getDoc which was missing in imports
import { getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Global exposure
window.AppCore = AppCore;
window.initializeApp = (user) => AppCore.init(user);
window.prevWeek = () => AppCore.previousWeek();
window.nextWeek = () => AppCore.nextWeek();
window.goToWeek = () => {
    const dateInput = document.getElementById('weekDate')?.value;
    if (dateInput) AppCore.goToDate(new Date(dateInput));
};
window.updatePaymentStatus = () => {
    const toggle = document.getElementById('weekPaidToggle')?.checked;
    AppCore.setPaymentStatus(toggle);
};

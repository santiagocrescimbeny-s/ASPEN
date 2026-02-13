const I18n = (() => {
    const defaultLang = localStorage.getItem('uiLang') || 'es';

    const dict = {
        es: {
            addEntry: 'Agregar Entrada',
            exportPdf: 'Exportar PDF',
            editModalTitle: 'Editar Jornada Laboral',
            save: 'Guardar',
            cancel: 'Cancelar',
            fecha: 'Fecha',
            dia: 'Día',
            huerto: 'Huerto',
            tipoTrabajo: 'Tipo de Trabajo',
            ubicacion: 'Ubicación',
            horaInicio: 'Hora Inicio',
            horaFin: 'Hora Fin',
            notas: 'Notas / Status',
            horasCalculadas: 'Horas Calculadas:'
            , weekEnding: 'Semana que termina'
        },
        en: {
            addEntry: 'Add Entry',
            exportPdf: 'Export PDF',
            editModalTitle: 'Edit Work Day',
            save: 'Save',
            cancel: 'Cancel',
            fecha: 'Date',
            dia: 'Day',
            huerto: 'Orchard',
            tipoTrabajo: 'Work Type',
            ubicacion: 'Location',
            horaInicio: 'Start Time',
            horaFin: 'End Time',
            notas: 'Notes / Status',
            horasCalculadas: 'Calculated Hours:'
            , weekEnding: 'Week ending'
        }
    };

    function t(key) {
        return (dict[getLang()] && dict[getLang()][key]) || dict['es'][key] || key;
    }

    function getLang() { return localStorage.getItem('uiLang') || defaultLang; }
    function setLang(lang) { localStorage.setItem('uiLang', lang); applyLang(); }

    function applyLang() {
        const lang = getLang();
        // translate elements with data-i18n
        document.querySelectorAll('[data-i18n-key]').forEach(el => {
            const key = el.getAttribute('data-i18n-key');
            if (!key) return;
            const txt = t(key);
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = txt;
            } else {
                el.textContent = txt;
            }
        });

        // translate specific ids used in markup
        const addBtn = document.getElementById('addEntryBtn'); if (addBtn) addBtn.innerHTML = `<i class="fas fa-plus"></i> ${t('addEntry')}`;
        const exportBtn = document.getElementById('exportPdfBtn'); if (exportBtn) exportBtn.innerHTML = `<i class="fas fa-download"></i> ${t('exportPdf')}`;
        const modalTitle = document.querySelector('#editModal .modal-header h2'); if (modalTitle) modalTitle.textContent = t('editModalTitle');
        const saveBtn = document.querySelector('#editModal .modal-footer .btn-primary'); if (saveBtn) saveBtn.innerHTML = `<i class="fas fa-save"></i> ${t('save')}`;
        const cancelBtn = document.querySelector('#editModal .modal-footer .btn-secondary'); if (cancelBtn) cancelBtn.innerHTML = `<i class="fas fa-times"></i> ${t('cancel')}`;
        const weekTitle = document.querySelector('.week-ending-title'); if (weekTitle) weekTitle.textContent = t('weekEnding');
    }

    // public
    return { getLang, setLang, applyLang };
})();

// On load wire selector
document.addEventListener('DOMContentLoaded', () => {
    const sel = document.getElementById('langSelect');
    if (sel) {
        sel.value = I18n.getLang();
        sel.addEventListener('change', (e) => { I18n.setLang(e.target.value); });
    }
    I18n.applyLang();
});

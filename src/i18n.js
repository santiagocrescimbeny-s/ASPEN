const I18n = (() => {
    const defaultLang = localStorage.getItem('uiLang') || 'es';

    const dict = {
        es: {
            // General
            appName: 'Orchard Time',
            appSubtitle: 'Gestión de Jornadas Laborales',

            // Auth
            loginTitle: 'Iniciar Sesión',
            email: 'Email',
            password: 'Contraseña',
            loginBtn: 'Ingresar',
            demoMode: 'Modo Demo',
            noAccount: '¿No tienes cuenta?',
            registerHere: 'Regístrate aquí',
            createAccount: 'Crear Cuenta',
            firstName: 'Nombre',
            lastName: 'Apellido',
            ird: 'IRD',
            passport: 'Pasaporte',
            address: 'Domicilio',
            confirmPassword: 'Confirmar',
            registerBtn: 'Registrarse',
            hasAccount: '¿Ya tienes cuenta?',
            loginHere: 'Inicia Sesión',

            // Sidebar
            myData: 'Mis Datos',
            name: 'Nombre:',
            weeklySummary: 'Resumen Semanal',
            totalHours: 'Horas Totales',
            daysWorked: 'Días Trabajados',
            avgHours: 'Promedio por Día',
            paymentStatus: 'Estado de Pago',
            notPaid: 'No Pagado',
            paid: 'Pagado',
            logout: 'Salir',

            // Navigation
            prevWeek: 'Semana Anterior',
            nextWeek: 'Próxima Semana',
            weekEnding: 'Semana que termina',

            // Actions
            addEntry: 'Agregar Entrada',
            exportPdf: 'Exportar PDF',

            // Table
            day: 'Día',
            date: 'Fecha',
            orchard: 'Huerto',
            workType: 'Tipo de Trabajo',
            location: 'Dirección',
            startTime: 'Hora Inicio',
            amBreak: 'AM Break',
            pmBreak: 'PM Break',
            endTime: 'Hora Fin',
            hours: 'Horas',
            notes: 'Notas',
            actions: 'Acciones',

            // Modals
            mapTitle: 'Seleccionar Ubicación del Huerto',
            searchPlaceholder: 'Buscar dirección...',
            searchBtn: 'Buscar',
            confirmLocation: 'Confirmar Ubicación',
            cancel: 'Cancelar',
            editModalTitle: 'Editar Jornada Laboral',
            save: 'Guardar',
            calculatedHours: 'Horas Calculadas:',

            // PDF Export
            pdfTitle: 'Orchard Time',
            pdfSubtitle: 'Reporte Profesional de Jornadas Laborales',
            pdfPeriod: 'Período Reportado:',
            pdfPersonalData: 'Datos Personales',
            pdfFullName: 'Nombre Completo:',
            pdfTaxInfo: 'Información Fiscal:',
            pdfTaxCode: 'Tax Code:',
            pdfGenDate: 'Fecha Generación:',
            pdfWorkDetails: 'Detalle de Jornadas Laborales',
            pdfFooter1: 'Documento generado automáticamente por Orchard Time',
            pdfFooter2: 'Este reporte es válido sin firma digital.',

            // Weeks/Months
            months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            shortMonths: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        },
        en: {
            // General
            appName: 'Orchard Time',
            appSubtitle: 'Workforce Management System',

            // Auth
            loginTitle: 'Login',
            email: 'Email',
            password: 'Password',
            loginBtn: 'Login',
            demoMode: 'Demo Mode',
            noAccount: "Don't have an account?",
            registerHere: 'Register here',
            createAccount: 'Create Account',
            firstName: 'First Name',
            lastName: 'Last Name',
            ird: 'IRD',
            passport: 'Passport',
            address: 'Address',
            confirmPassword: 'Confirm',
            registerBtn: 'Register',
            hasAccount: 'Already have an account?',
            loginHere: 'Login here',

            // Sidebar
            myData: 'My Details',
            name: 'Name:',
            weeklySummary: 'Weekly Summary',
            totalHours: 'Total Hours',
            daysWorked: 'Days Worked',
            avgHours: 'Daily Average',
            paymentStatus: 'Payment Status',
            notPaid: 'Unpaid',
            paid: 'Paid',
            logout: 'Logout',

            // Navigation
            prevWeek: 'Previous Week',
            nextWeek: 'Next Week',
            weekEnding: 'Week ending',

            // Actions
            addEntry: 'Add Entry',
            exportPdf: 'Export PDF',

            // Table
            day: 'Day',
            date: 'Date',
            orchard: 'Orchard',
            workType: 'Work Type',
            location: 'Address',
            startTime: 'Start Time',
            amBreak: 'AM Break',
            pmBreak: 'PM Break',
            endTime: 'End Time',
            hours: 'Hours',
            notes: 'Notes',
            actions: 'Actions',

            // Modals
            mapTitle: 'Select Orchard Location',
            searchPlaceholder: 'Search address...',
            searchBtn: 'Search',
            confirmLocation: 'Confirm Location',
            cancel: 'Cancel',
            editModalTitle: 'Edit Work Day',
            save: 'Save',
            calculatedHours: 'Calculated Hours:',

            // PDF Export
            pdfTitle: 'Orchard Time',
            pdfSubtitle: 'Professional Work Timesheet Report',
            pdfPeriod: 'Reported Period:',
            pdfPersonalData: 'Personal Details',
            pdfFullName: 'Full Name:',
            pdfTaxInfo: 'Tax Information:',
            pdfTaxCode: 'Tax Code:',
            pdfGenDate: 'Generated Date:',
            pdfWorkDetails: 'Work Day Details',
            pdfFooter1: 'Automatically generated document by Orchard Time',
            pdfFooter2: 'This report is valid without digital signature.',

            // Weeks/Months
            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        }
    };

    function t(key) {
        return (dict[getLang()] && dict[getLang()][key]) || dict['es'][key] || key;
    }

    function getLang() { return localStorage.getItem('uiLang') || defaultLang; }
    function setLang(lang) { localStorage.setItem('uiLang', lang); applyLang(); }

    function applyLang() {
        const lang = getLang();

        // 1. Setup specific manual translations updates
        const d = dict[lang];

        // Auth
        updateContent('auth-logo', '🥝'); // Just ensure logo is there
        updateContent('loginForm', h => {
            const h2 = h.querySelector('h2'); if (h2) h2.textContent = d.loginTitle;
            const labels = h.querySelectorAll('label');
        });

        // Loop through everything with data-i18n-key
        document.querySelectorAll('[data-i18n-key]').forEach(el => {
            const key = el.getAttribute('data-i18n-key');
            if (!key || !d[key]) return;

            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = d[key];
            } else {
                // Check if it has an icon child to preserve
                const icon = el.querySelector('i');
                if (icon) {
                    el.childNodes.forEach(node => {
                        if (node.nodeType === 3 && node.nodeValue.trim() !== '') {
                            node.nodeValue = ' ' + d[key];
                        }
                    });
                    if (el.childNodes.length === 1 && el.firstChild.tagName === 'I') {
                        el.innerHTML += ' ' + d[key];
                    }
                } else {
                    el.textContent = d[key];
                }
            }
        });

        // Manual overrides for complex HTML structures if data-i18n-key is hard to apply directly
        // Sidebar
        updateText('sidebarNameLabel', d.name);

        // Buttons with icons (better handled via data-i18n-key on the text node if possible, or here)
        updateBtn('addEntryBtn', 'fa-plus', d.addEntry);
        updateBtn('exportPdfBtn', 'fa-download', d.exportPdf);
        updateBtn('mapSearchBtn', null, d.searchBtn);
        // ... (auth buttons are handled by data-i18n-key in HTML)
    }

    function updateContent(id, content) {
        const el = document.getElementById(id);
        if (el) {
            if (typeof content === 'function') content(el);
            else el.textContent = content;
        }
    }

    function updateText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    function updateBtn(id, icon, text) {
        const el = document.getElementById(id);
        if (el) {
            if (icon) el.innerHTML = `<i class="fas ${icon}"></i> ${text}`;
            else el.textContent = text;
        }
    }

    // public
    return { getLang, setLang, applyLang, t, dict };
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

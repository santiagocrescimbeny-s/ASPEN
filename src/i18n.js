const I18n = (() => {
    const defaultLang = localStorage.getItem('uiLang') || 'es';

    const dict = {
        es: {
            appName: 'Orchard Time',
            appSubtitle: 'Gestión de Jornadas Laborales',

            loginTitle: 'Iniciar Sesión',
            email: 'Email',
            password: 'Contraseña',
            loginBtn: 'Ingresar',
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

            prevWeek: 'Semana Anterior',
            nextWeek: 'Próxima Semana',
            weekEnding: 'Semana que termina',

            addEntry: 'Agregar Entrada',
            exportPdf: 'Exportar PDF',

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

            mapTitle: 'Seleccionar Ubicación del Huerto',
            searchPlaceholder: 'Buscar dirección...',
            searchBtn: 'Buscar',
            confirmLocation: 'Confirmar Ubicación',
            cancel: 'Cancelar',
            editModalTitle: 'Editar Jornada Laboral',
            save: 'Guardar',
            calculatedHours: 'Horas Calculadas:',

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

            months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            shortMonths: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
        },
        en: {
            appName: 'Orchard Time',
            appSubtitle: 'Workforce Management System',

            loginTitle: 'Login',
            email: 'Email',
            password: 'Password',
            loginBtn: 'Login',
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

            prevWeek: 'Previous Week',
            nextWeek: 'Next Week',
            weekEnding: 'Week ending',

            addEntry: 'Add Entry',
            exportPdf: 'Export PDF',

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

            mapTitle: 'Select Orchard Location',
            searchPlaceholder: 'Search address...',
            searchBtn: 'Search',
            confirmLocation: 'Confirm Location',
            cancel: 'Cancel',
            editModalTitle: 'Edit Work Day',
            save: 'Save',
            calculatedHours: 'Calculated Hours:',

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

            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dic'],
            days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        }
    };

    function t(key) {
        return (dict[getLang()] && dict[getLang()][key]) || dict['es'][key] || key;
    }

    function getLang() { return localStorage.getItem('uiLang') || defaultLang; }
    function setLang(lang) { localStorage.setItem('uiLang', lang); applyLang(); }

    function applyLang() {
        const lang = getLang();
        const d = dict[lang];

        updateContent('auth-logo', '🥝');
        updateContent('loginForm', h => {
            const h2 = h.querySelector('h2'); if (h2) h2.textContent = d.loginTitle;
            const labels = h.querySelectorAll('label');
        });

        document.querySelectorAll('[data-i18n-key]').forEach(el => {
            const key = el.getAttribute('data-i18n-key');
            if (!key || !d[key]) return;

            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = d[key];
            } else {
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

        updateText('sidebarNameLabel', d.name);

        updateBtn('addEntryBtn', 'fa-plus', d.addEntry);
        updateBtn('exportPdfBtn', 'fa-download', d.exportPdf);
        updateBtn('mapSearchBtn', null, d.searchBtn);
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

    const instance = { getLang, setLang, applyLang, t, dict };
    window.I18n = instance;
    return instance;
})();

document.addEventListener('DOMContentLoaded', () => {
    const sel = document.getElementById('langSelect');
    if (sel) {
        sel.value = I18n.getLang();
        sel.addEventListener('change', (e) => { I18n.setLang(e.target.value); });
    }
    I18n.applyLang();
});

const AuthManager = (() => {
    const USERS_KEY = 'agritime_users';
    const SESSION_KEY = 'agritime_session';

    const authLogs = [];
    function logAuth(message) {
        try {
            const ts = new Date().toISOString();
            authLogs.unshift(`${ts} - ${message}`);
            if (authLogs.length > 200) authLogs.length = 200;
        } catch (e) { }
    }
    function getAuthLogs() { return authLogs.slice(); }
    function clearAuthLogs() { authLogs.length = 0; }

    function getAllUsers() {
        const stored = localStorage.getItem(USERS_KEY);
        if (!stored) return [];
        try {
            return JSON.parse(stored);
        } catch (e) {
            try { localStorage.removeItem(USERS_KEY); } catch (e) { }
            return [];
        }
    }

    function register(userData) {
        if (!userData.email || !userData.email.trim()) {
            return { success: false, error: 'El email es requerido' };
        }
        if (!isValidEmail(userData.email)) {
            return { success: false, error: 'Por favor, ingresa un email válido' };
        }
        if (!userData.password || userData.password.length < 6) {
            return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' };
        }
        if (userData.password !== userData.passwordConfirm) {
            return { success: false, error: 'Las contraseñas no coinciden' };
        }

        logAuth(`register attempt: ${userData.email}`);
        const users = getAllUsers();
        if (users.some(u => u.email === userData.email.toLowerCase())) {
            return { success: false, error: 'Ya existe una cuenta con ese email' };
        }
        const newUser = {
            email: userData.email.toLowerCase(),
            password: btoa(userData.password),
            firstName: userData.firstName || 'Usuario',
            lastName: userData.lastName || 'Prueba',
            ird: userData.ird || '12345678',
            passport: userData.passport || 'AR123456789',
            address: userData.address || 'Dirección',
            taxCode: userData.taxCode || 'AR20123456780',
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch (e) { }

        const session = {
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            ird: newUser.ird,
            passport: newUser.passport,
            address: newUser.address,
            taxCode: newUser.taxCode,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        logAuth(`register success: ${newUser.email}`);

        return { success: true, user: session };
    }

    function login(email, password) {
        email = (email || '').toString().trim();
        password = (password || '').toString();
        if (!email || !password) {
            return { success: false, error: 'Email y contraseña son requeridos' };
        }

        if (!isValidEmail(email)) {
            return { success: false, error: 'Por favor, ingresa un email válido' };
        }

        logAuth(`login attempt: ${email}`);
        const users = getAllUsers();
        const user = users.find(u => u.email === email.toLowerCase());
        if (!user) {
            logAuth(`login user-not-found: ${email}`);
            return { success: false, error: 'Usuario no encontrado. Regístrate primero.' };
        }

        if (!user.password) {
            const session = {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                ird: user.ird || '',
                passport: user.passport || '',
                address: user.address || '',
                taxCode: user.taxCode || '',
                loginTime: new Date().toISOString()
            };
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
            return { success: true, user: session };
        }

        const encoded = btoa(password);
        if (encoded !== user.password) {
            logAuth(`login bad-password: ${email}`);
            return { success: false, error: 'Contraseña incorrecta' };
        }

        const session = {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            ird: user.ird || '',
            passport: user.passport || '',
            address: user.address || '',
            taxCode: user.taxCode || '',
            loginTime: new Date().toISOString()
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        logAuth(`login success: ${user.email}`);
        return { success: true, user: session };
    }

    function logout() {
        localStorage.removeItem(SESSION_KEY);
    }

    function getCurrentSession() {
        const stored = localStorage.getItem(SESSION_KEY);
        if (!stored) return null;
        try {
            return JSON.parse(stored);
        } catch (e) {
            try { localStorage.removeItem(SESSION_KEY); } catch (e) { }
            return null;
        }
    }

    function isLoggedIn() {
        return getCurrentSession() !== null;
    }

    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    function init() {
    }

    return {
        register,
        login,
        logout,
        getCurrentSession,
        isLoggedIn,
        getAllUsers,
        getAuthLogs,
        clearAuthLogs,
        init
    };
})();

function handleRegister() {
    try {
        function safeVal(id) { const el = document.getElementById(id); return el ? el.value : ''; }

        const firstName = safeVal('regFirstName');
        const lastName = safeVal('regLastName');
        const email = safeVal('regEmail');
        const ird = safeVal('regIRD');
        const passport = safeVal('regPassport');
        const address = safeVal('regAddress');
        const taxCode = safeVal('regTaxCode');
        const password = safeVal('regPassword');
        const passwordConfirm = safeVal('regPasswordConfirm');

        if (!email || !email.trim()) { showAlert('El email es requerido', 'error'); return; }
        if (!password || password.length < 6) { showAlert('La contraseña debe tener al menos 6 caracteres', 'error'); return; }
        if (password !== passwordConfirm) { showAlert('Las contraseñas no coinciden', 'error'); return; }

        const result = AuthManager.register({
            firstName,
            lastName,
            email,
            ird,
            passport,
            address,
            taxCode,
            password,
            passwordConfirm
        });

        if (result.success) {
            showAlert('¡Registro exitoso! Sesión iniciada.', 'success');
            setTimeout(() => {
                showAuthUI(false);
                showAppUI(true);
                initializeApp(result.user);
            }, 700);
        } else {
            showAlert(result.error, 'error');
        }
    } catch (err) {
        showAlert('Error interno en el formulario de registro', 'error');
    }
}

function handleLogin() {
    try {
        function safeVal(id) { const el = document.getElementById(id); return el ? el.value : ''; }
        const email = safeVal('loginEmail');
        const password = safeVal('loginPassword');

        if (!email || !email.trim()) { showAlert('El email es requerido', 'error'); return; }
        if (!password || password.length < 6) { showAlert('La contraseña debe tener al menos 6 caracteres', 'error'); return; }

        const result = AuthManager.login(email, password);

        if (result.success) {
            showAuthUI(false);
            showAppUI(true);
            initializeApp(result.user);
            showAlert('¡Bienvenido!', 'success');
        } else {
            showAlert(result.error, 'error');
        }
    } catch (err) {
        showAlert('Error interno en el formulario de login', 'error');
    }
}

function handleLogout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        AuthManager.logout();
        showAppUI(false);
        showAuthUI(true);
        clearAuthForms();
        showAlert('Sesión cerrada correctamente', 'success');
    }
}

function toggleAuthForms(event) {
    try {
        if (event && typeof event.preventDefault === 'function') event.preventDefault();
    } catch (e) { }

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (!loginForm || !registerForm) return;

    loginForm.classList.toggle('active');
    registerForm.classList.toggle('active');
}

function clearAuthForms() {
    function safeSet(id, v) { const el = document.getElementById(id); if (el) el.value = v; }
    safeSet('loginEmail', '');
    safeSet('loginPassword', '');
    safeSet('regFirstName', '');
    safeSet('regLastName', '');
    safeSet('regEmail', '');
    safeSet('regIRD', '');
    safeSet('regPassport', '');
    safeSet('regAddress', '');
    safeSet('regTaxCode', '');
    safeSet('regPassword', '');
    safeSet('regPasswordConfirm', '');
}

function showAuthUI(show) {
    const authContainer = document.getElementById('authContainer');
    if (show) {
        authContainer.classList.add('active');
    } else {
        authContainer.classList.remove('active');
    }
}

function showAppUI(show) {
    const appContainer = document.getElementById('appContainer');
    if (show) {
        appContainer.classList.add('active');
    } else {
        appContainer.classList.remove('active');
    }
}

function showAlert(message, type) {
    let alert = document.getElementById('authAlert');
    if (!alert) {
        alert = document.createElement('div');
        alert.id = 'authAlert';
        alert.className = 'alert';
        document.body.insertBefore(alert, document.body.firstChild);
    }

    alert.className = `alert alert-${type} show`;
    alert.textContent = message;

    setTimeout(() => {
        alert.classList.remove('show');
    }, 4000);
}

document.addEventListener('DOMContentLoaded', () => {
    AuthManager.init();

    if (AuthManager.isLoggedIn()) {
        const session = AuthManager.getCurrentSession();
        if (typeof showAuthUI === 'function') showAuthUI(false);
        if (typeof showAppUI === 'function') showAppUI(true);
        if (typeof initializeApp === 'function') initializeApp(session);
    } else {
        if (typeof showAuthUI === 'function') showAuthUI(true);
        if (typeof showAppUI === 'function') showAppUI(false);
    }
});

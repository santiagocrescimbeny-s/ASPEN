import { auth, db } from './firebase-config.js';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const AuthManager = (() => {
    let currentSession = null;

    async function register(userData) {
        if (!userData.email || !userData.email.trim()) return { success: false, error: 'El email es requerido' };
        if (!userData.password || userData.password.length < 6) return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' };

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
            const user = userCredential.user;

            // Store additional data in Firestore
            const userDetails = {
                uid: user.uid,
                email: user.email,
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                ird: userData.ird || '',
                passport: userData.passport || '',
                address: userData.address || '',
                taxCode: userData.taxCode || '',
                createdAt: new Date().toISOString()
            };

            await setDoc(doc(db, "users", user.uid), userDetails);

            return { success: true, user: userDetails };
        } catch (error) {
            console.error("Error signing up:", error);
            let errorMessage = 'Error al registrarse';
            if (error.code === 'auth/email-already-in-use') errorMessage = 'El email ya está en uso';
            return { success: false, error: errorMessage };
        }
    }

    async function login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                return { success: true, user: userDoc.data() };
            } else {
                return { success: false, error: 'Perfil de usuario no encontrado' };
            }
        } catch (error) {
            console.error("Error logging in:", error);
            let errorMessage = 'Email o contraseña incorrectos';
            return { success: false, error: errorMessage };
        }
    }

    async function logout() {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    }

    function getCurrentSession() {
        return currentSession;
    }

    function isLoggedIn() {
        return !!auth.currentUser;
    }

    return {
        register,
        login,
        logout,
        getCurrentSession,
        isLoggedIn,
        setSession: (s) => { currentSession = s; }
    };
})();

// UI Handlers
async function handleRegister() {
    try {
        const safeVal = (id) => document.getElementById(id)?.value || '';

        const userData = {
            firstName: safeVal('regFirstName'),
            lastName: safeVal('regLastName'),
            email: safeVal('regEmail'),
            ird: safeVal('regIRD'),
            passport: safeVal('regPassport'),
            address: safeVal('regAddress'),
            taxCode: safeVal('regTaxCode'),
            password: safeVal('regPassword'),
            passwordConfirm: safeVal('regPasswordConfirm')
        };

        if (userData.password !== userData.passwordConfirm) {
            showAlert('Las contraseñas no coinciden', 'error');
            return;
        }

        const result = await AuthManager.register(userData);
        if (result.success) {
            showAlert('¡Registro exitoso!', 'success');
        } else {
            showAlert(result.error, 'error');
        }
    } catch (err) {
        showAlert('Error en el registro', 'error');
    }
}

async function handleLogin() {
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;

    if (!email || !password) {
        showAlert('Email y contraseña requeridos', 'error');
        return;
    }

    const result = await AuthManager.login(email, password);
    if (!result.success) {
        showAlert(result.error, 'error');
    }
}

function handleLogout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        AuthManager.logout();
    }
}

function toggleAuthForms(event) {
    if (event) event.preventDefault();
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (loginForm && registerForm) {
        loginForm.classList.toggle('active');
        registerForm.classList.toggle('active');
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
    setTimeout(() => alert.classList.remove('show'), 4000);
}

function showAuthUI(show) {
    const authContainer = document.getElementById('authContainer');
    if (authContainer) authContainer.classList.toggle('active', show);
}

function showAppUI(show) {
    const appContainer = document.getElementById('appContainer');
    if (appContainer) appContainer.classList.toggle('active', show);
}

// Global exposure for HTML onclick handlers
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleLogout = handleLogout;
window.toggleAuthForms = toggleAuthForms;

// Init Observer
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const session = userDoc.data();
                AuthManager.setSession(session);
                showAuthUI(false);
                showAppUI(true);
                // Trigger app initialization
                if (window.initializeApp) window.initializeApp(session);
            }
        } catch (e) {
            console.error("Error loading user profile", e);
        }
    } else {
        AuthManager.setSession(null);
        showAuthUI(true);
        showAppUI(false);
    }
});

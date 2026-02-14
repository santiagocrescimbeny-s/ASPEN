// Firebase modular SDK initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAmKwA2TZsiwW2d7PxTYB174jSQvPcksqM",
    authDomain: "orchartime.firebaseapp.com",
    projectId: "orchartime",
    storageBucket: "orchartime.firebasestorage.app",
    messagingSenderId: "249161081735",
    appId: "1:249161081735:web:54fc8f944a172ee256e922",
    measurementId: "G-G5QXL6CLFJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

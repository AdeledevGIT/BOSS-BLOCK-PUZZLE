// Boss Block Puzzle - Firebase Configuration
// To enable world high scores, please replace the config below with your Firebase Project Settings.

// Firebase Configuration (Replace with your own project config from Firebase Console)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
    firebase.initializeApp(firebaseConfig);
    console.log("🔥 Firebase initialized successfully.");
} else {
    console.warn("⚠️ Firebase configuration missing. World leaderboard and backup features are disabled.");
    console.warn("Please update firebase-config.js with your project settings.");
}

const db = (typeof firebase !== 'undefined' && firebase.apps.length > 0) ? firebase.firestore() : null;
const auth = (typeof firebase !== 'undefined' && firebase.apps.length > 0) ? firebase.auth() : null;

// Helper to provide Fallback when Firebase is not configured
const isFirebaseReady = () => !!(db && auth);

// Export for other scripts
window.db = db;
window.auth = auth;
window.isFirebaseReady = isFirebaseReady;
window.firebaseConfig = firebaseConfig;

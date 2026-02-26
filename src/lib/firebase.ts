// Import functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, getRedirectResult, createUserWithEmailAndPassword, signOut } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQraqlpyjDvzLmMOCz3j13hnds7AhiQt8",
  authDomain: "agriculture-login.firebaseapp.com",
  projectId: "agriculture-login",
  storageBucket: "agriculture-login.firebasestorage.app",
  messagingSenderId: "82756107127",
  appId: "1:82756107127:web:d0d33c1bbd41c15b737f72",
  measurementId: "G-435NBXFPER"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Test Firebase initialization
console.log('Firebase app initialized:', app.name);
console.log('Firebase config:', firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google Provider with additional scopes and parameters
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
  prompt: 'select_account',
  access_type: 'offline'
});

// Export auth functions
export { signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, getRedirectResult, createUserWithEmailAndPassword, signOut };

export default app;

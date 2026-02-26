import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut 
} from 'firebase/auth';

// Firebase configuration - same as main app
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
console.log('Admin Firebase initialized:', app.name);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Configure Google Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
  prompt: 'select_account',
  access_type: 'offline'
});

// Export auth functions
export { signInWithEmailAndPassword, signInWithPopup, signOut };

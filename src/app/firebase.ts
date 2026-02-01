import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GithubAuthProvider } from 'firebase/auth';

// TODO: replace the following with your Firebase project's config values
const firebaseConfig = {
  apiKey: "AIzaSyBFhfLWU4yYpKEU6PHPT_1wzFoJ2rJRpxM",
  authDomain: "css3d-2641c.firebaseapp.com",
  projectId: "css3d-2641c",
  storageBucket: "css3d-2641c.firebasestorage.app",
  messagingSenderId: "289767703040",
  appId: "1:289767703040:web:de99135897d46a0ab84ee5",
  measurementId: "G-DQNFLT5MX3"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);

// --- added for authentication ---
export const auth = getAuth(firebaseApp);
export const githubProvider = new GithubAuthProvider();
// optional: request additional scopes if needed
// githubProvider.addScope('read:user');

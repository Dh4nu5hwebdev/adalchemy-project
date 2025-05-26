
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type Storage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDKl7Roa9Me5AgFixkVvPg-Jzyc1PKG_qc",
  authDomain: "adalchemy-17efa.firebaseapp.com",
  projectId: "adalchemy-17efa",
  storageBucket: "adalchemy-17efa.firebasestorage.app",
  messagingSenderId: "133655397937",
  appId: "1:133655397937:web:4c3eaf613f9e229dd07710",
  measurementId: "G-H0T5G4DLXE"
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: Storage = getStorage(app);

export { app, auth, db, storage };

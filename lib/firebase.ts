import { initializeApp, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAuth, Auth, setPersistence, browserLocalPersistence } from "firebase/auth";

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA1Q1-ggG27JiC0nZG6nYXJQgWKC_i2CdE",
  authDomain: "smarthome-fadhil.firebaseapp.com",
  databaseURL: "https://smarthome-fadhil-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smarthome-fadhil",
  storageBucket: "smarthome-fadhil.firebasestorage.app",
  messagingSenderId: "5954062029",
  appId: "1:5954062029:web:7959f8fb9326f845850b84",
  measurementId: "G-B34Z87GMC1",
};

// Inisialisasi Firebase
let app: FirebaseApp;
let database: Database;
let storage: FirebaseStorage;
let auth: Auth;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  storage = getStorage(app);
  auth = getAuth(app);

  // Atur persistence hanya jika dijalankan di browser
  if (typeof window !== "undefined") {
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error("Error setting auth persistence:", error);
    });
  }
} catch (error) {
  console.error("Error initializing Firebase:", error);
  throw error; // Lempar error agar lebih mudah ditangani di tempat lain
}

// Ekspor variabel
export { app, database, storage, auth };

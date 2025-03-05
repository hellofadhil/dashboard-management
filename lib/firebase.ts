import { initializeApp } from "firebase/app"
import { getDatabase } from "firebase/database"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyB9-F-C1z4CBrB8tXQ6Sx1Kb-2Yc8o5Xt8",
  authDomain: "test-651d4.firebaseapp.com",
  projectId: "test-651d4",
  databaseURL: "https://test-651d4-default-rtdb.asia-southeast1.firebasedatabase.app/",
  storageBucket: "test-651d4.firebasestorage.app",
  messagingSenderId: "1085571549810",
  appId: "1:1085571549810:web:fdb14d6bb83b0d4c0c90eb",
  measurementId: "G-XR3TE4J1HM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)
const storage = getStorage(app)

export { app, database, storage }


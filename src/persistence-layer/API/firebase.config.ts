import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Reemplaza este objeto con tus credenciales reales de la consola de Firebase
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "baguisport-app.firebaseapp.com",
  projectId: "baguisport-app",
  storageBucket: "baguisport-app.firebasestorage.app",
  messagingSenderId: "99272079831",
  appId: "1:99272079831:web:9fa80bae3657be00373392"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar los servicios listos para ser consumidos por las capas superiores
export const auth = getAuth(app);
export const db = getFirestore(app);

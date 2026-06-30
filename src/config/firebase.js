// Importando as funções principais do Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Banco de dados
import { getAuth } from "firebase/auth";           // Autenticação/Login

// A configuração agora puxa as chaves secretas do arquivo .env usando o padrão do Vite
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializando o aplicativo do Firebase
const app = initializeApp(firebaseConfig);

// Exportando os serviços para podermos usar em outras partes do site (como Admin e Login)
export const db = getFirestore(app);
export const auth = getAuth(app);
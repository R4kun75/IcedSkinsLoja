import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ⚠️ ATENÇÃO: NÃO mude o nome "firebaseConfig" aqui abaixo!
const firebaseConfig = {
  apiKey: "AIzaSyBRlA5tsvvrGub1dXnPdnt91H0-LlTP5TA",
  authDomain: "icedskins-ac654.firebaseapp.com",
  projectId: "icedskins-ac654",
  storageBucket: "icedskins-ac654.firebasestorage.app",
  messagingSenderId: "919518701360",
  appId: "1:919518701360:web:e40919e838511706030af5",
  measurementId: "G-PTYY6LGQSJ"
};

// Se o nome acima estiver correto, esta linha abaixo vai funcionar perfeitamente:
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
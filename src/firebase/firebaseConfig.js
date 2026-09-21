import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD7opH4u3ADFMPDcbZLRpx6EPPp5VVd6Ws",
  authDomain: "e-resquest.firebaseapp.com",
  projectId: "e-resquest",
  storageBucket: "e-resquest.firebasestorage.app",
  messagingSenderId: "860074115460",
  appId: "1:860074115460:web:0cb86c911c80c5b4b11dd1"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
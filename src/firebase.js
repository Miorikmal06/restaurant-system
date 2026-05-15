import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDqeb552J1tYUNKyRIRqabnln449sRoo4M",
  authDomain: "restaurant-ordering-cd4bd.firebaseapp.com",
  projectId: "restaurant-ordering-cd4bd",
  storageBucket: "restaurant-ordering-cd4bd.firebasestorage.app",
  messagingSenderId: "739872291677",
  appId: "1:739872291677:web:ebe45b6d9def5dd39046b4"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
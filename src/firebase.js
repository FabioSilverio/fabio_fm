import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBc0RETGzyM5PbclN5V8j1b-_dPoaVqYr8",
  authDomain: "fabiofm2-ce4a6.firebaseapp.com",
  databaseURL: "https://fabiofm2-ce4a6-default-rtdb.firebaseio.com",
  projectId: "fabiofm2-ce4a6",
  storageBucket: "fabiofm2-ce4a6.firebasestorage.app",
  messagingSenderId: "344668955645",
  appId: "1:344668955645:web:57ae9628b8a8525c4b6f94",
  measurementId: "G-J6749R4718"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app); 
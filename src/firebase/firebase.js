import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyACUWU3PzR8R2nVOej6J196cjZhKstZskU",
  authDomain: "poc-llm-darktheme.firebaseapp.com",
  projectId: "poc-llm-darktheme",
  storageBucket: "poc-llm-darktheme.appspot.com",
  messagingSenderId: "366524886068",
  appId: "1:366524886068:web:7152242333c3f6b0b92e61"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app)



export { app, auth };

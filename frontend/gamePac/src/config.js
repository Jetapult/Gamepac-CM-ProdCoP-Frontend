// Import the functions you need from the SDKs you need
import axios from 'axios';
import { initializeApp } from "firebase/app";
import {getAuth,GoogleAuthProvider,signInWithPopup} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyBwXYGpfzDu7RzaY_MXCCDTOb_XFNkHWtc",
  authDomain: "gamepac-ai.firebaseapp.com",
  projectId: "gamepac-ai",
  storageBucket: "gamepac-ai.appspot.com",
  messagingSenderId: "243651586524",
  appId: "1:243651586524:web:ca6439448e2ab477324719",
  measurementId: "G-26FVWNN77R"
};
export {firebaseConfig};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth=getAuth(app);
export const provider= new GoogleAuthProvider();
export const signInWithGogle = () => {
  signInWithPopup(auth, provider).then((result) => {
    const user = result.user;
      // Send user information to the backend API for Adding to db
      axios.post('http://localhost:3000/api/login', {
        uid:user.uid,
        email: user.email,
        name: user.displayName // Use Firebase user ID as a substitute for the password in the backend
      })
      .then((response) => {
        console.log('User registered successfully:', response.data);
        window.location.href = "./home";
      })
  }).catch((error)=>{
      console.log(error);
  })
};

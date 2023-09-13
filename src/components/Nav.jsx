import axios from 'axios'
import api from '../api';
import { useState,useEffect } from 'react';
import { auth } from "../config";

const Nav=()=>{
  const [userData,setUserData]=useState('');
  const [user,setUser]=useState('');
  const [token,setToken]=useState(null);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => { 
        setUser(user);
        user.getIdToken().then((token)=>{
          setToken(token);
        })
    });
    return () => unsubscribe();
}, []);
const t=token;
  const handleUsers = async (event) => {
    event.preventDefault();
    try {
      if (t) {
        const userResponse = await api.get('/users',{
          headers:{
            Authorization: 'Bearer ' + token
          }
        });
        console.log(userResponse);
        setUserData(JSON.stringify(userResponse.data, null, 2));
      } else {
        console.error('No token found in localStorage');
      }
    } catch (error) {
      console.error('Error getting Users:', error);
      alert('Error getting Users. Please try again.');
    }
  }
  return(
    <div>
      <button onClick={handleUsers}> GET USERS</button>
      <pre>{userData}</pre>

    </div>
  )
}
export default Nav;
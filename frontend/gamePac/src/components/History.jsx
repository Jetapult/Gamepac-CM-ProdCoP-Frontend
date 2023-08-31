import { useState ,useEffect } from "react";
import on from '../assets/icons8-online-64.png';
import off from '../assets/icons8-phonelink-ring-40.png';
import axios from "axios";
import { auth,signInWithGogle } from "../config";
import { useNavigate } from 'react-router-dom';



const History=()=>{
    const [user,setUser]=useState(null);
    const [display,setDisplay]=useState('');
    const [userData, setUserData] = useState([]);
    const [cName,setC]=useState('');
    const navigate=useNavigate();
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => { 
            setUser(user);
            setDisplay(user.displayName||'User');
        });
        return () => unsubscribe();
    }, []);
    useEffect(() => {
        if (user) {
          // Fetch data from the backend for the logged-in user's UID
          axios.get(`http://localhost:3000/user/${user.uid}`)
            .then((response) => {
              setUserData(response.data);
            })
            .catch((error) => {
              console.error('Error fetching user data:', error);
            });
        }
      }, [user]);


    return (
        <div>
             <div>
             {user?(
            <h1 className="font-['League Spartan'] text-center text-white mt-3">Hi {display}, you can access your Past Actions here!</h1>
        ):(<h1>Please Login to access your Minutes.</h1>)}
        </div>
      

         <div className="bg-white mt-5 flex justify-center shadow-md rounded-lg overflow-hidden">
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-[#eaa399] text-white">
            <th className="px-4 py-2">Sl No</th>
            <th className="px-4 py-2">Uploader</th>
            <th className="px-4 py-2">Purpose</th>
            <th className="px-4 py-2">Action Items</th>
            <th className="px-4 py-2">Created At</th>
            <th className="px-4 py-2">Contributor</th>
            <th className="px-4 py-2">Mode</th>
          </tr>
        </thead>
        <tbody>
          {userData.map((data, index) => (
            <tr key={data.data_id} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
              <td className="border px-4 py-2">{index + 1}</td>
              {/* <td className="border px-4 py-2">{user.displayName}</td> */}
              <td className="border px-4 py-2">{data.uploader_name}</td>
              <td className="border px-4 py-2">{data.purpose}</td>
              <td className="border px-4 py-2">
              <button
                  className="bg-[#eaa399] hover:bg-[#f58174] text-white px-2 py-1 rounded"
                  onClick={() => navigate(`/actions/${data.data_id}`)}
                >
                  View Action
                </button>
              </td>
              <td className="border px-4 py-2">{data.timestamp}</td>
              <td className="border px-4 py-2">{data.contributor_name}</td>
              <td className="border px-4 py-2">
                {data.flag ? (
                  <img src={off} alt="Offline" title="Offline" width="20" height="20" />
                ) : (
                  <img src={on} alt="Online" title="Online" width="20" height="20" />
                )}
              </td>
             
            </tr>
          ))}
        </tbody>
      </table>
    </div>
        </div>
        
    )
}

export default History;
import { useState } from 'react'
import Landing from './components/Landing'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from './components/Navbar'
import Home from './components/Home'
import Login from './components/Login'
import History from './components/History'
import SummaryPage from "./components/SummaryPage";
import TranscriptionPage from "./components/TranscriptionPage";
import ActionPage from "./components/ActionPage";
import Online from "./components/Online";
import RecordView from './components/RecordView';
import Smart from './components/Smart';
import Assistant from './components/Assistant';
import Nav from './components/Nav';
import Record from './components/Record';
import Test from './components/test';

function App() {
  return (
      <div className='h-screen bg-[#f58174]'>
         <>
    <Router>
    <Navbar />
    <Routes>
    <Route exact path="/" element={<Landing />}/>
    <Route path="/login" element={<Login />}/>
    <Route path="/home" element={<Home/>}/>
    <Route path="/history" element={<History/>}/>
    <Route path="/summary" element={<SummaryPage/>}/>
    <Route path="/transcription" element={<TranscriptionPage/>}/>
    <Route path="/actions/:id" element={<ActionPage/>}/>
    <Route path="/online" element={<Online/>}/>
    <Route path="/record" element={<RecordView/>}/>
    <Route path="/smart" element={<Smart/>}/>
    <Route path="/assistant" element={<Assistant/>}/>
    <Route path="/recorder" element={<Record />}/>
    <Route path="/test" element={<Test/>}/>
    </Routes>
    </Router>
    {/* <Router>
      // {/* <Routes>
      //   <Route path ="/test" element={<Nav/>}/>
      // </Routes> */}
    {/* </Router> */}
    </>
     </div>
   
  )
}

export default App

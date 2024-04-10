import { useEffect, useState } from "react";
import Landing from "./components/Landing";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import History from "./components/History";
import SummaryPage from "./components/SummaryPage";
import TranscriptionPage from "./components/TranscriptionPage";
import ActionPage from "./components/ActionPage";
import Online from "./components/Online";
import RecordView from "./components/RecordView";
import Smart from "./components/Smart";
import Assistant from "./components/Assistant";
import Record from "./components/Record";
import Test from "./components/test";
import ImageAssets from "./components/ImageAssets";
import ImagePipeline from "./components/ImagePipeline";
import ResetPassword from "./pages/Login/ResetPassword";
import Login from "./pages/Login/Login";
import { parseJwt } from "./utils";
import api from "./api";
import { useDispatch } from "react-redux";
import { addUserData } from "./store/reducer/userSlice";
import Studios from "./pages/Admin/Studios";
import StudioDetails from "./pages/Admin/StudioDetails";
import UnprotectedRoute from "./auth/UnprotectedRoute";
import PrivateRoute from "./auth/PrivateRoute";
import { isAuthenticated } from "./auth";

function App() {
  const userTokenData = localStorage.getItem("jwt");
  const dispatch = useDispatch();

  const getStudioData = async () => {
    const parsedTokenData = JSON.parse(userTokenData);
    const userData = parseJwt(parsedTokenData.token);
    try {
      const studioData = await api.get(`/v1/users/${userData?.id}`, {
        headers: {
          Authorization: `Bearer ${parsedTokenData?.token}`,
        },
      });
      if (studioData.status === 200) {
        dispatch(addUserData(studioData.data.data));
      }
    } catch (err) {
      console.log(err, "err");
    }
  };
  useEffect(() => {
    if (isAuthenticated()) {
      getStudioData();
    }
  }, []);
  return (
    <div className="h-screen bg-[#f58174]">
      <>
        <Router>
          <Navbar />
          <Routes>
            <Route
              exact
              path="/"
              element={
                <UnprotectedRoute>
                  <Landing />
                </UnprotectedRoute>
              }
            />
            <Route
              path="/login"
              element={
                <UnprotectedRoute>
                  <Login />
                </UnprotectedRoute>
              }
            />
            <Route
              path="/set-password"
              element={
                <UnprotectedRoute>
                  <ResetPassword />
                </UnprotectedRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <UnprotectedRoute>
                  <ResetPassword />
                </UnprotectedRoute>
              }
            />
            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/history"
              element={
                <PrivateRoute>
                  <History />
                </PrivateRoute>
              }
            />
            <Route
              path="/summary"
              element={
                <PrivateRoute>
                  <SummaryPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/transcription"
              element={
                <PrivateRoute>
                  <TranscriptionPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/actions/:id"
              element={
                <PrivateRoute>
                  <ActionPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/online"
              element={
                <PrivateRoute>
                  <Online />
                </PrivateRoute>
              }
            />
            <Route
              path="/record"
              element={
                <PrivateRoute>
                  <RecordView />
                </PrivateRoute>
              }
            />
            <Route
              path="/smart"
              element={
                <PrivateRoute>
                  <Smart />
                </PrivateRoute>
              }
            />
            <Route
              path="/assistant"
              element={
                <PrivateRoute>
                  <Assistant />
                </PrivateRoute>
              }
            />
            <Route
              path="/recorder"
              element={
                <PrivateRoute>
                  <Record />
                </PrivateRoute>
              }
            />
            <Route
              path="/test"
              element={
                <PrivateRoute>
                  <Test />
                </PrivateRoute>
              }
            />
            <Route
              path="/image"
              element={
                <PrivateRoute>
                  <ImageAssets />
                </PrivateRoute>
              }
            />
            <Route
              path="/assets"
              element={
                <PrivateRoute>
                  <ImagePipeline />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/studios"
              element={
                <PrivateRoute>
                  <Studios />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/studios/:studio_id"
              element={
                <PrivateRoute>
                  <StudioDetails />
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </>
    </div>
  );
}

export default App;

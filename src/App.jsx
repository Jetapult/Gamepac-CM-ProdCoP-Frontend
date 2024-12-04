import { useEffect } from "react";
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
import UnprotectedRoute from "./auth/UnprotectedRoute";
import PrivateRoute from "./auth/PrivateRoute";
import Weaver from "./components/Weaver";
import WeaverHistory from "./components/WeaverHistory";
import StoryPage from "./components/StoryPage";
import { isAuthenticated } from "./auth";
import AdminLandingPage from "./pages/Admin/AdminLandingPage";
import AdminRoute from "./auth/AdminRoute";
import PageNotFound from "./components/PageNotFound";
import Updates from "./pages/Updates/Updates";
import AIToolsLanding from "./pages/AITools/AIToolsLanding";
import Match3Game from "./pages/HTML5Games/Match3Game";
import WordSearchPuzzleGame from "./pages/HTML5Games/WordSearchPuzzleGame";
import HTML5Games from "./pages/HTML5Games";
import Analytics from "./pages/Analytics/Analytics";
import Signup from "./pages/Login/Signup";
import { addStudios } from "./store/reducer/adminSlice";
import Docs from "./pages/Docs";
import OrganicUA from "./pages/OrganicUA";
import HiddenObjectsGame from "./pages/HTML5Games/HiddenObjectsGame";
import AINarrations from "./pages/HTML5Games/AINarrations";
import RagChat from "./pages/GameReviewer/RagChat";
import HdwPlayable from "./pages/HTML5Games/HdwPlayable";
import Translate from "./pages/Translate";
import Playground from "./pages/PlayablePlayground/Playground";
import MhmPlayable from "./pages/HTML5Games/MhmPlayable";


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
        if (studioData.data.data.studio_type.includes("studio_manager")) {
          await api
            .get("/v1/game-studios")
            .then((res) => {
              dispatch(addStudios(res.data.data));
            })
            .catch((err) => {
              console.log(err);
            });
        }
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
    <div className=" bg-[#f6f6f7] h-[calc(100vh-3.5rem)]">
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
              exact
              path="/ai-tools"
              element={
                <PrivateRoute>
                  <AIToolsLanding />
                </PrivateRoute>
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
              path="/signup"
              element={
                <UnprotectedRoute>
                  <Signup />
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
              path="/note-taker"
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
              path="/:studio_slug/smart"
              element={
                <AdminRoute>
                  <Smart />
                </AdminRoute>
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
              path="/:studio_slug/assistant"
              element={
                <AdminRoute>
                  <Assistant />
                </AdminRoute>
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
              path="/:studio_slug/dashboard"
              element={
                <PrivateRoute>
                  <AdminLandingPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <AdminLandingPage />
                </PrivateRoute>
              }
            />
            <Route path="/updates" element={<Updates />} />
            <Route path="/:studio_slug/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />

            <Route path="/organic-ua/smart-feedback" element={<PrivateRoute><OrganicUA /></PrivateRoute>} />
            <Route path="/organic-ua/smart-feedback/:studio_slug" element={<PrivateRoute><OrganicUA /></PrivateRoute>} />
            <Route path="/organic-ua/tags" element={<PrivateRoute><OrganicUA /></PrivateRoute>} />
            <Route path="/organic-ua/tags/:studio_slug" element={<PrivateRoute><OrganicUA /></PrivateRoute>} />
            <Route path="/organic-ua/templates" element={<PrivateRoute><OrganicUA /></PrivateRoute>} />
            <Route path="/organic-ua/templates/:studio_slug" element={<PrivateRoute><OrganicUA /></PrivateRoute>} />
            <Route path="/organic-ua/review-insights" element={<PrivateRoute><OrganicUA /></PrivateRoute>} />
            <Route path="/organic-ua/review-insights/:studio_slug" element={<PrivateRoute><OrganicUA /></PrivateRoute>} />
            <Route path="/organic-ua/weekly-report" element={<PrivateRoute><OrganicUA /></PrivateRoute>} />
            <Route path="/organic-ua/weekly-report/:studio_slug" element={<PrivateRoute><OrganicUA /></PrivateRoute>} />

            
            <Route path="/aistories" element={<PrivateRoute><Weaver /></PrivateRoute>} />
            <Route path="/storiesHistory" element={<PrivateRoute><WeaverHistory /></PrivateRoute>} />
            <Route path ="/aiStories/:id" element={<PrivateRoute><StoryPage /></PrivateRoute>}/>
            <Route path ="/html5-games" element={<PrivateRoute><HTML5Games /></PrivateRoute>}/>
            <Route path ="/html5-games/match-3" element={<PrivateRoute><Match3Game /></PrivateRoute>}/>
            <Route path ="/html5-games/word-search-puzzle" element={<PrivateRoute><WordSearchPuzzleGame /></PrivateRoute>}/>
            <Route path ="/html5-games/hidden-objects" element={<PrivateRoute><HiddenObjectsGame /></PrivateRoute>}/>
            <Route path ="/html5-games/narration" element={<PrivateRoute><AINarrations /></PrivateRoute>}/>
            <Route path ="/html5-games/word-match" element={<PrivateRoute><HdwPlayable/></PrivateRoute>}/>
            <Route path ="/html5-games/home-decor" element={<PrivateRoute><MhmPlayable/></PrivateRoute>}/>
            <Route path="/docs/overview" element={<Docs />} />
            <Route path="/docs/app-onboarding" element={<Docs />} />
            <Route path="/docs/ai-replies" element={<Docs />} />
            <Route path="/docs/campaign" element={<Docs />} />

            <Route path="/ai-chat" element={<PrivateRoute><RagChat /></PrivateRoute>} />
            <Route path="/ai-chat/:studio_slug" element={<PrivateRoute><RagChat /></PrivateRoute>} />
            <Route path="/translate" element={<PrivateRoute><Translate /></PrivateRoute>} />
            <Route path="/playground" element={<Playground />} />
            <Route
              path="*"
              element={<PageNotFound />}
            />
          </Routes>
        </Router>
      </>
    </div>
  );
}

export default App;

import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import ChatScreen from "../components/ChatScreen";

const Chat = () => {
  const { slug: chatId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [initialQuery, setInitialQuery] = useState("");

  // Extract initial query from navigation state and clear it
  useEffect(() => {
    if (location.state?.initialQuery) {
      setInitialQuery(location.state.initialQuery);
      // Clear the state to prevent re-sending on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  return (
    <div className="relative flex w-full h-screen bg-white overflow-hidden">
      <Sidebar />
      <div className="w-full h-full flex">
        <ChatScreen chatId={chatId} initialQuery={initialQuery} />
      </div>
    </div>
  );
};

export default Chat;

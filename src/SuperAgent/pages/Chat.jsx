import React from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/sidebar";
import ChatScreen from "../components/ChatScreen";

const Chat = () => {
  const location = useLocation();
  const initialQuery = location.state?.initialQuery || "";

  return (
    <div className="relative flex w-full h-screen bg-white overflow-hidden">
      <Sidebar />
      <div className="w-full h-full flex">
        <ChatScreen initialQuery={initialQuery} />
      </div>
    </div>
  );
};

export default Chat;

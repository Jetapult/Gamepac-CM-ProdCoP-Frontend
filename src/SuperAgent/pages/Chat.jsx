import React from "react";
import Sidebar from "../components/sidebar";
import ChatScreen from "../components/ChatScreen";

const Chat = () => {
  return (
    <div className="relative flex w-full h-screen bg-white overflow-hidden">
      <Sidebar />
      <div className="w-full h-full flex">
        <ChatScreen />
      </div>
    </div>
  );
};

export default Chat;

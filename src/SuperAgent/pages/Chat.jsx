import React from "react";
import Sidebar from "../components/sidebar";
import ChatScreen from "../components/ChatScreen";

const Chat = () => {
  return (
    <div className="relative w-full h-screen bg-white overflow-hidden">
      <Sidebar />
      <div className="ml-[64px] h-full flex">
        <ChatScreen />
      </div>
    </div>
  );
};

export default Chat;

import React, { useEffect, useRef } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import ChatScreen from "../components/ChatScreen";

const Chat = () => {
  const { slug: chatId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Use refs to capture initial values before navigate clears them
  const initialValuesRef = useRef({
    initialQuery: location.state?.initialQuery || "",
    initialAttachments: location.state?.initialAttachments || [],
    agentSlug: location.state?.agentSlug || "",
    finopsSessionId: location.state?.finopsSessionId || null,
    liveopsSessionId: location.state?.liveopsSessionId || null,
  });

  // Clear the navigation state after first render to prevent re-sending on refresh
  useEffect(() => {
    if (
      location.state?.initialQuery ||
      location.state?.agentSlug ||
      location.state?.initialAttachments ||
      location.state?.finopsSessionId ||
      location.state?.liveopsSessionId
    ) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  return (
    <div className="relative flex w-full h-screen bg-white overflow-hidden">
      <Sidebar />
      <div className="w-full h-full flex">
        <ChatScreen
          chatId={chatId}
          initialQuery={initialValuesRef.current.initialQuery}
          initialAttachments={initialValuesRef.current.initialAttachments}
          agentSlug={initialValuesRef.current.agentSlug}
          initialFinopsSessionId={initialValuesRef.current.finopsSessionId}
          initialLiveopsSessionId={initialValuesRef.current.liveopsSessionId}
        />
      </div>
    </div>
  );
};

export default Chat;

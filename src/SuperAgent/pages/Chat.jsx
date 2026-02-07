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
    agentSessionId: location.state?.agentSessionId || null,
  });

  // Clear the navigation state after first render to prevent re-sending on refresh
  useEffect(() => {
    if (
      location.state?.initialQuery ||
      location.state?.agentSlug ||
      location.state?.initialAttachments ||
      location.state?.agentSessionId
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
          initialAgentSessionId={initialValuesRef.current.agentSessionId}
        />
      </div>
    </div>
  );
};

export default Chat;

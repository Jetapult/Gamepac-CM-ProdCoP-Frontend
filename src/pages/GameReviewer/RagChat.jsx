import { useSelector } from "react-redux";
import api from "../../api";
import React, { useEffect, useRef, useState } from "react";
import ToastMessage from "../../components/ToastMessage";
import GeneratingLoader from "./components/GeneratingLoader";
import Message from "./components/Message";
import Conversations from "./components/Conversations";
import InputFieldChat from "./components/InputFieldChat";
import KnowledgeBase from "./components/KnowledgeBase";
import PdfViewer from "./components/PdfViewer";

export const isPDF = (url) => {
  return url.toLowerCase().endsWith(".pdf");
};

const isImage = (url) => {
  return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);
};

export const getFileName = (name) => {
  return name.split("/").pop();
};

const RagChat = () => {
  const studios = useSelector((state) => state.admin.studios);
  const userData = useSelector((state) => state.user.user);
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState({});
  const [selectedTab, setSelectedTab] = useState("android");
  const [selectedStudio, setSelectedStudio] = useState({});
  const [period, setPeriod] = useState("7");
  const [customDates, setCustomDates] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [messageObj, setMessageObj] = useState({
    message: "",
    files: [],
    attachments: [],
  });
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [generatingLoader, setGeneratingLoader] = useState(false);
  const [toastMessage, setToastMessage] = useState({
    show: false,
    message: "",
    duration: 3000,
    type: "success",
  });
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [selectedKnowledgebase, setSelectedKnowledgebase] = useState([]);
  const wrapperRef = useRef(null);
  const messagesEndRef = useRef(null);

  const createNewChat = async () => {
    try {
      if (conversations.some((x) => x.message_count === 0)) {
        return;
      }
      const response = await createConversation(`New Chat`);
      if (response.data.data) {
        setConversations((prev) => [response.data.data, ...prev]);
        setSelectedConversation(response.data.data);
        setMessages([]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const onMessageSend = async (messageObj, conversationId) => {
    try {
      const requestbody = {
        message: messageObj.message,
        conversation_id: conversationId || selectedConversation.id,
        selectedKnowledgebase: selectedKnowledgebase.id
      };
      if(selectedKnowledgebase.length){
        const knowledgebase_ids = [];
        const knowledgebase_source = [];
        selectedKnowledgebase.forEach(knowledgebase => {
          knowledgebase_ids.push(knowledgebase.id);
          knowledgebase_source.push(`/tmp/${knowledgebase?.file_url?.split('/')?.pop()}`)
        })
        requestbody.knowledgebase_ids = knowledgebase_ids
        requestbody.source = knowledgebase_source
      }
      if (messageObj.files.length) {
        requestbody.files = messageObj.attachments;
      }
      const response = await api.post(`/v1/chat/chat-with-ai`, requestbody);
      const aiResponse = {
        ...response.data.data.saved_message,
        latest: true,
      };
      setMessages((prev) => [aiResponse, ...prev]);
      setMessageObj({
        message: "",
        files: [],
      });
      if (selectedConversation?.message_count === 0) {
        setSelectedConversation({ ...selectedConversation, message_count: 1 });
      }
      setGeneratingLoader(false);
    } catch (err) {
      console.log(err);
      setToastMessage({
        show: true,
        message:
          err?.response?.data?.message ||
          "Something went wrong! Please try again later",
        type: "error",
      });
      setGeneratingLoader(false);
    }
  };

  const updateConversation = async (conversation, newTitle) => {
    try {
      const requestBody = {
        title: newTitle,
        platform: conversation.platform,
      };
      const updateConversationResponse = await api.put(
        `/v1/chat/conversations/${selectedGame.id || 1}/${conversation.id}`,
        requestBody
      );
      setConversations((prev) =>
        Array.isArray(prev)
          ? prev.map((x) =>
              x.id === conversation.id ? { ...x, title: newTitle } : x
            )
          : []
      );
    } catch (err) {
      console.log(err);
    }
  };

  const deleteConversation = async (conversation) => {
    try {
      const deleteConversationResponse = await api.delete(
        `/v1/chat/conversations/${selectedGame.id || 1}/${
          conversation.platform || "android"
        }/${conversation.id}`
      );
      const newConversations = conversations.filter(
        (x) => x.id !== conversation.id
      );
      setConversations(newConversations);
      if (selectedConversation?.id === conversation?.id) {
        setSelectedConversation(newConversations[0]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const createConversation = async (convoTitle) => {
    try {
      const requestBody = {
        game_id: selectedGame.id || 1,
        title: convoTitle,
        platform: selectedGame.platform === "apple" ? "ios" : "android",
      };
      const createConversationResponse = await api.post(
        `/v1/chat/conversations`,
        requestBody
      );
      return createConversationResponse;
    } catch (err) {
      console.log(err);
    }
  };

  const sendMessage = async (messageObj) => {
    try {
      setGeneratingLoader(true);
      if (selectedConversation?.id) {
        onMessageSend(messageObj, selectedConversation.id);
        if (selectedConversation?.message_count === 0) {
          updateConversation(
            selectedConversation,
            messageObj?.message?.slice(0, 150)
          );
        }
      } else {
        const conversationResponse = await createConversation(
          messageObj.message.slice(0, 150)
        );
        if (conversationResponse.data.data) {
          setConversations(conversationResponse.data.data);
          setSelectedConversation(conversationResponse.data.data);
          onMessageSend(messageObj, conversationResponse.data.data.id);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };
  const fetchAllgames = async () => {
    try {
      const gamesresponse = await api.get(
        `/v1/games/platform/${
          selectedStudio.id ? selectedStudio.id : userData.studio_id
        }`
      );
      setGames(gamesresponse.data.data);
      setSelectedGame({ ...gamesresponse.data.data[0], platform: "android" });
    } catch (err) {
      console.log(err);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get(
        `/v1/chat/conversations/${
          selectedGame.platform === "apple" ? "ios" : "android"
        }/${selectedGame.id || 1}`
      );
      setConversations(response.data.data);
      setSelectedConversation(response.data.data[0]);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(
        `/v1/chat/messages/${selectedConversation.id}`
      );
      setMessages(response.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (userData.studio_id) {
      fetchAllgames();
    }
  }, [userData?.id, selectedStudio.id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (selectedGame.id || 1) {
      fetchConversations();
    }
  }, [
    selectedGame.id || 1,
    selectedGame.platform,
    period !== "custom" ? period : null,
  ]);

  useEffect(() => {
    if (selectedConversation?.id && selectedConversation?.message_count > 0) {
      fetchMessages();
    } else {
      // setMessages([]);
    }
  }, [selectedConversation?.id]);

  return (
    <div className="mx-auto">
      <div className="bg-white h-[calc(100vh-60px)]">
        <div className="flex">
          <div className="relative pt-4 px-4 w-[20%] bg-[#f6f6f7]">
            <h1 className="text-2xl font-bold">AI Chat</h1>
            <KnowledgeBase
              messageObj={messageObj}
              setMessageObj={setMessageObj}
              userData={userData}
              selectedPdf={selectedPdf}
              setSelectedPdf={setSelectedPdf}
              setSelectedKnowledgebase={setSelectedKnowledgebase}
            />
            {/* <Conversations
                conversations={conversations}
                selectedConversation={selectedConversation}
                setSelectedConversation={setSelectedConversation}
                createNewChat={createNewChat}
                updateConversation={updateConversation}
                deleteConversation={deleteConversation}
              /> */}
          </div>
          <div className="relative w-[40%]">
            {selectedPdf && <PdfViewer selectedPdf={selectedPdf} />}
          </div>
          <div className="relative w-[40%] px-6 border-l border-l-[#e6e6e6]">
            <div className="flex flex-col-reverse h-[calc(100vh-60px)] overflow-auto no-scrollbar pb-24 outline-none">
              {generatingLoader && <GeneratingLoader />}
              {messages.map((message, index) => (
                <Message key={index} message={message} />
              ))}
            </div>
            <div ref={messagesEndRef} />
            <InputFieldChat
              messageObj={messageObj}
              setMessageObj={setMessageObj}
              sendMessage={sendMessage}
              setMessages={setMessages}
              messages={messages}
              generatingLoader={generatingLoader}
              userData={userData}
              conversations={conversations}
              selectedConversation={selectedConversation}
              setSelectedConversation={setSelectedConversation}
              createNewChat={createNewChat}
              updateConversation={updateConversation}
              deleteConversation={deleteConversation}
            />
          </div>
        </div>
      </div>
      {toastMessage.show && (
        <ToastMessage
          message={toastMessage}
          setToastMessage={setToastMessage}
        />
      )}
    </div>
  );
};

export default RagChat;

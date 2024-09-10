import {
  DocumentIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { getFileName, isPDF } from "../RagChat";
import { useEffect, useState } from "react";
import Conversations from "./Conversations";
import history from "../../../assets/history.svg";
import plusIcon from "../../../assets/plus-icon.svg";

const InputFieldChat = ({
  messageObj,
  setMessageObj,
  sendMessage,
  messages,
  setMessages,
  generatingLoader,
  userData,
  conversations,
  selectedConversation,
  setSelectedConversation,
  createNewChat,
  updateConversation,
  deleteConversation,
  fetchConversations,
  totalConversations
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const handleFileChange = async (event) => {
    try {
      const files = Array.from(event.target.files);
      // const imageUrls = files.map((file) => URL.createObjectURL(file));
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("slug", userData.slug);
      const response = await api.post("/v1/chat/attachments", formData);
      setMessageObj({
        ...messageObj,
        files: files,
        attachments: response.data.data.files,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSendMessage = () => {
    if (messageObj.message.trim().length && !generatingLoader) {
      messages.forEach((x) => (x.latest = false));
      setMessageObj({
        message: "",
        files: [],
        attachments: [],
        quote: "",
      });
      setMessages([messageObj, ...messages]);
      sendMessage(messageObj);
    }
  };

  return (
    <>
      <div className="absolute bottom-2 left-0 right-0 bg-white mx-1">
        {conversations.length ? (
          <div className="flex my-2 mx-2">
            <button
              className="border border-[#ccc] px-3 py-[2px] rounded-full mr-2 hover:bg-[#e6e6e6] leading-[26px] flex items-center"
              onClick={() => setShowHistory(true)}
            >
              <img src={history} className="mr-1" alt="history" />
              <span className="text-sm">History</span>
            </button>
            <button
              className={`border border-[#ccc] px-3 py-[2px] rounded-full hover:bg-[#e6e6e6] leading-[26px] flex items-center ${
                generatingLoader ? "bg-[#e6e6e6] opacity-25" : ""
              }`}
              onClick={() => createNewChat()}
              disabled={generatingLoader}
            >
              <img src={plusIcon} className="mr-1" alt="new chat" />
              <span className="text-sm">New Chat</span>
            </button>
          </div>
        ) : (
          <></>
        )}
        <div className="p-3 border border-[#ccc] rounded-[26px]">
          {messageObj.quote && <div className="bg-[#f6f6f7] p-2 rounded-t-xl mb-2 relative">
            <p className="overflow-auto max-h-16 pr-3">{messageObj.quote}</p>
            <XCircleIcon className="w-5 h-5 text-[#808080] absolute right-[4px] top-[4px] cursor-pointer" onClick={() => setMessageObj({
              ...messageObj,
              quote: "",
            })} />
          </div>}
          <div className="flex items-center">
            {/* <label htmlFor="file-upload" className="cursor-pointer">
          <PaperClipIcon className="w-6 h-5 absolute top-1/2 left-2 transform -translate-y-1/2 rotate-[-45deg]" />
        </label>
        <input
          id="file-upload"
          type="file"
          multiple
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleFileChange}
        /> */}
            <textarea
              placeholder="Message AI"
              className="w-full resize-none focus:outline-none bg-transparent overflow-hidden"
              style={{ height: "20px" }}
              onChange={(event) => {
                setMessageObj({
                  ...messageObj,
                  message: event.target.value,
                });
              }}
              onInput={(e) => {
                e.target.style.height = "20px";
                e.target.style.height = `${Math.min(
                  e.target.scrollHeight,
                  100
                )}px`;
              }}
              value={messageObj.message}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSendMessage();
                }
              }}
              autoFocus
            />
            <PaperAirplaneIcon
              className={`w-6 h-6 cursor-pointer ${
                messageObj.message.length ? "text-[#ff1053]" : "opacity-20"
              }`}
              onClick={handleSendMessage}
            />
          </div>
          {/* <div className="flex pl-6">
        {messageObj?.attachments?.map((image, index) => (
          <div key={index} className="relative">
            {isPDF(image) ? (
              <div className="rounded-lg mx-2 cursor-pointer flex bg-[#f6f6f7] p-2">
                <DocumentIcon className="w-6 h-6" />
                {getFileName(image)}
              </div>
            ) : (
              <img
                src={image}
                alt={`Preview ${index}`}
                className="w-14 h-14 rounded-lg mx-2"
              />
            )}
            <XCircleIcon
              className="w-5 h-5 text-[#808080] absolute right-[-2px] top-[-6px] cursor-pointer"
              onClick={() =>
                setMessageObj({
                  ...messageObj,
                  attachments: messageObj.attachments.filter(
                    (_, i) => i !== index
                  ),
                  files: messageObj.files.filter((_, i) => i !== index),
                })
              }
            />
          </div>
        ))}
      </div> */}
        </div>
      </div>
      {showHistory && (
        <History
          setShowHistory={setShowHistory}
          conversations={conversations}
          selectedConversation={selectedConversation}
          setSelectedConversation={setSelectedConversation}
          createNewChat={createNewChat}
          updateConversation={updateConversation}
          deleteConversation={deleteConversation}
          fetchConversations={fetchConversations}
          totalConversations={totalConversations}
        />
      )}
    </>
  );
};

const History = ({
  setShowHistory,
  conversations,
  selectedConversation,
  setSelectedConversation,
  createNewChat,
  updateConversation,
  deleteConversation,
  fetchConversations,
  totalConversations
}) => {
  return (
    <div
      className="justify-end items-center flex overflow-x-hidden overflow-y-hidden fixed inset-0 z-50 outline-none focus:outline-none bg-[#12111157]"
      onClick={() => setShowHistory(false)}
    >
      <div
        className="relative my-6 max-w-3xl w-[400px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none h-screen px-4">
          <Conversations
            conversations={conversations}
            selectedConversation={selectedConversation}
            setSelectedConversation={(val) => {
              setSelectedConversation(val);
              setShowHistory(false);
            }}
            createNewChat={() => {
              createNewChat();
              setShowHistory(false);
            }}
            updateConversation={updateConversation}
            deleteConversation={deleteConversation}
            fetchConversations={fetchConversations}
            totalConversations={totalConversations}
          />
        </div>
      </div>
    </div>
  );
};

export default InputFieldChat;

import { SendHorizonal, X } from "lucide-react";
import { useRef, useState, useEffect } from "react";

const Message = ({ message }) => {
  return (
    <div className={`flex mb-4 ${message.isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
          message.isUser
            ? "bg-[#B9FF66] text-black"
            : "bg-gray-100 text-black"
        }`}
      >
        <p className="text-sm">{message.content}</p>
      </div>
    </div>
  );
};

const GeneratingLoader = () => {
  return (
    <div className="flex mb-4 justify-start">
      <div className="max-w-[80%] p-3 rounded-lg bg-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-150"></div>
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-300"></div>
        </div>
      </div>
    </div>
  );
};

const ScrollButton = ({ isAtBottom, onClick }) => {
  if (isAtBottom) return null;
  
  return (
    <button
      onClick={onClick}
      className="absolute bottom-20 right-6 bg-white shadow-md rounded-full p-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 19V5M5 12l7 7 7-7" />
      </svg>
    </button>
  );
};

export const GPTScriptWriterPopup = ({
  gptScriptWriterPopup,
  setGptScriptWriterPopup,
}) => {
  const [messages, setMessages] = useState([
    { content: "Hi! I'm your script writing assistant. How can I help you today?", isUser: false }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  
  const messagesEndRef = useRef(null);
  const wrapperRef = useRef(null);
  
  const onCancel = () => {
    setGptScriptWriterPopup(!gptScriptWriterPopup);
  };
  
  useEffect(() => {
    if (messagesEndRef.current && isAtBottom) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);
  
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const userMessage = { content: inputValue, isUser: true };
    setMessages(prev => [userMessage, ...prev]);
    setInputValue("");
    setIsAtBottom(true);
    
    setIsGenerating(true);
    setTimeout(() => {
      const aiResponse = { 
        content: "I've created a script based on your request. Here it is...", 
        isUser: false 
      };
      setMessages(prev => [aiResponse, ...prev]);
      setIsGenerating(false);
    }, 2000);
  };
  
  const handleScroll = (e) => {
    const { scrollTop } = e.target;
    setIsAtBottom(scrollTop === 0);
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsAtBottom(true);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-[999] outline-none focus:outline-none bg-[#12111157]">
      <div className="relative my-6 mx-auto max-w-5xl w-full">
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
            <div className="">
              <h3 className="text-2xl font-semibold whitespace-pre-line">
                GPT script writer
              </h3>
              <p>Your secret to crafting compelling scripts effortlessly!</p>
            </div>
            <button
              className="p-1 ml-auto border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={onCancel}
            >
              <X className="w-6 h-6 text-[#d6d6d6]" />
            </button>
          </div>
          
          <div className="p-6 h-[500px] relative">
            <div
              ref={wrapperRef}
              className="flex flex-col-reverse h-full overflow-auto pb-2 outline-none"
              onScroll={handleScroll}
            >
              {isGenerating && <GeneratingLoader />}
              {messages.map((message, index) => (
                <Message key={index} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {messages.length > 2 && (
              <ScrollButton isAtBottom={isAtBottom} onClick={scrollToBottom} />
            )}
          </div>
          
          <div className="flex px-6 py-3">
            <div className="w-full pr-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your prompt"
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled={isGenerating}
              />
            </div>
            <button 
              className={`bg-[#B9FF66] p-2 rounded-md w-24 flex items-center justify-center ${
                isGenerating ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleSendMessage}
              disabled={isGenerating}
            >
              <SendHorizonal className="w-6 h-6" strokeWidth={1.5} />
              <span className="ml-2">Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

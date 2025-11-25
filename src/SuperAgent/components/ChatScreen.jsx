import React, { useState } from "react";
import { ChevronDown, ChevronUp, Share2, MoreHorizontal, Paperclip, Plug, Send, FileSpreadsheet } from "lucide-react";
import gamepacLogo from "../../assets/super-agents/gamepac-logo.svg";

const ChatScreen = () => {
  const [isTaskExpanded, setIsTaskExpanded] = useState(true);

  // Sample data - replace with actual data from props/state
  const chatTitle = "CommPac Report Analysis";
  const taskProgress = { current: 1, total: 5 };

  const userAttachment = {
    name: "Mobile Review Spreadsheet...",
    type: "Spreadsheet",
    size: "9.16 Mb",
    icon: <FileSpreadsheet className="text-green-600" size={24} />
  };

  const actions = [
    { id: 1, icon: "file", text: "Reading file", detail: "Mobile Review Spreadsheet.csv", status: "completed" },
    { id: 2, icon: "terminal", text: "Executing command", detail: "pip3 install pandas", status: "completed" },
    { id: 3, icon: "edit", text: "Creating file", detail: "sentiment_analysis_detailed.py", status: "completed" },
    { id: 4, icon: "file", text: "Reading file", detail: "Mobile Review Spreadsheet.csv", status: "completed" },
    { id: 5, icon: "file", text: "Reading file", detail: "Mobile Review Spreadsheet.csv", status: "in-progress" }
  ];

  return (
    <div className="flex-1 flex">
      {/* Left Side - Conversation */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-[#f6f6f6] flex items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-[#141414]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
              {chatTitle}
            </h1>
            <button className="text-[#6d6d6d] hover:text-[#1f6744]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button className="w-8 h-8 flex items-center justify-center border border-[#e6e6e6] rounded-lg hover:border-[#1f6744] transition-colors">
              <MoreHorizontal size={20} className="text-[#6d6d6d]" />
            </button>
            <button className="h-8 px-3 flex items-center gap-2 border border-[#e6e6e6] rounded-lg hover:border-[#1f6744] transition-colors">
              <Share2 size={16} className="text-[#6d6d6d]" />
              <span className="text-base text-[#141414]" style={{ fontFamily: 'Urbanist, sans-serif' }}>Share</span>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* User Message with Attachment */}
          <div className="flex flex-col items-end gap-4 max-w-[400px] ml-auto">
            {/* Attachment */}
            <div className="bg-white border border-[#e6e6e6] rounded-lg p-4 flex items-center gap-3">
              <div className="w-[50px] h-[56px] bg-green-100 rounded-md flex items-center justify-center">
                {userAttachment.icon}
              </div>
              <div className="flex-1">
                <p className="text-base text-black mb-1" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                  {userAttachment.name}
                </p>
                <div className="flex items-center gap-2 text-sm text-[#b0b0b0]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                  <span>{userAttachment.type}</span>
                  <div className="w-[3px] h-[3px] bg-[#b0b0b0] rounded-full" />
                  <span>{userAttachment.size}</span>
                </div>
              </div>
            </div>

            {/* User Message */}
            <div className="bg-white border border-[#e6e6e6] rounded-tl-lg rounded-tr-lg rounded-bl-lg px-4 py-3">
              <p className="text-base text-[#141414]" style={{ fontFamily: 'Urbanist, sans-serif', lineHeight: '24px' }}>
                Generate a professional sentiment analysis report
              </p>
            </div>
          </div>

          {/* GamePac Response */}
          <div className="flex flex-col gap-3 max-w-[551px]">
            {/* GamePac Header */}
            <div className="flex items-center gap-2">
              <img src={gamepacLogo} alt="GamePac" className="w-6 h-6" />
              <span className="text-base font-medium text-black" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                GamePac
              </span>
            </div>

            {/* Response Text */}
            <p className="text-base text-black" style={{ fontFamily: 'Urbanist, sans-serif', lineHeight: '24px' }}>
              Understood, I will analyze the sentiment data in the provided CSV file and create a summary of the major sentiment analysis of different games.
            </p>
          </div>

          {/* Task Section */}
          <div className="max-w-[551px]">
            {/* Task Header */}
            <button
              onClick={() => setIsTaskExpanded(!isTaskExpanded)}
              className="flex items-center gap-3 mb-2 group"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                {isTaskExpanded ? (
                  <ChevronUp size={16} className="text-[#6d6d6d]" />
                ) : (
                  <ChevronDown size={16} className="text-[#6d6d6d]" />
                )}
              </div>
              <span className="text-base font-medium text-black group-hover:text-[#1f6744]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                Load and explore the sentiment data
              </span>
            </button>

            {/* Task Description */}
            <p className="text-sm text-[#b0b0b0] mb-3 ml-8" style={{ fontFamily: 'Urbanist, sans-serif', lineHeight: '21px' }}>
              I understand the task is to analyze sentiment data from the CSV file. Next, I will load and explore the dataset to identify patterns and issues across different games.
            </p>

            {/* Actions List */}
            {isTaskExpanded && (
              <div className="border border-[#f6f6f6] rounded-lg ml-8">
                {actions.map((action, index) => (
                  <div
                    key={action.id}
                    className={`flex items-center gap-2 px-3 py-2.5 ${
                      index !== actions.length - 1 ? 'border-b border-[#f6f6f6]' : ''
                    }`}
                  >
                    <ActionIcon type={action.icon} status={action.status} />
                    <p className="text-sm" style={{ fontFamily: 'Urbanist, sans-serif', lineHeight: '21px' }}>
                      <span className="text-[#141414]">{action.text}</span>{' '}
                      <span className="text-[#b0b0b0]">{action.detail}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-[#f6f6f6] border-t border-[#f6f6f6] p-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Generate a professional sentiment analysis report"
              className="w-full bg-transparent border-none outline-none text-base text-[#b0b0b0] placeholder:text-[#b0b0b0] py-3 pr-12"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
            />

            {/* Bottom Toolbar */}
            <div className="flex items-center justify-between mt-16">
              <div className="flex gap-4">
                <button className="w-9 h-9 bg-white border-0 rounded-lg flex items-center justify-center text-[#6d6d6d] hover:text-[#1f6744] transition-colors">
                  <Paperclip size={16} />
                </button>
                <button className="w-9 h-9 bg-white border-0 rounded-lg flex items-center justify-center text-[#6d6d6d] hover:text-[#1f6744] transition-colors">
                  <Plug size={16} />
                </button>
              </div>

              <button className="w-9 h-9 bg-[#e6e6e6] rounded-lg flex items-center justify-center text-[#b0b0b0] hover:bg-[#1f6744] hover:text-white transition-all">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Chat Window */}
      <div className="w-[700px] bg-[#f8f8f7] border-l border-[#f6f6f6] flex flex-col">
        {/* Zero State / Building State */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            {/* Illustration */}
            <div className="w-[296px] h-[177px] bg-white rounded-lg mb-6 mx-auto relative overflow-hidden">
              <div className="absolute top-[43px] left-3 w-[100px] h-3 bg-[#f8f8f7] rounded-sm" />
              <div className="absolute top-[69px] left-3 w-[100px] h-3 bg-[#f8f8f7] rounded-sm" />
              <div className="absolute top-[89px] left-3 w-[100px] h-20 bg-[#f8f8f7] rounded-sm" />
              <div className="absolute top-[43px] left-[124px] w-[163px] h-20 bg-[#f8f8f7] rounded-sm" />
              <div className="absolute top-[129px] left-[124px] w-[160px] h-3 bg-[#f8f8f7] rounded-sm" />
              <div className="absolute top-[147px] left-[124px] w-[160px] h-[22px] bg-[#f8f8f7] rounded-sm" />
            </div>

            <p className="text-sm text-black" style={{ fontFamily: 'Urbanist, sans-serif', lineHeight: '21px' }}>
              GamePac is building the document. Hang tight ✌️
            </p>
          </div>
        </div>

        {/* Task Progress Footer */}
        <div className="bg-white border-t border-[#f0f0f0] rounded-tl-lg rounded-tr-lg p-6">
          <div className="flex items-center justify-between">
            <p className="text-base text-[#0e2f1f] font-medium" style={{ fontFamily: 'Urbanist, sans-serif' }}>
              Task Progress
            </p>
            <div className="flex items-center gap-1 text-sm text-[#b0b0b0]" style={{ fontFamily: 'Urbanist, sans-serif' }}>
              <span>{taskProgress.current}/{taskProgress.total}</span>
              <ChevronDown size={16} className="text-[#6d6d6d]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Action Icon Component
const ActionIcon = ({ type, status }) => {
  const getIcon = () => {
    switch (type) {
      case "file":
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke={status === "completed" ? "#1f6744" : "#6d6d6d"} strokeWidth="1.5" />
            {status === "completed" && (
              <path d="M7 10L9 12L13 8" stroke="#1f6744" strokeWidth="1.5" fill="none" />
            )}
          </svg>
        );
      case "terminal":
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke={status === "completed" ? "#1f6744" : "#6d6d6d"} strokeWidth="1.5" />
            {status === "completed" && (
              <path d="M7 10L9 12L13 8" stroke="#1f6744" strokeWidth="1.5" fill="none" />
            )}
          </svg>
        );
      case "edit":
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M14 6L8 12L6 14L8 12" stroke={status === "completed" ? "#1f6744" : "#6d6d6d"} strokeWidth="1.5" fill="none" />
            <circle cx="10" cy="10" r="8" stroke={status === "completed" ? "#1f6744" : "#6d6d6d"} strokeWidth="1.5" />
          </svg>
        );
      default:
        return null;
    }
  };

  return <div className="w-5 h-5 flex items-center justify-center shrink-0">{getIcon()}</div>;
};

export default ChatScreen;

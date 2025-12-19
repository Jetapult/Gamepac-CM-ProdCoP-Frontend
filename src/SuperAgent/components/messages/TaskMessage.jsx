import React from "react";
import ReactMarkdown from "react-markdown";
import { Eye, Code, Edit3, CornerDownLeft } from "lucide-react";

const TaskMessage = ({ task, isLatest = false, onSendMessage }) => {
  return (
    <div className={`max-w-[551px] ml-8 ${!task.description ? "-mt-2" : ""}`}>
      {/* Task Description */}
      {task.description && (
        <div
          className="text-sm text-[#B0B0B0] mb-3 ml-7 prose prose-sm max-w-none prose-p:my-1 prose-ul:my-2 prose-li:my-0.5 prose-strong:font-semibold prose-headings:font-semibold"
          style={{ fontFamily: "Urbanist, sans-serif", lineHeight: "21px" }}
        >
          <ReactMarkdown>{task.description}</ReactMarkdown>
        </div>
      )}

      {/* Actions List */}
      {task.actions && task.actions.length > 0 && (
        <div className="border border-[#f6f6f6] rounded-lg overflow-hidden">
          {task.actions.map((action, index) => (
            <div
              key={action.id}
              className="flex items-center gap-[9px] p-[10px]"
              style={{
                backgroundColor:
                  action.status === "pending" ? "#F1FCF6" : "transparent",
                borderBottom:
                  index !== task.actions.length - 1
                    ? "1px solid #F6F6F6"
                    : "none",
              }}
            >
              <ActionIcon type={action.type} status={action.status} />
              <div
                className="text-[14px] flex items-center gap-2 min-w-0 flex-1"
                style={{
                  fontFamily: "Urbanist, sans-serif",
                  lineHeight: "21px",
                }}
              >
                <span className="text-[#141414] shrink-0">{action.text}</span>
                {action.detail && (
                  <span className="text-[#b0b0b0] truncate">
                    {action.detail}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Related Actions - Only show for latest message */}
      {isLatest && task.relatedActions && task.relatedActions.length > 0 && (
        <div className="flex flex-col w-full mt-4">
          <p
            className="text-[18px] font-semibold text-[#141414] leading-[32px]"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            Related
          </p>
          <div className="flex flex-col">
            {task.relatedActions.map((action, index) => (
              <button
                key={index}
                onClick={() => onSendMessage && onSendMessage(action)}
                className="flex items-center gap-[10px] px-2 py-[10px] border-b border-[#f6f6f6] hover:bg-[#f6f6f6] transition-colors rounded-[8px] cursor-pointer -mx-2"
              >
                <div className="rotate-180">
                  <CornerDownLeft size={20} color="#141414" />
                </div>
                <span
                  className="text-base font-medium text-[#141414]"
                  style={{
                    fontFamily: "Urbanist, sans-serif",
                    lineHeight: "32px",
                  }}
                >
                  {action}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Action Icon Component
const ActionIcon = ({ type, status }) => {
  const getIcon = () => {
    switch (type) {
      case "reading":
        return Eye;
      case "executing":
        return Code;
      case "creating":
        return Edit3;
      default:
        return Eye;
    }
  };

  const Icon = getIcon();
  const iconColor =
    status === "completed" ? "text-[#1f6744]" : "text-[#1f6744]";
  // Only show background when completed, pending rows already have green background
  const bgColor = status === "completed" ? "bg-[#F1FCF6]" : "bg-transparent";

  return (
    <div
      className={`w-5 h-5 flex items-center justify-center shrink-0 rounded ${bgColor}`}
    >
      <Icon size={12} className={iconColor} strokeWidth={2} />
    </div>
  );
};

export default TaskMessage;

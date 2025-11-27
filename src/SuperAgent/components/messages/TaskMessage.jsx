import React, { useState } from "react";
import { ChevronDown, ChevronUp, Eye, Code, Edit3 } from "lucide-react";

const TaskMessage = ({ task }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="max-w-[551px]">
      {/* Task Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-3 mb-2 group"
      >
        <div className="w-5 h-5 flex items-center justify-center">
          {isExpanded ? (
            <ChevronUp size={16} className="text-[#6d6d6d]" />
          ) : (
            <ChevronDown size={16} className="text-[#6d6d6d]" />
          )}
        </div>
        <span
          className="text-base font-medium text-black group-hover:text-[#1f6744]"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          {task.title}
        </span>
      </button>

      {/* Task Description */}
      {task.description && (
        <p
          className="text-sm text-[#b0b0b0] mb-3 ml-8"
          style={{ fontFamily: "Urbanist, sans-serif", lineHeight: "21px" }}
        >
          {task.description}
        </p>
      )}

      {/* Actions List */}
      {isExpanded && task.actions && task.actions.length > 0 && (
        <div className="border border-[#f6f6f6] rounded-lg ml-8">
          {task.actions.map((action, index) => (
            <div
              key={action.id}
              className={`flex items-center gap-2 px-3 py-2.5 ${
                index !== task.actions.length - 1
                  ? "border-b border-[#f6f6f6]"
                  : ""
              }`}
            >
              <ActionIcon type={action.type} status={action.status} />
              <p
                className="text-sm"
                style={{
                  fontFamily: "Urbanist, sans-serif",
                  lineHeight: "21px",
                }}
              >
                <span className="text-[#141414]">{action.text}</span>{" "}
                <span className="text-[#b0b0b0]">{action.detail}</span>
              </p>
            </div>
          ))}
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
    status === "completed" ? "text-[#1f6744]" : "text-[#6d6d6d]";

  return (
    <div className="w-5 h-5 flex items-center justify-center shrink-0 rounded bg-[#F1FCF6]">
      <Icon size={12} className={iconColor} strokeWidth={2} />
    </div>
  );
};

export default TaskMessage;

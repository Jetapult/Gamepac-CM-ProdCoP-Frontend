import { X } from "lucide-react";
import React, { useState, useEffect } from "react";

const AddReplyTemplateModal = ({
  isOpen,
  onClose,
  onSave,
  template = null, // If provided, this is edit mode
}) => {
  const [replyType, setReplyType] = useState("");
  const [reply, setReply] = useState("");

  useEffect(() => {
    if (template) {
      setReplyType(template.category || "");
      setReply(template.text || "");
    } else {
      setReplyType("");
      setReply("");
    }
  }, [template, isOpen]);

  const handleSave = () => {
    if (!replyType.trim() || !reply.trim()) {
      return;
    }
    onSave({
      id: template?.id,
      category: replyType,
      text: reply,
    });
    setReplyType("");
    setReply("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[600px] max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between py-6 mx-6 border-b border-[#e7eaee]">
          <h2 className="font-urbanist font-semibold text-lg text-[#141414]">
            {template ? "Edit Reply Template" : "Add Reply Template"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#f6f7f8] rounded transition-colors"
          >
            <X size={16} color="#6d6d6d" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6 overflow-y-auto">
          {/* Reply Type Field */}
          <div className="flex flex-col gap-2">
            <label className="font-urbanist font-medium text-sm text-[#141414]">
              Reply Type
            </label>
            <input
              type="text"
              value={replyType}
              onChange={(e) => setReplyType(e.target.value)}
              placeholder=""
              className="w-full px-3 py-2 border border-[#e7eaee] rounded-lg font-urbanist text-sm text-[#141414] placeholder:text-[#b0b0b0] outline-none focus:border-[#1f6744] transition-colors"
            />
          </div>

          {/* Reply Field */}
          <div className="flex flex-col gap-2">
            <label className="font-urbanist font-medium text-sm text-[#141414]">
              Reply
            </label>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder=""
              rows={5}
              className="w-full px-3 py-2 border border-[#e7eaee] rounded-lg font-urbanist text-sm text-[#141414] placeholder:text-[#b0b0b0] outline-none focus:border-[#1f6744] transition-colors resize-none"
            />
          </div>

          {/* Note */}
          <div className="flex items-start gap-2 bg-[#f6f7f8] border border-[#e7eaee] rounded-lg p-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="8" cy="8" r="7" stroke="#6d6d6d" strokeWidth="1.5" />
                <text
                  x="8"
                  y="11"
                  textAnchor="middle"
                  fontSize="10"
                  fill="#6d6d6d"
                  fontWeight="bold"
                >
                  i
                </text>
              </svg>
            </div>
            <p className="font-urbanist text-xs text-[#6d6d6d] leading-[18px]">
              Note: To dynamically include the reviewer's username in your reply
              template, use the placeholder "user". This placeholder will be
              automatically replaced with the actual username when the template is
              used.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#e7eaee] bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#e7eaee] rounded-lg font-urbanist text-sm text-[#141414] hover:bg-[#f6f7f8] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!replyType.trim() || !reply.trim()}
            className="px-4 py-2 bg-[#1F6744] text-white rounded-lg font-urbanist font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {template ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddReplyTemplateModal;


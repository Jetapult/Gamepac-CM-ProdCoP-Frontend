import React, { useState } from "react";
import { X } from "lucide-react";
import { TrashBinMinimalistic } from "@solar-icons/react";
import api from "../../api";

const DeleteChatModal = ({ isOpen, onClose, chatId, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await api.delete(`/v1/superagent/chats/${chatId}`);
      if (onDelete) {
        onDelete(chatId);
      }
      onClose();
    } catch (error) {
      console.error("Failed to delete chat:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Overlay Background */}
      <div className="absolute inset-0 bg-[rgba(0,0,0,0.1)] backdrop-blur-[5px]" />

      {/* Modal Content */}
      <div
        className="relative bg-white rounded-[12px] w-[460px] px-5 py-4 flex flex-col gap-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between w-full">
          <h2
            className="text-[22px] text-[#30333b] font-medium"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            Deleting chat?
          </h2>
          <button
            onClick={onClose}
            className="size-5 flex items-center justify-center text-[#6d6d6d] hover:text-[#141414] transition-colors"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Description */}
        <p
          className="text-[16px] text-[#898989] leading-[1.5]"
          style={{ fontFamily: "Gilroy-Regular, sans-serif" }}
        >
          Deleting the chat will delete all the artefacts generated. Are you
          sure you want to delete the chat?
        </p>

        {/* Buttons */}
        <div className="flex gap-[10px] justify-end">
          <button
            onClick={onClose}
            className="h-8 px-3 flex items-center justify-center bg-white border border-[#e6e6e6] rounded-lg shadow-[0_0_0_1px_#f6f6f6] hover:bg-[#f6f6f6] transition-colors"
          >
            <span
              className="text-[16px] text-[#141414] font-medium leading-6"
              style={{ fontFamily: "Urbanist, sans-serif" }}
            >
              Cancel
            </span>
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-8 px-2 flex items-center gap-[6px] bg-[#f25a5a] border border-[rgba(255,255,255,0.3)] rounded-lg shadow-[0_0_0_1px_#f25a5a] hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <TrashBinMinimalistic weight="Linear" size={16} color="#f6f6f6" />
            <span
              className="text-[16px] text-[#f6f6f6] font-medium leading-6"
              style={{ fontFamily: "Urbanist, sans-serif" }}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteChatModal;

import { X } from "lucide-react";
import { TrashBinTrash } from "@solar-icons/react";

const ConfirmationPopup = ({ heading, subHeading, onCancel, onConfirm }) => {
  return (
    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative my-6 mx-auto max-w-md w-full mx-4">
        <div className="border-0 rounded-lg shadow-xl relative flex flex-col w-full bg-white outline-none focus:outline-none">
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4">
            <h3 className="text-lg font-urbanist font-semibold text-[#141414] pr-4">
              {heading}
            </h3>
            <button
              className="p-1 flex-shrink-0 text-gray-400 hover:text-gray-900 transition-colors"
              onClick={onCancel}
              aria-label="Close"
            >
              <X size={20} color="#6d6d6d" />
            </button>
          </div>

          {/* Message */}
          <div className="px-6 pb-6">
            <p className="font-urbanist text-sm text-[#6d6d6d] leading-relaxed">
              {subHeading}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 px-6 pb-6">
            <button
              className="px-4 py-2 bg-white border border-[#e7eaee] text-[#141414] rounded-lg font-urbanist text-sm font-medium hover:bg-[#f6f7f8] transition-colors"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-[#F64C4C] text-white rounded-lg font-urbanist text-sm font-medium hover:bg-[#e63939] transition-colors"
              onClick={onConfirm}
            >
              <TrashBinTrash size={16} weight="Linear" color="#ffffff" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;

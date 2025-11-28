import React from "react";
import { ExternalLink, Plus, X } from "lucide-react";

const ConnectorModal = ({ integration, isOpen, onClose, onConnect }) => {
  if (!isOpen || !integration) return null;

  const handleConnect = () => {
    console.log(`Connecting to ${integration.name}...`);
    // Add your connection logic here
    if (onConnect) {
      onConnect(integration.slug);
    } else {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Overlay Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.16)] to-[rgba(102,102,102,0.48)]" />

      {/* Modal Content */}
      <div
        className="relative bg-white rounded-[16px] w-[500px] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[#6d6d6d] hover:text-[#1f6744] transition-colors"
        >
          <X className="text-[#111111]" strokeWidth={1.5} />
        </button>

        {/* Integration Icon */}
        <div className="flex justify-center mb-4">
          <div className="size-[70px] rounded-[12px] border border-[#e6e6e6] flex items-center justify-center p-3">
            <img
              src={integration.icon}
              alt={integration.name}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Integration Name */}
        <h2 className="font-urbanist text-[20px] text-[#141414] text-center mb-3">
          {integration.name}
        </h2>

        {/* Description */}
        <p className="font-urbanist font-normal text-sm text-black text-center mb-6 leading-[21px]">
          Access, search, organize and reply to emails easily with Manus for
          improved productivity.
        </p>

        {/* Connect Button */}
        <button
          onClick={handleConnect}
          className="mx-auto bg-[#1F6744] text-white rounded-[8px] py-3 px-5 border border-[rgba(255, 255, 255, 0.30)] shadow-[0 0 0 1px #1F6744] font-urbanist font-medium text-[16px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mb-6"
        >
          <Plus strokeWidth={1.5} />
          Connect
        </button>

        {/* Details Grid */}
        <div className="mb-4 border border-[#DFDFDF] rounded-[8px] p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-urbanist text-sm text-[#6d6d6d]">Connector type </p>
            <p className="font-urbanist text-sm text-[#6d6d6d]">App</p>
          </div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-urbanist text-sm text-[#6d6d6d]">Author</p>
            <p className="font-urbanist text-sm text-[#6d6d6d]">GamePac</p>
          </div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-urbanist text-sm text-[#6d6d6d]">Website </p>
            <ExternalLink strokeWidth={2} size={16} className="text-[#1E80EA]" />
          </div>
          <div className="flex items-center justify-between">
            <p className="font-urbanist text-sm text-[#6d6d6d]">Privacy Policy</p>
            <ExternalLink strokeWidth={2} size={16} className="text-[#1E80EA]" />
          </div>
        </div>

        {/* Provide Feedback Link */}
        <div className="text-center">
          <a
            href="#"
            className="font-urbanist font-medium text-[14px] text-[#6d6d6d] underline hover:text-[#1f6744] transition-colors"
          >
            Provide Feedback
          </a>
        </div>
      </div>
    </div>
  );
};

export default ConnectorModal;

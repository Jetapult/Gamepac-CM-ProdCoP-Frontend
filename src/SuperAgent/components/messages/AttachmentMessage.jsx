import React from "react";
import { FileSpreadsheet, FileText, File } from "lucide-react";

const AttachmentMessage = ({ attachment, sender = "user" }) => {
  const getAttachmentIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "spreadsheet":
      case "csv":
      case "xlsx":
        return <FileSpreadsheet className="text-green-600" size={24} />;
      case "document":
      case "pdf":
      case "doc":
        return <FileText className="text-blue-600" size={24} />;
      default:
        return <File className="text-gray-600" size={24} />;
    }
  };

  const alignmentClass = sender === "user" ? "ml-auto" : "";
  const bgColor = sender === "user" ? "bg-[#f6f6f6]" : "bg-white";

  return (
    <div className={`flex flex-col gap-4 max-w-[400px] ${alignmentClass}`}>
      <div
        className={`${bgColor} border border-[#e6e6e6] rounded-lg p-4 flex items-center gap-3`}
      >
        <div className="w-[50px] h-[56px] bg-green-100 rounded-md flex items-center justify-center">
          {getAttachmentIcon(attachment.type)}
        </div>
        <div className="flex-1">
          <p
            className="text-base text-black mb-1"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            {attachment.name}
          </p>
          <div
            className="flex items-center gap-2 text-sm text-[#b0b0b0]"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            <span>{attachment.type}</span>
            {attachment.size && (
              <>
                <div className="w-[3px] h-[3px] bg-[#b0b0b0] rounded-full" />
                <span>{attachment.size}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttachmentMessage;

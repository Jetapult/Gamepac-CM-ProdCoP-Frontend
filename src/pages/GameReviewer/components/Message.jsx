import React, { useState } from "react";
import { getFileName, isPDF } from "../RagChat";
import { DocumentIcon } from "@heroicons/react/24/outline";
import TypingEffect from "./TypingEffect";
import ImagePopup from "./ImagePopup";

const Message = ({ message }) => {
  const [selectedImage, setSelectedImage] = useState("");
  const cleanMessage = (message) => {
    const formattedMessage = message?.replace(/^###\s+(.*)$/gm, "<h3>$1</h3>");
    const furtherFormattedMessage = formattedMessage?.replace(
      /\*\*(.*?)\*\*/g,
      "<strong>$1</strong>"
    );
    return furtherFormattedMessage;
  };
  return (
    <div
      className={`flex flex-col my-2  ${
        message.type === "ai"
          ? "items-start w-11/12"
          : " ml-auto bg-white items-end w-1/2"
      }`}
    >
      <div className="flex flex-wrap w-[60%] justify-end">
        {/* {message?.attachments?.length ? (
          message?.attachments?.map((image, index) => (
            <React.Fragment key={index}>
              {isPDF(image) ? (
                <div className="rounded ml-1 cursor-pointer flex bg-[#f6f6f7] p-2">
                  <DocumentIcon className="w-6 h-6 mr-2" />
                  <p className="text-sm">{getFileName(image)}</p>
                </div>
              ) : (
                <img
                  key={index}
                  src={image}
                  alt={`Preview ${index}`}
                  className="w-24 h-24 rounded ml-1 cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                />
              )}
            </React.Fragment>
          ))
        ) : (
          <></>
        )} */}
      </div>
      {message.type === "ai" && message.latest ? (
        <TypingEffect message={message.message} />
      ) : (
        <p
          className={`inline content rounded-2xl py-2 px-4 mt-2 whitespace-pre-wrap ${
            message.type === "ai"
              ? "bg-[#f6f6f7] rounded-bl-none"
              : "bg-[#ff1053] text-white rounded-tr-none"
          }`}
          dangerouslySetInnerHTML={{ __html: cleanMessage(message.message) }}
        />
      )}
      {selectedImage && (
        <ImagePopup
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
        />
      )}
    </div>
  );
};

export default Message;

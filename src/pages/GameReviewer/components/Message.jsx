import React, { useState } from "react";
import { getFileName, isPDF } from "../RagChat";
import {
  BookOpenIcon,
  DocumentIcon,
  NumberedListIcon,
} from "@heroicons/react/24/outline";
import TypingEffect from "./TypingEffect";
import ImagePopup from "./ImagePopup";
import ReactPopover from "../../../components/Popover";

const Message = ({ message, setSelectedPage }) => {
  const [selectedImage, setSelectedImage] = useState("");
  const [showPdfName, setShowPdfName] = useState("");
  const cleanMessage = (message) => {
    if (!message) return "";
  
    // Format headers
    let formattedMessage = message?.replace(/^###\s+(.*)$/gm, "<h3>$1</h3>");
    
    // Format bold text
    formattedMessage = formattedMessage?.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    
    // Format tables
    formattedMessage = formattedMessage?.replace(/(\|[^\n]+\|\n?)+/g, (match) => {
      const rows = match.split('\n')
        .filter(row => row.trim() !== '')
        .filter(row => !/^\|[\s-]+\|$/.test(row)); // Remove rows with only dashes
  
      let tableHtml = '<table class="border-collapse border border-gray-300 my-2">';
      
      rows.forEach((row, rowIndex) => {
        const cells = row.split('|').filter(cell => cell.trim() !== '');
        if (rowIndex === 0) {
          tableHtml += '<thead><tr>';
          cells.forEach((cell) => {
            tableHtml += `<th class="border border-gray-300 px-4 py-2 bg-gray-200 font-bold">${cell.trim()}</th>`;
          });
          tableHtml += '</tr></thead><tbody>';
        } else {
          tableHtml += '<tr>';
          cells.forEach((cell, cellIndex) => {
            if (cellIndex === 0) {
              tableHtml += `<th class="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left">${cell.trim()}</th>`;
            } else {
              tableHtml += `<td class="border border-gray-300 px-4 py-2">${cell.trim()}</td>`;
            }
          });
          tableHtml += '</tr>';
        }
      });
      
      tableHtml += '</tbody></table>';
      return tableHtml;
    });
  
    return formattedMessage;
  };
  return (
    <div
      className={`flex flex-col my-2  ${
        message.type === "ai" ? "items-start" : " ml-auto bg-white items-end"
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
      {/* {message.type === "ai" && message.latest ? (
        <TypingEffect message={message.message} />
      ) : ( */}
      {message.quote && (
        <div className="pl-2 relative border-l-4 border-l-[#e6e6e6]">
          <p className="text-gray-600">
            <span className=" text-4xl">“</span> {message.quote}
          </p>
        </div>
      )}
      <div
        className={`rounded-2xl ${
          message.type === "ai"
            ? "bg-[#f6f6f7] rounded-bl-none"
            : "bg-[#ff1053] text-white rounded-tr-none"
        } py-2 px-4`}
      >
        <p
          className={`inline content mt-2 whitespace-pre-wrap `}
          dangerouslySetInnerHTML={{ __html: cleanMessage(message.message) }}
        />
        {message.type === "ai" && (
          <div className="flex flex-wrap relative my-2">
            {message?.sources?.map((source, i) => (
              <React.Fragment key={i}>
                <div
                  className={`mr-3 mb-1 px-1 rounded border-2 border-[#ff1053] cursor-pointer ${
                    showPdfName === source?.filename
                      ? "bg-[#ff1053] text-white"
                      : ""
                  }`}
                  key={i}
                  onMouseEnter={() => setShowPdfName(source?.filename)}
                  onMouseLeave={() => setShowPdfName("")}
                >
                  <BookOpenIcon className="inline w-4 h-4 mr-2" />[{" "}
                  {source?.page?.map((page_num, index) => (
                    <React.Fragment key={index}>
                      {page_num > 0 && (
                        <span
                          className="hover:text-[#092139] cursor-pointer underline text-sm"
                          onClick={() =>
                            setSelectedPage({
                              page_number: page_num,
                              file_name: source.filename,
                            })
                          }
                        >
                          {page_num}
                          {source?.page.length !== index + 1 ? ", " : ""}
                        </span>
                      )}
                    </React.Fragment>
                  ))}{" "}
                  ]
                  {showPdfName === source?.filename && (
                    <Popover name={source?.filename?.split("/")?.pop()} />
                  )}
                </div>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
      {selectedImage && (
        <ImagePopup
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
        />
      )}
    </div>
  );
};

const Popover = ({ name }) => {
  return (
    <div className="absolute top-[-35px] bg-[#ff1053] rounded-md px-2 pt-1 pb-0.5 text-white leading-2 w-max">
      {name}
    </div>
  );
};

export default Message;

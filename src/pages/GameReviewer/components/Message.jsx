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

  // Handle nested bullet points
  const convertToNestedList = (text) => {
    const lines = text.split("\n");
    let html = '<ul class="list-disc ml-6">';
    let currentLevel = 0;

    lines.forEach((line) => {
      if (line.trim() === "") return;

      // Count the indent level (2 spaces = 1 level)
      const indent = line.match(/^\s*/)[0].length;
      const level = Math.floor(indent / 2);
      const content = line.replace(/^\s*-\s*/, "").trim();

      // Add closing tags for previous levels if we're going back up
      while (currentLevel > level) {
        html += "</ul>";
        currentLevel--;
      }

      // Add opening tags for new levels if we're going deeper
      while (currentLevel < level) {
        html += '<ul class="list-[circle] ml-6">';
        currentLevel++;
      }

      html += `<li>${content}</li>`;
    });

    // Close any remaining levels
    while (currentLevel > 0) {
      html += "</ul>";
      currentLevel--;
    }

    html += "</ul>"; // Close the first ul

    return html;
  };

  const cleanMessage = (message) => {
    if (!message) return "";

    // Split the text into sections
    const sections = message.split(/(?=(?:^|\n)(?:[#]{1,4}|\d+\.|-))/);

    let formattedMessage = sections
      .map((section) => {
        const trimmedSection = section.trim();

        // Handle headers
        if (trimmedSection.startsWith("#")) {
          return section
            .replace(
              /^#\s+(.*)$/gm,
              '<h1 class="text-2xl font-bold mb-3">$1</h1>'
            )
            .replace(
              /^##\s+(.*)$/gm,
              '<h2 class="text-xl font-semibold mb-2">$1</h2>'
            )
            .replace(
              /^###\s+(.*)$/gm,
              '<h3 class="text-lg font-medium mb-2">$1</h3>'
            )
            .replace(
              /^####\s+(.*)$/gm,
              '<h4 class="text-base font-medium mb-2">$1</h4>'
            );
        }

        // Handle numbered lists with nested content
        else if (/^\d+\./.test(trimmedSection)) {
          const lines = section.split("\n");
          let html = '<div class="mb-2">';
          let inBulletList = false;

          lines.forEach((line) => {
            const trimmedLine = line.trim();
            if (/^\d+\./.test(trimmedLine)) {
              if (inBulletList) {
                html += "</ul>";
                inBulletList = false;
              }
              html += `<div class="text-md mb-3">${trimmedLine}</div>`;
            } else if (trimmedLine.startsWith("-")) {
              if (!inBulletList) {
                html += '<ul class="list-disc ml-8 space-y-1">';
                inBulletList = true;
              }
              const content = trimmedLine.replace(/^-\s*/, "").trim();
              html += `<li class="mb-1">${content}</li>`;
            } else if (trimmedLine) {
              if (inBulletList) {
                html += "</ul>";
                inBulletList = false;
              }
              html += `<div class="mb-2">${trimmedLine}</div>`;
            }
          });

          if (inBulletList) html += "</ul>";
          html += "</div>";
          return html;
        }

        // Handle normal and nested bullet points
        else if (trimmedSection.startsWith("-")) {
          return convertToNestedList(section);
        }

        // Return other content as is
        return `<div class="mb-2">${section}</div>`;
      })
      .join("");

    // Format bold text
    formattedMessage = formattedMessage?.replace(
      /\*\*(.*?)\*\*/g,
      "<strong class='font-semibold'>$1</strong>"
    );

    // Format tables
    formattedMessage = formattedMessage?.replace(
      /(\|[^\n]+\|\n?)+/g,
      (match) => {
        const rows = match
          .split("\n")
          .filter((row) => row.trim() !== "")
          .filter((row) => !/^\|[\s-]+\|$/.test(row)); // Remove rows with only dashes

        let tableHtml =
          '<table class="border-collapse border border-gray-300 my-2">';

        rows.forEach((row, rowIndex) => {
          const cells = row.split("|").filter((cell) => cell.trim() !== "");
          if (rowIndex === 0) {
            tableHtml += "<thead><tr>";
            cells.forEach((cell) => {
              tableHtml += `<th class="border border-gray-300 px-4 py-2 bg-gray-200 font-bold">${cell.trim()}</th>`;
            });
            tableHtml += "</tr></thead><tbody>";
          } else {
            tableHtml += "<tr>";
            cells.forEach((cell, cellIndex) => {
              if (cellIndex === 0) {
                tableHtml += `<th class="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left">${cell.trim()}</th>`;
              } else {
                tableHtml += `<td class="border border-gray-300 px-4 py-2">${cell.trim()}</td>`;
              }
            });
            tableHtml += "</tr>";
          }
        });

        tableHtml += "</tbody></table>";
        return tableHtml;
      }
    );

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
            : "bg-[#B9FF66] text-[#000] rounded-tr-none"
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
                  className={`mr-3 mb-1 px-1 rounded border-2 border-[#000] cursor-pointer ${
                    showPdfName === source?.filename
                      ? "bg-[#B9FF66] text-[#000] border-[#B9FF66]"
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
    <div className="absolute top-[-35px] bg-[#B9FF66] text-[#000] rounded-md px-2 pt-1 pb-0.5 leading-2 w-max">
      {name}
    </div>
  );
};

export default Message;

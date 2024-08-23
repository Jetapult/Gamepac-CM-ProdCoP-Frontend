import { useEffect, useState } from "react";
import { StopIcon } from "@heroicons/react/20/solid";
import DOMPurify from "dompurify";

const TypingEffect = ({ message }) => {
  const formattedMessage = message.replace(/^###\s+(.*)$/gm, "<h3>$1</h3>");
  const furtherFormattedMessage = formattedMessage.replace(
    /\*\*(.*?)\*\*/g,
    "<strong>$1</strong>"
  );
  const [displayedMessage, setDisplayedMessage] = useState("");
  const [continueTyping, setContinueTyping] = useState(true);
  const typingSpeed = 40;

  const stopTyping = () => {
    setContinueTyping(false);
  };

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < furtherFormattedMessage?.length && continueTyping) {
        const nextChar = furtherFormattedMessage.charAt(index);
        setDisplayedMessage((prev) => prev + nextChar);
        index++;
      } else {
        setContinueTyping(false);
        clearInterval(timer);
      }
    }, typingSpeed);

    return () => clearInterval(timer);
  }, [furtherFormattedMessage, continueTyping]);

  return (
    <>
      <div
        className={`inline rounded-2xl py-2 px-4 mt-2 bg-[#f6f6f7] content whitespace-pre-wrap rounded-bl-none`}
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(displayedMessage),
        }}
      />
      {continueTyping && (
        <p
          onClick={stopTyping}
          className=" border border-[#ccc] rounded px-2 py-1 shadow my-2 text-xs cursor-pointer"
        >
          <StopIcon className="w-3 h-3 inline mb-[2px]" />
        </p>
      )}
    </>
  );
};

export default TypingEffect;

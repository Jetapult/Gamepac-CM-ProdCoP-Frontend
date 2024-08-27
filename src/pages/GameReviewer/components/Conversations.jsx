import { useEffect, useRef, useState } from "react";
import {
  CheckIcon,
  PencilIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import ConfirmationPopup from "../../../components/ConfirmationPopup";

const Conversations = ({
  conversations,
  selectedConversation,
  setSelectedConversation,
  createNewChat,
  updateConversation,
  deleteConversation,
}) => {
  const [isEditTitle, setIsEditTitle] = useState("");
  const [title, setTitle] = useState("");
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const inputRef = useRef(null);
  useOutsideAlerter(inputRef);
  function useOutsideAlerter(ref) {
    useEffect(() => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          disableEditTitle();
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }

  const onUpdateConversation = (conversation) => {
    disableEditTitle();
    updateConversation(conversation, title);
  };
  const handleChange = (event) => {
    setTitle(event.target.value);
  };
  const enableEditTitle = (event, conversation) => {
    event.stopPropagation();
    setTitle(conversation.title || "");
    setIsEditTitle(conversation.id);
  };
  const disableEditTitle = () => {
    setIsEditTitle("");
  };
  return (
    <>
      <div className="flex items-center justify-between border-b mb-5">
        <h5 className="font-bold mt-2 mb-2">All Chats</h5>
        {conversations.length > 0 && (<PencilSquareIcon
          className="w-5 h-5 cursor-pointer"
          onClick={createNewChat}
        />)}
      </div>
      {conversations.length ? (
        conversations?.map((conversation) => (
          <div
            className={`py-1 pl-2 rounded-lg mb-1 cursor-pointer flex justify-between items-center group ${
              selectedConversation.id === conversation.id ? "bg-[#e5e5e5]" : ""
            }`}
            key={conversation.id}
            onClick={(e) => {
              e.stopPropagation();
              if (isEditTitle === "") {
                setSelectedConversation(conversation);
              }
            }}
          >
            {isEditTitle === conversation.id ? (
              <input
                ref={inputRef}
                type="text"
                className="w-[90%]"
                value={title}
                name="title"
                id="title"
                onChange={handleChange}
                placeholder="title"
                autoFocus
                maxLength={150}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    onUpdateConversation(conversation);
                  }
                }}
              />
            ) : (
              <p className="truncate w-[200px]">
                {conversation?.title || "chat"}
              </p>
            )}
            {isEditTitle === conversation.id ? (
              <div
                className="p-1"
                onClick={() => onUpdateConversation(conversation)}
              >
                <CheckIcon className="w-5 h-5 inline" />
              </div>
            ) : (
              <>
                <div
                  className="p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={(e) => enableEditTitle(e, conversation)}
                >
                  <PencilIcon className="w-4 h-4 inline" />
                </div>
                <div
                  className="p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConversationToDelete(conversation);
                    setShowConfirmationPopup(true);
                  }}
                >
                  <TrashIcon className="w-4 h-4 inline" />
                </div>
              </>
            )}
          </div>
        ))
      ) : (
        <></>
      )}
      {showConfirmationPopup && (
        <ConfirmationPopup
          heading="Delete Chat"
          subHeading="Are you sure you want to delete this chat? on deleting all the messages under this chat will be deleted and cannot be retrieved."
          onCancel={() => setShowConfirmationPopup(!showConfirmationPopup)}
          onConfirm={() => {
            deleteConversation(conversationToDelete);
            setShowConfirmationPopup(false);
          }}
        />
      )}
    </>
  );
};

export default Conversations;

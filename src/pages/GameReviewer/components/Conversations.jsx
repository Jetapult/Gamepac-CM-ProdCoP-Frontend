import { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PencilSquareIcon,
  TrashIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import ConfirmationPopup from "../../../components/ConfirmationPopup";
import InfiniteScroll from "react-infinite-scroll-component";

const Conversations = ({
  conversations,
  selectedConversation,
  setSelectedConversation,
  createNewChat,
  updateConversation,
  deleteConversation,
  fetchConversations,
  totalConversations,
}) => {
  const [isEditTitle, setIsEditTitle] = useState("");
  const [title, setTitle] = useState("");
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
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
  const fetchMoreData = () => {
    fetchConversations(currentPage + 1, search);
    setCurrentPage(currentPage + 1);
  };
  return (
    <>
      <div className="flex items-center justify-between border-b mb-5">
        <h5 className="font-bold mt-2 mb-2">All Chats</h5>
        {conversations.length > 0 && (
          <PencilSquareIcon
            className="w-5 h-5 cursor-pointer"
            onClick={createNewChat}
          />
        )}
      </div>
      <SearchConversation
        search={search}
        setSearch={setSearch}
        fetchConversations={fetchConversations}
        currentPage={currentPage}
      />
      <div id="scrollableDiv" className="h-[calc(100vh-100px)] overflow-y-auto">
        <InfiniteScroll
          dataLength={conversations.length}
          next={fetchMoreData}
          hasMore={conversations.length < totalConversations}
          loader={<h4>Loading...</h4>}
          scrollableTarget="scrollableDiv"
        >
          {conversations.length ? (
            conversations?.map((conversation, index) => (
              <div
                className={`py-1 pl-2 rounded-lg mb-1 cursor-pointer flex justify-between items-center group hover:bg-[#e5e5e5] ${
                  selectedConversation.id === conversation.id
                    ? "bg-[#e5e5e5]"
                    : ""
                }`}
                key={`convo` + conversation.id + index}
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
                  <p className="truncate">{conversation?.title || "chat"}</p>
                )}
                <div className="flex items-center gap-2">
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
              </div>
            ))
          ) : (
            <></>
          )}
        </InfiniteScroll>
      </div>
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

const SearchConversation = ({
  search,
  setSearch,
  fetchConversations,
  currentPage,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.length > 2) {
        fetchConversations(1, search);
      }
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, [search.length]);

  return (
    <div className="flex items-center justify-between mb-4">
      <input
        type="text"
        placeholder="Search"
        className="w-full border border-[#ccc] rounded-full p-2"
        value={search}
        onChange={(e) => {
          if (e.target.value.length === 0) {
            fetchConversations(1, "");
          }
          setSearch(e.target.value);
        }}
      />
      {search.length > 0 ? (
        <XCircleIcon
          className="w-5 h-5 cursor-pointer absolute right-6 text-gray-500"
          onClick={() => {
            setSearch("");
            fetchConversations(1, "");
          }}
        />
      ) : (
        <MagnifyingGlassIcon className="w-5 h-5 cursor-pointer absolute right-6 text-gray-500" />
      )}
    </div>
  );
};

export default Conversations;

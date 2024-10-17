import { Fragment, useEffect, useRef, useState } from "react";
import api from "../../../api";
import { Menu, Transition } from "@headlessui/react";
import {
  CheckIcon,
  ChevronDownIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { classNames } from "../../../utils";
import UploadFile from "./UploadFile";
import { useDispatch } from "react-redux";
import { addKnowledgebase } from "../../../store/reducer/knowledgebaseSlice";
import moment from "moment";
import {
  ClockIcon,
  DocumentCurrencyDollarIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import SearchKnowledgebase from "./SearchKnowledgebase";
import ConfirmationPopup from "../../../components/ConfirmationPopup";
import CreateTagPopup from "./CreateTagPopup";
import UpdateKnowledgebasePopup from "./UpdateKnowledgebase";
import CategoryIcon from "./CategoryIcon";
import { Tooltip as ReactTooltip } from "react-tooltip";

const KnowledgeBase = ({
  messageObj,
  setMessageObj,
  userData,
  selectedPdf,
  setSelectedPdf,
  setSelectedKnowledgebase,
  selectedKnowledgebase,
  setToastMessage,
  showPdf,
  setShowPdf,
  queryPacType,
}) => {
  const [knowledgebaseCategories, setKnowledgebaseCategories] = useState([]);
  const [selectedKnowledgebaseCategories, setSelectedKnowledgebaseCategories] =
    useState({});
  const [knowledgebase, setKnowledgebase] = useState([]);
  const [deleteDocument, setDeleteDocument] = useState({});
  const [showDeleteConfirmationPopup, setShowDeleteConfirmationPopup] =
    useState(false);
  const [showKnowledgebaseCategories, setShowKnowledgebaseCategories] =
    useState(false);
  const [showCreateTagPopup, setShowCreateTagPopup] = useState(false);
  const [showUpdateKnowledgebasePopup, setShowUpdateKnowledgebasePopup] =
    useState(false);
  const [knowledgebaseToUpdate, setKnowledgebaseToUpdate] = useState({});
  const [knowledgebaseCategoriesEdit, setKnowledgebaseCategoriesEdit] =
    useState({});
  const dispatch = useDispatch();
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);
  function useOutsideAlerter(ref) {
    useEffect(() => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          setShowKnowledgebaseCategories(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }

  const deleteDoc = async () => {
    try {
      const docCategoryIds = deleteDocument?.categories?.map(
        (category) => category.id
      );
      const deletedocResponse = await api.delete(
        `v1/chat/knowledgebase/${
          deleteDocument.id
        }?source=${`/tmp/${deleteDocument?.file_url
          ?.split("/")
          ?.pop()}`}&category_ids=${docCategoryIds.join(",")}`
      );
      setShowDeleteConfirmationPopup(false);
      setToastMessage({
        show: true,
        message: "Successfuly deleted",
        type: "success",
      });
      const deleteFileFromKnowledgeBase = knowledgebase.filter((x) => {
        if (x.id === deleteDocument.id) {
          return x.id !== deleteDocument.id;
        }
        return knowledgebase;
      });
      setKnowledgebase(deleteFileFromKnowledgeBase);
      if (
        deleteDocument.id === selectedPdf.id &&
        deleteFileFromKnowledgeBase.length
      ) {
        setSelectedPdf(deleteFileFromKnowledgeBase[0]);
        setSelectedKnowledgebase((prev) =>
          prev.filter((x) => x.id !== deleteDocument.id)
        );
      }
      setDeleteDocument({});
      setKnowledgebaseCategories((prevCategories) =>
        prevCategories.map((category) => {
          const isInCurrent = deleteDocument.categories?.some(
            (prevCat) => prevCat?.id === category?.id
          );
          if (isInCurrent) {
            return { ...category, document_count: category.document_count - 1 };
          }
          return category;
        })
      );
      setSelectedKnowledgebaseCategories((prev) => ({
        ...prev,
        document_count: prev.document_count - 1,
      }));
    } catch (error) {
      console.log(error);
      setToastMessage({
        show: true,
        message:
          error?.response?.data?.message ||
          "Something went wrong! Please try again later",
        type: "error",
      });
    }
  };

  const onhandleDelete = (e, document) => {
    e.stopPropagation();
    setDeleteDocument(document);
    setShowDeleteConfirmationPopup(!showDeleteConfirmationPopup);
  };
  const fetchKnowledgebaseCategories = async () => {
    try {
      const response = await api.get(
        `/v1/chat/knowledgebase-categories?type=${queryPacType}`
      );
      const knowledgebaseCategories = response.data.data.filter((category) => {
        category.label = category.name;
        category.value = category.name;
        return category;
      });
      setKnowledgebaseCategories(knowledgebaseCategories);
      setSelectedKnowledgebaseCategories(knowledgebaseCategories[0]);
    } catch (err) {
      console.log(err);
    }
  };
  const fetchKnowledgebase = async () => {
    try {
      const response = await api.get(
        `/v1/chat/knowledgebase/${selectedKnowledgebaseCategories.id}`
      );
      setKnowledgebase(response.data.data);
      dispatch(addKnowledgebase(response.data.data));
      if (response.data.data.length) {
        setSelectedPdf(response.data.data[0]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const sendSlackMessage = async (event, knowledge) => {
    try {
      event.stopPropagation();
      const slackNotifyResponse = await api.post(
        "/v1/chat/upload-lite-doc-slack-notification",
        {
          message: {
            text: "New QueryPAC Super Upload Request",
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: "*New request to upload data from QueryPAC Lite to Super*",
                },
              },
              {
                type: "section",
                fields: [
                  {
                    type: "mrkdwn",
                    text: `*File Name:*\n${knowledge?.title}`,
                  },
                  {
                    type: "mrkdwn",
                    text: `*Requested By:*\n${userData?.email}`,
                  },
                  {
                    type: "mrkdwn",
                    text: `*s3 url:*\n${knowledge?.file_url}`,
                  },
                ],
              },
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: "This file has been processed in QueryPAC Lite for text summarization. For advanced summarization including images and tables, it can be further processed in QueryPAC Super using Unstructured API.",
                },
              },
            ],
          },
        }
      );
      setToastMessage({
        show: true,
        message: "Successfuly notified to AI Team",
        type: "success",
      });
    } catch (error) {
      setToastMessage({
        show: true,
        message: "Something went wrong! Please try again later",
        type: "error",
      });
      console.log("Error sending message to Slack:", error);
    }
  };
  useEffect(() => {
    fetchKnowledgebaseCategories();
  }, [queryPacType]);

  useEffect(() => {
    if (selectedKnowledgebaseCategories?.id) {
      fetchKnowledgebase();
    }
  }, [selectedKnowledgebaseCategories?.id]);
  return (
    <>
      <div className={`mt-2 pt-2 bg-[#F8F9FD] px-2`}>
        {showPdf ? (
          <div
            className="flex items-center justify-between bg-white border border-[#ccc] rounded-lg px-2 py-2 relative mb-2 cursor-pointer"
            onClick={() =>
              setShowKnowledgebaseCategories(!showKnowledgebaseCategories)
            }
          >
            <div className="flex items-center">
              {selectedKnowledgebaseCategories?.name && (
                <CategoryIcon
                  categoryName={selectedKnowledgebaseCategories?.name}
                />
              )}
              <div className="pl-2">
                <p className="text-sm font-bold text-gray-700 capitalize">
                  {selectedKnowledgebaseCategories?.name
                    ? selectedKnowledgebaseCategories?.name
                    : "Knowledge Tags"}
                </p>
                {selectedKnowledgebaseCategories?.document_count ? (
                  <p className="text-xs text-gray-500">
                    {selectedKnowledgebaseCategories?.document_count} documents
                  </p>
                ) : (
                  ""
                )}
              </div>
            </div>

            <ChevronDownIcon className="w-5 h-5 inline text-2xl font-bold" />
          </div>
        ) : (
          <></>
        )}
        {showKnowledgebaseCategories && (
          <div
            className="bg-white rounded-lg absolute top-[124px] max-h-[350px] w-[270px] z-10 shadow-lg p-2 overflow-y-auto"
            ref={wrapperRef}
          >
            {knowledgebaseCategories.map((category) => (
              <div
                className={`p-2 flex items-center hover:bg-gray-100 cursor-pointer rounded min-h-10 ${
                  selectedKnowledgebaseCategories?.id === category.id
                    ? "bg-[#e1e1e1]"
                    : ""
                }`}
                key={category.id}
                onClick={() => {
                  setSelectedKnowledgebaseCategories(category);
                  setShowKnowledgebaseCategories(!showKnowledgebaseCategories);
                }}
              >
                <div className="flex items-center w-14 justify-center">
                  {category.name && (
                    <CategoryIcon categoryName={category.name} />
                  )}
                </div>
                <div className="pl-2">
                  <p className={`capitalize `}>{category.name}</p>
                  {category?.document_count ? (
                    <p className="text-xs text-gray-500">
                      {category?.document_count} documents
                    </p>
                  ) : (
                    ""
                  )}
                </div>
                {/* <span className="cursor-pointer" onClick={(e) => {
                  e.stopPropagation();
                  setShowCreateTagPopup(!showCreateTagPopup);
                  setKnowledgebaseCategoriesEdit(category);
                }}>
                  <PencilIcon className="w-4 h-4" />
                </span> */}
              </div>
            ))}
            {/* <button
              className="border border-[#ff1053] py-1 rounded-lg text-sm w-full mt-2 text-[#ff1053]"
              onClick={() => setShowCreateTagPopup(!showCreateTagPopup)}
            >
              Create
            </button> */}
          </div>
        )}
        {/* <SearchKnowledgebase /> */}
        {showPdf ? (
          <>
            {knowledgebase.length ? (
              <>
                <p className="text-sm font-bold text-gray-700 my-3 px-2 flex items-center">
                  <input
                    id="default-checkbox"
                    type="checkbox"
                    value={2}
                    name="name"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded mr-2 pt-2"
                    onChange={(e) => {
                      setSelectedKnowledgebase((prev) => {
                        const isSelected = knowledgebase.every((knowledge) =>
                          prev.some((item) => item.id === knowledge.id)
                        );
                        if (!isSelected) {
                          return knowledgebase;
                        } else {
                          return [];
                        }
                      });
                    }}
                    checked={knowledgebase.every((knowledge) =>
                      selectedKnowledgebase.some(
                        (item) => item.id === knowledge.id
                      )
                    )}
                    ref={(el) => {
                      if (el) {
                        el.indeterminate =
                          selectedKnowledgebase.length > 0 &&
                          selectedKnowledgebase.length < knowledgebase.length;
                      }
                    }}
                  />
                  {knowledgebase.every((knowledge) =>
                    selectedKnowledgebase.some(
                      (item) => item.id === knowledge.id
                    )
                  )
                    ? "Uns"
                    : "S"}
                  elect all docs
                </p>
              </>
            ) : (
              <></>
            )}
            <div
              className={`flex flex-col overflow-auto ${
                queryPacType === "lite" ||
                (queryPacType === "super" && userData?.roles?.includes("admin"))
                  ? "h-[calc(100vh-310px)]"
                  : "h-[calc(100vh-220px)]"
              }`}
            >
              {knowledgebase.map((knowledge) => (
                <div
                  key={knowledge.id}
                  className={`flex items-center runded mb-2 p-2 rounded-lg hover:bg-white cursor-pointer ${
                    selectedPdf?.id === knowledge.id ? "bg-white" : ""
                  }`}
                  style={{ zIndex: 9999999999 }}
                  onClick={() => setSelectedPdf(knowledge)}
                >
                  <input
                    id="default-checkbox"
                    type="checkbox"
                    value={2}
                    name="name"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded mr-2 pt-2"
                    onChange={(e) => {
                      e.stopPropagation();
                      setSelectedKnowledgebase((prev) => {
                        const isAlreadySelected = prev.some(
                          (item) => item.id === knowledge.id
                        );
                        if (isAlreadySelected) {
                          return prev.filter(
                            (item) => item.id !== knowledge.id
                          );
                        } else {
                          return [...prev, knowledge];
                        }
                      });
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    checked={selectedKnowledgebase?.some(
                      (item) => item.id === knowledge.id
                    )}
                  />
                  <div className="w-full group">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {knowledge?.categories?.map((category) => (
                        <p
                          className={`text-xs capitalize inline px-1.5 py-[2px] rounded-full`}
                          style={{
                            backgroundColor: category.color + "33",
                            color: category.color,
                          }}
                          key={category.id}
                        >
                          {category.name}
                        </p>
                      ))}
                    </div>
                    <p className="line-clamp-2 text-sm">{knowledge.title}</p>
                    <p className="text-xs flex items-center justify-between text-gray-500 mb-1">
                      <span>
                        <ClockIcon className="inline w-3 h-3 mr-1 mb-[3px] text-black" />
                        {moment(knowledge.created_at).format(
                          "YYYY-MM-DD HH:MM:SS"
                        )}
                      </span>
                      <span className="flex items-center">
                        {queryPacType === "lite" &&
                          knowledge.file_url.endsWith(".pdf") && (
                            <>
                              <span
                                data-tooltip-id="my-tooltip-1"
                                className="hidden group-hover:block pr-2"
                                onClick={(e) => sendSlackMessage(e, knowledge)}
                              >
                                <DocumentCurrencyDollarIcon className="w-4 h-4 text-black" />
                              </span>
                              <ReactTooltip
                                id="my-tooltip-1"
                                place="top"
                                className="hidden group-hover:block"
                                content="Requesting the file to move to super"
                              />
                            </>
                          )}
                        {parseInt(knowledge?.user_id) ===
                          parseInt(userData?.id) && (
                          <span
                            className="hidden group-hover:block pr-2"
                            onClick={(event) => {
                              event.stopPropagation();
                              setShowUpdateKnowledgebasePopup(
                                !showUpdateKnowledgebasePopup
                              );
                              setKnowledgebaseToUpdate(knowledge);
                            }}
                          >
                            <PencilIcon className="w-4 h-4 text-black" />
                          </span>
                        )}
                        {queryPacType === "lite" &&
                          parseInt(knowledge?.user_id) ===
                            parseInt(userData?.id) && (
                            <span
                              className="hidden group-hover:block"
                              onClick={(event) =>
                                onhandleDelete(event, knowledge)
                              }
                            >
                              <TrashIcon className="w-4 h-4 text-black" />
                            </span>
                          )}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
      {queryPacType === "lite" ||
      (queryPacType === "super" && userData?.roles?.includes("admin")) ? (
        <UploadFile
          messageObj={messageObj}
          setMessageObj={setMessageObj}
          userData={userData}
          setKnowledgebase={setKnowledgebase}
          selectedKnowledgebaseCategories={selectedKnowledgebaseCategories}
          setSelectedPdf={setSelectedPdf}
          setSelectedKnowledgebase={setSelectedKnowledgebase}
          setToastMessage={setToastMessage}
          showPdf={showPdf}
          setShowPdf={setShowPdf}
          knowledgebaseCategories={knowledgebaseCategories}
          setKnowledgebaseCategories={setKnowledgebaseCategories}
          setSelectedKnowledgebaseCategories={
            setSelectedKnowledgebaseCategories
          }
          queryPacType={queryPacType}
        />
      ) : (
        <></>
      )}
      {showDeleteConfirmationPopup && (
        <ConfirmationPopup
          heading={`Delete document? \n ${deleteDocument?.title}`}
          subHeading={"This document will be deleted forever."}
          onCancel={() =>
            setShowDeleteConfirmationPopup(!showDeleteConfirmationPopup)
          }
          onConfirm={deleteDoc}
        />
      )}
      {showCreateTagPopup && (
        <CreateTagPopup
          showCreateTagPopup={showCreateTagPopup}
          setShowCreateTagPopup={setShowCreateTagPopup}
          setKnowledgebaseCategories={setKnowledgebaseCategories}
          setToastMessage={setToastMessage}
          knowledgebaseCategoriesEdit={knowledgebaseCategoriesEdit}
          setKnowledgebaseCategoriesEdit={setKnowledgebaseCategoriesEdit}
          queryPacType={queryPacType}
        />
      )}
      {showUpdateKnowledgebasePopup && (
        <UpdateKnowledgebasePopup
          showUpdateKnowledgebasePopup={showUpdateKnowledgebasePopup}
          setShowUpdateKnowledgebasePopup={setShowUpdateKnowledgebasePopup}
          setKnowledgebaseCategories={setKnowledgebaseCategories}
          setToastMessage={setToastMessage}
          knowledgebaseCategories={knowledgebaseCategories}
          knowledgebaseToUpdate={knowledgebaseToUpdate}
          setKnowledgebaseToUpdate={setKnowledgebaseToUpdate}
          setKnowledgebase={setKnowledgebase}
        />
      )}
    </>
  );
};

export default KnowledgeBase;

import { Fragment, useEffect, useState } from "react";
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
import { ClockIcon, TrashIcon } from "@heroicons/react/24/outline";
import SearchKnowledgebase from "./SearchKnowledgebase";
import ConfirmationPopup from "../../../components/ConfirmationPopup";

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
}) => {
  const [knowledgebaseCategories, setKnowledgebaseCategories] = useState([]);
  const [selectedKnowledgebaseCategories, setSelectedKnowledgebaseCategories] =
    useState({});
  const [knowledgebase, setKnowledgebase] = useState([]);
  const [deleteDocument, setDeleteDocument] = useState({});
  const [showDeleteConfirmationPopup, setShowDeleteConfirmationPopup] =
    useState(false);
  const dispatch = useDispatch();

  const deleteDoc = async () => {
    try {
      const deletedocResponse = await api.delete(
        `v1/chat/knowledgebase/${selectedKnowledgebaseCategories.id}/${
          deleteDocument.id
        }?source=${`/tmp/${deleteDocument?.file_url?.split("/")?.pop()}`}`
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
      const response = await api.get(`/v1/chat/knowledgebase-categories`);
      setKnowledgebaseCategories(response.data.data);
      setSelectedKnowledgebaseCategories(response.data.data[0]);
      fetchKnowledgebase(
        response.data.data[0].id
      ); /* now knowledge base is only investments change when it is made dynamic */
    } catch (err) {
      console.log(err);
    }
  };
  const fetchKnowledgebase = async (id) => {
    try {
      const response = await api.get(`/v1/chat/knowledgebase/${id}`);
      setKnowledgebase(response.data.data);
      dispatch(addKnowledgebase(response.data.data));
      setSelectedPdf(response.data.data[0]);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    fetchKnowledgebaseCategories();
  }, []);
  return (
    <div className="mt-4">
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
      />
      {/* <SearchKnowledgebase /> */}
      {/* {knowledgebaseCategories.length ? (
        <Menu as="div" className="relative mb-2">
          <div>
            <Menu.Button className="inline-flex w-full font-bold">
              <p>
                Knowledgebase
                <ChevronDownIcon className="w-5 h-5 inline text-2xl font-bold" />
              </p>
            </Menu.Button>
          </div>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                <Menu.Item>
                  {({ active, close }) => (
                    <div className="flex items-center justify-between py-1 pl-4 pr-2 border-b-[0.5px]">
                      <p className="text-sm font-bold text-gray-700">
                        Select Knowledgebase
                      </p>
                      <XMarkIcon
                        className="w-5 h-5 inline text-gray-700 cursor-pointer"
                        onClick={() => {
                          close();
                        }}
                      />
                    </div>
                  )}
                </Menu.Item>
                {knowledgebaseCategories.map((categories) => (
                  <Menu.Item key={categories.id} className="cursor-pointer">
                    {({ active }) => (
                      <a
                        className={classNames(
                          active
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700",
                          "block px-4 py-2 text-sm capitalize"
                        )}
                      >
                        {parseInt(categories.id) ===
                        parseInt(selectedKnowledgebase?.id) ? (
                          <CheckIcon className="w-5 h-5 inline mr-2" />
                        ) : (
                          <CheckIcon className="w-5 h-5 inline mr-2 opacity-0" />
                        )}
                        {categories.name}
                      </a>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      ) : (
        <></>
      )} */}
      {showPdf ? (
        <>
          {knowledgebase.length ? (
            <>
              <p className="text-sm font-bold text-gray-700 my-3">
                Knowledge Bases
              </p>
            </>
          ) : (
            <></>
          )}
          <div className="flex flex-col overflow-auto h-[calc(100vh-265px)]">
            {knowledgebase.map((knowledge) => (
              <div
                key={knowledge.id}
                className={`flex items-start runded mb-2 p-2 rounded-lg hover:bg-white cursor-pointer ${
                  selectedPdf?.id === knowledge.id ? "bg-white" : ""
                }`}
                onClick={() => setSelectedPdf(knowledge)}
              >
                <input
                  id="default-checkbox"
                  type="checkbox"
                  value={2}
                  name="name"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded mr-3 pt-2 mt-[4px]"
                  onChange={(e) => {
                    e.stopPropagation();
                    setSelectedKnowledgebase((prev) => {
                      const isAlreadySelected = prev.some(
                        (item) => item.id === knowledge.id
                      );
                      if (isAlreadySelected) {
                        return prev.filter((item) => item.id !== knowledge.id);
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
                />{" "}
                <div className="w-[88%] group">
                  <p className="truncate">{knowledge.title}</p>
                  <p className="text-[14px] flex items-center justify-between text-gray-500 mb-1">
                    <span>
                      <ClockIcon className="inline w-4 h-4 mr-1 mb-[3px] text-black" />
                      {moment(knowledge.created_at).format(
                        "YYYY-MM-DD HH:MM:SS"
                      )}
                    </span>
                    <span
                      className="hidden group-hover:block"
                      onClick={(event) => onhandleDelete(event, knowledge)}
                    >
                      <TrashIcon className="w-4 h-4 text-black" />
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
    </div>
  );
};

export default KnowledgeBase;

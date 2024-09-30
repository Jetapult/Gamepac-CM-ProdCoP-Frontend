import { useCallback, useRef, useState } from "react";
import api from "../../../api";
import UploadingDoc from "../../../assets/uploading-docs.jpg";
import { ArrowUpTrayIcon, XMarkIcon } from "@heroicons/react/20/solid";
import Select from "react-select";
import loadingIcon from "../../../assets/transparent-spinner.svg";
import { customStyles } from "./UpdateKnowledgebase";

const UploadFile = ({
  messageObj,
  setMessageObj,
  userData,
  setKnowledgebase,
  selectedKnowledgebaseCategories,
  setSelectedPdf,
  setSelectedKnowledgebase,
  setToastMessage,
  showPdf,
  setShowPdf,
  knowledgebaseCategories,
  setKnowledgebaseCategories,
  setSelectedKnowledgebaseCategories,
  queryPacType
}) => {
  const [showUploadProgressPopup, setShowUploadProgressPopup] = useState(false);
  const [files, setFiles] = useState([]);
  const [showUploadDocPopup, setShowUploadDocPopup] = useState(false);

  const handleButtonClick = () => {
    setShowUploadDocPopup(true);
  };
  return (
    <>
      <div
        className={`my-1 ${showPdf ? "border border-[#ccc] rounded-2xl" : ""}`}
      >
        {showPdf ? (
          <>
            <p className="text-sm text-gray-500 pl-4 py-2">
              Upload your files to get started
            </p>
            <button
              className="px-4 py-1 border border-[#ccc] rounded-full px-14 mx-auto flex hover:bg-[#e6e6e6] mb-3"
              onClick={handleButtonClick}
            >
              Upload PDF
            </button>
          </>
        ) : (
          <div
            onClick={handleButtonClick}
            className="flex items-center justify-center cursor-pointer"
          >
            <ArrowUpTrayIcon className="w-6 h-6" />
          </div>
        )}
      </div>
      {showUploadProgressPopup && <UploadProgressPopup files={files} />}
      {showUploadDocPopup && (
        <UploadDocPopup
          showUploadDocPopup={showUploadDocPopup}
          setShowUploadDocPopup={setShowUploadDocPopup}
          knowledgebaseCategories={knowledgebaseCategories}
          messageObj={messageObj}
          setMessageObj={setMessageObj}
          setKnowledgebase={setKnowledgebase}
          setToastMessage={setToastMessage}
          setSelectedPdf={setSelectedPdf}
          setSelectedKnowledgebase={setSelectedKnowledgebase}
          userData={userData}
          selectedKnowledgebaseCategories={selectedKnowledgebaseCategories}
          setKnowledgebaseCategories={setKnowledgebaseCategories}
          setSelectedKnowledgebaseCategories={setSelectedKnowledgebaseCategories}
          queryPacType={queryPacType}
        />
      )}
    </>
  );
};

const UploadProgressPopup = ({ files }) => {
  return (
    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-[#12111157]">
      <div className="relative my-6 mx-auto max-w-3xl w-[500px]">
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none py-6">
          <img
            src={UploadingDoc}
            alt="uploading"
            className="h-[200px] mx-auto"
          />
          <p className="text-center text-xl my-5">
            {files.map((file) => file.name).join(", ")}
          </p>
          <div className="w-12 h-12 rounded-full animate-spin border-4 border-solid border-blue-500 border-t-transparent mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

const UploadDocPopup = ({
  showUploadDocPopup,
  setShowUploadDocPopup,
  knowledgebaseCategories,
  messageObj,
  setMessageObj,
  setKnowledgebase,
  setToastMessage,
  setSelectedPdf,
  setSelectedKnowledgebase,
  userData,
  selectedKnowledgebaseCategories,
  setKnowledgebaseCategories,
  setSelectedKnowledgebaseCategories,
  queryPacType
}) => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [submitLoader, setSubmitLoader] = useState(false);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const closePopup = () => {
    setShowUploadDocPopup(!showUploadDocPopup);
  };
  const onFileChange = (e) => {
    const files = e.target.files || e.dataTransfer.files;
    if (files.length === 0) {
      console.log("Only PDF files are allowed.");
      return;
    }
    setSelectedFiles(files);
  };
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    onFileChange(e);
  }, []);

  const onUploadDoc = async() => {
    try {
      setSubmitLoader(true);
      const categoryIds = selectedTags.map((category) => category.id);
      const formData = new FormData();
      formData.append("files", selectedFiles[0]);
      formData.append("slug", userData.slug);
      categoryIds.forEach((id) => formData.append("category_ids", id));
      formData.append("type", queryPacType);
      const response = await api.post("/v1/chat/attachments", formData);
      setMessageObj({
        ...messageObj,
        files: selectedFiles,
        attachments: response.data.data.files,
      });
      setKnowledgebase((prev) => [...response.data.knowledgebase, ...prev]);
      if (response.data.data.skipped_files.length) {
        setToastMessage({
          show: true,
          message:
            "This file has already been uploaded. Please choose a different file.",
          type: "error",
        });
      }
      if (response.data.knowledgebase.length) {
        const knowledgebaseData = response.data.knowledgebase[0];
        knowledgebaseData.categories = selectedTags;
        setSelectedPdf(knowledgebaseData);
        setSelectedKnowledgebase((prev) => [
          ...prev,
          knowledgebaseData,
        ]);
        setToastMessage({
          show: true,
          message: "Successfully uploaded!!",
          type: "success",
        });
        setKnowledgebaseCategories((prevCategories) => 
          prevCategories.map((category) => {
            const isInCurrent = selectedTags?.some(prevCat => prevCat?.id === category?.id);
            if (isInCurrent) {
              return { ...category, document_count: category.document_count + 1 };
            }
            return category;
          })
        );
        setSelectedKnowledgebaseCategories(prev => ({
          ...prev,
          document_count: prev.document_count + 1
        }))
      }
      setSubmitLoader(false);
      closePopup();
    } catch (error) {
      console.log(error,'error')
      setSubmitLoader(false);
      setToastMessage({
        show: true,
        message:
          error?.response?.data?.message ||
          "Something went wrong! Please try again later",
        type: "error",
      });
    }
  }
  return (
    <div
      className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-[#12111157]"
      onClick={closePopup}
    >
      <div
        className="relative my-6 mx-auto max-w-3xl w-[500px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
            <h3 className="text-2xl font-semibold">Upload Document</h3>
            <button
              className="p-1 ml-auto border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={closePopup}
            >
              <XMarkIcon className="w-6 h-6 text-[#d6d6d6]" />
            </button>
          </div>
          <form className="px-6 py-4">
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="review_type"
              >
                Tags<span className="text-red-500">*</span>
              </label>
              <Select
                options={knowledgebaseCategories}
                value={selectedTags}
                isMulti={true}
                onChange={(val) => setSelectedTags(val)}
                styles={customStyles}
              />
            </div>
            <div
              className="mb-4 cursor-pointer"
              onClick={() => fileInputRef.current.click()}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              ref={dropZoneRef}
            >
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="review_type"
              >
                Upload Doc<span className="text-red-500">*</span>
              </label>
              <div className="h-[100px] bg-[#e6e6e6] border border-dashed border-[#ccc] rounded-lg flex items-center justify-center">
                <ArrowUpTrayIcon className="w-6 h-6 mr-4" />
                <p>
                  {isDragging
                    ? "Drop files here"
                    : selectedFiles.length
                    ? selectedFiles[0].name
                    : "Drag and Drop to upload"}
                </p>
                {selectedFiles[0]?.size && (
                  <XMarkIcon
                    className="w-6 h-6 ml-2 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFiles([]);
                    }}
                  />
                )}
                <input
                  accept=".pdf,application/pdf"
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={onFileChange}
                />
              </div>
            </div>
          </form>
          <div className="flex items-center p-6 border-t border-solid border-blueGray-200 rounded-b">
            {submitLoader ? (
              <button
                className="bg-[#ff1053] text-white font-bold uppercase text-sm px-6 py-1.5 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
              >
                <img src={loadingIcon} alt="loading" className="w-8 h-8" />
              </button>
            ) : (
              <>
                {selectedTags.length && selectedFiles.length ? (
                  <button
                    className="bg-[#ff1053] text-white font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={onUploadDoc}
                  >
                    Upload
                  </button>
                ) : (
                  <button
                    className="bg-[#ff1053] opacity-40 cursor-not-allowed text-white font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                  >
                    Upload
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default UploadFile;

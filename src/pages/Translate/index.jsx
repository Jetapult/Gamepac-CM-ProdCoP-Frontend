import React, { useEffect, useRef, useState } from "react";
import api from "../../api";
import {
  ArrowDownTrayIcon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import UploadIcon from "../../assets/upload-icon.png";
import { DocumentIcon, PlusCircleIcon, Square2StackIcon } from "@heroicons/react/24/outline";
import loadingIcon from "../../assets/transparent-spinner.svg";
import ToastMessage from "../../components/ToastMessage";
import CSVFile from "../../assets/csv-file.png";
import moment from "moment";

const tabs = [
  {
    name: "Text",
    icon: <DocumentIcon className="w-8 h-8" />,
  },
  {
    name: "CSV",
    icon: <DocumentIcon className="w-8 h-8" />,
  },
];

const genders = [
  {
    id: "1",
    name: "Male",
    code: "masculine",
  },
  {
    id: "2",
    name: "Female",
    code: "feminine",
  },
  {
    id: "3",
    name: "Neutral",
    code: "neutral",
  },
];

const contextTypes = [
  {
    id: 1,
    name: "Title",
    code: "title",
  },
  {
    id: 2,
    name: "Description",
    code: "description",
  },
  {
    id: 3,
    name: "Dialogue",
    code: "dialogue",
  },
  {
    id: 4,
    name: "UI Text",
    code: "ui",
  },
];

const LLM = [
  {
    id: 1,
    name: "GPT",
    slug: "gpt_translation",
  },
  {
    id: 2,
    name: "Claude",
    slug: "claude_translation",
  },
  {
    id: 3,
    name: "Google Translate",
    slug: "google_translation",
  },
];

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + " bytes";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
  else return (bytes / 1048576).toFixed(2) + " MB";
};

const Translate = () => {
  const [file, setFile] = useState({});
  const [languages, setLanguages] = useState([]);
  const [targetLanguage, setTargetLanguage] = useState("");
  const [translating, setTranslating] = useState(false);
  const [translatedData, setTranslatedData] = useState({});
  const [toastMessage, setToastMessage] = useState({
    show: false,
    message: "",
    duration: 3000,
    type: "success",
  });
  const [uploadHistory, setUploadHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("Text");

  const [wrapperRef, setWrapperRef] = useState(null);
  useOutsideAlerter(wrapperRef);
  function useOutsideAlerter(ref) {
    useEffect(() => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          setShowLanguages(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }
  const [selectedGender, setSelectedGender] = useState(genders[0]);
  const [showGender, setShowGender] = useState(false);
  const [selectedContextType, setSelectedContextType] = useState(
    contextTypes[0]
  );
  const [showContextType, setShowContextType] = useState(false);
  const [showAdditionalInstructions, setShowAdditionalInstructions] =
    useState(false);
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [showLLMs, setShowLLMs] = useState(false);
  const [selectedLLM, setSelectedLLM] = useState(LLM[0]);
  const [showLanguages, setShowLanguages] = useState(false);
  const [search, setSearch] = useState("");
  const filteredLanguages = languages.filter((language) =>
    language.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "text/csv") {
      setFile(droppedFile);
    } else {
      alert("Please drop a valid CSV file.");
    }
  };

  const handleTranslate = async () => {
    try {
      setTranslating(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("targetLanguage", targetLanguage.code);
      formData.append("content_type", selectedContextType.code);
      formData.append("narrator_gender", selectedGender.code);
      formData.append("additional_context", additionalInstructions);
  
      const response = await api.post("/v1/gen-ai/translate-csv", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setTranslatedData(response.data);
      setTranslating(false);
      if (response?.data?.data) {
        setUploadHistory([response?.data?.data, ...uploadHistory]);
      }
      //   setToastMessage({
      //     show: true,
      //     message: "File translated Successfully and downloaded",
      //     type: "success",
      //   });
    } catch (error) {
      console.log(error);
      setTranslating(false);
      if (error?.response?.data?.message || error?.message) {
        setToastMessage({
          show: true,
          message: error?.response?.data?.message || error?.message,
          type: "error",
        });
      }
    }
  };
  const getGoogleSupportedLanguages = async () => {
    try {
      const response = await api.get("/v1/gen-ai/google-supported-languages");
      setLanguages(response.data);
      setTargetLanguage(response.data[0]);
    } catch (error) {
      console.log(error);
      if (error?.response?.data?.message || error?.message) {
        setToastMessage({
          show: true,
          message: error?.response?.data?.message || error?.message,
          type: "error",
        });
      }
    }
  };
  useEffect(() => {
    getGoogleSupportedLanguages();
  }, []);
  return (
    <div className="text-center h-screen pt-6 mx-52">
      <div className="flex justify-start gap-2 py-1 bg-gray-200 rounded-md w-40 px-1">
        {tabs.map((tab) => (
          <p
            key={tab.name}
            // className={`cursor-pointer border border-[#000] rounded-md py-[3px] px-5 ${
            //   activeTab === tab.name ? "bg-black text-white opacity-75" : ""
            // }`}
            className={`cursor-pointer py-[3px] px-5 ${
              activeTab === tab.name
                ? "ring-1 ring-inset ring-gray-300 rounded-md bg-white text-black"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab(tab.name)}
          >
            {tab.name}
          </p>
        ))}
      </div>
      <>
      {activeTab === "CSV" && (
          <>
            <div className="flex flex-row items-end gap-2 mb-2" ref={wrapperRef}>
              <GenderSelect
                selectedGender={selectedGender}
                setSelectedGender={setSelectedGender}
                wrapperRef={wrapperRef}
                showGender={showGender}
                setShowGender={setShowGender}
              />
              <ContextTypeSelect
                selectedContextType={selectedContextType}
                setSelectedContextType={setSelectedContextType}
                wrapperRef={wrapperRef}
                showContextType={showContextType}
                setShowContextType={setShowContextType}
              />
              <LanguageSelect
                languages={languages}
                targetLanguage={targetLanguage}
                setTargetLanguage={setTargetLanguage}
              />
              {!showAdditionalInstructions && (
                <div className="mb-[8px]">
                  <span
                    className="text-sm text-gray-500 cursor-pointer "
                    onClick={() => setShowAdditionalInstructions(true)}
                  >
                    <PlusCircleIcon className="w-4 h-4 inline mb-[1px]" /> Additional context
                  </span>
                </div>
              )}
            </div>

            {showAdditionalInstructions && (
              <textarea
                className="w-full border border-gray-300 rounded p-2 mb-2 outline-none text-sm"
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                placeholder="Additional context"
              />
            )}
          </>
       )}

        {activeTab === "CSV" ? (
          <div className="border border-gray-300 rounded-md">
            <div className="w-2/4 py-5 mx-auto">
              {file?.size ? (
                <div className="flex justify-between items-center min-h-32 bg-[#e3e8ed] py-2 px-6 rounded-md mb-4">
                  <div className="flex items-center gap-2">
                    <DocumentIcon className="w-10 h-10 text-[#9aa0a6]" />
                    <div className="text-left">
                      <p className="text-[#3c4043] line-clamp-2 text-left break-all">
                        {file.name}
                      </p>
                      <p className="text-[#5f6368] text-xs">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <XMarkIcon
                    className="w-8 h-8 text-gray-500 cursor-pointer"
                    onClick={() => {
                      setFile({});
                      setTranslatedData({});
                    }}
                  />
                </div>
              ) : (
                <div
                  className="bg-white text-center p-2 border border-dashed border-gray-300 rounded-md mb-4 min-h-32 cursor-pointer"
                  onClick={() => document.getElementById("file-input").click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <img
                    src={UploadIcon}
                    alt="Upload Icon"
                    className="w-10 mx-auto mb-2"
                  />
                  <p className="">DROP FILE HERE OR BORWSE</p>
                  <p className="text-gray-500 text-xs">
                    Supported format: .CSV
                  </p>
                  <input
                    id="file-input"
                    type="file"
                    accept=".csv"
                    placeholder="Enter your content here"
                    className="w-full max-w-md border border-gray-300 rounded-md hidden"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </div>
              )}
              {translatedData?.output_file_url && (
                <a
                  href={translatedData?.output_file_url}
                  download
                  className="ml-auto block bg-black text-white p-2 px-4 rounded-md"
                >
                  Download Translation
                </a>
              )}
              {!translatedData?.output_file_url && (
                <>
                  {file?.name && targetLanguage?.code && !translating ? (
                    <button
                      className="bg-[#000] text-[#B9FF66] p-2 px-4 rounded-md ml-auto block hover:bg-[#B9FF66] hover:text-[#000]"
                      onClick={handleTranslate}
                    >
                      Translate
                    </button>
                  ) : (
                    <button className="bg-[#000] text-[#B9FF66] p-2 px-4 rounded-md ml-auto block cursor-not-allowed">
                      {translating && (
                        <img
                          src={loadingIcon}
                          alt="Loading Icon"
                          className="w-7 h-7 inline"
                        />
                      )}
                      {translating ? "Translating..." : "Translate"}
                    </button>
                  )}
                </>
              )}
            </div>
            <UploadHistory
              languages={languages}
              uploadHistory={uploadHistory}
              setUploadHistory={setUploadHistory}
            />
          </div>
        ) : (
          <div className="">
            <TextTranslate
              targetLanguage={targetLanguage}
              setToastMessage={setToastMessage}
              languages={languages}
              setTargetLanguage={setTargetLanguage}
            />
          </div>
        )}
      </>
      {toastMessage.show && (
        <ToastMessage
          message={toastMessage}
          setToastMessage={setToastMessage}
        />
      )}
    </div>
  );
};

const GenderSelect = ({ selectedGender, setSelectedGender, wrapperRef, showGender, setShowGender }) => (
  <div className="relative mt-2 min-w-28">
    <button
      type="button"
      className="relative w-full cursor-default rounded-md bg-white py-1.5 px-2 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-[#f3f3f3]"
      onClick={() => setShowGender(!showGender)}
    >
      <span className="flex items-center justify-between">
        <span className="block truncate">{selectedGender?.name}</span>
        <ChevronDownIcon className="w-6 h-6 text-gray-500 inline ml-3" />
      </span>
    </button>
    {showGender && (
      <ul
        className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5"
        ref={wrapperRef}
      >
        {genders.map((gender) => (
          <li
            key={gender.id}
            className="cursor-pointer select-none py-2 px-3 hover:bg-[#f3f3f3]"
            onClick={() => {
              setSelectedGender(gender);
              setShowGender(false);
            }}
          >
            {gender.name}
          </li>
        ))}
      </ul>
    )}
  </div>
);

const ContextTypeSelect = ({ selectedContextType, setSelectedContextType, wrapperRef, showContextType, setShowContextType }) => (
  <div className="relative mt-2 min-w-28">
    <button
      type="button"
      className="relative w-full cursor-default rounded-md bg-white py-1.5 px-2 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-[#f3f3f3]"
      onClick={() => setShowContextType(!showContextType)}
    >
      <span className="flex items-center justify-between">
        <span className="block truncate">{selectedContextType?.name}</span>
        <ChevronDownIcon className="w-6 h-6 text-gray-500 inline ml-3" />
      </span>
    </button>
    {showContextType && (
      <ul
        className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5"
        ref={wrapperRef}
      >
        {contextTypes.map((contextType) => (
          <li
            key={contextType.id}
            className="cursor-pointer select-none py-2 px-3 hover:bg-[#f3f3f3]"
            onClick={() => {
              setSelectedContextType(contextType);
              setShowContextType(false);
            }}
          >
            {contextType.name}
          </li>
        ))}
      </ul>
    )}
  </div>
);

const AdditionalContext = ({ show, setShow, value, setValue }) => (
  <>
    {!show && (
    <span
      className="text-sm text-gray-500 cursor-pointer"
      onClick={() => setShow(true)}
    >
      <PlusCircleIcon className="w-4 h-4 inline mb-[2px]" /> Additional context
    </span>
  )}
    {show && (
      <textarea
        className="w-full border border-gray-300 rounded p-2 mb-2 outline-none text-sm"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Additional context"
      />
    )}
  </>
);


const LanguageSelect = ({ languages, targetLanguage, setTargetLanguage }) => {
  const [showLanguages, setShowLanguages] = useState(false);
  const [search, setSearch] = useState("");
  const filteredLanguages = languages.filter((language) =>
    language.name.toLowerCase().includes(search.toLowerCase())
  );
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);
  function useOutsideAlerter(ref) {
    useEffect(() => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          setShowLanguages(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }
  return (
    <div className="relative mt-2">
      <p
        onClick={() => setShowLanguages(!showLanguages)}
        className={`cursor-pointer bg-white rounded-md shadow-sm ring-1 ring-inset ring-gray-300 px-2 py-[6px] text-sm min-w-28 flex items-center justify-between`}
      >
        {targetLanguage.name
          ? targetLanguage.name
          : "Select the language you want to translate to"}
        <ChevronDownIcon className="w-6 h-6 text-gray-500 inline pointer-events-none ml-4" />
      </p>
      {showLanguages && (
        <div className="absolute w-full z-10 top-10" ref={wrapperRef}>
          <div className="bg-white rounded-md p-2 min-w-96">
            <input
              type="text"
              className="border border-gray-300 rounded-md p-2 w-full mb-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
            />
            <div className="flex flex-wrap justify-between">
              {filteredLanguages.map((language) => (
                <p
                  key={language.code}
                  className="w-40 text-sm text-left hover:bg-gray-100 p-2 rounded-md cursor-pointer"
                  onClick={() => {
                    setTargetLanguage(language);
                    setShowLanguages(false);
                  }}
                >
                  {language.name}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const UploadHistory = ({ uploadHistory, setUploadHistory, languages }) => {
  const getLanguageName = (code) => {
    const language = languages.find((lang) => lang.code === code);
    return language ? language.name : code;
  };
  const downloadFile = (url, fileName) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const getUploadHistory = async () => {
    try {
      const response = await api.get(
        `/v1/gen-ai/translation-history?translate_type=file`
      );
      setUploadHistory(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getUploadHistory();
  }, []);
  return (
    <>
      {uploadHistory?.length > 0 && <hr className="my-4" />}
      <div className="w-2/4 mx-auto mb-5">
        {uploadHistory?.length > 0 ? (
          <>
            <h5 className="text-lg font-bold text-left mb-2">Upload History</h5>
            {uploadHistory?.map((item) => (
              <div
                className="bg-white p-3 rounded-md mb-2 flex justify-between items-center"
                key={item?.id}
              >
                <div className="flex gap-2 items-center">
                  <img src={CSVFile} alt="CSV File" className="w-10 h-10" />
                  <div className="w-[88%]">
                    <p className="line-clamp-2 text-left break-all">
                      {item.input_file_name}
                    </p>
                    <div className="flex gap-2 file-details">
                      <p className="text-xs text-gray-500 file-detail pr-2">
                        {formatFileSize(item?.input_file_size)}
                      </p>
                      <p className="text-xs text-gray-500 file-detail px-2">
                        {getLanguageName(item?.target_language)}
                      </p>
                      <p className="text-xs text-gray-500 file-detail px-2">
                        {moment(item?.created_at).fromNow()}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  className="flex gap-2 items-center border border-[#d1dbde] rounded-md px-2 py-1 text-[#3e5761] text-sm font-medium shadow hover:bg-[#f1f5f9]"
                  onClick={() =>
                    downloadFile(item?.output_file_url, item?.input_file_name)
                  }
                >
                  <ArrowDownTrayIcon className="w-4 h-4 text-[#3e5761]" />
                  Download
                </button>
              </div>
            ))}
          </>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

const TextTranslate = ({
  targetLanguage,
  setToastMessage,
  languages,
  setTargetLanguage,
}) => {
  const [text, setText] = useState("");
  const [translatedData, setTranslatedData] = useState({});
  const [translating, setTranslating] = useState(false);
  const [showLLMs, setShowLLMs] = useState(false);
  const [selectedLLM, setSelectedLLM] = useState(LLM[0]);
  const [selectedGender, setSelectedGender] = useState(genders[0]);
  const [showGender, setShowGender] = useState(false);
  const [selectedContextType, setSelectedContextType] = useState(
    contextTypes[0]
  );
  const [showContextType, setShowContextType] = useState(false);
  const [showAdditionalInstructions, setShowAdditionalInstructions] =
    useState(false);
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const textareaRef = useRef(null);
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);
  function useOutsideAlerter(ref) {
    useEffect(() => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          setShowLLMs(false);
          setShowGender(false);
          setShowContextType(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }
  useEffect(() => {
    const adjustHeight = () => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    };

    textareaRef?.current?.addEventListener("input", adjustHeight);
    return () =>
      textareaRef?.current?.removeEventListener("input", adjustHeight);
  }, []);

  const handleTranslate = async () => {
    try {
      setTranslatedData({});
      setTranslating(true);
      const response = await api.post("/v1/gen-ai/translate-text", {
        text,
        targetLanguage: targetLanguage.code,
        content_type: selectedContextType.code,
        narrator_gender: selectedGender.code,
        additional_context: additionalInstructions,
      });
      setTranslatedData(response.data.data);
      setTranslating(false);
      setSelectedLLM(LLM[0]);
    } catch (error) {
      console.log(error);
      setTranslating(false);
      if (error?.response?.data?.message || error?.message) {
        setToastMessage({
          show: true,
          message: error?.response?.data?.message || error?.message,
          type: "error",
        });
      }
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(translatedData?.gpt_translation);
    setToastMessage({
      show: true,
      message: "Translation copied to clipboard",
      type: "success",
      duration: 3000,
    });
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <div className="relative mt-2 min-w-28">
          <button
            type="button"
            className="relative w-full cursor-default rounded-md bg-white py-1.5 px-2 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none sm:text-sm/6 cursor-pointer hover:bg-[#f3f3f3]"
            aria-haspopup="listbox"
            aria-expanded="true"
            aria-labelledby="listbox-label"
            onClick={() => setShowGender(!showGender)}
          >
            <span className="flex items-center justify-between">
              <span className="block truncate">{selectedGender?.name}</span>
              <ChevronDownIcon className="w-6 h-6 text-gray-500 inline pointer-events-none ml-3" />
            </span>
          </button>

          {showGender && (
            <ul
              className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
              tabIndex="-1"
              role="listbox"
              aria-labelledby="listbox-label"
              aria-activedescendant="listbox-option-3"
              ref={wrapperRef}
            >
              {genders.map((gender) => (
                <li
                  key={gender.id}
                  className="relative cursor-default select-none py-2 px-3 text-gray-900 cursor-pointer hover:bg-[#f3f3f3]"
                  id="listbox-option-0"
                  role="option"
                  onClick={() => {
                    setSelectedGender(gender);
                    setShowGender(false);
                  }}
                >
                  <div className="flex items-center">
                    <span className="block truncate font-normal">
                      {gender.name}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="relative mt-2 min-w-28">
          <button
            type="button"
            className="relative w-full cursor-default rounded-md bg-white py-1.5 px-2 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none sm:text-sm/6 cursor-pointer hover:bg-[#f3f3f3]"
            aria-haspopup="listbox"
            aria-expanded="true"
            aria-labelledby="listbox-label"
            onClick={() => setShowContextType(!showContextType)}
          >
            <span className="flex items-center justify-between">
              <span className="block truncate">{selectedContextType?.name}</span>
              <ChevronDownIcon className="w-6 h-6 text-gray-500 inline pointer-events-none ml-3" />
            </span>
          </button>

          {showContextType && (
            <ul
              className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
              tabIndex="-1"
              role="listbox"
              aria-labelledby="listbox-label"
              aria-activedescendant="listbox-option-3"
              ref={wrapperRef}
            >
              {contextTypes.map((contextType) => (
                <li
                  key={contextType.id}
                  className="relative cursor-default select-none py-2 px-3 text-gray-900 cursor-pointer hover:bg-[#f3f3f3]"
                  id="listbox-option-0"
                  role="option"
                  onClick={() => {
                    setSelectedContextType(contextType);
                    setShowContextType(false);
                  }}
                >
                  <div className="flex items-center">
                    <span className="block truncate font-normal">
                      {contextType.name}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <LanguageSelect
          languages={languages}
          targetLanguage={targetLanguage}
          setTargetLanguage={setTargetLanguage}
        />
        {!showAdditionalInstructions && (
          <span
            className="text-sm text-gray-500 mt-2 cursor-pointer"
            onClick={() =>
              setShowAdditionalInstructions(!showAdditionalInstructions)
            }
          >
            <PlusCircleIcon className="w-4 h-4 inline mb-[1px]" /> Additional
            context
          </span>
        )}
      </div>
      {showAdditionalInstructions && (
        <textarea
          className="w-full border border-gray-300 rounded p-2 mb-2 outline-none text-sm"
          value={additionalInstructions}
          onChange={(e) => setAdditionalInstructions(e.target.value)}
          placeholder="Additional context"
        ></textarea>
      )}
      <div className="relative flex">
        <div className="w-1/2 border border-gray-300 rounded min-h-32 mr-2 flex flex-col">
          <div className="flex-grow relative">
            <textarea
              ref={textareaRef}
              className="w-full h-full p-2 rounded outline-none bg-transparent text-xl resize-none"
              autoFocus
              style={{ minHeight: "200px" }}
              value={text}
              onChange={(e) => setText(e.target.value)}
            ></textarea>
          </div>
          <div className="p-2">
            {text && !translating ? (
              <button
                className="bg-[#000] text-[#B9FF66] p-2 px-4 rounded-md ml-auto block hover:bg-[#B9FF66] hover:text-[#000]"
                onClick={handleTranslate}
              >
                Translate
              </button>
            ) : (
              <button className="bg-[#000] text-[#B9FF66] p-2 px-4 rounded-md ml-auto block cursor-not-allowed">
                {translating && (
                  <img
                    src={loadingIcon}
                    alt="Loading Icon"
                    className="w-7 h-7 inline"
                  />
                )}
                {translating ? "Translating..." : "Translate"}
              </button>
            )}
          </div>
        </div>
        <div className="w-1/2 min-h-32 bg-gray-200 rounded relative">
          <p
            className={`p-2 ${
              translatedData?.target_language === "ar"
                ? "text-right"
                : "text-left"
            }`}
          >
            {translatedData?.gpt_translation}
          </p>
          {translatedData?.gpt_translation && (
            <button
              className="absolute bottom-2 right-2 cursor-pointer"
              onClick={handleCopyText}
            >
              <Square2StackIcon className="w-6 h-6" />  
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Translate;

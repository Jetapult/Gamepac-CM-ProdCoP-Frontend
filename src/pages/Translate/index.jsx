import React, { useEffect, useRef, useState } from "react";
import api from "../../api";
import {
  ArrowDownTrayIcon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import UploadIcon from "../../assets/upload-icon.png";
import { DocumentIcon } from "@heroicons/react/24/outline";
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
      const response = await api.post("/v1/gen-ai/translate-csv", formData);
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
      <div className="flex gap-4 py-2">
        {tabs.map((tab) => (
          <p
            key={tab.name}
            className={`cursor-pointer border border-[#000] rounded-md py-[3px] px-5 ${
              activeTab === tab.name ? "bg-black text-white opacity-75" : ""
            }`}
            onClick={() => setActiveTab(tab.name)}
          >
            {tab.name}
          </p>
        ))}
      </div>
      <LanguageSelect
        languages={languages}
        targetLanguage={targetLanguage}
        setTargetLanguage={setTargetLanguage}
        activeTab={activeTab}
      />
      <>
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
            <TextTranslate targetLanguage={targetLanguage} setToastMessage={setToastMessage} />
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

const LanguageSelect = ({
  languages,
  targetLanguage,
  setTargetLanguage,
  activeTab
}) => {
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
    <div className="relative">
      <p
        onClick={() => setShowLanguages(!showLanguages)}
        className={`cursor-pointer`}
      >
        {targetLanguage.name
          ? targetLanguage.name
          : "Select the language you want to translate to"}
        <ChevronDownIcon className="w-8 h-8 text-gray-500 inline" />
      </p>
      {showLanguages && (
        <div className="absolute w-full z-10" ref={wrapperRef}>
          <div className="bg-white rounded-md p-2 mx-52">
            <input
              type="text"
              className="border border-gray-300 rounded-md p-2 w-full mb-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
            />
            <div className="flex flex-wrap gap-2 justify-between">
              {filteredLanguages.map((language) => (
                <p
                  key={language.code}
                  className="w-52 text-left hover:bg-gray-100 p-2 rounded-md cursor-pointer"
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

const TextTranslate = ({ targetLanguage, setToastMessage }) => {
  const [text, setText] = useState("");
  const [translatedData, setTranslatedData] = useState({});
  const [translating, setTranslating] = useState(false);
  const [showLLMs, setShowLLMs] = useState(false);
  const [selectedLLM, setSelectedLLM] = useState(LLM[0]);
  const textareaRef = useRef(null);
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);
  function useOutsideAlerter(ref) {
    useEffect(() => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          setShowLLMs(false);
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
  return (
    <div className="relative flex">
      {/* <div className="absolute right-0 top-[-28px]">
        <p className="cursor-pointer" onClick={() => setShowLLMs(!showLLMs)}>
          {selectedLLM?.name}
          <ChevronDownIcon className="w-6 h-6 text-gray-500 inline" />
        </p>
        {showLLMs && (
          <div className="absolute bg-white rounded-md p-2 w-max" ref={wrapperRef}>
            {LLM.map((llm) => (
              <p
                key={llm.id}
                className="text-left cursor-pointer hover:bg-gray-100 p-2 rounded-md"
                onClick={() => {
                  setSelectedLLM(llm);
                  setShowLLMs(false);
                }}
              >
                {llm.name}
              </p>
            ))}
          </div>
        )}
      </div> */}
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
      <div className="w-1/2 min-h-32 bg-gray-200 rounded">
        <p
          className={`p-2 ${
            translatedData?.target_language === "ar"
              ? "text-right"
              : "text-left"
          }`}
        >
          {translatedData?.gpt_translation}
        </p>
      </div>
    </div>
  );
};

export default Translate;

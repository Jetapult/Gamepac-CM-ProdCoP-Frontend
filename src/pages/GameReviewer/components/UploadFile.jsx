import { useRef, useState } from "react";
import api from "../../../api";
import UploadingDoc from "../../../assets/uploading-docs.jpg";

const UploadFile = ({
  messageObj,
  setMessageObj,
  userData,
  setKnowledgebase,
  selectedKnowledgebaseCategories,
  setSelectedPdf,
  setSelectedKnowledgebase,
  setToastMessage
}) => {
  const fileInputRef = useRef(null);
  const [showUploadProgressPopup, setShowUploadProgressPopup] = useState(false);
  const [files, setFiles] = useState([]);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    try {
      const files = Array.from(event.target.files);
      const pdfFiles = files.filter((file) => file.type === "application/pdf");
      setFiles(pdfFiles);

      if (pdfFiles.length === 0) {
        console.log("Only PDF files are allowed.");
        return;
      }
      setShowUploadProgressPopup(true);
      //   const imageUrls = files.map((file) => URL.createObjectURL(file));
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("slug", userData.slug);
      formData.append("category_id", selectedKnowledgebaseCategories.id);
      const response = await api.post("/v1/chat/attachments", formData);
      setMessageObj({
        ...messageObj,
        files: files,
        attachments: response.data.data.files,
      });
      setKnowledgebase((prev) => [...response.data.knowledgebase, ...prev]);
      setShowUploadProgressPopup(false);
      if(response.data.knowledgebase.length){
        setSelectedPdf(response.data.knowledgebase[0]);
        setSelectedKnowledgebase((prev) => [...prev, response.data.knowledgebase[0]]);
      }
    } catch (error) {
      console.log(error);
      setShowUploadProgressPopup(false);
      setToastMessage({
        show: true,
        message:
          error?.response?.data?.message ||
          "Something went wrong! Please try again later",
        type: "error",
      });
    }
  };
  return (
    <>
      <div className="border border-[#ccc] rounded-2xl h-24">
        <p className="text-sm text-gray-500 pl-4 py-2">
          Upload your files to get started
        </p>
        <button
          className="px-4 py-2 border border-[#ccc] rounded-full px-14 mx-auto flex hover:bg-[#e6e6e6]"
          onClick={handleButtonClick}
        >
          Upload PDF
        </button>
        <input
          accept=".pdf,application/pdf"
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>
      {showUploadProgressPopup && <UploadProgressPopup files={files} />}
    </>
  );
};

const UploadProgressPopup = ({files}) => {
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
export default UploadFile;

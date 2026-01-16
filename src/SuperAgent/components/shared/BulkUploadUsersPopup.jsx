import React, { useState, useRef, useCallback } from "react";
import { X, Upload, CheckCircle, AlertCircle, FileSpreadsheet } from "lucide-react";
import api from "../../../api";

// Upload states
const UPLOAD_STATES = {
  IDLE: "idle",
  FILE_SELECTED: "file_selected",
  UPLOADING: "uploading",
  COMPLETED: "completed",
  ERROR: "error",
};

const BulkUploadUsersPopup = ({
  setShowBulkUploadPopup,
  studio_id,
  onUploadSuccess,
}) => {
  const [uploadState, setUploadState] = useState(UPLOAD_STATES.IDLE);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadResponse, setUploadResponse] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "text/csv" || file.name.endsWith(".csv"))) {
      setSelectedFile(file);
      setUploadState(UPLOAD_STATES.FILE_SELECTED);
      setErrorMessage("");
    } else {
      setErrorMessage("Please upload a CSV file");
    }
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadState(UPLOAD_STATES.FILE_SELECTED);
      setErrorMessage("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadState(UPLOAD_STATES.UPLOADING);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("data", selectedFile);

      const response = await api.post(
        `/v1/users/bulk-upload/${studio_id}`,
        formData
      );

      setUploadResponse(response.data.data);
      setUploadState(UPLOAD_STATES.COMPLETED);

      if (response.data.data?.userAddedCount > 0) {
        setTimeout(() => {
          onUploadSuccess?.(response.data.data);
        }, 1000);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadState(UPLOAD_STATES.ERROR);
      setErrorMessage(err.response?.data?.message || "Upload failed. Please try again.");
    }
  };

  const handleDownloadSample = () => {
    window.open("/sample-bulk-upload.csv", "_blank");
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadState(UPLOAD_STATES.IDLE);
    setUploadResponse(null);
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReUpload = () => {
    handleRemoveFile();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const renderUploadArea = () => {
    switch (uploadState) {
      case UPLOAD_STATES.IDLE:
        return (
          <>
            {/* Download Sample Format Link */}
            <button
              onClick={handleDownloadSample}
              className="flex items-center gap-1 text-sm font-medium text-[#1F6744] mb-4 hover:underline"
            >
              <span className="w-4 h-4 rounded-full border border-[#1F6744] flex items-center justify-center text-xs">i</span>
              Download Sample Format
            </button>

            {/* Upload Area - Entire box is clickable */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-[#1F6744] bg-[#E8F5E9]"
                  : "border-[#E7EAEE] hover:border-[#1F6744]"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#F6F6F6] flex items-center justify-center">
                  <Upload size={24} color="#6d6d6d" />
                </div>
                <div>
                  <p className="text-sm text-[#141414]">
                    <span className="text-[#1F6744] font-medium">Click to upload</span>
                    {" "}or drag and drop
                  </p>
                  <p className="text-xs text-[#B0B0B0] mt-1">
                    Supported file format: CSV (max. 100MB)
                  </p>
                </div>
              </div>
            </div>
          </>
        );

      case UPLOAD_STATES.FILE_SELECTED:
        return (
          <>
            <div className="border border-[#E7EAEE] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E3F2FD] rounded-lg flex items-center justify-center shrink-0">
                    <FileSpreadsheet size={20} color="#1976D2" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#141414]">{selectedFile?.name}</p>
                    <p className="text-xs text-[#B0B0B0]">{formatFileSize(selectedFile?.size || 0)}</p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="p-1 hover:bg-[#F6F6F6] rounded transition-colors"
                >
                  <X size={24} color="#6d6d6d" strokeWidth={1.5} />
                </button>
              </div>
            </div>
            <button
              onClick={handleReUpload}
              className="text-sm font-medium text-[#1F6744] mt-3 hover:underline"
            >
              Re-upload
            </button>
          </>
        );

      case UPLOAD_STATES.UPLOADING:
        return (
          <div className="border border-[#E7EAEE] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#E8F5E9] rounded-lg flex items-center justify-center shrink-0">
                <FileSpreadsheet size={20} color="#1F6744" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#141414] truncate">Uploading ...</p>
                <div className="mt-2">
                  <div className="h-1.5 bg-[#E7EAEE] rounded-full overflow-hidden">
                    <div className="h-full bg-[#1F6744] rounded-full animate-pulse w-3/4" />
                  </div>
                </div>
                <p className="text-xs text-[#B0B0B0] mt-1">
                  {formatFileSize(selectedFile?.size || 0)}
                </p>
              </div>
            </div>
          </div>
        );

      case UPLOAD_STATES.COMPLETED:
        return (
          <div className="border border-[#E7EAEE] rounded-lg p-4 bg-[#F6F7F8]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle size={24} color="#1F6744" />
                <div>
                  <p className="text-sm font-medium text-[#141414]">
                    {uploadResponse?.userAddedCount || 0} user(s) added successfully
                  </p>
                  <p className="text-xs text-[#B0B0B0]">Total Files Size: {formatFileSize(selectedFile?.size || 0)}</p>
                </div>
              </div>
            </div>
            {/* Show duplicate emails if any */}
            {uploadResponse?.duplicateEmails?.length > 0 && (
              <div className="mt-3 bg-[#FFF8E1] border border-[#FFE082] rounded-lg p-3">
                <p className="text-sm text-[#F57C00] font-medium mb-1">
                  Duplicate emails (skipped):
                </p>
                <p className="text-xs text-[#F57C00]">
                  {uploadResponse.duplicateEmails.join(", ")}
                </p>
              </div>
            )}
            {/* Show invalid emails if any */}
            {uploadResponse?.invalidEmails?.length > 0 && (
              <div className="mt-3 bg-[#FFEBEE] border border-[#FFCDD2] rounded-lg p-3">
                <p className="text-sm text-[#D32F2F] font-medium mb-1">
                  Invalid email formats:
                </p>
                <p className="text-xs text-[#D32F2F]">
                  {uploadResponse.invalidEmails.join(", ")}
                </p>
              </div>
            )}
          </div>
        );

      case UPLOAD_STATES.ERROR:
        return (
          <div className="border border-[#FECACA] rounded-lg p-4 bg-[#FEF2F2]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle size={24} color="#DC2626" />
                <div>
                  <p className="text-sm font-medium text-[#DC2626]">Error - Upload Failed</p>
                  <p className="text-xs text-[#B0B0B0]">{errorMessage || "Please try again"}</p>
                </div>
              </div>
              <button
                onClick={handleReUpload}
                className="text-sm font-medium text-[#DC2626] hover:underline"
              >
                Re-upload
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isSubmitDisabled = uploadState !== UPLOAD_STATES.FILE_SELECTED && uploadState !== UPLOAD_STATES.COMPLETED;

  return (
    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-[#12111157] font-urbanist">
      <div className="relative my-6 mx-auto w-[480px]">
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
          {/* Header */}
          <div className="flex items-center justify-between p-5 rounded-t">
            <h3 className="text-lg font-medium text-[#141414]">Bulk upload users</h3>
            <button
              className="p-1 border-0 text-black float-right text-lg leading-none font-semibold outline-none focus:outline-none"
              onClick={() => setShowBulkUploadPopup(false)}
            >
              <X size={24} color="#6d6d6d" strokeWidth={1.5} />
            </button>
          </div>

          {/* Content */}
          <div className="px-5 pb-5">
            {uploadState === UPLOAD_STATES.IDLE && (
              <p className="text-base text-[#141414] mb-4">
                Download a sample file, add user details and upload back on platform.
              </p>
            )}

            {renderUploadArea()}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Footer - Always show Submit button */}
          <div className="flex justify-end p-5 pt-0">
            <button
              onClick={uploadState === UPLOAD_STATES.FILE_SELECTED ? handleUpload : () => setShowBulkUploadPopup(false)}
              disabled={isSubmitDisabled && uploadState !== UPLOAD_STATES.COMPLETED && uploadState !== UPLOAD_STATES.ERROR}
              className={`px-8 py-2 rounded-lg text-base font-medium transition-colors ${
                isSubmitDisabled && uploadState !== UPLOAD_STATES.COMPLETED && uploadState !== UPLOAD_STATES.ERROR
                  ? "bg-[#E7EAEE] text-[#B0B0B0] cursor-not-allowed"
                  : "bg-[#1F6744] text-white hover:bg-[#1a5a3a]"
              }`}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadUsersPopup;

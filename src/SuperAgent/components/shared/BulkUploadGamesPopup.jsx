import { X } from "lucide-react";
import React, { useState, useRef, useCallback } from "react";
import { Upload, CheckCircle, AlertCircle, FileSpreadsheet } from "lucide-react";
import api from "../../../api";

// Upload states
const UPLOAD_STATES = {
  IDLE: "idle",
  UPLOADING: "uploading",
  COMPLETED: "completed",
  ERROR: "error",
  FILE_SELECTED: "file_selected",
};

const BulkUploadGamesPopup = ({
  setShowBulkUploadPopup,
  studio_id,
  onUploadSuccess,
}) => {
  const [uploadState, setUploadState] = useState(UPLOAD_STATES.IDLE);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadedFileInfo, setUploadedFileInfo] = useState(null);
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateFile = (file) => {
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xls|xlsx)$/i)) {
      return { valid: false, error: "Invalid file type. Please upload CSV, XLS, or XLSX file." };
    }

    if (file.size > maxSize) {
      return { valid: false, error: "File size exceeds 100MB limit." };
    }

    return { valid: true };
  };

  const handleFileSelect = (file) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error);
      setUploadState(UPLOAD_STATES.ERROR);
      return;
    }

    setSelectedFile(file);
    setUploadState(UPLOAD_STATES.FILE_SELECTED);
    setErrorMessage("");
  };

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
    if (file) {
      handleFileSelect(file);
    }
  }, []);

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadState(UPLOAD_STATES.UPLOADING);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("studio_id", studio_id);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await api.post("/v1/games/bulk-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadState(UPLOAD_STATES.COMPLETED);
      setUploadedFileInfo({
        name: selectedFile.name,
        size: formatFileSize(selectedFile.size),
      });

      // Call success callback after a short delay
      setTimeout(() => {
        if (onUploadSuccess) {
          onUploadSuccess(response.data);
        }
      }, 1000);
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadState(UPLOAD_STATES.ERROR);
      setErrorMessage(error.response?.data?.message || "Upload failed. Please try again.");
    }
  };

  const handleReUpload = () => {
    setSelectedFile(null);
    setUploadState(UPLOAD_STATES.IDLE);
    setUploadProgress(0);
    setErrorMessage("");
    setUploadedFileInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadState(UPLOAD_STATES.IDLE);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadSampleFormat = () => {
    // Create sample CSV content
    const csvContent = "game_name,play_store_url,app_store_url,alias\nSample Game,https://play.google.com/store/apps/details?id=com.example,https://apps.apple.com/app/id123456789,sample-alias";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "game_upload_sample.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const renderUploadArea = () => {
    switch (uploadState) {
      case UPLOAD_STATES.IDLE:
        return (
          <>
            {/* Download Sample Format Link */}
            <button
              onClick={downloadSampleFormat}
              className="flex items-center gap-1 text-sm font-medium text-[#1F6744] mb-4 hover:underline"
            >
              <span className="w-4 h-4 rounded-full border border-[#1F6744] flex items-center justify-center text-xs">i</span>
              Download Sample Format
            </button>

            {/* Upload Area */}
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
                    <span className="text-[#1F6744] font-medium cursor-pointer">Click to upload</span>
                    {" "}or drag and drop
                  </p>
                  <p className="text-xs text-[#B0B0B0] mt-1">
                    Supported file formats: CSV, XLS or XLSX (max. 100MB) - Upload up-to 1 File
                  </p>
                </div>
              </div>
            </div>
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
                    <div
                      className="h-full bg-[#1F6744] rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-[#B0B0B0] mt-1">
                  {Math.ceil((100 - uploadProgress) / 10)} Secs left • {formatFileSize(selectedFile?.size || 0)}
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
                  <p className="text-sm font-medium text-[#141414]">100% Completed</p>
                  <p className="text-xs text-[#B0B0B0]">Total Files Size: {formatFileSize(selectedFile?.size || 0)}</p>
                </div>
              </div>
              <button
                onClick={() => {/* View uploaded file logic */}}
                className="text-sm font-medium text-[#1F6744] hover:underline"
              >
                View uploaded file
              </button>
            </div>
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
                  <p className="text-xs text-[#B0B0B0]">{errorMessage || "Total Files Size: 100MB"}</p>
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

      default:
        return null;
    }
  };

  const isSubmitDisabled = uploadState !== UPLOAD_STATES.FILE_SELECTED && uploadState !== UPLOAD_STATES.COMPLETED;

  return (
    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-[#12111157] font-urbanist">
      <div className="relative my-6 mx-auto max-w-lg w-[480px]">
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
          {/* Header */}
          <div className="flex items-center justify-between p-5 rounded-t">
            <h3 className="text-lg font-medium text-[#141414]">Bulk upload games</h3>
            <button
              className="p-1 border-0 text-black float-right text-lg leading-none font-semibold outline-none focus:outline-none"
              onClick={() => setShowBulkUploadPopup(false)}
            >
              <X size={24} color="#6d6d6d" strokeWidth={1.5} />
            </button>
          </div>

          {/* Content */}
          <div className="px-5 pb-5">
            <p className="text-base text-[#141414] mb-4">
              {uploadState === UPLOAD_STATES.IDLE
                ? "Download a sample file, add game details and upload back on platform."
                : "Upload all the studio games, directly to save time."}
            </p>

            {renderUploadArea()}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleInputChange}
              accept=".csv,.xls,.xlsx"
              className="hidden"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end p-5 pt-0">
            <button
              onClick={uploadState === UPLOAD_STATES.FILE_SELECTED ? handleUpload : () => setShowBulkUploadPopup(false)}
              disabled={isSubmitDisabled && uploadState !== UPLOAD_STATES.COMPLETED}
              className={`px-8 py-2 rounded-lg text-base font-medium transition-colors ${
                isSubmitDisabled && uploadState !== UPLOAD_STATES.COMPLETED
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

export default BulkUploadGamesPopup;

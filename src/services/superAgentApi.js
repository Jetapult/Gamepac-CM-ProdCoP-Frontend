import api from "../api";

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpg",
  "image/jpeg",
  "image/svg+xml",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "text/plain",
  "video/mp4",
];

const ALLOWED_EXTENSIONS = [
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "svg",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "csv",
  "txt",
  "mp4",
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
const MAX_ATTACHMENTS = 4;

export const validateFile = (file) => {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `File type .${extension} is not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(
        ", "
      )}`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 20MB limit. File size: ${(
        file.size /
        (1024 * 1024)
      ).toFixed(2)}MB`,
    };
  }

  return { valid: true };
};

export const uploadAttachment = async (file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/v1/superagent/attachments", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });

  return response.data;
};

export const getAttachment = async (attachmentId) => {
  const response = await api.get(`/v1/superagent/attachments/${attachmentId}`);
  return response.data;
};

export const getFileTypeFromName = (fileName) => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension || "unknown";
};

export const isImageFile = (fileType) => {
  return ["png", "jpg", "jpeg", "svg"].includes(fileType);
};

export const isVideoFile = (fileType) => {
  return ["mp4"].includes(fileType);
};

export { MAX_ATTACHMENTS, MAX_FILE_SIZE, ALLOWED_EXTENSIONS };

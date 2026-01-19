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
        ", ",
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
          (progressEvent.loaded * 100) / progressEvent.total,
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

// Liveops agent supported file types (forwarded directly to liveops agent)
const LIVEOPS_SUPPORTED_EXTENSIONS = [
  "pdf",
  "docx",
  "doc",
  "csv",
  "png",
  "jpg",
  "jpeg",
  "txt",
];

export const isLiveopsSupported = (fileType) => {
  return LIVEOPS_SUPPORTED_EXTENSIONS.includes(fileType?.toLowerCase());
};

// Finops agent only accepts CSV files
const FINOPS_SUPPORTED_EXTENSIONS = ["csv"];

export const isFinopsSupported = (fileType) => {
  return FINOPS_SUPPORTED_EXTENSIONS.includes(fileType?.toLowerCase());
};

// ============================================================
// LIVEOPS SESSION MANAGEMENT
// ============================================================

/**
 * Create a new liveops session
 * @returns {Promise<{session_id: string, thread_id: string, files: string[]}>}
 */
export const createLiveopsSession = async () => {
  const response = await api.post("/v1/superagent/liveops/session");
  return response.data;
};

/**
 * Get liveops session details
 * @param {string} sessionId
 * @returns {Promise<{session_id: string, thread_id: string, files: string[]}>}
 */
export const getLiveopsSession = async (sessionId) => {
  const response = await api.get(`/v1/superagent/liveops/session/${sessionId}`);
  return response.data;
};

/**
 * Delete a liveops session
 * @param {string} sessionId
 */
export const deleteLiveopsSession = async (sessionId) => {
  const response = await api.delete(
    `/v1/superagent/liveops/session/${sessionId}`,
  );
  return response.data;
};

/**
 * Upload attachment for liveops agent with smart routing
 * - Liveops-supported files: uploaded to S3 AND forwarded to liveops agent
 * - Other files: uploaded to S3, description generated to append to message
 *
 * @param {File} file - The file to upload
 * @param {string} liveopsSessionId - The liveops session ID
 * @param {function} onProgress - Progress callback
 * @returns {Promise<{attachment: object, liveops_uploaded: boolean, liveops_files: string[], description?: string}>}
 */
export const uploadLiveopsAttachment = async (
  file,
  liveopsSessionId,
  onProgress,
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("liveops_session_id", liveopsSessionId);

  const response = await api.post(
    "/v1/superagent/liveops/attachments",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percentCompleted);
        }
      },
    },
  );

  return response.data;
};

// ============================================================
// FINOPS SESSION MANAGEMENT
// ============================================================

/**
 * Create a new finops session
 * @returns {Promise<{session_id: string, thread_id: string, files: string[], cash_balance: number}>}
 */
export const createFinopsSession = async () => {
  const response = await api.post("/v1/superagent/finops/session");
  return response.data;
};

/**
 * Get finops session details
 * @param {string} sessionId
 * @returns {Promise<{session_id: string, thread_id: string, files: string[], cash_balance: number}>}
 */
export const getFinopsSession = async (sessionId) => {
  const response = await api.get(`/v1/superagent/finops/session/${sessionId}`);
  return response.data;
};

/**
 * Delete a finops session
 * @param {string} sessionId
 */
export const deleteFinopsSession = async (sessionId) => {
  const response = await api.delete(
    `/v1/superagent/finops/session/${sessionId}`,
  );
  return response.data;
};

/**
 * Upload CSV attachment for finops agent
 * Only CSV files are supported
 *
 * @param {File} file - The CSV file to upload
 * @param {string} finopsSessionId - The finops session ID
 * @param {function} onProgress - Progress callback
 * @returns {Promise<{attachment: object, finops_uploaded: boolean, finops_files: string[]}>}
 */
export const uploadFinopsAttachment = async (
  file,
  finopsSessionId,
  onProgress,
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("finops_session_id", finopsSessionId);

  const response = await api.post(
    "/v1/superagent/finops/attachments",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percentCompleted);
        }
      },
    },
  );

  return response.data;
};

export {
  MAX_ATTACHMENTS,
  MAX_FILE_SIZE,
  ALLOWED_EXTENSIONS,
  LIVEOPS_SUPPORTED_EXTENSIONS,
  FINOPS_SUPPORTED_EXTENSIONS,
};

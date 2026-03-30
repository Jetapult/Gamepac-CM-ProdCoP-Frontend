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
export const LIVEOPS_SUPPORTED_EXTENSIONS = [
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
export const FINOPS_SUPPORTED_EXTENSIONS = ["csv"];

export const isFinopsSupported = (fileType) => {
  return FINOPS_SUPPORTED_EXTENSIONS.includes(fileType?.toLowerCase());
};

// ============================================================
// CHAT MANAGEMENT
// ============================================================

/**
 * Update chat data (e.g., to store session IDs)
 * @param {string} chatId - The chat ID
 * @param {object} data - The data to update (merged with existing data)
 * @returns {Promise<object>}
 */
export const updateChat = async (chatId, data) => {
  const response = await api.patch(`/v1/superagent/chats/${chatId}`, { data });
  return response.data;
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
 * @param {object} options - Either { chatId } or { sessionId }
 * @param {function} onProgress - Progress callback
 * @returns {Promise<{attachment: object, liveops_uploaded: boolean, liveops_files: string[], description?: string}>}
 */
export const uploadLiveopsAttachment = async (
  file,
  { chatId, sessionId },
  onProgress,
) => {
  const formData = new FormData();
  formData.append("file", file);
  // Use chatId if available (chat page), otherwise use sessionId directly (index page)
  if (chatId) {
    formData.append("chat_id", chatId);
  } else if (sessionId) {
    formData.append("liveops_session_id", sessionId);
  }

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
 * @param {object} options - Either { chatId } or { sessionId }
 * @param {function} onProgress - Progress callback
 * @returns {Promise<{attachment: object, finops_uploaded: boolean, finops_files: string[]}>}
 */
export const uploadFinopsAttachment = async (
  file,
  { chatId, sessionId },
  onProgress,
) => {
  const formData = new FormData();
  formData.append("file", file);
  // Use chatId if available (chat page), otherwise use sessionId directly (index page)
  if (chatId) {
    formData.append("chat_id", chatId);
  } else if (sessionId) {
    formData.append("finops_session_id", sessionId);
  }

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

// ============================================================
// SCALEPAC (CREATIVE BREAKDOWN) SESSION MANAGEMENT
// ============================================================

// ScalePac agent supported file types (video and image)
export const SCALEPAC_SUPPORTED_EXTENSIONS = [
  "mp4",
  "mov",
  "avi",
  "webm",
  "jpg",
  "jpeg",
  "png",
  "gif",
];

export const isScalepacSupported = (fileType) => {
  return SCALEPAC_SUPPORTED_EXTENSIONS.includes(fileType?.toLowerCase());
};

/**
 * Create a new creative breakdown session
 * @param {number} gameId
 * @param {string} gameName
 * @param {string} studioName
 * @returns {Promise<{session_id: string, created_at: string, config: object}>}
 */
export const createCreativeBreakdownSession = async (
  gameId,
  gameName,
  studioName,
) => {
  const response = await api.post("/v1/superagent/creative-breakdown/session", {
    game_id: gameId,
    game_name: gameName,
    studio_name: studioName,
  });
  return response.data;
};

/**
 * Upload attachment for creative breakdown (ScalePac) agent
 * Supports video and image files
 *
 * @param {File} file - The file to upload
 * @param {object} options - Either { chatId } or { sessionId }
 * @param {function} onProgress - Progress callback
 * @returns {Promise<{attachment: object, creative_breakdown_uploaded: boolean}>}
 */
export const uploadCreativeBreakdownAttachment = async (
  file,
  { chatId, sessionId },
  onProgress,
) => {
  const formData = new FormData();
  formData.append("file", file);
  // Use chatId if available (chat page), otherwise use sessionId directly (index page)
  if (chatId) {
    formData.append("chat_id", chatId);
  } else if (sessionId) {
    formData.append("creative_breakdown_session_id", sessionId);
  }

  const response = await api.post(
    "/v1/superagent/creative-breakdown/attachments",
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
// DATAPAC SESSION MANAGEMENT
// ============================================================

/**
 * Create a new datapac session
 * @param {number} gameId
 * @param {string} gameCode
 * @param {string} studioSlug
 * @returns {Promise<{session_id: string, status: string, game_id: number, game_code: string}>}
 */
export const createDatapacSession = async (gameId, gameCode, studioSlug, packageName, appleAppId) => {
  const response = await api.post("/v1/superagent/datapac/session", {
    game_id: gameId,
    game_code: gameCode,
    studio_slug: studioSlug,
    ...(packageName && { package_name: packageName }),
    ...(appleAppId && { apple_app_id: appleAppId }),
  });
  return response.data;
};

/**
 * Get datapac session details
 * @param {string} sessionId
 * @returns {Promise<object>}
 */
export const getDatapacSession = async (sessionId) => {
  const response = await api.get(`/v1/superagent/datapac/session/${sessionId}`);
  return response.data;
};

/**
 * Delete a datapac session
 * @param {string} sessionId
 */
export const deleteDatapacSession = async (sessionId) => {
  const response = await api.delete(`/v1/superagent/datapac/session/${sessionId}`);
  return response.data;
};

/**
 * Get datapac report
 * @param {string} sessionId - Optional session ID
 * @returns {Promise<object>}
 */
export const getDatapacReport = async (sessionId) => {
  const params = sessionId ? { session_id: sessionId } : {};
  const response = await api.get("/v1/superagent/datapac/report", { params });
  return response.data;
};

/**
 * Get datapac suggested actions
 * @param {string} sessionId - Optional session ID
 * @returns {Promise<object>}
 */
export const getDatapacActions = async (sessionId) => {
  const params = sessionId ? { session_id: sessionId } : {};
  const response = await api.get("/v1/superagent/datapac/actions", { params });
  return response.data;
};

// ============================================================
// STUDIO-PAC SESSION MANAGEMENT
// ============================================================

/**
 * Create a new studio-pac session
 * @param {string} gameId
 * @param {string} gameName
 * @param {number} studioId
 * @returns {Promise<{session_id: string, thread_id: string, game_id: string, game_name: string, scope: string}>}
 */
export const createStudioPacSession = async (gameId, gameName, studioId) => {
  const response = await api.post("/v1/superagent/studio-pac/session", {
    game_id: gameId,
    game_name: gameName,
    studio_id: studioId,
  });
  return response.data;
};

/**
 * Get studio-pac session details
 * @param {string} sessionId
 * @returns {Promise<object>}
 */
export const getStudioPacSession = async (sessionId) => {
  const response = await api.get(`/v1/superagent/studio-pac/session/${sessionId}`);
  return response.data;
};

/**
 * Delete a studio-pac session
 * @param {string} sessionId
 */
export const deleteStudioPacSession = async (sessionId) => {
  const response = await api.delete(`/v1/superagent/studio-pac/session/${sessionId}`);
  return response.data;
};

/**
 * Get studio-pac report
 * @returns {Promise<object>}
 */
export const getStudioPacReport = async () => {
  const response = await api.get("/v1/superagent/studio-pac/report");
  return response.data;
};

/**
 * Get studio-pac suggested actions
 * @returns {Promise<object>}
 */
export const getStudioPacActions = async () => {
  const response = await api.get("/v1/superagent/studio-pac/actions");
  return response.data;
};

// ============================================================
// EXPORT HELPERS
// ============================================================

/**
 * Export markdown content as PDF via backend
 * @param {string} markdown - Raw markdown string
 * @param {string} title - PDF filename title
 * @returns {Promise<Blob>} PDF blob for download
 */
export const exportMarkdownPdf = async (markdown, title = "report") => {
  const response = await api.post(
    "/v1/superagent/export/markdown-pdf",
    { markdown, title },
    { responseType: "blob" },
  );
  return response.data;
};

// ============================================================
// GENERIC SESSION HELPERS
// ============================================================

/**
 * Map agent slug to the backend session ID key name
 */
export const sessionKeyMap = {
  liveops: "liveops_session_id",
  finops: "finops_session_id",
  creative_breakdown: "creative_breakdown_session_id",
  datapac: "datapac_session_id",
  studio_pac: "studio_pac_session_id",
};

/**
 * Get the session key for a given agent slug
 * @param {string} agentSlug
 * @returns {string|null}
 */
export const getSessionKey = (agentSlug) => {
  return sessionKeyMap[agentSlug] || null;
};

/**
 * Check if an agent requires a session
 * @param {string} agentSlug
 * @returns {boolean}
 */
export const agentRequiresSession = (agentSlug) => {
  return agentSlug in sessionKeyMap;
};

export { MAX_ATTACHMENTS, MAX_FILE_SIZE, ALLOWED_EXTENSIONS };

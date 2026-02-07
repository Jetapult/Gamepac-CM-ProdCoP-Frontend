import api from "../api";

/**
 * List BigQuery connections for the current user's studio
 */
export const listBqConnections = async () => {
  const response = await api.get("/v1/bigquery/connections");
  return response.data;
};

/**
 * Test an uploaded JSON file without saving — returns datasets + tables
 * @param {File} file - The service account JSON file
 */
export const testBqFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/v1/bigquery/connections/test-file", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * Create (save) a BigQuery connection
 * @param {File} file - The service account JSON file
 * @param {string} displayName - User-provided name for the connection
 */
export const createBqConnection = async (file, displayName) => {
  const formData = new FormData();
  // Rename the file to use the display name so backend picks it up as originalname
  const renamedFile = new File([file], displayName || file.name, { type: file.type });
  formData.append("file", renamedFile);
  const response = await api.post("/v1/bigquery/connections", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * Test an existing stored connection
 * @param {string} connectionId
 */
export const testBqConnection = async (connectionId) => {
  const response = await api.post(`/v1/bigquery/connections/${connectionId}/test`);
  return response.data;
};

/**
 * List datasets for a connection
 * @param {string} connectionId
 */
export const listBqDatasets = async (connectionId) => {
  const response = await api.get(`/v1/bigquery/connections/${connectionId}/datasets`);
  return response.data;
};

/**
 * List tables for a dataset
 * @param {string} connectionId
 * @param {string} datasetId
 */
export const listBqTables = async (connectionId, datasetId) => {
  const response = await api.get(`/v1/bigquery/connections/${connectionId}/datasets/${datasetId}/tables`);
  return response.data;
};

/**
 * Delete a BigQuery connection
 * @param {string} connectionId
 */
export const deleteBqConnection = async (connectionId) => {
  const response = await api.delete(`/v1/bigquery/connections/${connectionId}`);
  return response.data;
};

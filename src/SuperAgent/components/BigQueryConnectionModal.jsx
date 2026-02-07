import React, { useState, useEffect, useCallback } from "react";
import { X, Upload, Loader2, CheckCircle2, XCircle, Trash2, Database, Table2, ChevronDown, ChevronRight, RefreshCw, Info, ExternalLink, ShieldCheck } from "lucide-react";
import {
  listBqConnections,
  testBqFile,
  createBqConnection,
  testBqConnection,
  deleteBqConnection,
} from "../../services/bigqueryApi";

const BIGQUERY_ICON = "https://cdn.worldvectorlogo.com/logos/google-bigquery-logo-1.svg";

const BigQueryConnectionModal = ({ isOpen, onClose, onConnectionChange }) => {
  // Connection state
  const [connection, setConnection] = useState(null);
  const [loadingConnection, setLoadingConnection] = useState(true);

  // Upload flow state
  const [file, setFile] = useState(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testError, setTestError] = useState(null);

  // Confirm flow state
  const [connectionName, setConnectionName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Connected state actions
  const [retesting, setRetesting] = useState(false);
  const [retestResult, setRetestResult] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchConnection = useCallback(async () => {
    setLoadingConnection(true);
    try {
      const res = await listBqConnections();
      const conn = res.data?.[0] || null;
      setConnection(conn);
    } catch {
      setConnection(null);
    } finally {
      setLoadingConnection(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchConnection();
      // Reset upload state
      setFile(null);
      setTesting(false);
      setTestResult(null);
      setTestError(null);
      setConnectionName("");
      setSaving(false);
      setSaveError(null);
      setRetesting(false);
      setRetestResult(null);
      setConfirmDelete(false);
    }
  }, [isOpen, fetchConnection]);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.name.endsWith(".json")) {
      setTestError("Only .json files are accepted");
      return;
    }

    setFile(selected);
    setTestResult(null);
    setTestError(null);
    setConnectionName(selected.name);
    handleTestFile(selected);
  };

  const handleTestFile = async (fileToTest) => {
    setTesting(true);
    setTestError(null);
    setTestResult(null);
    try {
      const result = await testBqFile(fileToTest);
      setTestResult(result);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Connection test failed";
      setTestError(msg);
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!connectionName.trim()) {
      setSaveError("Connection name is required");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await createBqConnection(file, connectionName.trim());
      await fetchConnection();
      onConnectionChange?.();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to save connection";
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleRetest = async () => {
    if (!connection) return;
    setRetesting(true);
    setRetestResult(null);
    try {
      const result = await testBqConnection(connection.id);
      setRetestResult(result);
    } catch (err) {
      setRetestResult({ success: false, message: err.response?.data?.message || "Test failed" });
    } finally {
      setRetesting(false);
    }
  };

  const handleDelete = async () => {
    if (!connection) return;
    setDeleting(true);
    try {
      await deleteBqConnection(connection.id);
      setConnection(null);
      setConfirmDelete(false);
      onConnectionChange?.();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setTestResult(null);
    setTestError(null);
    setConnectionName("");
    setSaveError(null);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.16)] to-[rgba(102,102,102,0.48)]" />

      <div
        className="relative bg-white rounded-[16px] w-[560px] max-h-[80vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[#6d6d6d] hover:text-[#141414] transition-colors"
        >
          <X size={20} strokeWidth={1.5} />
        </button>

        {/* Header */}
        <div className="flex justify-center mb-4">
          <div className="size-[70px] rounded-[12px] border border-[#e6e6e6] flex items-center justify-center p-3">
            <img src={BIGQUERY_ICON} alt="BigQuery" className="w-full h-full object-contain" />
          </div>
        </div>
        <h2 className="font-urbanist text-[20px] font-semibold text-[#141414] text-center mb-2">
          BigQuery Connection
        </h2>

        {loadingConnection ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#1F6744]" />
            <span className="ml-2 font-urbanist text-sm text-[#6d6d6d]">Loading...</span>
          </div>
        ) : connection ? (
          /* ===== CONNECTED STATE ===== */
          <ConnectedView
            connection={connection}
            retesting={retesting}
            retestResult={retestResult}
            onRetest={handleRetest}
            deleting={deleting}
            confirmDelete={confirmDelete}
            setConfirmDelete={setConfirmDelete}
            onDelete={handleDelete}
          />
        ) : (
          /* ===== NOT CONNECTED STATE ===== */
          <NotConnectedView
            file={file}
            testing={testing}
            testResult={testResult}
            testError={testError}
            connectionName={connectionName}
            setConnectionName={setConnectionName}
            saving={saving}
            saveError={saveError}
            onFileSelect={handleFileSelect}
            onSave={handleSave}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
};

/* ===== NOT CONNECTED VIEW ===== */
const NotConnectedView = ({
  file,
  testing,
  testResult,
  testError,
  connectionName,
  setConnectionName,
  saving,
  saveError,
  onFileSelect,
  onSave,
  onReset,
}) => {
  const [showDetailedInstructions, setShowDetailedInstructions] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {/* Quick instructions */}
      <div className="bg-[#f8faf9] border border-[#d4e8dc] rounded-[10px] p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="size-[28px] rounded-full bg-[#1F6744] flex items-center justify-center shrink-0">
            <Info size={14} className="text-white" />
          </div>
          <p className="font-urbanist font-semibold text-[14px] text-[#141414]">How to get a service account JSON</p>
        </div>
        <div className="flex flex-col gap-2.5 ml-[36px]">
          <div className="flex items-start gap-2">
            <span className="font-urbanist font-semibold text-[12px] text-[#1F6744] bg-[#e8f5ee] rounded-full size-[20px] flex items-center justify-center shrink-0 mt-px">1</span>
            <p className="font-urbanist text-[13px] text-[#444] leading-[20px]">Go to <a href="https://console.cloud.google.com/iam-admin/serviceaccounts" target="_blank" rel="noopener noreferrer" className="text-[#1E80EA] font-medium hover:underline">GCP Console → Service Accounts</a></p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-urbanist font-semibold text-[12px] text-[#1F6744] bg-[#e8f5ee] rounded-full size-[20px] flex items-center justify-center shrink-0 mt-px">2</span>
            <p className="font-urbanist text-[13px] text-[#444] leading-[20px]">Create a service account with roles: <strong className="text-[#141414]">BigQuery Data Viewer</strong> + <strong className="text-[#141414]">BigQuery Job User</strong></p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-urbanist font-semibold text-[12px] text-[#1F6744] bg-[#e8f5ee] rounded-full size-[20px] flex items-center justify-center shrink-0 mt-px">3</span>
            <p className="font-urbanist text-[13px] text-[#444] leading-[20px]">Go to <strong className="text-[#141414]">Keys</strong> tab → Add Key → JSON → Download</p>
          </div>
        </div>
        <button
          onClick={() => setShowDetailedInstructions(true)}
          className="ml-[36px] mt-3 text-[#1E80EA] font-urbanist font-medium text-[13px] hover:underline inline-flex items-center gap-1"
        >
          Show detailed instructions
          <ExternalLink size={12} />
        </button>
      </div>

      {/* Sensitivity warning */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-[8px]">
        <ShieldCheck size={15} className="text-amber-600 shrink-0" />
        <p className="font-urbanist text-[12px] text-amber-700 leading-[17px]">
          Your JSON key is <strong>sensitive</strong>. It is encrypted before storage and never exposed. Keep your local copy secure or delete it if not needed.
        </p>
      </div>

      {/* Detailed Instructions Modal */}
      <DetailedInstructionsModal
        isOpen={showDetailedInstructions}
        onClose={() => setShowDetailedInstructions(false)}
      />

      {/* Upload area */}
      {!file ? (
        <label className="flex flex-col items-center justify-center gap-3 py-8 border-2 border-dashed border-[#e6e6e6] rounded-[12px] cursor-pointer hover:border-[#1F6744] hover:bg-[#f8faf9] transition-colors">
          <Upload size={32} className="text-[#b0b0b0]" />
          <div className="text-center">
            <p className="font-urbanist font-medium text-[14px] text-[#141414]">
              Upload service account JSON
            </p>
            <p className="font-urbanist text-[12px] text-[#b0b0b0] mt-1">
              Only .json files accepted
            </p>
          </div>
          <input
            type="file"
            accept=".json"
            onChange={onFileSelect}
            className="hidden"
          />
        </label>
      ) : (
        <div className="flex flex-col gap-3">
          {/* File info */}
          <div className="flex items-center justify-between bg-[#f6f6f6] rounded-[8px] p-3">
            <div className="flex items-center gap-2 min-w-0">
              <Database size={18} className="text-[#6d6d6d] shrink-0" />
              <span className="font-urbanist text-[13px] text-[#141414] truncate">
                {file.name}
              </span>
            </div>
            <button
              onClick={onReset}
              className="text-[#6d6d6d] hover:text-red-500 transition-colors shrink-0 ml-2"
              disabled={testing || saving}
            >
              <X size={16} />
            </button>
          </div>

          {/* Testing state */}
          {testing && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-[8px]">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span className="font-urbanist text-[13px] text-blue-700">
                Testing connection...
              </span>
            </div>
          )}

          {/* Test error */}
          {testError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-[8px]">
              <XCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
              <span className="font-urbanist text-[13px] text-red-700">{testError}</span>
            </div>
          )}

          {/* Test success — show datasets & tables */}
          {testResult && testResult.readOnly && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-[8px]">
                <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                <div className="font-urbanist text-[13px] text-green-700">
                  <span className="font-medium">Connection successful</span>
                  <span className="text-green-600"> — read-only access verified</span>
                </div>
              </div>

              {/* No datasets warning */}
              {testResult.noDatasets && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-[8px]">
                  <Info size={16} className="text-amber-600 mt-0.5 shrink-0" />
                  <div className="font-urbanist text-[13px] text-amber-700 leading-[19px]">
                    <span className="font-medium">No datasets found</span> — we couldn't fully verify the connection since there are no datasets in this project. You can still save the connection and it will work once datasets are created.
                  </div>
                </div>
              )}

              {/* Project info */}
              <div className="bg-[#f6f6f6] rounded-[8px] p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-urbanist text-[12px] text-[#6d6d6d]">Project</span>
                  <span className="font-urbanist text-[12px] text-[#141414] font-medium">{testResult.project_id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-urbanist text-[12px] text-[#6d6d6d]">Service Account</span>
                  <span className="font-urbanist text-[12px] text-[#141414] font-medium truncate ml-4 max-w-[280px]">{testResult.service_account_email}</span>
                </div>
              </div>

              {/* Datasets & Tables */}
              {!testResult.noDatasets && <SchemaPreview datasets={testResult.datasets} />}

              {/* Connection name input */}
              <div className="flex flex-col gap-1.5">
                <label className="font-urbanist text-[13px] font-medium text-[#141414]">
                  Connection Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={connectionName}
                  onChange={(e) => setConnectionName(e.target.value)}
                  placeholder="e.g. Production Analytics"
                  className="w-full px-3 py-2 border border-[#e6e6e6] rounded-[8px] font-urbanist text-[14px] text-[#141414] placeholder:text-[#b0b0b0] focus:outline-none focus:border-[#1F6744]"
                />
              </div>

              {saveError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-[8px]">
                  <XCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                  <span className="font-urbanist text-[13px] text-red-700">{saveError}</span>
                </div>
              )}

              {/* Save button */}
              <button
                onClick={onSave}
                disabled={saving || !connectionName.trim()}
                className="w-full py-2.5 bg-[#1F6744] text-white rounded-[8px] font-urbanist font-medium text-[14px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Connection"
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ===== CONNECTED VIEW ===== */
const ConnectedView = ({
  connection,
  retesting,
  retestResult,
  onRetest,
  deleting,
  confirmDelete,
  setConfirmDelete,
  onDelete,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Connection status */}
      <div className="flex items-center gap-2 justify-center mb-2">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span className="font-urbanist font-medium text-[14px] text-[#1F6744]">Connected</span>
      </div>

      {/* Connection details */}
      <div className="bg-[#f6f6f6] rounded-[8px] p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-urbanist text-[13px] text-[#6d6d6d]">Name</span>
          <span className="font-urbanist text-[13px] text-[#141414] font-medium">{connection.display_name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-urbanist text-[13px] text-[#6d6d6d]">Project</span>
          <span className="font-urbanist text-[13px] text-[#141414] font-medium">{connection.project_id}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-urbanist text-[13px] text-[#6d6d6d]">Service Account</span>
          <span className="font-urbanist text-[13px] text-[#141414] font-medium truncate ml-4 max-w-[280px]">{connection.service_account_email}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-urbanist text-[13px] text-[#6d6d6d]">Connected</span>
          <span className="font-urbanist text-[13px] text-[#141414]">
            {new Date(connection.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Retest result */}
      {retestResult && (
        retestResult.noDatasets ? (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-[8px]">
            <Info size={16} className="text-amber-600 mt-0.5 shrink-0" />
            <div className="font-urbanist text-[13px] text-amber-700 leading-[19px]">
              <span className="font-medium">No datasets found</span> — we couldn't fully verify the connection since there are no datasets in this project. It will work once datasets are created.
            </div>
          </div>
        ) : (
          <div className={`flex items-center gap-2 p-3 rounded-[8px] border ${
            retestResult.success
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}>
            {retestResult.success ? (
              <CheckCircle2 size={16} className="text-green-600" />
            ) : (
              <XCircle size={16} className="text-red-500" />
            )}
            <span className={`font-urbanist text-[13px] ${
              retestResult.success ? "text-green-700" : "text-red-700"
            }`}>
              {retestResult.message || "Connection is healthy"}
            </span>
          </div>
        )
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onRetest}
          disabled={retesting}
          className="flex-1 py-2.5 border border-[#e6e6e6] rounded-[8px] font-urbanist font-medium text-[14px] text-[#141414] hover:bg-[#f6f6f6] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {retesting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <RefreshCw size={16} />
              Test Connection
            </>
          )}
        </button>

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={deleting}
            className="py-2.5 px-4 border border-red-200 rounded-[8px] font-urbanist font-medium text-[14px] text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Trash2 size={16} />
            Delete
          </button>
        ) : (
          <button
            onClick={onDelete}
            disabled={deleting}
            className="py-2.5 px-4 bg-red-600 rounded-[8px] font-urbanist font-medium text-[14px] text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Confirm Delete"
            )}
          </button>
        )}
      </div>
    </div>
  );
};

/* ===== SCHEMA PREVIEW ===== */
const SchemaPreview = ({ datasets }) => {
  const [expanded, setExpanded] = useState({});

  if (!datasets?.length) {
    return (
      <div className="font-urbanist text-[13px] text-[#6d6d6d] text-center py-2">
        No datasets found
      </div>
    );
  }

  const toggleDataset = (dsId) => {
    setExpanded((prev) => ({ ...prev, [dsId]: !prev[dsId] }));
  };

  const MAX_DISPLAY = 5;

  return (
    <div className="border border-[#e6e6e6] rounded-[8px] overflow-hidden">
      <div className="bg-[#f6f6f6] px-3 py-2 border-b border-[#e6e6e6]">
        <span className="font-urbanist text-[12px] font-medium text-[#6d6d6d] uppercase tracking-wide">
          Datasets & Tables
        </span>
      </div>
      <div className="max-h-[200px] overflow-y-auto">
        {datasets.slice(0, MAX_DISPLAY).map((ds) => (
          <div key={ds.id}>
            <button
              onClick={() => toggleDataset(ds.id)}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#f8f8f8] transition-colors"
            >
              {expanded[ds.id] ? (
                <ChevronDown size={14} className="text-[#6d6d6d]" />
              ) : (
                <ChevronRight size={14} className="text-[#6d6d6d]" />
              )}
              <Database size={14} className="text-[#4285f4]" />
              <span className="font-urbanist text-[13px] text-[#141414] truncate">{ds.id}</span>
              <span className="font-urbanist text-[11px] text-[#b0b0b0] ml-auto shrink-0">
                {ds.tables?.length || 0} tables
              </span>
            </button>
            {expanded[ds.id] && ds.tables?.length > 0 && (
              <div className="pl-9 pb-1">
                {ds.tables.slice(0, MAX_DISPLAY).map((t) => (
                  <div key={t.id} className="flex items-center gap-2 px-3 py-1">
                    <Table2 size={12} className="text-[#6d6d6d]" />
                    <span className="font-urbanist text-[12px] text-[#6d6d6d] truncate">{t.id}</span>
                  </div>
                ))}
                {ds.tables.length > MAX_DISPLAY && (
                  <div className="px-3 py-1">
                    <span className="font-urbanist text-[11px] text-[#b0b0b0]">
                      +{ds.tables.length - MAX_DISPLAY} more tables
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {datasets.length > MAX_DISPLAY && (
          <div className="px-3 py-2 border-t border-[#e6e6e6]">
            <span className="font-urbanist text-[11px] text-[#b0b0b0]">
              +{datasets.length - MAX_DISPLAY} more datasets
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

/* ===== DETAILED INSTRUCTIONS MODAL ===== */
const SCREENSHOT_BASE = "/assets/bigquery-instructions";

const DetailedInstructionsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.24)] to-[rgba(102,102,102,0.56)]" />

      <div
        className="relative bg-white rounded-[16px] w-[640px] max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#e6e6e6] shrink-0">
          <h2 className="font-urbanist text-[18px] font-semibold text-[#141414]">
            BigQuery Setup Instructions
          </h2>
          <button
            onClick={onClose}
            className="text-[#6d6d6d] hover:text-[#141414] transition-colors"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-6">
            <InstructionStep
              number={1}
              title="Open Google Cloud Console"
              description={
                <>
                  Go to{" "}
                  <a
                    href="https://console.cloud.google.com/iam-admin/serviceaccounts"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1E80EA] underline"
                  >
                    Service Accounts
                  </a>
                  . If prompted, select the correct project from the dropdown at the top.
                </>
              }
            />

            <InstructionStep
              number={2}
              title={<>Click <strong>"+ Create service account"</strong></>}
              screenshot={`${SCREENSHOT_BASE}/bq-step-1-create-service-account.png`}
            />

            <InstructionStep
              number={3}
              title="Fill in account details"
              description={
                <>
                  Enter a name (e.g. <em>Gamepac BigQuery</em>) and an optional description. The Service Account ID auto-fills as you type. Click <strong>Create and continue</strong>.
                </>
              }
              screenshot={`${SCREENSHOT_BASE}/bq-step-2-account-details.png`}
            />

            <InstructionStep
              number={4}
              title="Assign roles"
              description={
                <>
                  Click <strong>"Add another role"</strong> and assign both:
                </>
              }
              screenshot={`${SCREENSHOT_BASE}/bq-step-3-assign-roles.png`}
              note={
                <>
                  Required roles: <strong>BigQuery Data Viewer</strong> (read data) + <strong>BigQuery Job User</strong> (run queries). Do not add Editor or Admin roles.
                </>
              }
            />

            <InstructionStep
              number={5}
              title={<>Skip "Principals with access" and click <strong>Done</strong></>}
              description="Step 3 is optional. Just click Done to finish creating the service account."
              screenshot={`${SCREENSHOT_BASE}/bq-step-4-skip-done.png`}
            />

            <InstructionStep
              number={6}
              title="Click on the newly created account"
              description="You'll see it in the service accounts list. Click on the email to open it."
              screenshot={`${SCREENSHOT_BASE}/bq-step-5-click-account.png`}
            />

            <InstructionStep
              number={7}
              title={<>Go to <strong>Keys</strong> tab → <strong>Add Key</strong> → <strong>Create new key</strong></>}
              screenshot={`${SCREENSHOT_BASE}/bq-step-6-keys-add-key.png`}
            />

            <InstructionStep
              number={8}
              title={<>Select <strong>JSON</strong> key type and click <strong>Create</strong></>}
              description="The JSON file will download to your computer automatically."
              screenshot={`${SCREENSHOT_BASE}/bq-step-7-json-create.png`}
            />

            <InstructionStep
              number={9}
              title="Key downloaded!"
              description="You'll see a confirmation. Now upload this JSON file using the upload button on the previous screen."
              screenshot={`${SCREENSHOT_BASE}/bq-step-8-key-downloaded.png`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e6e6e6] shrink-0 flex flex-col gap-3">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-[8px]">
            <ShieldCheck size={15} className="text-amber-600 shrink-0" />
            <p className="font-urbanist text-[12px] text-amber-700 leading-[17px]">
              Your JSON key is <strong>sensitive</strong>. It is encrypted before storage and never exposed. Keep your local copy secure or delete it if not needed.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#1F6744] text-white rounded-[8px] font-urbanist font-medium text-[14px] hover:opacity-90 transition-opacity"
          >
            Got it, upload my JSON
          </button>
        </div>
      </div>
    </div>
  );
};

const InstructionStep = ({ number, title, description, screenshot, note }) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-start gap-3">
      <div className="size-[24px] rounded-full bg-[#1F6744] text-white flex items-center justify-center shrink-0 font-urbanist font-semibold text-[12px] mt-0.5">
        {number}
      </div>
      <div className="flex-1">
        <p className="font-urbanist font-medium text-[14px] text-[#141414] leading-[20px]">
          {title}
        </p>
        {description && (
          <p className="font-urbanist text-[13px] text-[#6d6d6d] leading-[20px] mt-1">
            {description}
          </p>
        )}
        {note && (
          <div className="mt-2 bg-amber-50 border border-amber-200 rounded-[6px] px-3 py-2">
            <p className="font-urbanist text-[12px] text-amber-700">{note}</p>
          </div>
        )}
      </div>
    </div>
    {screenshot && (
      <div className="ml-9 mt-1 rounded-[8px] border border-[#e6e6e6] overflow-hidden bg-[#f8f9fa]">
        <img
          src={screenshot}
          alt={`Step ${number}`}
          className="w-full h-auto object-contain"
        />
      </div>
    )}
  </div>
);

export default BigQueryConnectionModal;

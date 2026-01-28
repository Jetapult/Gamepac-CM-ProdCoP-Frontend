import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

const jiraIcon = "https://cdn.worldvectorlogo.com/logos/jira-1.svg";

const JiraIssueCard = ({
  project_key: initialProjectKey = "",
  issue_type: initialIssueType = "Task",
  summary: initialSummary = "",
  description: initialDescription = "",
  priority: initialPriority = "Medium",
  labels: initialLabels = [],
  projects = [],
  onSend,
  onCancel,
  onChange,
  onFocus,
  isConnected = false,
  onConnect,
  isLoading = false,
  isConnecting = false,
  isLoadingProjects = false,
}) => {
  const [projectKey, setProjectKey] = useState(initialProjectKey);
  const [issueType, setIssueType] = useState(initialIssueType);
  const [summary, setSummary] = useState(initialSummary);
  const [description, setDescription] = useState(initialDescription);
  const [priority, setPriority] = useState(initialPriority);
  const [labels, setLabels] = useState(initialLabels);
  const [labelInput, setLabelInput] = useState("");
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [projectFilter, setProjectFilter] = useState("");
  const projectDropdownRef = useRef(null);

  // Filter projects based on input
  const filteredProjects = projects.filter((p) =>
    (p.key || p.name || p).toLowerCase().includes(projectFilter.toLowerCase())
  );

  const handleChange = (updates) => {
    onChange?.({
      project_key: projectKey,
      issue_type: issueType,
      summary,
      description,
      priority,
      labels,
      ...updates,
    });
  };

  const handleProjectSelect = (project) => {
    const key = project.key || project;
    setProjectKey(key);
    setProjectFilter("");
    setShowProjectDropdown(false);
    handleChange({ project_key: key });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(e.target)) {
        setShowProjectDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddLabel = (e) => {
    if (e.key === "Enter" && labelInput.trim()) {
      e.preventDefault();
      const newLabels = [...labels, labelInput.trim()];
      setLabels(newLabels);
      setLabelInput("");
      handleChange({ labels: newLabels });
    }
  };

  const handleRemoveLabel = (label) => {
    const newLabels = labels.filter((l) => l !== label);
    setLabels(newLabels);
    handleChange({ labels: newLabels });
  };

  return (
    <div className="bg-white border border-[#f1f1f1] rounded-xl max-w-[600px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[#f1f1f1]">
        <img src={jiraIcon} alt="Jira" className="w-8 h-8 object-contain" />
        <span
          className="text-[16px] font-medium text-[#141414]"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Jira Issue
        </span>
      </div>

      {/* Project Key & Issue Type Row */}
      <div className="flex border-b border-[#f1f1f1]">
        <div className="flex items-center gap-3 px-4 py-3 flex-1 border-r border-[#f1f1f1] relative" ref={projectDropdownRef}>
          <span
            className="text-[14px] text-[#9ca3af] w-16 shrink-0"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            Project
          </span>
          <div className="flex-1 relative">
            <input
              type="text"
              value={projectKey}
              onChange={(e) => { 
                setProjectKey(e.target.value); 
                setProjectFilter(e.target.value);
                setShowProjectDropdown(true);
                handleChange({ project_key: e.target.value }); 
              }}
              onFocus={() => { setShowProjectDropdown(true); onFocus?.(); }}
              placeholder="PROJECT"
              disabled={!isConnected}
              className={`w-full text-[14px] text-[#141414] outline-none bg-transparent ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
              style={{ fontFamily: "Urbanist, sans-serif" }}
            />
            {/* Project Dropdown */}
            {showProjectDropdown && isConnected && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e6e6e6] rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto">
                {isLoadingProjects ? (
                  <div className="px-3 py-2 text-[13px] text-[#9ca3af]" style={{ fontFamily: "Urbanist, sans-serif" }}>
                    Loading projects...
                  </div>
                ) : filteredProjects.length > 0 ? (
                  filteredProjects.map((p) => (
                    <button
                      key={p.id || p.key || p}
                      onClick={() => handleProjectSelect(p)}
                      className="w-full px-3 py-2 text-left text-[14px] text-[#141414] hover:bg-[#f6f7f8] transition-colors"
                      style={{ fontFamily: "Urbanist, sans-serif" }}
                    >
                      <span className="font-medium">{p.key || p}</span>
                      {p.name && <span className="text-[#9ca3af] ml-2">- {p.name}</span>}
                    </button>
                  ))
                ) : projects.length === 0 ? (
                  <div className="px-3 py-2 text-[13px] text-[#9ca3af]" style={{ fontFamily: "Urbanist, sans-serif" }}>
                    No projects available
                  </div>
                ) : (
                  <div className="px-3 py-2 text-[13px] text-[#9ca3af]" style={{ fontFamily: "Urbanist, sans-serif" }}>
                    No matching projects
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 flex-1">
          <span
            className="text-[14px] text-[#9ca3af] w-12 shrink-0"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            Type
          </span>
          <select
            value={issueType}
            onChange={(e) => { setIssueType(e.target.value); handleChange({ issue_type: e.target.value }); }}
            disabled={!isConnected}
            className={`flex-1 text-[14px] text-[#141414] outline-none bg-transparent ${!isConnected ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            <option value="Epic">Epic</option>
            <option value="Story">Story</option>
            <option value="Task">Task</option>
            <option value="Bug">Bug</option>
            <option value="Sub-task">Sub-task</option>
          </select>
        </div>
      </div>

      {/* Summary Field */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f1f1f1]">
        <span
          className="text-[14px] text-[#9ca3af] w-20 shrink-0"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Summary
        </span>
        <input
          type="text"
          value={summary}
          onChange={(e) => { setSummary(e.target.value); handleChange({ summary: e.target.value }); }}
          placeholder="Issue summary..."
          disabled={!isConnected}
          className={`flex-1 text-[14px] text-[#141414] outline-none bg-transparent ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
          style={{ fontFamily: "Urbanist, sans-serif" }}
        />
      </div>

      {/* Priority Field */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f1f1f1]">
        <span
          className="text-[14px] text-[#9ca3af] w-20 shrink-0"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Priority
        </span>
        <select
          value={priority}
          onChange={(e) => { setPriority(e.target.value); handleChange({ priority: e.target.value }); }}
          disabled={!isConnected}
          className={`flex-1 text-[14px] text-[#141414] outline-none bg-transparent ${!isConnected ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          <option value="Highest">Highest</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
          <option value="Lowest">Lowest</option>
        </select>
      </div>

      {/* Labels Field */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f1f1f1]">
        <span
          className="text-[14px] text-[#9ca3af] w-20 shrink-0"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Labels
        </span>
        <div className="flex-1 flex flex-wrap items-center gap-2">
          {labels.map((label) => (
            <div
              key={label}
              className="flex items-center gap-1 px-2 py-1 bg-[#f6f7f8] rounded-md"
            >
              <span
                className="text-[14px] text-[#141414]"
                style={{ fontFamily: "Urbanist, sans-serif" }}
              >
                {label}
              </span>
              <button
                onClick={() => handleRemoveLabel(label)}
                className="text-[#9ca3af] hover:text-[#141414] transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <input
            type="text"
            value={labelInput}
            onChange={(e) => setLabelInput(e.target.value)}
            onKeyDown={handleAddLabel}
            placeholder={labels.length === 0 ? "Add labels..." : ""}
            disabled={!isConnected}
            className={`flex-1 min-w-[100px] text-[14px] text-[#141414] outline-none bg-transparent ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
            style={{ fontFamily: "Urbanist, sans-serif" }}
          />
        </div>
      </div>

      {/* Description Field */}
      <div className="flex items-start gap-3 px-4 py-4 border-b border-[#f1f1f1]">
        <span
          className="text-[14px] text-[#9ca3af] w-20 shrink-0 pt-0.5"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Description
        </span>
        <textarea
          value={description}
          onChange={(e) => { setDescription(e.target.value); handleChange({ description: e.target.value }); }}
          placeholder="Enter issue description..."
          rows={5}
          disabled={!isConnected}
          className={`flex-1 text-[14px] text-[#141414] leading-[22px] outline-none bg-transparent resize-none ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
          style={{ fontFamily: "Urbanist, sans-serif" }}
        />
      </div>

      {/* Not connected warning */}
      {!isConnected && (
        <div className="px-4 py-3 bg-[#fffbeb] border-b border-[#f1f1f1]">
          <p
            className="text-[13px] text-[#f59e0b] flex items-center gap-1"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            You're not connected to Jira
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 p-4">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-[14px] font-medium text-[#141414] bg-white border border-[#e6e6e6] rounded-lg hover:bg-[#f6f6f6] transition-colors disabled:opacity-50"
          style={{ fontFamily: "Urbanist, sans-serif" }}
        >
          Cancel
        </button>
        {isConnected ? (
          <button
            onClick={() => onSend?.({ project_key: projectKey, issue_type: issueType, summary, description, priority, labels })}
            disabled={isLoading}
            className="px-4 py-2 text-[14px] font-medium text-white bg-[#1f6744] rounded-lg hover:bg-[#185a3a] transition-colors disabled:opacity-50"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            {isLoading ? "Creating..." : "Create Issue"}
          </button>
        ) : (
          <button
            onClick={onConnect}
            disabled={isLoading || isConnecting}
            className="px-4 py-2 text-[14px] font-medium text-white bg-[#3b82f6] rounded-lg hover:bg-[#2563eb] transition-colors disabled:opacity-50 flex items-center gap-1"
            style={{ fontFamily: "Urbanist, sans-serif" }}
          >
            {isConnecting ? (
              "Connecting..."
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                Connect Jira
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default JiraIssueCard;

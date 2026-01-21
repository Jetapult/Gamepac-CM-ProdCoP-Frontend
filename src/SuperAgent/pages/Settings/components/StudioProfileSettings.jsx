import React, { useState, useEffect, useRef } from "react";
import { AltArrowDown, AltArrowUp, CloseCircle, Link } from "@solar-icons/react";
import { X } from "lucide-react";
import api from "../../../../api";

// Collapsible Section Component
const CollapsibleSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-[#f6f6f6] rounded-xl bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-5"
      >
        <h4 className="font-urbanist font-semibold text-[16px] text-[#141414]">
          {title}
        </h4>
        {isOpen ? (
          <AltArrowUp weight="Linear" size={20} color="#6d6d6d" />
        ) : (
          <AltArrowDown weight="Linear" size={20} color="#6d6d6d" />
        )}
      </button>
      {isOpen && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
};

// Multi-select Dropdown Component
const MultiSelectDropdown = ({
  label,
  tabBackgroundColor = "#FFF8ED",
  tabTextColor = "#9E7300",
  options,
  selectedValues,
  onSelect,
  onRemove,
  placeholder,
  allowCustom = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddCustom = () => {
    if (customValue.trim() && !selectedValues.includes(customValue.trim())) {
      onSelect(customValue.trim());
      setCustomValue("");
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-urbanist text-xs text-[#b0b0b0]">{label}</label>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between w-full min-h-[44px] px-3 py-2 bg-white border rounded-lg transition-colors ${
            isOpen ? "border-[#1f6744]" : "border-[#E7EAEE]"
          }`}
        >
          <div className="flex items-center gap-2 flex-wrap flex-1">
            {selectedValues.length > 0 ? (
              selectedValues.map((value) => (
                <span
                  key={value}
                  className="flex items-center gap-1 px-3 py-1 rounded-full"
                  style={{ backgroundColor: tabBackgroundColor }}
                >
                  <span
                    className="font-urbanist font-medium text-[12px]"
                    style={{ color: tabTextColor }}
                  >
                    {value}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(value);
                    }}
                    className="text-[#6d6d6d]"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))
            ) : (
              <span className="font-urbanist text-[14px] text-[#b0b0b0]">
                {placeholder}
              </span>
            )}
          </div>
          <AltArrowDown
            weight="Linear"
            size={16}
            color="#6D6D6D"
            className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="absolute left-0 top-full mt-1 w-full bg-white border border-[#f6f6f6] rounded-lg shadow-lg z-50 max-h-[250px] overflow-y-auto">
            {options
              .filter((opt) => !selectedValues.includes(opt))
              .map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onSelect(option);
                    setIsOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2.5 hover:bg-[#f6f6f6] transition-colors text-left"
                >
                  <span className="font-urbanist text-[14px] text-[#141414]">
                    {option}
                  </span>
                </button>
              ))}
            {allowCustom && (
              <div className="border-t border-[#f6f6f6] p-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustom();
                      }
                    }}
                    placeholder="Add custom..."
                    className="flex-1 px-2 py-1.5 border border-[#E7EAEE] rounded text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustom}
                    className="px-3 py-1.5 bg-[#1f6744] text-white text-sm rounded hover:bg-[#1a5a3a]"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Select Dropdown Component
const SelectDropdown = ({ label, options, value, onChange, placeholder, required }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-urbanist text-xs text-[#b0b0b0]">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between w-full h-[44px] px-3 py-2 bg-white border rounded-lg transition-colors ${
            isOpen ? "border-[#1f6744]" : "border-[#E7EAEE]"
          }`}
        >
          <span
            className={`font-urbanist text-[14px] ${
              value ? "text-[#141414]" : "text-[#b0b0b0]"
            }`}
          >
            {value || placeholder}
          </span>
          <AltArrowDown
            weight="Linear"
            size={16}
            color="#6D6D6D"
            className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="absolute left-0 top-full mt-1 w-full bg-white border border-[#f6f6f6] rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`flex items-center w-full px-3 py-2.5 hover:bg-[#f6f6f6] transition-colors text-left ${
                  value === option ? "bg-[#f6f6f6]" : ""
                }`}
              >
                <span className="font-urbanist text-[14px] text-[#141414]">
                  {option}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Input Field Component
const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  error,
  min,
  max,
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="font-urbanist text-xs text-[#b0b0b0]">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      max={max}
      className={`px-3 py-2.5 border rounded-lg font-urbanist text-sm text-[#141414] placeholder:text-[#B0B0B0] focus:outline-none transition-colors ${
        error ? "border-[#f25a5a]" : "border-[#E7EAEE] focus:border-[#1F6744]"
      }`}
    />
    {error && <span className="text-xs text-[#f25a5a]">{error}</span>}
  </div>
);

// Textarea Field Component
const TextareaField = ({ label, value, onChange, placeholder, rows = 3 }) => (
  <div className="flex flex-col gap-1.5">
    <label className="font-urbanist text-xs text-[#b0b0b0]">{label}</label>
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="px-3 py-2.5 border border-[#E7EAEE] rounded-lg font-urbanist text-sm text-[#141414] placeholder:text-[#B0B0B0] focus:outline-none focus:border-[#1F6744] transition-colors resize-none"
    />
  </div>
);

// Checkbox Field Component
const CheckboxField = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <div
      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
        checked ? "bg-[#1f6744] border-[#1f6744]" : "border-[#E7EAEE]"
      }`}
      onClick={onChange}
    >
      {checked && (
        <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
          <path
            d="M1 4L4.5 7.5L11 1"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
    <span className="font-urbanist text-sm text-[#141414]">{label}</span>
  </label>
);

// Options data
const ART_CAPABILITIES_OPTIONS = [
  "2D",
  "3D",
  "Concept Art",
  "UI/UX",
  "Animation",
  "VFX",
  "Pixel Art",
  "Motion Graphics",
];

const GENRE_OPTIONS = [
  "Casual",
  "Puzzle",
  "Runner",
  "Slots",
  "RPG",
  "Strategy",
  "Action",
  "Adventure",
  "Simulation",
  "Sports",
  "Idle",
  "Match-3",
  "Battle Royale",
  "Auto-battler",
  "Hypercasual",
];

const ENGINE_OPTIONS = [
  "Unity",
  "Unreal Engine",
  "Godot",
  "GameMaker Studio",
  "Construct 3",
  "Defold",
  "Custom Engine",
  "Web Technologies",
  "Flutter",
  "Cocos2d",
  "RPG Maker",
];

const MONETIZATION_OPTIONS = [
  "Ads",
  "IAP",
  "Hybrid",
  "Premium",
  "Subscription",
  "Battle Pass",
  "Freemium",
];

const ANALYTICS_OPTIONS = [
  "Google Analytics",
  "Firebase",
  "GameAnalytics",
  "Unity Analytics",
  "Amplitude",
  "Mixpanel",
  "Flurry",
  "Custom Solution",
];

const BUDGET_RANGE_OPTIONS = [
  "Negligible (experimental)",
  "$1K-$10K",
  "$10K-$50K",
  "$50K-$100K",
  "$100K+",
  "$500K+",
  "$1M+",
];

const SCORE_OPTIONS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

const StudioProfileSettings = ({ studioData }) => {
  const [formData, setFormData] = useState({
    team_size_total: "",
    location: "",
    no_of_artists: "",
    no_of_devs: "",
    no_of_designers: "",
    no_of_pm: "",
    preferred_engine: "",
    engine_proficiency: "",
    art_2d_ui_score: "",
    art_3d_score: "",
    art_capabilities: [],
    backend_proficiency: false,
    genres_worked_on: [],
    future_genres: [],
    future_monetization: "",
    ads_proficiency_score: "",
    iap_score: "",
    current_games: "",
    timeline_goals: "",
    analytics_tools: [],
    ua_budget_range: "",
    ua_score: "",
    paid_acquisition_phase: "",
    studio_context: "",
    additional_notes: "",
  });

  const [publishedGameLinks, setPublishedGameLinks] = useState([]);
  const [newGameLink, setNewGameLink] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Parse array field helper
  const parseArrayField = (field) => {
    if (!field) return [];
    if (Array.isArray(field)) {
      return field.map((item) => {
        if (typeof item === "string" && item.startsWith('"') && item.endsWith('"')) {
          return item.slice(1, -1);
        }
        return item;
      }).filter(Boolean);
    }
    if (typeof field === "string") {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [field];
      }
    }
    return [];
  };

  // Fetch existing data
  useEffect(() => {
    const fetchOnboardingData = async () => {
      if (!studioData?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get(
          `/v1/game-studios/external-studio/onboarding/${studioData.id}`
        );
        if (response.data.data) {
          const data = response.data.data;
          setFormData({
            team_size_total: data.team_size_total || "",
            location: data.location || "",
            no_of_artists: data.no_of_artists || "",
            no_of_devs: data.no_of_devs || "",
            no_of_designers: data.no_of_designers || "",
            no_of_pm: data.no_of_pm || "",
            preferred_engine: data.preferred_engine || "",
            engine_proficiency: data.engine_proficiency?.toString() || "",
            art_2d_ui_score: data.art_2d_ui_score?.toString() || "",
            art_3d_score: data.art_3d_score?.toString() || "",
            art_capabilities: parseArrayField(data.art_capabilities),
            backend_proficiency: data.backend_proficiency || false,
            genres_worked_on: parseArrayField(data.genres_worked_on),
            future_genres: parseArrayField(data.future_genres),
            future_monetization: data.future_monetization || "",
            ads_proficiency_score: data.ads_proficiency_score?.toString() || "",
            iap_score: data.iap_score?.toString() || "",
            current_games: data.current_games || "",
            timeline_goals: data.timeline_goals || "",
            analytics_tools: parseArrayField(data.analytics_tools),
            ua_budget_range: data.ua_budget_range || "",
            ua_score: data.ua_score?.toString() || "",
            paid_acquisition_phase: data.paid_acquisition_phase || "",
            studio_context: data.studio_context || "",
            additional_notes: data.additional_notes || "",
          });

          // Parse published titles
          if (data.published_titles) {
            if (Array.isArray(data.published_titles)) {
              setPublishedGameLinks(
                data.published_titles.filter((link) => link && typeof link === "string")
              );
            } else if (typeof data.published_titles === "string") {
              setPublishedGameLinks([data.published_titles]);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching onboarding data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOnboardingData();
  }, [studioData?.id]);

  // Auto-hide toast
  useEffect(() => {
    if (toastMessage?.show) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleArraySelect = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], value],
    }));
  };

  const handleArrayRemove = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((v) => v !== value),
    }));
  };

  const handleAddGameLink = () => {
    const trimmedLink = newGameLink.trim();
    if (trimmedLink && !publishedGameLinks.includes(trimmedLink)) {
      setPublishedGameLinks((prev) => [...prev, trimmedLink]);
      setNewGameLink("");
    }
  };

  const handleRemoveGameLink = (index) => {
    setPublishedGameLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.team_size_total) newErrors.team_size_total = "Team size is required";
    if (!formData.location) newErrors.location = "Location is required";
    if (!formData.preferred_engine) newErrors.preferred_engine = "Preferred engine is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const submitData = {
        ...formData,
        studio_id: studioData.id,
        published_titles: publishedGameLinks.length > 0 ? publishedGameLinks : null,
        team_size_total: parseInt(formData.team_size_total) || null,
        no_of_artists: formData.no_of_artists ? parseInt(formData.no_of_artists) : null,
        no_of_devs: formData.no_of_devs ? parseInt(formData.no_of_devs) : null,
        no_of_designers: formData.no_of_designers ? parseInt(formData.no_of_designers) : null,
        no_of_pm: formData.no_of_pm ? parseInt(formData.no_of_pm) : null,
        engine_proficiency: formData.engine_proficiency ? parseInt(formData.engine_proficiency) : null,
        art_2d_ui_score: formData.art_2d_ui_score ? parseInt(formData.art_2d_ui_score) : null,
        art_3d_score: formData.art_3d_score ? parseInt(formData.art_3d_score) : null,
        ads_proficiency_score: formData.ads_proficiency_score ? parseInt(formData.ads_proficiency_score) : null,
        iap_score: formData.iap_score ? parseInt(formData.iap_score) : null,
        ua_score: formData.ua_score ? parseInt(formData.ua_score) : null,
      };

      const response = await api.put(
        `/v1/game-studios/external-studio/onboarding/${studioData.id}`,
        submitData
      );

      if (response.status === 200) {
        setToastMessage({
          show: true,
          message: "Studio profile updated successfully",
          type: "success",
        });
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setToastMessage({
        show: true,
        message: err.response?.data?.message || "Error updating profile",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <h3 className="font-urbanist font-semibold text-[18px] text-[#141414]">
          Studio profile
        </h3>
        <div className="flex items-center justify-center py-12">
          <span className="font-urbanist text-sm text-[#6d6d6d]">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-urbanist font-semibold text-[18px] text-[#141414]">
          Studio profile
        </h3>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-10 py-2 bg-[#1f6744] text-white font-urbanist font-medium text-[14px] rounded-lg hover:bg-[#1a5a3a] transition-colors disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Team Information */}
      <CollapsibleSection title="Team information">
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Team size"
            type="number"
            value={formData.team_size_total}
            onChange={(e) => handleInputChange("team_size_total", e.target.value)}
            placeholder="20"
            required
            error={errors.team_size_total}
            min="1"
          />
          <InputField
            label="Location"
            value={formData.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            placeholder="Bangalore, India"
            required
            error={errors.location}
          />
          <InputField
            label="Number of artists"
            type="number"
            value={formData.no_of_artists}
            onChange={(e) => handleInputChange("no_of_artists", e.target.value)}
            placeholder="13"
            min="0"
          />
          <InputField
            label="Number of developers"
            type="number"
            value={formData.no_of_devs}
            onChange={(e) => handleInputChange("no_of_devs", e.target.value)}
            placeholder="12"
            min="0"
          />
          <InputField
            label="Number of designers"
            type="number"
            value={formData.no_of_designers}
            onChange={(e) => handleInputChange("no_of_designers", e.target.value)}
            placeholder="13"
            min="0"
          />
          <InputField
            label="Number of project managers"
            type="number"
            value={formData.no_of_pm}
            onChange={(e) => handleInputChange("no_of_pm", e.target.value)}
            placeholder="12"
            min="0"
          />
        </div>
      </CollapsibleSection>

      {/* Technical Capabilities */}
      <CollapsibleSection title="Technical Capabilities">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <SelectDropdown
              label="Programming engine"
              options={ENGINE_OPTIONS}
              value={formData.preferred_engine}
              onChange={(value) => handleInputChange("preferred_engine", value)}
              placeholder="Select engine"
              required
            />
            <SelectDropdown
              label="English proficiency (0-10)"
              options={SCORE_OPTIONS}
              value={formData.engine_proficiency}
              onChange={(value) => handleInputChange("engine_proficiency", value)}
              placeholder="Select score"
            />
            <InputField
              label="Number of artists"
              type="number"
              value={formData.no_of_artists}
              onChange={(e) => handleInputChange("no_of_artists", e.target.value)}
              placeholder="13"
              min="0"
            />
            <InputField
              label="Number of developers"
              type="number"
              value={formData.no_of_devs}
              onChange={(e) => handleInputChange("no_of_devs", e.target.value)}
              placeholder="12"
              min="0"
            />
            <SelectDropdown
              label="2D Art and UI Score (0-10)"
              options={SCORE_OPTIONS}
              value={formData.art_2d_ui_score}
              onChange={(value) => handleInputChange("art_2d_ui_score", value)}
              placeholder="Select score"
            />
            <SelectDropdown
              label="3D art score (0-10)"
              options={SCORE_OPTIONS}
              value={formData.art_3d_score}
              onChange={(value) => handleInputChange("art_3d_score", value)}
              placeholder="Select score"
            />
          </div>

          <MultiSelectDropdown
            label="Art capabilities"
            options={ART_CAPABILITIES_OPTIONS}
            selectedValues={formData.art_capabilities}
            onSelect={(value) => handleArraySelect("art_capabilities", value)}
            onRemove={(value) => handleArrayRemove("art_capabilities", value)}
            placeholder="Select capabilities"
            allowCustom
            tabBackgroundColor="#edfbfe"
            tabTextColor="#1976d2"
          />

          <CheckboxField
            label="Backend proficiency"
            checked={formData.backend_proficiency}
            onChange={() =>
              handleInputChange("backend_proficiency", !formData.backend_proficiency)
            }
          />
        </div>
      </CollapsibleSection>

      {/* Game Development Experience */}
      <CollapsibleSection title="Game development experience">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <MultiSelectDropdown
              label="Genres worked on"
              options={GENRE_OPTIONS}
              selectedValues={formData.genres_worked_on}
              onSelect={(value) => handleArraySelect("genres_worked_on", value)}
              onRemove={(value) => handleArrayRemove("genres_worked_on", value)}
              placeholder="Select genres"
              allowCustom
            />
            <MultiSelectDropdown
              label="Future genres"
              options={GENRE_OPTIONS}
              selectedValues={formData.future_genres}
              onSelect={(value) => handleArraySelect("future_genres", value)}
              onRemove={(value) => handleArrayRemove("future_genres", value)}
              placeholder="Select genres"
              allowCustom
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SelectDropdown
              label="Future monetization strategy"
              options={MONETIZATION_OPTIONS}
              value={formData.future_monetization}
              onChange={(value) => handleInputChange("future_monetization", value)}
              placeholder="Select strategy"
            />
            <InputField
              label="Ads monetization score"
              type="number"
              value={formData.ads_proficiency_score}
              onChange={(e) => handleInputChange("ads_proficiency_score", e.target.value)}
              placeholder="12"
              min="0"
              max="10"
            />
          </div>

          <SelectDropdown
            label="IAP monetization Score"
            options={SCORE_OPTIONS}
            value={formData.iap_score}
            onChange={(value) => handleInputChange("iap_score", value)}
            placeholder="Select score"
          />

          <TextareaField
            label="What kind of projects are you working on right now?"
            value={formData.current_games}
            onChange={(e) => handleInputChange("current_games", e.target.value)}
            placeholder="Basic MVP game"
          />

          {/* Published Links */}
          <div className="flex flex-col gap-1.5">
            <label className="font-urbanist text-xs text-[#b0b0b0]">
              Published link
            </label>
            <div className="flex flex-col gap-2">
              {publishedGameLinks.map((link, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 bg-[#f6f6f6] rounded-lg"
                >
                  <Link weight="Linear" size={16} color="#6d6d6d" />
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 font-urbanist text-sm text-[#1f6744] hover:underline truncate"
                  >
                    {link}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRemoveGameLink(index)}
                    className="p-0.5 hover:bg-[#E7EAEE] rounded"
                  >
                    <X size={14} color="#6d6d6d" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2 px-3 py-2.5 border border-[#E7EAEE] rounded-lg">
                <Link weight="Linear" size={16} color="#b0b0b0" />
                <input
                  type="url"
                  value={newGameLink}
                  onChange={(e) => setNewGameLink(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddGameLink();
                    }
                  }}
                  placeholder="Add link of Play Store, App Store etc."
                  className="flex-1 font-urbanist text-sm text-[#141414] placeholder:text-[#B0B0B0] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <TextareaField
            label="What is your expected timeline to complete the current project?"
            value={formData.timeline_goals}
            onChange={(e) => handleInputChange("timeline_goals", e.target.value)}
            placeholder="Launch a basic MVP by December 2025"
          />
        </div>
      </CollapsibleSection>

      {/* Analytics and User Acquisition */}
      <CollapsibleSection title="Analytics and user acquisition">
        <div className="flex flex-col gap-4">
          <MultiSelectDropdown
            label="Analytics platforms"
            options={ANALYTICS_OPTIONS}
            selectedValues={formData.analytics_tools}
            onSelect={(value) => handleArraySelect("analytics_tools", value)}
            onRemove={(value) => handleArrayRemove("analytics_tools", value)}
            placeholder="Select platforms"
            allowCustom
            tabBackgroundColor="#E5FFF2"
            tabTextColor="#036835"
          />

          <div className="grid grid-cols-2 gap-4">
            <SelectDropdown
              label="UAP Budget range"
              options={BUDGET_RANGE_OPTIONS}
              value={formData.ua_budget_range}
              onChange={(value) => handleInputChange("ua_budget_range", value)}
              placeholder="Select range"
            />
            <InputField
              label="UA capacity (0-10)"
              type="number"
              value={formData.ua_score}
              onChange={(e) => handleInputChange("ua_score", e.target.value)}
              placeholder="12"
              min="0"
              max="10"
            />
          </div>

          <InputField
            label="Paid acquisition phase"
            value={formData.paid_acquisition_phase}
            onChange={(e) => handleInputChange("paid_acquisition_phase", e.target.value)}
            placeholder="12"
          />
        </div>
      </CollapsibleSection>

      {/* Additional Information */}
      <CollapsibleSection title="Additional information">
        <div className="flex flex-col gap-4">
          <TextareaField
            label="What is your expected timeline to complete the current project?"
            value={formData.studio_context}
            onChange={(e) => handleInputChange("studio_context", e.target.value)}
            placeholder="The studio has a five-member team, proficient in Unity..."
            rows={4}
          />

          <TextareaField
            label="Additional information"
            value={formData.additional_notes}
            onChange={(e) => handleInputChange("additional_notes", e.target.value)}
            placeholder="12"
          />
        </div>
      </CollapsibleSection>

      {/* Toast Message */}
      {toastMessage?.show && (
        <div
          className={`fixed bottom-5 right-5 px-4 py-3 rounded-lg shadow-lg z-50 ${
            toastMessage.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          <p className="font-urbanist text-[14px]">{toastMessage.message}</p>
        </div>
      )}
    </div>
  );
};

export default StudioProfileSettings;

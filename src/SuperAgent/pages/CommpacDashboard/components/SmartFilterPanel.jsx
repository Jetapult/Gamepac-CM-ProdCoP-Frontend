import React, { useState, useRef, useEffect } from "react";
import { AltArrowDown, AltArrowUp, CloseCircle } from "@solar-icons/react";
import api from "../../../../api";
import { ratingFilter, replyStateFilter, TerritoryCode, responseStateFilter } from "../../../../constants/organicUA";
import Checkbox from "./Checkbox";
import RadioButton from "./RadioButton";
import StarRating from "./StarRating";
import MultiSelectDropdown from "./MultiSelectDropdown";
import SingleSelectDropdown from "./SingleSelectDropdown";

const SmartFilterPanel = ({
  filters,
  setFilters,
  selectedGame,
  ContextStudioData,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    os: true,
    rating: true,
    language: true,
    version: true,
    tags: true,
    orderBy: true,
    replyState: true,
    territory: true,
    responseState: true,
  });
  const [openDropdowns, setOpenDropdowns] = useState({
    language: false,
    version: false,
    tags: false,
    orderBy: false,
    territory: false,
    responseState: false,
  });
  const [languages, setLanguages] = useState([]);
  const [tags, setTags] = useState([]);
  const [versionList, setVersionList] = useState([]);

  const languageRef = useRef(null);
  const versionRef = useRef(null);
  const tagsRef = useRef(null);
  const orderByRef = useRef(null);
  const territoryRef = useRef(null);
  const responseStateRef = useRef(null);

  // Fetch languages and tags
  useEffect(() => {
    const fetchAllLanguages = async () => {
      try {
        const languageResponse = await api.get(`v1/organic-ua/languages`);
        const languagesData = [];
        languageResponse.data.data.forEach((x, index) => {
          languagesData.push({ id: index, label: x, value: x });
        });
        setLanguages(languagesData);
      } catch (err) {
        console.log(err);
      }
    };

    const fetchAllTags = async () => {
      try {
        const tagsResponse = await api.get(`v1/organic-ua/tags`);
        const tagsData = [];
        tagsResponse.data.data.forEach((x, index) => {
          tagsData.push({ id: index, label: x, value: x });
        });
        setTags(tagsData);
      } catch (err) {
        console.log(err);
      }
    };

    if (ContextStudioData?.id) {
      fetchAllLanguages();
      fetchAllTags();
    }
  }, [ContextStudioData?.id]);

  // Fetch versions when game is selected
  useEffect(() => {
    const fetchAllVersions = async () => {
      if (selectedGame?.id && ContextStudioData?.id) {
        try {
          const versionResponse = await api.get(
            `v1/organic-ua/versions/${ContextStudioData?.id}/${selectedGame.id}`
          );
          const versionsArr = [];
          versionResponse.data.data.forEach((x, index) => {
            versionsArr.push({ id: index, label: x, value: x });
          });
          setVersionList(versionsArr);
        } catch (err) {
          console.log(err);
        }
      }
    };

    fetchAllVersions();
  }, [selectedGame?.id, ContextStudioData?.id]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setOpenDropdowns((prev) => ({ ...prev, language: false }));
      }
      if (versionRef.current && !versionRef.current.contains(event.target)) {
        setOpenDropdowns((prev) => ({ ...prev, version: false }));
      }
      if (tagsRef.current && !tagsRef.current.contains(event.target)) {
        setOpenDropdowns((prev) => ({ ...prev, tags: false }));
      }
      if (orderByRef.current && !orderByRef.current.contains(event.target)) {
        setOpenDropdowns((prev) => ({ ...prev, orderBy: false }));
      }
      if (territoryRef.current && !territoryRef.current.contains(event.target)) {
        setOpenDropdowns((prev) => ({ ...prev, territory: false }));
      }
      if (responseStateRef.current && !responseStateRef.current.contains(event.target)) {
        setOpenDropdowns((prev) => ({ ...prev, responseState: false }));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleDropdown = (dropdown) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [dropdown]: !prev[dropdown],
    }));
  };

  // Order By options
    const orderByOptions = [
      {
        id: "1",
        label: "Highest Rating",
        value:
          filters.os === "android"
            ? "userrating DESC"
            : "rating DESC",
      },
      {
        id: "2",
        label: "Lowest Rating",
        value: filters.os === "android" ? "userrating" : "rating",
      },
      {
        id: "3",
        label: "Most Recent Reply",
        value:
          filters.os === "android" ? "posteddate" : "latestResponse",
      },
    ];

  return (
    <div className="bg-white border border-[#e7eaee] rounded-[10px] w-[332px] flex flex-col shrink-0 h-[calc(100vh-120px)] overflow-y-auto">
      <div className="flex flex-col gap-[18px] items-center pt-[15px] pb-0 px-4">
        <div className="w-[300px] flex flex-col gap-6">
          <h2 className="font-gilroy font-semibold text-lg text-[#30333b]">
            Smart Filter
          </h2>

          {/* Search */}
          <div className="flex flex-col gap-4">
            <div className="bg-white flex items-center gap-2 h-9 px-3 py-1.5 rounded-md shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06),0px_0px_0px_1px_rgba(104,113,130,0.16)]">
              <input
                type="text"
                placeholder="Search by Review text"
                className="flex-1 font-gilroy text-sm text-[#141414] placeholder:text-[#a1a9b8] outline-none"
                value={filters.searchText}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    searchText: e.target.value,
                  }))
                }
              />
              {filters.searchText && (
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, searchText: "" }))
                  }
                  className="flex items-center justify-center hover:opacity-70 transition-opacity"
                  aria-label="Clear search"
                >
                  <CloseCircle size={16} color="#6d6d6d" weight="Bold" />
                </button>
              )}
            </div>
            <div className="h-px bg-[#e7eaee]" />
          </div>

          {/* Operating System */}
          <div className="border-b border-[#e7eaee] pb-4">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("os")}
            >
              <span className="font-urbanist font-medium text-sm text-[#141414]">
                Operating System
              </span>
              <div className="flex items-center gap-2">
                {expandedSections.os ? (
                  <AltArrowUp size={20} color="#6d6d6d" weight="Linear" />
                ) : (
                  <AltArrowDown size={20} color="#6d6d6d" weight="Linear" />
                )}
              </div>
            </div>
            {expandedSections.os && (
              <div className="flex gap-8 mt-4">
                <label className="flex items-center gap-[11px] cursor-pointer">
                  <RadioButton
                    checked={filters.os === "ios"}
                    onChange={() =>
                      setFilters((prev) => ({
                        ...prev,
                        os: "ios",
                      }))
                    }
                  />
                  <span className="font-urbanist text-xs text-[#141414]">
                    iOS
                  </span>
                </label>
                <label className="flex items-center gap-[11px] cursor-pointer">
                  <RadioButton
                    checked={filters.os === "android"}
                    onChange={() =>
                      setFilters((prev) => ({
                        ...prev,
                        os: "android",
                      }))
                    }
                  />
                  <span className="font-urbanist text-xs text-[#141414]">
                    Android
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Review Rating */}
          <div className="border-b border-[#e7eaee] pb-4">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("rating")}
            >
              <span className="font-gilroy font-medium text-sm text-black">
                Review Rating
              </span>
              <div className="flex items-center gap-2">
                {filters.ratings && filters.ratings.length > 0 && (
                  <span
                    className="font-urbanist text-xs text-[#6d6d6d] cursor-pointer hover:text-[#141414]"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFilters((prev) => ({ ...prev, ratings: [] }));
                    }}
                  >
                    Clear
                  </span>
                )}
                {expandedSections.rating ? (
                  <AltArrowUp size={20} color="#6d6d6d" weight="Linear" />
                ) : (
                  <AltArrowDown size={20} color="#6d6d6d" weight="Linear" />
                )}
              </div>
            </div>
            {expandedSections.rating && (
              <div className="flex flex-col gap-[11px] mt-2.5">
                {[...ratingFilter].reverse().map((rate) => {
                  const rating = parseInt(rate.name);
                  return (
                    <label
                      key={rate.id}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <Checkbox
                        checked={filters.ratings.includes(rating)}
                        onChange={(checked) =>
                          setFilters((prev) => ({
                            ...prev,
                            ratings: checked
                              ? [...prev.ratings, rating]
                              : prev.ratings.filter((r) => r !== rating),
                          }))
                        }
                      />
                      <div className="flex items-center gap-2.5">
                        <StarRating rating={rating} />
                        <span className="font-urbanist font-medium text-xs text-[#141414]">
                          {rating} Stars
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Language Dropdown - Only for Android */}
          {filters.os === "android" && (
            <div className="border-b border-[#e7eaee] pb-4">
              <div
                className="flex items-center justify-between cursor-pointer mb-3"
                onClick={() => toggleSection("language")}
              >
                <span className="font-urbanist text-sm text-black">Language</span>
                {expandedSections.language ? (
                  <AltArrowUp size={20} color="#6d6d6d" weight="Linear" />
                ) : (
                  <AltArrowDown size={20} color="#6d6d6d" weight="Linear" />
                )}
              </div>
              {expandedSections.language && (
                <MultiSelectDropdown
                  label=""
                  placeholder="Select..."
                  options={languages}
                  selectedValues={filters.languages || []}
                  onSelect={(option) => {
                    setFilters((prev) => ({
                      ...prev,
                      languages: [...(prev.languages || []), option],
                    }));
                  }}
                  onRemove={(item) => {
                    setFilters((prev) => ({
                      ...prev,
                      languages:
                        prev.languages?.filter((l) => l.value !== item.value) ||
                        [],
                    }));
                  }}
                  isOpen={openDropdowns.language}
                  onToggle={() => toggleDropdown("language")}
                  dropdownRef={languageRef}
                />
              )}
            </div>
          )}

          {/* Version Dropdown - Only for Android */}
          {filters.os === "android" && (
            <div className="border-b border-[#e7eaee] pb-4">
              <div
                className="flex items-center justify-between cursor-pointer mb-3"
                onClick={() => toggleSection("version")}
              >
                <span className="font-urbanist text-sm text-black">Version</span>
                {expandedSections.version ? (
                  <AltArrowUp size={20} color="#6d6d6d" weight="Linear" />
                ) : (
                  <AltArrowDown size={20} color="#6d6d6d" weight="Linear" />
                )}
              </div>
              {expandedSections.version && (
                <MultiSelectDropdown
                  label=""
                  placeholder="Select version"
                  options={versionList}
                  selectedValues={filters.versions || []}
                  onSelect={(option) => {
                    setFilters((prev) => ({
                      ...prev,
                      versions: [...(prev.versions || []), option],
                    }));
                  }}
                  onRemove={(item) => {
                    setFilters((prev) => ({
                      ...prev,
                      versions:
                        prev.versions?.filter((v) => v.value !== item.value) ||
                        [],
                    }));
                  }}
                  isOpen={openDropdowns.version}
                  onToggle={() => toggleDropdown("version")}
                  dropdownRef={versionRef}
                />
              )}
            </div>
          )}

          {/* Territory Dropdown - Only for iOS */}
          {filters.os === "ios" && (
            <div className="border-b border-[#e7eaee] pb-4">
              <div
                className="flex items-center justify-between cursor-pointer mb-3"
                onClick={() => toggleSection("territory")}
              >
                <span className="font-urbanist text-sm text-black">Territory</span>
                {expandedSections.territory ? (
                  <AltArrowUp size={20} color="#6d6d6d" weight="Linear" />
                ) : (
                  <AltArrowDown size={20} color="#6d6d6d" weight="Linear" />
                )}
              </div>
              {expandedSections.territory && (
                <SingleSelectDropdown
                  label=""
                  placeholder="Select territory"
                  options={TerritoryCode}
                  selectedValue={filters.territory || null}
                  onSelect={(option) => {
                    setFilters((prev) => ({ ...prev, territory: option }));
                  }}
                  onRemove={() => {
                    setFilters((prev) => ({ ...prev, territory: null }));
                  }}
                  isOpen={openDropdowns.territory}
                  onToggle={() => toggleDropdown("territory")}
                  dropdownRef={territoryRef}
                />
              )}
            </div>
          )}

          {/* Response State - Only for iOS */}
          {filters.os === "ios" && (
            <div className="border-b border-[#e7eaee] pb-4">
              <div
                className="flex items-center justify-between cursor-pointer mb-3"
                onClick={() => toggleSection("responseState")}
              >
                <span className="font-urbanist text-sm text-black">
                  Response State
                </span>
                {expandedSections.responseState ? (
                  <AltArrowUp size={20} color="#6d6d6d" weight="Linear" />
                ) : (
                  <AltArrowDown size={20} color="#6d6d6d" weight="Linear" />
                )}
              </div>
              {expandedSections.responseState && (
                <div className="flex items-center justify-between mt-3 w-[233px]">
                  {responseStateFilter.map((state) => (
                    <label
                      key={state.id}
                      className="flex items-center gap-[11px] cursor-pointer"
                    >
                      <RadioButton
                        checked={filters.responseState === state.value}
                        onChange={() =>
                          setFilters((prev) => ({
                            ...prev,
                            responseState:
                              prev.responseState === state.value ? "" : state.value,
                          }))
                        }
                      />
                      <span className="font-urbanist text-xs text-black">
                        {state.name}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tags Dropdown */}
          <div className="border-b border-[#e7eaee] pb-4">
            <div
              className="flex items-center justify-between cursor-pointer mb-3"
              onClick={() => toggleSection("tags")}
            >
              <span className="font-urbanist text-sm text-black">Tags</span>
              {expandedSections.tags ? (
                <AltArrowUp size={20} color="#6d6d6d" weight="Linear" />
              ) : (
                <AltArrowDown size={20} color="#6d6d6d" weight="Linear" />
              )}
            </div>
            {expandedSections.tags && (
              <MultiSelectDropdown
                label=""
                placeholder="Select Tags"
                options={tags}
                selectedValues={filters.tags || []}
                onSelect={(option) => {
                  setFilters((prev) => ({
                    ...prev,
                    tags: [...(prev.tags || []), option],
                  }));
                }}
                onRemove={(item) => {
                  setFilters((prev) => ({
                    ...prev,
                    tags:
                      prev.tags?.filter((t) => t.value !== item.value) || [],
                  }));
                }}
                isOpen={openDropdowns.tags}
                onToggle={() => toggleDropdown("tags")}
                dropdownRef={tagsRef}
              />
            )}
          </div>

          {/* Order By Dropdown */}
          <div className="border-b border-[#e7eaee] pb-4">
            <div
              className="flex items-center justify-between cursor-pointer mb-3"
              onClick={() => toggleSection("orderBy")}
            >
              <span className="font-urbanist text-sm text-black">Order By</span>
              {expandedSections.orderBy ? (
                <AltArrowUp size={20} color="#6d6d6d" weight="Linear" />
              ) : (
                <AltArrowDown size={20} color="#6d6d6d" weight="Linear" />
              )}
            </div>
            {expandedSections.orderBy && (
              <SingleSelectDropdown
                label=""
                placeholder="Select..."
                options={orderByOptions}
                selectedValue={filters.orderBy || null}
                onSelect={(option) => {
                  setFilters((prev) => ({ ...prev, orderBy: option }));
                }}
                onRemove={() => {
                  setFilters((prev) => ({ ...prev, orderBy: null }));
                }}
                isOpen={openDropdowns.orderBy}
                onToggle={() => toggleDropdown("orderBy")}
                dropdownRef={orderByRef}
              />
            )}
          </div>

          {/* Reply State */}
          <div className="pb-4">
            <div
              className="flex items-center justify-between cursor-pointer mb-3"
              onClick={() => toggleSection("replyState")}
            >
              <span className="font-urbanist text-sm text-black">
                Reply State
              </span>
              {expandedSections.replyState ? (
                <AltArrowUp size={20} color="#6d6d6d" weight="Linear" />
              ) : (
                <AltArrowDown size={20} color="#6d6d6d" weight="Linear" />
              )}
            </div>
            {expandedSections.replyState && (
              <div className="flex items-center justify-between mt-3 w-[233px]">
                {replyStateFilter.map((state) => (
                  <label
                    key={state.id}
                    className="flex items-center gap-[11px] cursor-pointer"
                  >
                    <RadioButton
                      checked={filters.replyState === state.value}
                      onChange={() =>
                        setFilters((prev) => ({
                          ...prev,
                          replyState:
                            prev.replyState === state.value ? "" : state.value,
                        }))
                      }
                    />
                    <span className="font-urbanist text-xs text-black">
                      {state.name}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default SmartFilterPanel;


import {
  X
} from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import api from "../../../api";
import { ratingFilter } from "../../../constants/organicUA";
import ConfirmationPopup from "../../../components/ConfirmationPopup";
import {
  AltArrowLeft,
  ChatRoundLine,
  DangerTriangle,
  Star,
  Pen,
  TrashBinMinimalistic
} from "@solar-icons/react";
import Checkbox from "../../pages/CommpacDashboard/components/Checkbox";
import SaveIcon from "../../../assets/super-agents/save-icon.svg";

const data = [
  {
    id: "1",
    name: "Play Store",
    value: "play_store",
    coming_soon: false,
  },
  {
    id: "2",
    name: "App Store",
    value: "app_store",
    coming_soon: true,
  },
  //   {
  //     id: "3",
  //     name: "Both",
  //     value: "both",
  //   },
];
const EnableAutoReplyPopup = ({
  setShowAutoReplyEnablePopup,
  selectedGame,
  setSelectedGame,
  setGames,
  studio_id,
  setToastMessage,
}) => {
  const [selectedType, setSelectedType] = useState({});
  const [rating, setRating] = useState(["1", "2", "3", "4", "5"]);
  const [showManageTemplateSection, setShowManageTemplateSection] =
    useState(false);

  const onSelectType = (item) => {
    if (item.value === selectedType?.value) {
      setSelectedType({ value: "none" });
    } else {
      setSelectedType(item);
    }
  };

  const enableAutoReply = async () => {
    try {
      const auto_reply_ratings = rating?.join(",");
      const autoReply = await api.put(
        `/v1/games/${studio_id}/${selectedGame?.id}`,
        {
          ...selectedGame,
          auto_reply_enabled: selectedType?.value || "none",
          auto_reply_ratings: auto_reply_ratings,
        }
      );
      setGames((prev) =>
        prev.map((game) =>
          game.id === selectedGame.id
            ? {
                ...game,
                auto_reply_enabled: autoReply.data.data.auto_reply_enabled,
                auto_reply_ratings: autoReply.data.data.auto_reply_ratings,
              }
            : game
        )
      );
      setToastMessage({
        show: true,
        message: `Auto reply ${
          autoReply.data.data.auto_reply_enabled === "none"
            ? "disabled"
            : "enabled"
        } successfully`,
        duration: 3000,
        type: "success",
      });
      setShowAutoReplyEnablePopup(false);
    } catch (error) {
      console.error("Failed to enable auto reply", error);
      setToastMessage({
        show: true,
        message: "Failed to enable auto reply. Please try again.",
        duration: 3000,
        type: "error",
      });
    }
  };

  useEffect(() => {
    if (selectedGame?.id) {
      const game = data.find(
        (item) => item.value === selectedGame.auto_reply_enabled
      );
      setSelectedType(game);
      if (selectedGame.auto_reply_ratings) {
        setRating(selectedGame.auto_reply_ratings.split(","));
      }
    }
  }, [selectedGame?.id]);
  return (
    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-[#12111157] font-urbanist">
      <div className="relative my-6 mx-auto max-w-4xl w-[500px]">
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none max-h-[90vh] overflow-y-auto">
          {!showManageTemplateSection && (
            <div className="flex items-center justify-between p-5 rounded-t">
              <h3 className="text-lg font-medium">
                Enable auto-replying to reviews
              </h3>
              <button
                className="p-1 border-0 text-black float-right text-lg leading-none font-semibold outline-none focus:outline-none"
                onClick={() => setShowAutoReplyEnablePopup(false)}
              >
                <X size={24} color="#6d6d6d" strokeWidth={1.5} />
              </button>
            </div>
          )}

          <div className="px-4 pt-2">
            {!showManageTemplateSection && (
              <p className="text-base">
                Auto-reply allows you to automatically respond to reviews based
                on specific star ratings. This helps maintain engagement and
                manage your app's reputation efficiently.
              </p>
            )}
            {!showManageTemplateSection ? (
              <>
                <div className="py-4">
                  <span className="text-sm font-medium text-[#B0B0B0]">
                    Select auto-reply for
                  </span>
                  {data.map((item) => (
                    <React.Fragment key={item.id}>
                      <label
                        className={`relative flex items-center py-2 gap-2 text-sm font-regular text-[#141414] ${
                          item.coming_soon ? "text-[#898989]" : ""
                        }`}
                      >
                        {item.name}
                        {item.coming_soon ? (
                          <p className="text-base text-[#1F6744]">
                            Coming soon :)
                          </p>
                        ) : (
                          <>
                            <input
                              type="checkbox"
                              className="accent-[#1F6744] absolute left-1/2 -translate-x-1/2 w-full h-full peer appearance-none rounded-md cursor-pointer outline-none"
                              onChange={() => onSelectType(item)}
                              checked={selectedType?.id === item.id}
                            />
                            <span
                              className={`w-11 h-6 flex items-center flex-shrink-0 p-[2px] bg-[#e5e7eb] rounded-full duration-300 ease-in-out peer-checked:bg-[#1F6744] after:w-5 after:h-5 after:bg-white after:rounded-full after:shadow-lg after:duration-300 after:border after:border-[#e5e7eb] peer-checked:after:translate-x-[19px]`}
                            ></span>
                          </>
                        )}
                      </label>
                    </React.Fragment>
                  ))}
                </div>
                {selectedType?.id && (
                  <>
                    <p className="text-sm font-medium text-[#B0B0B0] mb-2">
                      Star ratings to automatically reply to
                    </p>
                    <div className="flex items-center pb-5 gap-4">
                      {ratingFilter.map((rate) => (
                        <div className="flex items-center gap-1" key={rate.id}>
                          <Checkbox
                            checked={rating.includes(rate.name)}
                            onChange={() => {
                              if (rating.includes(rate.name)) {
                                setRating(
                                  rating.filter((r) => r !== rate.name)
                                );
                              } else {
                                setRating([...rating, rate.name]);
                              }
                            }}
                          />
                          <span className="text-sm font-medium flex items-center">
                            {rate.name}
                            <Star
                              weight="Bold"
                              size={16}
                              color="#FFC322"
                              className="ml-1"
                            />
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <div className="bg-[#FFFAFA] border border-[#FFE9BD] text-yellow-700 p-4 m-4 ml-0 border border-border rounded-[5px]">
                  <div className="flex flex-col items-start gap-2">
                    <div>
                      <p className="font-medium text-base text-[#BC7F01]">
                        Studio-wide Templates
                      </p>
                      <p className="text-sm font-medium text-[#B0B0B0]">
                        Templates are shared across all games in your studio.
                        Any changes to templates will affect all games.
                      </p>
                    </div>
                    <div className="flex flex-row gap-2">
                      <button
                        onClick={() => setShowManageTemplateSection(true)}
                        className="text-[#1F6744] text-sm font-medium text-sm"
                      >
                        Manage Template
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <TemplateManagement
                setShowManageTemplateSection={setShowManageTemplateSection}
                rating={rating}
                studio_id={studio_id}
                selectedGame={selectedGame}
              />
            )}
          </div>
          {!showManageTemplateSection && (
            <div className="flex justify-end gap-2 p-5 pt-6">
              <button
                className="border border-[#E6E6E6] rounded-lg px-8 py-1.5 hover:bg-gray-200 shadow-sm text-base font-medium text-[#141414]"
                onClick={() => setShowAutoReplyEnablePopup(false)}
              >
                Cancel
              </button>
              <button
                className="bg-[#1F6744] text-white rounded-lg px-8 py-1.5 text-base font-medium text-[#141414]"
                onClick={enableAutoReply}
              >
                Enable
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TemplateManagement = ({
  setShowManageTemplateSection,
  rating,
  studio_id,
  selectedGame,
}) => {
  const [existingTemplates, setExistingTemplates] = useState([]);
  const [editMode, setEditMode] = useState({});
  const [localTemplateChanges, setLocalTemplateChanges] = useState({});
  const [selectedTab, setSelectedTab] = useState("reply");
  const [templates, setTemplates] = useState({});
  const [customTemplates, setCustomTemplates] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const textareaRefs = useRef({});

  useEffect(() => {
    Object.entries(textareaRefs.current).forEach(([id, ref]) => {
      if (ref && editMode[id]) {
        ref.style.height = "auto";
        ref.style.height = `${ref.scrollHeight}px`;
      }
    });
  }, [editMode]);

  const adjustTextareaHeight = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const fetchExistingTemplates = async () => {
    try {
      const response = await api.get(
        `v1/organic-ua/reply-templates/${studio_id}?template_type=auto`
      );
      setExistingTemplates(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch templates", error);
    }
  };

  const handleAddCustomTemplate = () => {
    const newTemplate = {
      id: Date.now().toString(),
      title: "",
      text: "",
      type: "custom",
    };
    setCustomTemplates([...customTemplates, newTemplate]);
  };

  const handleTemplateEditClick = (templateId) => {
    if (editMode[templateId]) {
      setExistingTemplates((prev) =>
        prev.map((t) => {
          if (t.id === templateId) {
            const changes = localTemplateChanges[templateId] || {};
            return {
              ...t,
              review_type: changes.review_type || t.review_type,
              review_reply: changes.review_reply || t.review_reply,
            };
          }
          return t;
        })
      );
      templatesaved();
    }

    setEditMode((prev) => ({
      ...prev,
      [templateId]: !prev[templateId],
    }));
  };

  const createTemplateAPI = async (templateData) => {
    try {
      const { data } = await api.post(
        "v1/organic-ua/reply-template/create",
        templateData
      );
      return {
        success: true,
        template: data.data,
      };
    } catch (error) {
      console.error("Create template failed:", error);
      return {
        success: false,
        error,
      };
    }
  };

  const handleToggleEdit = (templateId) => {
    if (editMode[templateId]) {
      setExistingTemplates((prev) =>
        prev.map((t) => {
          if (t.id === templateId) {
            const changes = localTemplateChanges[templateId] || {};
            return {
              ...t,
              review_reply: changes.review_reply || t.review_reply,
            };
          }
          return t;
        })
      );
      templatesaved();
    }

    setEditMode((prev) => ({
      ...prev,
      [templateId]: !prev[templateId],
    }));
  };

  const handleSaveCustomTemplate = async (template) => {
    const templateData = {
      studio_id,
      review_type: template.title,
      review_reply: template.text,
      template_type: "auto",
    };

    const result = await templatesaved();

    if (result.success) {
      const savedTemplate = {
        ...templateData,
        id: result.data?.id || template.id,
      };

      setExistingTemplates((prev) => [...prev, savedTemplate]);
      setCustomTemplates((prev) => prev.filter((t) => t.id !== template.id));
    } else {
      setToastMessage({
        show: true,
        message: "Failed to save custom template.",
        duration: 3000,
        type: "error",
      });
    }
  };

  const templatesaved = async () => {
    const newTemplates = [];

    // Save rating templates
    for (const r of rating) {
      if (templates[r]?.trim()) {
        const newTemplate = {
          studio_id,
          review_type: `rating_${r}`,
          review_reply: templates[r],
          template_type: "auto",
        };
        const res = await createTemplateAPI(newTemplate);
        if (res.success) {
          newTemplates.push(res.template);
          setTemplates((prev) => ({ ...prev, [r]: "" }));
        } else {
          setToastMessage({
            show: true,
            message: "Failed to save rating template. Please try again.",
            duration: 3000,
            type: "error",
          });
        }
      }
    }

    // Save custom templates
    const successfullySavedCustomTemplates = [];
    for (const ct of customTemplates) {
      if (
        ct.title &&
        ct.text &&
        !successfullySavedCustomTemplates.includes(ct.id)
      ) {
        const templateData = {
          studio_id,
          review_type: ct.title,
          review_reply: ct.text,
          template_type: "auto",
        };
        const res = await createTemplateAPI(templateData);
        if (res.success) {
          newTemplates.push(res.template);
          successfullySavedCustomTemplates.push(ct.id);
        } else {
          setToastMessage({
            show: true,
            message: "Failed to save custom template. Please try again.",
            duration: 3000,
            type: "error",
          });
        }
      }
    }

    // Update local state
    if (newTemplates.length) {
      setExistingTemplates((prev) => [...prev, ...newTemplates]);
    }
    setCustomTemplates((prev) =>
      prev.filter((ct) => !successfullySavedCustomTemplates.includes(ct.id))
    );

    // Update existing edited templates
    for (const template of existingTemplates) {
      const changes = localTemplateChanges[template.id];
      if (
        changes &&
        (changes.review_reply !== template.review_reply ||
          (!template.review_type.startsWith("rating_") &&
            changes.review_type &&
            changes.review_type !== template.review_type))
      ) {
        const updatedData = {
          ...template,
          review_type:
            !template.review_type.startsWith("rating_") && changes.review_type
              ? changes.review_type
              : template.review_type,
          review_reply: changes.review_reply || template.review_reply,
          template_type: "auto",
        };
        try {
          await api.put(
            `v1/organic-ua/reply-template/${studio_id}/${template.id}`,
            updatedData
          );
        } catch (error) {
          console.error("Failed to update template", error);
          setToastMessage({
            show: true,
            message: "Failed to update template. Please try again.",
            duration: 3000,
            type: "error",
          });
        }
      }
    }
  };

  const deleteTemplate = async (studio_id, templateId) => {
    try {
      const deleteTemplate = await api.delete(
        `v1/organic-ua/delete-custom-template/${studio_id}/${templateId}`
      );
      setExistingTemplates((prev) =>
        prev.filter((template) => template.id !== templateId)
      );
    } catch (error) {
      console.error("Failed to delete template", error);
      setToastMessage({
        show: true,
        message: "Failed to delete template. Please try again.",
        duration: 3000,
        type: "error",
      });
    }
  };

  useEffect(() => {
    if (studio_id) {
      fetchExistingTemplates();
    }
  }, [studio_id]);

  useEffect(() => {
    if (selectedGame?.id) {
      if (selectedGame.auto_reply_templates) {
        try {
          const parsedTemplates = JSON.parse(selectedGame.auto_reply_templates);
          setTemplates(parsedTemplates.ratingTemplates || {});
          setCustomTemplates(parsedTemplates.customTemplates || []);
        } catch (e) {
          console.error("Failed to parse auto_reply_templates", e);
          setTemplates({});
          setCustomTemplates([]);
        }
      }
    }
  }, [selectedGame?.id]);
  return (
    <div className="pb-4">
      {/* Header */}
      <div className="flex items-center justify-between py-4 border-b border-[#E7EAEE] mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowManageTemplateSection(false)}
            className="text-[#6d6d6d] hover:text-[#141414] flex items-center"
          >
            <AltArrowLeft weight={"Linear"} size={20} color="#0f4159" />
          </button>
          <span className="text-lg font-medium text-[#141414]">
            Studio-wide templates
          </span>
        </div>
        <button
          onClick={() => setShowManageTemplateSection(false)}
          className="p-1 text-[#6d6d6d] hover:text-[#141414]"
        >
          <X size={24} color="#6d6d6d" strokeWidth={1.5} />
        </button>
      </div>

      {/* Tabs */}
      <div className="inline-flex items-center gap-2 mb-4 border border-[#E6E6E6] rounded-lg p-1 bg-[#F6F6F6]">
        <button
          className={`flex items-center gap-2 px-5 py-1 rounded-lg font-medium text-base transition-colors ${
            selectedTab === "reply"
              ? "bg-[#1F6744] text-[#fff]"
              : "bg-[#F6F6F6] text-[#6d6d6d]"
          }`}
          onClick={() => setSelectedTab("reply")}
        >
          <ChatRoundLine weight={"Linear"} size={20} />
          Reply templates
        </button>
        <div className="w-px h-5 bg-[#E6E6E6]" />
        <button
          className={`flex items-center gap-2 px-5 py-1 rounded-lg font-medium text-base transition-colors ${
            selectedTab === "custom"
              ? "bg-[#1F6744] text-[#fff]"
              : "bg-[#F6F6F6] text-[#6d6d6d]"
          }`}
          onClick={() => setSelectedTab("custom")}
        >
          <Pen weight={"Linear"} size={20} />
          Custom templates
        </button>
      </div>

      {/* Note Box */}
      <div className="bg-[#FFFAFA] border border-[#FFE9BD] rounded-[5px] p-4 mb-4">
        <div className="flex items-start gap-3">
          <span className="size-[20px]"><DangerTriangle weight={"Linear"} size={20} color="#BC7F01" /></span>
          <p className="text-sm font-medium text-[#BC7F01]">
            <span className="font-semibold">Note:</span> To dynamically include the reviewer's username in your reply
            template, use the placeholder
            {`{user}`}. This placeholder will be automatically replaced with the
            actual username when the template is used.
          </p>
        </div>
      </div>

      {/* Reply Tab */}
      {selectedTab === "reply" && (
        <div className="flex flex-col gap-4">
          {rating.map((r) => {
            const existingTemplate = existingTemplates.find(
              (t) => t.review_type === `rating_${r}`
            );
            const hasText = templates[r] && templates[r].trim().length > 0;

            return (
              <div key={r} className="border border-[#E7EAEE] rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(Number(r))].map((_, i) => (
                      <Star key={i} weight="Bold" size={18} color="#FFC322" />
                    ))}
                    <span className="text-sm font-medium text-[#141414] ml-1">
                      {r} Star rating
                    </span>
                  </div>

                  {existingTemplate ? (
                    <button
                      onClick={() => {
                        handleToggleEdit(existingTemplate.id);
                      }}
                    >
                      {editMode[existingTemplate.id] ? (
                        <img src={SaveIcon} alt="Save" className="size-4" />
                      ) : (
                        <Pen weight={"Linear"} size={16} color="#6d6d6d" />
                      )}
                    </button>
                  ) : (
                    hasText && (
                      <button onClick={templatesaved}>
                        <img src={SaveIcon} alt="Save" className="size-4" />
                      </button>
                    )
                  )}
                </div>

                {existingTemplate ? (
                  editMode[existingTemplate.id] ? (
                    <textarea
                      ref={(ref) => (textareaRefs.current[existingTemplate.id] = ref)}
                      className="w-full border border-[#E7EAEE] rounded-lg p-3 text-sm text-[#141414] focus:outline-none focus:border-[#1F6744] resize-none min-h-[80px]"
                      defaultValue={existingTemplate.review_reply}
                      onChange={(e) => {
                        adjustTextareaHeight(e);
                        setLocalTemplateChanges((prev) => ({
                          ...prev,
                          [existingTemplate.id]: {
                            ...prev[existingTemplate.id],
                            review_reply: e.target.value,
                          },
                        }));
                      }}
                      placeholder="Enter reply message"
                    />
                  ) : (
                    <div className="p-3 border border-[#E7EAEE] rounded-lg text-sm text-[#141414]">
                      {existingTemplate.review_reply}
                    </div>
                  )
                ) : (
                  <textarea
                    className="w-full border border-[#E7EAEE] rounded-lg p-3 text-sm text-[#141414] placeholder-[#B0B0B0] focus:outline-none focus:border-[#1F6744] resize-none min-h-[80px]"
                    value={templates[r] || ""}
                    onChange={(e) =>
                      setTemplates((prev) => ({
                        ...prev,
                        [r]: e.target.value,
                      }))
                    }
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Custom Tab */}
      {selectedTab === "custom" && (
        <div className="flex flex-col gap-4 pb-16">
          {existingTemplates
            .filter((template) => !template.review_type?.startsWith("rating_"))
            .map((template) => (
              <div
                key={template.id}
                className="border border-[#E7EAEE] rounded-lg p-4"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-medium text-[#B0B0B0]">
                    {!editMode[template.id] ? template.review_type || "Custom Template" : ""}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        handleTemplateEditClick(template.id);
                      }}
                    >
                      {editMode[template.id] ? (
                        <img src={SaveIcon} alt="Save" className="size-4" />
                      ) : (
                        <Pen weight={"Linear"} size={16} color="#6d6d6d" />
                      )}
                    </button>
                    {!editMode[template.id] && (
                      <button
                        onClick={() => {
                          setSelectedTemplateId(template.id);
                          setShowConfirmation(true);
                        }}
                      >
                        <TrashBinMinimalistic weight={"Linear"} size={18} color="#f25a5a" />
                      </button>
                    )}
                  </div>
                </div>
                {editMode[template.id] ? (
                  <>
                    <input
                      type="text"
                      className="w-full border border-[#E7EAEE] rounded-lg p-3 mb-3 text-sm text-[#141414] focus:outline-none focus:border-[#1F6744]"
                      defaultValue={template.review_type}
                      onChange={(e) => {
                        setLocalTemplateChanges((prev) => ({
                          ...prev,
                          [template.id]: {
                            ...prev[template.id],
                            review_type: e.target.value,
                          },
                        }));
                      }}
                      placeholder="Enter template title"
                    />
                    <textarea
                      ref={(ref) => (textareaRefs.current[template.id] = ref)}
                      className="w-full border border-[#E7EAEE] rounded-lg p-3 text-sm text-[#141414] focus:outline-none focus:border-[#1F6744] resize-none min-h-[80px]"
                      defaultValue={template.review_reply}
                      onChange={(e) => {
                        setLocalTemplateChanges((prev) => ({
                          ...prev,
                          [template.id]: {
                            ...prev[template.id],
                            review_reply: e.target.value,
                          },
                        }));
                      }}
                      placeholder="Enter reply message"
                    />
                  </>
                ) : (
                  <div className="p-3 border border-[#E7EAEE] rounded-lg text-sm text-[#141414]">
                    {template.review_reply}
                  </div>
                )}
              </div>
            ))}

          {customTemplates.map((template, index) => (
            <div
              key={template.id}
              className="border border-[#E7EAEE] rounded-lg p-4"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-[#141414]">
                    New Custom Template
                  </span>
                  <p className="text-xs text-[#6d6d6d]">
                    Create a new studio-wide template
                  </p>
                </div>
                <button
                  onClick={() => handleSaveCustomTemplate(template)}
                  disabled={!template.title.trim() || !template.text.trim()}
                >
                  <img src={SaveIcon} alt="Save" className="size-4" />
                </button>
              </div>
              <input
                type="text"
                value={template.title}
                onChange={(e) => {
                  const updated = [...customTemplates];
                  updated[index].title = e.target.value;
                  setCustomTemplates(updated);
                }}
                placeholder="e.g. Bug Report Response"
                className="w-full border border-[#E7EAEE] rounded-lg p-3 mb-3 text-sm text-[#141414] placeholder-[#B0B0B0] focus:outline-none focus:border-[#1F6744]"
              />
              <textarea
                value={template.text}
                onChange={(e) => {
                  const updated = [...customTemplates];
                  updated[index].text = e.target.value;
                  setCustomTemplates(updated);
                }}
                placeholder="Enter your template response here"
                className="w-full border border-[#E7EAEE] rounded-lg p-3 text-sm text-[#141414] placeholder-[#B0B0B0] focus:outline-none focus:border-[#1F6744] resize-none min-h-[80px]"
              />
            </div>
          ))}

          {/* Fixed Add Custom Template Button */}
          <div className="sticky bottom-0 left-0 right-0 bg-white pt-3 pb-1 -mx-4 px-4 border-t border-[#E7EAEE]">
            <button
              onClick={handleAddCustomTemplate}
              className="bg-[#E8F5E9] text-[#1F6744] font-medium text-sm px-4 py-3 w-full rounded-lg border border-[#1F6744] hover:bg-[#D1EED4] transition-colors"
            >
              + Add Custom Template
            </button>
          </div>
        </div>
      )}
      {showConfirmation && (
        <ConfirmationPopup
          heading="Are you sure?"
          subHeading="Do you really want to delete this template?"
          onCancel={() => setShowConfirmation(false)}
          onConfirm={() => {
            deleteTemplate(studio_id, selectedTemplateId);
            setShowConfirmation(!showConfirmation);
          }}
        />
      )}
    </div>
  );
};

export default EnableAutoReplyPopup;

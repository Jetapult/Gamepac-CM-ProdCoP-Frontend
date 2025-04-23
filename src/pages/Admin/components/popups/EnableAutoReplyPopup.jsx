import {
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  Cog6ToothIcon,
} from "@heroicons/react/20/solid";
import { ArrowLeft, Star } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import api from "../../../../api";
import ToastMessage from "../../../../components/ToastMessage";
import { ratingFilter } from "../../../../constants/organicUA";

const data = [
  {
    id: "1",
    name: "Google Play",
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
}) => {
  const [selectedType, setSelectedType] = useState({});
  const [rating, setRating] = useState(["1", "2", "3", "4", "5"]);
  const [templates, setTemplates] = useState({});
  const [customTemplates, setCustomTemplates] = useState([]);
  const [existingTemplates, setExistingTemplates] = useState([]);
  const [editMode, setEditMode] = useState({});
  const [localTemplateChanges, setLocalTemplateChanges] = useState({});
  const [selectedTab, setSelectedTab] = useState("reply");
  const [showManageTemplateSection, setShowManageTemplateSection] =
    useState(false);
  const [toastMessage, setToastMessage] = useState({
    show: false,
    message: "",
    duration: 3000,
    type: "error",
  });
  const textareaRefs = useRef({});

  useEffect(() => {
    Object.entries(textareaRefs.current).forEach(([id, ref]) => {
      if (ref && editMode[id]) {
        ref.style.height = "auto";
        ref.style.height = `${ref.scrollHeight}px`;
      }
    });
  }, [editMode]);

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

  const handleRatingChange = (event) => {
    if (rating.includes(event.target.name)) {
      const removeRating = rating.filter((x) => {
        if (x === event.target.name) {
          return x !== event.target.name;
        }
        return rating;
      });
      setRating(removeRating);
      return;
    }
    setRating([...rating, event.target.name]);
  };

  const onSelectType = (item) => {
    if (item.value === selectedType?.value) {
      setSelectedType({ value: "none" });
    } else {
      setSelectedType(item);
    }
  };
  const handleAddCustomTemplate = () => {
    console.log("inside handle custom template");
    const newTemplate = {
      id: Date.now().toString(),
      title: "",
      text: "",
      type: "custom",
    };
    setCustomTemplates([...customTemplates, newTemplate]);
  };

  // const handleCustomTemplateChange = (id, field, value) => {
  //   console.log("inside handle custom template");
  //   setCustomTemplates(
  //     customTemplates.map((ct) =>
  //       ct.id === id ? { ...ct, [field]: value } : ct
  //     )
  //   );
  // };
  // const handleUpdateTemplate = async (templateId, updatedData) => {
  //   try {
  //     await api.put(`v1/organic-ua/reply-template/${templateId}`, updatedData);
  //     fetchExistingTemplates(); // Refresh templates after update
  //     setEditMode(prev => ({ ...prev, [templateId]: false }));
  //   } catch (error) {
  //     console.error('Failed to update template:', error);
  //   }
  // };

  const enableAutoReply = async () => {
    try {
      const auto_reply_ratings = rating?.join(",");

      await api.put(`/v1/games/${studio_id}/${selectedGame?.id}`, {
        ...selectedGame,
        auto_reply_enabled: selectedType?.value || "none",
        auto_reply_ratings: auto_reply_ratings,
      });

      setGames((prev) =>
        prev.map((game) => {
          if (game.id === selectedGame.id) {
            return {
              ...game,
              auto_reply_enabled: selectedType?.value || "none",
              auto_reply_ratings: auto_reply_ratings,
            };
          }
          return game;
        })
      );
    } catch (error) {
      showErrorToast("Failed to enable auto reply. Please try again.");
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
        try {
          const { data } = await api.post(
            "v1/organic-ua/reply-template/create",
            newTemplate
          );
          newTemplates.push({
            ...newTemplate,
            id: data?.id,
          });
          setTemplates((prev) => ({ ...prev, [r]: "" }));
        } catch (error) {
          showErrorToast("Failed to enable auto reply. Please try again.");
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
        try {
          const { data } = await api.post(
            `v1/organic-ua/reply-template/create`,
            templateData
          );
          newTemplates.push({
            ...templateData,
            id: data?.data?.id,
          });
          successfullySavedCustomTemplates.push(ct.id);
        } catch (error) {
          showErrorToast("Failed to enable auto reply. Please try again.");
        }
      }
    }

    if (newTemplates.length) {
      setExistingTemplates((prev) => [...prev, ...newTemplates]);
    }
    setCustomTemplates((prev) =>
      prev.filter((ct) => !successfullySavedCustomTemplates.includes(ct.id))
    );
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
          showErrorToast("Failed to enable auto reply. Please try again.");
        }
      }
    }
  };

  useEffect(() => {
    if (studio_id) {
      fetchExistingTemplates();
    }
  }, [studio_id]);

  useEffect(() => {
    if (selectedGame?.id) {
      const game = data.find(
        (item) => item.value === selectedGame.auto_reply_enabled
      );
      setSelectedType(game);
      if (selectedGame.auto_reply_ratings) {
        setRating(selectedGame.auto_reply_ratings.split(","));
      }
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
    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-[#12111157]">
      <div className="relative my-6 mx-auto max-w-4xl w-[600px]">
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none max-h-[90vh] overflow-y-auto">
          {!showManageTemplateSection && (
            <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
              <h3 className="text-2xl font-semibold">Enable Auto Reply</h3>
              <button
                className="p-1 border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                onClick={() => setShowAutoReplyEnablePopup(false)}
              >
                <XMarkIcon className="w-6 h-6 text-[#d6d6d6]" />
              </button>
            </div>
          )}

          <div className="px-4 pt-4">
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
                  {data.map((item) => (
                    <React.Fragment key={item.id}>
                      <label
                        className={`relative flex justify-between items-center p-1 text-xl mb-2 ${
                          item.coming_soon ? "text-gray-300" : ""
                        }`}
                      >
                        {item.name}
                        {item.coming_soon ? (
                          <p className="text-md">coming soon</p>
                        ) : (
                          <>
                            <input
                              type="checkbox"
                              className="accent-black absolute left-1/2 -translate-x-1/2 w-full h-full peer appearance-none rounded-md cursor-pointer outline-none"
                              onChange={() => onSelectType(item)}
                              checked={selectedType?.id === item.id}
                            />
                            <span
                              className={`w-11 h-6 flex items-center flex-shrink-0 p-[2px] bg-[#e5e7eb] rounded-full duration-300 ease-in-out peer-checked:bg-black after:w-5 after:h-5 after:bg-white after:rounded-full after:shadow-lg after:duration-300 after:border after:border-[#e5e7eb] peer-checked:after:translate-x-[19px]`}
                            ></span>
                          </>
                        )}
                      </label>
                    </React.Fragment>
                  ))}
                </div>
                {selectedType?.id && (
                  <>
                    <p className="mb-2 text-base">
                      Please select the star ratings you want to automatically
                      reply to.
                    </p>
                    <div className="flex items-center pb-5">
                      {ratingFilter.map((rate) => (
                        <div
                          className="flex items-center mb-2 mr-4"
                          key={rate.id}
                        >
                          <input
                            id={`checkbox-${rate.name}`}
                            type="checkbox"
                            name={rate.name}
                            className="w-4 h-4 accent-black bg-gray-100 border-gray-300 rounded"
                            onChange={handleRatingChange}
                            checked={rating.includes(rate.name)}
                          />
                          <label
                            htmlFor={`checkbox-${rate.name}`}
                            className="ms-2 text-sm font-medium flex"
                          >
                            {rate.name}
                            <Star
                              size={16}
                              color="black"
                              fill="yellow"
                              className="flex item-centre ml-1"
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <div className="bg-amber-50 text-yellow-700 p-4 m-4 ml-0 border border-border rounded-md">
                  <div className="flex flex-col items-start gap-2">
                    <div>
                      <p className="font-semibold">Studio-wide Templates</p>
                      <p>
                        Templates are shared across all games in your studio.
                        Any changes to templates will affect all games.
                      </p>
                    </div>
                    <div className="flex flex-row gap-2">
                      <button
                        onClick={() => setShowManageTemplateSection(true)}
                        className="bg-white text-amber-800 px-3 py-2 rounded-md hover:bg-yellow-500 hover:text-black border border-amber-300 flex items-center gap-2 font-medium text-sm whitespace-nowrap justify-center"
                      >
                        <Cog6ToothIcon className="w-4 h-4" />
                        <span>Manage Template</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="px-4 pb-4">
                <div className="flex flex-col w-full p-0 pb-4">
                  <h3 className="flex items-center text-2xl font-semibold mb-2 gap-2">
                    <button
                      onClick={() => setShowManageTemplateSection(false)}
                      className="text-black hover:underline flex items-center ml-[-30px]"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <span className="text-black font-semibold">
                      Template Management
                    </span>
                  </h3>

                  <p className="text-sm text-gray-600 w-full">
                    Manage your studio-wide templates for automatic review
                    responses. These templates will be used for all games in
                    your studio.
                  </p>
                </div>

                <div className="ml-0 flex justify-between w-full mb-6 bg-gray-200 p-1 rounded-md">
                  <button
                    className={`w-1/2 px-4 py-2 rounded-md font-semibold transition-colors ${
                      selectedTab === "reply"
                        ? "bg-white text-gray-800"
                        : "bg-gray-200 text-gray-600"
                    }`}
                    onClick={() => setSelectedTab("reply")}
                  >
                    Reply Templates
                  </button>
                  <button
                    className={`w-1/2 px-4 py-2 rounded-md font-semibold transition-colors ${
                      selectedTab === "custom"
                        ? "bg-white text-gray-800"
                        : "bg-gray-200 text-gray-600"
                    }`}
                    onClick={() => setSelectedTab("custom")}
                  >
                    Custom Templates
                  </button>
                </div>

                {/* Reply Tab */}
                {selectedTab === "reply" && (
                  <>
                    {rating.map((r) => {
                      const existingTemplate = existingTemplates.find(
                        (t) => t.review_type === `rating_${r}`
                      );
                      if (existingTemplate) return null;

                      const hasText =
                        templates[r] && templates[r].trim().length > 0;

                      return (
                        <div key={r} className="mb-4 border p-2 rounded-md">
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-[rgb(31 41 55 / var(--tw-text-opacity, 1))] bg-gray-200 rounded-xl p-2 leading-[0.55rem]">
                              {r} Star Rating
                            </label>

                            {hasText && (
                              <button
                                onClick={async () => {
                                  await templatesaved();
                                }}
                                className="mt-2 border border-input text-black rounded-md px-4 py-1 flex items-center gap-2 text-sm leading-5 bg-[rgb(22_163_74/_var(--tw-bg-opacity,1))] text-white"
                              >
                                <CheckIcon className="h-4 w-4 text-white" />
                                Save
                              </button>
                            )}
                          </div>
                          <textarea
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm leading-5"
                            value={templates[r] || ""}
                            onChange={(e) =>
                              setTemplates((prev) => ({
                                ...prev,
                                [r]: e.target.value,
                              }))
                            }
                            placeholder={`Enter reply message for ${r} star rating`}
                          />
                        </div>
                      );
                    })}

                    <h4 className="text-lg font-semibold mb-2">
                      Rating Templates
                    </h4>
                    {existingTemplates
                      .filter((template) =>
                        template.review_type.startsWith("rating_")
                      )
                      .map((template) => (
                        <div
                          key={template.id}
                          className="mb-4 border p-2 rounded-md"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <label
                              className="block text-sm font-medium text-[rgb(31 41 55 / var(--tw-text-opacity, 1))] bg-gray-200 rounded-xl p-2 leading-[0.55rem]
                         "
                            >
                              {template.review_type.replace("rating_", "")} Star
                              Rating
                            </label>
                            <button
                              onClick={async () => {
                                if (editMode[template.id]) {
                                  setExistingTemplates((prev) =>
                                    prev.map((t) => {
                                      if (t.id === template.id) {
                                        const changes =
                                          localTemplateChanges[template.id] ||
                                          {};
                                        return {
                                          ...t,
                                          review_reply:
                                            changes.review_reply ||
                                            t.review_reply,
                                        };
                                      }
                                      return t;
                                    })
                                  );
                                  await templatesaved();
                                }
                                setEditMode((prev) => ({
                                  ...prev,
                                  [template.id]: !prev[template.id],
                                }));
                              }}
                              className={`mt-2 border border-input text-black rounded-md px-4 py-1 flex items-center gap-2 text-sm leading-5 ${
                                editMode[template.id]
                                  ? "bg-[rgb(22_163_74/_var(--tw-bg-opacity,1))] text-white"
                                  : "bg-background"
                              }`}
                            >
                              {editMode[template.id] ? (
                                <>
                                  <CheckIcon className="h-4 w-4 text-black text-white" />
                                  Save
                                </>
                              ) : (
                                <>
                                  <PencilIcon className="h-4 w-4 text-black" />
                                  Edit
                                </>
                              )}
                            </button>
                          </div>
                          {editMode[template.id] ? (
                            <>
                              <textarea
                                ref={(ref) =>
                                  (textareaRefs.current[template.id] = ref)
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm leading-5 min-h-[60px] resize-none overflow-hidden "
                                defaultValue={template.review_reply}
                                onChange={(e) => {
                                  e.target.style.height = "auto";
                                  e.target.style.height = `${e.target.scrollHeight}px`;
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
                            <div className="p-3 bg-gray-50 border rounded-md text-sm leading-5">
                              {template.review_reply}
                            </div>
                          )}
                        </div>
                      ))}
                  </>
                )}

                {/* Custom Tab */}
                {selectedTab === "custom" && (
                  <>
                    <h4 className="text-lg font-semibold mb-2">
                      Custom Templates
                    </h4>
                    {existingTemplates
                      .filter(
                        (template) =>
                          !template.review_type?.startsWith("rating_")
                      )
                      .map((template) => (
                        <div
                          key={template.id}
                          className="mb-4 border p-2 rounded-md"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              {template.review_type || "Custom Template"}
                            </label>
                            <button
                              onClick={async () => {
                                if (editMode[template.id]) {
                                  setExistingTemplates((prev) =>
                                    prev.map((t) => {
                                      if (t.id === template.id) {
                                        const changes =
                                          localTemplateChanges[template.id] ||
                                          {};
                                        return {
                                          ...t,
                                          review_type:
                                            changes.review_type ||
                                            t.review_type,
                                          review_reply:
                                            changes.review_reply ||
                                            t.review_reply,
                                        };
                                      }
                                      return t;
                                    })
                                  );
                                  await templatesaved();
                                }

                                setEditMode((prev) => ({
                                  ...prev,
                                  [template.id]: !prev[template.id],
                                }));
                              }}
                              className={`mt-2 rounded-md px-4 py-1 flex items-center gap-2 text-sm leading-5 ${
                                editMode[template.id]
                                  ? "bg-[rgb(22_163_74_/_var(--tw-bg-opacity))] text-white"
                                  : "border border-black text-black"
                              }`}
                            >
                              {editMode[template.id] ? (
                                <>
                                  <CheckIcon className="h-4 w-4 text-white" />
                                  Save
                                </>
                              ) : (
                                <>
                                  <PencilIcon className="h-4 w-4 text-black" />
                                  Edit
                                </>
                              )}
                            </button>
                          </div>
                          {editMode[template.id] ? (
                            <>
                              <input
                                type="text"
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2 mb-2"
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
                                ref={(ref) =>
                                  (textareaRefs.current[template.id] = ref)
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md p-2 overflow-hidden min-h-[60px] resize-none"
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
                            <div className="p-3 bg-gray-50 border rounded-md text-sm leading-5">
                              {template.review_reply}
                            </div>
                          )}
                        </div>
                      ))}

                    {customTemplates.map((template, index) => (
                      <div
                        key={template.id}
                        className="mt-4 mb-4 p-4 border rounded-md bg-white"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex flex-col gap-1 mb-2">
                            <label className="text-sm font-semibold tracking-tight text-gray-700">
                              New Custom Template
                            </label>
                            <p className="text-sm text-muted-foreground">
                              Create a new studio-wide template
                            </p>
                          </div>
                          <button
                            onClick={async () => {
                              const templateData = {
                                studio_id,
                                review_type: template.title,
                                review_reply: template.text,
                                template_type: "auto",
                              };

                              try {
                                const { data } = await api.post(
                                  "v1/organic-ua/reply-template/create",
                                  templateData
                                );
                                const savedTemplate = {
                                  ...templateData,
                                  id: data?.data?.id || data?.id || template.id,
                                };
                                setExistingTemplates((prev) => [
                                  ...prev,
                                  savedTemplate,
                                ]);
                                setCustomTemplates((prev) =>
                                  prev.filter((t) => t.id !== template.id)
                                );
                              } catch (error) {
                                showErrorToast(
                                  "Failed to save custom template."
                                );
                              }
                            }}
                            disabled={
                              !template.title.trim() || !template.text.trim()
                            }
                            className={`mt-2 rounded-md px-4 py-1 flex items-center gap-2 text-sm leading-5 
                              ${
                                !template.title.trim() || !template.text.trim()
                                  ? "bg-gray-300 text-white cursor-not-allowed"
                                  : "bg-[rgb(22_163_74_/_var(--tw-bg-opacity))] text-white"
                              }`}
                          >
                            <CheckIcon className="h-4 w-4 text-white" />
                            Save
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
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 mb-2"
                        />
                        <textarea
                          value={template.text}
                          onChange={(e) => {
                            const updated = [...customTemplates];
                            updated[index].text = e.target.value;
                            setCustomTemplates(updated);
                          }}
                          placeholder="Enter your template response here"
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 overflow-hidden"
                        />
                      </div>
                    ))}

                    <div className="mt-4">
                      <button
                        onClick={handleAddCustomTemplate}
                        className="bg-lime-100 text-black font-medium text-sm px-4 py-2 w-full rounded-md border border-lime-300"
                      >
                        + Add Custom Template
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          {!showManageTemplateSection && (
            <div className="flex justify-end gap-2 p-5 pt-6 border-t border-t-blueGray-200">
              <button
                className="border border-[#000000] rounded-md px-5 py-2 hover:bg-gray-200"
                onClick={() => setShowAutoReplyEnablePopup(false)}
              >
                Cancel
              </button>
              <button
                className="bg-[#000000] text-white rounded-md px-5 py-2 hover:opacity-80"
                onClick={enableAutoReply}
              >
                Save Settings
              </button>
            </div>
          )}
        </div>
      </div>
      {toastMessage.show && (
        <ToastMessage
          message={toastMessage.message}
          duration={toastMessage.duration}
          type={toastMessage.type}
          onClose={() => setToastMessage({ ...toastMessage, show: false })}
        />
      )}
    </div>
  );
};

export default EnableAutoReplyPopup;

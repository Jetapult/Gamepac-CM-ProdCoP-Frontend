import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";
import React, { useEffect, useState } from "react";
import api from "../../../../api";
import ReactStars from "react-rating-stars-component";
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
  const [existingTemplates, setExistingTemplates]=useState([]);
  const [editMode, setEditMode]=useState({});
  const [localTemplateChanges, setLocalTemplateChanges] = useState({});


  const fetchExistingTemplates=async()=>{
    try{
      const response = await api.get(`v1/organic-ua/reply-templates/${studio_id}?template_type=auto`); 
      setExistingTemplates(response.data.data||[]);
    }catch(error){
      console.error("Failed to fetch templates", error); 
    }
  }

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
      title: '',
      text: '',
      type: 'custom'
    };
    setCustomTemplates([...customTemplates, newTemplate]);
  };

  const handleCustomTemplateChange = (id, field, value) => {
    console.log("inside handle custom template"); 
    setCustomTemplates(
      customTemplates.map((ct) =>
        ct.id === id ? { ...ct, [field]: value } : ct
      )
    );
  };
  const handleUpdateTemplate = async (templateId, updatedData) => {
    try {
      await api.put(`v1/organic-ua/reply-template/${templateId}`, updatedData);
      fetchExistingTemplates(); // Refresh templates after update
      setEditMode(prev => ({ ...prev, [templateId]: false }));
    } catch (error) {
      console.error('Failed to update template:', error);
    }
  };
  const handleRemoveCustomTemplate = (id) => {
    setCustomTemplates(customTemplates.filter((ct) => ct.id !== id));
  };

//enable replying 
  const enableAutoReply = async () => {
    try {
      // if (selectedType?.id && !rating.length) {
      //   return;
      // }
      const auto_reply_ratings = rating?.join(",");
      const GameData = {
        ...selectedGame,
        auto_reply_enabled: selectedType?.value || "none",
        auto_reply_ratings: auto_reply_ratings,
      };
      
      for (const r of rating){
        if(templates[r]){
          const templateData={
            studio_id: studio_id, 
            review_type : `rating_${r}`, 
            review_reply: templates[r], 
            template_type: 'auto'
          }
          console.log("saving to db")
          console.log(templateData);
          await api.post(`v1/organic-ua/reply-template/create`, templateData);
          console.log("data saved")
        }
      }
      for (const ct of customTemplates) {
        if (ct.title && ct.text) {
          const templateData = {
            studio_id: studio_id,
            review_type: `${ct.title}`,
            review_reply: ct.text,
            template_type: 'auto'
          };
          await api.post(`v1/organic-ua/reply-template/create`, templateData);
        }
      }
      for (const template of existingTemplates) {
        if (localTemplateChanges[template.id]) {
          const changes = localTemplateChanges[template.id];
          const updatedData = {
            ...template,
            review_type: !template.review_type.startsWith('rating_') && changes.review_type 
              ? changes.review_type 
              : template.review_type,
            review_reply: changes.review_reply || template.review_reply,
            template_type: 'auto'
          };
          
          await api.put(`v1/organic-ua/reply-template/${studio_id}/${template.id}`, updatedData);
        }
      }
      const sendWeeklyReportResponse = await api.put(
        `/v1/games/${studio_id}/${selectedGame?.id}`,
        GameData
      );
      Object.keys(templates)
      setGames((prev) =>
        prev.filter((game) => {
          if (game.id === selectedGame.id) {
            game.auto_reply_enabled =
              sendWeeklyReportResponse.data.data.auto_reply_enabled;
            game.auto_reply_ratings =
              sendWeeklyReportResponse.data.data.auto_reply_ratings;
          }
          return prev;
        })
      );
      setRating(
        sendWeeklyReportResponse.data.data?.auto_reply_ratings?.split(",")
      );
      setSelectedGame({});
      setShowAutoReplyEnablePopup(false);
    } catch (error) {
      console.log(error);
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
  <div className="relative my-6 mx-auto max-w-3xl w-[500px]">
    <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none max-h-[90vh] overflow-y-auto">
          <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
            <h3 className="text-2xl font-semibold">Enable Auto Reply</h3>
            <button
              className="p-1 ml-auto border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={() => setShowAutoReplyEnablePopup(false)}
            >
              <XMarkIcon className="w-6 h-6 text-[#d6d6d6]" />
            </button>
          </div>
          <div className="px-4 pt-4">
            <p className="text-base">
              Auto-reply allows you to automatically respond to reviews based on
              specific star ratings. This helps maintain engagement and manage
              your app's reputation efficiently.
            </p>
          </div>
          <div className="px-4 py-4">
            {data.map((item) => (
              <React.Fragment key={item.id}>
                <label className={`relative flex justify-between items-center p-1 text-xl mb-2 ${item.coming_soon ? "text-gray-300" : ""}`}>
                  {item.name}
                  {item.coming_soon ? (
                    <p className="text-md">coming soon</p>
                  ) : (
                    <>
                      <input
                        type="checkbox"
                        className="absolute left-1/2 -translate-x-1/2 w-full h-full peer appearance-none rounded-md cursor-pointer outline-none"
                        onChange={() => onSelectType(item)}
                        checked={selectedType?.id === item.id}
                      />
                      <span
                        className={`w-11 h-6 flex items-center flex-shrink-0 ml-4 p-[2px] bg-[#e5e7eb] rounded-full duration-300 ease-in-out peer-checked:bg-[#2563eb] after:w-5 after:h-5 after:bg-white after:rounded-full after:shadow-lg after:duration-300 after:border after:border-[#e5e7eb] peer-checked:after:translate-x-[19px]`}
                      ></span>
                    </>
                  )}
                </label>
              </React.Fragment>
            ))}
          </div>
          {selectedType?.id && (
            <>
              <p className="px-4 mb-2 text-base">
                Please select the star ratings you want to automatically reply to.
              </p>
              <div className="flex items-center px-4 pb-5">
                {ratingFilter.map((rate) => (
                  <div className="flex items-center mb-2 mr-4" key={rate.id}>
                    <input
                      id={`checkbox-${rate.name}`}
                      type="checkbox"
                      name={rate.name}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                      onChange={handleRatingChange}
                      checked={rating.includes(rate.name)}
                    />
                    <label
                      htmlFor={`checkbox-${rate.name}`}
                      className="ms-2 text-sm font-medium flex"
                    >
                      {rate.name}
                      <ReactStars
                        count={1}
                        edit={false}
                        size={16}
                        value={parseInt(rate.name)}
                        activeColor={rate.color}
                        classNames={"pl-1"}
                      />
                    </label>
                  </div>
                ))}
              </div>
              <div className="px-4 pb-4">
                <h4 className="text-lg font-semibold mb-2">Auto Reply Templates</h4>
                {rating.map((r) => (
                  <div key={r} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Template for {r} Star Rating:
                    </label>
                    <textarea
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                      value={templates[r] || ""}
                      onChange={(e) =>
                        setTemplates({ ...templates, [r]: e.target.value })
                      }
                      placeholder={`Enter reply message for ${r} star rating`}
                    />
                  </div>
                ))}
              </div>
              <div className="px-4 pb-4">
        <h4 className="text-lg font-semibold mb-2">Existing Templates</h4>
        {existingTemplates.map((template) => (
  <div key={template.id} className="mb-4 border p-2 rounded-md">
    <div className="flex justify-between items-center mb-2">
      <label className="block text-sm font-medium text-gray-700">
        {template.review_type.startsWith('rating_') 
          ? `Template for ${template.review_type.replace('rating_', '')} Star Rating`
          : template.review_type}
      </label>
      <button
        onClick={() => setEditMode(prev => ({ ...prev, [template.id]: !prev[template.id] }))}
        className="mt-2 bg-blue-500 text-white rounded-md px-4 py-1"
      >
        {editMode[template.id] ? 'Cancel' : 'Edit'}
      </button>
    </div>
            
    {editMode[template.id] ? (
      <>
        {!template.review_type.startsWith('rating_') && (
          <input
            type="text"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 mb-2"
            defaultValue={template.review_type}
            onChange={(e) => {
              // Store changes locally in our state
              setLocalTemplateChanges(prev => ({
                ...prev,
                [template.id]: {
                  ...prev[template.id],
                  review_type: e.target.value
                }
              }));
            }}
            placeholder="Enter template title"
          />
        )}
        <textarea
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          defaultValue={template.review_reply}
          onChange={(e) => {
            // Store changes locally in our state
            setLocalTemplateChanges(prev => ({
              ...prev,
              [template.id]: {
                ...prev[template.id],
                review_reply: e.target.value
              }
            }));
          }}
          placeholder="Enter reply message"
        />
    <button
          onClick={() => {
            // Update the existingTemplates state with local changes
            setExistingTemplates(prev => 
              prev.map(t => {
                if (t.id === template.id) {
                  const changes = localTemplateChanges[template.id] || {};
                  return {
                    ...t,
                    review_type: !t.review_type.startsWith('rating_') && changes.review_type 
                      ? changes.review_type 
                      : t.review_type,
                    review_reply: changes.review_reply || t.review_reply
                  };
                }
                return t;
              })
            );
            // Exit edit mode
            setEditMode(prev => ({ ...prev, [template.id]: false }));
          }}
          className="mt-2 bg-blue-500 text-white rounded-md px-4 py-1"
        >
          Save Changes
        </button>
      </>
    ) : (
      <div className="mt-1 p-2 bg-gray-50 rounded-md">
        {template.review_reply}
      </div>
    )}
  </div>
))}
      </div>
              <div className="px-4 pb-4">
                <h4 className="text-lg font-semibold mb-2">Custom Templates</h4>
                {customTemplates.map((ct) => (
                  <div key={ct.id} className="mb-4 border p-2 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Template Title:
                      </label>
                      <button
                        onClick={() => handleRemoveCustomTemplate(ct.id)}
                        className="text-red-500 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                      value={ct.title}
                      onChange={(e) =>
                        handleCustomTemplateChange(ct.id, "title", e.target.value)
                      }
                      placeholder="Enter template title"
                    />
                    <label className="block text-sm font-medium text-gray-700 mt-2">
                      Template Message:
                    </label>
                    <textarea
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                      value={ct.text}
                      onChange={(e) =>
                        handleCustomTemplateChange(ct.id, "text", e.target.value)
                      }
                      placeholder="Enter reply message"
                    />
                  </div>
                ))}
                <button
                  onClick={handleAddCustomTemplate}
                  className="bg-[#B9FF66] text-black rounded-md px-4 py-2"
                >
                  Add Custom Template
                </button>
              </div>
            </>
          )}
          <div className="flex p-5 pt-6 border-t border-t-blueGray-200">
            <button
              className="bg-[#000000] text-white rounded-md px-5 py-2 mr-4 hover:opacity-80"
              onClick={enableAutoReply}
            >
              Save
            </button>
            <button
              className="border border-[#000000] rounded-md px-5 py-2 hover:bg-gray-200"
              onClick={() => setShowAutoReplyEnablePopup(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnableAutoReplyPopup;
 
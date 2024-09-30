import { useState, useEffect, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import loadingIcon from "../../../assets/transparent-spinner.svg";
import Select from "react-select";
import { useSelector } from "react-redux";
import api from "../../../api";
import { SketchPicker } from "react-color";
import { PencilIcon } from "@heroicons/react/24/outline";

const CreateTagPopup = ({
  showCreateTagPopup,
  setShowCreateTagPopup,
  setKnowledgebaseCategories,
  setToastMessage,
  knowledgebaseCategoriesEdit,
  setKnowledgebaseCategoriesEdit,
  queryPacType
}) => {
  const [submitLoader, setSubmitLoader] = useState(false);
  const [tagName, setTagName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#D0021B");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);
  function useOutsideAlerter(ref) {
    useEffect(() => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          setShowColorPicker(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }
  const closePopup = () => {
    setShowCreateTagPopup(!showCreateTagPopup);
    setKnowledgebaseCategoriesEdit({});
  };
  const addTagToKnowledgeBase = async () => {
    try {
      setSubmitLoader(true);
      const requestbody = {
        title: tagName,
        description: description,
        is_public: isPublic,
        color: color,
        type: queryPacType
      };
      const templatesResponse = knowledgebaseCategoriesEdit.id ? await api.put(
        `/v1/chat/knowledgebase-categories/${knowledgebaseCategoriesEdit.id}`,
        requestbody
      ) : await api.post(
        `/v1/chat/knowledgebase-categories`,
        requestbody
      );
      setSubmitLoader(false);
      setTagName("");
      setDescription("");
      setIsPublic(true);
      setColor("#D0021B");
      setShowCreateTagPopup(!showCreateTagPopup);
      setKnowledgebaseCategories((prev) => [
        ...prev,
        templatesResponse.data.data,
      ]);
      setToastMessage({
        show: true,
        message: `${knowledgebaseCategoriesEdit.id ? "Updated" : "Created"} Tags successfully`,
        type: "success",
      });
      setKnowledgebaseCategoriesEdit({});
    } catch (err) {
      setSubmitLoader(false);
      setToastMessage({
        show: true,
        message: err.response.data.message || err.response.message,
        type: "error",
      });
    }
  };
  useEffect(() => {
    if (knowledgebaseCategoriesEdit) {
      setTagName(knowledgebaseCategoriesEdit.name || "");
      setDescription(knowledgebaseCategoriesEdit.description || "");
      setColor(knowledgebaseCategoriesEdit.color || "#D0021B");
    }
  }, [knowledgebaseCategoriesEdit]);
  return (
    <div
      className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-[#12111157]"
      onClick={closePopup}
    >
      <div
        className="relative my-6 mx-auto max-w-3xl w-[500px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
            <h3 className="text-2xl font-semibold">{knowledgebaseCategoriesEdit.id ? "Update" : "Create"} Tags</h3>
            <button
              className="p-1 ml-auto border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={closePopup}
            >
              <XMarkIcon className="w-6 h-6 text-[#d6d6d6]" />
            </button>
          </div>
          <form className="px-6 py-4">
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="review_type"
              >
                Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="border border-[#d6d6d6] rounded-lg p-2 w-full"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="review_type"
              >
                Description
              </label>
              <textarea
                className="border border-[#d6d6d6] rounded-lg p-2 w-full"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="mb-4 relative">
              <label
                className="block text-gray-700 text-sm font-bold mb-2 flex items-center gap-2"
                htmlFor="color_picker"
                onClick={() => setShowColorPicker(!showColorPicker)}
              >
                Color
                <span
                  className={`min-h-4 min-w-8 rounded-full inline-block px-2 py-[1px] capitalize`}
                  style={{ backgroundColor: color + '33', color: color, }}
                >
                  {tagName}
                </span>
                <PencilIcon className="w-4 h-4 cursor-pointer" />
              </label>
              {showColorPicker && <div ref={wrapperRef} className="mt-2 absolute top-19 left-0 z-10">
                <SketchPicker
                  color={color}
                  onChangeComplete={(color) => setColor(color.hex)}
                />
              </div>}
            </div>
            {/* <div className="flex justify-between">
              <label
                className={`relative flex justify-between items-center p-1 text-gray-700 text-sm font-bold mb-2`}
              >
                Public
                <input
                  type="checkbox"
                  className="absolute left-1/2 -translate-x-1/2 w-full h-full peer appearance-none rounded-md cursor-pointer outline-none"
                  onChange={() => setIsPublic(!isPublic)}
                  checked={isPublic}
                />
                <span
                  className={`w-11 h-6 flex items-center flex-shrink-0 ml-4 p-[2px] bg-[#e5e7eb] rounded-full duration-300 ease-in-out peer-checked:bg-[#ff1053] after:w-5 after:h-5 after:bg-white after:rounded-full after:shadow-lg after:duration-300 after:border after:border-[#e5e7eb] peer-checked:after:translate-x-[19px]`}
                ></span>
              </label>
            </div> */}
          </form>
          <div className="flex items-center p-6 border-t border-solid border-blueGray-200 rounded-b">
            {submitLoader ? (
              <button
                className="bg-[#ff1053] text-white font-bold uppercase text-sm px-6 py-1.5 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
              >
                <img src={loadingIcon} alt="loading" className="w-8 h-8" />
              </button>
            ) : (
              <>
                {tagName.length ? (
                  <button
                    className="bg-[#ff1053] text-white font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={addTagToKnowledgeBase}
                  >
                    {knowledgebaseCategoriesEdit.id ? "Update" : "Save"}
                  </button>
                ) : (
                  <button
                    className="bg-[#ff1053] opacity-40 cursor-not-allowed text-white font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                  >
                    {knowledgebaseCategoriesEdit.id ? "Update" : "Save"}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTagPopup;

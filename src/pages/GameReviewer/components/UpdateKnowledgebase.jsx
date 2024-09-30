import { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import loadingIcon from "../../../assets/transparent-spinner.svg";
import Select from "react-select";
import api from "../../../api";

export const customStyles = {
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    return {
      ...styles,
      backgroundColor: isDisabled
        ? null
        : isSelected
        ? data.color + '33'
        : isFocused
        ? data.color + '33'
        : null,
      color: isDisabled
        ? '#ccc'
        : isSelected
        ? data.color
        : isFocused
        ? data.color
        : null,
    };
  },
  multiValue: (styles, { data }) => {
    return {
      ...styles,
      backgroundColor: data.color + '33',
      color: data.color,
      borderRadius: '24px',
      textTransform: 'capitalize',
    };
  },
  multiValueLabel: (styles, { data }) => ({
    ...styles,
    color: data.color,
  }),
  multiValueRemove: (styles, { data }) => ({
    ...styles,
    color: data.color,
    ':hover': {
      backgroundColor: 'transparent',
      color: data.color,
    },
  }),
};

const UpdateKnowledgebasePopup = ({
  showUpdateKnowledgebasePopup,
  setShowUpdateKnowledgebasePopup,
  setKnowledgebaseCategories,
  setToastMessage,
  knowledgebaseCategories,
  knowledgebaseToUpdate,
  setKnowledgebaseToUpdate,
  setKnowledgebase,
}) => {
  const [submitLoader, setSubmitLoader] = useState(false);
  const [knowledgebaseTitle, setKnowledgebaseTitle] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [category_ids, setCategoryIds] = useState([]);
  const closePopup = () => {
    setShowUpdateKnowledgebasePopup(!showUpdateKnowledgebasePopup);
  };
  const addTagToKnowledgeBase = async () => {
    try {
      setSubmitLoader(true);
      const categoryIds = category_ids.map((x) => x.id);
      const requestbody = {
        title: knowledgebaseTitle,
        is_public: isPublic,
        category_ids: categoryIds,
      };
      const templatesResponse = await api.put(
        `/v1/chat/knowledgebase/${knowledgebaseToUpdate.id}`,
        requestbody
      );
      setSubmitLoader(false);
      setKnowledgebaseTitle("");
      setIsPublic(true);
      setShowUpdateKnowledgebasePopup(!showUpdateKnowledgebasePopup);
      setKnowledgebaseCategories((prevCategories) => 
        prevCategories.map((category) => {
          const wasInPrevious = knowledgebaseToUpdate.categories?.some(prevCat => prevCat?.id === category?.id);
          const isInCurrent = category_ids.some(currentCat => currentCat?.id === category?.id);

          if (wasInPrevious && !isInCurrent) {
            return { ...category, document_count: category.document_count - 1 };
          } else if (!wasInPrevious && isInCurrent) {
            return { ...category, document_count: category.document_count + 1 };
          }
          return category;
        })
      );
      setKnowledgebase((prev) => 
        prev.map((x) => {
          if (x.id === knowledgebaseToUpdate.id) {
            const categories = category_ids.map((y) => ({
              id: y.id, 
              name: y.name,
              color: y.color
            }));
            return { ...x, categories };
          }
          return x;
        })
      );
      setKnowledgebaseToUpdate({});
      setToastMessage({
        show: true,
        message: "Knowledge Base updated successfully",
        type: "success",
      });
    } catch (err) {
      console.log(err);
      setSubmitLoader(false);
      setToastMessage({
        show: true,
        message: err.response.data.message || err.response.message,
        type: "error",
      });
    }
  };
  useEffect(() => {
    setKnowledgebaseTitle(knowledgebaseToUpdate.title);
    setIsPublic(knowledgebaseToUpdate.is_public);
    const categoryIds = knowledgebaseToUpdate.categories.map((x) => {
      return { label: x.name, name: x.name, value: x.id, id: x.id, color: x.color };
    });
    setCategoryIds(categoryIds);
  }, [knowledgebaseToUpdate]);
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
            <h3 className="text-2xl font-semibold">Update Knowledge Base</h3>
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
                Title<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="border border-[#d6d6d6] rounded-lg p-2 w-full"
                value={knowledgebaseTitle}
                onChange={(e) => setKnowledgebaseTitle(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="knowledgebase_category"
              >
                Knowledge Base Categories<span className="text-red-500">*</span>
              </label>
              <Select
                options={knowledgebaseCategories?.filter(category => !category_ids?.some(selected => selected?.id === category?.id))}
                value={category_ids}
                isMulti={true}
                onChange={(val) => setCategoryIds(val)}
                styles={customStyles}
              />
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
                {knowledgebaseTitle.length && category_ids.length ? (
                  <button
                    className="bg-[#ff1053] text-white font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={addTagToKnowledgeBase}
                  >
                    Update
                  </button>
                ) : (
                  <button
                    className="bg-[#ff1053] opacity-40 cursor-not-allowed text-white font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                  >
                    Update
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

export default UpdateKnowledgebasePopup;

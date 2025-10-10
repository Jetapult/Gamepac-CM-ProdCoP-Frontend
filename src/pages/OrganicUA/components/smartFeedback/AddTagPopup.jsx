import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import loadingIcon from "../../../../assets/transparent-spinner.svg";
import Select from "react-select";
import { useSelector } from "react-redux";
import api from "../../../../api";
import { TagsList } from "../../../../constants/organicUA";
import { tagDistributionlabelData } from "../ReviewInsights/ReviewInsights";

const AddTagPopup = ({
  showAddTagPopup,
  setShowAddTagPopup,
  selectedReview,
  setToastMessage,
  setReviews,
  setSelectedReview,
  selectedGame,
  ContextStudioData,
}) => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [submitLoader, setSubmitLoader] = useState(false);
  const studios = useSelector((state) => state.admin.studios);
  const userData = useSelector((state) => state.user.user);
  const closePopup = () => {
    setShowAddTagPopup(!showAddTagPopup);
  };
  const addTags = async () => {
    try {
      setSubmitLoader(true);
      const tags = [];
      selectedTags.filter((x) => tags.push(x.value));
      const requestbody = {
        tags: tags,
        reviewId: selectedReview.id,
        studioId: ContextStudioData?.id,
        gameId: selectedGame.id,
      };
      const templatesResponse =
        selectedGame.platform === "android"
          ? await api.put(`v1/organic-ua/play-store/add-tags`, requestbody)
          : await api.put(`v1/organic-ua/app-store/add-tags`, requestbody);
      setSubmitLoader(false);
      setSelectedReview({});
      setReviews((prev) =>
        prev.filter((x) => {
          if (x.id === selectedReview.id) {
            x.tags = tags;
          }
          return prev;
        })
      );
      setShowAddTagPopup(!showAddTagPopup);
      setToastMessage({
        show: true,
        message: "Tags added successfully",
        type: "success",
      });
    } catch (err) {
      console.log(err);
      if (err.response.data.message || err.response.message) {
        setToastMessage({
          show: true,
          message: err.response.data.message || err.response.message,
          type: "error",
        });
      }
      setSubmitLoader(false);
    }
  };
  useEffect(() => {
    if (selectedReview.id) {
      const selectedReviewTags = [];
      selectedReview?.tags?.filter((x) =>
        selectedReviewTags.push({ label: x, value: x })
      );
      setSelectedTags(selectedReviewTags);
    }
  }, [selectedReview.id]);
  return (
    <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none bg-[#12111157]">
      <div className="relative my-6 mx-auto max-w-3xl w-[500px]">
        <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
            <h3 className="text-2xl font-semibold">Add Tags</h3>
            <button
              className="p-1 ml-auto border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
              onClick={closePopup}
            >
              <XMarkIcon className="w-6 h-6 text-[#d6d6d6]" />
            </button>
          </div>
          <form className="px-8 py-4">
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="review_type"
              >
                Tags
              </label>
              <Select
                options={TagsList}
                value={selectedTags}
                isMulti={true}
                onChange={(val) => setSelectedTags(val)}
                styles={{
                  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
                    return {
                      ...styles,
                      backgroundColor: isDisabled
                        ? null
                        : isSelected
                        ? tagDistributionlabelData[data.label] + '33'
                        : isFocused
                        ? tagDistributionlabelData[data.label] + '33'
                        : null,
                      color: isDisabled
                        ? '#ccc'
                        : isSelected
                        ? tagDistributionlabelData[data.label]
                        : isFocused
                        ? tagDistributionlabelData[data.label]
                        : null,
                    };
                  },
                  multiValue: (styles, { data }) => {
                    return {
                      ...styles,
                      backgroundColor: tagDistributionlabelData[data.label] + '33',
                      color: tagDistributionlabelData[data.label],
                      borderRadius: '24px',
                      textTransform: 'capitalize',
                    };
                  },
                  multiValueLabel: (styles, { data }) => ({
                    ...styles,
                    color: tagDistributionlabelData[data.label],
                  }),
                  multiValueRemove: (styles, { data }) => ({
                    ...styles,
                    color: tagDistributionlabelData[data.label],
                    ':hover': {
                      backgroundColor: 'transparent',
                      color: tagDistributionlabelData[data.label],
                    },
                  }),
                }}
              />
            </div>
          </form>
          <div className="flex items-center p-6 border-t border-solid border-blueGray-200 rounded-b">
            {submitLoader ? (
              <button
                className="bg-[#1174fc] text-white font-bold uppercase text-sm px-6 py-1.5 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
              >
                <img src={loadingIcon} alt="loading" className="w-8 h-8" />
              </button>
            ) : (
              <>
                {selectedTags.length ? (
                  <button
                    className="bg-[#1174fc] text-white font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={addTags}
                  >
                    Save
                  </button>
                ) : (
                  <button
                    className="bg-[#1174fc] opacity-40 cursor-not-allowed text-white font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                  >
                    Save
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

export default AddTagPopup;

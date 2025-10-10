import moment from "moment";
import { useEffect, useRef, useState } from "react";
import ReactStars from "react-rating-stars-component";
import Pagination from "../../../../components/Pagination";
import api from "../../../../api";
import { useSelector } from "react-redux";
import ToastMessage from "../../../../components/ToastMessage";
import { PencilSquareIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import CreateReplyTemplatePopup from "../CreateReplyTemplatePopup";
import AddTagPopup from "./AddTagPopup";
import HighlightText from "../../../../components/HighlightText";
import { tagDistributionlabelData } from "../ReviewInsights/ReviewInsights";

const ratingColor = {
  5: `#62b47b`,
  4: "#bfd17e",
  3: "#fcd66b",
  2: "#ffb46f",
  1: "#fd7779",
};

const ReviewsCard = ({
  reviews,
  totalReviews,
  currentPage,
  setCurrentPage,
  limit,
  setReviews,
  selectedGame,
  templates,
  setTemplates,
  searchText,
  ContextStudioData
}) => {
  const userData = useSelector((state) => state.user.user);
  const studios = useSelector((state) => state.admin.studios);
  const [showOriginalLangComment, setShowOriginalLangComment] = useState([]);
  const [translateReply, setTranslateReply] = useState([]);
  const [translateCurrentReply, setTranslateCurrentReply] = useState([]);
  const [translateLoader, setTranslateloader] = useState("");
  const [toastMessage, setToastMessage] = useState({
    show: false,
    message: "",
    duration: 3000,
    type: "success",
  });
  const [showTemplateDropdown, setShowTemplateDropdown] = useState("");
  const [postLoader, setPostLoader] = useState("");
  const [generativeAILoader, setGenerativeAILoader] = useState("");
  const [showCreateReplyTemplatePopup, setShowCreateReplyTemplatePopup] =
    useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState({});
  const [showAddTagPopup, setShowAddTagPopup] = useState(false);
  const [selectedReview, setSelectedReview] = useState({});
  const [showOtherDetails, setShowOtherDetails] = useState("");
  const wrapperRef = useRef(null);
  const editRef = useRef(null);
  const reviewDetailsRef = useRef(null);
  const otherDetailsButtonRefs = useRef({});
  useOutsideAlerter(wrapperRef, () => {
    setShowTemplateDropdown("");
  });
  useOutsideAlerter(editRef, () => {
    closeEditingMode();
  });
  useOutsideAlerter(reviewDetailsRef, () => {
    setShowOtherDetails("");
  });
  useOutsideAlerter(otherDetailsButtonRefs, () => {
    setShowOtherDetails("");
  });
  function useOutsideAlerter(ref, next) {
    useEffect(() => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          next();
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref, next]);
  }

  const onShowOtherDetails = (review) => {
    if (showOtherDetails === review.id) {
      setShowOtherDetails("");
    } else {
      setShowOtherDetails(review.id);
    }
  };

  const closeEditingMode = () => {
    setReviews((prev) =>
      prev.filter((x) => {
        if (x.isEdit) {
          x.isEdit = false;
        }
        return prev;
      })
    );
  };

  const translateReviewReply = async (review) => {
    if (translateReply.includes(review.id)) {
      const removeReviewTranslation = translateReply.filter(
        (x) => x !== review.id
      );
      setTranslateReply(removeReviewTranslation);
    } else {
      const addReviewTranslation = [...translateReply, review.id];
      setTranslateReply(addReviewTranslation);
      if (!review.translated_reply) {
        translateReplyAndSave(review);
      }
    }
  };

  const translateReplyAndSave = async (review, isReview) => {
    try {
      const requestBody = {
        review:
          selectedGame.platform === "android"
            ? review.postedReply
            : isReview
            ? `${review?.title}/n ${review.body}`
            : review.responsebody,
        reviewId: review.id,
        gameId: selectedGame.id,
        studioId: ContextStudioData?.id,
        platform: selectedGame.platform,
        contentType:
          selectedGame.platform === "android"
            ? "reply"
            : isReview
            ? "review"
            : "reply",
      };
      const templatesResponse = await api.put(
        `/v1/organic-ua/translate-reply`,
        requestBody
      );
      setReviews((prev) =>
        prev.filter((x) => {
          if (x.id === review.id) {
            x.translated_reply = templatesResponse.data.data.translated_reply;
            x.translated_review = templatesResponse.data.data.translated_review;
          }
          return prev;
        })
      );
    } catch (err) {
      console.log(err);
    }
  };

  const onSelectTemplate = (template) => {
    setReviews((prev) =>
      prev.filter((x) => {
        if (x.id === showTemplateDropdown) {
          const template_reply = template.review_reply.replaceAll(
            "user",
            x.userName || x.reviewernickname
          );
          x.reply = template_reply;
          x.totalReplytextCount = template_reply.length;
          x.template_type = template.review_type;
          x.isAIReply = false;
        }
        return prev;
      })
    );
    setShowTemplateDropdown("");
  };

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return `${color}`;
  };

  const onEditReply = (review) => {
    setReviews((prev) =>
      prev.map((x) => {
        if (x.id === review.id) {
          return {
            ...x,
            reply:
              selectedGame.platform === "android"
                ? review.postedReply
                : review.responsebody,
            isEdit: true,
          };
        }
        return x;
      })
    );
  };
  const showReviewtranslation = (review) => {
    if (showOriginalLangComment.includes(review.id)) {
      const removeReviewTranslation = showOriginalLangComment.filter(
        (x) => x !== review.id
      );
      setShowOriginalLangComment(removeReviewTranslation);
    } else {
      const addReviewTranslation = [...showOriginalLangComment, review.id];
      setShowOriginalLangComment(addReviewTranslation);
      if (selectedGame.platform === "apple" && !review.translated_review) {
        translateReplyAndSave(review, true);
      }
    }
  };
  const showReviewtoReplytranslation = (review) => {
    if (!review.reply) {
      setToastMessage({
        show: true,
        message: "reply to review should not be empty",
        type: "error",
      });
      return;
    }
    handleTranslate(review);
    // if (translateCurrentReply.includes(review.id)) {
    //   const removeReviewTranslation = translateCurrentReply.filter(
    //     (x) => x !== review.id
    //   );
    //   setTranslateCurrentReply(removeReviewTranslation);
    //   setReviews((prev) =>
    //     prev.map((x) => {
    //       if (x.id === review.id) {
    //         return { ...x, reply: review.originalReply };
    //       }
    //       return x;
    //     })
    //   );
    // } else {
    //   const addReviewTranslation = [...translateCurrentReply, review.id];
    //   setTranslateCurrentReply(addReviewTranslation);
    //   !review.translatedReply
    //     ? handleTranslate(review)
    //     : setReviews((prev) =>
    //         prev.map((x) => {
    //           if (x.id === review.id) {
    //             return { ...x, reply: review.translatedReply };
    //           }
    //           return x;
    //         })
    //       );
    // }
  };
  const handleTranslate = async (review) => {
    try {
      setTranslateloader(review.id);
      const response = await api.post("/translateTemplate", {
        review:
          selectedGame.platform === "apple"
            ? review.body
            : review.originalLang || review.comment,
        template: review.reply,
        reviewerLanguage: review.reviewerLanguage,
      });
      const translatedReply = response.data.translatedReply;
      setReviews((prev) =>
        prev.map((x) => {
          if (x.id === review.id) {
            return {
              ...x,
              originalReply: review.reply,
              reply: translatedReply,
              totalReplytextCount: translatedReply?.length,
              translatedReply,
            };
          }
          return x;
        })
      );
    } catch (error) {
      console.error("Error translating reply:", error);
      if (error?.response?.data?.message) {
        setToastMessage({
          show: true,
          message: error?.response?.data?.message,
          type: "error",
        });
      }
    } finally {
      setTranslateloader("");
    }
  };

  const generativeAIReply = async (reviewId) => {
    const review = reviews.find((x) => x.id === reviewId);
    setGenerativeAILoader(review.id);
    if (!review) {
      console.error("review not found");
      return;
    }
    try {
      const response = await api.post("/replyAssistant", {
        comment:
          selectedGame.platform === "android"
            ? review.originalLang || review.comment
            : review.body,
      });
      const reply = response.data.reply;
      setReviews((prev) =>
        prev.map((x) => {
          if (x.id === reviewId) {
            return {
              ...x,
              reply,
              totalReplytextCount: reply.length,
              template_type: "",
              isAIReply: true,
            };
          }
          return x;
        })
      );
    } catch (error) {
      console.error("Error fetching reply:", error);
    } finally {
      setGenerativeAILoader("");
    }
  };

  const handlePostReply = async (reviewData) => {
    try {
      const reviewId = reviewData.reviewId || reviewData.appstorereviewid;
      setPostLoader(reviewId);
      if (reviewData.totalReplytextCount > 350) {
        setToastMessage({
          show: true,
          message: "reply to review limit is 350 characters",
          type: "error",
        });
        return;
      }
      const review = reviews.find(
        (x) => x.reviewId === reviewId || x.appstorereviewid === reviewId
      );
      if (!review.reply) {
        setToastMessage({
          show: true,
          message: "reply to review should not be empty",
          type: "error",
        });
        return;
      }
      const url =
        selectedGame.platform === "android" ? "/postReply" : "/postAppleReply";
      const requestbody =
        selectedGame.platform === "android"
          ? {
              reviewId: reviewId,
              packageName: selectedGame.package_name,
              reply: review.reply,
            }
          : {
              reviewId: reviewId,
              reply: review.reply,
              studio_id: ContextStudioData?.id,
            };
      const response = await api.post(url, requestbody);
      if (response.status === 200) {
        selectedGame.platform === "android"
          ? setReviews((prev) =>
              prev.map((x) => {
                if (x.reviewId === reviewId) {
                  return {
                    ...x,
                    postedReply: x.reply,
                    isPosted: true,
                    selectedTemplateIndex: "",
                    reply: "",
                    template_type: "",
                    totalReplytextCount: 0,
                    postedDate: new Date().toISOString(),
                    isEdit: false,
                  };
                }
                return x;
              })
            )
          : setReviews((prev) =>
              prev.map((x) => {
                if (x.appstorereviewid === reviewId) {
                  return {
                    ...x,
                    responsebody: x.reply,
                    responsestate: "PENDING_PUBLISH",
                    reply: "",
                    template_type: "",
                    totalReplytextCount: 0,
                    lastmodifieddate: new Date().toISOString(),
                    isEdit: false,
                  };
                }
                return x;
              })
            );
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      if (error.response.data.message) {
        setToastMessage({
          show: true,
          message: error.response.data.message,
          type: "error",
        });
      }
    } finally {
      setPostLoader("");
    }
  };
  return (
    <>
      {reviews.map((review, index) => (
        <div
          className="p-3 border-t-[0.5px] border-y-[#ccc] relative"
          key={review?.id}
        >
          <div
            className={`mb-2 p-3 border-l-[2px] ${
              review?.userRating === 5 || review?.rating === 5
                ? "border-l-rating5"
                : ""
            } ${
              review?.userRating === 4 || review?.rating === 4
                ? "border-l-rating4"
                : ""
            } ${
              review?.userRating === 3 || review?.rating === 3
                ? "border-l-rating3"
                : ""
            } ${
              review?.userRating === 2 || review?.rating === 2
                ? "border-l-rating2"
                : ""
            } ${
              review?.userRating === 1 || review?.rating === 1
                ? "border-l-rating1"
                : ""
            }`}
          >
            <div className="flex items-center">
              <ReactStars
                count={5}
                edit={false}
                size={15}
                isHalf={true}
                value={review?.userRating || review?.rating}
                emptyIcon={<i className="far fa-star"></i>}
                halfIcon={<i className="fa fa-star-half-alt"></i>}
                fullIcon={<i className="fa fa-star"></i>}
                activeColor={ratingColor[review?.userRating || review?.rating]}
              />
              <p className="ml-2 text-sm font-bold text-gray-500">
                {review?.userName || review?.reviewernickname}
              </p>
              <p className="ml-2 text-sm font-medium text-gray-400">
                {moment(review?.date || review?.createddate).format(
                  "MMM DD, YYYY, hh:mm A"
                )}
              </p>
              {(review?.reviewerLanguage || review?.territory) && (
                <p className="border border-dashed rounded px-2 text-sm ml-2 text-[#d89a28]">
                  {review?.reviewerLanguage || review?.territory}
                </p>
              )}
              {review?.appVersionName && (
                <p className="border border-dashed rounded px-2 text-sm ml-2 text-[#9450c9]">
                  {review?.appVersionName}
                </p>
              )}
              {review?.productName && (
                <p className="border border-dashed rounded px-2 text-sm ml-2 text-[#059afd]">
                  {review?.productName}
                </p>
              )}
              <button
                className="bg-[#e5e5e5] text-[13px] cursor-pointer ml-2 px-2 rounded-md"
                onClick={() => onShowOtherDetails(review)}
                ref={(el) => (otherDetailsButtonRefs.current[review.id] = el)}
              >
                Other details
              </button>
              {showOtherDetails === review.id && (
                <ReviewDetailsCard 
                  review={review} 
                  reviewDetailsRef={reviewDetailsRef} 
                  otherDetailsButtonRefs={otherDetailsButtonRefs}
                />
              )}
            </div>

            {review?.title && !showOriginalLangComment.includes(review.id) && (
              <p className="text-md font-bold">{review?.title}</p>
            )}

            {showOriginalLangComment.includes(review.id) ? (
              <p className="text-md breakword">
                {review?.comment ||
                  review?.translatedReview ||
                  review?.translated_review}
              </p>
            ) : (
              <HighlightText
                text={review?.originalLang || review?.comment || review?.body}
                searchTerm={searchText}
              />
            )}
            {review.reviewerLanguage !== "en" && (
              <span
                className="text-[#5e80e1] underline text-[13px] cursor-pointer"
                onClick={() => showReviewtranslation(review)}
              >
                {showOriginalLangComment.includes(review.id)
                  ? "Show Original"
                  : "Show Translation"}
              </span>
            )}
            <p>
              Tags:{" "}
              {review?.tags?.map((tag, index) => (
                <span
                  className={`px-2 py-1 text-sm rounded-full mx-1 capitalize  ${getRandomColor()}`}
                  style={{
                    backgroundColor: tagDistributionlabelData[tag] + "33",
                    color: tagDistributionlabelData[tag],
                  }}
                  key={`tag${index}`}
                >
                  {tag}
                </span>
              ))}
              <span
                className="text-[#5e80e1] text-[13px] cursor-pointer"
                onClick={() => {
                  setSelectedReview(review);
                  setShowAddTagPopup(!showAddTagPopup);
                }}
              >
                + Add tag
              </span>
            </p>
            {(review.postedReply || review?.responsebody) && !review.isEdit ? (
              <div
                className={`group p-3 border rounded mt-3 relative ${
                  review?.responsestate === "PENDING_PUBLISH"
                    ? "border-[#f9e9c8] bg-[#fefcf0]"
                    : "border-[#50cd73] bg-[#edf9ef]"
                }`}
              >
                <div className="flex items-center">
                  <p className="text-gray-400 text-xs">
                    {moment(
                      review.postedDate || review?.lastmodifieddate
                    ).format("MMM DD, YYYY, hh:mm A")}
                  </p>
                  <div
                    className={`flex items-center rounded inline px-2 py-0 ml-2 ${
                      review?.responsestate === "PENDING_PUBLISH"
                        ? "bg-[#fff2de]"
                        : "bg-[#dbf4e3]"
                    }`}
                  >
                    <i
                      className={`fa fa-circle text-[5px] mr-2 ${
                        review?.responsestate === "PENDING_PUBLISH"
                          ? "text-[#e4cc7e]"
                          : "text-[#50cd73]"
                      }`}
                    ></i>
                    <span
                      className={`text-sm ${
                        review?.responsestate === "PENDING_PUBLISH"
                          ? "text-[#e4cc7e]"
                          : "text-[#50cd73]"
                      }`}
                    >
                      {review?.responsestate === "PENDING_PUBLISH"
                        ? "Pending"
                        : "Sent"}
                    </span>
                  </div>
                </div>
                {translateReply.includes(review.id) ? (
                  <p className="">{review.translated_reply}</p>
                ) : (
                  <p className="">
                    {review.postedReply || review?.responsebody}
                  </p>
                )}
                <span
                  className="text-[#5e80e1] underline text-[13px] cursor-pointer"
                  onClick={() => translateReviewReply(review)}
                >
                  {translateReply.includes(review.id)
                    ? "Show Original"
                    : "Show Translation"}
                </span>
                <span
                  className="group-hover:block hidden cursor-pointer inline absolute top-1 right-1 px-1 bg-white rounded"
                  onClick={() => onEditReply(review)}
                >
                  <PencilSquareIcon className="w-4 h-4 inline text-[#5e80e1]" />
                </span>
              </div>
            ) : (
              <>
                <div
                  className={`w-100 border border-[#ccc] rounded my-2 ${
                    review.totalReplytextCount > 350
                      ? "border-red-500 border rounded"
                      : ""
                  }`}
                  ref={editRef}
                >
                  {review.isAIReply && (
                    <p className="text-sm font-bold pl-2 pt-2">AI Reply:</p>
                  )}
                  <textarea
                    className="block outline:none focus:outline-none w-full p-2 rounded"
                    placeholder="Reply to review"
                    value={review.reply}
                    onChange={(event) =>
                      setReviews((prev) =>
                        prev.filter((x) => {
                          if (x.id === review.id) {
                            x.reply = event.target.value;
                            x.totalReplytextCount = event.target.value.length;
                          }
                          return prev;
                        })
                      )
                    }
                  />
                  <div
                    className={`flex items-end mt-2 ${
                      review.totalReplytextCount
                        ? "justify-between"
                        : "justify-end"
                    }`}
                  >
                    {review.totalReplytextCount ? (
                      <div
                        className={`${
                          review.totalReplytextCount > 350
                            ? "bg-[#e67878]"
                            : "bg-gray-200"
                        } pt-1 px-1 rounded-bl`}
                      >
                        <p
                          className={`text-sm ${
                            review.totalReplytextCount > 350
                              ? "text-white"
                              : "text-[#092139]"
                          }`}
                        >
                          {review.totalReplytextCount}/350
                        </p>
                      </div>
                    ) : (
                      <></>
                    )}
                    <div className="flex pr-2 pb-2">
                      {review.isAIReply && (
                        <button
                          className="border border-[#ccc] rounded py-1 px-3 mr-2 text-sm hover:bg-[#000] hover:text-[#B9FF66] hover:border-none"
                          onClick={() => {
                            setSelectedTemplate({
                              review_type: "",
                              review_reply: review.reply,
                              type: "save-as-template",
                            });
                            setShowCreateReplyTemplatePopup(
                              !showCreateReplyTemplatePopup
                            );
                          }}
                        >
                          Save as template
                        </button>
                      )}

                      <button
                        className={`bg-[#B9FF66] rounded px-3 py-1 mr-2 text-[#000] text-sm hover:bg-[#000] hover:text-[#B9FF66] ${
                          generativeAILoader === review?.id
                            ? "cursor-not-allowed"
                            : ""
                        }`}
                        onClick={() => {
                          if (generativeAILoader === "") {
                            generativeAIReply(review?.id);
                          }
                        }}
                        disabled={generativeAILoader === review?.id}
                      >
                        Generate AI reply
                      </button>
                      <div className="relative">
                        <button
                          className="border border-[#ccc] flex justify-between items-center rounded py-1 px-3 mr-2 text-sm w-[170px] hover:bg-[#000] hover:text-[#B9FF66] hover:border-transparent"
                          onClick={() => setShowTemplateDropdown(review.id)}
                        >
                          {review.template_type
                            ? review.template_type
                            : "Select a template"}
                          <ChevronDownIcon className="w-4 h-5 inline ml-2" />
                        </button>
                        {showTemplateDropdown === review.id && (
                          <div
                            className="absolute bg-white border border-[#ccc] rounded left-0 w-[150px] top-8 z-50"
                            ref={wrapperRef}
                          >
                            {templates.map((template) => (
                              <p
                                className={`p-2 border-b border-b-[#ccc] cursor-pointer hover:bg-gray-200 ${review.template_type === template.review_type ? "bg-gray-200" : ""}`}
                                key={template.id}
                                onClick={() => onSelectTemplate(template)}
                              >
                                {template.review_type}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        className={`bg-[#B9FF66] rounded px-3 py-1 mr-2 text-[#000] text-sm hover:bg-[#000] hover:text-[#B9FF66] ${
                          translateLoader === review.id
                            ? "cursor-not-allowed"
                            : ""
                        }`}
                        onClick={() => {
                          if (translateLoader === "") {
                            showReviewtoReplytranslation(review);
                          }
                        }}
                      >
                        Translate
                      </button>
                      <button
                        className={`bg-[#B9FF66] rounded px-3 py-1  text-[#000] text-sm hover:bg-[#000] hover:text-[#B9FF66] ${
                          postLoader ===
                          (review?.reviewId || review?.appstorereviewid)
                            ? "cursor-not-allowed"
                            : ""
                        }`}
                        onClick={() => {
                          if (postLoader === "") {
                            handlePostReply(review);
                          }
                        }}
                        disabled={
                          postLoader ===
                          (review?.reviewId || review?.appstorereviewid)
                        }
                      >
                        Post reply
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ))}
      {totalReviews > 0 && (
        <Pagination
          totalReviews={totalReviews}
          currentPage={currentPage}
          limit={limit}
          setCurrentPage={setCurrentPage}
        />
      )}
      {toastMessage.show && (
        <ToastMessage
          message={toastMessage}
          setToastMessage={setToastMessage}
        />
      )}
      {showCreateReplyTemplatePopup && (
        <CreateReplyTemplatePopup
          showCreateReplyTemplatePopup={showCreateReplyTemplatePopup}
          setShowCreateReplyTemplatePopup={setShowCreateReplyTemplatePopup}
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
          setTemplates={setTemplates}
          setToastMessage={setToastMessage}
          ContextStudioData={ContextStudioData}
        />
      )}
      {showAddTagPopup && (
        <AddTagPopup
          showAddTagPopup={showAddTagPopup}
          setShowAddTagPopup={setShowAddTagPopup}
          selectedReview={selectedReview}
          setToastMessage={setToastMessage}
          setReviews={setReviews}
          setSelectedReview={setSelectedReview}
          selectedGame={selectedGame}
          ContextStudioData={ContextStudioData}
        />
      )}
    </>
  );
};

const ReviewDetailsCard = ({ review, reviewDetailsRef, otherDetailsButtonRefs }) => {
  useEffect(() => {
    if (otherDetailsButtonRefs && reviewDetailsRef.current) {
      // Calculate triangle position based on button location
      const buttonRect = otherDetailsButtonRefs.current[review.id].getBoundingClientRect();
      const cardRect = reviewDetailsRef.current.getBoundingClientRect();
      
      // Calculate the distance from the card's right edge to the button center
      const buttonCenter = buttonRect.left + (buttonRect.width / 2);
      const cardRight = cardRect.right;
      const trianglePosition = Math.max(20, cardRight - buttonCenter);
      
      // Set the triangle position using CSS custom property
      reviewDetailsRef.current.style.setProperty('--triangle-right', `${trianglePosition}px`);
    }
  }, [otherDetailsButtonRefs]);

  return (
    <div 
      ref={reviewDetailsRef} 
      className="absolute bg-white border border-[#ccc] rounded w-[750px] right-0 top-14 ml-3 z-50 review-details-card"
    >
      <div className="grid grid-cols-2 gap-2 p-2">
        <div className="flex items-center">
          <p className="text-sm text-gray-500">Android Os Version: </p>
          <p
            className={`text-sm pl-1 ${
              review?.androidOsVersion ? "text-black" : "text-gray-500"
            }`}
          >
            {" "}
            {review?.androidOsVersion || "N/A"}
          </p>
        </div>
        <div className="flex items-center">
          <p className="text-sm text-gray-500">App Version Code: </p>
          <p
            className={`text-sm pl-1 ${
              review?.appVersionCode ? "text-black" : "text-gray-500"
            }`}
          >
            {review?.appVersionCode || "N/A"}
          </p>
        </div>
        <div className="flex items-center">
          <p className="text-sm text-gray-500">App Version Name: </p>
          <p
            className={`text-sm pl-1 ${
              review?.appVersionName ? "text-black" : "text-gray-500"
            }`}
          >
            {review?.appVersionName || "N/A"}
          </p>
        </div>
        <div className="flex items-center">
          <p className="text-sm text-gray-500">CPU Make: </p>
          <p
            className={`text-sm pl-1 ${
              review?.cpuMake ? "text-black" : "text-gray-500"
            }`}
          >
            {review?.cpuMake || "N/A"}
          </p>
        </div>
        <div className="flex items-center">
          <p className="text-sm text-gray-500">CPU Model: </p>
          <p
            className={`text-sm pl-1 ${
              review?.cpuModel ? "text-black" : "text-gray-500"
            }`}
          >
            {review?.cpuModel || "N/A"}
          </p>
        </div>
        <div className="flex items-center">
          <p className="text-sm text-gray-500">Device: </p>
          <p
            className={`text-sm pl-1 ${
              review?.device ? "text-black" : "text-gray-500"
            }`}
          >
            {review?.device || "N/A"}
          </p>
        </div>
        <div className="flex items-center">
          <p className="text-sm text-gray-500">Device Class:</p>
          <p
            className={`text-sm pl-1 ${
              review?.deviceClass ? "text-black" : "text-gray-500"
            }`}
          >
            {review?.deviceClass || "N/A"}
          </p>
        </div>
        <div className="flex items-center">
          <p className="text-sm text-gray-500">GlEs Version:</p>
          <p
            className={`text-sm pl-1 ${
              review?.glEsVersion ? "text-black" : "text-gray-500"
            }`}
          >
            {review?.glEsVersion || "N/A"}
          </p>
        </div>
        <div className="flex items-center">
          <p className="text-sm text-gray-500">Manufacturer:</p>
          <p
            className={`text-sm pl-1 ${
              review?.manufacturer ? "text-black" : "text-gray-500"
            }`}
          >
            {review?.manufacturer || "N/A"}
          </p>
        </div>
        <div className="flex items-center">
          <p className="text-sm text-gray-500">Native Platform:</p>
          <p
            className={`text-sm pl-1 ${
              review?.nativePlatform ? "text-black" : "text-gray-500"
            }`}
          >
            {review?.nativePlatform || "N/A"}
          </p>
        </div>
        <div className="flex items-center">
          <p className="text-sm text-gray-500">original Language:</p>
          <p
            className={`text-sm pl-1 ${
              review?.originalLang ? "text-black" : "text-gray-500"
            }`}
          >
            {review?.originalLang || "N/A"}
          </p>
        </div>
        <div className="flex items-center">
          <p className="text-sm text-gray-500">original Rating:</p>
          <p
            className={`text-sm pl-1 ${
              review?.originalRating ? "text-black" : "text-gray-500"
            }`}
          >
            {review?.originalRating || "N/A"}
          </p>
        </div>
        <div className="flex items-center">
          <p className="text-sm text-gray-500">Posted Date:</p>
          <p
            className={`text-sm pl-1 ${
              review?.postedDate ? "text-black" : "text-gray-500"
            }`}
          >
            {review?.postedDate || "N/A"}
          </p>
        </div>
        <div className="flex items-center">
          <p className="text-sm text-gray-500">Posted Reply:</p>
          <p
            className={`text-sm pl-1 ${
              review?.postedReply ? "text-black" : "text-gray-500"
            }`}
          >
            {review?.postedReply || "N/A"}
          </p>
        </div>
        <div className="flex items-center">
          <p className="text-sm text-gray-500">Product Name:</p>
          <p
            className={`text-sm pl-1 ${
              review?.productName ? "text-black" : "text-gray-500"
            }`}
          >
            {review?.productName || "N/A"}
          </p>
        </div>
        <div className="flex items-center">
          <p className="text-sm text-gray-500">RAM MB:</p>
          <p
            className={`text-sm pl-1 ${
              review?.ramMb ? "text-black" : "text-gray-500"
            }`}
          >
            {review?.ramMb || "N/A"}
          </p>
        </div>
        <div className="flex items-center">
          <p className="text-sm text-gray-500">Screen Density Dpi:</p>
          <p
            className={`text-sm pl-1 ${
              review?.screenDensityDpi ? "text-black" : "text-gray-500"
            }`}
          >
            {review?.screenDensityDpi || "N/A"}
          </p>
        </div>
        <div className="flex items-center">
          <p className="text-sm text-gray-500">Screen Height Px:</p>
          <p
            className={`text-sm pl-1 ${
              review?.screenHeightPx ? "text-black" : "text-gray-500"
            }`}
          >
            {review?.screenHeightPx || "N/A"}
          </p>
        </div>
        <div className="flex items-center">
          <p className="text-sm text-gray-500">Screen Width Px:</p>
          <p
            className={`text-sm pl-1 ${
              review?.screenWidthPx ? "text-black" : "text-gray-500"
            }`}
          >
            {review?.screenWidthPx || "N/A"}
          </p>
        </div>
        <div className="flex items-center">
          <p className="text-sm text-gray-500">Thumbs Down Count:</p>
          <p
            className={`text-sm pl-1 ${
              review?.thumbsDownCount ? "text-black" : "text-gray-500"
            }`}
          >
            {review?.thumbsDownCount || "N/A"}
          </p>
        </div>
        <div className="flex items-center">
          <p className="text-sm text-gray-500">Thumbs Up Count:</p>
          <p
            className={`text-sm pl-1 ${
              review?.thumbsUpCount ? "text-black" : "text-gray-500"
            }`}
          >
            {review?.thumbsUpCount || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};
export default ReviewsCard;

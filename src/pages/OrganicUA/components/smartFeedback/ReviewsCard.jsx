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
  studio_slug,
  templates,
  setTemplates,
  searchText
}) => {
  const userData = useSelector((state) => state.user.user);
  const studios = useSelector((state) => state.admin.studios);
  const [showOriginalLangComment, setShowOriginalLangComment] = useState([]);
  const [translateReply, setTranslateReply] = useState([]);
  const [translateCurrentReply, setTranslateCurrentReply] = useState([]);
  const [translateLoader, setTranslateloader] = useState(false);
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
  const wrapperRef = useRef(null);
  const editRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => {
    setShowTemplateDropdown("");
  });
  useOutsideAlerter(editRef, () => {
    closeEditingMode();
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

  const closeEditingMode = () => {
    setReviews((prev) => prev.filter(x => {
      if(x.isEdit){
        x.isEdit = false;
      }
      return prev
    }))
  }

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
      setTranslateloader(true);
      const requestBody = {
        review:
          selectedGame.platform === "Android"
            ? review.postedReply
            : isReview
            ? `${review?.title}/n ${review.body}`
            : review.responsebody,
        reviewId: review.id,
        gameId: selectedGame.id,
        studioId: studio_slug
          ? studios.filter((x) => x.slug === studio_slug)[0].id
          : userData.studio_id,
        platform: selectedGame.platform === "Android" ? "android" : "apple",
        contentType:
          selectedGame.platform === "Android"
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
      setTranslateloader(false);
    } catch (err) {
      console.log(err);
      setTranslateloader(false);
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
    return `border-[${color}]`;
  };

  const onEditReply = (review) => {
    setReviews((prev) =>
      prev.map((x) => {
        if (x.id === review.id) {
          return {
            ...x,
            reply:
              selectedGame.platform === "Android"
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
      if (selectedGame.platform === "Apple" && !review.translated_review) {
        translateReplyAndSave(review, true);
      }
    }
  };
  const showReviewtoReplytranslation = (review) => {
    if(!review.reply){
      return
    }
    if (translateCurrentReply.includes(review.id)) {
      const removeReviewTranslation = translateCurrentReply.filter(
        (x) => x !== review.id
      );
      setTranslateCurrentReply(removeReviewTranslation);
      setReviews((prev) =>
        prev.map((x) => {
          if (x.id === review.id) {
            return { ...x, reply: review.originalReply };
          }
          return x;
        })
      );
    } else {
      const addReviewTranslation = [...translateCurrentReply, review.id];
      setTranslateCurrentReply(addReviewTranslation);
      !review.translatedReply
        ? handleTranslate(review)
        : setReviews((prev) =>
            prev.map((x) => {
              if (x.id === review.id) {
                return { ...x, reply: review.translatedReply };
              }
              return x;
            })
          );
    }
  };
  const handleTranslate = async (review) => {
    try {
      setTranslateloader(true);
      const response = await api.post("/translateTemplate", {
        review: review.reply,
        template: review.postedReply || review?.body,
      });
      const translatedReply = response.data.translatedReply;
      setReviews((prev) =>
        prev.map((x) => {
          if (x.id === review.id) {
            return {
              ...x,
              originalReply: review.reply,
              reply: translatedReply,
              translatedReply,
            };
          }
          return x;
        })
      );
    } catch (error) {
      console.error("Error translating reply:", error);
    } finally {
      setTranslateloader(false);
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
        comment: review.comment || review.body,
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
        return;
      }
      const review = reviews.find(
        (x) => x.reviewId === reviewId || x.appstorereviewid === reviewId
      );
      if (!review.reply) {
        console.error("Review not found");
        return;
      }
      const url =
        selectedGame.platform === "Android" ? "/postReply" : "/postAppleReply";
      const requestbody =
        selectedGame.platform === "Android"
          ? {
              reviewId: reviewId,
              packageName: selectedGame.package_name,
              reply: review.reply,
            }
          : {
              reviewId: reviewId,
              reply: review.reply,
              studio_id: studio_slug
                ? studios.filter((x) => x.slug === studio_slug)[0].id
                : userData.studio_id,
            };
      const response = await api.post(url, requestbody);
      if (response.status === 200) {
        selectedGame.platform === "Android"
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
        <div className="p-3 border-t-[0.5px] border-y-[#ccc]" key={review?.id}>
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
                <p className="border border-dashed rounded px-2 text-sm text-gray-500 ml-2">
                  {review?.reviewerLanguage || review?.territory}
                </p>
              )}
              {review?.appVersionName && (
                <p className="border border-dashed rounded px-2 text-sm text-gray-500 ml-2">
                  {review?.appVersionName}
                </p>
              )}
              {review?.productName && (
                <p className="border border-dashed rounded px-2 text-sm text-gray-500 ml-2">
                  {review?.productName}
                </p>
              )}
            </div>

            {review?.title && !showOriginalLangComment.includes(review.id) && (
              <p className="text-md font-bold">{review?.title}</p>
            )}

            {showOriginalLangComment.includes(review.id) && !translateLoader ? (
              <p className="text-md">
                {review?.comment ||
                  review?.translatedReview ||
                  review?.translated_review}
              </p>
            ) : (
              <HighlightText text={review?.originalLang || review?.comment || review?.body} searchTerm={searchText} />
            )}
            {(selectedGame.platform === "Android" && review.reviewerLanguage !== 'en' || selectedGame.platform === "Apple") && <span
              className="text-[#5e80e1] underline text-[13px] cursor-pointer"
              onClick={() => showReviewtranslation(review)}
            >
              {showOriginalLangComment.includes(review.id)
                ? "Show Original"
                : "Show Translation"}
            </span>}
            <p>
              Tags:{" "}
              {review?.tags?.map((tag, index) => (
                <span
                  className={`px-2 py-1 text-sm border border-dashed rounded mx-1 ${getRandomColor()}`}
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
                  {/* {review.reply && (
                    <span
                      className="text-[#5e80e1] underline text-[13px] cursor-pointer pl-2"
                      onClick={() => showReviewtoReplytranslation(review)}
                    >
                      {translateCurrentReply.includes(review.id)
                        ? "Show Original"
                        : "Show Translation"}
                    </span>
                  )} */}
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
                    ) : <></>}
                    <div className="flex pr-2 pb-2">
                      {review.isAIReply && (
                        <button
                          className="border border-[#ccc] rounded py-1 px-3 mr-2 text-sm"
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
                        className={`bg-[#1174fc] rounded px-3 py-1 mr-2 text-white text-sm ${
                          generativeAILoader === review?.id ? "opacity-40" : ""
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
                          className="border border-[#ccc] flex justify-between items-center rounded py-1 px-3 mr-2 text-sm w-[150px]"
                          onClick={() => setShowTemplateDropdown(review.id)}
                        >
                          {review.template_type
                            ? review.template_type
                            : "Select a template"}
                          <ChevronDownIcon className="w-4 h-5 inline ml-2" />
                        </button>
                        {showTemplateDropdown === review.id && (
                          <div
                            className="absolute bg-white border border-[#ccc] rounded left-0 w-[150px] top-8"
                            ref={wrapperRef}
                          >
                            {templates.map((template) => (
                              <p
                                className="p-2 border-b border-b-[#ccc] cursor-pointer hover:bg-gray-200"
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
                        className={`bg-[#1174fc] rounded px-3 py-1 mr-2 text-white text-sm ${review.reply ? "" : "opacity-40"}`}
                        onClick={() => showReviewtoReplytranslation(review)}
                      >
                        Translate
                      </button>
                      <button
                        className={`bg-[#1174fc] rounded px-3 py-1  text-white text-sm ${
                          postLoader ===
                          (review?.reviewId || review?.appstorereviewid)
                            ? "opacity-40"
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
          studio_slug={studio_slug}
          setTemplates={setTemplates}
          setToastMessage={setToastMessage}
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
          studio_slug={studio_slug}
        />
      )}
    </>
  );
};
export default ReviewsCard;

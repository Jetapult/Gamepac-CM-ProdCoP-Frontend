import moment from "moment";
import { useState } from "react";
import ReactStars from "react-rating-stars-component";
import Pagination from "../../../../components/Pagination";
import api from "../../../../api";
import { useSelector } from "react-redux";
import ToastMessage from "../../../../components/ToastMessage";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

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
}) => {
  const userData = useSelector((state) => state.user.user);
  const studios = useSelector((state) => state.admin.studios);
  const [showOriginalLangComment, setShowOriginalLangComment] = useState([]);
  const [translateReply, setTranslateReply] = useState([]);
  const [translateLoader, setTranslateloader] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [charCountLimitErr, setCharCountLimitErr] = useState("");
  const [isEdit, setIsEdit] = useState("");
  const [toastMessage, setToastMessage] = useState({
    show: false,
    message: "",
    duration: 3000,
    type: "success",
  });
  const onEditReply = (review) => {
    setReviews((prev) =>
      prev.map((x) => {
        if (
          selectedGame.platform === "Android"
            ? x.reviewId === review.reviewId
            : x.appstorereviewid === review.appstorereviewid
        ) {
          return {
            ...x,
            reply:
              selectedGame.platform === "Android"
                ? review.postedReply
                : review.responsebody,
          };
        }
        return x;
      })
    );
    setIsEdit(review.reviewId || review.appstorereviewid);
  };
  const showReviewtranslation = (review) => {
    if (
      showOriginalLangComment.includes(
        review.reviewId || review.appstorereviewid
      )
    ) {
      const removeReviewTranslation = showOriginalLangComment.filter(
        (x) => x !== (review.reviewId || review.appstorereviewid)
      );
      setShowOriginalLangComment(removeReviewTranslation);
    } else {
      const addReviewTranslation = [
        ...showOriginalLangComment,
        review.reviewId || review.appstorereviewid,
      ];
      setShowOriginalLangComment(addReviewTranslation);
      //   if (selectedGame.platform === "Apple") {
      //     handleTranslate(review);
      //   }
    }
  };
  const showReviewtoReplytranslation = (review) => {
    if (translateReply.includes(review.reviewId || review.appstorereviewid)) {
      const removeReviewTranslation = translateReply.filter(
        (x) => x !== review.reviewId || review.appstorereviewid
      );
      setTranslateReply(removeReviewTranslation);
    } else {
      const addReviewTranslation = [
        ...translateReply,
        review.reviewId || review.appstorereviewid,
      ];
      setTranslateReply(addReviewTranslation);
      review.reviewerLanguage !== "en"
        ? handleTranslate(review)
        : setReviews((prev) =>
            prev.map((x) => {
              if (
                selectedGame.platform === "Android"
                  ? x.reviewId === review.reviewId
                  : x.appstorereviewid === review.appstorereviewid
              ) {
                return { ...x, translatedReply: review.postedReply };
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
        reviewerlang: "en",
        template: review.postedReply || review?.body,
      });
      const translatedReply = response.data.translatedReply;
      setReviews((prev) =>
        prev.map((x) => {
          if (
            selectedGame.platform === "Android" &&
            x.reviewId === review.reviewId
          ) {
            return { ...x, translatedReply };
          }
          if (
            selectedGame.platform === "Apple" &&
            x.appstorereviewid === review.appstorereviewid
          ) {
            return { ...x, translatedReview: translatedReply };
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
    const review = reviews.find(
      (x) => x.reviewId === reviewId || x.appstorereviewid === reviewId
    );
    if (!review) {
      console.error("review not found");
      return;
    }
    try {
      const response = await api.post("/replyAssistant", {
        comment: review.comment || review.body,
      });
      const reply = response.data.reply;
      setCharCount(reply.length);
      setCharCountLimitErr(reply.length > 350 ? reply.reviewId : "");
      setReviews((prev) =>
        prev.map((x) => {
          if (
            selectedGame.platform === "Android"
              ? x.reviewId === reviewId
              : x.appstorereviewid === reviewId
          ) {
            return { ...x, reply };
          }
          return c;
        })
      );
    } catch (error) {
      console.error("Error fetching reply:", error);
    }
  };

  const handlePostReply = async (reviewId) => {
    try {
      if (charCountLimitErr) {
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
        selectedGame.platform === "Android" &&
          setReviews((prev) =>
            prev.map((x) => {
              if (
                selectedGame.platform === "Android"
                  ? x.reviewId === reviewId
                  : x.appstorereviewid === reviewId
              ) {
                return {
                  ...x,
                  postedReply: x.reply,
                  isPosted: true,
                  selectedTemplateIndex: "",
                  reply: "",
                  postedDate: new Date().toISOString(),
                };
              }
              return x;
            })
          );
        setIsEdit("");
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
    }
  };
  return (
    <>
      {console.log(reviews, "reviews")}
      {reviews.map((review, index) => (
        <div
          className="p-3 border-t-[0.5px] border-y-[#ccc]"
          key={review?.reviewId || review?.appstorereviewid}
        >
          <div
            className={`mb-2 p-3 border-l-[2px] ${
              review?.userRating || review?.rating === 5
                ? "border-l-rating5"
                : ""
            } ${
              review?.userRating || review?.rating === 4
                ? "border-l-rating4"
                : ""
            } ${
              review?.userRating || review?.rating === 3
                ? "border-l-rating3"
                : ""
            } ${
              review?.userRating || review?.rating === 2
                ? "border-l-rating2"
                : ""
            } ${
              review?.userRating || review?.rating === 1
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

            {review?.title && (
              <p className="text-md font-bold">{review?.title}</p>
            )}

            {showOriginalLangComment.includes(
              review.reviewId || review.appstorereviewid
            ) ? (
              <p className="text-md">
                {review?.comment || review?.translatedReview}
              </p>
            ) : (
              <p className="text-md">
                {review?.originalLang || review?.comment || review?.body}
              </p>
            )}
            <span
              className="text-[#5e80e1] underline text-[13px] cursor-pointer"
              onClick={() => showReviewtranslation(review)}
            >
              {showOriginalLangComment.includes(
                review.reviewId || review.appstorereviewid
              )
                ? "Show Original"
                : "Show Translation"}
            </span>
            <p>
              Tags:{" "}
              <span className="text-[#5e80e1] text-[13px] cursor-pointer">
                + Add tag
              </span>
            </p>
            {(review.postedReply || review?.responsebody) && !isEdit ? (
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
                {translateReply.includes(review.reviewId) &&
                !translateLoader ? (
                  <p className="">{review.translatedReply}</p>
                ) : (
                  <p className="">
                    {review.postedReply || review?.responsebody}
                  </p>
                )}
                <span
                  className="text-[#5e80e1] underline text-[13px] cursor-pointer"
                  onClick={() => showReviewtoReplytranslation(review)}
                >
                  {translateReply.includes(review.reviewId) && !translateLoader
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
                  className={`w-100 border border-[#ccc] rounded p-2 my-2 ${
                    charCountLimitErr ? "border-red-500 border rounded" : ""
                  }`}
                >
                  <textarea
                    className="block outline:none focus:outline-none w-full"
                    placeholder="Reply to review"
                    value={review.reply}
                  />
                  <div className="flex justify-end mt-2">
                    {/* <button className="border border-[#ccc] rounded py-1 px-3 mr-2 text-sm">Save as template</button> */}
                    <button className="border border-[#ccc] rounded py-1 px-3 mr-2 text-sm">
                      Select a template
                    </button>
                    <button
                      className="bg-[#1174fc] rounded px-3 py-1 mr-2 text-white text-sm"
                      onClick={() =>
                        generativeAIReply(
                          review?.reviewId || review?.appstorereviewid
                        )
                      }
                    >
                      Generate AI reply
                    </button>
                    <button
                      className="bg-[#1174fc] rounded px-3 py-1  text-white text-sm"
                      onClick={() =>
                        handlePostReply(
                          review.reviewId || review.appstorereviewid
                        )
                      }
                    >
                      Post reply
                    </button>
                  </div>
                </div>
                {charCount ? (
                  <p
                    className={`text-xs ${
                      charCountLimitErr ? "text-red-500" : ""
                    }`}
                  >
                    Character Count: {charCount}/350{" "}
                  </p>
                ) : (
                  <></>
                )}
                {charCountLimitErr && (
                  <p className="text-red-500">Max 350 characters allowed</p>
                )}
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
    </>
  );
};
export default ReviewsCard;

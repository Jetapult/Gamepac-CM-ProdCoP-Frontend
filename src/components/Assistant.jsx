import React, { useState, useEffect } from "react";
import googlePlayIcon from "../assets/google-play_318-566073.avif";
import appleIcon from "../assets/icon_appstore__ev0z770zyxoy_large_2x.png";
import api from "../api";
import loadingIcon from "../assets/Spinner-1s-200px.svg";
import bellIcon from "../assets/bell-icon.png";
import UpdatedComments from "./UpdatedComments";
import Pagination from "./Pagination";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import ToastMessage from "./ToastMessage";

const Assistant = () => {
  const userData = useSelector((state) => state.user.user);
  const studios = useSelector((state) => state.admin.studios);
  const [selectedApp, setSelectedApp] = useState("google");
  const [selectedGame, setSelectedGame] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingReplyIndex, setLoadingReplyIndex] = useState(null);
  const [posting, setPosting] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [postingIndex, setPostingIndex] = useState(null);
  const [ratingFilter, setRatingFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [viewingDetailsIndex, setViewingDetailsIndex] = useState(null);
  const [showOriginalCommentDetails, setShowOriginalCommentDetails] = useState(
    {}
  );
  const [updateCount, setUpdateCount] = useState(0);
  const [showUpdatedComments, setShowUpdatedComments] = useState(false);
  // Add a new state variable for character count
  const [charCount, setCharCount] = useState(0);
  const [charCountLimitErr, setCharCountLimitErr] = useState("");
  const [totalReviews, setTotalReviews] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [games, setGames] = useState([]);
  const limit = 10;
  const params = useParams();
  const studio_slug = params.studio_slug;
  const [toastMessage, setToastMessage] = useState({
    show: false,
    message: "",
    duration: 3000,
    type: "success",
  });

  useEffect(() => {
    // Clear comments when selectedGame changes
    setComments([]);
  }, [selectedGame]);

  const replyTemplates = [
    {
      reviewType: "positive",
      reviewReply: (userName) =>
        `Hello ${userName}, Thank you so much for taking out your time to write a review. If you like the game, please rate us 5 stars! It really helps the team a lot and motivates them to send fun updates in the future! Thanks!`,
    },
    {
      reviewType: "ads/complaints",
      reviewReply: (userName) =>
        `Hello ${userName}, it's understandable that ads can get annoying. Unfortunately, we need the revenue from ads to keep our games free to play. You can purchase to remove ads for just $1.99. If you have any questions or comments, you can send us an email at feedback@theholycowstudio.com`,
    },
    {
      reviewType: "bugs/glitches",
      reviewReply: (userName) =>
        `Hello ${userName}, our development team will definitely consider your opinion and make the game better. Please email us more specific suggestions at feedback@theholycowstudio.com`,
    },
    {
      reviewType: "loading/installing",
      reviewReply: (userName) =>
        `Hi ${userName}, Sorry that you are facing this problem. Could you please restart your device once and try again? Also please make sure you have enough space on your device. Thank you!`,
    },
  ];

  const handleFetchComments = async () => {
    try {
      setLoading(true);
      const paramData = {
        current_page: currentPage,
        limit: limit,
        game_id: selectedGame.id,
      };
      if (ratingFilter) {
        paramData.rating = ratingFilter;
      }
      if (startDate) {
        paramData.startDate = startDate;
      }
      if (endDate) {
        paramData.endDate = endDate;
      }
      const url =
        selectedApp === "google"
          ? `/v1/organic-ua/google-reviews/${studio_slug || userData.studio_id}`
          : `/v1/organic-ua/fetch-app-store-reviews/${studio_slug || userData.studio_id}`;
      const response = await api.get(url, { params: paramData });
      // When formatting comments initially
      let comments = formatComments(response.data.data);
      setComments(comments);
      setLoading(false);
      setTotalReviews(response.data.totalReviews);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setLoading(false);
    }
  };

  const formatComments = (data) => {
    if (selectedApp === "google") {
      return data.map((comment) => {
        let formattedComment;
        if (comment.originalLang) {
          formattedComment = {
            ...comment,
            comment: comment.originalLang,
            translatedComment: comment.comment,
            reviewId: comment.reviewId, // Store the reviewId
            postedReply: comment.postedReply,
            formattedDate: new Date(comment.date).toLocaleDateString("en-US"),
          };
        } else {
          formattedComment = {
            ...comment,
            translatedComment: null,
            reviewId: comment.reviewId, // Store the reviewId
            postedReply: comment.postedReply,
          };
        }
        return formattedComment;
      });
      // return data.map(comment => ({ ...comment, reply: null }));
    } else if (selectedApp === "apple") {
      return data.map((comment) => ({
        userName: comment.reviewernickname,
        userRating: comment.rating,
        comment: comment.body,
        date: new Date(comment.createddate),
        reviewId: comment.appstorereviewid,
        reply: null,
        postedReply: comment.responsebody,
        responsestate: comment.responsestate,
        postedDate: comment.lastmodifieddate,
      }));
    }
  };

  const handleFetchReply = async (reviewId) => {
    // Find the comment using the reviewId
    const comment = comments.find((c) => c.reviewId === reviewId);
    if (!comment) {
      console.error("Comment not found");
      return;
    }

    setLoadingReplyIndex(reviewId); // Use reviewId to indicate loading
    try {
      const response = await api.post("/replyAssistant", {
        comment: comment.comment,
      });
      const reply = response.data.reply;
      setCharCount(reply.length);
      setCharCountLimitErr(reply.length > 350 ? reply.reviewId : "");
      setComments((prevComments) =>
        prevComments.map((c) => {
          if (c.reviewId === reviewId) {
            return { ...c, reply };
          }
          return c;
        })
      );
      setCharCount(reply.length);
      setCharCountLimitErr(reply.length > 350 ? reviewId : "");
      setLoadingReplyIndex(null);
    } catch (error) {
      console.error("Error fetching reply:", error);
      setLoadingReplyIndex(null);
    }
  };

  const handlePostReply = async (reviewId) => {
    if (charCountLimitErr) {
      return;
    }
    setPosting(true);
    setPostingIndex(reviewId); // Set the postingIndex to the current reviewId
    // Find the comment using the reviewId
    const comment = comments.find((c) => c.reviewId === reviewId);
    if (!comment) {
      console.error("Comment not found");
      setPosting(false);
      setPostingIndex(null); // Reset the postingIndex to null
      return;
    }

    try {
      let response;
      if (selectedApp === "google") {
        response = await api.post("/postReply", {
          reviewId: reviewId,
          packageName: selectedGame.package_name,
          reply: comment.reply,
        });
      } else if (selectedApp === "apple") {
        response = await api.post("/postAppleReply", {
          reviewId: reviewId,
          reply: comment.reply,
          studio_id: studio_slug ? studios.filter(x => x.slug === studio_slug)[0].id : userData.studio_id
        });
      }
      if (response.status === 200) {
        // Update the comment to indicate that the reply has been posted
        selectedApp === "google" &&
          setComments((prevComments) =>
            prevComments.map((c) => {
              if (c.reviewId === reviewId) {
                return {
                  ...c,
                  postedReply: c.reply,
                  isPosted: true,
                  selectedTemplateIndex: "",
                  reply: "",
                  postedDate: new Date().toISOString(),
                };
              }
              return c;
            })
          );
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      if(error.response.data.message){
        setToastMessage({
          show: true,
          message: error.response.data.message,
          type: "error",
        });
      }
    }
    setPosting(false);
    setPostingIndex(null); // Reset the postingIndex to null after posting is done
  };
  const handleTranslateReply = async (comment) => {
    if (!comment.reply || comment.reply.trim() === "") {
      alert("Please write a reply first.");
      return;
    }

    setLoadingReplyIndex(comment.reviewId); // Indicate loading
    try {
      const response = await api.post("/translateTemplate", {
        review: comment.comment,
        template: comment.reply, // Use the current reply for translation
      });
      const translatedReply = response.data.translatedReply;

      setComments((prevComments) =>
        prevComments.map((c) => {
          if (c.reviewId === comment.reviewId) {
            return { ...c, reply: translatedReply };
          }
          return c;
        })
      );
      setCharCount(translatedReply.length);
      setCharCountLimitErr(translatedReply.length > 350 ? comment.reviewId : "");
    } catch (error) {
      console.error("Error translating reply:", error);
    } finally {
      setLoadingReplyIndex(null); // Stop loading indication
    }
  };
  const isCommentUpdated = (comment) => {
    const commentToCompare = comment.translatedComment || comment.comment;
    return (
      comment.originalComment !== commentToCompare ||
      comment.originalRating !== comment.userRating
    );
  };

  useEffect(() => {
    // Calculate the number of comments with updates available using the new logic
    const count = comments.reduce(
      (acc, comment) => acc + (isCommentUpdated(comment) ? 1 : 0),
      0
    );
    setUpdateCount(count);
  }, [comments]);

  const getGamesByStudioId = async () => {
    try {
      const url = studio_slug
        ? `/v1/games/studio/${studio_slug}`
        : `/v1/games/studio/${userData.studio_id}`;
      const paramData = {
        current_page: 1,
        limit: 50,
        game_type: selectedApp === "apple" ? "appstore" : "playstore",
      };
      const games_response = await api.get(url, { params: paramData });
      setGames(games_response.data.data);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    if (studio_slug) {
      getGamesByStudioId();
    }
  }, [studio_slug]);

  useEffect(() => {
    if (userData.studio_id && !studio_slug) {
      getGamesByStudioId();
    }
  }, [userData]);

  useEffect(() => {
    if (selectedGame?.id) {
      handleFetchComments();
    }
  }, [
    currentPage,
    selectedGame,
    ratingFilter,
    endDate,
    startDate,
    selectedApp,
  ]);

  const handleShowUpdatedComments = () => {
    setShowUpdatedComments(!showUpdatedComments);
  };
  return (
    <div className="container mt-10 mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-3xl font-semibold text-center mb-6">
        Reply Assistant
      </h1>
      <div className="flex justify-center space-x-10 mb-4">
        <button
          className={`bg-${
            selectedApp === "google" ? "[#f58174]" : "gray-500"
          } hover:bg-${
            selectedApp === "google" ? "bg-[#eaa399]" : "gray-600"
          } text-white px-4 py-2 rounded transition-transform flex items-center ${
            selectedApp === "google" ? "scale-150" : ""
          }`}
          onClick={() => setSelectedApp("google")}
        >
          <img
            src={googlePlayIcon}
            alt="Google Play Icon"
            className="w-6 h-6 mr-2"
            inline="true"
          />{" "}
          Google Play
        </button>

        <button
          className={`bg-${
            selectedApp === "apple" ? "[#f58174]" : "gray-500"
          } hover:bg-${
            selectedApp === "apple" ? "bg-[#eaa399]" : "gray-600"
          } text-white px-4 py-2 rounded transition-transform flex items-center ${
            selectedApp === "apple" ? "scale-150" : ""
          }`}
          onClick={() => setSelectedApp("apple")}
        >
          <img src={appleIcon} alt="Apple Play Icon" className="w-6 h-6 mr-2" />
          App Store
        </button>
      </div>
      <div className="mb-4">
        <label className="font-semibold block">Select Timeline:</label>
        <div className="flex">
          <div>
            <label className="font-semibold">Start Date:</label>
            <input
              type="date"
              className="border rounded p-2 mr-2"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="font-semibold">End Date:</label>
            <input
              type="date"
              className="border rounded p-2"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="mb-4">
        <label className="font-semibold block">Select Game:</label>
        <select
          className="border rounded p-2 w-full"
          value={selectedGame ? selectedGame.game_name : ""}
          onChange={(e) => {
            const selectedGameName = e.target.value;
            const game = games.find(
              (game) => game.game_name === selectedGameName
            );
            setSelectedGame(game);
            setCurrentPage(1);
          }}
        >
          <option value="">Select a game</option>
          {games.map((game, index) => (
            <option key={index} value={game.game_name}>
              {game.game_name} {game.short_names ? `(${game.short_names})` : ""}
            </option>
          ))}
        </select>
      </div>
      {/* Add the filter dropdown here */}
      <div className="w-64 mb-4 mr-2 relative">
        <label className="font-semibold block">Apply Filter :</label>
        <div className="flex items-center">
          <select
            className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            value={ratingFilter}
            onChange={(e) => {
              setCurrentPage(1);
              setRatingFilter(e.target.value);
            }}
          >
            <option value="">All Ratings</option>
            <option value="1">1 Star</option>
            <option value="2">2 Stars</option>
            <option value="3">3 Stars</option>
            <option value="4">4 Stars</option>
            <option value="5">5 Stars</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 px-2 text-gray-700 top-[35px]">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center">
          <img src={loadingIcon} alt="Loading" className="w-12 h-12 mr-2" />
        </div>
      ) : (
        <div>
          {comments.length > 0 && (
            <div className="relative inline-block w-full text-right">
              <div className="inline-flex items-center justify-end">
                <img
                  src={bellIcon}
                  alt="Bell Icon"
                  className="w-6 h-6 cursor-pointer"
                  onClick={handleShowUpdatedComments}
                />
                {updateCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {updateCount}
                  </span>
                )}
              </div>
            </div>
          )}
          {showUpdatedComments ? (
            <UpdatedComments
              comments={comments}
              onClose={() => setShowUpdatedComments(false)}
            />
          ) : (
            comments
              .filter(
                (comment) =>
                  !ratingFilter ||
                  comment.userRating.toString() === ratingFilter
              )
              .map((comment) => (
                <div
                  key={comment.reviewId}
                  className="bg-gray-100 p-4 mb-2 rounded-md relative"
                >
                  {isCommentUpdated(comment) && (
                    <button
                      type="button"
                      className="text-white bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 rounded absolute top-0 right-0 m-2 mt-3"
                      // className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded absolute top-0 right-0 m-2"
                      onClick={() => {
                        // Toggle the visibility of the original comment details
                        setShowOriginalCommentDetails((prev) => ({
                          ...prev,
                          [comment.reviewId]: !prev[comment.reviewId],
                        }));
                      }}
                    >
                      {showOriginalCommentDetails[comment.reviewId]
                        ? "Hide Details"
                        : "Update Available"}
                    </button>
                  )}
                  <p className="text-lg font-semibold">
                    User: {comment.userName}
                  </p>
                  <p>Rating: {comment.userRating}</p>
                  <p>Comment: {comment.comment}</p>
                  {comment.translatedComment && (
                    <p>Translated Comment: {comment.translatedComment}</p>
                  )}
                  <p>
                    Date:{" "}
                    {new Date(comment.date).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                    })}
                  </p>
                  {comment.lastUpdated && (
                    <p className="mb-2">
                      Last updated date:{" "}
                      {new Date(comment.lastUpdated).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                      })}
                    </p>
                  )}
                  {comment.postedReply && (
                    <div className="mb-4 p-4 bg-blue-100 rounded-lg relative">
                      <p>Posted Reply: {comment.postedReply}</p>
                      {comment.postedDate && (
                        <p className="">
                          Posted Date:{" "}
                          {new Date(comment.postedDate).toLocaleString(
                            "en-IN",
                            { timeZone: "Asia/Kolkata" }
                          )}
                        </p>
                      )}
                      {comment.responsestate && (
                        <p>Response State: {comment.responsestate}</p>
                      )}
                      {comment.responsestate === "PENDING_PUBLISH" && (
                        <p>
                          Responses don’t appear in the App Store instantly.
                          Allow some time for the App Store to publish the
                          response.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Conditionally render the original comment details */}
                  {showOriginalCommentDetails[comment.reviewId] && (
                    <div className="mb-4 p-4 bg-yellow-200 rounded-lg">
                      {comment.originalComment && (
                        <p>Original Comment: {comment.originalComment}</p>
                      )}
                      {comment.originalRating && (
                        <p>Original Rating: {comment.originalRating}</p>
                      )}
                      {comment.date && (
                        <p>
                          Original Date:{" "}
                          {new Date(comment.date).toLocaleString("en-IN", {
                            timeZone: "Asia/Kolkata",
                          })}
                        </p>
                      )}
                    </div>
                  )}

                  {loadingReplyIndex === comment.reviewId && (
                    <img
                      src={loadingIcon}
                      alt="Loading..."
                      className="w-6 h-6 mr-2"
                    />
                  )}
                  {comment.reply && (
                    <div>
                      {editingIndex !== comment.reviewId ? (
                        <div>
                          <p className="text-gray-600 mt-1">
                            Assistant: {comment.reply}
                          </p>
                          <button
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-3"
                            onClick={() => setEditingIndex(comment.reviewId)}
                          >
                            Edit
                          </button>
                        </div>
                      ) : (
                        <div>
                          <textarea
                            rows="4"
                            cols="100"
                            value={comment.reply}
                            onChange={(e) => {
                              const newReply = e.target.value;
                              setCharCount(newReply.length);
                              setCharCountLimitErr(
                                newReply.length > 350 ? comment.reviewId : ""
                              );
                              setComments((prevComments) => {
                                const newComments = [...prevComments];
                                const commentIndex = newComments.findIndex(
                                  (c) => c.reviewId === comment.reviewId
                                );
                                newComments[commentIndex] = {
                                  ...newComments[commentIndex],
                                  reply: newReply,
                                };
                                return newComments;
                              });
                            }}
                            className={`outline-none ${
                              charCountLimitErr
                                ? "border-red-500 border rounded"
                                : ""
                            } p-3`}
                          />
                          <p
                            className={`${
                              charCountLimitErr ? "text-red-500" : ""
                            }`}
                          >
                            Character Count: {charCount}/350{" "}
                          </p>
                          {charCountLimitErr && (
                            <p className="text-red-500">
                              Max 350 characters allowed
                            </p>
                          )}
                          <button
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 ml-3 rounded"
                            onClick={() => setEditingIndex(null)}
                          >
                            Save
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {viewingDetailsIndex === comment.reviewId && (
                    <div className="bg-white mb-3 p-3 rounded">
                      {comment.productName && (
                        <p>Device: {comment.productName}</p>
                      )}
                      {comment.reviewerLanguage && (
                        <p>Device Lang: {comment.reviewerLanguage}</p>
                      )}
                      {comment.androidOsVersion && (
                        <p>Android OS Version: {comment.androidOsVersion} </p>
                      )}
                      {comment.appVersionName && (
                        <p>App Version Name : {comment.appVersionName}</p>
                      )}
                      {comment.thumbsDownCount !== null && (
                        <p> Thumbs Down Count : {comment.thumbsDownCount}</p>
                      )}
                      {comment.thumbsUpCount !== null && (
                        <p>Thumbs Up Count : {comment.thumbsUpCount}</p>
                      )}
                      {comment.screenWidthPx && (
                        <p>Screen Width : {comment.screenWidthPx}</p>
                      )}
                      {comment.screenHeightPx && (
                        <p>Screen Height : {comment.screenHeightPx}</p>
                      )}
                      {comment.nativePlatform && (
                        <p>Native Platform : {comment.nativePlatform}</p>
                      )}
                      {comment.ramMb && (
                        <p>Ram : {(comment.ramMb / 1024).toFixed(2)} </p>
                      )}
                      {comment.lastUpdated && (
                        <p>
                          Last Updated :{" "}
                          {new Date(comment.lastUpdated).toLocaleString(
                            "en-IN",
                            { timeZone: "Asia/Kolkata" }
                          )}{" "}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                      onClick={() => {
                        if (viewingDetailsIndex === comment.reviewId) {
                          setViewingDetailsIndex(null);
                        } else {
                          setViewingDetailsIndex(comment.reviewId);
                        }
                      }}
                    >
                      {viewingDetailsIndex === comment.reviewId
                        ? "See Less"
                        : "See More"}
                    </button>
                    <div className="flex mt-2">
                      <button
                        className="bg-[#f58174] hover:bg-[#eaa399] text-white px-4 py-2 rounded mr-2"
                        onClick={() => handleFetchReply(comment.reviewId)}
                      >
                        Ask Assistant
                      </button>
                      <select
                        className="border rounded p-2 mr-2"
                        value={comment.selectedTemplateIndex || ""}
                        onChange={(e) => {
                          const newSelectedTemplateIndex =
                            e.target.value === "" ? null : e.target.value;
                          const newSelectedTemplateReply =
                            newSelectedTemplateIndex !== null
                              ? replyTemplates[
                                  newSelectedTemplateIndex
                                ].reviewReply(comment.userName)
                              : "";
                          setCharCount(newSelectedTemplateReply.length); // Update the character count here
                          setCharCountLimitErr(
                            newSelectedTemplateReply.length > 350
                              ? comment.reviewId
                              : ""
                          );
                          setComments((prevComments) =>
                            prevComments.map((c) => {
                              if (c.reviewId === comment.reviewId) {
                                // Use unique identifier instead of index
                                return {
                                  ...c,
                                  reply: newSelectedTemplateReply,
                                  selectedTemplateIndex:
                                    newSelectedTemplateIndex,
                                };
                              }
                              return c;
                            })
                          );
                        }}
                      >
                        <option value="">Select a template</option>
                        {replyTemplates.map((template, idx) => (
                          <option key={idx} value={idx}>
                            {template.reviewType}
                          </option>
                        ))}
                      </select>
                      <button
                        className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded mr-2"
                        onClick={() => handleTranslateReply(comment)}
                      >
                        Translate Reply
                      </button>
                      {comment.isPosted ? (
                        <button
                          className="text-white bg-green-500 px-4 py-2 rounded cursor-default"
                          disabled={true}
                        >
                          Posted
                        </button>
                      ) : (
                        comment.userRating !== 5 && ( // To disable posting for reviews with userRating as 5.
                          <button
                            className={`text-white px-4 py-2 rounded ${
                              charCountLimitErr === comment.reviewId
                                ? "cursor-not-allowed bg-gray-300 "
                                : "bg-blue-500 hover:bg-blue-600"
                            }`}
                            onClick={() => handlePostReply(comment.reviewId)}
                            disabled={postingIndex === comment.reviewId}
                          >
                            {postingIndex === comment.reviewId
                              ? "Posting..."
                              : "Post"}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      )}
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
    </div>
  );
};

export default Assistant;

import React ,{ useState, useEffect } from 'react';
// Import the comment component if you have one, or define how each comment should be displayed

const UpdatedComments = ({ comments }) => {
  // Filter comments with updates available
  const [showOriginalCommentDetails, setShowOriginalCommentDetails] = useState({});

  return (
    <div className="updated-comments-section">
      {comments.length > 0 ? (
        comments.map((comment) => (
            <div key={comment.reviewId} className="bg-gray-100 p-4 mb-2 rounded-md relative">
            {comment.lastUpdated && comment.lastUpdated !== comment.date && (
   <button type="button" className="text-white bg-gradient-to-br from-pink-500 to-orange-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 rounded absolute top-0 right-0 m-2 mt-3"
     // className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded absolute top-0 right-0 m-2"
     onClick={() => {
       // Toggle the visibility of the original comment details
       setShowOriginalCommentDetails(prev => ({
         ...prev,
         [comment.reviewId]: !prev[comment.reviewId]
       }));
     }}
   >
     {showOriginalCommentDetails[comment.reviewId] ? 'Hide Details' : 'Update Available'}
   </button>
 )}
           <p className='text-lg font-semibold'>User: {comment.userName}</p>
           <p>Rating: {comment.userRating}</p>
           <p>Comment: {comment.comment}</p>
           {comment.translatedComment && (
 <p>Translated Comment: {comment.translatedComment}</p>
)}
           <p>Date:  {new Date(comment.date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
           {comment.postedReply && (
             <div className='mb-4 p-4 bg-blue-100 rounded-lg'>
 <p>Posted Reply: {comment.postedReply}</p>
 </div>
)}
       {/* Conditionally render the original comment details */}
       {showOriginalCommentDetails[comment.reviewId] && (
        <div className='mb-4 p-4 bg-yellow-200 rounded-lg'>
          {comment.originalComment && <p>Original Comment: {comment.originalComment}</p>}
          {comment.originalRating  &&<p>Original Rating: {comment.originalRating}</p>}
          {comment.lastUpdated &&<p>Last Updated: {new Date(comment.lastUpdated).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>}
        </div>
      )}

</div>
        ))
      ) : (
        <div className="flex justify-center items-center h-20"> {/* Adjust height as needed */}
        <p className="text-lg font-semibold text-gray-500">No updates available.</p>
      </div>
      )}
    </div>
  );
};

export default UpdatedComments;
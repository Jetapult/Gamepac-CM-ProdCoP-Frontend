import React from "react";
import { Star } from "@solar-icons/react";

const StarRating = ({ rating, size = 16 }) => {
  return (
    <div className="flex gap-1 items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          weight={star <= rating ? "Bold" : "Linear"}
          color="#FFC322"
        />
      ))}
    </div>
  );
};

export default StarRating;


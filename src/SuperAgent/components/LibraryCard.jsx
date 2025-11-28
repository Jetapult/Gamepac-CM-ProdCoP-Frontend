import React from "react";

const LibraryCard = ({
  image,
  icon,
  duration = "2 mins",
  authorName,
  authorRole = "Game Director",
  date,
  title,
  description,
  summary,
}) => {
  // Get the first letter of author name for avatar
  const authorInitial = authorName?.charAt(0).toUpperCase() || "A";

  return (
    <div className="bg-[#f1f1f1] border border-[#e6e6e6] rounded-[12px] flex flex-col overflow-hidden">
      {/* Thumbnail Image Section */}
      <div className="relative h-[200px] w-full">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />

        {/* Icon Badge */}
        <div className="absolute left-[10px] top-[12px] size-[46px]">
          <div className="relative size-[46px]">
            <div className="absolute inset-0 bg-[#2C895C] rounded-full" />
            <div className="absolute left-[11px] top-[11px] size-[24px] flex items-center justify-center">
              {icon}
            </div>
          </div>
        </div>

        {/* Duration Badge */}
        <div className="absolute right-[10px] top-[169px] bg-[#141414] rounded-[10px] px-2 py-0.5">
          <p className="font-urbanist text-[11px] text-white leading-normal">
            {duration}
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col gap-2.5 px-2 py-2.5 flex-1">
        {/* Author Info & Date */}
        <div className="flex items-center justify-between pb-1.5 border-b border-[#f1f1f1]">
          <div className="flex items-center gap-2">
            {/* Avatar */}
            <div className="size-[35px] bg-[#dfdfdf] rounded-full flex items-center justify-center">
              <span className="font-urbanist font-medium text-[20px] text-[#6d6d6d]">
                {authorInitial}
              </span>
            </div>
            {/* Author Details */}
            <div className="flex flex-col gap-0.5">
              <p className="font-urbanist text-[12px] text-[#141414] leading-[15px]">
                {authorName}
              </p>
              <p className="font-urbanist text-[10px] text-[#b0b0b0] leading-normal">
                {authorRole}
              </p>
            </div>
          </div>
          {/* Date */}
          <p className="font-urbanist text-[11px] text-[#b0b0b0] leading-normal">
            {date}
          </p>
        </div>

        {/* Title & Description */}
        <div className="flex flex-col gap-1.5">
          {/* Title */}
          <div className="h-[63px] flex items-start">
            <p className="font-urbanist font-medium text-[14px] text-[#575757] leading-[21px] line-clamp-3">
              {title}
            </p>
          </div>

          {/* Summary */}
          <p className="font-urbanist text-[12px] text-[#6d6d6d] leading-[15px] line-clamp-4">
            {summary}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LibraryCard;

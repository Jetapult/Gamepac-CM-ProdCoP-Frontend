import React from "react";

const TemplateCard = ({ icon, title, description, image, iconBg, onClick }) => {
  return (
    <div className="bg-[#f1f1f1] border border-[#e6e6e6] rounded-[12px] hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <div className="p-4">
        {/* Icon */}
        <div className="mb-3.5 inline-flex">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: iconBg }}
          >
            <div className="text-[#f6f6f6]">{icon}</div>
          </div>
        </div>

        {/* Title and Description */}
        <div className="mb-3.5 min-h-[100px] max-h-[100px]">
          <h3
            className="text-[14px] text-[#575757] mb-2"
            style={{
              fontFamily: "Urbanist, sans-serif",
              lineHeight: "21px",
            }}
          >
            {title}
          </h3>
          <p
            className="text-[12px] text-[#6d6d6d]"
            style={{
              fontFamily: "Urbanist, sans-serif",
              lineHeight: "15px",
            }}
          >
            {description}
          </p>
        </div>

        {/* Image */}
        <div className="rounded-t-[12px]">
          <img
            src={image}
            alt={title}
            className="w-full h-[126px] object-cover rounded-[12px]"
          />
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;

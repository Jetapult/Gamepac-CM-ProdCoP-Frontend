import React from "react";

const UserMessage = ({ content }) => {
  return (
    <div className="flex flex-col items-end gap-4 max-w-[400px] ml-auto">
      <div className="bg-white border border-[#e6e6e6] rounded-tl-lg rounded-tr-lg rounded-bl-lg px-4 py-3">
        <p
          className="text-base text-[#141414]"
          style={{ fontFamily: "Urbanist, sans-serif", lineHeight: "24px" }}
        >
          {content}
        </p>
      </div>
    </div>
  );
};

export default UserMessage;

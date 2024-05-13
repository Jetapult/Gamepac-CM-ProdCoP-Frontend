import { ArrowLongLeftIcon } from "@heroicons/react/20/solid";
import React from "react";
import { useNavigate } from "react-router-dom";

function Match3Game() {
  const navigate = useNavigate();
  const goback = () => {
    navigate("/html5-games");
  };

  return (
    <div className="absolute top-0 bottom-0 left-0 right-0 z-50">
      <p
        className="text-white absolute top-6 left-6 cursor-pointer"
        onClick={goback}
      >
        <ArrowLongLeftIcon className="w-6 h-6 inline ml-2" />
        back
      </p>
      <iframe src="/html5/match-3.html" className="w-full h-screen"></iframe>
    </div>
  );
}

export default Match3Game;

import { ArrowLongLeftIcon } from "@heroicons/react/20/solid";
import React from "react";
import { useNavigate } from "react-router-dom";

function MhmPlayable() {
  const navigate = useNavigate();
  const goback = () => {
    navigate("/html5-games");
  };
  return (
    <div className="absolute top-0 bottom-0 left-0 right-0 z-50">
      <iframe
        src="/html5/MHM-home-decore.html"
        className="w-full h-screen"
      ></iframe>
    </div>
  );
}

export default MhmPlayable;

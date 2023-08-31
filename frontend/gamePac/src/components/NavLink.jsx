import React from "react";
import { useNavigate } from "react-router-dom";

const NavLink = ({ children, href, ...props }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(href)}
      {...props}
      className={`py-2.5 px-4 text-center rounded-lg duration-150 ${
        props?.className || ""
      }`}
    >
      {children}
    </button>
  );
};

export default NavLink;

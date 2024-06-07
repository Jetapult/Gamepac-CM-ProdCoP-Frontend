import { ChevronRightIcon, HomeIcon } from "@heroicons/react/20/solid";
import { useNavigate } from "react-router-dom";

const BreadCrumbs = ({ name }) => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center">
      <p
        className="group hover:bg-[#0000000d] px-3 hover:rounded-full cursor-pointer"
        onClick={() => navigate("/docs/overview")}
      >
        <HomeIcon className="inline w-4 h-4 text-[#092139] group-hover:text-[#ff1053]" />
      </p>
      <ChevronRightIcon className="inline w-4 h-4 opacity-50 mr-2" />
      <p className="bg-[#0000000d] px-3 rounded-full py-1 text-[14px] text-[#ff1053]">
        {name}
      </p>
    </div>
  );
};
export default BreadCrumbs;

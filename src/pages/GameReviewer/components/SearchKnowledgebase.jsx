import { useState } from "react";

const SearchKnowledgebase = () => {
  const [searchText, setSearchText] = useState("");
  const handleChange = (event) => {
    const { value } = event.target;
    setSearchText(value);
  }
  return (
    <div className="">
      <input
        type="text"
        placeholder="Search"
        className="border border-[#ccc] mt-3 rounded-xl w-full px-2 py-1"
        value={searchText}
        onChange={handleChange}
      />
    </div>
  );
};
export default SearchKnowledgebase;

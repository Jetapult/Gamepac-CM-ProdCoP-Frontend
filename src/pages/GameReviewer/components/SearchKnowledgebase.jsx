import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import {  XCircleIcon } from "@heroicons/react/24/outline";

const SearchKnowledgebase = ({fetchKnowledgebase, searchText, setSearchText}) => {
  const handleChange = (event) => {
    const { value } = event.target;
    setSearchText(value);
    if(value.length === 0) {
      fetchKnowledgebase(1);
    }
  }
  return (
    <div className="relative">
      <MagnifyingGlassIcon className="w-5 h-5 absolute left-2 top-3 text-gray-500" />
      <input
        type="text"
        placeholder="Search"
        className="border border-[#ccc] mt-1 rounded-xl w-full px-2 py-1 pl-8"
        value={searchText}
        onChange={handleChange}
      />
      {searchText.length > 0 && (
        <XCircleIcon
          className="w-5 h-5 absolute right-2 top-3 cursor-pointer text-gray-500"
          onClick={() => {
            setSearchText("");
            fetchKnowledgebase(1, "");
          }}
        />
      )}
    </div>
  );
};
export default SearchKnowledgebase;

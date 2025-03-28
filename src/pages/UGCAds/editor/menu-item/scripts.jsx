import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "../../components/ui/scroll-area";
import useLayoutStore from "../../store/use-layout-store";

export const Scripts = () => {
  const [value, setValue] = useState("");
  const { setGptScriptWriterPopup, gptScriptWriterPopup } = useLayoutStore();
  const textareaRef = useRef(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="text-sm flex-none text-text-primary font-medium h-12  flex items-center px-4">
        Script
      </div>
      {/* <button
        className="text-sm text-text-primary font-medium h-12 px-4 bg-[#B9FF66] mx-4 rounded"
        onClick={() => setGptScriptWriterPopup(true)}
      >
        GPT script writer
      </button>
      <div className="flex items-center my-4 px-4">
        <div className="flex-grow h-px bg-gray-300"></div>
        <span className="text-sm text-text-primary font-medium px-4">OR</span>
        <div className="flex-grow h-px bg-gray-300"></div>
      </div> */}
      <ScrollArea className="px-4 py-2">
        <div className="border rounded-md bg-white">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            placeholder="Write your script here..."
            className="w-full min-h-[100px] p-3 resize-none focus:outline-none outline-none"
            style={{ overflow: "hidden" }}
          />
          <button className="bg-[#B9FF66] px-4 py-2 rounded-md mr-auto">
            Generate
          </button>
        </div>
      </ScrollArea>
    </div>
  );
};

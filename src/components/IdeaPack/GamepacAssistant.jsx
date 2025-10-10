import {
    File,
    Mic,
    Sparkles,
    SlidersHorizontal,
  } from "lucide-react";

const GamepacAssistant = () => {
  return (
    <div className="bg-[#303030] rounded-[20px]  border-[0.5px] border-[#303030] h-full flex flex-col">
            <div className="bg-[#0E0E0F59] flex items-center justify-between p-4 rounded-[20px] border-b-0">
              <h2 className="text-white text-[20px] font-bold">
                Gamepac Assistant
              </h2>
              <button className="bg-white text-[#303030] rounded-full px-3 py-1 text-xs font-medium">
                New Chat
              </button>
            </div>
            <div className="p-2 flex flex-col flex-1">
              <div className="text-center text-gray-300 text-xs mb-4">
                Friday, October 3
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {/* User message (right) */}
                <div className="flex w-full justify-end">
                  <div className="max-w-[80%] bg-[#3a3a3a] border border-[#535353] rounded-xl p-4 text-gray-200 text-sm text-left">
                    How are the downloads of merge-based puzzle games in the US
                    vs India?
                  </div>
                </div>

                {/* Assistant reply (left) */}
                <div className="flex w-full justify-start">
                  <div className="max-w-[85%] bg-[#4a4a4a] border border-[#5a5a5a] rounded-xl p-4 text-gray-200 text-sm">
                    <ul className="list-disc ml-5 space-y-4">
                      <li>
                        Since Growth is high and Retention is in the Top 25%,
                        merge-based puzzle games are gaining strong traction
                        globally.
                      </li>
                      <li>
                        In markets like the US, downloads are likely higher but
                        more expensive (higher CPI).
                      </li>
                      <li>
                        In India, downloads would be cheaper but monetization
                        may be weaker.
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Chips under reply */}
                <div className="flex gap-2">
                  <button className="px-3 py-1 rounded-full border border-[#7a7a7a] text-xs text-white">
                    Expand on this further
                  </button>
                  <button className="px-3 py-1 rounded-full border border-[#7a7a7a] text-xs text-white">
                    Other country comparison
                  </button>
                </div>
              </div>

              {/* Input pinned to bottom */}
              <div className="pt-4 bg-[#0E0E0F59] p-4 rounded-[20px]">
                <div className="relative">
                  <textarea
                    className="w-full rounded-[16px] p-3 pr-10 border border-[#545454]  bg-[#2f2f2f] text-gray-300 text-sm"
                    placeholder="Ask, add files or find anything"
                  ></textarea>
                  <button
                    className="absolute top-3 right-3 text-white hover:text-gray-400 transition-colors"
                    aria-label="settings"
                  >
                    <SlidersHorizontal size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <button className="w-9 h-9 rounded-full bg-white  border border-[#6b6b6b]  flex items-center justify-center">
                    <File size={16} />
                  </button>
                  <div className="flex items-center gap-2">
                    <button className="w-9 h-9 rounded-full bg-white  border border-[#6b6b6b] flex items-center justify-center">
                      <Mic size={16} />
                    </button>
                    <button className="rounded-full bg-white text-[#303030] px-4 py-2 text-xs font-semibold flex items-center gap-2">
                      Ask AI <Sparkles size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
  )
}

export default GamepacAssistant
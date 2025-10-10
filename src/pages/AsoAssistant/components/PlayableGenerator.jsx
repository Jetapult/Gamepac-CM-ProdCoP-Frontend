import React from "react";
import { ArrowUpRight } from "lucide-react";
import PlayableMakerImage from "../../../assets/playable-showcase.png";

const PlayableGenerator = () => {
  return (
    <div className="w-full max-w-[800px]">
      <div className="border border-gray-200 rounded-md p-6 bg-white shadow-sm relative mb-8">
        <h1 className="text-xl font-bold mb-6">Playable Ads</h1>
        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <h2 className="text-xl text-[#2e1065] mb-4">
                Create playable and interactive ads lightning fast without
                coding!
              </h2>

              <div className="mt-8">
                <a
                  href="/video-editor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 rounded-md bg-gradient-to-r from-[#b9ff66] to-[#84cc16] hover:from-[#84cc16] hover:to-[#4d7c0f] text-black font-medium transition-colors"
                >
                  Get playables
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                <img
                  src={PlayableMakerImage}
                  alt="Playable Ad Examples"
                  className="max-w-full rounded-md shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayableGenerator;

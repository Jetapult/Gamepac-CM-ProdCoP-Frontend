import React, { useState } from "react";
import Sidebar from "../components/sidebar";
import LibraryCard from "../components/LibraryCard";
import {
  Notebook2,
  GraphUp,
  SmileCircle,
  Lightbulb,
  Refresh,
  Book2,
} from "@solar-icons/react";
import { useSelector } from "react-redux";

// Placeholder images - these should be replaced with actual assets
const placeholderImages = {
  report1:
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
  report2:
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
  analytics:
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
  financial:
    "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=400&fit=crop",
};

const Library = () => {
  const [activeFilter, setActiveFilter] = useState("recommended");
  const isSiderbarOpen = useSelector(
    (state) => state.superAgent.isSiderbarOpen
  );

  const filters = [
    "Game Director Report",
    "ComPac",
    "ScalePac",
    "LiveOps",
    "UA Playbook",
    "Financial Reporting",
  ];

  const libraryItems = [
    {
      id: 1,
      image: placeholderImages.report1,
      icon: (
        <Notebook2 weight="Linear" className="size-[24px] text-[#f6f6f6]" />
      ),
      duration: "2 mins",
      authorName: "Arjun Mehta",
      authorRole: "Game Director",
      date: "Sep 12, 2025",
      title:
        "Game Director Report for 10-11-25 Retention dropped by X%, Spend Increased from last week.",
      summary:
        "This Game Director Report analyzes key shifts observed on 10–11–25. Retention dropped by X%, signaling potential friction in early user flow.",
    },
    {
      id: 2,
      image: placeholderImages.report2,
      icon: (
        <SmileCircle weight="Linear" className="size-[24px] text-[#f6f6f6]" />
      ),
      duration: "5 mins",
      authorName: "Deku",
      authorRole: "Game Director",
      date: "Sep 12, 2025",
      title:
        "Critical bugs down by 18%, UI issues up by 22%.User sentiment stable but trending negative.",
      summary:
        "This report synthesizes app-store reviews into actionable insights for 10–11–25. Most users highlighted menu freezes, button misfires, and purchase flow delays.",
    },
    {
      id: 3,
      image: placeholderImages.analytics,
      icon: (
        <Lightbulb weight="Linear" className="size-[24px] text-[#f6f6f6]" />
      ),
      duration: "5 mins",
      authorName: "Deku",
      authorRole: "Game Director",
      date: "Sep 12, 2025",
      title:
        "Download intent increased to 78%. Visual clarity issues surfaced across two scenes.",
      summary:
        "This breakdown captures how users reacted to key creative elements. Download intent was strong overall, but pacing issues and visual overload reduced clarity.",
    },
    {
      id: 4,
      image: placeholderImages.financial,
      icon: <GraphUp weight="Linear" className="size-[24px] text-[#f6f6f6]" />,
      duration: "5 mins",
      authorName: "Deku",
      authorRole: "Game Director",
      date: "Sep 12, 2025",
      title:
        "CPI increased by 14%, ROAS improved by 6%.Two campaigns flagged for optimization.",
      summary:
        "This report synthesizes financial and operational performance into a clear investor-ready format. MRR rose by 9% week-over-week, while CAC increased by 6%, driven by seasonal ad volatility.",
    },
    {
      id: 5,
      image: placeholderImages.financial,
      icon: <Book2 weight="Linear" className="size-[24px] text-[#f6f6f6]" />,
      duration: "5 mins",
      authorName: "Deku",
      authorRole: "Game Director",
      date: "Sep 12, 2025",
      title:
        "Revenue up, but user acquisition costs trending higher. Team efficiencies improved across two key functions.",
      summary:
        "This report synthesizes financial and operational performance into a clear investor-ready format. MRR rose by 9% week-over-week, while CAC increased by 6%, driven by seasonal ad volatility.",
    },
    {
      id: 6,
      image: placeholderImages.financial,
      icon: <GraphUp weight="Linear" className="size-[24px] text-[#f6f6f6]" />,
      duration: "5 mins",
      authorName: "Deku",
      authorRole: "Game Director",
      date: "Sep 12, 2025",
      title:
        "CPI increased by 14%, ROAS improved by 6%.Two campaigns flagged for optimization.",
      summary:
        "This report synthesizes financial and operational performance into a clear investor-ready format. MRR rose by 9% week-over-week, while CAC increased by 6%, driven by seasonal ad volatility.",
    },
    {
      id: 7,
      image: placeholderImages.analytics,
      icon: (
        <Lightbulb weight="Linear" className="size-[24px] text-[#f6f6f6]" />
      ),
      duration: "5 mins",
      authorName: "Deku",
      authorRole: "Game Director",
      date: "Sep 12, 2025",
      title:
        "Download intent increased to 78%. Visual clarity issues surfaced across two scenes.",
      summary:
        "This breakdown captures how users reacted to key creative elements. Download intent was strong overall, but pacing issues and visual overload reduced clarity.",
    },
    {
      id: 8,
      image: placeholderImages.report2,
      icon: (
        <SmileCircle weight="Linear" className="size-[24px] text-[#f6f6f6]" />
      ),
      duration: "5 mins",
      authorName: "Deku",
      authorRole: "Game Director",
      date: "Sep 12, 2025",
      title:
        "Critical bugs down by 18%, UI issues up by 22%.User sentiment stable but trending negative.",
      summary:
        "This report synthesizes app-store reviews into actionable insights for 10–11–25. Most users highlighted menu freezes, button misfires, and purchase flow delays.",
    },
  ];

  return (
    <div className="relative flex w-full h-screen bg-white overflow-hidden">
      {/* <Header /> */}
      <Sidebar />

      {/* Main Content */}
      <div className="h-full overflow-y-auto w-full">
        <div className={`${isSiderbarOpen ? "max-w-[1100px] 2xl:max-w-[1300px]" : "max-w-[1300px]"} mx-auto px-8`}>
          {/* Header Section */}
          <div className="flex flex-col items-center pt-[66px] pb-[24px]">
            <p className="font-urbanist text-[20px] text-[#898989] mb-6 text-center">
              Library
            </p>
            <h1 className="font-urbanist font-semibold text-[36px] text-[#1f6744] mb-3 text-center">
              Explore Your Studio's Generated Artefacts
            </h1>
            <p className="font-urbanist text-[16px] text-[#898989] text-center leading-[24px]">
              A central place to review reports, narratives, analyses, and
              outputs created by your team.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-4 flex-wrap items-center my-10 justify-center">
            <button
              onClick={() => setActiveFilter("recommended")}
              className={`flex items-center gap-2.5 px-3 h-[34px] rounded-[10px] transition-all ${
                activeFilter === "recommended"
                  ? "bg-[#103f28] text-white"
                  : "bg-neutral-100 text-[#a6a6a6] border border-[#dfdfdf]"
              }`}
            >
              <span className="font-urbanist font-medium text-[16px]">
                Recommended
              </span>
              <div className="h-6 w-px bg-white/30" />
              <Refresh weight="Linear" size={20} />
            </button>

            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-2.5 h-[34px] rounded-[10px] transition-all ${
                  activeFilter === filter
                    ? "bg-[#103f28] text-white"
                    : "bg-neutral-100 text-[#a6a6a6] border border-[#dfdfdf]"
                }`}
              >
                <span className="font-urbanist font-medium text-[16px]">
                  {filter}
                </span>
              </button>
            ))}
          </div>

          {/* Library Cards Grid */}
          <div
            className={`grid ${
              isSiderbarOpen ? "grid-cols-3" : "grid-cols-4"
            } gap-5`}
          >
            {libraryItems.map((libraryItem) => (
              <LibraryCard
                key={libraryItem.id}
                {...libraryItem}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Library;

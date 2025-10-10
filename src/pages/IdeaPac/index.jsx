import { useSelector } from "react-redux";
import {
  // Eye,
  Loader2,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import api from "../../api";
import InfiniteScroll from "react-infinite-scroll-component";
import OpportunityDetails from "../../components/IdeaPack/OpportunityDetails";
import OpportunityGenerator from "../../components/IdeaPack/OpportunityGenerator";

const IdeaPac = () => {
  // Using Redux state if needed for future functionality

  const [studioId, setStudioId] = useState("");

  const ContextStudioData = useSelector(
    (state) => state.admin.ContextStudioData
  );

  useEffect(() => {
    setStudioId(ContextStudioData.id);
  }, [ContextStudioData]);

  console.log("studioId", studioId);

  // Tabs moved into OpportunityDetails component

  const [previousOpportunities, setPreviousOpportunities] = useState([]);
  const [prevOppLoading, setPrevOppLoading] = useState(false);
  const [prevOppError, setPrevOppError] = useState("");
  const [prevOppPage, setPrevOppPage] = useState(1);
  const prevOppLimit = 5;
  const [prevOppHasMore, setPrevOppHasMore] = useState(true);
  const [activeTabId, setActiveTabId] = useState(null);

  const loadPrevOpps = useCallback(
    async ({ page, append }) => {
      if (!studioId) return;
      try {
        if (append) {
          // do not block the list while loading more
        } else {
          setPrevOppLoading(true);
          setPrevOppError("");
        }
        const res = await api.get(`/v1/ideapac/opportunity-cards`, {
          params: { studio_id: studioId, page, limit: prevOppLimit },
        });
        const items = Array.isArray(res?.data?.data) ? res.data.data : [];
        const pagination = res?.data?.pagination || {};
        const serverPage =
          typeof pagination.page === "number" ? pagination.page : page;
        const totalPages =
          typeof pagination.pages === "number" ? pagination.pages : undefined;
        const hasMore =
          typeof totalPages === "number"
            ? serverPage < totalPages
            : items.length === prevOppLimit;
        setPrevOppHasMore(hasMore);
        setPrevOppPage(serverPage);
        // Tabs are now managed within OpportunityDetails
        if (append) {
          setPreviousOpportunities((prev) => [...prev, ...items]);
        } else {
          setPreviousOpportunities(items);
        }
      } catch (err) {
        if (append) {
          // swallow append error for now; could add a toast here
        } else {
          setPrevOppError("Failed to load previous opportunities");
        }
      } finally {
        if (append) {
          // no-op
        } else {
          setPrevOppLoading(false);
        }
      }
    },
    [studioId, prevOppLimit]
  );

  const handleReloadPrevOpps = async () => {
    await loadPrevOpps({ page: 1, append: false });
  };

  useEffect(() => {
    if (!studioId) return;
    let isCancelled = false;
    const load = async () => {
      await loadPrevOpps({ page: 1, append: false });
      if (isCancelled) return;
    };
    load();
    return () => {
      isCancelled = true;
    };
  }, [studioId, loadPrevOpps]);

  // If a specific cardId is provided via query param, select it in details
  // useEffect(() => {
  //   const params = new URLSearchParams(window.location.search);
  //   const cardId = params.get("cardId");
  //   if (cardId) {
  //     setActiveTabId(String(cardId));
  //   }
  // }, []);


  return (
    <div className="bg-[#404040] h-[100%]">
      <div className="grid grid-cols-12 gap-4 max-w-[1400px] mx-auto">
        {/* Left Content */}
        <div className="col-span-8 p-4 pr-2">
          {/* Opportunity Details Section with Tabs in child */}
          <div>
            <OpportunityDetails
              studioId={studioId}
              activeTabId={activeTabId}
              onActiveTabChange={setActiveTabId}
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="col-span-4 p-4 pt-[58px] pl-[10px]">
          {/* Previous Opportunities */}
          <div className="bg-[#0F0F0F4D] rounded-[10px] p-6 border-[0.5px] border-[#303030]">
            <h3 className="text-white text-xl font-bold mb-4">
              Previous Opportunities
            </h3>
            <div className="rounded-[14px] overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-12 px-4 py-3 text-gray-300 text-sm ">
                <div className="col-span-6">Title</div>
                <div className="col-span-2 text-center">Score</div>
                <div className="col-span-3 text-center">Date</div>
                <div className="col-span-1" />
              </div>

              {/* Rows */}
              <div
                id="prevOppScrollContainer"
                className="max-h-[160px] overflow-y-auto"
              >
                {prevOppLoading && (
                  <div className="px-4 py-3 text-sm text-gray-300 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                )}
                {!prevOppLoading && prevOppError && (
                  <div className="px-4 py-3 text-sm">
                    <span className="text-red-400">{prevOppError}</span>
                    <button
                      onClick={handleReloadPrevOpps}
                      disabled={prevOppLoading}
                      className="ml-3 text-gray-200 underline disabled:opacity-60"
                    >
                      Reload
                    </button>
                  </div>
                )}
                {!prevOppLoading &&
                  !prevOppError &&
                  previousOpportunities.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-300">
                      No data
                    </div>
                  )}
                {!prevOppLoading &&
                  !prevOppError &&
                  previousOpportunities.length > 0 && (
                    <InfiniteScroll
                      dataLength={previousOpportunities.length}
                      next={() =>
                        loadPrevOpps({ page: prevOppPage + 1, append: true })
                      }
                      hasMore={prevOppHasMore}
                      loader={
                        <div className="px-4 py-2 text-xs text-center text-gray-400">
                          Loading more…
                        </div>
                      }
                      endMessage={
                        <div className="px-4 py-2 text-xs text-center text-gray-400">
                          •••
                        </div>
                      }
                      scrollableTarget="prevOppScrollContainer"
                    >
                      {previousOpportunities.map((item, idx) => {
                        const createdDate = item?.created_at
                          ? new Date(item.created_at)
                          : null;
                        const formattedDate = createdDate
                          ? `${String(createdDate.getDate()).padStart(
                              2,
                              "0"
                            )} | ${String(createdDate.getMonth() + 1).padStart(
                              2,
                              "0"
                            )} | ${String(createdDate.getFullYear()).slice(-2)}`
                          : "--";
                        const score =
                          typeof item?.fit_score_total === "string" ||
                          typeof item?.fit_score_total === "number"
                            ? Number(item.fit_score_total).toFixed(0)
                            : "--";
                        return (
                          <div
                            key={`${item.id || idx}`}
                            className="grid grid-cols-12 items-center px-4 py-3 text-sm border-t border-[#3f3f3f] text-gray-200 hover:bg-[#2a2a2a] cursor-pointer"
                            onClick={() => {
                              if (item?.id != null) {
                                setActiveTabId(String(item.id));
                              }
                            }}
                          >
                            <div className="col-span-6 truncate">
                              {item?.genre_name} - {item?.sub_genre_name}
                            </div>
                            <div className="col-span-2 text-center text-white font-medium">
                              {score}
                            </div>
                            <div className="col-span-3 text-right text-gray-300">
                              {formattedDate}
                            </div>
                            <div className="col-span-1" />
                          </div>
                        );
                      })}
                    </InfiniteScroll>
                  )}
              </div>
            </div>
          </div>

          {/* Generate New Opportunity */}
          <OpportunityGenerator
            onGenerated={async ({ cardId } = {}) => {
              if (cardId != null) {
                setActiveTabId(String(cardId));
              }
              // Refresh the previous opportunities list to get the latest
              await handleReloadPrevOpps();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default IdeaPac;

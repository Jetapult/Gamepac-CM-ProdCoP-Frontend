import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import api from "../../../api";
import moment from "moment";

const HistorySidebar = ({ currentAnalysisId, studioId }) => {
  const navigate = useNavigate();
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchHistoryData = async (page = 1, append = false) => {
    if (!studioId) return;

    try {
      setLoading(true);
      const response = await api.get(
        `/v1/ua-intel/media-analysis/${studioId}/history?page=${page}&limit=20`
      );

      if (response.data && response.data.data) {
        const newData = response.data.data;

        if (append) {
          setAnalysisHistory((prev) => [...prev, ...newData]);
        } else {
          setAnalysisHistory(newData);
        }

        setCurrentPage(response.data.currentPage);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching analysis history:", error);
      setError("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studioId) {
      fetchHistoryData(1, false);
    }
  }, [studioId]);

  const fetchMoreData = () => {
    if (currentPage < totalPages) {
      fetchHistoryData(currentPage + 1, true);
    }
  };

  if (error) {
    return (
      <div className="md:col-span-3 border rounded-lg p-4 h-min bg-white">
        <h3 className="text-sm font-medium mb-3 text-gray-900">History</h3>
        <div className="text-xs text-red-500">
          {error}
          <button
            onClick={() => fetchHistoryData(1, false)}
            className="block mt-1 text-blue-600 hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="md:col-span-3 rounded-lg bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">History</h3>
      </div>
      
        {analysisHistory.length === 0 && !loading ? (
          <div className="text-center py-8 px-4">
            <div className="text-sm text-gray-500">No history yet</div>
          </div>
        ) : (
          <div
            id="history-scrollable-div"
            style={{ maxHeight: "calc(100vh - 200px)", overflow: "auto" }}
          >
            <InfiniteScroll
              dataLength={analysisHistory.length}
              next={fetchMoreData}
              hasMore={currentPage < totalPages}
              loader={
                <div className="text-center py-3">
                  <div className="text-xs text-gray-400">Loading...</div>
                </div>
              }
              endMessage={
                analysisHistory.length > 0 && (
                  <div className="text-center py-2">
                    <div className="text-xs text-gray-300">•••</div>
                  </div>
                )
              }
              scrollableTarget="history-scrollable-div"
            >
              {analysisHistory.map((item) => {
                const isActive = item.id === parseInt(currentAnalysisId);
                
                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/ua-intelligence/analyse/${item.id}`)}
                    className={`p-3 cursor-pointer transition-colors border-l-2 ${
                      isActive
                        ? "bg-gray-100 border-l-gray-900"
                        : "border-l-transparent hover:bg-gray-50"
                    }`}
                  >
                    {/* Filename */}
                    <div className="text-sm text-gray-900 mb-1 truncate" title={item.original_filename}>
                      {item.original_filename || "Untitled"}
                    </div>
                    
                    {/* Media type and file size */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="capitalize">{item.media_type || "Media"}</span>
                      {item.file_size_bytes && (
                        <span>{(item.file_size_bytes / (1024 * 1024)).toFixed(1)}MB</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </InfiniteScroll>
          </div>
        )}
      
    </div>
  );
};

export default HistorySidebar;

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useState, useRef, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { useSelector } from "react-redux";
import useTextSelection from "./useTextSelection";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfViewer = ({
  selectedPdf,
  selectedPage,
  setSelectedPdf,
  setMessageObj,
}) => {
  const knowledgebases = useSelector(
    (state) => state.knowledgebase.knowledgebase
  );
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState("auto");
  const [isLoadingNewPdf, setIsLoadingNewPdf] = useState(false);
  const containerRef = useRef(null);
  const url = selectedPdf.file_url;
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isHighlightVisible, setIsHighlightVisible] = useState(true);
  const wrapperRef = useRef(null);
  const {
    selectedText,
    selectionInfo,
    buttonRef,
    highlightRef,
    handleTextSelection,
  } = useTextSelection(containerRef);
  useOutsideAlerter(wrapperRef);
  function useOutsideAlerter(ref) {
    useEffect(() => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          setShowSearch(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }

  const resetSearch = () => {
    setSearchText("");
    setSearchResults([]);
  };

  function onDocumentLoadSuccess(numPages, isLoadingNewPdf, selectedPage) {
    setIsHighlightVisible(false);
    setNumPages(numPages.numPages);
    if (isLoadingNewPdf && selectedPage) {
      setTimeout(() => {
        setIsLoadingNewPdf(false);
        scrollToPage(selectedPage.page_number, numPages.numPages);
      }, 100);
    }
  }

  const handleScroll = () => {
    if (containerRef.current && numPages && numPages > 0) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const scrollableHeight = scrollHeight - clientHeight;

      if (scrollableHeight > 0) {
        const scrollPercentage = scrollTop / scrollableHeight;
        const page = Math.floor(scrollPercentage * numPages) + 1;
        setPageNumber(Math.min(Math.max(page, 1), numPages));
      } else {
        setPageNumber(1);
      }
    }
  };

  const scrollToPage = (pageNum, totalPages) => {
    if (
      containerRef.current &&
      pageNum >= 1 &&
      pageNum <= (totalPages || numPages)
    ) {
      const pageHeight =
        containerRef.current.scrollHeight / (totalPages || numPages);
      containerRef.current.scrollTo(0, (pageNum - 1) * pageHeight);
      setPageNumber(pageNum);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [numPages]);

  const scaleOptions = [
    { label: "Auto Fit", value: "auto" },
    { label: "75%", value: 0.75 },
    { label: "100%", value: 1 },
    { label: "120%", value: 1.2 },
    { label: "150%", value: 1.5 },
    { label: "200%", value: 2 },
    { label: "300%", value: 3 },
  ];

  const handleScaleChange = (e) => {
    const newScale = e.target.value;
    setScale(newScale === "auto" ? "auto" : parseFloat(newScale));
  };

  useEffect(() => {
    if (selectedPage?.page_number) {
      const filename = selectedPage?.file_name?.split("/")?.pop();
      const current_file = selectedPdf?.file_url?.split("/")?.pop();
      if (filename !== current_file) {
        const pdf_data = knowledgebases.find(
          (item) => item.file_url.split("/").pop() === filename
        );
        if (pdf_data?.id) {
          setSelectedPdf(pdf_data);
          setIsLoadingNewPdf(true);
        }
      } else {
        scrollToPage(selectedPage.page_number);
      }
    }
  }, [selectedPage]);

  const handleSearch = async () => {
    if (!searchText) return;
    setIsSearchActive(true);
    const pdf = await pdfjs.getDocument(url).promise;
    let results = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const text = textContent.items.map((item) => item.str).join(" ");
      const escapedSearchText = searchText.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );
      const regex = new RegExp(escapedSearchText, "gi");
      let match;
      while ((match = regex.exec(text)) !== null) {
        results.push({ pageNumber: i, index: match.index });
      }
    }
    setSearchResults(results);
    setCurrentSearchIndex(results.length > 0 ? 0 : -1);
    if (results.length > 0) {
      scrollToPage(pageNumber);
      setCurrentSearchIndex(pageNumber);
    }
  };

  const navigateSearch = (direction) => {
    if (searchResults.length === 0) return;
    let newIndex = currentSearchIndex + direction;
    if (newIndex < 0) newIndex = searchResults.length - 1;
    if (newIndex >= searchResults.length) newIndex = 0;
    setCurrentSearchIndex(newIndex);
    scrollToPage(searchResults[newIndex].pageNumber);
  };

  const highlightPattern = (text, pattern) => {
    if (!pattern) return text;
    const escapedSearchText = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedSearchText, "gi");
    return text.replace(regex, (match) => `<mark>${match}</mark>`);
  };

  const textRenderer = useCallback(
    (textItem) =>
      isSearchActive
        ? highlightPattern(textItem.str, searchText, textItem.pageNumber)
        : textItem.str,
    [searchText, isSearchActive]
  );

  const handleSummarizeClick = () => {
    setMessageObj((prev) => ({
      ...prev,
      quote: selectedText,
    }));
    setIsHighlightVisible(false);
  };

  return (
    <div className="pdf-viewer h-full flex flex-col relative">
      <div
        className="pdf-toolbar z-20"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px",
          backgroundColor: "#f0f0f0",
        }}
      >
        <select
          value={scale}
          onChange={handleScaleChange}
          className="rounded py-1 outline-none px-1"
        >
          {scaleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div
          className={`search-container flex items-center justify-between rounded px-2 py-[2px] mr-2 mx-2 border border-[#ccc] bg-white`}
        >
          <input
            type="text"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setIsSearchActive(false);
            }}
            placeholder="Search PDF"
            className={`outline-none w-auto`}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                handleSearch();
              }
            }}
          />
          {searchResults.length ? (
            <span
              className="cursor-pointer text-gray-500"
              onClick={resetSearch}
            >
              <XCircleIcon className="w-4 h-4" />
            </span>
          ) : (
            <></>
          )}
          <button
            onClick={handleSearch}
            className="text-gray-500 rounded pl-2 hover:text-black"
          >
            <MagnifyingGlassIcon className="inline w-5 h-5" />
          </button>
          {searchResults.length > 0 && (
            <>
              <span className="pr-3 pl-3 pt-1">
                {currentSearchIndex + 1} of {searchResults.length}
              </span>
              <button
                onClick={() => navigateSearch(-1)}
                className="rounded px-1 py-1 hover:bg-gray-200"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigateSearch(1)}
                className=" rounded px-1 py-1 hover:bg-gray-200"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
        <span className="bg-white rounded px-2 py-1">
          {pageNumber} <span className="text-gray-500">/ {numPages}</span>
        </span>
      </div>
      <div
        ref={containerRef}
        className="pdf-container flex-grow relative"
        style={{
          height: "calc(100vh - 130px)",
          overflow: "auto",
          display: "flex",
          justifyContent: "flex-start",
        }}
        onMouseUp={() => {
          handleTextSelection();
          setIsHighlightVisible(true);
        }}
      >
        <Document
          file={url}
          onLoadSuccess={(e) =>
            onDocumentLoadSuccess(e, isLoadingNewPdf, selectedPage)
          }
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              scale={scale === "auto" ? 1 : scale}
              width={
                scale === "auto" ? containerRef.current?.clientWidth : undefined
              }
              customTextRenderer={textRenderer}
            />
          ))}
        </Document>
      </div>

      {/* Highlight layer */}
      {isHighlightVisible && (
        <div
          ref={highlightRef}
          className="highlight-layer"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
          }}
        />
      )}

      {selectedText && isHighlightVisible && (
        <div ref={buttonRef} className="z-10">
          <button
            onClick={handleSummarizeClick}
            className="bg-[#ff1053] text-white px-2 py-1 rounded-md w-16"
          >
            Ask AI
          </button>
        </div>
      )}
    </div>
  );
};

export default PdfViewer;

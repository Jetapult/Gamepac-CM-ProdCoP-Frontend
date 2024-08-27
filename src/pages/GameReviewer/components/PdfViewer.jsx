import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { useSelector } from "react-redux";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PdfViewer = ({ selectedPdf, selectedPage, setSelectedPdf }) => {
  const knowledgebases = useSelector(
    (state) => state.knowledgebase.knowledgebase
  );
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState("auto");
  const [isLoadingNewPdf, setIsLoadingNewPdf] = useState(false);
  const containerRef = useRef(null);
  const url = selectedPdf.file_url;
  function onDocumentLoadSuccess(numPages, isLoadingNewPdf, selectedPage) {
    setNumPages(numPages.numPages);
    if(isLoadingNewPdf && selectedPage){
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
    if (containerRef.current && pageNum >= 1 && pageNum <= (totalPages || numPages)) {
      const pageHeight = containerRef.current.scrollHeight / (totalPages || numPages);
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

  return (
    <div className="pdf-viewer">
      <div
        className="pdf-toolbar"
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
        <span className="bg-white rounded px-2 py-1">
          {pageNumber} <span className="text-gray-500">/ {numPages}</span>
        </span>
      </div>
      <div
        ref={containerRef}
        className="pdf-container"
        style={{
          height: "calc(100vh - 130px)",
          overflow: "auto",
          display: "flex",
          justifyContent: "flex-start",
        }}
      >
        <Document file={url} onLoadSuccess={(e) => onDocumentLoadSuccess(e, isLoadingNewPdf, selectedPage)}>
          {Array.from(new Array(numPages), (el, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              scale={scale === "auto" ? 1 : scale}
              width={
                scale === "auto" ? containerRef.current?.clientWidth : undefined
              }
            />
          ))}
        </Document>
      </div>
    </div>
  );
};

export default PdfViewer;

import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PdfViewer = ({selectedPdf}) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(0.75);
  const containerRef = useRef(null);
  const url = selectedPdf.file_url;

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
      const page = Math.floor(scrollPercentage * numPages) + 1;
      setPageNumber(Math.min(Math.max(page, 1), numPages));
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
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
    setScale(newScale === "auto" ? 1 : parseFloat(newScale));
  };

  return (
    <div className="pdf-viewer">
      <div className="pdf-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <select value={scale} onChange={handleScaleChange} className="rounded py-1 outline-none px-1">
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
        style={{ height: "calc(100vh - 130px)", overflow: "auto", display: "flex", justifyContent: "center" }}
      >
        <Document file={url} onLoadSuccess={onDocumentLoadSuccess}>
          {Array.from(new Array(numPages), (el, index) => (
            <Page 
              key={`page_${index + 1}`}
              pageNumber={index + 1} 
              scale={scale === "auto" ? 1 : scale}
              width={scale === "auto" ? containerRef.current?.clientWidth : undefined}
            />
          ))}
        </Document>
      </div>
    </div>
  );
};

export default PdfViewer;
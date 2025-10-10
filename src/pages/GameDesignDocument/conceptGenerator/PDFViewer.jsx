import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Loader2 } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function PDFViewer({
  pdfUrl,
  title = "Document Preview",
  subtitle = "Preview document",
}) {
  const [numPages, setNumPages] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(true);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setIsLoadingPdf(false);
    setPdfError(null);
  }

  function onDocumentLoadError(error) {
    console.error("Failed to load PDF:", error);
    setPdfError(error);
    setIsLoadingPdf(false);
  }

  return (
    <div className="border rounded-lg shadow-sm bg-white">
      <div className="p-6 pb-2">
        <h3 className="text-xl font-semibold">Game Design Document Preview</h3>
        <p className="text-sm text-muted-foreground">
          Review the sample GDD to understand best practices
        </p>
      </div>
      <div className="p-6">
        <div className="pdf-container flex flex-col items-center">
          {isLoadingPdf && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading PDF document...</p>
            </div>
          )}

          {pdfError ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">
                Failed to load PDF due to CORS restrictions.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Try downloading the PDF directly:
              </p>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-opacity-80"
              >
                Download PDF
              </a>
            </div>
          ) : (
            <div className="pdf-scroll-container max-h-[70vh] overflow-y-auto border shadow-sm w-full">
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                options={{
                  cMapUrl: "https://unpkg.com/pdfjs-dist@3.4.120/cmaps/",
                  cMapPacked: true,
                  withCredentials: false,
                }}
                loading={null}
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    width={450}
                    className="mb-4"
                  />
                ))}
              </Document>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

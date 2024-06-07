import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import FirstPageIcon from "../assets/first-page-icon.svg";
import LastPageIcon from "../assets/last-page-icon.svg";

const Pagination = ({ totalReviews, currentPage, limit, setCurrentPage }) => {
  const totalPages = Math.ceil(totalReviews / 10);
  const pageWindowSize = 5;

  let startPage = Math.max(1, currentPage - Math.floor(pageWindowSize / 2));
  let endPage = Math.min(totalPages, startPage + pageWindowSize - 1);

  if (endPage - startPage + 1 < pageWindowSize) {
    startPage = Math.max(1, endPage - pageWindowSize + 1);
  }
  const setPage = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white py-3">
      <div className="flex flex-1 justify-between sm:hidden">
        <a
          onClick={() =>
            currentPage === 1 ? {} : setCurrentPage((prev) => prev - 1)
          }
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Previous
        </a>
        <a
          onClick={() =>
            Math.ceil(totalReviews / 10) > 1
              ? setCurrentPage((prev) => prev + 1)
              : {}
          }
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Next
        </a>
      </div>
      {/* <div>
          {totalReviews > limit && (
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{currentPage}</span> to{" "}
              <span className="font-medium">{limit}</span> of{" "}
              <span className="font-medium">{totalReviews}</span> results
            </p>
          )}
        </div> */}
      <div>
        <nav
          className="isolate inline-flex -space-x-px rounded-md shadow-sm cursor-pointer"
          aria-label="Pagination"
        >
          <a
            className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
              currentPage < totalPages ? "" : "cursor-default"
            }`}
            onClick={() => setPage(1)}
          >
            <img
              src={FirstPageIcon}
              className={`h-5 w-5 ${currentPage === 1 ? "opacity-30" : ""}`}
              aria-hidden="true"
            />
          </a>
          <a
            className="relative inline-flex items-center px-2 py-2 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            onClick={() =>
              currentPage === 1 ? {} : setCurrentPage((prev) => prev - 1)
            }
          >
            <span className="sr-only">Previous</span>
            <ChevronLeftIcon
              className={`h-5 w-5 ${
                currentPage === 1 ? "text-gray-400" : "text-black"
              }`}
              aria-hidden="true"
            />
          </a>
          {Array.from(
            { length: endPage - startPage + 1 },
            (_, i) => startPage + i
          ).map((page, i) => (
            <a
              aria-current="page"
              key={i}
              className={`relative z-10 inline-flex items-center ${
                currentPage === page
                  ? "bg-[#f58174] text-white"
                  : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              } px-4 py-2 text-sm font-semibold focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
              onClick={() => setPage(page)}
              disabled={page === currentPage}
            >
              {page}
            </a>
          ))}
          <a
            className="relative inline-flex items-center px-2 py-2 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
            onClick={() =>
              currentPage < totalPages ? setCurrentPage((prev) => prev + 1) : {}
            }
          >
            <span className="sr-only">Next</span>
            <ChevronRightIcon
              className={`h-5 w-5 ${
                currentPage < totalPages ? "text-black" : "text-gray-400"
              }`}
              aria-hidden="true"
            />
          </a>
          <a
            className={`relative inline-flex items-center rounded-r-md px-2 py-2 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
              currentPage < totalPages ? "" : "cursor-default"
            }`}
            onClick={() => setPage(totalPages)}
          >
            <img
              src={LastPageIcon}
              className={`h-5 w-5 ${
                currentPage < totalPages ? "text-black" : "opacity-30"
              }`}
              aria-hidden="true"
            />
          </a>
        </nav>
      </div>
    </div>
  );
};

export default Pagination;

import React from 'react';
import Target from "../../../assets/target.png";
import Investment from "../../../assets/investment.png";
import BarChart from "../../../assets/barchart.png";
import Calculator from "../../../assets/calculator.png";
import Notice from "../../../assets/notice.png";
import Money from "../../../assets/money.png";
import Market from "../../../assets/market.png";
import Meeting from "../../../assets/meetings-transcript.png";
import Book from "../../../assets/book.png";

const CategoryIcon = ({ categoryName }) => {
  const lowerCaseName = categoryName?.toLowerCase();

  if (lowerCaseName?.includes("user acquisition")) {
    return <img src={Target} className="w-9 h-auto" />;
  }
  if (lowerCaseName?.includes("investment")) {
    return <img src={Investment} className="w-8 h-auto" />;
  }
  if (lowerCaseName?.includes("market landscape")) {
    return <img src={BarChart} className="w-10 h-auto" />;
  }
  if (lowerCaseName?.includes("mergers and acquisitions")) {
    return <img src={Calculator} className="w-8 h-auto" />;
  }
  if (lowerCaseName?.includes("case studies")) {
    return <img src={Notice} className="w-8 h-auto" />;
  }
  if (lowerCaseName?.includes("ad monetization")) {
    return <img src={Money} className="w-10 h-auto" />;
  }
  if (lowerCaseName?.includes("marketing")) {
    return <img src={Market} className="w-8 h-auto" />;
  }
  if (lowerCaseName?.includes("meeting transcripts")) {
    return <img src={Meeting} className="w-9 h-auto" />;
  }
  if (lowerCaseName?.includes("content transcripts")) {
    return <img src={Book} className="w-10 h-auto" />;
  }
  return null;
};

export default CategoryIcon;
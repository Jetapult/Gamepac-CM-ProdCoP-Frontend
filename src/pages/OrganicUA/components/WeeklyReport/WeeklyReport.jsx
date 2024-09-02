import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../../../api";
import GamesDropdown from "../smartFeedback/GamesDropdown";
import "./weeklyReport.css";
import moment from "moment";
import Select from "react-select";
import NoData from "../../../../components/NoData";

const WeeklyReport = ({ games, studio_slug, setGames }) => {
  const userData = useSelector((state) => state.user.user);
  const studios = useSelector((state) => state.admin.studios);
  const [weeklyReport, setWeeklyReport] = useState([]);
  const [selectedGame, setSelectedGame] = useState({});
  const [selectedDate, setSelectedDate] = useState({});
  const [selectedTab, setSelectedTab] = useState("android");

  const getSundays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let current = start;
    const sundays = [];

    while (current <= end) {
      const nextSunday = new Date(current);
      nextSunday.setDate(current.getDate() + 7);
      if (nextSunday <= end) {
        sundays.push({
          label: `${moment(current).format("Do MMM YYYY")} - ${moment(
            nextSunday
          ).format("Do MMM YYYY")}`,
          value: {
            start_date: moment(current).format("YYYY-MM-DD"),
          },
        });
      }
      current = nextSunday;
    }
    return sundays?.reverse();
  };

  const sundays = getSundays(
    "2024-05-25",
    new Date().toISOString().split("T")[0]
  );

  const addStylesToContent = (content) => {
    return content
      .replace(
        /<b>Sentiment Analysis<\/b>/g,
        '<h1 class="report-heading sentiment-analysis">Sentiment Analysis</h1>'
      )
      .replace(
        /<b>Trends & Insights<\/b>/g,
        '<h1 class="report-heading trends-insights">Trends & Insights</h1>'
      )
      .replace(
        /<b>Actionable Recommendations<\/b>/g,
        '<h1 class="report-heading actionable-recommendations">Actionable Recommendations</h1>'
      )
      .replace(
        /<h1 class="report-heading actionable-recommendations">Actionable Recommendations<\/h1>([\s\S]*?)$/g,
        (match, p1) => {
          return match.replace(/(\d+\. [^\.]+\.)/g, "<li>$1</li>");
        }
      )
      .replace(/- Positive: \d+(\.\d+)?%/g, '<p class="padding-left-20">$&</p>')
      .replace(/- Neutral: \d+(\.\d+)?%/g, '<p class="padding-left-20">$&</p>')
      .replace(/- Negative: \d+(\.\d+)?%/g, '<p class="padding-left-20">$&</p>')
      .replace(/- Appreciation: \d+%/g, '<p class="padding-left-20">$&</p>')
      .replace(/- Ads Concern: \d+%/g, '<p class="padding-left-20">$&</p>')
      .replace(/- Concern: \d+%/g, '<p class="padding-left-20">$&</p>')
      .replace(/- Need more info: \d+%/g, '<p class="padding-left-20">$&</p>')
      .replace(/- Progress saving: \d+%/g, '<p class="padding-left-20">$&</p>')
      .replace(/- Bug: \d+%/g, '<p class="padding-left-20">$&</p>')
      .replace(/- IAP Concern: \d+%/g, '<p class="padding-left-20">$&</p>')
      .replace(
        /- Crashes\/ANR: \d+(\.\d+)?%/g,
        '<p class="padding-left-20">$&</p>'
      )
      .replace(
        /- Lag\/Freeze: \d+(\.\d+)?%/g,
        '<p class="padding-left-20">$&</p>'
      )
      .replace(/(\d+\.\sApp Version - [^:]+: [^\.]+\.)/g, "<li>$1</li>")
      .replace(
        /<b>Negative Feedback<\/b>/g,
        '<h1 class="report-heading negative-feedback">Negative Feedback</h1>'
      );
  };

  const getWeeklyInsightReport = async () => {
    try {
      const paramData = {
        ...selectedDate.value,
      };
      const weeklyReportResponse = await api.get(
        `v1/organic-ua/weekly-reports/${selectedGame.id}/${
          studio_slug
            ? studios.filter((x) => x.slug === studio_slug)[0]?.id
            : userData.studio_id
        }`,
        { params: paramData }
      );
      setWeeklyReport(weeklyReportResponse.data.data);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    if (selectedGame.id) {
      getWeeklyInsightReport();
    }
  }, [selectedGame.id, selectedGame.platform]);
  useEffect(() => {
    if (games.length) {
      setSelectedGame(games[0]);
    }
  }, [games.length]);

  useEffect(() => {
    if (sundays.length) {
      setSelectedDate(sundays[0]);
    }
  }, [sundays.length]);
  return (
    <div className="shadow-md bg-white w-full h-full p-4">
      <h1 className="text-2xl">Weekly Review Analysis Report</h1>
      <div className="flex my-3 items-start">
        <div className="w-[275px] relative">
          <GamesDropdown
            selectedGame={selectedGame}
            setSelectedGame={setSelectedGame}
            games={games}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
            setGames={setGames}
            studio_slug={studio_slug}
          />
        </div>
        <Select
          options={sundays}
          value={selectedDate}
          onChange={(val) => setSelectedDate(val)}
          placeholder="Select Date"
          className="w-[260px] mx-4"
        />
        {selectedGame.id && (
          <button
            className="border border-[#ff1053] rounded-md py-1.5 w-32 text-[#ff1053]"
            onClick={() => {
              getWeeklyInsightReport();
            }}
          >
            Search
          </button>
        )}
      </div>

      {weeklyReport?.ratings_count ? (
        <div className="border border-[#f2f2f2] rounded-lg mb-10 w-[698px]">
          <div className="flex bg-[#e1e1e2] rounded-t-lg border-b border-b-[#f2f2f2]">
            <p className="w-[14%] border-r border-r-[#f2f2f2] p-3 text-center">
              Avg rating
            </p>
            <p className="w-[14%] border-r border-r-[#f2f2f2] p-3 text-center">
              5 star
            </p>
            <p className="w-[14%] border-r border-r-[#f2f2f2] p-3 text-center">
              4 star
            </p>
            <p className="w-[14%] border-r border-r-[#f2f2f2] p-3 text-center">
              3 star
            </p>
            <p className="w-[14%] border-r border-r-[#f2f2f2] p-3 text-center">
              2 star
            </p>
            <p className="w-[14%] border-r border-r-[#f2f2f2] p-3 text-center">
              1 star
            </p>
            <p className="w-[14%] p-3 text-center">Total Reviews</p>
          </div>
          {weeklyReport.ratings_count && (
            <div className="flex">
              <p className="w-[14%] border-r border-r-[#f2f2f2] p-3 text-center">
                {weeklyReport.avg_rating}
              </p>
              <p className="w-[14%] border-r border-r-[#f2f2f2] p-3 text-center">
                {weeklyReport.ratings_count.rating5}
              </p>
              <p className="w-[14%] border-r border-r-[#f2f2f2] p-3 text-center">
                {weeklyReport.ratings_count.rating4}
              </p>
              <p className="w-[14%] border-r border-r-[#f2f2f2] p-3 text-center">
                {weeklyReport.ratings_count.rating3}
              </p>
              <p className="w-[14%] border-r border-r-[#f2f2f2] p-3 text-center">
                {weeklyReport.ratings_count.rating2}
              </p>
              <p className="w-[14%] border-r border-r-[#f2f2f2] p-3 text-center">
                {weeklyReport.ratings_count.rating1}
              </p>
              <p className="w-[14%] p-3 text-center">
                {weeklyReport.total_reviews}
              </p>
            </div>
          )}
        </div>
      ) : (
        <></>
      )}
      {weeklyReport?.formattedresponse ? (
        <div
          className="report-content"
          dangerouslySetInnerHTML={{
            __html: weeklyReport?.formattedresponse.replaceAll("\n", "<br/>"),
          }}
        ></div>
      ) : (
        <></>
      )}
      {!weeklyReport && <NoData type="reports" />}
    </div>
  );
};
export default WeeklyReport;

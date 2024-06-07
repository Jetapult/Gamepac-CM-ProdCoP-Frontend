import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../../../api";
import GamesDropdown from "../smartFeedback/GamesDropdown";
import "./weeklyReport.css";
import moment from "moment";
import Select from "react-select";

const WeeklyReport = ({ games, studio_slug }) => {
  const userData = useSelector((state) => state.user.user);
  const studios = useSelector((state) => state.admin.studios);
  const [weeklyReport, setWeeklyReport] = useState([]);
  const [selectedGame, setSelectedGame] = useState({});
  const [selectedDate, setSelectedDate] = useState({});

  const getSundays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let current = start;
    const sundays = [];

    while (current <= end) {
      sundays.push({
        label: moment(current).format("YYYY-MM-DD"),
        value: moment(current).format("YYYY-MM-DD"),
      });
      current.setDate(current.getDate() + 7);
    }

    return sundays;
  };

  const sundays = getSundays(
    "2024-05-25",
    new Date().toISOString().split("T")[0]
  );

  const addStylesToContent = (content) => {
    return (
      content
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
          /- Positive: \d+(\.\d+)?%/g,
          '<p class="padding-left-20">$&</p>'
        )
        .replace(
          /- Neutral: \d+(\.\d+)?%/g,
          '<p class="padding-left-20">$&</p>'
        )
        .replace(
          /- Negative: \d+(\.\d+)?%/g,
          '<p class="padding-left-20">$&</p>'
        )
        .replace(/- Appreciation: \d+%/g, '<p class="padding-left-20">$&</p>')
        .replace(/- Ads Concern: \d+%/g, '<p class="padding-left-20">$&</p>')
        .replace(/- Concern: \d+%/g, '<p class="padding-left-20">$&</p>')
        .replace(/- Need more info: \d+%/g, '<p class="padding-left-20">$&</p>')
        .replace(
          /- Progress saving: \d+%/g,
          '<p class="padding-left-20">$&</p>'
        )
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
        //   .replace(/<b>Negative Feedback<\/b>([\s\S]*?)(?=<b>)/g, '<b>Negative Feedback</b><ol>$1</ol>')
        .replace(/(\d+\.\sApp Version - [^:]+: [^\.]+\.)/g, "<li>$1</li>")
        .replace(
          /<b>Negative Feedback<\/b>/g,
          '<h1 class="report-heading negative-feedback">Negative Feedback</h1>'
        )
    );
  };

  const getWeeklyInsightReport = async () => {
    try {
      const paramData = {
        start_date: "2024-05-30" || new Date(),
        end_date: new Date(),
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
      setSelectedGame(games[0].data[0]);
    }
  }, [games.length]);
  return (
    <div className="shadow-md bg-white w-full h-full p-4">
      <h1 className="text-2xl">Weekly Review Analysis Report</h1>
      <div className="flex my-3 items-start">
        <div className="w-[275px] relative">
          <GamesDropdown
            selectedGame={selectedGame}
            setSelectedGame={setSelectedGame}
            games={games}
          />
        </div>
        <Select
          options={sundays}
          value={selectedDate}
          onChange={(val) => setSelectedDate(val)}
          placeholder="Select Date"
          className="w-[200px] mx-4"
        />
      </div>
      {weeklyReport?.formattedresponse ? (
        <div
          className="report-content"
          dangerouslySetInnerHTML={{
            __html: addStylesToContent(weeklyReport?.formattedresponse),
          }}
        ></div>
      ) : (
        <></>
      )}
    </div>
  );
};
export default WeeklyReport;

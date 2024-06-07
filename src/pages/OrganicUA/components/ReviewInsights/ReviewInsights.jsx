import React, { useRef, useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
} from "chart.js";
import { useSelector } from "react-redux";
import ChartDataLabels from "chartjs-plugin-datalabels";
import api from "../../../../api";
import "chart.js/auto";
import GamesDropdown from "../smartFeedback/GamesDropdown";
import { DateRangePicker } from "react-date-range";
import moment from "moment";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Line } from "react-chartjs-2";
import Select from "react-select";
import "./reviewInsights.css";

const tagDistributionlabels = [
  "Ads concern",
  "Crashes/ANR",
  "IAP concern",
  "Lag/Freeze",
  "Progress Saving",
  "Need More Info",
  "Bug",
  "Feedback/Suggestion",
  "Cannot Install",
  "Appreciation",
];

const tagDistributionlabelData = {
  "ads concern": "#fb9c00",
  "crashes/ANR": "#8d0934",
  "IAP concern": "#334fde",
  "lag/freeze": "#97433b",
  "progress saving": "#fa8d05",
  "need more info": "#a5ba67",
  bug: "#bc3146",
  "feedback/suggestion": "#f6d01a",
  "cannot install": "#5f0b9d",
  appreciation: "#f3c2ee",
};

Chart.register(
  ArcElement,
  Tooltip,
  Legend,
  ChartDataLabels,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale
);

const ReviewInsights = ({ studio_slug, games, setGames }) => {
  const userData = useSelector((state) => state.user.user);
  const studios = useSelector((state) => state.admin.studios);
  const [pieChartData, setPieChartData] = useState({});
  const [selectedGame, setSelectedGame] = useState({});
  const [showCalendar, setShowCalendar] = useState(false);
  const today = new Date();
  const [customDates, setCustomDates] = useState([
    {
      startDate: today.setDate(today.getDate() - 7),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [tagDistribution, setTagDistribution] = useState([]);
  const [lineChart, setLineChart] = useState({});
  const [selectedVersions, setSelectedVersions] = useState([]);
  const [versionList, setVersionList] = useState([]);

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);
  function useOutsideAlerter(ref) {
    useEffect(() => {
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          setShowCalendar(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }

  const options = {
    plugins: {
      legend: {
        display: false,
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `${tooltipItem.label}: ${tooltipItem.raw}%`;
          },
        },
      },
      datalabels: false,
    },
    layout: {
      padding: {
        left: 100,
        right: 170,
        top: 0,
        bottom: 0,
      },
    },
    events: ["mousemove", "mouseout", "click", "touchstart", "touchmove"],
    onHover: (event, chartElement) => {
      if (chartElement.length) {
        event.native.target.style.cursor = "pointer";
      } else {
        event.native.target.style.cursor = "default";
      }
    },
    animation: {
      onComplete: function () {
        const chart = this;
        const ctx = chart.ctx;
        ctx.lineWidth = 2;
        const offset = 50;
        const labelPositions = [];

        chart.data.datasets.forEach((dataset, i) => {
          const meta = chart.getDatasetMeta(i);
          meta.data.forEach((element, index) => {
            const model = element.tooltipPosition();
            const mid_radius = element.outerRadius / 2;
            const start_angle = element.startAngle;
            const end_angle = element.endAngle;
            const mid_angle = start_angle + (end_angle - start_angle) / 2;

            const x = mid_radius * Math.cos(mid_angle);
            const y = mid_radius * Math.sin(mid_angle);

            let labelX = model.x + x + (x < 0 ? -offset - 30 : offset);
            let labelY = model.y + y;

            labelPositions.forEach((pos) => {
              if (Math.abs(labelY - pos.y) < 20) {
                if (labelY < pos.y) {
                  labelY -= 30;
                } else {
                  labelY += 20;
                }
              }
            });

            labelPositions.push({ x: labelX, y: labelY });

            ctx.beginPath();
            ctx.moveTo(model.x, model.y);
            ctx.lineTo(model.x + x, model.y + y);
            ctx.lineTo(labelX, labelY);
            ctx.strokeStyle = dataset.backgroundColor[index] || "#ff0000";
            ctx.stroke();

            ctx.fillStyle = "#000";
            ctx.font = "bold 12px Arial";
            ctx.fillText(
              `${chart.data.labels[index]}: ${dataset.data[index]}%`,
              labelX,
              labelY
            );
          });
        });
      },
    },
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      datalabels: {
        display: false,
        color: "#6879af",
        align: "top",
        formatter: (value) => value,
      },
      legend: {
        display: false,
      },
    },
    layout: {
      padding: {
        top: 30,
      },
    },
  };

  const fetchAllVersions = async () => {
    try {
      const versionResponse = await api.get(
        `v1/organic-ua/versions/${
          studio_slug
            ? studios.filter((x) => x.slug === studio_slug)[0]?.id
            : userData.studio_id
        }/${selectedGame.id}`
      );
      const versionsArr = [];
      versionResponse.data.data.filter((x, index) => {
        versionsArr.push({ id: index, label: x, value: x });
      });
      setVersionList(versionsArr);
    } catch (err) {
      console.log(err);
    }
  };

  const getTagPercentageChange = (tagData) => {
    const lastWeekPercentage = parseFloat(
      tagData.lastweek_percentage.replace("%", "")
    );
    const currentWeekPercentage = parseFloat(
      tagData.percentage.replace("%", "")
    );
    const difference = currentWeekPercentage - lastWeekPercentage;
    const isPositiveChange = difference >= 0;
    const changeSymbol = isPositiveChange ? "+" : "-";
    return {
      changeSymbol: changeSymbol,
      percentage: Math.abs(difference).toFixed(2),
    };
  };

  const getTagsDistrubutionData = async () => {
    try {
      setPieChartData([]);
      const requestBody = {
        package_name: selectedGame.package_name,
        start_date: moment(customDates[0].startDate).format("YYYY-MM-DD"),
        end_date: moment(customDates[0].endDate).format("YYYY-MM-DD"),
        game_id: selectedGame.id,
        studio_id: studio_slug
          ? studios.filter((x) => x.slug === studio_slug)[0]?.id
          : userData.studio_id,
      };
      if (selectedVersions.length) {
        const selectedVersionsArr = [];
        selectedVersions.filter((x) => selectedVersionsArr.push(x.value));
        requestBody.appversionname = selectedVersionsArr.join(",");
      }
      const tagDistributionResponse = await api.post(
        `v1/organic-ua/tagsDistributionData`,
        requestBody
      );
      setTagDistribution(tagDistributionResponse.data.data);
      if (tagDistributionResponse.data.data.length) {
        const labels = [];
        const datasets = [];
        const backgroundColor = [];
        tagDistributionResponse.data.data.filter((x) => {
          labels.push(x.tag);
          datasets.push(parseFloat(x.percentage.replace("%", "")));
          backgroundColor.push(tagDistributionlabelData[x.tag]);
        });
        setPieChartData({
          labels,
          datasets: [
            {
              data: datasets,
              backgroundColor: backgroundColor,
              borderWidth: 0,
            },
          ],
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchRatingTrends = async () => {
    try {
      setLineChart([]);
      const requestbody = {
        game_id: selectedGame.id,
        studio_id: studio_slug
          ? studios.filter((x) => x.slug === studio_slug)[0]?.id
          : userData.studio_id,
        start_date: moment(customDates[0].startDate).format("YYYY-MM-DD"),
        end_date: moment(customDates[0].endDate).format("YYYY-MM-DD"),
      };
      if (selectedVersions.length) {
        const selectedVersionsArr = [];
        selectedVersions.filter((x) => selectedVersionsArr.push(x.value));
        requestbody.appversionname = selectedVersionsArr.join(",");
      }
      const url = `/v1/organic-ua/avg-rating-trends`;
      const reviewsResponse = await api.post(url, requestbody);
      const reviews = reviewsResponse.data;
      const labels = [];
      const data = [];
      reviews.map((x) => {
        labels.push(moment(x.date).format("MM-DD"));
        data.push(x.avg_rating);
      });
      setLineChart({
        labels,
        datasets: [
          {
            label: "Rating Trend",
            data,
            borderColor: "#6879af",
            borderWidth: 2,
            fill: false,
            pointBackgroundColor: "#ffffff",
            pointBorderColor: "#6879af",
            pointRadius: 4,
          },
        ],
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (selectedGame.id) {
      getTagsDistrubutionData();
      fetchRatingTrends();
    }
  }, [selectedGame.id, selectedGame.platform]);
  useEffect(() => {
    if (selectedGame.id && studios.length) {
      fetchAllVersions();
    }
  }, [selectedGame.id, selectedGame.platform, studios.length]);

  useEffect(() => {
    if (games.length) {
      setSelectedGame(games[0].data[0]);
    }
  }, [games.length]);

  return (
    <div className="review-insights shadow-md bg-white w-full h-full p-4">
      <h1 className="text-2xl">Review Insights</h1>
      <div className="flex my-3 items-start">
        <div className="w-[275px] relative ">
          <GamesDropdown
            selectedGame={selectedGame}
            setSelectedGame={setSelectedGame}
            games={games}
          />
        </div>
        <div className="relative px-4">
          {showCalendar && (
            <div className="" ref={wrapperRef}>
              <DateRangePicker
                onChange={(item) => setCustomDates([item.selection])}
                showSelectionPreview={true}
                moveRangeOnFirstSelection={false}
                months={2}
                ranges={customDates}
                direction="horizontal"
                className="z-50 border border-[#eff2f7] mt-4 absolute top-6"
              />
            </div>
          )}
          <div
            className="border border-[#ccc] bg-white rounded py-1.5 px-3 flex items-center justify-between"
            onClick={() => setShowCalendar(true)}
          >
            <p className="text-sm">
              {moment(customDates[0].startDate).format("YYYY-MM-DD")}
            </p>
            <span className="text-gray-400 px-3">-</span>
            <p className="text-sm">
              {moment(customDates[0].endDate).format("YYYY-MM-DD")}
            </p>{" "}
            <CalendarIcon className="w-4 h-4 text-gray-400 ml-8" />
          </div>
        </div>
        <Select
          options={versionList}
          value={selectedVersions}
          isMulti={true}
          onChange={(val) => setSelectedVersions(val)}
          className="w-[200px]"
        />
        {selectedGame.id && (
          <button
            className="border border-[#819edf] rounded-md mx-4 py-1.5 w-32 text-[#5e80e1]"
            onClick={() => {
              getTagsDistrubutionData();
              fetchRatingTrends();
            }}
          >
            Search
          </button>
        )}
      </div>
      <div className="grid grid-cols-12">
        <div className="col-span-6 relative">
          <h2 className="text-center text-2xl font-bold">Tag Distribution</h2>
          <TagsList tagDistribution={tagDistribution} />
          {pieChartData.labels && <Pie data={pieChartData} options={options} />}
        </div>
        <div className="col-span-6">
          <h2 className="text-center text-2xl font-bold">Rating Trend</h2>
          {lineChart.labels && <Line options={lineOptions} data={lineChart} />}
        </div>
      </div>
      {tagDistribution.length ? (
        <div className="border border-[#f2f2f2] rounded-lg mb-10">
          <div className="flex bg-[#fafafb] rounded-t-lg border-b border-b-[#f2f2f2]">
            <p className="w-3/5 border-r border-r-[#f2f2f2] p-3">Tag</p>
            <p className="w-2/5 p-3">Change (Last Week)</p>
          </div>
          {tagDistribution.map((tag, index) => (
            <div key={index} className="flex border-b border-b-[#f2f2f2]">
              <p className="w-3/5 border-r border-r-[#f2f2f2] p-3">{tag.tag}</p>
              <p className="w-2/5 p-3">
                {tag.count} (
                <span
                  className={`${
                    getTagPercentageChange(tag).changeSymbol === "+"
                      ? "text-[#9ac18b]"
                      : "text-[#c86577]"
                  }`}
                >
                  {getTagPercentageChange(tag).changeSymbol +
                    getTagPercentageChange(tag).percentage}
                  %
                </span>
                )
              </p>
            </div>
          ))}
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

const TagsList = ({ tagDistribution }) => {
  const [showtags, setShowtags] = useState(0);
  const itemsToShow = 4;

  const handlePrev = () => {
    setShowtags((prev) => (prev - itemsToShow < 0 ? 0 : prev - itemsToShow));
  };

  const handleNext = () => {
    setShowtags((prev) =>
      prev + itemsToShow >= tagDistribution.length ? prev : prev + itemsToShow
    );
  };
  return (
    <div className="absolute bg-white w-full top-14 px-3 flex item-center justify-between">
      <div className="slider-container">
        <div
          className="slider-content whitespace-pre"
          style={{
            transform: `translateX(-${(showtags / itemsToShow) * 100}%)`,
          }}
        >
          {tagDistribution.map((tag, index) => (
            <div
              key={index}
              className="slider-item flex items-center mr-2 pt-1"
            >
              <div
                style={{ backgroundColor: tagDistributionlabelData[tag.tag] }}
                className="w-6 h-3 mr-1 rounded"
              ></div>
              <p className="mr-2 text-sm">{tag.tag}</p>
            </div>
          ))}
        </div>
      </div>
      {tagDistribution.length > 4 ? (
        <div className="bg-[#F8F9FD] p-[2px] rounded flex">
          <button onClick={handlePrev} disabled={showtags === 0}>
            <ChevronLeftIcon
              className={`inline w-6 h-6 ${showtags === 0 ? "opacity-20" : ""}`}
            />
          </button>
          <button
            onClick={handleNext}
            disabled={showtags + itemsToShow >= tagDistributionlabels.length}
          >
            <ChevronRightIcon
              className={`inline w-6 h-6 ${
                showtags + itemsToShow >= tagDistributionlabels.length
                  ? "opacity-20"
                  : ""
              }`}
            />
          </button>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default ReviewInsights;

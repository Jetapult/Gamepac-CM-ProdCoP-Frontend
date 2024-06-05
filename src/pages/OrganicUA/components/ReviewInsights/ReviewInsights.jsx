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
import "./reviewInsights.css";

const tagDistribution = [
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
const tagDistributionColor = [
  "#fb9c00",
  "#8d0934",
  "#334fde",
  "#97433b",
  "#fa8d05",
  "#a5ba67",
  "#bc3146",
  "#f6d01a",
  "#5f0b9d",
  "#f3c2ee",
];

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

const ReviewInsights = ({ packageName, games, setGames }) => {
  const [chartData, setChartData] = useState(null);
  const [selectedGame, setSelectedGame] = useState({});
  const [showCalendar, setShowCalendar] = useState(false);
  const [customDates, setCustomDates] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

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

  const fetchData = async (packageName) => {
    try {
      const response = await api.post(`/v1/organic-ua/tags`, {
        package_name: packageName,
      });
      const data = response.data;
      console.log("API Response Data:", data);
      const labels = data.data.map((item) => item.tag);
      const percentages = data.data.map((item) =>
        parseFloat(item.percentage.replace("%", ""))
      );
      // Generate a different color for each element
      const backgroundColor = labels.map(
        () => `#${Math.floor(Math.random() * 16777215).toString(16)}`
      );
      // setChartData({
      //   labels,
      //   labels,
      //   datasets: [
      //     {
      //       data: percentages,
      //       backgroundColor,
      //     },
      //   ],
      // });
    } catch (error) {
      console.error("Error fetching review tags data:", error);
    }
  };

  // useEffect(() => {
  //   if (packageName) {
  //     fetchData(packageName);
  //   }
  // }, [packageName]);

  const data = {
    labels: tagDistribution,
    datasets: [
      {
        data: [4.17, 31.25, 7.29, 3.13, 1.04, 17.71, 7.29, 12.5, 3.13, 7.29],
        backgroundColor: [
          "#fb9c00",
          "#8d0934",
          "#334fde",
          "#97433b",
          "#fa8d05",
          "#a5ba67",
          "#bc3146",
          "#f6d01a",
          "#5f0b9d",
          "#f3c2ee",
        ],
        hoverBackgroundColor: [
          "#fb9c00",
          "#8d0934",
          "#334fde",
          "#97433b",
          "#fa8d05",
          "#a5ba67",
          "#bc3146",
          "#f6d01a",
          "#5f0b9d",
          "#f3c2ee",
        ],
        borderWidth: 0,
      },
    ],
  };

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

  const linedata = {
    labels: ["03-11", "03-12", "03-13", "03-14", "03-15", "03-16", "03-17"],
    datasets: [
      {
        label: "Rating Trend",
        data: [, 1, 1, 2, 5, 5, 2],
        borderColor: "#6879af",
        borderWidth: 2,
        fill: false,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#6879af",
        pointRadius: 4,
      },
    ],
  };

  useEffect(() => {
    if (games.length) {
      setSelectedGame(games[0].data[0]);
    }
  }, [games.length]);

  return (
    <div className="review-insights shadow-md bg-white w-full h-full p-4">
      <h1 className="text-2xl">Review Insights</h1>
      <div className="flex my-3">
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
            className="border border-[#ccc] bg-white rounded py-1 px-3 flex items-center justify-between"
            onClick={() => setShowCalendar(true)}
          >
            {" "}
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
      </div>
      <div className="grid grid-cols-12">
        <div className="col-span-6 relative">
          <h2 className="text-center text-2xl font-bold">Tag Distribution</h2>
          <TagsList />
          <Pie data={data} options={options} />
        </div>
        <div className="col-span-6">
          <h2 className="text-center text-2xl font-bold">Rating Trend</h2>
          <Line options={lineOptions} data={linedata} />
        </div>
      </div>
      <div className="border border-[#f2f2f2] rounded-lg">
        <div className="flex bg-[#fafafb] rounded-t-lg border-b border-b-[#f2f2f2]">
          <p className="w-3/5 border-r border-r-[#f2f2f2] p-3">Tag</p>
          <p className="w-2/5 p-3">Change</p>
        </div>
        {tagDistribution.map((tag, index) => (
          <div key={index} className="flex border-b border-b-[#f2f2f2]">
            <p className="w-3/5 border-r border-r-[#f2f2f2] p-3">{tag}</p>
            <p className="w-2/5 p-3">4</p>
          </div>
        ))}
      </div>

      {/* <Pie 
          data={chartData} 
          options={{
            plugins: {
              datalabels: {
                formatter: (value, context) => {
                  return `${context.chart.data.labels[context.dataIndex]}: ${value}%`;
                },
                color: '#fff',
                anchor: 'end',
                align: 'start',
                offset: 20,
                borderWidth: 1,
                borderColor: '#fff',
                borderRadius: 25,
                display:true,
                backgroundColor: (context) => {
                  return context.dataset.backgroundColor[context.dataIndex];
                },
                font: {
                  weight: 'bold',
                  size: 6
                }
              }
            }
          }}
        /> */}
    </div>
  );
};

const TagsList = () => {
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
                style={{ backgroundColor: tagDistributionColor[index] }}
                className="w-6 h-3 mr-1 rounded"
              ></div>
              <p className="mr-2 text-sm">{tag}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[#F8F9FD] p-[2px] rounded flex">
        <button onClick={handlePrev} disabled={showtags === 0}>
          <ChevronLeftIcon
            className={`inline w-6 h-6 ${showtags === 0 ? "opacity-20" : ""}`}
          />
        </button>
        <button
          onClick={handleNext}
          disabled={showtags + itemsToShow >= tagDistribution.length}
        >
          <ChevronRightIcon
            className={`inline w-6 h-6 ${
              showtags + itemsToShow >= tagDistribution.length
                ? "opacity-20"
                : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default ReviewInsights;

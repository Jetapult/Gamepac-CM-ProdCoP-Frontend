import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import api from "../../../api";

// Register the necessary components
Chart.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const ReviewInsights = ({ packageName }) => {
  const [chartData, setChartData] = useState(null);

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
      setChartData({
        labels,
        datasets: [
          {
            data: percentages,
            backgroundColor,
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching review tags data:", error);
    }
  };

  useEffect(() => {
    if (packageName) {
      fetchData(packageName);
    }
  }, [packageName]);

  return (
    <div className="review-insights">
      {chartData ? (
        <div style={{ width: '500px', height: '450px' }}>
        <Pie 
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
        />
     </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ReviewInsights;

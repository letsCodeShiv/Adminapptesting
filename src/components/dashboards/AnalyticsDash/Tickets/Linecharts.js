import FalconComponentCard from "components/common/FalconComponentCard";
import ReactEChartsCore from "echarts-for-react/lib/core";
import { getColor, rgbaColor } from "helpers/utils";
import React, { useEffect, useState } from "react";
import { LineChart } from "echarts/charts";
import * as echarts from "echarts/core";
import axios from "axios";

const tooltipFormatter = (params) => {
  const lines = params.map((param) => {
    const color = param.borderColor ? param.borderColor : param.color;
    return `
        <h6 class="fs--1 text-700 mb-0">
          <span class="dot me-1 d-inline-block" style="background-color:${color}"></span>
          ${param.seriesName} : ${param.value}
        </h6>
      `;
  });

  return `
      <div>
        ${lines.join("")}
      </div>
    `;
};

const BasicAreaLineChart = () => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [chartData, setChartData] = useState({
    createdTickets: [],
    resolvedTickets: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace with your API endpoint and parameters
        const response = await axios.post(
          "http://172.16.1.219:8000/dashboard/get_create_resolve_line",
          {
            selected_groups: [],
            period: "M",
            start_date: "2020-03-06T04:19:37.669Z",
            end_date: "2024-03-06T04:19:37.669Z",
          }
        );

        // Update state with API data
        setChartData({
          createdTickets: response.data.created_count,
          resolvedTickets: response.data.resolved_count,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const getOption = () => ({
    tooltip: {
      trigger: "axis",
      padding: [7, 10],
      backgroundColor: getColor("gray-100"),
      borderColor: getColor("gray-300"),
      textStyle: getColor("dark"),
      borderWidth: 1,
      formatter: tooltipFormatter,
      transitionDuration: 0,
      axisPointer: {
        type: "none",
      },
    },
    xAxis: {
      type: "category",
      data: months,
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: getColor("gray-300"),
        },
      },
      axisTick: { show: false },
      axisLabel: {
        color: getColor("gray-400"),
        formatter: (value) => value.substring(0, 3),
        margin: 15,
      },
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      type: "value",
      splitLine: {
        lineStyle: {
          type: "dashed",
          color: getColor("gray-200"),
        },
      },
      boundaryGap: false,
      axisLabel: {
        show: true,
        color: getColor("gray-400"),
        margin: 15,
      },
      axisTick: { show: false },
      axisLine: { show: false },
      min: 600,
    },
    series: [
      {
        name: "Created tickets",
        type: "line",
        data: chartData.createdTickets,
        itemStyle: {
          color: getColor("white"),
          borderColor: getColor("primary"),
          borderWidth: 2,
        },
        lineStyle: {
          color: getColor("primary"),
        },
        showSymbol: false,
        symbol: "circle",
        symbolSize: 10,
        smooth: false,
        emphasis: {
          scale: true,
        },
      },
      {
        name: "Resolve tickets",
        type: "line",
        data: chartData.resolvedTickets,
        itemStyle: {
          color: getColor("white"),
          borderColor: getColor("danger"),
          borderWidth: 2,
        },
        lineStyle: {
          color: getColor("danger"),
        },
        showSymbol: false,
        symbol: "circle",
        symbolSize: 10,
        smooth: false,
        emphasis: {
          scale: true,
        },
      },
    ],
    grid: { right: "3%", left: "10%", bottom: "10%", top: "5%" },
  });

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={getOption()}
      style={{
        height: "21.875rem",
        border: "1px solid #365ab0",
        padding: "1rem",
        borderRadius: "8px",
      }}
    />
  );
};

export default BasicAreaLineChart;

import FalconComponentCard from "components/common/FalconComponentCard";
import ReactEChartsCore from "echarts-for-react/lib/core";
import { getColor, rgbaColor } from "helpers/utils";
import React from "react";

import { LineChart } from "echarts/charts";

import * as echarts from "echarts/core";

import {
  GridComponent,
  TitleComponent,
  TooltipComponent,
} from "echarts/components";

import { CanvasRenderer } from "echarts/renderers";

const tooltipFormatter = (params) => {
  const lines = params.map((param) => {
    const color = param.borderColor ? param.borderColor : param.color;
    return `
          <h6 class="fs--1 text-700 mb-0">
            <span class="dot me-1 d-inline-block" style="background-color:${color}"></span>
            ${param.seriesName} : ${param.data.value}
          </h6>
        `;
  });

  return `
        <div>
          ${lines.join("")}
        </div>
      `;
};
const SingleLineChart = () => {
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

  const data = [
    { value: 1472, seriesName: "Line 1" },
    { value: 1001, seriesName: "Line 1" },
    { value: 1202, seriesName: "Line 1" },
    { value: 1266, seriesName: "Line 1" },
    { value: 1386, seriesName: "Line 1" },
    { value: 1036, seriesName: "Line 1" },
    { value: 1119, seriesName: "Line 1" },
    { value: 1530, seriesName: "Line 1" },
    { value: 1667, seriesName: "Line 1" },
    { value: 1116, seriesName: "Line 1" },
    { value: 1597, seriesName: "Line 1" },
    { value: 1704, seriesName: "Line 1" },
  ];

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
        name: "Backlog",
        type: "line",
        data,
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
export default SingleLineChart;

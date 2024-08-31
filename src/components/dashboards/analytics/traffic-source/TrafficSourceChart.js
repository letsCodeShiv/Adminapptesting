import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import { BarChart } from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { tooltipFormatter } from "helpers/echart-utils";
import { getColor, getPastDates, rgbaColor } from "helpers/utils";

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  BarChart,
  CanvasRenderer,
  LegendComponent,
]);

const TrafficSourceChart = () => {
  const [chartOptions, setChartOptions] = useState(getOptions());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://172.16.1.219:8080/dashboard/card_data/graph/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              global_filter: {
                selected_groups: [],
                selected_channels: [],
                selected_agents: [],
                selected_teams: [],
                start_date: "2020-03-14T07:45:22.141Z",
                end_date: "2024-03-14T07:45:22.141Z",
              },
              selected_kpi: "Total tickets solved",
              group_by: "zendesk",
              period: "D",
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const responseData = await response.json();
        updateChartOptions(responseData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const updateChartOptions = (responseData) => {
    const legends = Object.keys(responseData).filter((key) => key !== "period");
    const newOptions = {
      ...chartOptions,
      legend: {
        data: [...chartOptions.legend.data, ...legends],
        left: 5,
        itemWidth: 10,
        itemHeight: 10,
        borderRadius: 0,
        icon: "circle",
        inactiveColor: getColor("gray-400"),
        textStyle: { color: getColor("gray-700") },
        itemGap: 20,
      },
      xAxis: {
        ...chartOptions.xAxis,
        data: responseData.period.map((date) =>
          dayjs(date).format("DD MMM, YYYY")
        ),
      },
      series: legends.map((key, index) => ({
        name: key,
        type: "bar",
        stack: "total",
        data: responseData[key],
      })),
    };

    setChartOptions(newOptions);
  };

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={chartOptions}
      style={{ height: "15.875rem" }}
    />
  );
};

const getOptions = () => ({
  color: [
    getColor("primary"),
    rgbaColor(getColor("primary"), 0.8),
    rgbaColor(getColor("primary"), 0.6),
    rgbaColor(getColor("primary"), 0.4),
    rgbaColor(getColor("primary"), 0.2),
  ],
  legend: {
    data: ["Display", "Direct", "Organic Search", "Paid Search", "Other"],
    left: 5,
    itemWidth: 10,
    itemHeight: 10,
    borderRadius: 0,
    icon: "circle",
    inactiveColor: getColor("gray-400"),
    textStyle: { color: getColor("gray-700") },
    itemGap: 20,
  },
  xAxis: {
    type: "category",
    data: getPastDates(7).map((date) => dayjs(date).format("DD MMM, YYYY")),
    axisLine: {
      show: false,
    },
    splitLine: {
      lineStyle: {
        color: getColor("gray-200"),
      },
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: getColor("gray-600"),
      formatter: (value) => dayjs(value).format("ddd"),
    },
  },
  yAxis: {
    type: "value",
    position: "right",
    splitLine: {
      lineStyle: {
        color: getColor("gray-200"),
      },
    },
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      show: true,
      color: getColor("gray-600"),
      margin: 15,
    },
  },
  tooltip: {
    trigger: "axis",
    padding: [7, 10],
    axisPointer: {
      type: "none",
    },
    backgroundColor: getColor("gray-100"),
    borderColor: getColor("gray-300"),
    textStyle: { color: getColor("gray-700") },
    borderWidth: 1,
    transitionDuration: 0,
    formatter: tooltipFormatter,
  },
  grid: {
    containLabel: true,
    right: "5px",
    left: 0,
    bottom: 0,
    top: "15%",
  },
});

export default TrafficSourceChart;

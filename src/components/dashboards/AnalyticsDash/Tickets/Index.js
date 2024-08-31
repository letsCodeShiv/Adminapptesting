import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { tooltipFormatter } from "helpers/echart-utils";
import { getColor, getPastDates, rgbaColor } from "helpers/utils";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import axios from "axios";

const MixedChart = () => {
  const [chartData, setChartData] = useState({});
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          "http://172.16.1.219:8000/dashboard/ticket_count_over_time",
          {
            selected_groups: [],
            period: "W",
            start_date: "2020-03-05T10:20:38.216Z",
            end_date: "2024-03-05T10:20:38.216Z",
          }
        );
        const formattedData = formatChartData(response.data);
        setChartData(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const formatChartData = (apiData) => {
    if (!apiData || !apiData.period || !apiData.capacity) {
      console.error("Invalid API response:", apiData);
      return { period: [], groupData: [] };
    }
    const period = apiData.period
      .slice(-8)
      .map((timestamp) => new Date(timestamp));

    const groupData = Object.keys(apiData)
      .filter((key) => key !== "period" && key !== "capacity")
      .map((key) => {
        const groupArray = apiData[key];
        const isValidGroup =
          Array.isArray(groupArray) && groupArray.length === period.length;

        return isValidGroup
          ? {
              name: `Group ${key}`,
              type: "bar",
              stack: "total",
              data: groupArray,
            }
          : null;
      })
      .filter(Boolean);
    const isValidCapacity =
      Array.isArray(apiData.capacity) &&
      apiData.capacity.length === period.length;

    const capacityData = isValidCapacity
      ? {
          name: "Capacity",
          type: "line",
          data: apiData.capacity,
          lineStyle: {
            color: getColor("warning"),
          },
          itemStyle: {
            color: getColor("white"),
            borderColor: getColor("warning"),
            borderWidth: 2,
          },
          symbol: "circle",
          symbolSize: 10,
        }
      : null;

    return {
      period,
      groupData: [...groupData, ...(capacityData ? [capacityData] : [])],
    };
  };
  const getOption = () => {
    const { period, groupData } = chartData;
    const validGroupData = Array.isArray(groupData) ? groupData : [];
    return {
      color: [
        getColor("primary"),
        rgbaColor(getColor("warning"), 0.9),
        rgbaColor(getColor("danger"), 0.9),
      ],
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          crossStyle: {
            color: getColor("primary"),
          },
          label: {
            show: true,
            backgroundColor: getColor("primary"),
            color: getColor("primary"),
          },
        },
        padding: [7, 10],
        backgroundColor: getColor("gray-100"),
        borderColor: getColor("gray-300"),
        textStyle: { color: getColor("dark") },
        borderWidth: 1,
        transitionDuration: 0,
        formatter: tooltipFormatter,
      },
      toolbox: {
        top: 0,
        feature: {
          dataView: { show: false },
          magicType: {
            show: true,
            type: ["line", "bar"],
          },
          restore: { show: true },
          saveAsImage: { show: true },
        },
        iconStyle: {
          borderColor: getColor("gray-700"),
          borderWidth: 1,
        },
        emphasis: {
          iconStyle: {
            textFill: getColor("gray-600"),
          },
        },
      },
      legend: {
        top: 40,
        data: validGroupData.map((group) => group.name),
        left: 5,
        itemWidth: 10,
        itemHeight: 10,
        borderRadius: 0,
        icon: "circle",
        inactiveColor: getColor("gray-400"),
        textStyle: { color: getColor("gray-700") },
        itemGap: 20,
      },
      xAxis: [
        {
          type: "category",
          data: period,
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
            formatter: (value) => dayjs(value).format("DD MMM, YYYY"),
          },
        },
      ],
      yAxis: [
        {
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
      ],
      series: validGroupData.map((group) => ({
        name: group.name,
        type: group.type,
        stack: group.stack,
        data: group.data || [],
      })),
      grid: {
        right: 5,
        left: 5,
        bottom: 5,
        top: "23%",
        containLabel: true,
      },
    };
  };

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={getOption()}
      style={{
        height: "24.875rem",
        border: "1px solid #365ab0",
        padding: "1rem",
        borderRadius: "8px",
      }}
    />
  );
};
export default MixedChart;

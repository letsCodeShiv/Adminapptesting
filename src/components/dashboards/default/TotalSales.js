import CardDropdown from "components/common/CardDropdown";
import FalconCardHeader from "components/common/FalconCardHeader";
import Flex from "components/common/Flex";
import ReactEChartsCore from "echarts-for-react/lib/core";
import { LineChart } from "echarts/charts";
import * as echarts from "echarts/core";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { Card, Form } from "react-bootstrap";

import { months } from "data/common";
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { capitalize, getColor, rgbaColor } from "helpers/utils";

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LineChart,
  CanvasRenderer,
  LegendComponent,
]);

const formatTimestampToDate = (timestamp) => {
  const date = new Date(timestamp / 1000000);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const fetchData = async (setChartData, period) => {
  try {
    const response = await fetch(
      `http://172.16.1.219:8000/resolved_ticket_count_line_chart?period=${period}`
    );
    const data = await response.json();
    setChartData({
      date: data.date.map(formatTimestampToDate),
      created_count: data.created_count,
      solved_count: data.solved_count,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const getOptions = (dates, createdCount, solvedCount) => ({
  color: getColor("gray-100"),
  tooltip: {
    trigger: "axis",
    padding: [7, 10],
    backgroundColor: getColor("grays-100"),
    borderColor: getColor("gray-100"),
    textStyle: { color: getColor("dark") },
    borderWidth: 1,
    formatter: (params) => {
      const { name, value } = params[0];
      const createdValue = params[1]?.value;
      const solvedValue = params[2]?.value;
      return `${name}<br/>Created: ${createdValue}<br/>Solved: ${solvedValue}`;
    },
    transitionDuration: 0,
  },

  xAxis: {
    type: "category",
    data: dates,
    boundaryGap: false,
    axisPointer: {
      lineStyle: {
        color: getColor("gray-300"),
        type: "dashed",
      },
    },
    splitLine: { show: false },
    axisLine: {
      lineStyle: {
        color: getColor("gray-300"),
        type: "dashed",
      },
    },
    axisTick: { show: false },
    axisLabel: {
      color: getColor("gray-400"),
      margin: 15,
    },
  },
  yAxis: {
    type: "value",
    axisPointer: { show: false },
    splitLine: {
      lineStyle: {
        color: getColor("gray-300"),
        type: "dashed",
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
  },
  series: [
    {
      type: "line",
      data: createdCount,
      lineStyle: { color: getColor("primary") },
      itemStyle: {
        borderColor: getColor("primary"),
        borderWidth: 2,
      },
      symbol: "circle",
      symbolSize: 10,
      smooth: false,
      areaStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: rgbaColor(getColor("primary"), 0.2),
            },
            {
              offset: 1,
              color: rgbaColor(getColor("primary"), 0),
            },
          ],
        },
      },
    },
    {
      type: "line",
      data: solvedCount,
      lineStyle: { color: getColor("red") },
      itemStyle: {
        borderColor: getColor("red"),
        borderWidth: 2,
      },
      symbol: "circle",
      symbolSize: 10,
      smooth: false,
      areaStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: rgbaColor(getColor("red"), 0.2),
            },
            {
              offset: 1,
              color: rgbaColor(getColor("red"), 0),
            },
          ],
        },
      },
    },
  ],

  grid: { right: 10, left: 0, bottom: 0, top: 10, containLabel: true },
});

const TotalSales = ({ data: initialData }) => {
  // const [month, setMonth] = useState(0);
  const [chartData, setChartData] = useState(initialData);
  const [period, setPeriod] = useState("M");

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    fetchData(setChartData, newPeriod);
  };

  useEffect(() => {
    fetchData(setChartData, period);
  }, [period]);

  useEffect(() => {
    setChartData(initialData);
  }, [initialData]);
  return (
    <Card className="h-100">
      <FalconCardHeader
        title="Total Sales"
        titleTag="h6"
        className="pb-0"
        endEl={
          <Flex>
            <Form.Select
              size="sm"
              value={period}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="me-2"
            >
              <option value="M">Month</option>
              <option value="D">Day</option>
              <option value="W">Week</option>
            </Form.Select>
            <CardDropdown />
          </Flex>
        }
      />
      <Card.Body>
        <ReactEChartsCore
          echarts={echarts}
          option={getOptions(
            chartData.date,
            chartData.created_count,
            chartData.solved_count
          )}
          style={{ height: "18.4375rem" }}
        />
      </Card.Body>
    </Card>
  );
};

TotalSales.propTypes = {
  data: PropTypes.shape({
    date: PropTypes.arrayOf(PropTypes.string).isRequired,
    created_count: PropTypes.arrayOf(PropTypes.number).isRequired,
    solved_count: PropTypes.arrayOf(PropTypes.number).isRequired,
  }).isRequired,
};

export default TotalSales;

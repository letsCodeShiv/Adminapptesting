import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import ReactEChartsCore from "echarts-for-react/lib/core";
import { LineChart } from "echarts/charts";
import { Link } from "react-router-dom";
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { getColor, rgbaColor } from "helpers/utils";
import { Offcanvas, Card } from "react-bootstrap";
import axios from "axios";
import { ApiConfig } from "config/ApiConfig";
import AdvanceTable from "./advance-table/AdvanceTable";
import AdvanceTableWrapper from "./advance-table/AdvanceTableWrapper";
import { orderList } from "data/ecommerce/orderList";
import AdvanceTablePagination from "./advance-table/AdvanceTablePagination";
import Loader from "components/Loader/Loader";
import { faNapster } from "@fortawesome/free-brands-svg-icons";
// import { toast } from "react-toastify";

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LineChart,
  CanvasRenderer,
  LegendComponent,
]);
const tooltipFormatter = (params) => {
  const currentDate = dayjs(params[0].axisValue).format("DD MMMM YYYY");
  const value = params[0].value;

  return `
    <div>
    <div class="dot me-1" style="background-color:${getColor("primary")}"></div>
    <h6 class="fs--1 text-700 mb-0 d-flex align-items-center">
    Date: ${currentDate}
    </h6>
    <h6 class="fs--1 text-700 mb-0 d-flex align-items-center">
    Value: ${value}
    </h6>
    </div>
  `;
};

const AudienceChart = ({ data, AgentDatas, load }) => {
  const chartRef = useRef(null);
  const [date, setDate] = useState(null);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState({
    ticket_id: [],
    name: [],
    topcx_subject: [],
    ticket_created_at: [],
    ticket_assignee_id: [],
    ticket_group_name: [],
    solved_at: [],
  });
  const fetchData = async () => {
    setLoading(true);
    try {
      const config = {
        headers: { "Access-Control-Allow-Origin": "*" },
        withCredentials: true,
      };
      const selectedAgentArray = Array.isArray(AgentDatas)
        ? AgentDatas
        : [AgentDatas];

      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      const payload = {
        selected_groups: [],
        selected_channels: [],
        selected_agents: selectedAgentArray,
        selected_teams: [],
        start_date: startDate,
        end_date: endDate,
      };

      const response = await axios.post(
        ApiConfig.analyticsTicketData,
        payload,
        config
      );
      setApiData({
        ticket_id: response.data.ticket_id || [],
        name: response.data.name || [],
        topcx_subject: response.data.topcx_subject || [],
        ticket_created_at: response.data.ticket_created_at || [],
        ticket_assignee_id: response.data.ticket_assignee_id || [],
        ticket_group_name: response.data.ticket_group_name || [],
        solved_at: response.data.solved_at || [],
        url: response.data.url || [],
      });
    } catch (error) {
      console.error(error.response?.data?.detail?.masked_error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [AgentDatas, date, show]);

  const columns = [
    {
      accessor: "name",
      Header: "Ticket ID",
      headerProps: { className: "pe-1" },
      cellProps: {
        className: "py-2",
      },
      Cell: ({ row }) => {
        const index = row.index;
        const { ticket_id, name, url } = apiData;
        return (
          <>
            <Link
              // to={`${url?.[index]}`}
              onClick={() => window.open(url?.[index], "_blank")}
            >
              <strong>#{ticket_id[index]}</strong>
            </Link>{" "}
            by <strong>{name[index]}</strong>
          </>
        );
      },
    },
    {
      accessor: "ticket_created_at",
      Header: "Date",
      headerProps: { className: "pe-7" },
      Cell: ({ row }) => {
        const index = row.index;
        const { ticket_created_at } = apiData;
        const formattedDate = new Date(
          ticket_created_at[index]
        ).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        return formattedDate;
      },
    },
  ];
  const isTableDataEmpty = apiData.ticket_id.length === 0;

  // if (!data || data["no team"]) {
  //   return (
  //     <div
  //       style={{
  //         display: "flex",
  //         alignItems: "center",
  //         justifyContent: "center",
  //         width: "70%",
  //         height: "90%",
  //         position: "fixed",
  //       }}
  //     >
  //       {data ? (
  //         <>
  //           <iframe
  //             src="https://lottie.host/embed/a1404d99-d29a-422a-93dd-d1776e857a07/KnL2IYBHu1.json"
  //             title="Loading Animation"
  //             width="200"
  //             height="200"
  //             frameBorder="0"
  //             allowFullScreen
  //           />
  //         </>
  //       ) : (
  //         <>No Data Found</>
  //       )}
  //     </div>
  //   );
  // }
  const keys = Object?.keys(data);
  const dynamicKey = keys?.filter((key) => key !== "period")[0];

  const getOptions = (data) => ({
    color: getColor("white"),
    tooltip: {
      trigger: "axis",
      padding: [7, 10],
      backgroundColor: getColor("gray-100"),
      borderColor: getColor("gray-300"),
      textStyle: { color: getColor("dark") },
      borderWidth: 1,
      transitionDuration: 0,
      axisPointer: {
        type: "none",
      },
      formatter: tooltipFormatter,
    },
    xAxis: {
      type: "category",
      data: data?.period?.map((date) => dayjs(date)?.format("DD MMM YYYY")),
      axisLabel: {
        color: getColor("gray-600"),
        fontSize: 10,
        showMaxLabel: false,
      },
      axisLine: {
        lineStyle: {
          color: getColor("gray-200"),
        },
      },
      axisTick: {
        show: true,
        length: 20,
        lineStyle: {
          color: getColor("gray-200"),
        },
      },
      boundaryGap: false,
    },
    yAxis: {
      position: "left",
      axisPointer: { type: "none" },
      axisTick: "none",
      axisLine: { show: false },
      axisLabel: { color: getColor("gray-600") },
    },
    series: [
      {
        type: "line",
        data: data[dynamicKey],
        showSymbol: false,
        symbol: "circle",
        fill: true,
        animation: true,
        tension: 0.3,
        itemStyle: {
          borderColor: getColor("primary"),
          borderWidth: 2,
        },
        lineStyle: {
          color: getColor("primary"),
        },
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
    ],
    grid: {
      containLabel: true,
      right: "5px",
      left: 0,
      bottom: 0,
      top: "10px",
    },
  });

  const onChartClick = (params) => {
    if (params.componentType === "series") {
      const dataIndex = params?.dataIndex;
      const clickedDate = data?.period[dataIndex];
      setDate(clickedDate);
      setShow(true);
    }
  };
  const isDataEmpty =
    !data || !data[dynamicKey] || data[dynamicKey].length === 0;
  return (
    <>
      {load ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "21.25rem",
            color: "grey",
          }}
        >
          <Loader />
        </div>
      ) : isDataEmpty ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "21.25rem",
            color: "grey",
          }}
        >
          No Data Found
        </div>
      ) : (
        <ReactEChartsCore
          ref={chartRef}
          echarts={echarts}
          option={getOptions(data)}
          style={{ height: "21.25rem" }}
          onEvents={{ click: onChartClick }}
        />
      )}
      <Offcanvas
        show={show}
        onHide={() => setShow(false)}
        placement="end"
        className="dark__bg-card-dark"
      >
        <Offcanvas.Header closeButton className="bg-light">
          <h6 className="fs-0 mb-0 fw-semi-bold">Tickets</h6>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <AdvanceTableWrapper
            columns={columns}
            data={apiData?.ticket_id}
            sortable
            pagination
            perPage={10}
          >
            <Card className="mb-3">
              <Card.Body className="p-0">
                {loading ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "21.25rem",
                      color: "grey",
                    }}
                  >
                    <Loader />
                  </div>
                ) : isTableDataEmpty ? (
                  <div
                    style={{
                      height: "1.875rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: "1rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <span style={{ color: "grey" }}>No data found</span>
                  </div>
                ) : (
                  <AdvanceTable
                    table
                    headerClassName="bg-200 text-900 text-nowrap align-middle"
                    rowClassName="align-middle white-space-nowrap"
                    tableProps={{
                      size: "sm",
                      striped: true,
                      className: "fs--1 mb-0 overflow-hidden",
                    }}
                  />
                )}
              </Card.Body>

              <Card.Footer>
                <AdvanceTablePagination table />
              </Card.Footer>
            </Card>
          </AdvanceTableWrapper>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

AudienceChart.propTypes = {
  data: PropTypes.object,
};

export default AudienceChart;

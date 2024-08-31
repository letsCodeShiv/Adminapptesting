import React, { useEffect, useState, useContext } from "react";
import FalconComponentCard from "components/common/FalconComponentCard";
import { Row, Col, Card, Modal } from "react-bootstrap";
import axios from "axios";
import { ApiConfig } from "config/ApiConfig";
import { MultiSelect } from "primereact/multiselect";
import { Dropdown } from "primereact/dropdown";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "./main.css";
// ..............................................Chart
import dayjs from "dayjs";
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
import AdvanceTable from "../advance-table/AdvanceTable";
import AdvanceTableWrapper from "../advance-table/AdvanceTableWrapper";
import AdvanceTableSearchBox from "../advance-table/AdvanceTableSearchBox";
import AdvanceTablePagination from "../advance-table/AdvanceTablePagination";
import { toast } from "react-toastify";
import Loader from "components/Loader/Loader";
import { ClickedValueContext } from "context/tableAgentContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpand } from "@fortawesome/free-solid-svg-icons";
import { Tooltip as ReactTooltip } from "react-tooltip";

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  BarChart,
  CanvasRenderer,
  LegendComponent,
]);

const ThirdCard = ({
  kpiList,
  selectedKPIs,
  setSelectedKPIs2,
  setDynamicFilterSetAgent,
  setGroupeAgent,
  cardData,
  selectedTeams,
  selectedAgent,
  selectedChannels,
  startDate,
  endDate,
  teamData,
  topicData,
  groupData,
  tooltips,
}) => {
  const [groupe, setGroupe] = useState({
    name: "Zendesk Group",
    id: "zendesk",
  });
  console.log(selectedKPIs, "list");
  const {
    setClickedValue,
    setKpiIndex,
    setSelectedGroup,
    setSelectedKPIName,
    setSelectedKPI,
    setThirdCard,
  } = useContext(ClickedValueContext);
  const [dynamicFilter, setDynamicFilter] = useState(groupData);
  const [dynamicFilterSet, setDynamicFilterSet] = useState([]);
  const [chartOptions, setChartOptions] = useState(getOptions());
  const [loading, setLoading] = useState(true);
  const [Modalloading, setModalLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [totalValue, setTotalValue] = useState([]);
  const [hasError, setHasError] = useState(false);
  const isChartDataEmpty =
    !chartOptions || !chartOptions.series || chartOptions.series.length === 0;

  const handleCellClick = (value) => {
    setClickedValue(value);
  };
  const handleCellClickName = (value) => {
    setSelectedKPIName(value);
  };
  const handleCellKpiIndex = (value) => {
    setKpiIndex(value);
  };
  const handleCellKpiGroup = (value) => {
    setSelectedGroup(value);
  };
  const handleCellKpiName = (value) => {
    setSelectedKPI(value);
  };
  const handleKPIChange = (e) => {
    setSelectedKPIs2(e.value);
    setThirdCard(e.value);
  };
  const getTooltipContent = (kpi) => {
    return tooltips?.kpis[kpi];
  };

  const groupby = [
    { name: "Topics", id: "topic" },
    { name: "Zendesk Group", id: "zendesk" },
    { name: "Teams", id: "team" },
  ];
  const convertMinutesToHHMMSS = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.floor((minutes * 60) % 60);
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  const kpisToFormat = new Set([
    "Activity Hours",
    "First Reply time (mean)",
    "First Reply time (median)",
    "Reply time (mean)",
    "Reply time (median)",
    "Resolution Time",
  ]);

  const totalSumValue = cardData?.Value?.reduce((acc, val) => acc + val, 0);
  const tableData = cardData?.topcx_team?.map((team, index) => ({
    team,
    value: kpisToFormat.has(cardData?.kpi_name?.[index])
      ? convertMinutesToHHMMSS(cardData?.Value?.[index])
      : cardData?.Value?.[index],
    // value: cardData?.Value?.[index],
    proportions: cardData?.trend?.[index],
    name: cardData?.name?.[index],
    id: cardData?.id?.[index],
    index_1: cardData?.index_1?.[index],
    index_2: cardData?.index_2?.[index],
    kpi_name: cardData?.kpi_name?.[index],
    contribution: `${((cardData?.Value?.[index] / totalSumValue) * 100).toFixed(
      2
    )}%`,
  }));
  const isTableDataEmpty = !tableData || tableData.length === 0;
  const columns = [
    {
      Header: "NAME",
      accessor: "name",
    },
    {
      accessor: "value",
      Header: () => (
        <>
          <span data-tooltip-id="value_tooltip_third">VALUE</span>
          <ReactTooltip
            id="value_tooltip_third"
            place="bottom"
            content={getTooltipContent(selectedKPIs)}
            style={{ zIndex: "9999" }}
            delayShow={200}
          />
        </>
      ),
    },
    {
      Header: () => (
        <>
          <span data-tooltip-id="trend_tooltip">TREND</span>
          <ReactTooltip
            id="trend_tooltip"
            place="bottom"
            content={tooltips?.trend_column}
            style={{ zIndex: "9999" }}
            delayShow={200}
          />
        </>
      ),
      accessor: "proportions",
      Cell: ({ value }) => (
        <>
          {value !== 0 && (
            <span style={{ color: value <= -1 ? "red" : "green" }}>
              {value <= -1 ? "▼" : "▲"}
            </span>
          )}{" "}
          <>{value}</>
        </>
      ),
    },
    {
      Header: () => (
        <>
          <span data-tooltip-id="contribution_tooltip">CONTRIBUTION</span>
          <ReactTooltip
            id="contribution_tooltip"
            place="bottom"
            content={tooltips?.contribution_column}
            style={{ zIndex: "9999" }}
            delayShow={200}
          />
        </>
      ),
      accessor: "contribution",
    },
  ];
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setModalLoading(true);
      try {
        setChartOptions(getOptions());

        const selectedAgentArray = Array.isArray(selectedAgent)
          ? selectedAgent
          : [selectedAgent];

        const dynamicFilterPayload = {
          selected_groups: groupe.id === "zendesk" ? dynamicFilterSet : [],
          selected_teams:
            groupe.id === "team" ? dynamicFilterSet : selectedTeams,
          selected_topics: groupe.id === "topic" ? dynamicFilterSet : [],
        };

        const daysDifference = (endDate - startDate) / (1000 * 60 * 60 * 24);

        let period = "D";
        if (daysDifference > 90) {
          period = "M";
        } else if (daysDifference > 21) {
          period = "W";
        }

        const payload = {
          global_filter: {
            ...dynamicFilterPayload,
            selected_channels: selectedChannels,
            selected_agents: selectedAgentArray,
            start_date: startDate,
            end_date: endDate,
          },
          selected_kpi: selectedKPIs,
          group_by: groupe?.id,
          period: "D",
        };

        const config = {
          headers: { "Access-Control-Allow-Origin": "*" },
          withCredentials: true,
        };
        const response = await axios.post(
          ApiConfig.analyticsGraph,
          payload,
          config
        );

        if (!response.data) {
          throw new Error("Failed to fetch data");
        }

        updateChartOptions(response.data);
      } catch (error) {
        console.error(error.response?.data?.detail?.masked_error, {
          theme: "colored",
        });
      } finally {
        setLoading(false);
        setModalLoading(false);
      }
    };

    fetchData();

    switch (groupe.id) {
      case "zendesk":
        setDynamicFilter(groupData);
        break;
      case "team":
        setDynamicFilter(teamData);
        break;
      case "topic":
        setDynamicFilter(topicData);
        break;
      default:
        setDynamicFilter({});
    }
  }, [
    groupe,
    selectedKPIs,
    selectedChannels,
    selectedAgent,
    selectedTeams,
    startDate,
    endDate,
    dynamicFilterSet,
    dynamicFilter,
    teamData,
    topicData,
    groupData,
  ]);

  useEffect(() => {
    const fetchTotalValue = async () => {
      try {
        setHasError(false);
        const selectedAgentArray = Array.isArray(selectedAgent)
          ? selectedAgent
          : [selectedAgent];

        const dynamicFilterPayload = {
          selected_groups: groupe.id === "zendesk" ? dynamicFilterSet : [],
          selected_teams:
            groupe.id === "team" ? dynamicFilterSet : selectedTeams,
          selected_topics: groupe.id === "topic" ? dynamicFilterSet : [],
        };

        const payload = {
          global_filter: {
            ...dynamicFilterPayload,
            selected_channels: selectedChannels,
            selected_agents: selectedAgentArray,
            start_date: startDate,
            end_date: endDate,
          },
          selected_kpi: selectedKPIs,
          group_by: groupe?.id,
          period: "D",
        };
        const config = {
          headers: { "Access-Control-Allow-Origin": "*" },
          withCredentials: true,
        };
        const TotalResponse = await axios.post(
          ApiConfig.analyticsTotalValue,
          payload,
          config
        );
        setTotalValue(TotalResponse.data?.value);
      } catch (error) {
        setHasError(true);
        console.error(error.response?.data?.detail?.masked_error, {
          theme: "colored",
        });
      }
    };
    fetchTotalValue();
  }, [
    groupe,
    selectedKPIs,
    selectedChannels,
    selectedAgent,
    selectedTeams,
    startDate,
    endDate,
    dynamicFilterSet,
    dynamicFilter,
    teamData,
    topicData,
    groupData,
  ]);
  const updateChartOptions = (responseData) => {
    const legends = Object.keys(responseData).filter((key) => key !== "period");

    const legendTotals = legends.map((legend) => {
      const total = responseData[legend].reduce((acc, value) => acc + value, 0);
      return { legend, total };
    });

    legendTotals.sort((a, b) => b.total - a.total);

    let displayLegends = [];
    let otherData = [];
    const maxLegends = 3;

    if (legendTotals.length > maxLegends) {
      displayLegends = legendTotals
        .slice(0, maxLegends)
        .map((item) => item.legend);
      const otherLegends = legendTotals
        .slice(maxLegends)
        .map((item) => item.legend);
      otherData = otherLegends.reduce((acc, key) => {
        responseData[key].forEach((value, index) => {
          acc[index] = (acc[index] || 0) + value;
        });
        return acc;
      }, []);
      otherData = otherData.map((value) => Number(value.toFixed(2)));
      displayLegends.push("Others");
    } else {
      displayLegends = legendTotals.map((item) => item.legend);
    }

    const newOptions = {
      ...chartOptions,
      legend: {
        data: displayLegends,
        left: 5,
        itemWidth: 8,
        itemHeight: 8,
        borderRadius: 0,
        icon: "circle",
        inactiveColor: getColor("gray-400"),
        textStyle: { color: getColor("gray-700") },
      },
      xAxis: {
        ...chartOptions.xAxis,
        data: responseData.period.map((date) =>
          dayjs(date).format("DD MMM, YYYY")
        ),
      },
      series: displayLegends.map((key, index) => ({
        name: key,
        type: "line",
        data: key === "Others" ? otherData : responseData[key] || [],
      })),
    };

    setChartOptions(newOptions);
  };
  const defaultKPI = kpiList[0]?.items[0];
  return (
    <div>
      <Row className="mb-3 g-3">
        {loading ? (
          <div>
            <Loader />
          </div>
        ) : (
          <FalconComponentCard noGuttersBottom>
            <Card className="h-100 mt-2">
              <Row className="g-2">
                <Col md={6}>
                  <Dropdown
                    data-tooltip-id="kpi_tooltip_third"
                    value={selectedKPIs}
                    options={kpiList}
                    optionLabel="label"
                    optionGroupLabel="label"
                    optionGroupChildren="items"
                    onChange={handleKPIChange}
                    maxSelectedLabels={1}
                    placeholder={defaultKPI?.label}
                    className="w-full md:w-20rem"
                    appendTo="self"
                  />
                  <ReactTooltip
                    id="kpi_tooltip_third"
                    place="bottom"
                    content={tooltips?.kpis[selectedKPIs]}
                    style={{ zIndex: "9999" }}
                    delayShow={200}
                  />
                </Col>
                <Col md={3}>
                  <Dropdown
                    value={groupe}
                    onChange={(e) => {
                      setGroupe(e.value);
                      setGroupeAgent(e.value);
                      setDynamicFilterSet([]);
                      setDynamicFilterSetAgent([]);
                    }}
                    options={groupby}
                    optionLabel="name"
                    className="w-full md:w-14rem"
                    appendTo="self"
                  />
                </Col>
                <Col md={3}>
                  <MultiSelect
                    value={dynamicFilterSet}
                    onChange={(e) => {
                      setDynamicFilterSet(e.value);
                      setDynamicFilterSetAgent(e.value);
                    }}
                    options={dynamicFilter}
                    optionLabel="value"
                    optionValue="id"
                    placeholder="Filters"
                    maxSelectedLabels={1}
                    className="w-full md:w-20rem"
                    // panelClassName={
                    //   Object?.keys(dynamicFilter)?.length > 0
                    //     ? ""
                    //     : "hidden-checkbox"
                    // }
                  />
                </Col>
              </Row>
              <Card.Body className="pb-0 mb-2 pt-2 mt-0">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "5px",
                  }}
                >
                  <span style={{ fontSize: "15px" }}>
                    Total Value: {hasError ? "No Data Found" : totalValue}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "end",
                      cursor: "pointer",
                    }}
                    variant="primary"
                    onClick={() => setShowModal(true)}
                  >
                    <FontAwesomeIcon icon={faExpand} />
                  </div>
                </div>
                {isChartDataEmpty ? (
                  <div
                    style={{
                      height: "16.875rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ color: "grey" }}>No data found</span>
                  </div>
                ) : (
                  <ReactEChartsCore
                    key={JSON.stringify(chartOptions)}
                    echarts={echarts}
                    option={chartOptions}
                    style={{ height: "16.875rem" }}
                  />
                )}
              </Card.Body>
            </Card>
            <FalconComponentCard.Body>
              <AdvanceTableWrapper
                columns={columns}
                data={tableData || []}
                sortable
                pagination
                perPage={8}
              >
                <Row className=" mb-3">
                  <Col xs="auto" sm={10} lg={10}>
                    <AdvanceTableSearchBox table />
                  </Col>
                </Row>
                <AdvanceTable
                  table
                  headerClassName="bg-200 text-900 text-nowrap align-middle "
                  rowClassName="align-middle white-space-nowrap "
                  tableProps={{
                    bordered: true,
                    striped: true,
                    className: "fs--1 mb-0 overflow-hidden",
                  }}
                  handleCellKpiIndex={handleCellKpiIndex}
                  handleCellKpiGroup={handleCellKpiGroup}
                  handleCellClick={handleCellClick}
                  handleCellClickName={handleCellClickName}
                  handleCellKpiName={handleCellKpiName}
                />
                {isTableDataEmpty ? (
                  <div
                    style={{
                      height: "1.875rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: "1rem",
                    }}
                  >
                    <span style={{ color: "grey" }}>No data found</span>
                  </div>
                ) : (
                  <div className="mt-3">
                    <AdvanceTablePagination table />
                  </div>
                )}
              </AdvanceTableWrapper>
            </FalconComponentCard.Body>
          </FalconComponentCard>
        )}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="xl">
          <Modal.Header closeButton>
            <Modal.Title>Expanded Chart</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mt-3">
              <Row className="g-2">
                <Col md={6}>
                  <Dropdown
                    data-tooltip-id="kpi_tooltip_third"
                    value={selectedKPIs}
                    options={kpiList}
                    optionLabel="label"
                    optionGroupLabel="label"
                    optionGroupChildren="items"
                    onChange={handleKPIChange}
                    maxSelectedLabels={1}
                    placeholder={defaultKPI?.label}
                    className="w-full md:w-20rem"
                    appendTo="self"
                  />
                  <ReactTooltip
                    id="kpi_tooltip_third"
                    place="bottom"
                    content={tooltips?.kpis[selectedKPIs]}
                    style={{ zIndex: "9999" }}
                    delayShow={200}
                  />
                </Col>
                <Col md={3}>
                  <Dropdown
                    value={groupe}
                    onChange={(e) => {
                      setGroupe(e.value);
                      setGroupeAgent(e.value);
                      setDynamicFilterSet([]);
                      setDynamicFilterSetAgent([]);
                    }}
                    options={groupby}
                    optionLabel="name"
                    className="w-full md:w-14rem"
                    appendTo="self"
                  />
                </Col>
                <Col md={3}>
                  <MultiSelect
                    value={dynamicFilterSet}
                    onChange={(e) => {
                      setDynamicFilterSet(e.value);
                      setDynamicFilterSetAgent(e.value);
                    }}
                    options={dynamicFilter}
                    optionLabel="value"
                    optionValue="id"
                    placeholder="Filters"
                    maxSelectedLabels={1}
                    className="w-full md:w-20rem"
                    appendTo="self"
                    panelClassName={
                      Object?.keys(dynamicFilter)?.length > 0
                        ? ""
                        : "hidden-checkbox"
                    }
                  />
                </Col>
              </Row>
            </div>
            <div style={{ fontSize: "15px", margin: "10px" }}>
              Total Value: {hasError ? "No Data Found" : totalValue}
            </div>
            {Modalloading ? (
              <div
                style={{
                  height: "24.875rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Loader />
              </div>
            ) : isChartDataEmpty ? (
              <div
                style={{
                  height: "24.875rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ color: "grey" }}>No data found</span>
              </div>
            ) : (
              <ReactEChartsCore
                key={JSON.stringify(chartOptions)}
                echarts={echarts}
                option={chartOptions}
                style={{ height: "24.875rem" }}
              />
            )}
          </Modal.Body>
        </Modal>
      </Row>
    </div>
  );
};
const getOptions = () => ({
  color: [
    getColor("primary"),
    rgbaColor(getColor("warning"), 0.5),
    rgbaColor(getColor("success"), 0.5),
    rgbaColor(getColor("primary"), 0.6),
    rgbaColor(getColor("primary"), 0.4),
    rgbaColor(getColor("info"), 0.6),
    rgbaColor(getColor("primary"), 0.8),
  ],
  xAxis: {
    type: "category",
    data: getPastDates(7).map((date) => dayjs(date).format("DD MMM")),
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
      formatter: (value) => dayjs(value).format("DD MMM"),
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
export default ThirdCard;

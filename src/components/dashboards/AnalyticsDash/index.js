import React, { useState, useEffect, useContext } from "react";
import { Col, Row, Card } from "react-bootstrap";
import "./main.css";
import Audience from "../analytics/audience/Audience";
import { audienceChart } from "data/dashboard/analytics";
import FalconComponentCard from "components/common/FalconComponentCard";
import { ApiConfig } from "config/ApiConfig";
import axios from "axios";
import { Dropdown } from "primereact/dropdown";
import { DateRangePicker } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import subDays from "date-fns/subDays";
import startOfWeek from "date-fns/startOfWeek";
import endOfWeek from "date-fns/endOfWeek";
import addDays from "date-fns/addDays";
import startOfMonth from "date-fns/startOfMonth";
import endOfMonth from "date-fns/endOfMonth";
import addMonths from "date-fns/addMonths";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { startOfYear, endOfYear } from "date-fns";
import { toast } from "react-toastify";
import { DateRangeContext } from "context/DatePickerContext";
import { ClickedValueContext } from "context/tableAgentContext";

const getCurrentYearRange = () => {
  const currentDate = new Date();
  return [startOfYear(currentDate), endOfYear(currentDate)];
};
const defaultValue = getCurrentYearRange();
const { afterToday } = DateRangePicker;
const predefinedRanges = [
  {
    label: "Today",
    value: [new Date(), new Date()],
    placement: "left",
  },
  {
    label: "Yesterday",
    value: [addDays(new Date(), -1), addDays(new Date(), -1)],
    placement: "left",
  },
  {
    label: "This week",
    value: [startOfWeek(new Date()), endOfWeek(new Date())],
    placement: "left",
  },
  {
    label: "Last 7 days",
    value: [subDays(new Date(), 6), new Date()],
    placement: "left",
  },
  {
    label: "Last 30 days",
    value: [subDays(new Date(), 29), new Date()],
    placement: "left",
  },
  {
    label: "This month",
    value: [startOfMonth(new Date()), new Date()],
    placement: "left",
  },
  {
    label: "Last month",
    value: [
      startOfMonth(addMonths(new Date(), -1)),
      endOfMonth(addMonths(new Date(), -1)),
    ],
    placement: "left",
  },
  {
    label: "This year",
    value: [new Date(new Date().getFullYear(), 0, 1), new Date()],
    placement: "left",
  },
  {
    label: "Last week",
    closeOverlay: false,
    value: (value) => {
      const [start = new Date()] = value || [];
      return [
        addDays(startOfWeek(start, { weekStartsOn: 0 }), -7),
        addDays(endOfWeek(start, { weekStartsOn: 0 }), -7),
      ];
    },
    appearance: "default",
  },
];
const NavbarButton = ({ ...props }) => {
  const handleClick = (e) => {
    const target = e.target;
    target.classList.add("navbar-link--active");
    props.setOffsets(target.offsetLeft, target.offsetWidth);
  };
  return (
    <button
      type="button"
      className={props.btnClass}
      data-scroll-to={props.btnName}
      onClick={(e) => {
        if (!props.btnClass.includes("navbar-link--active")) {
          props.setActive(props.btnName);
          handleClick(e);
        }
      }}
    >
      {props.btnName}
    </button>
  );
};

const AnalyticsDash = () => {
  const navigate = useNavigate();

  const {
    clickedValue,
    selectedKPI,
    selectedGroup,
    kpiIndex,
    selectedKPIName,
  } = useContext(ClickedValueContext);

  const { dateRange, updateDateRange } = useContext(DateRangeContext);
  const NAV_LINKS = [
    "Activity",
    "Responses",
    "Handling Speed",
    "Solution Quality",
    "Service Quality",
  ];
  const [offLeft, setOffLeft] = React.useState(4);
  const [offWidth, setOffWidth] = React.useState(79);
  const [activeLink, setActiveLink] = React.useState(selectedGroup);
  const [theme, setTheme] = React.useState("dark");
  const navbarRef = React.useRef(null);
  const [apiData, setApiData] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [groupedAgents, setGroupedAgents] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [loadingGraphData, setLoadingGraphData] = useState(false);
  const [loadingApiData, setLoadingApiData] = useState(false);
  const [activeTab, setActiveTab] = useState(selectedKPI);
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(new Date());

  const handleAgentChange = (e) => {
    setSelectedAgents(e.value);
  };
  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      const [start, end] = dates;
      updateDateRange(start, end);
    }
  };
  const handleSetOffsets = (left, width) => {
    setOffLeft(left);
    setOffWidth(width);
  };

  const setNavX = (navbar) => {
    if (!navbar) return "87%";
    if (navbar.classList.contains("nav-x-init")) {
      navbar.classList.remove("nav-x-init");
      navbar.classList.add("nav-x-post");
    }
    return `${
      100 -
      Math.round(
        (Math.round(offLeft + Math.round(offWidth / 2) + 4) /
          navbar.offsetWidth) *
          100
      )
    }%`;
  };

  useEffect(() => {
    if (clickedValue && selectedAgents.length === 0) {
      setSelectedAgents(
        Array.isArray(clickedValue) ? clickedValue : [clickedValue]
      );
    }
  }, [clickedValue]);

  useEffect(() => {
    const fetchData = async () => {
      const config = {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        withCredentials: true,
      };
      setLoadingGraphData(true);
      try {
        const selectedAgentArray = Array.isArray(selectedAgents)
          ? selectedAgents
          : [selectedAgents];
        const clickedValueArray = clickedValue
          ? Array.isArray(clickedValue)
            ? clickedValue
            : [clickedValue]
          : [];
        const payload = {
          global_filter: {
            selected_groups: [],
            selected_channels: [],
            selected_agents:
              selectedAgentArray.length > 0
                ? selectedAgentArray
                : clickedValueArray,
            selected_teams: [],
            start_date: dateRange.startDate,
            end_date: dateRange.endDate,
          },
          selected_kpi: activeTab,
          group_by: "team",
          period: "D",
        };
        setGraphData({});
        const response = await axios.post(
          ApiConfig.analyticsGraph,
          payload,
          config
        );

        if (!response.data) {
          throw new Error("Failed to fetch data");
        }

        setGraphData(response.data);
      } catch (error) {
        console.error(error.response?.data?.detail?.masked_error, {
          theme: "colored",
        });
      } finally {
        setLoadingGraphData(false);
      }
    };

    fetchData();
  }, [
    activeTab,
    kpiIndex,
    activeLink,
    selectedAgents,
    dateRange.startDate,
    dateRange.endDate,
  ]);

  useEffect(() => {
    const fetchTotalValue = async () => {
      try {
        const selectedAgentArray = Array.isArray(selectedAgents)
          ? selectedAgents
          : [selectedAgents];
        const clickedValueArray = clickedValue
          ? Array.isArray(clickedValue)
            ? clickedValue
            : [clickedValue]
          : [];
        const payload = {
          global_filter: {
            selected_groups: [],
            selected_channels: [],
            selected_agents:
              selectedAgentArray.length > 0
                ? selectedAgentArray
                : clickedValueArray,
            selected_teams: [],
            start_date: dateRange.startDate,
            end_date: dateRange.endDate,
          },
          selected_kpi: activeTab,
          group_by: "team",
          period: "D",
        };
        const config = {
          headers: { "Access-Control-Allow-Origin": "*" },
          withCredentials: true,
        };
        const response = await axios.post(
          ApiConfig.analyticsTotalValue,
          payload,
          config
        );
        const setTotalValue = response.data;
      } catch (error) {
        console.error(error.response?.data?.detail?.masked_error, {
          theme: "colored",
        });
      }
    };
    fetchTotalValue();
  }, [
    activeTab,
    kpiIndex,
    activeLink,
    selectedAgents,
    dateRange.startDate,
    dateRange.endDate,
  ]);

  useEffect(() => {
    const fetchData = async () => {
      const config = {
        headers: { "Access-Control-Allow-Origin": "*" },
        withCredentials: true,
      };
      setLoadingApiData(true);
      try {
        const selectedAgentArray = Array.isArray(selectedAgents)
          ? selectedAgents
          : [selectedAgents];
        const clickedValueArray = clickedValue
          ? Array.isArray(clickedValue)
            ? clickedValue
            : [clickedValue]
          : [];
        const payload = {
          selected_groups: [],
          selected_channels: [],
          selected_agents:
            selectedAgentArray.length > 0
              ? selectedAgentArray
              : clickedValueArray,
          selected_teams: [],
          start_date: dateRange.startDate,
          end_date: dateRange.endDate,
        };
        const response = await axios.post(
          ApiConfig.analyticsTopBarData,
          payload,
          config
        );
        setApiData(response.data);
      } catch (error) {
        toast.error(error.response?.data?.detail?.masked_error, {
          theme: "colored",
        });
      } finally {
        setLoadingApiData(false);
      }
    };

    fetchData();
  }, [
    selectedAgents,
    kpiIndex,
    activeLink,
    dateRange.startDate,
    dateRange.endDate,
  ]);

  useEffect(() => {
    const fetchData = async () => {
      const config = {
        headers: { "Access-Control-Allow-Origin": "*" },
        withCredentials: true,
      };
      try {
        const response = await axios.get(ApiConfig.analyticsFilter, config);
        const data = response.data;

        const teamNames = Object.keys(data.teams);
        const mappedGroupedAgents = teamNames.map((teamName) => ({
          label: teamName,
          items: data.teams[teamName].members.map((member) => ({
            label: member.name,
            value: member.id,
          })),
        }));
        setGroupedAgents(mappedGroupedAgents);
      } catch (error) {
        toast.error(error.response?.data?.detail?.masked_error, {
          theme: "colored",
        });
      }
    };

    fetchData();
  }, [dateRange.startDate, dateRange.endDate, activeLink, kpiIndex]);

  const handleBackClick = () => {
    navigate("/analytics-dashboard");
  };

  const defaultDateRange = [dateRange.startDate, dateRange.endDate];
  const placeholderText = `${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`;

  return (
    <>
      <div id="body" className={theme}>
        <header className="header justify-content-center">
          <div
            className="navbar nav-x-init"
            ref={navbarRef}
            style={{ ["--x"]: setNavX(navbarRef.current) }}
          >
            <div className="navbar-curr--stroke" aria-hidden="true"></div>
            <div className="navbar-root">
              {NAV_LINKS.map((link) => (
                <NavbarButton
                  key={link}
                  btnName={link}
                  btnClass={
                    activeLink == link
                      ? "navbar-link navbar-link--active"
                      : "navbar-link"
                  }
                  setActive={setActiveLink}
                  setOffsets={handleSetOffsets}
                />
              ))}
              <div
                className="navbar-curr--pill"
                aria-hidden="true"
                style={{ left: `${offLeft}px`, width: `${offWidth}px` }}
              ></div>
              <div
                className="navbar-curr--glow"
                aria-hidden="true"
                style={{
                  left: `${offLeft + Math.round(offWidth / 2) - 20.25}px`,
                }}
              ></div>
            </div>
          </div>
        </header>
      </div>
      <Card.Body className="pb-0 mb-2">
        <Card className="h-100 mt-4">
          <div className="d-flex">
            <div
              className="m-4 mt-2 mb-2 d-flex align-items-center"
              onClick={handleBackClick}
              style={{ cursor: "pointer" }}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              <h6 className="m-1">Back</h6>
            </div>
            <Row className="m-3 justify-content-end text-center w-100">
              <Col lg={4}>
                <FalconComponentCard noGuttersBottom>
                  <DateRangePicker
                    ranges={predefinedRanges}
                    value={[dateRange.startDate, dateRange.endDate]}
                    onChange={handleDateRangeChange}
                    showOneCalendar
                    shouldDisableDate={afterToday()}
                  />
                </FalconComponentCard>
              </Col>
              <Col md={3}>
                <Dropdown
                  value={selectedAgents}
                  options={groupedAgents}
                  optionLabel="label"
                  optionGroupLabel="label"
                  optionGroupChildren="items"
                  onChange={handleAgentChange}
                  maxSelectedLabels={1}
                  placeholder={selectedKPIName}
                  className="w-full md:w-14rem"
                />
              </Col>
              {/* <Col md={3}>
                <DateRangePicker showOneCalendar />
              </Col> */}
            </Row>
          </div>
        </Card>
      </Card.Body>
      {activeLink === "Activity" && (
        <>
          <Row className="mb-3 mt-2">
            <Col xxl={12}>
              <Audience
                loadingGraphData={loadingGraphData}
                AgentData={selectedAgents}
                graphData={graphData}
                apiData={apiData?.Activity}
                chartData={audienceChart}
                className="mb-3"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                kpiIndex={kpiIndex}
              />
            </Col>
          </Row>
        </>
      )}
      {activeLink === "Responses" && (
        <>
          <Row className="mb-3 mt-2">
            <Col xxl={12}>
              <Audience
                loadingGraphData={loadingGraphData}
                AgentData={selectedAgents}
                graphData={graphData}
                apiData={apiData?.Responses}
                chartData={audienceChart}
                className="mb-3"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                kpiIndex={kpiIndex}
              />
            </Col>
          </Row>
        </>
      )}
      {activeLink === "Handling Speed" && (
        <>
          <Row className="mb-3 mt-2">
            <Col xxl={12}>
              <Audience
                loadingGraphData={loadingGraphData}
                AgentData={selectedAgents}
                graphData={graphData}
                apiData={apiData?.Handling_Speed}
                chartData={audienceChart}
                className="mb-3"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                kpiIndex={kpiIndex}
              />
            </Col>
          </Row>
        </>
      )}
      {activeLink === "Solution Quality" && (
        <>
          <Row className="mb-3 mt-2">
            <Col xxl={12}>
              <Audience
                loadingGraphData={loadingGraphData}
                AgentData={selectedAgents}
                graphData={graphData}
                apiData={apiData?.Solution_Quality}
                chartData={audienceChart}
                className="mb-3"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                kpiIndex={kpiIndex}
              />
            </Col>
          </Row>
        </>
      )}
      {activeLink === "Service Quality" && (
        <>
          <Row className="mb-3 mt-2">
            <Col xxl={12}>
              <Audience
                loadingGraphData={loadingGraphData}
                AgentData={selectedAgents}
                graphData={graphData}
                apiData={apiData?.Service_Quality}
                chartData={audienceChart}
                className="mb-3"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                kpiIndex={kpiIndex}
              />
            </Col>
          </Row>
        </>
      )}
    </>
  );
};
export default AnalyticsDash;

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Card, Tab, Nav } from "react-bootstrap";
import Flex from "components/common/Flex";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AudienceChart from "./AudienceChart";
import SimpleBarReact from "simplebar-react";
import classNames from "classnames";
import Loader from "components/Loader/Loader";

const TabTitle = ({ title, value, setActiveTab, percentage, progress }) => (
  <div
    className="p-2 pe-4 text-center cursor-pointer"
    onClick={() => {
      setActiveTab(title);
    }}
  >
    <h6 className="text-800 fs--2 text-nowrap">{title}</h6>
    <h5 className="text-800">{value}</h5>
    <Flex alignItems="center" className="justify-content-center">
      <FontAwesomeIcon
        icon={progress ? "caret-up" : "caret-down"}
        className={progress ? "text-success" : "text-warning"}
      />
      <h6
        className={`fs--2 mb-0 ms-2 ${
          progress ? "text-success" : "text-warning"
        }`}
      >
        {percentage}
      </h6>
    </Flex>
  </div>
);

const Audience = ({
  className,
  activeTab,
  setActiveTab,
  apiData,
  graphData,
  AgentData,
  loadingGraphData,
  kpiIndex,
}) => {
  const [currentTab, setCurrentTab] = useState(
    apiData ? Object.keys(apiData)[kpiIndex || 0] : null
  );

  useEffect(() => {
    if (apiData) {
      const newTab = Object.keys(apiData)[kpiIndex || 0];
      setCurrentTab(newTab);
      setActiveTab(newTab);
    }
  }, [kpiIndex, apiData, setActiveTab]);

  const handleSelect = (key) => {
    setCurrentTab(key);
    setActiveTab(key);
  };
  if (!apiData) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "70%",
          height: "90%",
          position: "fixed",
        }}
      >
        {apiData ? (
          <>
            <Loader />
          </>
        ) : (
          <>
            {" "}
            <Loader />
          </>
        )}
      </div>
    );
  }
  console.log(currentTab);
  return (
    <Card className={classNames(className, "overflow-hidden")}>
      <Tab.Container
        id="audience-tab"
        activeKey={currentTab}
        onSelect={handleSelect}
      >
        <SimpleBarReact>
          <Card.Header className="p-0 bg-light">
            <Nav className="nav-tabs border-0 flex-nowrap chart-tab">
              {Object.entries(apiData).map(([key, value]) => (
                <Nav.Item className="bg-blue-400" key={key}>
                  <Nav.Link className="mb-0" eventKey={key}>
                    <TabTitle
                      title={key}
                      value={value}
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      // progress={true}
                      // percentage="46.2%"
                    />
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </Card.Header>
        </SimpleBarReact>
        <Card.Body>
          <Tab.Content>
            {Object?.keys(apiData)?.map((tabName, index) => (
              <Tab.Pane unmountOnExit key={index} eventKey={tabName}>
                <AudienceChart
                  load={loadingGraphData}
                  data={graphData}
                  AgentDatas={AgentData}
                />
              </Tab.Pane>
            ))}
          </Tab.Content>
        </Card.Body>
      </Tab.Container>
    </Card>
  );
};

TabTitle.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  progress: PropTypes.bool,
};

Audience.propTypes = {
  chartData: PropTypes.shape({
    users: PropTypes.arrayOf(PropTypes.array),
    sessions: PropTypes.arrayOf(PropTypes.array),
    rate: PropTypes.arrayOf(PropTypes.array),
    duration: PropTypes.arrayOf(PropTypes.array),
  }).isRequired,
  className: PropTypes.string.isRequired,
};

export default Audience;

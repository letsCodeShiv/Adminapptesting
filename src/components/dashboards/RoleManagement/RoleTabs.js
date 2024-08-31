import React, { useState } from "react";
import { Tab, Tabs, Row, Col, Card } from "react-bootstrap";
import Agents from "./Agents";
import Teams from "./Teams";
import Roles from "./Roles";
import { Tooltip as ReactTooltip } from "react-tooltip";

const RoleTabs = () => {
  const [activeKey, setActiveKey] = useState("Agents");

  const handleSelect = (key) => {
    setActiveKey(key);
  };

  return (
    <Card className="mb-3">
      <Card.Header className="bg-light">
        <h5 className="mb-0">
          Role Management
        </h5>
      </Card.Header>
      <Card.Body className="text-justify text-1000">
        <Row>
          <Col md={12}>
            <Tabs id="role-tabs" activeKey={activeKey} onSelect={handleSelect}>
              <Tab
                
                eventKey="Agents"
                title="Agents"
                className="border-bottom border-x p-2 pt-4"
              >
                <ReactTooltip
                  id="Agents"
                  place="bottom"
                  content={`Click to download the current chat.`}
                  style={{ zIndex: "9999" }}
                  delayShow={200}
                />
                {activeKey === "Agents" && <Agents data-tooltip-id="Agents"/>}
              </Tab>
              <Tab
                eventKey="Teams"
                title="Teams"
                className="border-bottom border-x p-2 pt-4"
              >
                {activeKey === "Teams" && <Teams />}
              </Tab>
              <Tab
                eventKey="Roles"
                title="Roles"
                className="border-bottom border-x p-2 pt-4"
              >
                {activeKey === "Roles" && <Roles />}
              </Tab>
            </Tabs>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default RoleTabs;

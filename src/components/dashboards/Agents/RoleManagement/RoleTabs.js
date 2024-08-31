import React from "react";
import { Tab, Tabs, Row, Col } from "react-bootstrap";
import Agents from "./Agents";
import Teams from "./Teams";
import Roles from "./Roles";

const RoleTabs = () => {
  return (
    <Row>
      <Col md={12}>
        <Tabs defaultActiveKey="Agents" id="uncontrolled-tab-example">
          <Tab
            eventKey="Agents"
            title="Agents"
            className="border-bottom border-x p-2 pt-4"
          >
            <Agents />
          </Tab>
          <Tab
            eventKey="Teams"
            title="Teams"
            className="border-bottom border-x p-2 pt-4"
          >
            <Teams />
          </Tab>
          <Tab
            eventKey="Roles"
            title="Roles"
            className="border-bottom border-x p-2 pt-4"
          >
            <Roles />
          </Tab>
        </Tabs>
      </Col>
    </Row>
  );
};

export default RoleTabs;

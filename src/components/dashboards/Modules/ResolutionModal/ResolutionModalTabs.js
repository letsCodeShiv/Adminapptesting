import React, { useState } from "react";
import { Row, Col, Tab, Tabs } from "react-bootstrap";
import Analytics from "./Analytics";
import KnowledgeBase from "./KnowledgeBase";
import TicketIngestionStatus from "./TicketIngestionStatus";
import KBIngestionStatus from "./KBIngestionStatus";

const ResolutionModal = (data) => {
  const [activeTab, setActiveTab] = useState(data.activeTab); // Default to 'Resolution' tab

  const handleSelect = (key) => {
    setActiveTab(key);
  };

  return (
    <>
      <h4 className="text-center mb-3">{data?.data?.name} Settings</h4>
      <Row>
        <Col md={12}>
          <Tabs id="role-tabs" activeKey={activeTab} onSelect={handleSelect}>
            <Tab
              eventKey="KB Ingestion"
              title="Knowledge Base Ingestion"
              className="border-bottom border-x p-2 pt-4"
            >
              {activeTab === "KB Ingestion" && (
                <KnowledgeBase props={data?.data} />
              )}
            </Tab>
            <Tab
              eventKey="Analytics"
              title="Analytics Dashboard"
              className="border-bottom border-x p-2 pt-4"
            >
              {activeTab === "Analytics" && (
                <Analytics
                  props={data?.data}
                  updateParentSettings={data?.updateParentSettings}
                />
              )}
            </Tab>
            <Tab
              eventKey="TicketStatus"
              title="Tickets Processed"
              className="border-bottom border-x p-3"
            >
              {activeTab === "TicketStatus" && <TicketIngestionStatus />}
            </Tab>
            <Tab
              eventKey="KBStatus"
              title="Knowledge Base Processed"
              className="border-bottom border-x p-3"
            >
              {activeTab === "KBStatus" && <KBIngestionStatus />}
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </>
  );
};

export default ResolutionModal;

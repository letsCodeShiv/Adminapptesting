import React, { useState } from "react";
import FalconComponentCard from "components/common/FalconComponentCard";
import { Form, Row, Col } from "react-bootstrap";

const TrackActivity = () => {
  const [selectedRadio, setSelectedRadio] = useState("High");

  const handleRadioChange = (event) => {
    setSelectedRadio(event.target.value);
  };
  return (
    <div>
      <FalconComponentCard>
        <FalconComponentCard.Header light={false}>
          <h4>Track activity</h4>
        </FalconComponentCard.Header>
        <FalconComponentCard.Body>
          <h6 className="mb-2">Define granularity level</h6>
          <p>
            Topcx calculates the number of hours agents are actively working in
            Zendesk based on all actions, or touchpoints, applied to tickets.
            Depending on your business needs, you can choose a higher
            granularity level for a more realistic Activity Hours metric or a
            lower granularity level to attribute bigger work time slots to
            potentially few touchpoints within a specific time frame.
            <br /> Some metrics rely on Activity Hours, they usually end in
            "/h", so their calculation will also be affected.
          </p>
          <h6 className="mb-4">Data granularity</h6>
          <Row>
            <Col xs={12} md={3}>
              <Form.Check
                type="radio"
                id="highRadio"
                label="High"
                name="radio"
                checked={selectedRadio === "High"}
                onChange={handleRadioChange}
              />
            </Col>
            <Col xs={12} md={9}>
              <p className="description">
                Time intervals of 5 minutes - perfect for tracking every click
              </p>
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={3}>
              <Form.Check
                type="radio"
                id="mediumRadio"
                label="Medium"
                name="radio"
                checked={selectedRadio === "Medium"}
                onChange={handleRadioChange}
              />
            </Col>
            <Col xs={12} md={9}>
              <p className="description">
                Time intervals of 15 minutes - suitable for tracking
              </p>
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={3}>
              <Form.Check
                type="radio"
                id="moderatelyLowRadio"
                label="Moderately"
                name="radio"
                checked={selectedRadio === "Moderately"}
                onChange={handleRadioChange}
              />
            </Col>
            <Col xs={12} md={9}>
              <p className="description">
                Time intervals of 30 minutes - best for giving more processing
                time to agents
              </p>
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={3}>
              <Form.Check
                type="radio"
                id="lowRadio"
                label="Low"
                name="radio"
                checked={selectedRadio === "Low"}
                onChange={handleRadioChange}
              />
            </Col>
            <Col xs={12} md={9}>
              <p className="description">
                Time intervals of 45 minutes - great for giving agents a lot of
                time
              </p>
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={3}>
              <Form.Check
                type="radio"
                id="veryLowRadio"
                label="Very Low"
                name="radio"
                checked={selectedRadio === "Very Low"}
                onChange={handleRadioChange}
              />
            </Col>
            <Col xs={12} md={9}>
              <p className="description">
                great for giving agents a lot of time,
              </p>
            </Col>
          </Row>
        </FalconComponentCard.Body>
      </FalconComponentCard>
    </div>
  );
};

export default TrackActivity;

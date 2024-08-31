import React from "react";
import { Card, Col, Form, Row } from "react-bootstrap";
import TrafficSourceChart from "./TrafficSourceChart";

function TrafficSource() {
  return (
    <Card className="h-100">
      <Card.Body className="pb-0">
        <TrafficSourceChart />
      </Card.Body>
    </Card>
  );
}

export default TrafficSource;

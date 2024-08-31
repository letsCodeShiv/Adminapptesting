import FalconCardHeader from "components/common/FalconCardHeader";
import FalconLink from "components/common/FalconLink";
import React from "react";
import { Card, ProgressBar } from "react-bootstrap";

const TeamProgress = () => {
  return (
    <Card className="h-100">
      <FalconCardHeader title="Team Progress" />
      <Card.Body>
        <p className="fs--1 text-600">
          See team members' time worked, <br /> activity levels, and progress
        </p>

        <ProgressBar
          now={30}
          key={1}
          style={{ height: "6px" }}
          className="rounded-pill mb-3"
        />

        <p className="mb-0 text-primary"> 75% completed</p>
        <p className="mb-0 fs--2 text-500">Jan 1st to 30th</p>
      </Card.Body>
    </Card>
  );
};

export default TeamProgress;

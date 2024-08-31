import React from "react";
import { Col, Row } from "react-bootstrap";
import Section from "components/common/Section";
import Logo from "components/common/Logo";
import Onboard from "./Onboard";

const OnboardWrapper = () => {
  return (
    <Section className="py-0">
      <Row className="justify-content-center pt-3">
        <Col>
          <Logo width={45} textClass="fs-4" />
          <Onboard validation={true} />
        </Col>
      </Row>
    </Section>
  );
};

export default OnboardWrapper;

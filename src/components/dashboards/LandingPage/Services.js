import React from "react";
import { Row, Col } from "react-bootstrap";
import className from "classnames";
import featureList from "./featureList";
import Section from "components/common/Section";
import CardService from "./CardService";
import SectionHeader from "./SectionHeader";

const Services = () => (
  <Section bg="light" className="text-center">
    <SectionHeader
      title="Here's what's in it for you"
      subtitle="Things you will get right out of the box with TopCX."
    />
    <Row className="mt-6">
      {featureList.map((service, index) => (
        <Col
          lg={4}
          className={className({ "mt-6 mt-lg-0": index > 0 })}
          key={index}
        >
          <CardService {...service} />
        </Col>
      ))}
    </Row>
  </Section>
);

export default Services;

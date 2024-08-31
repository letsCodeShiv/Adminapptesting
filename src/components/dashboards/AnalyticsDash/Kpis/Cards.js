import React from "react";
import PropTypes from "prop-types";
import { Card, Row, Col } from "react-bootstrap";
import classNames from "classnames";
import Background from "components/common/Background";
import SoftBadge from "components/common/SoftBadge";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CountUp from "react-countup";
import bg4 from "../../../../assets/img/icons/spot-illustrations/corner-1.png";
import bg5 from "../../../../assets/img/icons/spot-illustrations/corner-2.png";
import bg6 from "../../../../assets/img/icons/spot-illustrations/corner-3.png";
import bg7 from "../../../../assets/img/icons/spot-illustrations/corner-4.png";
import bg8 from "../../../../assets/img/icons/spot-illustrations/corner-5.png";
import bg9 from "../../../../assets/img/icons/spot-illustrations/corner-6.png";
import bg1 from "assets/img/icons/spot-illustrations/corner-1.png";

const statsData = [
  {
    title: "Productivity",
    value: 58.39,
    decimal: true,
    suffix: "k",
    prefix: "",
    valueClassName: "text-info",
    badgeBg: "warning",
    link: "/e-commerce/customers",
    linkText: "See all",
    image: bg1,
  },
  {
    title: "CSAT",
    value: 23.43,
    decimal: true,
    suffix: "k",
    prefix: "",
    valueClassName: "text-info",
    badgeBg: "info",
    link: "/e-commerce/orders/order-list",
    linkText: "All orders",
    image: bg6,
  },
  {
    title: "CVR",
    value: 43594,
    decimal: false,
    suffix: "",
    prefix: "$",
    valueClassName: "text-info",
    badgeBg: "success",
    link: "/",
    linkText: "Statistics",
    image: bg7,
  },
  {
    title: "SRR",
    value: 23.43,
    decimal: true,
    suffix: "k",
    prefix: "",
    valueClassName: "text-info",
    badgeBg: "info",
    link: "/e-commerce/orders/order-list",
    linkText: "All orders",
    image: bg8,
  },
  {
    title: "Avg. Time to Resolve",
    value: 23.43,
    decimal: true,
    suffix: "k",
    prefix: "",
    valueClassName: "text-info",
    badgeBg: "info",
    link: "/e-commerce/orders/order-list",
    linkText: "All orders",
    image: bg9,
  },
  {
    title: "Avg. CWT",
    value: 23.43,
    decimal: true,
    suffix: "k",
    prefix: "",
    valueClassName: "text-info",
    badgeBg: "info",
    link: "/e-commerce/orders/order-list",
    linkText: "All orders",
    image: bg4,
  },
];
const KpisCards = () => {
  return (
    <>
      <Row className="g-3 mb-3 mt-2">
        {statsData.map((dataItem, index) => (
          <Col sm={2}>
            <Card key={index} className={classNames("overflow-hidden")}>
              <Background src={bg9} className="bg-card" />
              <Card.Body className="position-relative">
                <h6>{dataItem.title}</h6>
                <div
                  className={classNames(
                    `text-info display-4 fs-3 mb-2 fw-normal font-sans-serif mt-3`
                  )}
                >
                  <CountUp
                    start={0}
                    end={dataItem.value}
                    duration={1}
                    separator=","
                    decimal={dataItem.decimal}
                    prefix={dataItem.prefix}
                    suffix={dataItem.suffix}
                  />
                </div>
                <Link to={dataItem.link} className="stretched-link"></Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default KpisCards;

import React, { useState, useContext, useEffect } from "react";
import {
  Card,
  Container,
  Row,
  Col,
  Button,
  ButtonGroup,
  ToggleButton,
  ListGroup,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { pricingData } from "./PricingData";
import SoftBadge from "components/common/SoftBadge";
import { PaymentContext } from "context/PaymentContext";
import Loader from "components/Loader/Loader";
import ForwardRefFontAwesomeIcon from "helpers/ForwardRefFontAwesomeIcon";
import { Tooltip, OverlayTrigger } from "react-bootstrap";

const PricingTable = () => {
  const {
    stripePayment,
    fetchPaymentStatus,
    isLoadingStatus,
    isLoadingUpdate,
    orgStatus,
    status,
    backdrop,
    orgPlanDetail,
    UpdatePaymentStatus,
    isLoadingTrail,
    fetchOrgStatus,
  } = useContext(PaymentContext);
  const [isYearly, setIsYearly] = useState(false);

  useEffect(() => {
    fetchPaymentStatus();
    fetchOrgStatus("fetch");
  }, []);

  if (isLoadingStatus || isLoadingTrail) {
    return (
      <Container className="mt-5 d-flex justify-content-center">
        <Loader />
      </Container>
    );
  }
  // if (orgStatus.org_status === "explore") {
  //   return (
  //     <Container className="mt-5 d-flex justify-content-center align-items-center">
  //       <Card className="shadow" style={{ width: "100%" }}>
  //         <Card.Body className="p-4">
  //           <Card.Title className="text-center mb-3">
  //             Start Your Trial
  //           </Card.Title>
  //           <Card.Text className="text-center mb-4">
  //             Unlock all features by starting your trial. Enjoy the full
  //             experience immediately!
  //           </Card.Text>
  //         </Card.Body>
  //       </Card>
  //     </Container>
  //   );
  // }
  if (!status) {
    const { plan_name, plan_period, remaining_days } = orgPlanDetail;
    const currentPlan = pricingData.find((plan) => plan.title === plan_name);

    return (
      <>
        {backdrop && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 99999,
            }}
          ></div>
        )}
        <Container>
          <Card className="w-100">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Plan Details</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <div className="container">
                    <div className="row">
                      <div className="col-7" style={{ paddingLeft: 0 }}>
                        <strong>Plan:</strong>
                      </div>
                      <div className="col-5 d-flex">
                        <span>{plan_name}</span>
                      </div>
                    </div>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="container">
                    <div className="row">
                      <div className="col-7" style={{ paddingLeft: 0 }}>
                        <strong>Subscription:</strong>
                      </div>
                      <div className="col-5 d-flex">
                        <span>
                          {plan_period === "Monthly" ? "Monthly" : "Yearly"}
                        </span>
                      </div>
                    </div>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="container">
                    <div className="row">
                      <div className="col-7" style={{ paddingLeft: 0 }}>
                        <strong>Features:</strong>
                      </div>
                      <div className="col-5 d-flex">
                        <ul style={{ paddingLeft: 0, paddingBottom: 0 }}>
                          {currentPlan?.features.map((feature) => (
                            <li key={feature.id}>{feature.title}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="container">
                    <div className="row">
                      <div className="col-7" style={{ paddingLeft: 0 }}>
                        <strong>Remaining Days:</strong>
                      </div>
                      <div className="col-5 d-flex">
                        <span>{remaining_days} days</span>
                      </div>
                    </div>
                  </div>
                </ListGroup.Item>
              </ListGroup>
              <div className="d-flex justify-content-center mr-3">
                <Button
                  variant="primary"
                  size="lg"
                  className="mt-4 w-25"
                  onClick={UpdatePaymentStatus}
                  disabled={isLoadingUpdate}
                >
                  {isLoadingUpdate ? "loading..." : "Manage Your Plan"}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Container>
      </>
    );
  }
  return (
    <>
      {backdrop && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 99999,
          }}
        ></div>
      )}
      <Container className="mt-5">
        <header className="text-center mb-4">
          <ButtonGroup>
            <ToggleButton
              type="radio"
              variant="outline-primary"
              name="pricingOption"
              value="monthly"
              checked={!isYearly}
              onClick={() => {
                setIsYearly(false);
              }}
            >
              Monthly
            </ToggleButton>
            <ToggleButton
              type="radio"
              variant="outline-primary"
              name="pricingOption"
              value="yearly"
              checked={isYearly}
              onClick={() => {
                setIsYearly(true);
              }}
            >
              Yearly
            </ToggleButton>
          </ButtonGroup>
        </header>
        <Row className="g-4 justify-content-center">
          {pricingData.map((plan) => (
            <Col
              key={plan.id}
              lg={4}
              className={classNames("border-top border-bottom", {
                "dark__bg-1000 px-4 px-lg-0": plan.isFeatured,
              })}
              style={{
                backgroundColor: plan.isFeatured && "rgba(115, 255, 236, 0.18)",
              }}
            >
              <div className="h100">
                <div className="text-center p-4">
                  <h3 className="fw-normal my-0">{plan.title}</h3>
                  <p className="mt-3">{plan.subTitle}</p>
                  <h2 className="fw-medium my-4">
                    <sup className="fw-normal fs-2 me-1">$</sup>
                    {isYearly ? plan.priceYearly : plan.priceMonthly}
                    <small className="fs--1 text-700">
                      {isYearly ? " /year" : " /month"}
                    </small>
                  </h2>
                  {orgStatus.org_status === "explore" ? (
                    <Button
                      variant={plan.isFeatured ? "primary" : "outline-primary"}
                      onClick={() => fetchOrgStatus("start_trial")}
                    >
                      Start Trail
                    </Button>
                  ) : (
                    <Button
                      variant={plan.isFeatured ? "primary" : "outline-primary"}
                      onClick={() =>
                        stripePayment(
                          isYearly ? plan.urlYearly : plan.urlMonthly
                        )
                      }
                    >
                      {plan.buttonText}
                    </Button>
                  )}
                </div>
                <hr className="border-bottom-0 m-0" />
                <div className="text-start px-sm-4 py-4">
                  <h5 className="fw-medium fs-0">{plan.featureTitle}</h5>
                  <ul className="list-unstyled mt-3">
                    {plan.features.map((feature) => (
                      <>
                        <li className="py-1" key={feature.id}>
                          <FontAwesomeIcon
                            icon="check"
                            className="me-2 text-success"
                          />
                          {feature.title}&nbsp;
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id={`tooltip-${feature.id}`}>
                                {feature.detail}
                              </Tooltip>
                            }
                          >
                            <span>
                              <ForwardRefFontAwesomeIcon
                                icon="info-circle"
                                className="ms-2 text-secondary my-auto"
                              />
                            </span>
                          </OverlayTrigger>
                          {feature.tag && (
                            <SoftBadge pill bg={feature.tag.type}>
                              {feature.tag.label}
                            </SoftBadge>
                          )}
                        </li>
                      </>
                    ))}
                  </ul>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default PricingTable;

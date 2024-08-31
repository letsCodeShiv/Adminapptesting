import React, { useEffect, useContext, useState } from "react";
import { Button, Modal, Alert, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PaymentContext } from "context/PaymentContext";
import { useNavigate } from "react-router-dom";
import Loader from "components/Loader/Loader";
import { ApiConfig } from "config/ApiConfig";
import { useThirdPartyCookieCheck } from "hooks/useThirdPartyCookieCheck";
import axios from "axios";

const PlanAlert = () => {
  const {
    openStripePayment,
    fetchOrgStatus,
    fetchPaymentStatus,
    isLoadingTrail,
    isLoadingStatus,
    isLoadingUpdate,
    orgStatus,
    status,
    showModalNoPayment,
    showModalTrail,
    setShowModalTrail,
    showFormModal,
    setShowFormModal,
    isCallBooked,
    setIsCallBooked,
    downgradeGracePeriod,
  } = useContext(PaymentContext);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const [areCookiesEnabled, setAreCookiesEnabled] = useState(null); // Initialize as null

  const cookieCheck = useThirdPartyCookieCheck();

  useEffect(() => {
    if (cookieCheck !== null) {
      // Check if cookie status is determined
      setAreCookiesEnabled(cookieCheck);
    }
  }, [cookieCheck]);

  useEffect(() => {
    fetchOrgStatus("fetch");
    fetchPaymentStatus();
  }, []);

  const validate = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Full Name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\+?[1-9]\d{0,3}(?:[ -]?\d{1,4}){1,4}$/.test(formData.phone)) {
      errors.phone = "Phone number is invalid";
    }

    if (!formData.message.trim()) {
      errors.message = "Message is required";
    }

    return errors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      try {
        const response = await axios.post(ApiConfig.urlContactUs, {
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        });
        setIsCallBooked(true);
        setFormData({ fullName: "", email: "", phone: "", message: "" });
        setErrors({});
      } catch (error) {
        console.error("Sending message failed:", error);
        alert("Failed to send message!");
      }
    }
  };

  if (areCookiesEnabled === null) {
    // Render a loading or placeholder UI while checking for cookies
    return (
      <div className="alert alert-danger" role="alert">
        <Loader />
      </div>
    );
  }

  if (!areCookiesEnabled) {
    return (
      <div className="alert alert-warning" role="alert">
        <Modal show={true} onHide={() => {}} size="lg">
          <Modal.Header>
            <Modal.Title>Browser Configuration Required</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              It looks like third-party cookies are disabled in your browser. To
              ensure full functionality of this application, please enable
              third-party cookies by following these steps:
            </p>
            <h6>Google Chrome:</h6>
            <ol>
              <li>
                Go to Settings &gt; Privacy and security &gt; Cookies and other
                site data.
              </li>
              <li>Select "Allow all cookies".</li>
            </ol>
            <h6>Mozilla Firefox:</h6>
            <ol>
              <li>
                Go to Preferences &gt; Privacy & Security &gt; Cookies and Site
                Data.
              </li>
              <li>
                Select "Accept cookies and site data from websites
                (recommended)".
              </li>
            </ol>
            <h6>Safari:</h6>
            <ol>
              <li>Go to Preferences &gt; Privacy.</li>
              <li>Uncheck "Block all cookies".</li>
            </ol>
          </Modal.Body>
          <Modal.Footer>
            <div style={{ width: "100%", textAlign: "center" }}>
              <Button
                variant="primary"
                onClick={() => window.location.reload()}
              >
                Reload
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }

  return (
    <>
      {(orgStatus.org_status === "trialing" && status) ||
      (orgStatus.org_status === "explore" && status) ||
      (orgStatus.org_status === "canceled" && status) ? (
        <div
          className="p-0 m-0 bg-warning d-flex rounded-0"
          style={{
            position: "fixed",
            bottom: downgradeGracePeriod !== -1 ? "35px" : "0",
            left: 0,
            right: 0,
            zIndex: 9999,
            height: "35px",
            borderTop: "2px solid #ffffff",
          }}
        >
          <div className="d-flex my-auto ms-4">
            <FontAwesomeIcon
              icon="exclamation-triangle"
              className="fs-2  my-auto text-white"
            />
            <p
              className="ms-1  my-auto text-white"
              style={{
                fontSize: "15px",
              }}
            >
              {orgStatus.org_status === "trialing"
                ? `Purchase Full Plan ${
                    orgStatus.days_left < 0 ? "0" : orgStatus.days_left
                  } Days Left`
                : orgStatus.org_status === "canceled"
                ? "Plan Expired"
                : "Start your Trial plan"}
            </p>
          </div>
          <Button
            variant="falcon-warning"
            className="m-0 my-auto ms-5 p-0"
            onClick={() => {
              {
                orgStatus.org_status === "trialing"
                  ? navigate("/pricing")
                  : orgStatus.org_status === "canceled"
                  ? openStripePayment()
                  : setShowModalTrail(true);
              }
            }}
            style={{
              height: "20px",
              width: "70px",
              fontSize: "10px",
            }}
          >
            {orgStatus.org_status === "trialing" ||
            orgStatus.org_status === "canceled"
              ? "Purchase"
              : "Activate"}
          </Button>
        </div>
      ) : (
        <></>
      )}
      {downgradeGracePeriod !== -1 && (
        <div
          className="p-0 m-0 d-flex rounded-0"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            height: "35px",
            borderTop: "2px solid #ffffff",
            backgroundColor: downgradeGracePeriod < 8 ? "#2c7be5" : "#e92626",
          }}
        >
          <div className="d-flex my-auto ms-4">
            <FontAwesomeIcon
              icon="exclamation-triangle"
              className="fs-2  my-auto text-white"
            />
            <p
              className="ms-1  my-auto text-white"
              style={{
                fontSize: "15px",
              }}
            >
              {downgradeGracePeriod < 8 ? (
                <>
                  <strong>{7 - downgradeGracePeriod} Days Left: </strong> Reduce
                  your agents according to plan limit.
                </>
              ) : (
                <>Reduce your agents to activate the Agent App.</>
              )}
            </p>
          </div>
          <Button
            variant={
              downgradeGracePeriod < 8 ? "falcon-primary" : "falcon-danger"
            }
            className="m-0 my-auto ms-5 p-0"
            onClick={() => {
              {
                navigate("/rolemanagement");
              }
            }}
            style={{
              height: "20px",
              width: "80px",
              fontSize: "10px",
            }}
          >
            Downgrade
          </Button>
        </div>
      )}
      <Modal
        show={showModalTrail}
        size="sg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton onClick={() => setShowModalTrail(false)}>
          <Modal.Title id="contained-modal-title-vcenter">
            Free Trial
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <p
              className="mb-2"
              style={{
                fontSize: "18px",
                color: "black",
              }}
            >
              Are you sure you want to start your trial
            </p>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-evenly",
              alignItems: "center",
              marginTop: "1rem",
            }}
          >
            <Button
              variant="outline-danger"
              onClick={() => setShowModalTrail(false)}
            >
              Cancel
            </Button>
            <Button
              variant="outline-success"
              onClick={() => fetchOrgStatus("start_trial")}
              disabled={isLoadingTrail}
            >
              {isLoadingTrail ? "Confirming" : "Confirm"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={showModalNoPayment}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        style={showFormModal ? { filter: "blur(5px)" } : {}}
      >
        <Modal.Body className="px-4 py-3">
          {isLoadingStatus || isLoadingUpdate || isLoadingTrail ? (
            <Loader />
          ) : (
            <>
              <h5 className="mb-4 d-flex align-items-center">
                <span className="text-primary">
                  <FontAwesomeIcon
                    icon="exclamation-triangle"
                    className="fs-2 me-2"
                  />
                </span>
                <span className="font-weight-bold">Upgrade Account</span>
              </h5>

              <Alert
                variant="info"
                className="rounded-3 border-0 shadow-sm"
                style={{ backgroundColor: "#f0f8ff", color: "#333" }}
              >
                <Alert.Heading className="font-weight-bold">
                  Hey, {sessionStorage.getItem("email")}
                </Alert.Heading>
                <p>
                  The trial or current subscription plan of your account has
                  expired. We're glad you're enjoying using TopCX with your
                  whole team. To continue using TopCX with your team, you need
                  to be a paying customer of our product. You can select below
                  to unlock TopCX's features.
                </p>
              </Alert>
              <h6 className="mb-3 font-weight-bold">
                Please select one of the following options:
              </h6>
              <div className="d-flex justify-content-between align-items-center mb-3 px-3 py-2 bg-light rounded-3 shadow-sm">
                <p className="mb-0 text-secondary" style={{ fontSize: "14px" }}>
                  Schedule a call with our team to get more info about TopCX
                </p>
                <Button
                  variant="primary"
                  className="py-1 px-3"
                  onClick={() => setShowFormModal(true)}
                  style={{
                    height: "25px",
                    width: "100px",
                    fontSize: "12px",
                  }}
                >
                  Book a call
                </Button>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3 px-3 py-2 bg-light rounded-3 shadow-sm">
                <p className="mb-0 text-secondary" style={{ fontSize: "14px" }}>
                  Upgrade your account to one of our plans
                </p>
                <Button
                  variant="primary"
                  className="py-1 px-3"
                  onClick={() => openStripePayment()}
                  style={{
                    height: "25px",
                    width: "100px",
                    fontSize: "12px",
                  }}
                >
                  Purchase
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
      <Modal
        show={showFormModal}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        onHide={() => {
          setShowFormModal(false);
          setErrors({});
        }}
        size="lg"
        style={{
          padding: "20px",
          borderRadius: "15px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            {isCallBooked ? "Thank You!" : "Book a Call"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3">
          {isCallBooked ? (
            <div style={{ textAlign: "center" }}>
              <p>
                Thank you for your interest. Our team will contact you soon.
              </p>
            </div>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formFullName">
                <Form.Label>Full Name*</Form.Label>
                <Form.Control
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Full Name"
                  isInvalid={!!errors.fullName}
                  style={{
                    borderRadius: "8px",
                    padding: "10px",
                    border: "1px solid #ddd",
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.fullName}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>Email*</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@yourmail.com"
                  isInvalid={!!errors.email}
                  style={{
                    borderRadius: "8px",
                    padding: "10px",
                    border: "1px solid #ddd",
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formPhone">
                <Form.Label>Phone*</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+885 1254 5211 552"
                  isInvalid={!!errors.phone}
                  style={{
                    borderRadius: "8px",
                    padding: "10px",
                    border: "1px solid #ddd",
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.phone}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formMessage">
                <Form.Label>Message*</Form.Label>
                <Form.Control
                  as="textarea"
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Type your message here"
                  isInvalid={!!errors.message}
                  style={{
                    borderRadius: "8px",
                    padding: "10px",
                    border: "1px solid #ddd",
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.message}
                </Form.Control.Feedback>
              </Form.Group>
              <div className="d-flex justify-content-center">
                <Button
                  type="submit"
                  variant="warning"
                  className="p-2"
                  style={{
                    borderRadius: "8px",
                    padding: "10px 20px",
                    fontSize: "16px",
                    backgroundColor: "#2C7BE5",
                    border: "none",
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  Send Message
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default PlanAlert;

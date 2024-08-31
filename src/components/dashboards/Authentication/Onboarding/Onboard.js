/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { Card, Form, Nav, ProgressBar } from "react-bootstrap";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useForm } from "react-hook-form";
import Billing from "./Screens/Billing";
import Modules from "./Screens/Modules/Modules";
import Success from "./Screens/Success";
import IconButton from "components/common/IconButton";
import WizardModal from "./WizardModal";
import Flex from "components/common/Flex";
import RoleTabs from "./Screens/RoleManagement/RoleTabs";

const Onboard = ({ variant, validation, progressBar }) => {
  const [user, setUser] = useState({});
  const [step, setStep] = useState(1);

  const { handleSubmit, reset, clearErrors } = useForm();

  const [modal, setModal] = useState(false);

  const navItems = [
    {
      icon: "dollar-sign",
      label: "Billing",
    },
    {
      icon: "star",
      label: "Features",
    },
    {
      icon: "user",
      label: "Role Management",
    },
    {
      icon: "thumbs-up",
      label: "Done",
    },
  ];

  const onSubmitData = (data) => {
    setUser({ ...user, ...data });
    setStep(step + 1);
  };
  const onError = () => {
    if (!validation) {
      clearErrors();
      setStep(step + 1);
    }
  };

  const toggle = () => setModal(!modal);

  const handleNavs = (targetStep) => {
    if (step !== 4) {
      if (targetStep < step) {
        setStep(targetStep);
      } else {
        handleSubmit(onSubmitData, onError)();
      }
    } else {
      toggle();
    }
  };
  return (
    <>
      <WizardModal modal={modal} setModal={setModal} />
      <Card
        as={Form}
        noValidate
        onSubmit={handleSubmit(onSubmitData, onError)}
        className="theme-wizard mb-5"
        style={{ width: "100%", maxWidth: "100%" }}
      >
        <Card.Header
          className={classNames("bg-light", {
            " py-3": variant === "pills",
            "pb-2": !variant,
          })}
        >
          <Nav className="justify-content-center" variant={variant}>
            {variant === "pills"
              ? navItems.map((item, index) => (
                  <NavItemPill
                    key={item.label}
                    index={index + 1}
                    step={step}
                    handleNavs={handleNavs}
                    icon={item.icon}
                    label={item.label}
                  />
                ))
              : navItems.map((item, index) => (
                  <NavItem
                    key={item.label}
                    index={index + 1}
                    step={step}
                    handleNavs={handleNavs}
                    icon={item.icon}
                    label={item.label}
                  />
                ))}
          </Nav>
        </Card.Header>
        {progressBar && <ProgressBar now={step * 25} style={{ height: 2 }} />}
        <Card.Body className="fw-normal px-md-6 py-4">
          {step === 1 && <Billing />}
          {step === 2 && <Modules />}
          {step === 3 && <RoleTabs />}
          {step === 4 && <Success reset={reset} />}
        </Card.Body>
        <Card.Footer
          className={classNames("px-md-6 bg-light", {
            "d-none": step === 4,
            " d-flex": step < 4,
          })}
        >
          <IconButton
            variant="link"
            icon="chevron-left"
            iconAlign="left"
            transform="down-1 shrink-4"
            className={classNames("px-0 fw-semi-bold", {
              "d-none": step === 1,
            })}
            onClick={() => {
              setStep(step - 1);
            }}
          >
            Prev
          </IconButton>

          <IconButton
            variant="primary"
            className="ms-auto px-5"
            type="submit"
            icon="chevron-right"
            iconAlign="right"
            transform="down-1 shrink-4"
          >
            Next
          </IconButton>
        </Card.Footer>
      </Card>
    </>
  );
};

const NavItem = ({ index, step, handleNavs, icon, label }) => {
  return (
    <Nav.Item>
      <Nav.Link
        className={classNames("fw-semi-bold", {
          done: index < step,
          active: step === index,
        })}
        onClick={() => handleNavs(index)}
      >
        <span className="nav-item-circle-parent">
          <span className="nav-item-circle">
            <FontAwesomeIcon icon={icon} />
          </span>
        </span>
        <span className="d-none d-md-block mt-1 fs--1">{label}</span>
      </Nav.Link>
    </Nav.Item>
  );
};

const NavItemPill = ({ index, step, handleNavs, icon, label }) => {
  return (
    <Nav.Item>
      <Nav.Link
        className={classNames("fw-semi-bold", {
          done: index < step,
          // done: step > index,
          active: step === index,
        })}
        onClick={() => handleNavs(index)}
      >
        <Flex alignItems="center" justifyContent="center">
          <FontAwesomeIcon icon={icon} />
          <span className="d-none d-md-block mt-1 fs--1 ms-2">{label}</span>
        </Flex>
      </Nav.Link>
    </Nav.Item>
  );
};

export default Onboard;

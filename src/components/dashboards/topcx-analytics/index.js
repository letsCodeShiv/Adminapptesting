import React from "react";
import { Col, Row } from "react-bootstrap";
import "./main.css";
import EcomStat from "../e-commerce/EcomStat";
import { saleItems } from "data/dashboard/ecom";
import StatisticsCard from "../saas/stats-cards/StatisticsCard";
import { statsData } from "data/dashboard/saas";
import { Card } from "react-bootstrap";
import Background from "components/common/Background";
import classNames from "classnames";

// export const Tickets = [
//   {
//     title: 'Open Tickets',
//     value: 58.39,
//     decimal: true,
//     suffix: 'k',
//     prefix: '',
//     valueClassName: 'text-info',
//     badgeBg: 'warning',
//     link: '/e-commerce/customers',
//     linkText: 'See all',
//     image: bg2
//   },
//   {
//     title: 'Closed Tickets',
//     value: 23.43,
//     decimal: true,
//     suffix: 'k',
//     prefix: '',
//     valueClassName: 'text-info',
//     badgeBg: 'info',
//     link: '/e-commerce/orders/order-list',
//     linkText: 'All orders',
//     image: bg3
//   },
//   {
//     title: 'Unassigned Tickets',
//     value: 43594,
//     decimal: false,
//     suffix: '',
//     prefix: '$',
//     valueClassName: 'text-info',
//     badgeBg: 'success',
//     link: '/',
//     linkText: 'Statistics',
//     image: bg2
//   },
//   {
//     title: 'Reopen Tickets',
//     value: 23.43,
//     decimal: true,
//     suffix: 'k',
//     prefix: '',
//     valueClassName: 'text-info',
//     badgeBg: 'info',
//     link: '/e-commerce/orders/order-list',
//     linkText: 'All orders',
//     image: bg3
//   },
//   {
//     title: 'Tickets per agents',
//     value: 23.43,
//     decimal: true,
//     suffix: 'k',
//     prefix: '',
//     valueClassName: 'text-info',
//     badgeBg: 'info',
//     link: '/e-commerce/orders/order-list',
//     linkText: 'All orders',
//     image: bg2
//   },
//   {
//     title: 'Max capacity',
//     value: 23.43,
//     decimal: true,
//     suffix: 'k',
//     prefix: '',
//     valueClassName: 'text-info',
//     badgeBg: 'info',
//     link: '/e-commerce/orders/order-list',
//     linkText: 'All orders',
//     image: bg3
//   }
// ];

const NavbarButton = ({ ...props }) => {
  const handleClick = (e) => {
    const target = e.target;
    target.classList.add("navbar-link--active");
    props.setOffsets(target.offsetLeft, target.offsetWidth);
  };
  return (
    <button
      type="button"
      className={props.btnClass}
      data-scroll-to={props.btnName}
      onClick={(e) => {
        if (!props.btnClass.includes("navbar-link--active")) {
          props.setActive(props.btnName);
          handleClick(e);
        }
      }}
    >
      {props.btnName}
    </button>
  );
};
const AnalyticsDash = () => {
  const NAV_LINKS = ["KPIs", "Tickets", "Agents", "Feedback"];
  const [offLeft, setOffLeft] = React.useState(4);
  const [offWidth, setOffWidth] = React.useState(79);
  const [activeLink, setActiveLink] = React.useState("KPIs");
  const [theme, setTheme] = React.useState("dark");
  const navbarRef = React.useRef(null);
  console.log(activeLink, "---------------select-------------------");
  const handleSetOffsets = (left, width) => {
    setOffLeft(left);
    setOffWidth(width);
  };

  const handleSetTheme = (e) => {
    e.target.textContent = theme;
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const setNavX = (navbar) => {
    if (!navbar) return "87%";
    if (navbar.classList.contains("nav-x-init")) {
      navbar.classList.remove("nav-x-init");
      navbar.classList.add("nav-x-post");
    }
    return `${
      100 -
      Math.round(
        (Math.round(offLeft + Math.round(offWidth / 2) + 4) /
          navbar.offsetWidth) *
          100
      )
    }%`;
  };
  return (
    <>
      <div id="body" className={theme}>
        <header className="header">
          <div
            className="navbar nav-x-init"
            ref={navbarRef}
            style={{ ["--x"]: setNavX(navbarRef.current) }}
          >
            <div className="navbar-curr--stroke" aria-hidden="true"></div>
            <div className="navbar-root">
              {NAV_LINKS.map((link) => (
                <NavbarButton
                  key={link}
                  btnName={link}
                  btnClass={
                    activeLink === link
                      ? "navbar-link navbar-link--active"
                      : "navbar-link"
                  }
                  setActive={setActiveLink}
                  setOffsets={handleSetOffsets}
                />
              ))}
              <div
                className="navbar-curr--pill"
                aria-hidden="true"
                style={{ left: `${offLeft}px`, width: `${offWidth}px` }}
              ></div>
              <div
                className="navbar-curr--glow"
                aria-hidden="true"
                style={{
                  left: `${offLeft + Math.round(offWidth / 2) - 20.25}px`,
                }}
              ></div>
            </div>
          </div>
        </header>
      </div>
      {activeLink === "KPIs" && (
        <>
          <div>hello KPIs</div>
          <Row className="g-3 mb-3">
            {statsData.slice(0, 6).map((stat) => (
              <Col key={stat.title} sm={4}>
                <StatisticsCard stat={stat} style={{ minWidth: "12rem" }} />
              </Col>
            ))}
          </Row>
        </>
      )}
      {activeLink === "Tickets" && (
        <>
          {/* {Tickets?.map(data => (
            <>
            <Card className={classNames(className, 'overflow-hidden')} {...rest}>
            <Background image={image} className="bg-card" />
            <Card.Body className="position-relative">
              <h6>{title}</h6>
              <div
                className={classNames(
                  valueClassName,
                  'display-4 fs-3 mb-2 fw-normal font-sans-serif mt-3'
                )}
              >
                <CountUp
                  start={0}
                  end={value}
                  duration={2.75}
                  suffix={suffix}
                  prefix={prefix}
                  separator=","
                  decimals={decimal ? 2 : 0}
                  decimal="."
                />
              </div>
            </Card.Body>
          </Card>
            </>
          ))} */}
          <div>hello Tickets</div>
        </>
      )}
      {activeLink === "Agents" && <div>hello Agents</div>}
      {activeLink === "Feedback" && <div>hello Feedback</div>}
    </>
  );
};
export default AnalyticsDash;

import React, { useContext, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Navbar, Nav, Button } from "react-bootstrap";
import classNames from "classnames";
import AppContext from "context/Context";
import { navbarBreakPoint, topNavbarBreakpoint } from "config";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const NavbarTop = () => {
  const {
    config: { showBurgerMenu, navbarPosition, navbarCollapsed },
    setConfig,
  } = useContext(AppContext);

  const { pathname } = useLocation();
  const isChat = pathname.includes("chat");

  const [showDropShadow, setShowDropShadow] = useState(false);

  const handleBurgerMenu = () => {
    (navbarPosition === "top" || navbarPosition === "double-top") &&
      setConfig("navbarCollapsed", !navbarCollapsed);
    (navbarPosition === "vertical" || navbarPosition === "combo") &&
      setConfig("showBurgerMenu", !showBurgerMenu);
  };

  const setDropShadow = () => {
    const el = document.documentElement;
    if (el.scrollTop > 0) {
      setShowDropShadow(true);
    } else {
      setShowDropShadow(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", setDropShadow);
    return () => window.removeEventListener("scroll", setDropShadow);
  }, []);

  const burgerMenuRef = useRef();

  return (
    <div style={{marginTop:"20px"}}></div>
    // <Navbar
    //   className={classNames("navbar-glass fs--1 navbar-top sticky-kit", {
    //     // 'navbar-glass-shadow': showDropShadow
    //     "navbar-glass-shadow": showDropShadow && !isChat,
    //   })}
    //   expand={
    //     navbarPosition === "top" ||
    //     navbarPosition === "combo" ||
    //     navbarPosition === "double-top"
    //       ? topNavbarBreakpoint
    //       : true
    //   }
    // >
    //   <NavbarTopElements
    //     navbarCollapsed={navbarCollapsed}
    //     navbarPosition={navbarPosition}
    //     handleBurgerMenu={handleBurgerMenu}
    //     burgerMenuRef={burgerMenuRef}
    //   />
    //   <div className="d-flex my-auto ms-4 w-100">
    //     <FontAwesomeIcon
    //       icon="exclamation-triangle"
    //       className="fs-2  my-auto "
    //     />
    //     <p
    //       className="ms-1  my-auto"
    //       style={{
    //         fontSize: "15px",
    //       }}
    //     >
    //       Purchase Full Plan
    //     </p>
    //   </div>
    // </Navbar>
  );
};

const NavbarTopElements = ({ navbarPosition, handleBurgerMenu }) => {
  const burgerMenuRef = useRef();

  return (
    <>
      {/* <Navbar.Toggle
        ref={burgerMenuRef}
        className={classNames("toggle-icon-wrapper me-md-3 me-2", {
          "d-lg-none":
            navbarPosition === "top" || navbarPosition === "double-top",
          [`d-${navbarBreakPoint}-none`]:
            navbarPosition === "vertical" || navbarPosition === "combo",
        })}
        as="div"
      >
        <button
          className="navbar-toggler-humburger-icon btn btn-link d-flex flex-center"
          onClick={handleBurgerMenu}
          id="burgerMenu"
        >
          <span className="navbar-toggle-icon">
            <span className="toggle-line" />
          </span>
        </button>
      </Navbar.Toggle> */}
    </>
  );
};

NavbarTopElements.propTypes = {
  navbarPosition: PropTypes.string,
  handleBurgerMenu: PropTypes.func,
  navbarCollapsed: PropTypes.bool,
};
export default NavbarTop;

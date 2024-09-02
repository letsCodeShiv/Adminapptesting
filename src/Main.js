import React, { useReducer, useEffect } from "react";
import PropTypes from "prop-types";
import AppContext from "context/Context";
import { settings } from "./config";
import { getColor, getItemFromStore } from "helpers/utils";
import { configReducer } from "./reducers/configReducer";
import useToggleStyle from "./hooks/useToggleStyle";
import queryString from "query-string";

import { Chart as ChartJS, registerables } from "chart.js";
ChartJS.register(...registerables);

const Main = (props) => {
  const configState = {
    isFluid: getItemFromStore("isFluid", settings.isFluid),
    isRTL: getItemFromStore("isRTL", settings.isRTL),
    isDark: getItemFromStore("isDark", settings.isDark),
    navbarPosition: getItemFromStore("navbarPosition", settings.navbarPosition),
    disabledNavbarPosition: [],
    isNavbarVerticalCollapsed: getItemFromStore(
      "isNavbarVerticalCollapsed",
      settings.isNavbarVerticalCollapsed
    ),
    navbarStyle: getItemFromStore("navbarStyle", settings.navbarStyle),
    currency: settings.currency,
    showBurgerMenu: settings.showBurgerMenu,
    showSettingPanel: false,
    navbarCollapsed: false,
    orgId: null,
    orgName: null,
    agentId: null,
  };

  const [config, configDispatch] = useReducer(configReducer, configState);

  const { isLoaded } = useToggleStyle(
    config.isRTL,
    config.isDark,
    configDispatch
  );

  useEffect(() => {
    // Extract orgId, orgName and agentId from the URL
    const { orgId, orgName, agentId } = queryString.parse(window.location.search);
    if (orgId) {
      setConfig("orgId", orgId);
    }
    if (orgName) {
      setConfig("orgName", orgName);
    }
    if (agentId) {
      setConfig("agentId", agentId);
    }
  }, []);

  const setConfig = (key, value) => {
    configDispatch({
      type: "SET_CONFIG",
      payload: {
        key,
        value,
        setInStore: [
          "isFluid",
          "isRTL",
          "isDark",
          "navbarPosition",
          "isNavbarVerticalCollapsed",
          "navbarStyle",
          "orgId",
          "orgName",
          "agentId",
        ].includes(key),
      },
    });
  };

  if (!isLoaded) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: config.isDark ? getColor("dark") : getColor("light"),
        }}
      />
    );
  }

  return (
    <AppContext.Provider value={{ config, setConfig, configDispatch }}>
      {props.children}
    </AppContext.Provider>
  );
};

Main.propTypes = { children: PropTypes.node };

export default Main;

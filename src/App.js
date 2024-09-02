import React, { useContext, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Slide, toast, ToastContainer } from "react-toastify";
import is from "is_js";
import AppContext from "context/Context";
import FalconRoutes from "routes";
import { CloseButton } from "components/common/Toast";
// import SettingsToggle from "components/settings-panel/SettingsToggle";
import SettingsPanel from "components/settings-panel/SettingsPanel";
import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.min.css";
import "primereact/resources/themes/saga-blue/theme.css"; //theme
import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //icons

import { PaymentProvider } from "context/PaymentContext";
import { DateRangeProvider } from "context/DatePickerContext";
import { ClickedValueProvider } from "context/tableAgentContext";

const App = () => {
  const HTMLClassList = document.getElementsByTagName("html")[0].classList;
  const {
    config: { navbarPosition, orgName, agentId },
  } = useContext(AppContext);

  useEffect(() => {
    if (is.windows()) {
      HTMLClassList.add("windows");
    }
    if (is.chrome()) {
      HTMLClassList.add("chrome");
    }
    if (is.firefox()) {
      HTMLClassList.add("firefox");
    }
    if (is.safari()) {
      HTMLClassList.add("safari");
    }
  }, [HTMLClassList]);

  useEffect(() => {
    if (navbarPosition === "double-top") {
      HTMLClassList.add("double-top-nav-layout");
    }
    return () => HTMLClassList.remove("double-top-nav-layout");
  }, [navbarPosition]);

  useEffect(() => {
    console.log("Org Name:", orgName);
    console.log("Agent ID:", agentId);
    // You can now use orgName and agentId throughout your app
  }, [orgName, agentId]);

  return (
    <Router>
      <DateRangeProvider>
        <ClickedValueProvider>
          <PaymentProvider>
            <FalconRoutes />
            <SettingsPanel />
            <ToastContainer
              closeButton={CloseButton}
              icon={false}
              position={toast.POSITION.TOP_RIGHT}
              theme="light"
              transition={Slide}
            />
          </PaymentProvider>
        </ClickedValueProvider>
      </DateRangeProvider>
    </Router>
  );
};

export default App;

import React, { createContext, useState } from "react";
import axios from "axios";
import { ApiConfig } from "config/ApiConfig";
import { toast } from "react-toastify";

const PaymentContext = createContext();

const PaymentProvider = ({ children }) => {
  const [showModalTrail, setShowModalTrail] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isCallBooked, setIsCallBooked] = useState(false);
  const [showModalNoPayment, setShowModalNoPayment] = useState(false);
  const [orgStatus, setOrgStatus] = useState("");
  const [isLoadingTrail, setIsLoadingTrail] = useState(false);
  const [status, setStatus] = useState(false);
  const [orgPlanDetail, setOrgPlanDetail] = useState({});
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [downgradeGracePeriod, setDowngradeGracePeriod] = useState(-1)

  const [backdrop, setBackdrop] = useState(false);
  const [theme] = useState("light");

  const fetchOrgStatus = async (act) => {
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };
    const apiData = {
      act: act,
    };
    try {
      setIsLoadingTrail(true);
      const response = await axios.post(ApiConfig.orgStatus, apiData, config);

      setOrgStatus(response.data);
      setShowModalNoPayment(false);

      if (response?.data?.org_status === "canceled") {
        setShowModalNoPayment(true);
      }
      setShowModalTrail(false);
    } catch (error) {
      if (error.response && error.response.status >= 500) {
        toast.error("Something went wrong. Please try again later.");
      } else {
        toast.error(error.response?.data?.detail?.masked_error);
      }
    } finally {
      setIsLoadingTrail(false);
    }
  };

  const fetchPaymentStatus = async () => {
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };
    setIsLoadingStatus(true);
    try {
      const response = await axios.get(ApiConfig.paymentStatus, config);
      setStatus(response?.data?.status);
      setOrgPlanDetail(response?.data);
      setDowngradeGracePeriod(response?.data?.grace_period)
    } catch (error) {
      if (error.response && error.response.status >= 500) {
        toast.error("Something went wrong. Please try again later.");
      } else {
        toast.error(error.response?.data?.detail?.masked_error);
      }
    } finally {
      setIsLoadingStatus(false);
    }
  };

  // const openStripePayment = () => {
  //   if (!sessionStorage.getItem("subdomain")) {
  //     toast.error("No Subdomain");
  //     return;
  //   }
  //   console.log(sessionStorage.getItem("email"));
  //   console.log(sessionStorage.getItem("subdomain"));

  //   setBackdrop(true);
  //   const popupWindow = window.open(
  //     "",
  //     "_blank",
  //     "width=1200,height=900,resizable=yes,scrollbars=yes,status=yes"
  //   );
  //   if (popupWindow) {
  //     popupWindow.document.open();
  //     popupWindow.document.write(`
  //       <html>
  //         <head>
  //           <title>Stripe Pricing Table</title>
  //           <style>
  //             body { margin: 0; }
  //             .${theme} { background-color: ${
  //       theme === "light" ? "#fff" : "#333"
  //     }; color: ${theme === "light" ? "#000" : "#fff"}; }
  //           </style>
  //               <script async src="
  //   https://js.stripe.com/v3/pricing-table.js"
  //   ></script>
  //         </head>
  //         <body>
  //           <div id="body" class="${theme}">
  //           ${ApiConfig.pricingTable}

  //           </div>
  //         </body>
  //       </html>
  //     `);
  //     popupWindow.document.close();
  //     const checkPopupClosed = setInterval(() => {
  //       if (popupWindow.closed) {
  //         clearInterval(checkPopupClosed);
  //         setBackdrop(false);
  //         fetchOrgStatus("fetch");
  //         setTimeout(async () => {
  //           fetchPaymentStatus();
  //         }, 10000);
  //       }
  //     }, 1000);
  //   } else {
  //     toast.error("Popup blocked. Please allow popups for this site.");
  //     setBackdrop(false);
  //   }
  // };

  const openStripePayment = async () => {
    try {
      setBackdrop(true);
      const config = {
        headers: { "Access-Control-Allow-Origin": "*" },
        withCredentials: true,
      };
      const response = await axios.get(ApiConfig.pricingTable, config);
      const pricingTableElement = response.data;

      const popupWindow = window.open(
        "",
        "_blank",
        "width=1200,height=900,resizable=yes,scrollbars=yes,status=yes"
      );

      if (popupWindow) {
        popupWindow.document.open();
        popupWindow.document.write(`
        <html>
          <head>
            <title>Stripe Pricing Table</title>
            <style>
              body { margin: 0; }
              .${theme} { background-color: ${
          theme === "light" ? "#fff" : "#333"
        }; color: ${theme === "light" ? "#000" : "#fff"}; }
            </style>
            <script async src="https://js.stripe.com/v3/pricing-table.js"></script>
          </head>
          <body>
            <div id="body" class="${theme}">
              ${pricingTableElement}
            </div>
          </body>
        </html>
      `);
        popupWindow.document.close();

        const checkPopupClosed = setInterval(() => {
          if (popupWindow.closed) {
            clearInterval(checkPopupClosed);
            // setBackdrop(false);
            setTimeout(async () => {
              fetchOrgStatus("fetch");
              fetchPaymentStatus();
            }, 10000);
          }
        }, 1000);
      } else {
        toast.error("Popup blocked. Please allow popups for this site.");
        // setBackdrop(false);
      }
    } catch (error) {
      toast.error("Failed to fetch pricing table. Please try again later.");
      // setBackdrop(false);
    } finally {
      setBackdrop(false);
    }
  };

  const stripePayment = (url) => {
    setBackdrop(true);
    const popup = window.open(
      url,
      "popup",
      "width=1200,height=900,resizable=yes,scrollbars=yes,status=yes"
    );

    if (!popup) {
      toast.error("Popup was blocked. Please allow popups for this website.");
      setBackdrop(false);
      return;
    }
    const interval = setInterval(() => {
      if (popup.closed) {
        clearInterval(interval);
        setBackdrop(false);
        fetchOrgStatus("fetch");
        setTimeout(async () => {
          fetchPaymentStatus();
        }, 10000);
      }
    }, 1000);
  };
  const UpdatePaymentStatus = async () => {
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };
    try {
      setIsLoadingUpdate(true);
      const response = await axios.get(ApiConfig.paymentUpdate, config);
      setBackdrop(true);
      const updatePlanWindow = window.open(
        response.data.billing_portal_url,
        "StripeCustomerPortalWindow",
        "width=1200,height=900,resizable=yes,scrollbars=yes,status=yes"
      );

      if (!updatePlanWindow) {
        toast.error("Popup was blocked. Please allow popups for this website.");
        setBackdrop(false);
        return;
      }
      const interval = setInterval(() => {
        if (updatePlanWindow.closed) {
          clearInterval(interval);
          setBackdrop(false);
          fetchOrgStatus("fetch");
          setTimeout(async () => {
            fetchPaymentStatus();
          }, 10000);
        }
      }, 1000);
    } catch (error) {
      if (error.response && error.response.status >= 500) {
        toast.error("Something went wrong. Please try again later.");
      } else {
        toast.error(error.response?.data?.detail?.masked_error);
      }
    } finally {
      setIsLoadingUpdate(false);
    }
  };

  return (
    <PaymentContext.Provider
      value={{
        fetchOrgStatus,
        openStripePayment,
        stripePayment,
        fetchPaymentStatus,
        UpdatePaymentStatus,
        showModalTrail,
        setShowModalTrail,
        showModalNoPayment,
        orgStatus,
        status,
        orgPlanDetail,
        backdrop,
        setBackdrop,
        isLoadingStatus,
        isLoadingUpdate,
        isLoadingTrail,
        showFormModal,
        setShowFormModal,
        isCallBooked,
        setIsCallBooked,
        downgradeGracePeriod,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export { PaymentContext, PaymentProvider };

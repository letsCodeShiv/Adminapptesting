import React, { useState, useEffect } from "react";
import axios from "axios";
import { ApiConfig } from "config/ApiConfig";
import { useZafClient } from "utils/zafClient";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form, Row } from "react-bootstrap";
import ReactMarkdown from "react-markdown";
import { toast } from "react-toastify";
import Section from "components/common/Section";
import Loader from "components/Loader/Loader";

const Login = () => {
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);
  const [tncModalShow, setTNCModalShow] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [redirectURI, setRedirectURI] = useState("");
  const [oauthResponse, setOauthResponse] = useState(null);

  const navigate = useNavigate();
  const client = useZafClient();

  const dataPolicyContent = `

1. **INTRODUCTION**
    1. These Terms and Conditions ("**Terms**") govern the use of the Pytron Inc. ("**Pytron**", “**We**”, “**Our**”, “**Us**”) owned AI-based software application, **TopCx.ai** (“**App**”) by the client including its authorized employees and contractors ("**Client**”, “**You**”, “**Your**”).
    2. By accessing or using the App, You agree to be bound by these Terms. If You do not agree to these Terms, You may not access or use the App.
    3. These Terms shall be effective upon Your registration on Our App and acceptance of the Terms hereof. Continued usage of Our App will be considered to be Your deemed and continued acceptance of these Terms.
    4. The aim of these Terms is to provide clear guidelines for using the App. By utilising Our service(s), You acknowledge that You have reviewed, comprehended, and consented to be bound by these Terms. If You disagree with these Terms, then You must cease further usage of this App.
2. **SCOPE OF SERVICES**
    1. The App is designed to enhance efficiency and effectiveness of the client’s support agents.
    2. The App uses AI technology to give suggestions and advice to the customer support agents, helping them work more efficiently on customer inquiries and problems.
    3. The App may also provide Client with the data and insights to assess their agents' performance using various key performance indicators (KPIs). This may be done by the facilitation of reports highlighting the efficiency and effectiveness of the agents, aiding in performance evaluation and enhancement strategies.
3. **CLIENT REGISTRATION AND ACCOUNT**
    1. In order to access and use the App, the Client must register and create an account.
    2. The Client agrees to provide accurate and complete information during the registration process and to keep its account credentials secure. The Client shall remain responsible for all activities that occur through its account.
    3. The account is non-transferable without Pytron's explicit consent.
4. **DATA COLLECTION AND USAGE**
    1. Data Ingestion: Upon registration, the Client grants Pytron access to its historical tickets for the purpose of improving customer support operations of the Client.
    2. Data Retention: The Client acknowledges that ticket-related data provided by it may be retained for the purpose of enhancing the suggestions and possible resolutions provided to client’s support agents
    3. Data Destruction: Pytron assures the Client that the data will be destroyed upon ingestion, with the exception of data necessary for the creation of the knowledge base.
    4. Please refer to the App’s Data Protection Agreement in order to know more about Our data collection and usage-related practices.
5. **PERSONAL INFORMATION AND SENSITIVE PERSONAL INFORMATION**

Pytron is committed to safeguarding the Personal Information and Sensitive Personal Information of its Clients. Please refer to the App’s Privacy Policy for more information.

6. **YOUR OBLIGATIONS**
    1.1 By using Our App, You agree that-
        1. You have the option to provide Your end-customer’s ticket-related data along ("**Input**") to Our App and receive an AI-generated response ("**Output**") in return.
        2. You are either a legal entity or an individual who is at least eighteen (18) years old and capable of entering into legally binding agreements.
        3. You bear full responsibility for safeguarding and maintaining the confidentiality of Your username and password.
        4. By using the App with Your login credentials, You authorize Our App to assume that the user is either You or has Your permission to access the account.
        5. If You suspect any unauthorized activity on Your account, You agree to promptly notify Us.
        6. Any third-party software, services, or products You utilize alongside Our App are governed by their own terms, and We bear no responsibility for third-party services or products.
        7. You shall use the services of Our App only for lawful purposes and You agree to abide by all relevant laws and regulations while interacting with Our App.
        8. You shall provide accurate and genuine information whenever requested. We may have to authenticate the information and details provided by You at any time. If, upon verification, We find that the information provided by You is partly or wholly false, We reserve the right to prohibit You from using Our App and/or other affiliated websites without any prior notice.
        9. You shall allow Us to contact You for any transactional purposes related to Your availing of services on Our App.
        10. You acknowledge that You are accessing and utilizing the services provided by this App on Your own accord and responsibility. Before conducting any activity on Our App including availing Our services, You are using Your own discretion and making informed decisions.
        11. You acknowledge that You are not located within any embargoed countries and are not barred from using Our App by any of the governmental bodies.
    1.2 Further, You agree not-
        1. to spread any material that is illegal, harassing, defamatory, abusive, threatening, harmful, indecent, obscene, or otherwise offensive regarding Our App in any manner;
        2. to interfere with anyone’s use of Our App; and
        3. to breach any of the applicable law(s) whilst using Our App.
7. **APP ACCESS AND USAGE**
    1. You may access and use the App solely for Your internal business purposes related to customer support operations.
    2. You agree not to use the App for any unlawful or prohibited purpose, or in any manner that could damage, disable, overburden, or impair the App.
8. **OUTPUT**
    1. You bear responsibility for the Output You generate.
    2. Given the nature of machine learning, the Output may lack uniqueness across users, potentially yielding identical or similar responses. Responses generated for other users are not considered part of Your own Output.
    3. Any feedback, historical tickets and Input You provide may contribute to enhancing Our App. If You prefer Your feedback not to be used for this purpose, You can opt-out by contacting Us. Please note that this may occasionally limit Our App's ability to effectively address Your specific needs.
    4. Artificial intelligence and machine learning are rapidly advancing areas of study. We continuously endeavour to enhance Our App for accuracy, reliability, safety, and utility. Given the probabilistic nature of machine learning, there may be instances where using Our App may not produce the desired results and it is advisable that You evaluate the accuracy of the Output based on Your intended use, which may involve human review.
9. **INTELLECTUAL PROPERTY RIGHTS**

The App, including all associated intellectual property rights, is and shall remain the exclusive property of Pytron. We grant the Client a limited, non-exclusive, non-transferable license to access and use the App in accordance with these Terms.

10. **SEVERABILITY**

If any provision of these Terms becomes invalid or unenforceable, either in whole or in part, it will not affect the validity or enforceability of any other provision(s) in these Terms.

11. **DISCLAIMER**

Client acknowledges that the collection of data by Pytron is intended to improve customer support operations. Data collected is not shared with third parties without explicit consent, except as required by law or when the same is necessary for Us to meet Our obligations towards You.

12. **LIMITATION OF LIABILITY**

In no event shall Pytron be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, arising out of or in connection with the use of the App.

13. **INDEMNITY**
    1. You agree to defend and protect Us, and Our employees, directors, officers, agents, successors and assigns from any and all claims, liabilities, damages, losses, costs and expenses, including attorney's fees, resulting from Your actions or inactions that cause any harm, loss or liability to Us or any third party.
    2. This includes claims related to breaches of warranties, representations or undertakings, non-fulfilment of obligations under these Terms, violation of applicable laws or regulations, including intellectual property rights, payment of statutory dues and taxes, libel, defamation, violation of rights of privacy or publicity, and infringement of intellectual property or other rights.
    3. This clause will remain valid even after the termination or expiration of these Terms.
14. **GOVERNING LAW AND DISPUTE RESOLUTION**

These Terms shall be governed by and construed in accordance with the laws of the State of California, USA

15. **TERMINATION**
    1. You may terminate these Terms by deleting Your Account or by providing Us with 30 (Thirty) days’ prior written notice.
    2. We retain the right to terminate these Terms immediately if You breach any of the provisions outlined herein.
16. **MODIFICATION OF TERMS**

We reserve the right to modify or update these Terms at any time without prior notice. Clients are encouraged to review these Terms periodically for any changes.

17. **SEVERABILITY**

In case any provision of these Terms is deemed illegal, unenforceable, or invalid in the relevant jurisdiction, either through a legislative Act or a court order, it will not affect the enforceability or validity of any other provision(s) of these Terms.

18. **GENERAL**
    1. Unless otherwise provided in writing in any of the documents executed between You and Pytron, You agree that these Terms constitute the final and complete terms between You and Pytron concerning Your use of Our App. They override and govern any prior proposals, terms of use, or other communications. We reserve the right to modify these Terms at any time, at Our sole discretion, by posting the changes here.
    2. Nothing in these Terms establishes an agency, partnership, or joint venture between Us. Our non-enforcement of any provision of these Terms of Use does not affect Our right to require such performance at any time thereafter.
    3. If You have any questions about these Terms of Use, please contact Us at <contact@pytron.ai>

These Terms were last updated on 15th May 2024

`;

  useEffect(() => {
    const fetchData = async () => {
      if (client === null) return;
      try {
        setIsLoadingLogin(true);

        const contextData = await client?.context?.();
        const userData = await client?.get?.(["currentUser"]);
        const subdomain = contextData?.account?.subdomain;
        const email = userData?.currentUser?.email;
        const role = userData?.currentUser?.role;

        // Store data in sessionStorage
        sessionStorage.setItem("subdomain", subdomain);
        sessionStorage.setItem("email", email);
        sessionStorage.setItem("role", role);

        const authData = {
          subdomain: sessionStorage.getItem("subdomain"),
          email: sessionStorage.getItem("email"),
          role: sessionStorage.getItem("role"),
          source: "admin_screen",
        };
        const config = {
          headers: { "Access-Control-Allow-Origin": "*" },
          withCredentials: true,
        };

        // const response = await axios.post(ApiConfig.login, authData, config);
        // setRedirectURI(response.data.redirect_to);
        // if (response.data.oauth) {
        //   setOauthResponse(response.data.oauth);
        //   setTNCModalShow(true);
        // } else {
        //   navigate("/landingpage");
        // }
        navigate("/landingpage");
      } catch (error) {
        console.error("Login error", error);
        if (error.response && error.response.status >= 500) {
          toast.error("Something went wrong. Please try again later.");
        } else {
          toast.error(
            error.response?.data?.detail?.masked_error ||
              "Something went wrong. Please try again later."
          );
        }
      } finally {
        setIsLoadingLogin(false);
      }
    };

    fetchData();
  }, [client, navigate]);

  const handleAccept = async () => {
    setTNCModalShow(false);
    if (oauthResponse) {
      const oauthWindow = window.open(
        redirectURI,
        "OAuthLoginWindow",
        "width=500,height=500,resizable=yes,scrollbars=yes,status=yes"
      );

      if (!oauthWindow) {
        toast.error("Popup was blocked. Please allow popups for this website.");
        return;
      }

      const checkWindowClosed = setInterval(async () => {
        if (oauthWindow.closed) {
          clearInterval(checkWindowClosed);
          try {
            setIsLoadingLogin(true);
            const authData = {
              subdomain: sessionStorage.getItem("subdomain"),
              email: sessionStorage.getItem("email"),
              role: sessionStorage.getItem("role"),
              source: "admin_screen",
            };
            const config = {
              headers: { "Access-Control-Allow-Origin": "*" },
              withCredentials: true,
            };
            const response = await axios.post(
              ApiConfig.login,
              authData,
              config
            );
            if (response.data.oauth) {
              toast.error("Oauth was not successful. Please try again later.");
            } else {
              navigate("/landingpage");
            }
          } catch (error) {
            toast.error("Something went wrong.");
          } finally {
            setIsLoadingLogin(false);
          }
        }
      }, 1000);
    }
  };

  const handleDecline = () => {
    setTNCModalShow(false);
    navigate("/decline");
  };

  const handleCheckboxChange = (e) => {
    setAccepted(e.target.checked);
  };

  return (
    <>
      {isLoadingLogin ? (
        <Section fluid className="py-0">
          <Row className="g-0 min-vh-100 flex-center">
            <Loader />
          </Row>
        </Section>
      ) : (
        <div />
      )}
      <Modal
        show={tncModalShow}
        onHide={() => setTNCModalShow(false)}
        backdrop="static"
        keyboard={false}
        size="xl"
        centered
      >
        <Modal.Body>
          <Modal.Title className="text-center mb-1">
            Terms and conditions
          </Modal.Title>

          <div
            className="p-4"
            style={{ maxHeight: "calc(100vh - 250px)", overflowY: "auto" }}
          >
            <ReactMarkdown>{dataPolicyContent}</ReactMarkdown>
          </div>
          <div className="d-flex justify-content-between align-items-center mt-3">
            <Form.Check
              type="checkbox"
              label="I accept the terms and conditions"
              checked={accepted}
              onChange={handleCheckboxChange}
            />
            <div>
              <Button className="me-2" variant="danger" onClick={handleDecline}>
                Decline
              </Button>
              <Button
                className="me-2"
                variant="primary"
                onClick={handleAccept}
                disabled={!accepted}
              >
                Accept
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Login;

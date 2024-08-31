import React, { useState, useEffect } from "react";
import { ApiConfig } from "config/ApiConfig";
import axios from "axios";
import { toast } from "react-toastify";
import { Row, Col, Tab, Tabs, Card } from "react-bootstrap";
import Loader from "components/Loader/Loader";
import TopX from "./Elements/TopX";
import SurveyX from "./Elements/SurveyX";
import BotX from "./Elements/BotX";
import XAnalytics from "./Elements/XAnalytics";

export default function Modules() {
  const [featureData, setFeatureData] = useState([]);
  const [allGroupData, setAllGroupData] = useState([]);
  const [allowedGroupIngestionData, setAllowedGroupIngestionData] = useState(
    []
  );
  const [remainingGroupIngestionData, setRemainingGroupIngestionData] =
    useState([]);

  const [isLoadingModules, setIsLoadingModules] = useState(false);

  const [activeTab, setActiveTab] = useState("TopX");

  const handleSelect = (key) => {
    setActiveTab(key);
  };

  const updateAllowedGroups = (updatedGroups) => {
    setAllowedGroupIngestionData((prevData) => {
      return [...prevData, ...updatedGroups];
    });
  };

  const updateRemainingGroups = (updatedGroups) => {
    // setRemainingGroupIngestionData((prevData) => {
    //   return [...prevData, ...updatedGroups];
    // });
    setRemainingGroupIngestionData(updatedGroups);
  };

  const updateModulesAllowedGroups = (moduleName, groups) => {
    setFeatureData((prevData) => {
      return prevData.map((module) => {
        if (module.name === moduleName) {
          return { ...module, allowed_groups: groups };
        }
        return module;
      });
    });
  };

  const updateModuleSettings = (moduleName, updatedSettings) => {
    setFeatureData((prevData) => {
      return prevData.map((module) => {
        if (module.name === moduleName) {
          return { ...module, settings: updatedSettings };
        }
        return module;
      });
    });
  };

  const fetchUserData = async () => {
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };
    try {
      setIsLoadingModules(true);
      const response = await axios.get(ApiConfig.features, config);
      const modifiedData = response?.data?.topcx_app_modules.map((module) => ({
        ...module,
        groups: [
          ...module.allowed_groups.map((group) => ({
            ...group,
            is_checked: true,
          })),
          ...module.remaining_groups.map((group) => ({
            ...group,
            is_checked: false,
          })),
        ],
      }));
      setFeatureData(modifiedData);
      setAllGroupData(response?.data?.all_groups);
      setAllowedGroupIngestionData(response?.data?.allowed_groups_ingestion);
      setRemainingGroupIngestionData(
        response?.data?.remaining_groups_ingestion
      );
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error);
    } finally {
      setIsLoadingModules(false);
    }
  };
  useEffect(() => {
    fetchUserData();
  }, []);

  const getModuleData = (moduleName) => {
    return featureData.find((module) => module.name === moduleName) || {};
  };
  return (
    <Card className="mb-3">
      <Card.Header className="bg-light">
        <h5 className="mb-0">Modules</h5>
      </Card.Header>
      <Card.Body className="text-justify text-1000">
        {isLoadingModules ? (
          <Loader />
        ) : (
          <Row>
            <Col md={12}>
              <Tabs
                id="role-tabs"
                activeKey={activeTab}
                onSelect={handleSelect}
              >
                <Tab
                  eventKey="TopX"
                  title="TopX"
                  className="border-bottom border-x p-3"
                >
                  {activeTab === "TopX" && (
                    <TopX
                      data={getModuleData(
                        "Intelligent Resolution and Analytics"
                      )}
                      allowedGroupsIngestion={allowedGroupIngestionData}
                      remainingGroupsIngestion={remainingGroupIngestionData}
                      allGroups={allGroupData}
                      updateAllowedGroups={updateAllowedGroups}
                      updateRemainingGroups={updateRemainingGroups}
                    />
                  )}
                </Tab>
                <Tab
                  eventKey="BotX"
                  title="BotX"
                  className="border-bottom border-x p-3"
                >
                  {activeTab === "BotX" && (
                    <BotX
                      data={getModuleData(
                        "Intelligent Resolution and Analytics"
                      )}
                      allowedGroupsIngestion={allowedGroupIngestionData}
                      remainingGroupsIngestion={remainingGroupIngestionData}
                      allGroups={allGroupData}
                    />
                  )}
                </Tab>
                <Tab
                  eventKey="SurveyX"
                  title="SurveyX"
                  className="border-bottom border-x p-3"
                >
                  {activeTab === "SurveyX" && (
                    <SurveyX
                      data={getModuleData("Feedback Survey")}
                      allowedGroupsIngestion={allowedGroupIngestionData}
                      remainingGroupsIngestion={remainingGroupIngestionData}
                      allGroups={allGroupData}
                      updateModuleSettings={updateModuleSettings}
                      updateModulesAllowedGroups={updateModulesAllowedGroups}
                    />
                  )}
                </Tab>
                <Tab
                  eventKey="XAnalytics"
                  title="XAnalytics"
                  className="border-bottom border-x p-3"
                >
                  {activeTab === "XAnalytics" && (
                    <XAnalytics
                      data={getModuleData("Analytics Dashboard")}
                      allowedGroupsIngestion={allowedGroupIngestionData}
                      remainingGroupsIngestion={remainingGroupIngestionData}
                      allGroups={allGroupData}
                      updateModuleSettings={updateModuleSettings}
                    />
                  )}
                </Tab>
              </Tabs>
            </Col>
          </Row>
        )}
      </Card.Body>
    </Card>
  );
}

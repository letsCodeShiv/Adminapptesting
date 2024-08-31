import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import AdvanceTableWrapper from "components/common/advance-table/AdvanceTableWrapper";
import AdvanceTable from "components/common/advance-table/AdvanceTable";
import { ApiConfig } from "config/ApiConfig";
import axios from "axios";
import { toast } from "react-toastify";

export default function AnalyticsModal(props) {
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  // Processing the incoming settings data
  const settingsArray = Object.entries(props?.props?.settings).map(
    ([key, value]) => ({
      ...value,
      name: key,
    })
  );

  // Identifying the default feature based on the status
  const defaultFeature = settingsArray.find(
    (setting) => setting.status === true
  );

  // State for the selected feature and ratings
  const [selectedFeature, setSelectedFeature] = useState(
    defaultFeature ? defaultFeature.name : ""
  );

  // Handling feature selection
  const handleFeatureSelection = (featureName) => {
    setSelectedFeature(featureName);
  };

  // Constructing the updated settings object on submission
  const handleAddClick = async () => {
    const updatedSettings = settingsArray.reduce((acc, current) => {
      const { name, desc, value } = current;
      acc[name] = {
        desc,
        value,
        status: name === selectedFeature,
      };
      return acc;
    }, {});

    const featureAPIData = {
      settings: updatedSettings,
      feature_name: props.props.name,
    };
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };

    try {
      setIsLoadingSubmit(true);
      await axios.post(ApiConfig.featureUpdate, featureAPIData, config);
      toast.success("Settings Updated Successfully");
      props.updateParentSettings(updatedSettings, props.props.name);
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error);
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  // Columns configuration for the table
  const columns = [
    {
      accessor: "name",
      Header: "Feature",
      Cell: ({ value }) => (
        <Form.Check
          type="radio"
          label={value.toUpperCase()}
          name="featureSelect"
          onChange={() => handleFeatureSelection(value)}
          checked={selectedFeature === value}
        />
      ),
    },
    {
      accessor: "desc",
      Header: "Description",
      Cell: ({ value }) => (
        <p className="text-wrap text-break" style={{ maxWidth: "350px" }}>
          {value}
        </p>
      ),
    },
    {
      accessor: "value",
      Header: "Value",
      Cell: ({ value }) => <p>{value} min</p>,
    },
  ];

  return (
    <div>
      <AdvanceTableWrapper columns={columns} data={settingsArray} sortable>
        <AdvanceTable
          table
          headerClassName="bg-200 text-900 text-nowrap align-middle"
          rowClassName="align-middle white-space-nowrap"
          tableProps={{
            bordered: true,
            striped: true,
            className: "fs--1 mb-0 overflow-hidden",
          }}
        />
      </AdvanceTableWrapper>
      <div className="d-flex justify-content-end mt-3">
        <Button
          variant="success"
          disabled={isLoadingSubmit}
          onClick={handleAddClick}
        >
          {isLoadingSubmit ? "updating" : "update"}
        </Button>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import AdvanceTableWrapper from "../advance-table/AdvanceTableWrapper";
import AdvanceTable from "../advance-table/AdvanceTable";
import AdvanceTableFooter from "../advance-table/AdvanceTableFooter";
import usePagination from "../advance-table/usePagination";
import { ApiConfig } from "config/ApiConfig";
import axios from "axios";
import { Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
export default function XAnalytics({
  data,
  allowedGroupsIngestion,
  // remainingGroupsIngestion,
  // allGroups,
  updateModuleSettings,
}) {
  useEffect(() => {
    resetPaginationGroups();
  }, []);

  const groupsTable = [
    {
      accessor: "name",
      Header: "Group Name",
      Cell: ({ row }) => (
        <p style={{ maxWidth: "35rem" }}>{row.original.name}</p>
      ),
    },
    {
      accessor: "description",
      Header: "Description",
      Cell: ({ row }) => (
        <p className="m-0 text-wrap" style={{ maxWidth: "35rem" }}>
          {row.original.description}
        </p>
      ),
    },
  ];

  const {
    currentPageData: currentPageGroups,
    setPageSize: setPageSizeGroups,
    nextPage: nextPageGroups,
    previousPage: previousPageGroups,
    canNextPage: canNextPageGroups,
    canPreviousPage: canPreviousPageGroups,
    resetPagination: resetPaginationGroups,
    pageIndex: pageIndexGroups,
    pageSize: pageSizeGroups,
  } = usePagination(allowedGroupsIngestion);

  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  // Processing the incoming settings data
  // const settingsArray = Object.entries(data?.settings)?.map(([key, value]) => ({
  //   ...value,
  //   name: key,
  // }));

  const settingsArray =
    data && data.settings
      ? Object.entries(data.settings).map(([key, value]) => ({
          ...value,
          name: key,
        }))
      : [];

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
      feature_name: data?.name,
    };
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };

    try {
      setIsLoadingSubmit(true);
      await axios.post(ApiConfig.featureUpdate, featureAPIData, config);
      toast.success("Settings Updated Successfully");
      updateModuleSettings(data.name, updatedSettings);
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error);
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  const settingsTable = [
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
    <>
      <div className="my-2">
        <h6 className="mb-2">Description</h6>
        <p className="text-muted">{data.desc}</p>
      </div>
      <div className="my-2">
        <hr />
        <h6 className="mb-2">Groups</h6>
        <AdvanceTableWrapper
          columns={groupsTable}
          data={allowedGroupsIngestion}
          sortable
        >
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
          {allowedGroupsIngestion.length ? (
            <>
              <p
                className="text-center text-muted m-0 mt-1 fw-semibold"
                style={{ fontSize: "10px" }}
              >
                Groups are enabled by default in XAnalytics. Enable more groups
                in the TopX settings.
              </p>
              {/* <div className="mt-1"> */}
              <AdvanceTableFooter
                pageIndex={pageIndexGroups}
                pageSize={pageSizeGroups}
                nextPage={nextPageGroups}
                previousPage={previousPageGroups}
                canNextPage={canNextPageGroups}
                canPreviousPage={canPreviousPageGroups}
                page={currentPageGroups}
                rowCount={allowedGroupsIngestion?.length}
                setPageSize={setPageSizeGroups}
                rowInfo
                rowsPerPageSelection
                navButtons
              />
              {/* </div> */}
            </>
          ) : (
            <h5 className="text-muted text-center my-4">No Data Found</h5>
          )}
        </AdvanceTableWrapper>
      </div>
      <div className="my-2">
        <hr />
        <h6 className="mb-2">Settings</h6>
        <AdvanceTableWrapper
          columns={settingsTable}
          data={settingsArray}
          sortable
        >
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

        <div
          className="btn-group mx-auto d-flex justify-content-center w-25 mt-2"
          role="group"
          aria-label="Basic mixed styles example"
        >
          <Button
            variant="falcon-success"
            disabled={isLoadingSubmit}
            onClick={handleAddClick}
          >
            {isLoadingSubmit ? "Updating" : "Update"}
          </Button>
        </div>
      </div>
    </>
  );
}

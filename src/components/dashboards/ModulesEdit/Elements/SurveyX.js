import React, { useState, useEffect } from "react";
import AdvanceTableWrapper from "../advance-table/AdvanceTableWrapper";
import AdvanceTable from "../advance-table/AdvanceTable";
import AdvanceTableFooter from "../advance-table/AdvanceTableFooter";
import usePagination from "../advance-table/usePagination";
import { ApiConfig } from "config/ApiConfig";
import axios from "axios";
import { Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";

export default function SurveyX({
  data,
  allowedGroupsIngestion,
  updateModuleSettings,
  updateModulesAllowedGroups,
}) {
  useEffect(() => {
    resetPaginationGroups();
  }, []);

  const [selectedGroups, setSelectedGroups] = useState([
    ...data.allowed_groups,
  ]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

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

  const handleCheckChange = (is_checked, selectedGroup) => {
    setSelectedGroups((prevSelectedGroups) => {
      if (is_checked) {
        return [...prevSelectedGroups, selectedGroup];
      } else {
        return prevSelectedGroups.filter(
          (group) => group.id !== selectedGroup.id
        );
      }
    });
  };

  const handleUpdateGroups = async () => {
    const featureAPIData = {
      feature_name: data.name,
      allowed_groups_all: selectedGroups,
    };
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };
    try {
      setIsLoadingGroups(true);
      await axios.post(ApiConfig.featureUpdate, featureAPIData, config);
      toast.success("Groups Updated Successfully");
      updateModulesAllowedGroups(data.name, selectedGroups);
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error);
    } finally {
      resetPaginationGroups();
      setIsLoadingGroups(false);
    }
  };

  const groupsTable = [
    {
      accessor: "name",
      Header: "Group Name",
      Cell: ({ row }) => (
        <Form.Check
          type="checkbox"
          name="groupSelection"
          id={`checkbox-${row?.original?.name}`}
          className="my-auto"
          label={<p className="m-0 ms-2">{row?.original?.name}</p>}
          disabled={data?.ingestion_quota_left <= 0}
          checked={selectedGroups.some(
            (group) => group.id === row?.original?.id
          )}
          onChange={(e) => handleCheckChange(e.target.checked, row?.original)}
        />
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

  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const settingsArray =
    data && data.settings
      ? Object.entries(data.settings).map(([key, value]) => ({
          ...value,
          name: key,
        }))
      : [];

  const defaultFeature = settingsArray.find(
    (setting) => setting.status === true
  );

  const [selectedFeature, setSelectedFeature] = useState(
    defaultFeature ? defaultFeature.name : ""
  );
  const [selectedRating, setSelectedRating] = useState(
    settingsArray.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.name]: curr.rating_selected,
      }),
      {}
    )
  );

  const handleFeatureSelection = (featureName) => {
    setSelectedFeature(featureName);
  };

  const handleAddClick = async () => {
    const updatedSettings = settingsArray.reduce((acc, current) => {
      const { name, desc, rating_options } = current;
      acc[name] = {
        desc,
        rating_options,
        status: name === selectedFeature,
        rating_selected: selectedRating[name],
      };
      return acc;
    }, {});

    const featureAPIData = {
      settings: updatedSettings,
      feature_name: data.name,
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
      accessor: "rating_options",
      Header: "Rating",
      Cell: ({ row }) => (
        <Form.Select
          aria-label="Rating select"
          onChange={(e) =>
            setSelectedRating({
              ...selectedRating,
              [row.original.name]: e.target.value,
            })
          }
          value={selectedRating[row.original.name]}
        >
          {row.original.rating_options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Form.Select>
      ),
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
                Only the groups enabled in TopX can be selected in SurveyX.
              </p>

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
              <div
                className="btn-group mx-auto d-flex justify-content-center w-25 mt-2"
                role="group"
                aria-label="Basic mixed styles example"
              >
                <Button
                  variant="falcon-success"
                  disabled={isLoadingGroups}
                  onClick={handleUpdateGroups}
                >
                  {isLoadingGroups ? "Updating" : "Update"}
                </Button>
              </div>
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

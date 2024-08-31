import React, { useState, useEffect } from "react";
import AdvanceTableWrapper from "components/common/advance-table/AdvanceTableWrapper";
import AdvanceTable from "components/common/advance-table/AdvanceTable";
import AdvanceTableSearchBox from "components/common/advance-table/AdvanceTableSearchBox";
import AdvanceTableFooter from "components/common/advance-table/AdvanceTableFooter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loader from "components/Loader/Loader";
import {
  Button,
  Modal,
  CloseButton,
  Card,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import { ApiConfig } from "config/ApiConfig";
import axios from "axios";
import { toast } from "react-toastify";
import ResolutionModalTabs from "./ResolutionModal/ResolutionModalTabs";
import SurveyModal from "./SurveyModal";
import "./Modules.css";
import usePagination from "./advance-table/usePagination";
import SliderComponent from "./SliderComponent";

const Modules = () => {
  const [data, setData] = useState([]);
  const [groupData, setGroupData] = useState([]);
  const [group, setGroup] = useState([]);
  const [sliderValues, setSliderValues] = useState({});
  const [totalIngestion, setTotalIngestion] = useState(0);

  const [activeTabIngestion, setActiveTabIngestion] = useState("KB Ingestion");

  // Modal -----------------------------------------------------------------
  const [showSettings, setShowSettings] = useState(false);
  const [showGroups, setShowGroups] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);

  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isLoadingModules, setIsLoadingModules] = useState(false);

  const fetchUserData = async (setLoading = true) => {
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };
    try {
      if (setLoading) {
        setIsLoadingModules(true);
      }
      // setIsLoadingModules(true);
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
        disableGroupSelection: module.disable_group_selection,
        subscriptionStatus: module.subscription_status,
      }));
      setData(modifiedData);
      setGroupData(response?.data?.all_groups);

      // Initialize slider values
      const initialSliders = response.data.groups.reduce((acc, group) => {
        acc[group.id] = 0;
        return acc;
      }, {});
      setSliderValues(initialSliders);
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error);
    } finally {
      // if (setLoading) {
      //   setIsLoadingModules(false);
      // }
      setIsLoadingModules(false);
    }
  };
  useEffect(() => {
    fetchUserData();
  }, []);

  const columns = [
    {
      accessor: "name",
      Header: "Feature",
      Cell: ({ row }) => (
        <p>
          {/* {row.original?.allowed_groups?.length > 0 ? (
            <span className="text-success mx-2">●</span>
          ) : (
            <span className="text-danger mx-2">●</span>
          )} */}
          {row.original.name}
        </p>
      ),
    },
    {
      accessor: "desc",
      Header: "Description",
      Cell: ({ value }) => (
        <p className="m-0 text-wrap" style={{ maxWidth: "35rem" }}>
          {value}
        </p>
      ),
    },
    {
      accessor: "group",
      Header: "Group",
      Cell: ({ row }) => (
        <Button
          variant="link"
          onClick={() => {
            setEditingFeature(row.original);
            setGroup(
              groupData.map((group) => {
                const isSelected = row?.original?.allowed_groups?.some(
                  (groups) => groups.id === group.id
                );
                return {
                  ...group,
                  is_checked: isSelected,
                  already_ingested: isSelected,
                };
              })
            );
            const sortedGroups = groupData
              .map((group) => {
                const isSelected = row?.original?.allowed_groups?.some(
                  (groups) => groups.id === group.id
                );
                return {
                  ...group,
                  is_checked: isSelected,
                };
              })
              .sort((a, b) => {
                return b.is_checked - a.is_checked; // Sort so that selected (checked) groups come first
              });

            setGroupData(sortedGroups);
            setShowGroups(true);
          }}
        >
          {/* {row.original?.allowed_groups?.length} */}
          {row.original?.allowed_groups?.length > 0 ? (
            <span>{row.original?.allowed_groups?.length}</span>
          ) : (
            <span className="text-danger">
              {row.original?.allowed_groups?.length}
            </span>
          )}
        </Button>
      ),
    },
    {
      accessor: "edit",
      Header: "Settings",
      Cell: ({ row }) => (
        <Button
          variant="link"
          disabled={row.original?.allowed_groups?.length <= 0}
          onClick={() => {
            setEditingFeature(row.original);
            setShowSettings(true);
          }}
        >
          <FontAwesomeIcon icon={"cog"} />
        </Button>
      ),
    },
  ];

  const handleCheckChange = (is_checked, selectedGroup) => {
    setGroup((prevGroup) =>
      prevGroup.map((group) => {
        return group.id === selectedGroup.id ? { ...group, is_checked } : group;
      })
    );

    // Determine which groups are checked after the state update
    const updatedGroups = group.map((g) => {
      if (g.id === selectedGroup.id) {
        return { ...g, is_checked };
      }
      return g;
    });

    // Filter only the checked groups
    // const checkedGroups = updatedGroups.filter((g) => g.is_checked);
    const checkedAndFreshGroups = updatedGroups.filter(
      (g) => g.is_checked && !g.already_ingested
    );

    // Sum of 1yr ticket counts for checked groups
    const totalTickets = checkedAndFreshGroups.reduce(
      (acc, group) => acc + group.ticket_count_1yr,
      0
    );

    // Adjust slider values based on the number of relevant groups and their ticket counts
    const newSliderValues = {}; // Start with current slider values
    checkedAndFreshGroups.forEach((group) => {
      if (
        checkedAndFreshGroups.length === 1 &&
        group.ticket_count_1yr <= editingFeature?.ingestion_quota_left
      ) {
        // If only one relevant group is checked and its ticket count is less than the quota, assign the full ticket count or remaining quota, whichever is lower
        newSliderValues[group.id] = Math.min(
          editingFeature?.ingestion_quota_left,
          group.ticket_count_1yr
        );
      } else {
        // Divide the quota based on the ratio of ticket counts if multiple relevant groups are checked
        const quotaPerTicket =
          editingFeature?.ingestion_quota_left / totalTickets;
        const calculatedQuota = Math.floor(
          quotaPerTicket * group.ticket_count_1yr
        );
        newSliderValues[group.id] = Math.min(
          calculatedQuota,
          group.ticket_count_1yr
        ); // Cap the maximum quota at the group's 1-year ticket count
      }
    });

    setSliderValues(newSliderValues);

    // Recalculate total ingestion
    setTotalIngestion(
      Object.values(newSliderValues).reduce((acc, value) => acc + value, 0)
    );
  };

  const handleUpdateGroups = async () => {
    const updatedAllowedGroups = group
      .filter((group) => group.is_checked)
      .map((group) => {
        if (editingFeature.name === "Intelligent Resolution and Analytics") {
          return { ...group, hti_ingestion_count: sliderValues[group.id] || 0 };
        } else {
          return { ...group };
        }
      });

    const invalidGroups = updatedAllowedGroups.filter((group) => {
      const originalGroup = editingFeature.allowed_groups.find(
        (g) => g.id === group.id
      );
      return !originalGroup && group.hti_ingestion_count === 0;
    });

    if (
      invalidGroups.length > 0 &&
      editingFeature.name === "Intelligent Resolution and Analytics"
    ) {
      toast.error("Newly enabled groups must have a non-zero ingestion count.");
      return;
    }

    if (
      totalIngestion > editingFeature?.ingestion_quota_left &&
      editingFeature.name === "Intelligent Resolution and Analytics"
    ) {
      toast.error(
        `Total ingestion count exceeds the available limit. Only ${editingFeature?.ingestion_quota_left} left.`
      );
      return;
    }

    const featureAPIData = {
      feature_name: editingFeature.name,
      allowed_groups_all: updatedAllowedGroups,
    };
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };
    try {
      setIsLoadingGroups(true);
      const res = await axios.get(ApiConfig.ingestionRunningStatus, config);

      if (
        res.data.ingestion_in_progress &&
        editingFeature.name === "Intelligent Resolution and Analytics"
      ) {
        toast.error(
          "Ingestion is currently in progress. Please try again later."
        );
        return;
      }
      await axios.post(ApiConfig.featureUpdate, featureAPIData, config);
      fetchUserData(false);
      toast.success("Groups Updated Successfully");
      data.find((obj) => obj.name === editingFeature.name).allowed_groups = [];
      data.find((obj) => obj.name === editingFeature.name).allowed_groups =
        group.filter((item) => item.is_checked);
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error);
    } finally {
      setShowGroups(false);
      resetPaginationGroups();
      setIsLoadingGroups(false);
      setTotalIngestion(0);
      setSliderValues({});
    }
  };

  const groups = [
    {
      accessor: "name",
      Header: "Group Name",
      Cell: ({ row }) => (
        <Form.Check
          type="checkbox"
          name="groupSelection"
          id={`checkbox-${row.original.name}`}
          className="my-auto"
          label={<p className="m-0 ms-2">{row.original.name}</p>}
          disabled={
            editingFeature.name === "Intelligent Resolution and Analytics"
              ? (editingFeature.disableGroupSelection &&
                  editingFeature.allowed_groups.some(
                    (group) => group.id === row.original.id
                  )) ||
                editingFeature?.ingestion_quota_left <= 0
              : !data
                  .find(
                    (mod) => mod.name === "Intelligent Resolution and Analytics"
                  )
                  .allowed_groups.some((group) => group.id === row.original.id)
          }
          checked={
            group.find((group) => group.id === row.original.id).is_checked
          }
          onChange={(e) => handleCheckChange(e.target.checked, row.original)}
        />
      ),
    },
    {
      accessor: "description",
      Header: "Description",
      Cell: ({ value }) => (
        <p className="m-0 text-wrap" style={{ maxWidth: "35rem" }}>
          {value}
        </p>
      ),
    },
    // {
    //   accessor: "ticket_count_1yr",
    //   Header: "Ticket Count 1Yr",
    //   Cell: ({ value }) => <p className="m-0">{value}</p>,
    // },
  ];

  if (editingFeature?.name === "Intelligent Resolution and Analytics") {
    groups.push({
      accessor: "ticket_count_1yr",
      Header: "Ticket Count 1Yr",
      Cell: ({ value }) => <p className="m-0">{value}</p>,
    });
  }

  if (editingFeature?.name === "Intelligent Resolution and Analytics") {
    groups.push({
      accessor: "ingestion_count",
      Header: "Ingestion Count",
      Cell: ({ row }) => {
        useEffect(() => {
          const total = Object.values(sliderValues).reduce(
            (sum, value) => sum + value,
            0
          );
          setTotalIngestion(total);
        }, [sliderValues]);

        const handleSliderChange = (id, newValue) => {
          // Ensuring the new value does not exceed the remaining quota
          const maxAllowedValue = Math.min(
            newValue,
            editingFeature?.ingestion_quota_left
          );
          const newValues = { ...sliderValues, [id]: maxAllowedValue };
          let newTotal = Object.values(newValues).reduce(
            (sum, val) => sum + val,
            0
          );

          // Adjust other sliders if total exceeds the quota
          if (newTotal > editingFeature?.ingestion_quota_left) {
            const quotaLeft =
              editingFeature?.ingestion_quota_left - maxAllowedValue;
            const remainingTotal = newTotal - maxAllowedValue;
            let adjustmentRatio =
              remainingTotal > 0 ? quotaLeft / remainingTotal : 0;

            Object.keys(newValues).forEach((key) => {
              if (key !== id) {
                newValues[key] = Math.floor(newValues[key] * adjustmentRatio);
                newValues[key] = Math.max(newValues[key], 0);
              }
            });

            // Recalculate total to verify it's within quota and no negatives
            newTotal = Object.values(newValues).reduce(
              (sum, val) => sum + val,
              0
            );
          }

          setSliderValues(newValues);
          setTotalIngestion(newTotal);
        };

        return (
          <>
            {!editingFeature.allowed_groups.some(
              (group) => group.id === row.original.id
            ) ? (
              <SliderComponent
                id={row.original.id}
                initialValue={sliderValues[row.original.id] || 0}
                max={row.original.ticket_count_1yr}
                onChange={handleSliderChange}
                disabled={
                  !group.find((g) => g.id === row.original.id)?.is_checked ||
                  editingFeature.allowed_groups.some(
                    (g) => g.id === row.original.id
                  ) ||
                  editingFeature?.ingestion_quota_left <= 0
                }
              />
            ) : (
              <Button
                // variant="falcon-default"
                variant="link"
                style={{ width: "100%" }}
                size="sm"
                icon="plus"
                transform="shrink-3"
                onClick={() => {
                  setActiveTabIngestion("TicketStatus");
                  setShowGroups(false);
                  setShowSettings(true);
                }}
              >
                check status
              </Button>
            )}
          </>
        );
      },
    });
  }

  const updateSettings = (newSettings, featureName) => {
    setData((prevData) =>
      prevData.map((feature) =>
        feature.name === featureName
          ? { ...feature, settings: newSettings }
          : feature
      )
    );
  };

  // Handel Pagination
  const {
    currentPageData: currentPageFeatures,
    setPageSize: setPageSizeFeatures,
    nextPage: nextPageFeatures,
    previousPage: previousPageFeatures,
    canNextPage: canNextPageFeatures,
    canPreviousPage: canPreviousPageFeatures,
    pageIndex: pageIndexFeatures,
    pageSize: pageSizeFeatures,
  } = usePagination(data);

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
  } = usePagination(
    editingFeature?.name === "Feedback Survey"
      ? groupData.sort(
          (a, b) =>
            new Set(
              data
                .find(
                  (mod) => mod.name === "Intelligent Resolution and Analytics"
                )
                .allowed_groups.map((g) => g.id)
            ).has(b.id) -
            new Set(
              data
                .find(
                  (mod) => mod.name === "Intelligent Resolution and Analytics"
                )
                .allowed_groups.map((g) => g.id)
            ).has(a.id)
        )
      : groupData
  );

  return (
    <>
      <Card className="mb-3">
        <Card.Header className="bg-light">
          <h5 className="mb-0">Feature Management</h5>
        </Card.Header>
        {isLoadingModules ? (
          <Loader />
        ) : (
          <Card.Body className="text-justify text-1000">
            <AdvanceTableWrapper
              key={pageSizeFeatures}
              columns={columns}
              data={currentPageFeatures}
              sortable
              pagination
              perPage={pageSizeFeatures}
            >
              <Row className="mb-3">
                <Col xs={12} sm={6} lg={6}>
                  <AdvanceTableSearchBox table />
                </Col>
              </Row>

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
              {data.length ? (
                <div className="mt-3">
                  <AdvanceTableFooter
                    pageIndex={pageIndexFeatures}
                    pageSize={pageSizeFeatures}
                    nextPage={nextPageFeatures}
                    previousPage={previousPageFeatures}
                    canNextPage={canNextPageFeatures}
                    canPreviousPage={canPreviousPageFeatures}
                    page={currentPageFeatures}
                    rowCount={data?.length}
                    setPageSize={setPageSizeFeatures}
                    rowInfo
                    rowsPerPageSelection
                    navButtons
                  />
                </div>
              ) : (
                <h5 className="text-muted text-center my-5">No Data Found</h5>
              )}
            </AdvanceTableWrapper>
          </Card.Body>
        )}
      </Card>
      <Modal
        show={showSettings}
        onHide={() => setShowSettings(false)}
        backdrop="static"
        keyboard={false}
        size="lg"
        centered
      >
        <Modal.Body>
          <div className="d-flex justify-content-end">
            <CloseButton
              onClick={() => {
                setShowSettings(false);
              }}
            />
          </div>
          {editingFeature && (
            <>
              {(() => {
                switch (editingFeature.name) {
                  case "Intelligent Resolution and Analytics":
                    return (
                      <ResolutionModalTabs
                        data={editingFeature}
                        updateParentSettings={updateSettings}
                        activeTab={activeTabIngestion}
                      />
                    );
                  case "Feedback Survey":
                    return (
                      <SurveyModal
                        data={editingFeature}
                        updateParentSettings={updateSettings}
                      />
                    );

                  default:
                    return <h3>Ooopss... Something went wrong..!!</h3>;
                }
              })()}
            </>
          )}
        </Modal.Body>
      </Modal>
      <Modal
        show={showGroups}
        onHide={() => {
          setShowGroups(false);
          setActiveTabIngestion("KB Ingestion");
          resetPaginationGroups();
          setTotalIngestion(0);
          setSliderValues({});
        }}
        backdrop="static"
        keyboard={false}
        size="lg"
        centered
      >
        <Modal.Body>
          <div className="d-flex justify-content-between mt-2 mb-3">
            <Modal.Title>Edit Groups for {editingFeature?.name} </Modal.Title>
            <CloseButton
              onClick={() => {
                setShowGroups(false);
                setActiveTabIngestion("KB Ingestion");
                resetPaginationGroups();
                setTotalIngestion(0);
                setSliderValues({});
              }}
            />
          </div>
          <AdvanceTableWrapper
            key={pageSizeGroups}
            columns={groups}
            data={currentPageGroups}
            sortable
            pagination
            perPage={pageSizeGroups}
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

            {editingFeature?.name === "Intelligent Resolution and Analytics" ? (
              <div className="d-flex justify-content-between border border-1 m-0 px-3">
                <p
                  className="text-center text-muted my-1"
                  style={{ fontSize: "15px" }}
                >
                  Data processing quota:{" "}
                  <span className="fw-bold">
                    {editingFeature?.ingestion_quota_left < 0
                      ? 0
                      : editingFeature?.ingestion_quota_left}
                    /{editingFeature?.ingestion_quota_limit}
                  </span>
                </p>
                <p
                  className="text-center text-muted my-1"
                  style={{ fontSize: "15px" }}
                >
                  Total Ingestion Count:{" "}
                  <span className="fw-bold">{totalIngestion}</span>
                </p>
              </div>
            ) : (
              <p
                className="text-center text-muted my-1"
                style={{ fontSize: "15px" }}
              >
                Groups enabled for Intelligent Resolution and Analytics can be
                selected.
              </p>
            )}

            <div className="mt-3">
              <AdvanceTableFooter
                pageIndex={pageIndexGroups}
                pageSize={pageSizeGroups}
                nextPage={nextPageGroups}
                previousPage={previousPageGroups}
                canNextPage={canNextPageGroups}
                canPreviousPage={canPreviousPageGroups}
                page={currentPageGroups}
                rowCount={groupData.length}
                setPageSize={setPageSizeGroups}
                rowInfo
                rowsPerPageSelection
                navButtons
              />
            </div>
          </AdvanceTableWrapper>
          <div
            className="btn-group mx-auto d-flex justify-content-center w-50 mt-4 mb-3"
            role="group"
            aria-label="Basic mixed styles example"
          >
            <Button
              variant="falcon-success"
              type="submit"
              onClick={handleUpdateGroups}
              disabled={
                isLoadingGroups || editingFeature?.ingestion_quota_left <= 0
              }
            >
              {isLoadingGroups ? "submitting..." : "submit"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Modules;

import React, { useEffect, useState } from "react";
import AdvanceTableWrapper from "../advance-table/AdvanceTableWrapper";
import AdvanceTable from "../advance-table/AdvanceTable";
import AdvanceTableFooter from "../advance-table/AdvanceTableFooter";
import usePagination from "../advance-table/usePagination";
import {
  Button,
  Spinner,
  Card,
  Form,
  InputGroup,
  FormControl,
  Row,
  Col,
  ProgressBar,
} from "react-bootstrap";
import { ApiConfig } from "config/ApiConfig";
import axios from "axios";
import { toast } from "react-toastify";
import SliderComponent from "../helper/SliderComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loader from "components/Loader/Loader";
import SoftBadge from "components/common/SoftBadge";

export default function TopX({
  data,
  remainingGroupsIngestion,
  // allowedGroupsIngestion,
  // allGroups,
  updateAllowedGroups,
  updateRemainingGroups,
}) {
  const [group, setGroup] = useState([]);
  const [groupData, setGroupData] = useState([]);

  const [filteredGroups, setFilteredGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [ingestionQuotaLeft, setIngestionQuotaLeft] = useState(0);
  const [ingestionQuotaLimit, setingestionQuotaLimit] = useState(0);

  const [sliderValues, setSliderValues] = useState({});
  const [totalIngestion, setTotalIngestion] = useState(0);

  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  useEffect(() => {
    if (remainingGroupsIngestion) {
      setGroup(
        remainingGroupsIngestion.map((group) => {
          const isSelected = data?.allowed_groups?.some(
            (groups) => groups.id === group.id
          );
          return {
            ...group,
            is_checked: isSelected,
            already_ingested: isSelected,
          };
        })
      );

      const sortedGroups = remainingGroupsIngestion
        .map((group) => {
          const isSelected = data?.allowed_groups?.some(
            (groups) => groups.id === group.id
          );
          return {
            ...group,
            is_checked: isSelected,
          };
        })
        .sort((a, b) => a?.is_checked - b?.is_checked);

      setGroupData(sortedGroups);
    }
    setIngestionQuotaLeft(data?.ingestion_quota_left);
    setingestionQuotaLimit(data?.ingestion_quota_limit);
  }, [remainingGroupsIngestion, data]);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredGroups(groupData);
    } else {
      setFilteredGroups(
        groupData.filter((group) =>
          group.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    resetPaginationGroups();
  }, [searchTerm, groupData]);

  const handleCheckChange = (is_checked, selectedGroup) => {
    setGroup((prevGroup) =>
      prevGroup.map((group) =>
        group.id === selectedGroup.id ? { ...group, is_checked } : group
      )
    );

    const updatedGroups = group.map((g) => {
      if (g.id === selectedGroup.id) {
        return { ...g, is_checked };
      }
      return g;
    });

    const checkedAndFreshGroups = updatedGroups.filter(
      (g) => g?.is_checked && !g.already_ingested
    );

    const totalTickets = checkedAndFreshGroups.reduce(
      (acc, group) => acc + group.ticket_count_1yr,
      0
    );

    const newSliderValues = {};
    checkedAndFreshGroups.forEach((group) => {
      if (
        checkedAndFreshGroups.length === 1 &&
        group.ticket_count_1yr <= data?.ingestion_quota_left
      ) {
        newSliderValues[group.id] = Math.min(
          data?.ingestion_quota_left,
          group.ticket_count_1yr
        );
      } else {
        const quotaPerTicket = data?.ingestion_quota_left / totalTickets;
        const calculatedQuota = Math.floor(
          quotaPerTicket * group.ticket_count_1yr
        );
        newSliderValues[group.id] = Math.min(
          calculatedQuota,
          group.ticket_count_1yr
        );
      }
    });

    setSliderValues(newSliderValues);

    setTotalIngestion(
      Object.values(newSliderValues).reduce((acc, value) => acc + value, 0)
    );
  };

  const handleUpdateGroups = async () => {
    const updatedAllowedGroups = group
      .filter((group) => group?.is_checked)
      .map((group) => {
        return { ...group, hti_ingestion_count: sliderValues[group.id] || 0 };
      });

    const invalidGroups = updatedAllowedGroups.filter((group) => {
      const originalGroup = data?.allowed_groups.find((g) => g.id === group.id);
      return !originalGroup && group.hti_ingestion_count === 0;
    });
    console.log(invalidGroups);

    if (invalidGroups.length > 0) {
      toast.error("Newly enabled groups must have a non-zero ingestion count.");
      return;
    }

    if (totalIngestion > data?.ingestion_quota_left) {
      toast.error(
        `Total ingestion count exceeds the available limit. Only ${data?.ingestion_quota_left} left.`
      );
      return;
    }

    const featureAPIData = {
      feature_name: data.name,
      allowed_groups_all: updatedAllowedGroups,
    };
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };
    try {
      setIsLoadingGroups(true);
      const res = await axios.get(ApiConfig.ingestionRunningStatus, config);
      if (res.data.ingestion_in_progress) {
        toast.error(
          "Ingestion is currently in progress. Please try again later."
        );
        return;
      }
      await axios.post(ApiConfig.featureUpdate, featureAPIData, config);

      toast.success("Groups Updated Successfully");
      updateAllowedGroups(group.filter((item) => item?.is_checked));
      const updatedRemainingGroups = remainingGroupsIngestion.filter(
        (g) => !group.some((item) => item.is_checked && item.id === g.id)
      );

      setGroup(updatedRemainingGroups);
      setGroupData(updatedRemainingGroups);
      updateRemainingGroups(updatedRemainingGroups);
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error);
    } finally {
      resetPaginationGroups();
      setIsLoadingGroups(false);
      setTotalIngestion(0);
      setSliderValues({});
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
          id={`checkbox-${row.original.name}`}
          className="my-auto"
          label={<p className="m-0 ms-2">{row.original.name}</p>}
          disabled={data?.ingestion_quota_left <= 0}
          checked={
            group.find((group) => group.id === row.original.id)?.is_checked
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
    {
      accessor: "ticket_count_1yr",
      Header: "Ticket Count 1Yr",
      Cell: ({ value }) => <p className="m-0">{value}</p>,
    },
    {
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
          const maxAllowedValue = Math.min(
            newValue,
            data?.ingestion_quota_left
          );
          const newValues = { ...sliderValues, [id]: maxAllowedValue };
          let newTotal = Object.values(newValues).reduce(
            (sum, val) => sum + val,
            0
          );

          if (newTotal > data?.ingestion_quota_left) {
            const quotaLeft = data?.ingestion_quota_left - maxAllowedValue;
            const remainingTotal = newTotal - maxAllowedValue;
            let adjustmentRatio =
              remainingTotal > 0 ? quotaLeft / remainingTotal : 0;

            Object.keys(newValues).forEach((key) => {
              if (key !== id) {
                newValues[key] = Math.floor(newValues[key] * adjustmentRatio);
                newValues[key] = Math.max(newValues[key], 0);
              }
            });

            newTotal = Object.values(newValues).reduce(
              (sum, val) => sum + val,
              0
            );
          }

          setSliderValues(newValues);
          setTotalIngestion(newTotal);
        };

        return (
          <SliderComponent
            id={row.original.id}
            initialValue={sliderValues[row.original.id] || 0}
            max={row.original.ticket_count_1yr}
            onChange={handleSliderChange}
            disabled={
              !group.find((g) => g.id === row.original.id)?.is_checked ||
              data?.ingestion_quota_left <= 0
            }
          />
        );
      },
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
  } = usePagination(filteredGroups);

  const [status, setStatus] = useState([]);
  const [ingestionStatus, setIngestionStatus] = useState(false);
  const [ingestedData, setIngestedData] = useState([]);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [hasErrorOccurred, setHasErrorOccurred] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (hasErrorOccurred && !isFirstLoad) return;
      const config = {
        headers: { "Access-Control-Allow-Origin": "*" },
        withCredentials: true,
      };

      try {
        setIsLoadingStatus(true);
        const res = await axios.get(ApiConfig.ingestionRunningStatus, config);
        setIngestionStatus(res.data.ticket_ingestion_in_progress);
        const response = await axios.get(
          ApiConfig.ticketIngestionStatus,
          config
        );
        setStatus(response?.data?.cumulative_data);
        setIngestedData(response?.data?.groupwise_data);
        setHasErrorOccurred(false);
      } catch (error) {
        toast.error(error.response?.data?.detail?.masked_error);
        setHasErrorOccurred(true);
      } finally {
        setIsLoadingStatus(false);
        if (isFirstLoad) setIsFirstLoad(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, [hasErrorOccurred, isFirstLoad]);

  const calculatePercentage = (numerator, denominator) => {
    if (denominator === 0 || isNaN(numerator) || isNaN(denominator)) {
      return 0;
    }
    const percentage = (numerator / denominator) * 100;
    if (percentage <= 0) {
      return 0;
    } else if (percentage >= 100) {
      return 100;
    } else {
      return percentage.toFixed(1);
    }
  };

  const GroupCard = ({ group }) => {
    const {
      name,
      hti_ingestion_count,
      hti_success_count,
      hti_error_count,
      cti_ingestion_count,
      cti_success_count,
      cti_error_count,
    } = group;

    const htiSuccessRate = calculatePercentage(
      hti_success_count,
      hti_ingestion_count
    );
    const htiErrorRate = calculatePercentage(
      hti_error_count,
      hti_ingestion_count
    );
    const ctiSuccessRate = calculatePercentage(
      cti_success_count,
      cti_ingestion_count
    );
    const ctiErrorRate = calculatePercentage(
      cti_error_count,
      cti_ingestion_count
    );

    return (
      <Col md={6} lg={6} xl={4} className="mb-4">
        <Card className="h-100">
          <Card.Body className="p-3">
            <h5 className="mb-3 text-primary">{name}</h5>
            <Row>
              <Col xs={6}>
                <h6 className="text-success">Legacy Tickets</h6>
                <p className="text-800 mb-1" style={{ fontSize: "12px" }}>
                  Success Rate: {htiSuccessRate}% ({hti_success_count} out of{" "}
                  {hti_ingestion_count})
                </p>
                <ProgressBar
                  animated
                  now={htiSuccessRate}
                  variant="success"
                  style={{ height: "8px" }}
                  className="rounded-pill mb-3"
                />
                <p className="text-800 mb-1" style={{ fontSize: "12px" }}>
                  Error Rate: {htiErrorRate}% ({hti_error_count} out of{" "}
                  {hti_ingestion_count})
                </p>
                <ProgressBar
                  animated
                  now={htiErrorRate}
                  variant="danger"
                  style={{ height: "8px" }}
                  className="rounded-pill"
                />
              </Col>
              <Col xs={6}>
                <h6 className="text-success">Ticket Influx</h6>
                <p className="text-800 mb-1" style={{ fontSize: "12px" }}>
                  Success Rate: {ctiSuccessRate}% ({cti_success_count} out of{" "}
                  {cti_ingestion_count})
                </p>
                <ProgressBar
                  animated
                  now={ctiSuccessRate}
                  variant="success"
                  style={{ height: "8px" }}
                  className="rounded-pill mb-3"
                />
                <p className="text-800 mb-1" style={{ fontSize: "12px" }}>
                  Error Rate: {ctiErrorRate}% ({cti_error_count} out of{" "}
                  {cti_ingestion_count})
                </p>
                <ProgressBar
                  animated
                  now={ctiErrorRate}
                  variant="danger"
                  style={{ height: "8px" }}
                  className="rounded-pill"
                />
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    );
  };

  // const statusSection = (
  //   <section className="m-0 p-0">
  //     <Row className="mb-4">
  //       <Col sm={6}>
  //         <Card className="h-100 mb-4">
  //           <Card.Body>
  //             <Row className="flex-between-center">
  //               <Col className="d-md-flex d-lg-block flex-between-center">
  //                 <h6 className="mb-md-0 mb-lg-2 text-primary fs-2 fw-semibold">
  //                   Success Rate
  //                 </h6>
  //                 <SoftBadge bg="primary">Ticket Processed</SoftBadge>
  //               </Col>
  //               <Col xs="auto">
  //                 <h4 className="d-flex justify-content-end fs-3 fw-normal text-primary">
  //                   {calculatePercentage(
  //                     status?.all_over_success_count,
  //                     status?.all_over_count
  //                   )}
  //                   %
  //                 </h4>
  //                 <h6 className="fw-semibold text-muted">
  //                   ( {status?.all_over_success_count || 0}&nbsp;/&nbsp;
  //                   {status?.all_over_count || 0} )
  //                 </h6>
  //               </Col>
  //             </Row>
  //           </Card.Body>
  //         </Card>
  //       </Col>
  //       <Col sm={6}>
  //         <Card className="h-100 mb-4">
  //           <Card.Body>
  //             <Row className="flex-between-center">
  //               <Col className="d-md-flex d-lg-block flex-between-center">
  //                 <h6 className="mb-md-0 mb-lg-2 text-primary fs-2 fw-semibold">
  //                   Failure Rate
  //                 </h6>
  //                 <SoftBadge bg="primary">Ticket Processed</SoftBadge>
  //               </Col>
  //               <Col xs="auto">
  //                 <h4 className="d-flex justify-content-end fs-3 fw-normal text-primary">
  //                   {calculatePercentage(
  //                     status?.all_over_error_count,
  //                     status?.all_over_count
  //                   )}
  //                   %
  //                 </h4>
  //                 <h6 className="fw-semibold text-muted">
  //                   ( {status?.all_over_error_count || 0}&nbsp;/&nbsp;
  //                   {status?.all_over_count || 0} )
  //                 </h6>
  //               </Col>
  //             </Row>
  //           </Card.Body>
  //         </Card>
  //       </Col>
  //     </Row>
  //   </section>
  // );

  // const overallStatsSection = (
  //   <Row className="mb-4">
  //     <Col sm={6}>
  //       <Card className="h-100">
  //         <Card.Body>
  //           <div
  //             className="d-flex justify-content-between mb-2"
  //             style={{ fontWeight: "700" }}
  //           >
  //             <h5 className="text-primary">
  //               {calculatePercentage(
  //                 status?.hti_success_ticket_count,
  //                 status?.total_hti_ticket_to_be_ingested
  //               )}
  //               %
  //             </h5>
  //             <span className="text-muted fw-medium">
  //               ( {status?.hti_success_ticket_count || 0}&nbsp;/&nbsp;
  //               {status?.total_hti_ticket_to_be_ingested || 0} )
  //             </span>
  //           </div>
  //           <p className="fs--1 text-800">Legacy Ticket Success Rate</p>
  //           <ProgressBar
  //             animated={true}
  //             now={calculatePercentage(
  //               status?.hti_success_ticket_count,
  //               status?.total_hti_ticket_to_be_ingested
  //             )}
  //             key={1}
  //             style={{ height: "8px" }}
  //             className="rounded-pill mb-3"
  //           />
  //         </Card.Body>
  //       </Card>
  //     </Col>
  //     <Col sm={6}>
  //       <Card className="h-100">
  //         <Card.Body>
  //           <div
  //             className="d-flex justify-content-between mb-2"
  //             style={{ fontWeight: "700" }}
  //           >
  //             <h5 className="text-primary">
  //               {calculatePercentage(
  //                 status?.cti_success_ticket_count,
  //                 status?.total_cti_ticket_to_be_ingested
  //               )}
  //               %
  //             </h5>
  //             <span className="text-muted fw-medium">
  //               ( {status?.cti_success_ticket_count || 0}&nbsp;/&nbsp;
  //               {status?.total_cti_ticket_to_be_ingested || 0} )
  //             </span>
  //           </div>
  //           <p className="fs--1 text-800">Ticket Influx Success Rate</p>
  //           <ProgressBar
  //             animated={true}
  //             now={calculatePercentage(
  //               status?.cti_success_ticket_count,
  //               status?.total_cti_ticket_to_be_ingested
  //             )}
  //             key={1}
  //             style={{ height: "8px" }}
  //             className="rounded-pill mb-3"
  //           />
  //         </Card.Body>
  //       </Card>
  //     </Col>
  //   </Row>
  // );

  const overallStatsSection = (
    <Row className="mb-4">
      <Col sm={12}>
        <Card className="h-100">
          <Card.Body>
            <Row className="flex-between-center">
              <Col className="d-md-flex d-lg-block flex-between-center">
                <h6 className="mb-md-0 mb-lg-2 text-primary fs-2 fw-semibold">
                  Overall Success Rate
                </h6>
                <SoftBadge bg="primary">Ticket Processed</SoftBadge>
              </Col>
              <Col xs="auto">
                <h4 className="d-flex justify-content-end fs-3 fw-normal text-primary">
                  {calculatePercentage(
                    status?.all_over_success_count,
                    status?.all_over_count
                  )}
                  %
                </h4>
                <h6 className="fw-semibold text-muted">
                  ( {status?.all_over_success_count || 0}&nbsp;/&nbsp;
                  {status?.all_over_count || 0} )
                </h6>
              </Col>
            </Row>
            <hr />
            <Row>
              <Col xs={6}>
                <h6 className="text-success">Legacy Ticket Success Rate</h6>
                <div
                  className="d-flex justify-content-between mb-2"
                  style={{ fontWeight: "700" }}
                >
                  <h5 className="text-primary">
                    {calculatePercentage(
                      status?.hti_success_ticket_count,
                      status?.total_hti_ticket_to_be_ingested
                    )}
                    %
                  </h5>
                  <span className="text-muted fw-medium">
                    ( {status?.hti_success_ticket_count || 0}&nbsp;/&nbsp;
                    {status?.total_hti_ticket_to_be_ingested || 0} )
                  </span>
                </div>
                <ProgressBar
                  animated={true}
                  now={calculatePercentage(
                    status?.hti_success_ticket_count,
                    status?.total_hti_ticket_to_be_ingested
                  )}
                  key={1}
                  style={{ height: "8px" }}
                  className="rounded-pill mb-3"
                />
              </Col>
              <Col xs={6}>
                <h6 className="text-success">Ticket Influx Success Rate</h6>
                <div
                  className="d-flex justify-content-between mb-2"
                  style={{ fontWeight: "700" }}
                >
                  <h5 className="text-primary">
                    {calculatePercentage(
                      status?.cti_success_ticket_count,
                      status?.total_cti_ticket_to_be_ingested
                    )}
                    %
                  </h5>
                  <span className="text-muted fw-medium">
                    ( {status?.cti_success_ticket_count || 0}&nbsp;/&nbsp;
                    {status?.total_cti_ticket_to_be_ingested || 0} )
                  </span>
                </div>
                <ProgressBar
                  animated={true}
                  now={calculatePercentage(
                    status?.cti_success_ticket_count,
                    status?.total_cti_ticket_to_be_ingested
                  )}
                  key={1}
                  style={{ height: "8px" }}
                  className="rounded-pill mb-3"
                />
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
  return (
    <>
      <div className="my-2">
        <h6 className="mb-2">Description</h6>
        <p className="text-muted">{data.desc}</p>
      </div>
      <div className="my-2">
        <hr />
        <h6 className="mb-2">Groups</h6>

        <Row className="mb-3">
          <Col xs={12} sm={6} md={3} lg={4}>
            <InputGroup size="sm">
              <FormControl
                placeholder="Search groups..."
                aria-label="Search Groups"
                aria-describedby="basic-addon2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
              />
              <InputGroup.Text id="basic-addon2">
                <FontAwesomeIcon icon="search" />
              </InputGroup.Text>
            </InputGroup>
          </Col>
        </Row>

        <AdvanceTableWrapper
          key={pageSizeGroups}
          columns={groupsTable}
          data={currentPageGroups}
          pagination
          perPage={pageSizeGroups}
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
          {filteredGroups.length > 0 ? (
            <>
              <div className="d-flex justify-content-between border border-1 m-0 px-3">
                <p
                  className="text-center text-muted my-1"
                  style={{ fontSize: "15px" }}
                >
                  Ticket processing quota :
                  <span className="fw-bold">
                    &nbsp;{ingestionQuotaLeft < 0 ? 0 : ingestionQuotaLeft}
                    &nbsp;remaining of&nbsp;
                    {ingestionQuotaLimit}
                  </span>
                </p>
                <p
                  className="text-center text-muted my-1"
                  style={{ fontSize: "15px" }}
                >
                  Selected Groups' Tickets :
                  <span className="fw-bold">&nbsp;{totalIngestion}</span>
                </p>
              </div>
              <div className="mt-2">
                <AdvanceTableFooter
                  pageIndex={pageIndexGroups}
                  pageSize={pageSizeGroups}
                  nextPage={nextPageGroups}
                  previousPage={previousPageGroups}
                  canNextPage={canNextPageGroups}
                  canPreviousPage={canPreviousPageGroups}
                  page={currentPageGroups}
                  rowCount={filteredGroups?.length}
                  setPageSize={setPageSizeGroups}
                  rowInfo
                  rowsPerPageSelection
                  navButtons
                />
              </div>{" "}
            </>
          ) : (
            <h5 className="text-muted text-center my-3">No Data Found</h5>
          )}
        </AdvanceTableWrapper>
        {filteredGroups.length > 0 && (
          <div
            className="btn-group mx-auto d-flex justify-content-center w-25"
            role="group"
            aria-label="Basic mixed styles example"
          >
            <Button
              variant="falcon-success"
              onClick={handleUpdateGroups}
              disabled={isLoadingGroups || data.ingestion_quota_left <= 0}
            >
              {isLoadingGroups ? "submitting..." : "submit"}
            </Button>
          </div>
        )}
        {/* {filteredGroups.length > 0 && (
          <div className="d-flex justify-content-end mt-3">
            <Button
              variant="success"
              type="submit"
              onClick={handleUpdateGroups}
              disabled={isLoadingGroups || data.ingestion_quota_left <= 0}
            >
              {isLoadingGroups ? "submitting..." : "submit"}
            </Button>
          </div>
        )} */}
      </div>
      <div className="my-2">
        <hr />
        {isLoadingStatus && isFirstLoad ? (
          <Loader />
        ) : (
          <>
            {ingestionStatus ? (
              <div className="mb-3">
                <p className="d-flex align-items-center text-danger fw-bold">
                  <Spinner
                    style={{ height: "10px", width: "10px" }}
                    animation="grow"
                    variant="danger"
                  />
                  &nbsp;&nbsp;LIVE &nbsp;
                  <h6 className="text-muted fw-bold d-flex align-items-center m-0">
                    (Legacy Ticket Processing)
                  </h6>
                </p>
              </div>
            ) : null}
            {ingestionStatus ? (
              <>
                {/* {statusSection} */}
                {overallStatsSection}
                <h6 className="my-2">Ingested Groups</h6>
                <Row>
                  {ingestedData?.length > 0 ? (
                    ingestedData.map((group, index) => (
                      <GroupCard key={index} group={group} />
                    ))
                  ) : (
                    <h5 className="text-muted text-center my-3">
                      No Data Found
                    </h5>
                  )}
                </Row>
              </>
            ) : (
              <>
                <h6 className="my-2">Processed Group</h6>
                <Row>
                  {ingestedData?.length > 0 ? (
                    ingestedData.map((group, index) => (
                      <GroupCard key={index} group={group} />
                    ))
                  ) : (
                    <h5 className="text-muted text-center my-3">
                      No Data Found
                    </h5>
                  )}
                </Row>
                {/* {statusSection} */}
                {overallStatsSection}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

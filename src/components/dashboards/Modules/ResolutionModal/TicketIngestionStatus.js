import React, { useEffect, useState } from "react";
import AdvanceTableWrapper from "components/common/advance-table/AdvanceTableWrapper";
import AdvanceTable from "components/common/advance-table/AdvanceTable";
// import AdvanceTableFooter from "components/common/advance-table/AdvanceTableFooter";
import { Row, Col, Card, ProgressBar, Spinner } from "react-bootstrap";
import axios from "axios";
import { ApiConfig } from "config/ApiConfig";
import SoftBadge from "components/common/SoftBadge";
import Loader from "components/Loader/Loader";
import { toast } from "react-toastify";

const TicketIngestionStatus = () => {
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
        setIngestionStatus(res.data.ingestion_in_progress);
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

  const columns2 = [
    {
      Header: "GROUP NAME",
      accessor: "name",
    },
    {
      Header: "LEGACY TICKETS",
      accessor: "ticket_count",
      Cell: ({ row }) => {
        const { hti_ingestion_count, hti_success_count, hti_error_count } =
          row.original;
        const successRate = calculatePercentage(
          hti_success_count,
          hti_ingestion_count
        );
        const errorRate = calculatePercentage(
          hti_error_count,
          hti_ingestion_count
        );
        return (
          <span>
            Success Rate: {successRate}% ({hti_success_count} out of{" "}
            {hti_ingestion_count} successes)
            <br />
            Error Rate: {errorRate}% ({hti_error_count} out of{" "}
            {hti_ingestion_count} errors)
          </span>
        );
      },
    },
    {
      Header: "TICKET INFLUX",
      accessor: "cti_success_count",
      Cell: ({ row }) => {
        const { cti_ingestion_count, cti_success_count, cti_error_count } =
          row.original;
        const successRate = calculatePercentage(
          cti_success_count,
          cti_ingestion_count
        );
        const errorRate = calculatePercentage(
          cti_error_count,
          cti_ingestion_count
        );
        return (
          <span>
            Success Rate: {successRate}% ({cti_success_count} out of{" "}
            {cti_ingestion_count} successes)
            <br />
            Error Rate: {errorRate}% ({cti_error_count} out of{" "}
            {cti_ingestion_count} errors)
          </span>
        );
      },
    },
  ];

  const statusSection = (
    <section className="m-0 p-0">
      <Row className="mb-4">
        <Col sm={6}>
          <Card className="h-100 mb-4">
            <Card.Body>
              <Row className="flex-between-center">
                <Col className="d-md-flex d-lg-block flex-between-center">
                  <h6 className="mb-md-0 mb-lg-2 text-primary fs-2 fw-semibold">
                    Success Rate
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
            </Card.Body>
          </Card>
        </Col>
        <Col sm={6}>
          <Card className="h-100 mb-4">
            <Card.Body>
              <Row className="flex-between-center">
                <Col className="d-md-flex d-lg-block flex-between-center">
                  <h6 className="mb-md-0 mb-lg-2 text-primary fs-2 fw-semibold">
                    Failure Rate
                  </h6>
                  <SoftBadge bg="primary">Ticket Processed</SoftBadge>
                </Col>
                <Col xs="auto">
                  <h4 className="d-flex justify-content-end fs-3 fw-normal text-primary">
                    {calculatePercentage(
                      status?.all_over_error_count,
                      status?.all_over_count
                    )}
                    %
                  </h4>
                  <h6 className="fw-semibold text-muted">
                    ( {status?.all_over_error_count || 0}&nbsp;/&nbsp;
                    {status?.all_over_count || 0} )
                  </h6>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </section>
  );

  const overallStatsSection = (
    <Row className="mb-4">
      <Col sm={6}>
        <Card className="h-100">
          <Card.Body>
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
            <p className="fs--1 text-800">Legacy Ticket Success Rate</p>
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
          </Card.Body>
        </Card>
      </Col>
      <Col sm={6}>
        <Card className="h-100">
          <Card.Body>
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
            <p className="fs--1 text-800">Ticket Influx Success Rate</p>
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
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  // const overallStatsSection = (
  //   <Row className="mb-4">
  //     <Col sm={6}>
  //       <Card className="h-100">
  //         <Card.Body>
  //           <p className="mb-2 text-primary" style={{ fontWeight: "700" }}>
  //             {calculatePercentage(
  //               status?.hti_success_ticket_count,
  //               status?.total_hti_ticket_to_be_ingested
  //             )}
  //             %
  //           </p>
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
  //           <p className="mb-2 text-primary" style={{ fontWeight: "700" }}>
  //             {calculatePercentage(
  //               status?.hti_error_ticket_count,
  //               status?.total_hti_ticket_to_be_ingested
  //             )}
  //             %
  //           </p>
  //           <p className="fs--1 text-800">Legacy Ticket Error Rate</p>

  //           <ProgressBar
  //             animated={true}
  //             now={calculatePercentage(
  //               status?.hti_error_ticket_count,
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
  //           <p className="mb-2 text-primary" style={{ fontWeight: "700" }}>
  //             {calculatePercentage(
  //               status?.cti_success_ticket_count,
  //               status?.total_cti_ticket_to_be_ingested
  //             )}
  //             %
  //           </p>
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
  //     <Col sm={6}>
  //       <Card className="h-100">
  //         <Card.Body>
  //           <p className="mb-2 text-primary" style={{ fontWeight: "700" }}>
  //             {calculatePercentage(
  //               status?.cti_error_ticket_count,
  //               status?.total_cti_ticket_to_be_ingested
  //             )}
  //             %
  //           </p>
  //           <p className="fs--1 text-800">Ticket Influx Error Rate</p>

  //           <ProgressBar
  //             animated={true}
  //             now={calculatePercentage(
  //               status?.cti_error_ticket_count,
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

  const tableSection = (
    <div className="my-3">
      <AdvanceTableWrapper
        columns={columns2}
        data={
          ingestedData
          // ?.sort((a, b) => b.ticket_count - a.ticket_count)
        }
        sortable
        // pagination
        // perPage={5}
      >
        {/* <div className="scrollable-table-wrapper"> */}
        <AdvanceTable
          table
          headerClassName="bg-200 text-900 text-nowrap align-middle"
          rowClassName="align-middle white-space-nowrap"
          tableProps={{
            bordered: true,
            striped: true,
            className: "fs--1 mb-0 overflow-hidden fixed-header-table",
          }}
        />
        {/* </div> */}
        {ingestedData?.length > 0 ? (
          <></>
        ) : (
          <h5 className="text-muted text-center my-3">No Data Found</h5>
        )}
      </AdvanceTableWrapper>
    </div>
  );

  return (
    <>
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
          ) : (
            <></>
          )}
          {statusSection}
          {overallStatsSection}
          <h6 className="my-2">Ingested Groups</h6>
          {tableSection}
          {/* {ingestionStatus ? (
            <>
              {statusSection}
              {overallStatsSection}
              <h6 className="my-2">Ingested Groups</h6>
              {tableSection}
            </>
          ) : (
            <>
              <h6 className="my-2">Ingested Groups</h6>
              {tableSection}
              {statusSection}
              {overallStatsSection}
            </>
          )} */}
        </>
      )}
    </>
  );
};

export default TicketIngestionStatus;

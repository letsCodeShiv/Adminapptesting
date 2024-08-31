import React, { useEffect, useState } from "react";
import AdvanceTableWrapper from "components/common/advance-table/AdvanceTableWrapper";
import AdvanceTable from "components/common/advance-table/AdvanceTable";
import AdvanceTableFooter from "components/common/advance-table/AdvanceTableFooter";
import { Row, Col, Card } from "react-bootstrap";
import axios from "axios";
import { ApiConfig } from "config/ApiConfig";
import SoftBadge from "components/common/SoftBadge";
import Loader from "components/Loader/Loader";
import { toast } from "react-toastify";

const TicketIngestionStatus = () => {
  const [status, setStatus] = useState({});
  const [ingestionStatus, setIngestionStatus] = useState(false);
  const [kbFiles, setKBFiles] = useState([]);
  const [kbLinks, setKBLinks] = useState([]);
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
        const response = await axios.get(ApiConfig.kbIngestionStatus, config);
        setStatus(response?.data?.kb_status);
        setKBFiles(response?.data?.kb_status?.topcx_kb_files);
        setKBLinks(response?.data?.kb_status?.topcx_kb_links);
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

  const KBFiles = [
    {
      Header: "File Name",
      accessor: "name",
    },
    {
      Header: "File Status",
      accessor: "status",
    },
  ];
  const KBLinks = [
    {
      Header: "URL",
      accessor: "url",
    },
    {
      Header: "Url Status",
      accessor: "status",
    },
  ];

  const statusSection = (
    <Row className="my-3">
      <Col sm={6}>
        <Card className="h-100 mb-4">
          <Card.Body>
            <Row className="flex-between-center">
              <Col className="d-md-flex d-lg-block flex-between-center">
                <h6 className="mb-md-0 mb-lg-2 text-primary fs-3">
                  Success Rate
                </h6>
                <SoftBadge bg="primary">KB Ingestion</SoftBadge>
              </Col>
              <Col xs="auto">
                <h4 className="fs-3 fw-normal text-primary">
                  {status?.success_percentage?.toFixed(1)}%
                </h4>
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
                <h6 className="mb-md-0 mb-lg-2 text-primary fs-3">
                  Failure Rate
                </h6>
                <SoftBadge bg="primary">KB Ingestion</SoftBadge>
              </Col>
              <Col xs="auto">
                <h4 className="fs-3 fw-normal text-primary">
                  {status?.failed_percentage?.toFixed(1)}%
                </h4>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
  const tableSection = (
    <div className="mb-3">
      <h6 className="my-2">Ingested Files</h6>
      <AdvanceTableWrapper
        columns={KBFiles}
        data={kbFiles}
        sortable
        pagination
        perPage={5}
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

        {kbFiles?.length > 0 ? (
          <div className="mt-3">
            <AdvanceTableFooter
              rowCount={kbFiles?.length}
              table
              rowInfo
              navButtons
              rowsPerPageSelection
            />
          </div>
        ) : (
          <h5 className="text-muted text-center my-3">No Data Found</h5>
        )}
      </AdvanceTableWrapper>

      <h6 className="my-2">Ingested Links</h6>
      <AdvanceTableWrapper
        columns={KBLinks}
        data={kbLinks}
        sortable
        pagination
        perPage={5}
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
        {kbLinks?.length > 0 ? (
          <div className="mt-3">
            <AdvanceTableFooter
              rowCount={kbLinks?.length}
              table
              rowInfo
              navButtons
              rowsPerPageSelection
            />
          </div>
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
            <>
              {statusSection}
              {tableSection}
            </>
          ) : (
            <>
              {tableSection}
              {statusSection}
            </>
          )}
        </>
      )}
    </>
  );
};

export default TicketIngestionStatus;

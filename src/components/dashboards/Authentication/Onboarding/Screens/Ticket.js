import React, { useEffect, useState } from "react";
import AdvanceTableWrapper from "components/common/advance-table/AdvanceTableWrapper";
import AdvanceTable from "components/common/advance-table/AdvanceTable";
import AdvanceTableFooter from "components/common/advance-table/AdvanceTableFooter";
import AdvanceTableSearchBox from "components/common/advance-table/AdvanceTableSearchBox";
import { Row, Col } from "react-bootstrap";
import axios from "axios";

const Ticket = () => {
  const [data, setData] = useState([]);
  const [ingestedData, setIngestedData] = useState([]);
  const [selectedData, setSelectedData] = useState([]);

  const [status, setStatus] = useState([]);
  const [isLoadingTI, setIsLoadingTI] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const config = {
        headers: { "Access-Control-Allow-Origin": "*" },
        withCredentials: true,
      };

      try {
        const response = await axios.get(
          "https://topcx.ai/api/backend/ingestion_status",
          config
        );
        setStatus(response.data.hti_status);
        setData(response.data.remainingGroups);
        setIngestedData(response.data.allowedGroups);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const handleCheckboxChange = (row, isChecked) => {
    console.log(row);
    if (isChecked) {
      // Add row to selectedRows if not already present
      setSelectedData((prev) => [...prev, row]);
    } else {
      // Remove row from selectedRows if unchecked
      setSelectedData((prev) =>
        prev.filter((selectedRow) => selectedRow !== row)
      );
    }
  };

  const handleZendeskTicketIngestion = async () => {
    setIsLoadingTI(true);

    const ticketData = {
      allowed_groups: selectedData,
    };

    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };

    try {
      const response = await axios.post(
        "https://topcx.ai/api/backend/Admin_Group_filtered_Ingestion",
        ticketData,
        config
      );

      console.log("API response:", response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingTI(false);
    }
  };

  const columns = [
    {
      Header: "GROUP NAME",
      accessor: "name",
    },
    {
      Header: "GROUP DESCRIPTION",
      accessor: "description",
    },
    {
      Header: "TICKET COUNT",
      accessor: "ticket_count",
    },
    {
      Header: "STATUS",
      accessor: (row) => (
        <div className="form-check form-switch">
          <input
            style={{ minWidth: "2rem " }}
            className="form-check-input"
            type="checkbox"
            role="switch"
            onChange={(e) => handleCheckboxChange(row, e.target.checked)}
          />
        </div>
      ),
    },
  ];
  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleZendeskTicketIngestion();
  };
  return (
    <div>
      <AdvanceTableWrapper
        columns={columns}
        data={data}
        sortable
        pagination
        perPage={5}
      >
        <Row className=" mb-3">
          <Col xs="auto" sm={6} lg={4}>
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
        <div className="mt-3">
          <AdvanceTableFooter
            rowCount={data.length}
            table
            rowInfo
            navButtons
            rowsPerPageSelection
          />
        </div>
      </AdvanceTableWrapper>
      <div onSubmit={(e) => handleFormSubmit(e)}>
        <button
          className="btn btn-primary w-100 mt-3"
          type="submit"
          disabled={isLoadingTI}
          onClick={handleFormSubmit}
        >
          {isLoadingTI ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default Ticket;

import React, { useEffect, useState } from "react";
import FalconComponentCard from "components/common/FalconComponentCard";
import AdvanceTableWrapper from "components/common/advance-table/AdvanceTableWrapper";
import AdvanceTable from "components/common/advance-table/AdvanceTable";
import AdvanceTableFooter from "components/common/advance-table/AdvanceTableFooter";
import AdvanceTableSearchBox from "components/common/advance-table/AdvanceTableSearchBox";
import { Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Modal from "react-bootstrap/Modal";
import axios from "axios";

const Agents = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const requestData = {
      selected_groups: [],
      period: "D",
      start_date: "2020-03-05T09:47:00.286Z",
      end_date: "2024-03-05T09:47:00.286Z",
    };
    const fetchData = async () => {
      try {
        const response = await axios.post(
          "http://172.16.1.219:8000/dashboard/get_agent_kpis_table",
          requestData
        );
        const formattedData = response.data.map((item) => ({
          ...item,
          productivity: item.productivity.toFixed(2),
          avg_time_to_resolve: item.avg_time_to_resolve.toFixed(2),
          avg_cwt: item.avg_cwt.toFixed(2),
          csat: item.csat.toFixed(2),
          cvr: item.cvr.toFixed(2),
          ssr: item.ssr.toFixed(2),
        }));

        setData(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);
  const columns = [
    {
      Header: "Name",
      accessor: "name",
    },
    {
      Header: "Email",
      accessor: "email",
    },
    {
      Header: "ID",
      accessor: "assignee_id",
    },
    {
      Header: "Productivity",
      accessor: "productivity",
    },
    {
      Header: "CSAT",
      accessor: "csat",
    },
    {
      Header: "CVR",
      accessor: "cvr",
    },
    {
      Header: "SSR",
      accessor: "ssr",
    },
    {
      Header: "Avg. Time to Resolve",
      accessor: "avg_time_to_resolve",
    },
    {
      Header: "Avg. CWT",
      accessor: "avg_cwt",
    },
  ];
  return (
    <div>
      <FalconComponentCard>
        <FalconComponentCard.Header
          title="Agents Tablet"
          light={false}
          className="border-bottom border-200"
        />
        <Row className="mb-3 g-3">
          <Col md={12}>
            <FalconComponentCard noGuttersBottom>
              <FalconComponentCard.Body>
                <>
                  <AdvanceTableWrapper
                    columns={columns}
                    data={data}
                    sortable
                    pagination
                    perPage={10}
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
                </>
              </FalconComponentCard.Body>
            </FalconComponentCard>
          </Col>
        </Row>
      </FalconComponentCard>
    </div>
  );
};

export default Agents;

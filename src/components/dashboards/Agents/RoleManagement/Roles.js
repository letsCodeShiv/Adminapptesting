/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ApiConfig } from "config/ApiConfig";
import { Row, Col } from "react-bootstrap";
import AdvanceTableWrapper from "components/common/advance-table/AdvanceTableWrapper";
import AdvanceTable from "components/common/advance-table/AdvanceTable";
import AdvanceTableFooter from "components/common/advance-table/AdvanceTableFooter";
import AdvanceTableSearchBox from "components/common/advance-table/AdvanceTableSearchBox";

const Teams = () => {
  const [data, setData] = useState([]);

  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      // const config = {
      //   headers: { 'Access-Control-Allow-Origin': '*' },
      //   withCredentials: true
      // };
      const agentData = {
        subdomain: sessionStorage.getItem("subdomain"),
        get_type: "fetch",
      };
      try {
        setIsLoadingRoles(true);
        const response = await axios.post(
          ApiConfig.agentsDetailsRefresh,
          agentData
          // config
        );
        setData(response?.data?.AgentManagement);
      } catch (error) {
        toast.error(error.response?.data?.detail?.masked_error, {
          theme: "colored",
        });
      } finally {
        setIsLoadingRoles(false);
      }
    };

    fetchUserData();
  }, []);

  const columns = [
    {
      accessor: "role",
      Header: "TopCX Role",
      Cell: ({ row }) => <p> {row.original.name} </p>,
    },
    {
      accessor: "description",
      Header: "Description",
      Cell: ({ row }) => <p> {row.original.name} </p>,
    },
    {
      accessor: "assigned_to",
      Header: "Assigned to",
      Cell: ({ row }) => <p> {row.original.role} </p>,
    },
    {
      accessor: "permission",
      Header: "Permission",
      Cell: ({ row }) => <p> {row.original.role} </p>,
    },
  ];
  return (
    <div>
      <AdvanceTableWrapper
        columns={columns}
        data={data}
        sortable
        pagination
        perPage={5}
      >
        <Row className="mb-3">
          <Col xs={12} sm={6} lg={8}>
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
    </div>
  );
};

export default Teams;

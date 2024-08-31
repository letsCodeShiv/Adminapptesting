/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ApiConfig } from "config/ApiConfig";
import { Row, Col, Form, Button } from "react-bootstrap";
import AdvanceTableWrapper from "components/common/advance-table/AdvanceTableWrapper";
import AdvanceTable from "components/common/advance-table/AdvanceTable";
import AdvanceTableFooter from "components/common/advance-table/AdvanceTableFooter";
import AdvanceTableSearchBox from "components/common/advance-table/AdvanceTableSearchBox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Cookies from "js-cookie";

const Teams = () => {
  useEffect(() => {
    // Function to get cookies
    const getCookies = () => {
      const cookies = Cookies.get();
      console.log(cookies);
    };
    getCookies();
  }, []);

  const [data, setData] = useState([]);

  const [isLoadingTeams, setIsLoadingTeams] = useState(false);

  const [zendeskRoles, setZendeskRoles] = useState([]);
  const [filterZendeskRoles, setFilterZendeskRoles] = useState("All");

  const [zendeskGroups, setZendeskGroups] = useState([]);
  const [filterZendeskGroups, setFilterZendeskGroups] = useState("All");

  const [topCXRoles, setTopCXRoles] = useState([]);
  const [filterTopCXRoles, setFilterTopCXRoles] = useState("All");

  const [topCXTeams, setTopCXTeams] = useState([]);
  const [filterTopCXTeams, setFilterTopCXTeams] = useState("All");

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
        setIsLoadingTeams(true);
        const response = await axios.post(
          ApiConfig.agentsDetailsRefresh,
          agentData
          // config
        );
        setData(response?.data?.AgentManagement);

        const zendeskRolesSet = new Set();
        const zendeskGroupsSet = new Set();
        const topCXRolesSet = new Set();
        const topCXTeamsSet = new Set();

        response.data.AgentManagement.forEach((user) => {
          zendeskRolesSet.add(user.role);

          if (user.topcx_team) {
            topCXTeamsSet.add(user.topcx_team);
          }

          user.topcx_roles.forEach((role) => {
            topCXRolesSet.add(role);
          });

          user.groups.forEach((group) => {
            zendeskGroupsSet.add(group);
          });
        });

        setZendeskRoles(Array.from(zendeskRolesSet));
        setZendeskGroups(Array.from(zendeskGroupsSet));
        setTopCXRoles(Array.from(topCXRolesSet));
        setTopCXTeams(Array.from(topCXTeamsSet));
      } catch (error) {
        toast.error(error.response?.data?.detail?.masked_error, {
          theme: "colored",
        });
      } finally {
        setIsLoadingTeams(false);
      }
    };

    fetchUserData();
  }, []);

  const filteredAgents = data.filter((agent) => {
    return filterZendeskRoles === "All" || agent.role === filterZendeskRoles;
  });

  const badgeStyles = [
    "primary",
    "secondary",
    "success",
    "danger",
    "warning",
    "info",
    "light",
    "dark",
  ];

  // Function to map role to a badge style based on the role's hash code
  const getBadgeStyleForRole = (role) => {
    let hash = 0;
    for (let i = 0; i < role.length; i++) {
      hash = role.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % badgeStyles.length;
    return badgeStyles[index];
  };

  const columns = [
    {
      accessor: "team",
      Header: "Team",
      Cell: ({ row }) => <p> {row.original.name} </p>,
    },
    {
      accessor: "description",
      Header: "Description",
      Cell: ({ row }) => <p> {row.original.name} </p>,
    },
    {
      accessor: "members",
      Header: "Members",
      Cell: ({ row }) => <p> {row.original.role} </p>,
    },
    {
      accessor: "topcx_team_lead",
      Header: "TopCX Team Lead",
      Cell: ({ row }) => (
        <p>
          {row.original.topcx_roles.map((role, index) => (
            <span
              key={index}
              className={`badge bg-${getBadgeStyleForRole(role)} me-1`}
            >
              {role.toUpperCase()}
            </span>
          ))}
        </p>
      ),
    },
    {
      accessor: "edit",
      Header: "Edit",
      Cell: () => (
        <button>
          <FontAwesomeIcon icon={"trash"} />
        </button>
      ),
    },
  ];
  return (
    <div>
      <AdvanceTableWrapper
        columns={columns}
        data={filteredAgents}
        sortable
        pagination
        perPage={5}
      >
        <Row className="mb-3">
          <Col xs={12} sm={8} lg={7}>
            <Row>
              <Col xs={12} sm={6} lg={8}>
                <AdvanceTableSearchBox table />
              </Col>
              <Col xs={12} sm={6} lg={4}>
                <Form.Select
                  size="sm"
                  aria-label="Default select example"
                  value={filterZendeskGroups}
                  onChange={(e) => setFilterZendeskGroups(e.target.value)}
                >
                  <option value="All">All Groups</option>
                  {zendeskGroups.map((group, index) => (
                    <option key={index} value={group}>
                      {group}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          </Col>
          <Col xs={12} sm={4} lg={5}>
            <div className="d-flex justify-content-end">
              <Button size="sm" variant="falcon-warning">
                + Create team
              </Button>
            </div>
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
            rowCount={filteredAgents.length}
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

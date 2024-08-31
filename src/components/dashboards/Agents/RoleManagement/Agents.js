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

const Agents = () => {
  const [data, setData] = useState([]);
  const [updatedData, setUpdatedData] = useState([]);

  const [selectedAgents, setSelectedAgents] = useState([]);

  const [zendeskRoles, setZendeskRoles] = useState([]);
  const [filterZendeskRoles, setFilterZendeskRoles] = useState("All");

  const [zendeskGroups, setZendeskGroups] = useState([]);
  const [filterZendeskGroups, setFilterZendeskGroups] = useState("All");

  const [topCXRoles, setTopCXRoles] = useState([]);
  const [filterTopCXRoles, setFilterTopCXRoles] = useState("All");

  const [topCXTeams, setTopCXTeams] = useState([]);
  const [filterTopCXTeams, setFilterTopCXTeams] = useState("All");

  const [isLoadingRefresh, setIsLoadingRefresh] = useState(false);
  const [isLoadingReset, setIsLoadingReset] = useState(false);

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
        const response = await axios.post(
          ApiConfig.agentsDetailsRefresh,
          agentData
          // config
        );
        setData(response?.data?.AgentManagement);
        setUpdatedData(response?.data?.AgentManagement);

        const enabledAgents = [];
        response.data.AgentManagement.forEach((agent) => {
          if (agent.topcx_status) {
            enabledAgents.push(agent);
          }
        });
        setSelectedAgents(enabledAgents);

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
      }
    };

    fetchUserData();
  }, []);

  const handleRefresh = async () => {
    // const config = {
    //   headers: { 'Access-Control-Allow-Origin': '*' },
    //   withCredentials: true
    // };
    const agentData = {
      subdomain: sessionStorage.getItem("subdomain"),
      get_type: "refresh",
    };
    try {
      setIsLoadingRefresh(true);
      const response = await axios.post(
        ApiConfig.agentsDetailsFetch,
        agentData
        // config
      );
      setData(response?.data?.AgentManagement);
      setUpdatedData(response?.data?.AgentManagement);

      const enabledAgents = [];
      response.data.AgentManagement.forEach((agent) => {
        if (agent.topcx_status) {
          enabledAgents.push(agent);
        }
      });
      setSelectedAgents(enabledAgents);

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
      setIsLoadingRefresh(false);
    }
  };

  const filteredAgents = data.filter((agent) => {
    return (
      (filterZendeskRoles === "All" || agent.role === filterZendeskRoles) &&
      (filterZendeskGroups === "All" ||
        agent.groups.some((group) => group === filterZendeskGroups)) &&
      (filterTopCXRoles === "All" ||
        agent.topcx_roles.some((group) => group === filterTopCXRoles)) &&
      (filterTopCXTeams === "All" ||
        agent.topcx_roles.some((group) => group === filterTopCXTeams))
    );
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

  const handleReset = async () => {
    const agentData = {
      subdomain: sessionStorage.getItem("subdomain"),
      get_type: "reset",
    };
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };
    try {
      setIsLoadingReset(true);
      await axios.post(ApiConfig.agentsDetailsSubmit, agentData, config);
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error, {
        theme: "colored",
      });
    } finally {
      setIsLoadingReset(false);
    }
  };

  const columns = [
    {
      accessor: "Status",
      Header: "Status",
      Cell: () => (
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            style={{ minWidth: "2rem" }}
          />
        </div>
      ),
    },
    {
      accessor: "name",
      Header: "Name",
      Cell: ({ row }) => <p> {row.original.name} </p>,
    },
    {
      accessor: "role",
      Header: "Zendesk Role",
      Cell: ({ row }) => <p> {row.original.role} </p>,
    },
    {
      accessor: "groups",
      Header: "Zendesk Groups",
      Cell: ({ row }) => <p> {row.original.groups.join(" | ")} </p>,
    },
    {
      accessor: "topcx_team",
      Header: "TopCX Team",
      Cell: ({ row }) => <p> {row.original.topcx_team} </p>,
    },
    {
      accessor: "topcx_team_lead_of",
      Header: "TopCX Team Lead of",
      Cell: ({ row }) => <p> {row.original.topcx_team_lead_of.join(" | ")} </p>,
    },
    {
      accessor: "topcx_roles",
      Header: "TopCX Role",
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
      accessor: "time_zone",
      Header: "Time Zone",
      Cell: ({ row }) => <p> {row.original.timezone} </p>,
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
        <Row className=" mb-3">
          <Col xs="auto" sm={6} lg={4}>
            <AdvanceTableSearchBox table />
          </Col>
          <Col xs="auto" sm={6} lg={2}>
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
          <Col xs="auto" sm={4} lg={2}>
            <Form.Select
              size="sm"
              aria-label="Default select example"
              value={filterZendeskRoles}
              onChange={(e) => setFilterZendeskRoles(e.target.value)}
            >
              <option value="All">All Roles</option>
              {zendeskRoles.map((role, index) => (
                <option key={index} value={role}>
                  {role}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col xs="auto" sm={4} lg={2}>
            <Form.Select
              size="sm"
              aria-label="Default select example"
              value={filterTopCXRoles}
              onChange={(e) => setFilterTopCXRoles(e.target.value)}
            >
              <option value="All">All TopCx Roles</option>
              {topCXRoles.map((role, index) => (
                <option key={index} value={role}>
                  {role}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col xs="auto" sm={4} lg={2}>
            <Form.Select
              size="sm"
              aria-label="Default select example"
              value={filterTopCXTeams}
              onChange={(e) => setFilterTopCXTeams(e.target.value)}
            >
              <option value="All">All TopCx Teams</option>
              {topCXTeams.map((team, index) => (
                <option key={index} value={team}>
                  {team}
                </option>
              ))}
            </Form.Select>
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

      <div className="d-flex justify-content-end mt-3">
        <Button
          variant="falcon-warning"
          className="me-2 mb-1"
          disabled={isLoadingRefresh}
          onClick={handleRefresh}
        >
          {isLoadingRefresh ? "Loading..." : "Fetch"}
        </Button>
        <Button
          variant="falcon-danger"
          className="me-2 mb-1"
          disabled={isLoadingReset}
          onClick={handleReset}
        >
          {isLoadingReset ? "Loading..." : "Reset"}
        </Button>
      </div>
    </div>
  );
};

export default Agents;

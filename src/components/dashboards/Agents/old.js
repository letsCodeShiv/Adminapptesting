/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import FalconComponentCard from "components/common/FalconComponentCard";
import AdvanceTableWrapper from "components/common/advance-table/AdvanceTableWrapper";
import AdvanceTable from "components/common/advance-table/AdvanceTable";
import AdvanceTableFooter from "components/common/advance-table/AdvanceTableFooter";
import AdvanceTableSearchBox from "components/common/advance-table/AdvanceTableSearchBox";
import axios from "axios";
import { toast } from "react-toastify";

import { Row, Col, Form, Button, Card } from "react-bootstrap";
import { ApiConfig } from "config/ApiConfig";

const Agents = () => {
  const [data, setData] = useState([]);
  const [updatedData, setUpdatedData] = useState([]);

  const [allowedAgentCount, setAllowedAgentCount] = useState("");
  const [selectedAgents, setSelectedAgents] = useState([]);

  const [roles, setRoles] = useState([]);
  const [roleFilter, setRoleFilter] = useState("All");
  const [groups, setGroups] = useState([]);
  const [groupFilter, setGroupFilter] = useState("All");

  const [isLoadingRefresh, setIsLoadingRefresh] = useState(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const config = {
        headers: { "Access-Control-Allow-Origin": "*" },
        withCredentials: true,
      };
      try {
        const response = await axios.get(ApiConfig.agentsDetailsFetch, config);
        console.log(response);

        setAllowedAgentCount(
          response.data.topcx_subscription.limit_allowed_agents
        );
        setData(response.data.org_agent_details);
        setUpdatedData(response.data.org_agent_details);

        const enabledAgents = [];
        response.data.org_agent_details.forEach((agent) => {
          if (agent.TopCX_Status) {
            enabledAgents.push(agent);
          }
        });

        setSelectedAgents(enabledAgents);

        const rolesSet = new Set();
        const groupsSet = new Set();

        response.data.org_agent_details.forEach((user) => {
          rolesSet.add(user.role);

          user.groups.forEach((group) => {
            groupsSet.add(group);
          });
        });

        setRoles(Array.from(rolesSet));
        setGroups(Array.from(groupsSet));
      } catch (error) {
        toast.error(error.response?.data?.detail?.masked_error, {
          theme: "colored",
        });
      }
    };

    fetchUserData();
  }, []);

  const handleRefresh = async () => {
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };
    try {
      setIsLoadingRefresh(true);
      const response = await axios.get(ApiConfig.agentsDetailsFetch, config);
      console.log(response);

      setAllowedAgentCount(
        response.data.topcx_subscription.limit_allowed_agents
      );
      setData(response.data.org_agent_details);
      setUpdatedData(response.data.org_agent_details);

      const enabledAgents = [];
      response.data.org_agent_details.forEach((agent) => {
        if (agent.TopCX_Status) {
          enabledAgents.push(agent);
        }
      });

      setSelectedAgents(enabledAgents);

      const rolesSet = new Set();
      const groupsSet = new Set();

      response.data.org_agent_details.forEach((user) => {
        rolesSet.add(user.role);

        user.groups.forEach((group) => {
          groupsSet.add(group);
        });
      });

      setRoles(Array.from(rolesSet));
      setGroups(Array.from(groupsSet));
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
      (roleFilter === "All" || agent.role === roleFilter) &&
      (groupFilter === "All" ||
        agent.groups.some((group) => group === groupFilter))
    );
  });

  const handleCheckboxChange = (user) => {
    const userIndex = data.findIndex((item) => item.email === user.email);
    if (userIndex !== -1) {
      const updatedUserDetails = data.map((item, index) =>
        index === userIndex
          ? { ...item, topcx_status: !item.topcx_status }
          : item
      );
      if (updatedUserDetails[userIndex].topcx_status) {
        setSelectedAgents([...selectedAgents, updatedUserDetails[userIndex]]);
      } else {
        setSelectedAgents(
          selectedAgents.filter(
            (selectedAgent) => selectedAgent.email !== user.email
          )
        );
      }
      setUpdatedData(updatedUserDetails);
    }
  };

  function formatTimeZone(timeZoneString) {
    const inputDate = new Date(timeZoneString);
    const formattedDate = `${String(inputDate.getUTCDate()).padStart(
      2,
      "0"
    )}-${String(inputDate.getUTCMonth() + 1).padStart(
      2,
      "0"
    )}-${inputDate.getUTCFullYear()} ${String(inputDate.getUTCHours()).padStart(
      2,
      "0"
    )}:${String(inputDate.getUTCMinutes()).padStart(2, "0")}`;
    return formattedDate;
  }

  const handleSubmit = async () => {
    const agentData = {
      enabledUsers: data,
    };
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };
    try {
      setIsLoadingSubmit(true);
      await axios.post(ApiConfig.agentsDetailsSubmit, agentData, config);
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error, {
        theme: "colored",
      });
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  const columns = [
    {
      accessor: "name",
      Header: "Name",
      Cell: ({ row }) => <p> {row.original.name} </p>,
    },
    {
      accessor: "role",
      Header: "Role",
      Cell: ({ row }) => <p> {row.original.role} </p>,
    },
    {
      accessor: "last_login_at",
      Header: "Last Login",
      Cell: ({ row }) => <p> {formatTimeZone(row.original.last_login_at)} </p>,
    },
    {
      accessor: "time_zone",
      Header: "Time Zone",
      Cell: ({ row }) => <p> {row.original.time_zone} </p>,
    },
    {
      accessor: "groups",
      Header: "Groups",
      Cell: ({ row }) => <p> {row.original.groups.join(" | ")} </p>,
    },

    {
      accessor: "Status",
      Header: "Status",
      Cell: ({ row }) => (
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            disabled={
              !updatedData.find((user) => user.email === row.original.email)
                ?.topcx_status && selectedAgents.length >= allowedAgentCount
            }
            checked={
              !!updatedData.find((user) => user.email === row.original.email)
                ?.topcx_status
            }
            onChange={() => handleCheckboxChange(row.original)}
            style={{ minWidth: "2rem" }}
          />
        </div>
      ),
    },
  ];
  return (
    <div>
      <FalconComponentCard>
        <FalconComponentCard.Header
          title="Agents Table"
          light={false}
          className="border-bottom border-200"
        />
        <FalconComponentCard.Body noInline noLight>
          <AdvanceTableWrapper
            columns={columns}
            data={filteredAgents}
            sortable
            pagination
            perPage={10}
          >
            <Row className=" mb-3">
              <Col xs="auto" sm={6} lg={5}>
                <AdvanceTableSearchBox table />
              </Col>
              <Col xs="auto" sm={6} lg={3}>
                <Form.Select
                  size="sm"
                  aria-label="Default select example"
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                >
                  <option value="All">All Groups</option>
                  {groups.map((group, index) => (
                    <option key={index} value={group}>
                      {group}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs="auto" sm={6} lg={3}>
                <Form.Select
                  size="sm"
                  aria-label="Default select example"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="All">All Roles</option>
                  {roles.map((role, index) => (
                    <option key={index} value={role}>
                      {role}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs="auto" sm={6} lg={1}>
                <Card>
                  <Card.Body className="text-center p-1">
                    {selectedAgents?.length}&nbsp;/&nbsp;{allowedAgentCount}
                  </Card.Body>
                </Card>
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
        </FalconComponentCard.Body>
      </FalconComponentCard>
      <div className="d-flex justify-content-end">
        <Button
          variant="falcon-warning"
          className="me-2 mb-1"
          disabled={isLoadingRefresh}
          onClick={handleRefresh}
        >
          {isLoadingRefresh ? "Loading..." : "Fetch"}
        </Button>
        <Button
          variant="falcon-success"
          className="me-2 mb-1"
          disabled={isLoadingSubmit}
          onClick={handleSubmit}
        >
          {isLoadingSubmit ? "Loading..." : "Submit"}
        </Button>
      </div>
    </div>
  );
};

export default Agents;

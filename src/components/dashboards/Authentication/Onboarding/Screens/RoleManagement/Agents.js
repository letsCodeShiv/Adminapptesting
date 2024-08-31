import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ApiConfig } from "config/ApiConfig";
import { Row, Col, Button, Modal, CloseButton, Form } from "react-bootstrap";
import AdvanceTableWrapper from "components/common/advance-table/AdvanceTableWrapper";
import AdvanceTable from "components/common/advance-table/AdvanceTable";
import AdvanceTableFooter from "components/common/advance-table/AdvanceTableFooter";
import AdvanceTableSearchBox from "components/common/advance-table/AdvanceTableSearchBox";

const Agents = () => {
  // Modal
  const [editTeamModalShow, setEditTeamModalShow] = useState(false);
  const [editTeamLeadModalShow, setEditTeamLeadModalShow] = useState(false);
  const [editRoleModalShow, setEditRoleModalShow] = useState(false);

  const [agentData, setAgentData] = useState([]);

  const [roleData, setRoleData] = useState([]);
  const [role, setRole] = useState([]);
  const [teamData, setTeamData] = useState([]);
  const [team, setTeam] = useState([]);

  const [selectedAgent, setSelectedAgent] = useState({});

  const [topCXRoles, setTopCXRoles] = useState([]);
  const [filterTopCXRoles, setFilterTopCXRoles] = useState("All");

  const [topCXTeams, setTopCXTeams] = useState([]);
  const [filterTopCXTeams, setFilterTopCXTeams] = useState("All");

  const [isLoadingUpdateTeam, setIsLoadingUpdateTeam] = useState(false);
  const [isLoadingUnassigneTeam, setIsLoadingUnassigneTeam] = useState(false);
  const [isLoadingUpdateTeamLead, setIsLoadingUpdateTeamLead] = useState(false);
  const [isLoadingUpdateRole, setIsLoadingUpdateRole] = useState(false);

  const fetchUserData = async () => {
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };
    const agentData = {
      get_type: "fetch",
    };
    try {
      const response = await axios.post(
        ApiConfig.agentsDetailsRefresh,
        agentData,
        config
      );
      setAgentData(response?.data?.AgentManagement);
      const mappedRoleData = Object.entries(
        response?.data?.RoleManagement?.topcx_roles || {}
      ).map(([key, value]) => {
        return {
          role: key,
          description: value.desc,
          assigned_to: value.members,
          origin: value.origin,
          features: value.features,
        };
      });
      setRoleData(mappedRoleData);
      const mappedTeamData = Object.entries(
        response?.data?.RoleManagement?.topcx_teams || {}
      ).map(([key, value]) => ({
        team: key,
        description: value.desc,
        members: value.members,
        lead: value.lead,
      }));
      setTeamData(mappedTeamData);

      const topCXRolesSet = new Set();
      const topCXTeamsSet = new Set();

      response.data.AgentManagement.forEach((user) => {
        if (user.topcx_team) {
          topCXTeamsSet.add(user.topcx_team);
        }

        user.topcx_roles.forEach((role) => {
          topCXRolesSet.add(role);
        });
      });
      setTopCXRoles(Array.from(topCXRolesSet));
      setTopCXTeams(Array.from(topCXTeamsSet));
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error, {
        theme: "colored",
      });
    }
  };
  useEffect(() => {
    fetchUserData();
  }, []);

  const filteredAgents = agentData.filter((agent) => {
    return (
      (filterTopCXRoles === "All" ||
        agent.topcx_roles.some((group) => group === filterTopCXRoles)) &&
      (filterTopCXTeams === "All" ||
        agent.topcx_roles.some((group) => group === filterTopCXTeams))
    );
  });

  const agents = [
    {
      accessor: "name",
      Header: "Name",
      Cell: ({ row }) => (
        <Form.Check
          type="switch"
          name="teamLeadSelection"
          id={`switch-${row.original.id}`}
          className="my-auto"
          label={<p className="m-0 ms-2">{row.original.name}</p>}
          checked={row.original.topcx_status}
        />
      ),
    },
    {
      accessor: "topcx_team",
      Header: "TopCX Team",
      Cell: ({ row }) => (
        <Button
          variant="link"
          onClick={() => {
            setSelectedAgent(row.original);
            setEditTeamModalShow(true);
          }}
          disabled={teamData.length <= 0}
        >
          {teamData?.length <= 0
            ? "No Team"
            : row.original.topcx_team
            ? row.original.topcx_team
            : "+"}
        </Button>
      ),
    },
    {
      accessor: "topcx_team_lead_of",
      Header: "TopCX Team Lead of",
      Cell: ({ row }) => (
        <Button
          variant="link"
          onClick={() => {
            setSelectedAgent(row.original);
            setTeam(
              teamData.map((team) => {
                const isLead = row?.original?.topcx_team_lead_of?.some(
                  (leadMember) => leadMember === team.team
                );
                return {
                  ...team,
                  isChecked: isLead,
                };
              })
            );

            setEditTeamLeadModalShow(true);
          }}
          disabled={teamData.length <= 0}
        >
          {teamData?.length <= 0
            ? "No Team"
            : row?.original?.topcx_team_lead_of?.length > 0
            ? row?.original?.topcx_team_lead_of?.length
            : "+"}
        </Button>
      ),
    },
    {
      accessor: "topcx_roles",
      Header: "TopCX Role",
      Cell: ({ row }) => (
        <Button
          variant="link"
          onClick={() => {
            setSelectedAgent(row.original);
            setRole(
              roleData.map((role) => {
                const isRole = row?.original?.topcx_roles?.some(
                  (assignedRole) => assignedRole === role.role
                );
                return {
                  ...role,
                  isChecked: isRole,
                };
              })
            );
            setEditRoleModalShow(true);
          }}
        >
          {row.original.topcx_roles.length > 0
            ? row.original.topcx_roles.length
            : "+"}
        </Button>
      ),
    },
  ];

  const updateTeam = (team) => {
    setSelectedAgent((previous) => ({ ...previous, topcx_team: team.team }));
  };
  const submitTeam = async (isChecked) => {
    const apiData = {
      team_data: [
        {
          assignee_email: selectedAgent.email,
          assignee_name: selectedAgent.name,
          assignee_id: selectedAgent.id,
          assigned_team: selectedAgent.topcx_team,
          assignment: isChecked,
        },
      ],
    };

    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };

    try {
      if (isChecked) {
        setIsLoadingUpdateTeam(true);
      } else {
        setIsLoadingUnassigneTeam(true);
      }
      await axios.post(ApiConfig.agentsDetailsTeam, apiData, config);
      toast.success("Team lead updated successfully!", {
        theme: "colored",
      });
      setEditTeamModalShow(false);
      fetchUserData();
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error, {
        theme: "colored",
      });
    } finally {
      setIsLoadingUnassigneTeam(false);
      setIsLoadingUpdateTeam(false);
    }
  };
  const teams = [
    {
      accessor: "team",
      Header: "Team",
      Cell: ({ row }) => (
        <Form.Check
          type="radio"
          name="teamLeadSelection"
          id={`radio-${row.original.id}`}
          className="my-auto"
          label={<p className="m-0 ms-2">{row.original.team}</p>}
          checked={selectedAgent.topcx_team === row.original.team}
          onChange={() => updateTeam(row.original)}
        />
      ),
    },
    {
      accessor: "description",
      Header: "Description",
      Cell: ({ value }) => (
        <p className="m-0 text-wrap" style={{ maxWidth: "10rem" }}>
          {value}
        </p>
      ),
    },
    {
      accessor: "members",
      Header: "Members",
      Cell: ({ row }) => <p className="m-0">{row.original.members.length}</p>,
    },
    {
      accessor: "lead",
      Header: "TopCX Team Lead",
      Cell: ({ row }) => <p className="m-0">{row.original?.lead?.length}</p>,
    },
  ];

  const updateTeamLead = (selectedTeam, isChecked) => {
    setTeam((prevTeams) =>
      prevTeams.map((team) => {
        if (team.team === selectedTeam.team) {
          return { ...team, isChecked };
        }
        return team;
      })
    );
  };
  const submitTeamLead = async () => {
    const agentsData = team.map((team) => ({
      email: selectedAgent.email,
      name: selectedAgent.name,
      id: selectedAgent.id,
      assigned_team_lead_of: team.team,
      isChecked: team.isChecked,
    }));

    const apiData = {
      assignee_data: agentsData,
    };

    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };

    try {
      setIsLoadingUpdateTeamLead(true);

      await axios.post(ApiConfig.agentsDetailsTeamLead, apiData, config);
      toast.success("Team lead updated successfully!", {
        theme: "colored",
      });
      setEditTeamLeadModalShow(false);
      fetchUserData();
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error, {
        theme: "colored",
      });
    } finally {
      setIsLoadingUpdateTeamLead(false);
    }
  };
  const teamLead = [
    {
      accessor: "team",
      Header: "Team",
      Cell: ({ row }) => (
        <Form.Check
          type="checkbox"
          name="teamLeadSelection"
          id={`checkbox-${row.original.id}`}
          className="my-auto"
          label={<p className="m-0 ms-2">{row.original.team}</p>}
          checked={
            team.find((team) => team.team === row.original.team).isChecked
          }
          onChange={(e) => updateTeamLead(row.original, e.target.checked)}
        />
      ),
    },
    {
      accessor: "description",
      Header: "Description",
      Cell: ({ value }) => (
        <p className="m-0 text-wrap" style={{ maxWidth: "10rem" }}>
          {value}
        </p>
      ),
    },
    {
      accessor: "members",
      Header: "Members",
      Cell: ({ row }) => (
        <p className="m-0">
          {row.original.members.map((member) => member.name).join(", ")}
        </p>
      ),
    },
    {
      accessor: "lead",
      Header: "TopCX Team Lead",
      Cell: ({ row }) => <p className="m-0">{row.original?.lead?.name}</p>,
    },
  ];

  const updateRole = (selectedRole, isChecked) => {
    setRole((prevRole) =>
      prevRole.map((role) => {
        if (role.role === selectedRole.role) {
          return { ...role, isChecked };
        }
        return role;
      })
    );
  };
  const submitRole = async () => {
    const roleData = role.map((role) => ({
      assignee_email: selectedAgent.email,
      assignee_name: selectedAgent.name,
      assignee_id: selectedAgent.id,
      assignee_status: selectedAgent.topcx_status,
      assigned_role: role.role,
      isChecked: role.isChecked,
    }));

    const apiData = {
      assignee_data: roleData,
    };

    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };

    try {
      setIsLoadingUpdateRole(true);
      await axios.post(ApiConfig.agentsDetailsRole, apiData, config);
      toast.success("Team lead updated successfully!", {
        theme: "colored",
      });
      setEditRoleModalShow(false);
      fetchUserData();
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error, {
        theme: "colored",
      });
    } finally {
      setIsLoadingUpdateRole(false);
    }
  };

  const roles = [
    {
      accessor: "role",
      Header: "Role",
      Cell: ({ row }) => (
        <Form.Check
          type="checkbox"
          name="teamLeadSelection"
          id={`checkbox-${row.original.role}`}
          className="my-auto"
          label={<p className="m-0 ms-2">{row.original.role}</p>}
          checked={
            role.find((role) => role.role === row.original.role).isChecked
          }
          onChange={(e) => updateRole(row.original, e.target.checked)}
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
  ];

  return (
    <>
      <AdvanceTableWrapper
        columns={agents}
        data={filteredAgents}
        sortable
        pagination
        perPage={5}
      >
        <Row className=" mb-3">
          <Col xs="auto" sm={6} lg={4}>
            <AdvanceTableSearchBox table />
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
      <Modal
        show={editTeamModalShow}
        onHide={() => setEditTeamModalShow(false)}
        backdrop="static"
        keyboard={false}
        size="lg"
        centered
      >
        <Modal.Body>
          <div className="d-flex justify-content-between mb-3">
            <Modal.Title>Edit team for {selectedAgent.name} </Modal.Title>
            <CloseButton
              onClick={() => {
                setEditTeamModalShow(false);
              }}
            />
          </div>
          <AdvanceTableWrapper
            columns={teams}
            data={teamData}
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
            <div className="mt-3">
              <AdvanceTableFooter
                rowCount={teamData.length}
                table
                rowInfo
                navButtons
                rowsPerPageSelection
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
              onClick={() => submitTeam(true)}
              disabled={isLoadingUpdateTeam || isLoadingUnassigneTeam}
            >
              {isLoadingUpdateTeam ? "submitting..." : "submit"}
            </Button>
            <Button
              variant="falcon-danger"
              type="submit"
              onClick={() => submitTeam(false)}
              disabled={
                isLoadingUnassigneTeam ||
                isLoadingUpdateTeam ||
                !selectedAgent.topcx_team
              }
            >
              {isLoadingUnassigneTeam ? "Unassigning..." : "Unassigne"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={editTeamLeadModalShow}
        onHide={() => setEditTeamLeadModalShow(false)}
        backdrop="static"
        keyboard={false}
        size="lg"
        centered
      >
        <Modal.Body>
          <div className="d-flex justify-content-between mb-3">
            <Modal.Title>Edit teamlead for {selectedAgent.name} </Modal.Title>
            <CloseButton
              onClick={() => {
                setEditTeamLeadModalShow(false);
                // fetchRoleData();
              }}
            />
          </div>
          <AdvanceTableWrapper
            columns={teamLead}
            data={teamData}
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
            <div className="mt-3">
              <AdvanceTableFooter
                rowCount={teamData.length}
                table
                rowInfo
                navButtons
                rowsPerPageSelection
              />
            </div>
            <div
              className="btn-group mx-auto d-flex justify-content-center w-50 mt-4 mb-3"
              role="group"
              aria-label="Basic mixed styles example"
            >
              <Button
                variant="falcon-success"
                type="submit"
                onClick={submitTeamLead}
                disabled={isLoadingUpdateTeamLead}
              >
                {isLoadingUpdateTeamLead ? "submitting..." : "submit"}
              </Button>
            </div>
          </AdvanceTableWrapper>
        </Modal.Body>
      </Modal>
      <Modal
        show={editRoleModalShow}
        onHide={() => setEditRoleModalShow(false)}
        backdrop="static"
        keyboard={false}
        size="lg"
        centered
      >
        <Modal.Body>
          <div className="d-flex justify-content-between mb-3">
            <Modal.Title>Edit permissions for {selectedAgent.name}</Modal.Title>
            <CloseButton
              onClick={() => {
                setEditRoleModalShow(false);
              }}
            />
          </div>
          <AdvanceTableWrapper
            columns={roles}
            data={roleData}
            sortable
            pagination
            perPage={5}
          >
            <Row className="mb-3">
              <Col xs={12} sm={8} lg={7}>
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
                rowCount={roleData.length}
                table
                rowInfo
                navButtons
                rowsPerPageSelection
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
              onClick={() => submitRole()}
              disabled={isLoadingUpdateRole}
            >
              {isLoadingUpdateRole ? "submitting..." : "submit"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Agents;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ApiConfig } from "config/ApiConfig";
import { Row, Col, Button, Modal, CloseButton, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import AdvanceTableWrapper from "components/common/advance-table/AdvanceTableWrapper";
import AdvanceTable from "components/common/advance-table/AdvanceTable";
import AdvanceTableFooter from "components/common/advance-table/AdvanceTableFooter";
import AdvanceTableSearchBox from "components/common/advance-table/AdvanceTableSearchBox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Teams = () => {
  const {
    register,
    watch,
    formState: { errors },
    trigger,
    reset,
  } = useForm();

  // Modal
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showTeamLeadModal, setShowTeamLeadModal] = useState(false);
  const [showTeamMemberModal, setShowTeamMemberModal] = useState(false);
  const [teamData, setTeamData] = useState([]);
  const [agentData, setAgentData] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState({});

  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isLoadingTeamCreate, setIsLoadingTeamCreate] = useState(false);
  const [isLoadingUpdateTeamLead, setIsLoadingUpdateTeamLead] = useState(false);
  const [isLoadingUpdateTeam, setIsLoadingUpdateTeam] = useState(false);

  const fetchTeamData = async () => {
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };
    const agentData = {
      get_type: "fetch",
    };
    try {
      setIsLoadingTeams(true);
      const response = await axios.post(
        ApiConfig.agentsDetailsRefresh,
        agentData,
        config
      );
      // Mapping the API response to the table format
      const mappedData = Object.entries(
        response?.data?.RoleManagement?.topcx_teams || {}
      ).map(([key, value]) => ({
        team: key,
        description: value.desc,
        members: value.members,
        lead: value.lead,
      }));
      setTeamData(mappedData);
      setAgentData(response?.data?.AgentManagement);
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error, {
        theme: "colored",
      });
    } finally {
      setIsLoadingTeams(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, []);

  const handleDeleteTeam = async (data) => {
    const deleteTeamAPIData = {
      update_team: data.team,
      delete_team: true,
    };
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };
    try {
      await axios.post(ApiConfig.deleteTeam, deleteTeamAPIData, config);
      toast.success("Team deleted successfully!", {
        theme: "colored",
      });
      fetchTeamData();
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error, {
        theme: "colored",
      });
    }
  };

  const handleCreateTeam = async () => {
    const name = await trigger("name");
    const desc = await trigger("desc");
    if (name && desc) {
      const createTeamAPIData = {
        team_name: watch("name"),
        team_desc: watch("desc"),
      };
      const config = {
        headers: { "Access-Control-Allow-Origin": "*" },
        withCredentials: true,
      };
      try {
        setIsLoadingTeamCreate(false);
        await axios.post(ApiConfig.createTeam, createTeamAPIData, config);
        toast.success("Team created successfully", {
          theme: "colored",
        });
        setShowTeamModal(false);
        fetchTeamData();
        reset({ name: "", desc: "" });
      } catch (error) {
        toast.error(error.response?.data?.detail?.masked_error, {
          theme: "colored",
        });
      } finally {
        setIsLoadingTeamCreate(false);
      }
    }
  };

  const columns = [
    {
      accessor: "team",
      Header: "Team",
      Cell: ({ value }) => <p className="m-0">{value}</p>,
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
        <Button
          variant="link"
          onClick={() => {
            setSelectedTeam(row.original);
            setAgents(
              agentData.map((agent) => {
                const isMember = row.original.members.some(
                  (member) => member.id === agent.id
                );
                return {
                  ...agent,
                  isChecked: isMember,
                };
              })
            );
            setShowTeamMemberModal(true);
          }}
        >
          {row.original?.members ? row.original?.members.length : "+"}
        </Button>
      ),
    },
    {
      accessor: "lead",
      Header: "TopCX Team Lead",
      Cell: ({ row }) => (
        <Button
          variant="link"
          onClick={() => {
            setSelectedTeam(row.original);
            setAgents(
              agentData.map((agent) => {
                const isTeamLead = row.original.lead.some(
                  (member) => member.id === agent.id
                );
                return {
                  ...agent,
                  isChecked: isTeamLead,
                };
              })
            );
            setShowTeamLeadModal(true);
          }}
        >
          {row.original?.lead.length > 0 ? row.original?.lead.length : "+"}
        </Button>
      ),
    },
    {
      accessor: "edit",
      Header: "Edit",
      Cell: ({ row }) => (
        <Button
          variant="link"
          className="text-secondary m-0 p-0"
          onClick={() => handleDeleteTeam(row.original)}
        >
          <FontAwesomeIcon icon={"trash"} />
        </Button>
      ),
    },
  ];

  const updateTeamLead = (selectedAgent, isChecked) => {
    setAgents((prevAgents) =>
      prevAgents.map((agent) => {
        if (agent.id === selectedAgent.id) {
          return { ...agent, isChecked };
        }
        return agent;
      })
    );
  };

  const submitTeamLead = async () => {
    const agentsData = agents.map((agent) => ({
      email: agent.email,
      name: agent.name,
      id: agent.id,
      assigned_team_lead_of: selectedTeam.team,
      isChecked: agent.isChecked,
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
      await axios.post(ApiConfig.updateTeamLead, apiData, config);
      toast.success("Team lead updated successfully!", {
        theme: "colored",
      });
      setShowTeamLeadModal(false);
      fetchTeamData();
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error, {
        theme: "colored",
      });
    } finally {
      setIsLoadingUpdateTeamLead(false);
    }
  };

  const teamLeadColumns = [
    {
      Header: "Name",
      accessor: "name",
      Cell: ({ row }) => (
        <Form.Check
          type="checkbox"
          name="teamLeadSelection"
          id={`checkbox-${row.original.id}`}
          className="my-auto"
          label={<p className="m-0 ms-2">{row.original.name}</p>}
          checked={
            agents.find((agent) => agent.id === row.original.id).isChecked
          }
          onChange={(e) => updateTeamLead(row.original, e.target.checked)}
        />
      ),
    },
    {
      Header: "TopCX Roles",
      accessor: "topcx_roles",
      Cell: ({ value }) =>
        value && value.length > 0 ? value.join(", ") : "None",
    },
    {
      Header: "TopCX Status",
      accessor: "topcx_status",
      Cell: ({ value }) => (value ? "Active" : "Inactive"),
    },
  ];

  const updateTeam = (selectedAgent, isChecked) => {
    setAgents((prevAgents) =>
      prevAgents.map((agent) => {
        if (agent.id === selectedAgent.id) {
          return { ...agent, isChecked };
        } else {
        }
        return agent;
      })
    );
  };

  const submitTeam = async () => {
    const agentsData = agents.map((agent) => ({
      assignee_email: agent.email,
      assignee_name: agent.name,
      assignee_id: agent.id,
      assigned_team: selectedTeam.team,
      assignment: agent.isChecked,
    }));
    const apiData = {
      team_data: agentsData,
    };

    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };

    try {
      setIsLoadingUpdateTeam(true);
      await axios.post(ApiConfig.addTeamMember, apiData, config);
      toast.success("Team lead updated successfully!", {
        theme: "colored",
      });
      setShowTeamMemberModal(false);
      fetchTeamData();
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error, {
        theme: "colored",
      });
    } finally {
      setIsLoadingUpdateTeam(false);
    }
  };
  const teamMemberColumns = [
    {
      Header: "Name",
      accessor: "name",
      Cell: ({ row }) => (
        <Form.Check
          type="checkbox"
          name="teamLeadSelection"
          id={`checkbox-${row.original.id}`}
          className="my-auto"
          label={<p className="m-0 ms-2">{row.original.name}</p>}
          disabled={
            agents.find((agent) => agent.id === row.original.id).topcx_team &&
            agents.find((agent) => agent.id === row.original.id).topcx_team !==
              selectedTeam.team
          }
          checked={
            agents.find((agent) => agent.id === row.original.id).isChecked
          }
          onChange={(e) => updateTeam(row.original, e.target.checked)}
        />
      ),
    },
    {
      Header: "TopCX Roles",
      accessor: "topcx_roles",
      Cell: ({ value }) =>
        value && value.length > 0 ? value.join(", ") : "None",
    },
    {
      Header: "TopCX Status",
      accessor: "topcx_status",
      Cell: ({ value }) => (value ? "Active" : "Inactive"),
    },
  ];
  return (
    <>
      {isLoadingTeams ? (
        <div className="text-center my-2">
          <div className="lds-hourglass"></div>
        </div>
      ) : (
        <AdvanceTableWrapper
          columns={columns}
          data={teamData}
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
              </Row>
            </Col>
            <Col xs={12} sm={4} lg={5}>
              <div className="d-flex justify-content-end">
                <Button
                  size="sm"
                  variant="falcon-warning"
                  onClick={() => setShowTeamModal(true)}
                >
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
              rowCount={teamData.length}
              table
              rowInfo
              navButtons
              rowsPerPageSelection
            />
          </div>
        </AdvanceTableWrapper>
      )}
      <Modal
        show={showTeamModal}
        onHide={() => setShowTeamModal(false)}
        backdrop="static"
        keyboard={false}
        size="lg"
        centered
      >
        <Modal.Body>
          <div className="d-flex justify-content-end">
            <CloseButton
              onClick={() => {
                setShowTeamModal(false);
                reset({ name: "", desc: "" });
              }}
            />
          </div>
          <h3 className="text-center">Create new team</h3>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Name"
              {...register("name", {
                required: "Name field is required",
                pattern: {
                  value: /^[a-zA-ZÀ-ÿ0-9\s'-]{3,}$/,
                  message: "Name must be valid",
                },
              })}
              isValid={errors.name}
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name?.message}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="text"
              placeholder="Description"
              {...register("desc", {
                required: "Description field is required",
                pattern: {
                  value: /^[a-zA-ZÀ-ÿ0-9\s',._-]{3,}$/,
                  message: "Description must be valid",
                },
              })}
              isValid={errors.desc}
              isInvalid={!!errors.desc}
            />
            <Form.Control.Feedback type="invalid">
              {errors.desc?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <div
            className="btn-group mx-auto d-flex justify-content-center w-50 mt-4 mb-3"
            role="group"
            aria-label="Basic mixed styles example"
          >
            <Button
              variant="falcon-success"
              type="submit"
              onClick={handleCreateTeam}
            >
              {isLoadingTeamCreate ? "submitting..." : "submit"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={showTeamLeadModal}
        onHide={() => setShowTeamLeadModal(false)}
        backdrop="static"
        keyboard={false}
        size="lg"
        centered
      >
        <Modal.Body>
          <div className="d-flex justify-content-between mb-3">
            <Modal.Title>Edit Team Lead for {selectedTeam?.team}</Modal.Title>
            <CloseButton
              onClick={() => {
                setShowTeamLeadModal(false);
              }}
            />
          </div>
          <AdvanceTableWrapper
            columns={teamLeadColumns}
            data={agentData}
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
                rowCount={agentData.length}
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
              type="submit"
              onClick={submitTeamLead}
              disabled={isLoadingUpdateTeamLead}
            >
              {isLoadingUpdateTeamLead ? "submitting..." : "submit"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={showTeamMemberModal}
        onHide={() => setShowTeamMemberModal(false)}
        backdrop="static"
        keyboard={false}
        size="lg"
        centered
      >
        <Modal.Body>
          <div className="d-flex justify-content-between mb-3">
            <Modal.Title>Edit Team for {selectedTeam?.team}</Modal.Title>
            <CloseButton
              onClick={() => {
                setShowTeamMemberModal(false);
              }}
            />
          </div>
          <AdvanceTableWrapper
            columns={teamMemberColumns}
            data={agentData}
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
                rowCount={agentData.length}
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
              type="submit"
              onClick={submitTeam}
              disabled={isLoadingUpdateTeam}
            >
              {isLoadingUpdateTeam ? "submitting..." : "submit"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Teams;

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ApiConfig } from "config/ApiConfig";
import {
  Row,
  Col,
  Button,
  Modal,
  CloseButton,
  Form,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import { useForm } from "react-hook-form";
import AdvanceTableWrapper from "components/common/advance-table/AdvanceTableWrapper";
import AdvanceTable from "components/common/advance-table/AdvanceTable";
import AdvanceTableFooter from "components/common/advance-table/AdvanceTableFooter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import usePagination from "./advance-table/usePagination";
import Loader from "components/Loader/Loader";

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
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);

  const [teamData, setTeamData] = useState([]);
  const [agentData, setAgentData] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState({});
  const [deleteTeam, setDeleteTeam] = useState({});

  const [teamMembersChanged, setTeamMembersChanged] = useState(false);
  const [teamLeadsChanged, setTeamLeadsChanged] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchTeamlead, setSearchTeamlead] = useState("");
  const [searchMember, setSearchMember] = useState("");

  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isLoadingTeamCreate, setIsLoadingTeamCreate] = useState(false);
  const [isLoadingUpdateTeam, setIsLoadingUpdateTeam] = useState(false);
  const [isLoadingDeleteTeam, setIsLoadingDeleteTeam] = useState(false);
  const [isLoadingUpdateTeamLead, setIsLoadingUpdateTeamLead] = useState(false);

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
      toast.error(error.response?.data?.detail?.masked_error);
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
      setIsLoadingDeleteTeam(true);
      await axios.post(ApiConfig.deleteTeam, deleteTeamAPIData, config);
      const updatedTeamData = teamData.filter(
        (team) => team.team !== data.team
      );
      setTeamData(updatedTeamData);
      toast.success("Team deleted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error);
    } finally {
      setIsLoadingDeleteTeam(false);
      setShowConfirmDeleteModal(false);
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
        setIsLoadingTeamCreate(true);
        await axios.post(ApiConfig.createTeam, createTeamAPIData, config);
        const newTeam = {
          team: watch("name"),
          description: watch("desc"),
          members: [],
          lead: [],
        };
        setTeamData((teams) => [...teams, newTeam]);
        toast.success("Team created successfully");
        reset({ name: "", desc: "" });
      } catch (error) {
        toast.error(error.response?.data?.detail?.masked_error);
      } finally {
        setIsLoadingTeamCreate(false);
        setShowTeamModal(false);
      }
    }
  };

  // Filtering team data based on the search term
  const filteredTeamData = useMemo(() => {
    return teamData.filter((team) =>
      team.team.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [teamData, searchTerm]);

  const teamsColumn = [
    {
      accessor: "team",
      Header: "Team",
      Cell: ({ value }) => <p className="m-0">{value}</p>,
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
            const sortedAgents = [...agentData].sort((a, b) => {
              const aIsMember = row.original.members.some(
                (member) => member.id === a.id
              );
              const bIsMember = row.original.members.some(
                (member) => member.id === b.id
              );
              return bIsMember - aIsMember; // Sort to move current members to the top
            });
            setAgentData(sortedAgents);
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
            const sortedAgents = [...agentData].sort((a, b) => {
              const aIsLead = row.original.lead.some(
                (lead) => lead.id === a.id
              );
              const bIsLead = row.original.lead.some(
                (lead) => lead.id === b.id
              );
              return bIsLead - aIsLead; // Sort to move current leads to the top
            });
            setAgentData(sortedAgents);
            setShowTeamLeadModal(true);
          }}
        >
          {row.original?.lead?.length > 0 ? row.original?.lead?.length : "+"}
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
          onClick={() => {
            setDeleteTeam(row.original);
            setShowConfirmDeleteModal(true);
          }}
        >
          <FontAwesomeIcon icon={"trash"} />
        </Button>
      ),
    },
  ];

  const updateTeamLead = (selectedAgent, isChecked) => {
    // setAgents((prevAgents) =>
    //   prevAgents.map((agent) => {
    //     if (agent.id === selectedAgent.id) {
    //       return { ...agent, isChecked };
    //     }
    //     return agent;
    //   })
    // );
    setAgents((prevAgents) =>
      prevAgents.map((agent) => {
        if (agent.id === selectedAgent.id) {
          if (agent.isChecked !== isChecked) {
            // Detect changes
            setTeamLeadsChanged(true); // Set change detected to true
          }
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
      teamData.find((team) => team.team === selectedTeam.team).lead.length = 0;

      teamData
        .find((team) => team.team === selectedTeam.team)
        .lead.push(
          ...agents
            .filter((a) => a.isChecked)
            .map((a) => ({
              email: a.email,
              name: a.name,
              id: a.id,
            }))
        );
      toast.success("Team lead updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error);
    } finally {
      setIsLoadingUpdateTeamLead(false);
      setShowTeamLeadModal(false);
      resetPaginationTeamLead();
      setTeamLeadsChanged(false);
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
    // setAgents((prevAgents) =>
    //   prevAgents.map((agent) => {
    //     if (agent.id === selectedAgent.id) {
    //       return { ...agent, isChecked };
    //     }
    //     return agent;
    //   })
    // );
    setAgents((prevAgents) =>
      prevAgents.map((agent) => {
        if (agent.id === selectedAgent.id) {
          if (agent.isChecked !== isChecked) {
            // Detect changes
            setTeamMembersChanged(true); // Set change detected to true
          }
          return { ...agent, isChecked };
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
      teamData.find(
        (team) => team.team === selectedTeam.team
      ).members.length = 0;

      teamData
        .find((team) => team.team === selectedTeam.team)
        .members.push(
          ...agents
            .filter((a) => a.isChecked)
            .map((a) => ({
              email: a.email,
              name: a.name,
              id: a.id,
            }))
        );
      toast.success("Team-members updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error);
    } finally {
      setShowTeamMemberModal(false);
      resetPaginationAgents();
      setIsLoadingUpdateTeam(false);
      setTeamMembersChanged(false);
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
  // Handel Pagination
  const {
    currentPageData: currentPageTeams,
    setPageSize: setPageSizeTeams,
    nextPage: nextPageTeams,
    previousPage: previousPageTeams,
    canNextPage: canNextPageTeams,
    canPreviousPage: canPreviousPageTeams,
    pageIndex: pageIndexTeams,
    pageSize: pageSizeTeams,
  } = usePagination(filteredTeamData);

  const {
    currentPageData: currentPageAgents,
    setPageSize: setPageSizeAgents,
    nextPage: nextPageAgents,
    previousPage: previousPageAgents,
    canNextPage: canNextPageAgents,
    canPreviousPage: canPreviousPageAgents,
    resetPagination: resetPaginationAgents,
    pageIndex: pageIndexAgents,
    pageSize: pageSizeAgents,
  } = usePagination(
    agentData.filter((agent) =>
      agent.name.toLowerCase().includes(searchMember.toLowerCase())
    )
  );

  const {
    currentPageData: currentPageTeamLead,
    setPageSize: setPageSizeTeamLead,
    nextPage: nextPageTeamLead,
    previousPage: previousPageTeamLead,
    canNextPage: canNextPageTeamLead,
    canPreviousPage: canPreviousPageTeamLead,
    resetPagination: resetPaginationTeamLead,
    pageIndex: pageIndexTeamLead,
    pageSize: pageSizeTeamLead,
  } = usePagination(
    agentData.filter((agent) =>
      agent.name.toLowerCase().includes(searchTeamlead.toLowerCase())
    )
  );
  return (
    <>
      {isLoadingTeams ? (
        <Loader />
      ) : (
        <AdvanceTableWrapper
          key={pageSizeTeams}
          columns={teamsColumn}
          data={currentPageTeams}
          sortable
          pagination
          perPage={pageSizeTeams}
        >
          <Row className="mb-3">
            <Col xs={12} sm={8} lg={7}>
              <Row>
                <Col xs={12} sm={6} lg={8}>
                  <InputGroup size="sm">
                    <FormControl
                      aria-label="Search Agents"
                      aria-describedby="inputGroup-sizing-sm"
                      placeholder="Search teams..."
                      value={searchTerm}
                      onChange={(e) =>
                        setSearchTerm(e.target.value.toLowerCase())
                      } // Convert input to lowercase for case-insensitive matching
                    />
                    <InputGroup.Text id="inputGroup-sizing-sm">
                      <FontAwesomeIcon icon="search" />
                    </InputGroup.Text>
                  </InputGroup>
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
          {teamData.length > 0 ? (
            <div className="mt-3">
              <AdvanceTableFooter
                pageIndex={pageIndexTeams}
                pageSize={pageSizeTeams}
                nextPage={nextPageTeams}
                previousPage={previousPageTeams}
                canNextPage={canNextPageTeams}
                canPreviousPage={canPreviousPageTeams}
                page={currentPageTeams}
                rowCount={teamData.length}
                setPageSize={setPageSizeTeams}
                rowInfo
                rowsPerPageSelection
                navButtons
              />
            </div>
          ) : (
            <h5 className="text-muted text-center my-5">No Data Found</h5>
          )}
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
                minLength: {
                  value: 3,
                  message: "Minimum 3 characters required",
                },
                maxLength: {
                  value: 20,
                  message: "Maximum 20 characters allowed",
                },
                pattern: {
                  value: /^[a-zA-ZÀ-ÿ0-9-' ]{3,20}$/,
                  message:
                    "Only letters, numbers, hyphens, and apostrophes allowed",
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
                minLength: {
                  value: 10,
                  message: "Minimum 10 characters required",
                },
                maxLength: {
                  value: 150,
                  message: "Maximum 150 characters allowed",
                },
                pattern: {
                  value: /^[a-zA-ZÀ-ÿ0-9\s',.-]{10,150}$/,
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
              disabled={isLoadingTeamCreate}
            >
              {isLoadingTeamCreate ? "submitting..." : "submit"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={showTeamLeadModal}
        onHide={() => {
          setShowTeamLeadModal(false);
          resetPaginationTeamLead();
          setTeamLeadsChanged(false);
        }}
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
                resetPaginationTeamLead();
                setTeamLeadsChanged(false);
              }}
            />
          </div>
          <AdvanceTableWrapper
            // columns={teamLeadColumns}
            // data={agentData}
            // sortable
            // pagination
            // perPage={5}
            key={pageSizeTeamLead}
            columns={teamLeadColumns}
            data={currentPageTeamLead}
            sortable
            pagination
            perPage={pageSizeTeamLead}
          >
            <Row className="mb-3">
              <Col xs={12} sm={6} lg={6}>
                <InputGroup size="sm">
                  <FormControl
                    aria-label="Search Agents"
                    aria-describedby="inputGroup-sizing-sm"
                    placeholder="Search teams..."
                    value={searchTeamlead}
                    onChange={(e) =>
                      setSearchTeamlead(e.target.value.toLowerCase())
                    } // Convert input to lowercase for case-insensitive matching
                  />
                  <InputGroup.Text id="inputGroup-sizing-sm">
                    <FontAwesomeIcon icon="search" />
                  </InputGroup.Text>
                </InputGroup>
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
            {agentData.length > 0 ? (
              <>
                <div className="mt-3">
                  <AdvanceTableFooter
                    // rowCount={agentData.length}
                    // table
                    // rowInfo
                    // navButtons
                    // rowsPerPageSelection
                    pageIndex={pageIndexTeamLead}
                    pageSize={pageSizeTeamLead}
                    nextPage={nextPageTeamLead}
                    previousPage={previousPageTeamLead}
                    canNextPage={canNextPageTeamLead}
                    canPreviousPage={canPreviousPageTeamLead}
                    page={currentPageTeamLead}
                    rowCount={agentData.length}
                    setPageSize={setPageSizeTeamLead}
                    rowInfo
                    rowsPerPageSelection
                    navButtons
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
                    disabled={isLoadingUpdateTeamLead || !teamLeadsChanged}
                  >
                    {isLoadingUpdateTeamLead ? "submitting..." : "submit"}
                  </Button>
                </div>
              </>
            ) : (
              <h5 className="text-muted text-center my-5">No Data Found</h5>
            )}
          </AdvanceTableWrapper>
        </Modal.Body>
      </Modal>
      <Modal
        show={showTeamMemberModal}
        onHide={() => {
          setShowTeamMemberModal(false);
          resetPaginationAgents();
          setTeamMembersChanged(false);
        }}
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
                resetPaginationAgents();
                setTeamMembersChanged(false);
              }}
            />
          </div>
          <AdvanceTableWrapper
            // columns={teamMemberColumns}
            // data={agentData}
            // sortable
            // pagination
            // perPage={5}
            key={pageSizeAgents}
            columns={teamMemberColumns}
            data={currentPageAgents}
            sortable
            pagination
            perPage={pageSizeAgents}
          >
            <Row className="mb-3">
              <Col xs={12} sm={6} lg={6}>
                <InputGroup size="sm">
                  <FormControl
                    aria-label="Search Agents"
                    aria-describedby="inputGroup-sizing-sm"
                    placeholder="Search teams..."
                    value={searchMember}
                    onChange={(e) =>
                      setSearchMember(e.target.value.toLowerCase())
                    } // Convert input to lowercase for case-insensitive matching
                  />
                  <InputGroup.Text id="inputGroup-sizing-sm">
                    <FontAwesomeIcon icon="search" />
                  </InputGroup.Text>
                </InputGroup>
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
            {agentData.length > 0 ? (
              <>
                <div className="mt-3">
                  <AdvanceTableFooter
                    // rowCount={agentData.length}
                    // table
                    // rowInfo
                    // navButtons
                    // rowsPerPageSelection
                    pageIndex={pageIndexAgents}
                    pageSize={pageSizeAgents}
                    nextPage={nextPageAgents}
                    previousPage={previousPageAgents}
                    canNextPage={canNextPageAgents}
                    canPreviousPage={canPreviousPageAgents}
                    page={currentPageAgents}
                    rowCount={agentData.length}
                    setPageSize={setPageSizeAgents}
                    rowInfo
                    rowsPerPageSelection
                    navButtons
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
                    onClick={submitTeam}
                    disabled={isLoadingUpdateTeam || !teamMembersChanged}
                  >
                    {isLoadingUpdateTeam ? "submitting..." : "submit"}
                  </Button>
                </div>
              </>
            ) : (
              <h5 className="text-muted text-center my-5">No Data Found</h5>
            )}
          </AdvanceTableWrapper>
        </Modal.Body>
      </Modal>
      <Modal
        show={showConfirmDeleteModal}
        onHide={() => setShowConfirmDeleteModal(false)}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete team?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="falcon-default"
            onClick={() => setShowConfirmDeleteModal(false)}
          >
            Close
          </Button>
          <Button
            variant="falcon-danger"
            disabled={isLoadingDeleteTeam}
            onClick={() => {
              handleDeleteTeam(deleteTeam);
            }}
          >
            {isLoadingDeleteTeam ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Teams;

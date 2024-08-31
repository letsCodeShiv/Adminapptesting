import React, { useEffect, useState, useContext } from "react";
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
import AdvanceTableWrapper from "components/common/advance-table/AdvanceTableWrapper";
import AdvanceTable from "components/common/advance-table/AdvanceTable";
import AdvanceTableFooter from "components/common/advance-table/AdvanceTableFooter";
import usePagination from "./advance-table/usePagination";
import Loader from "components/Loader/Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PaymentContext } from "context/PaymentContext";

const Agents = () => {
  // Modal
  const [editTeamModalShow, setEditTeamModalShow] = useState(false);
  const [editTeamLeadModalShow, setEditTeamLeadModalShow] = useState(false);
  const [editRoleModalShow, setEditRoleModalShow] = useState(false);
  const [confirmFetchModalShow, setConfirmFetchModalShow] = useState(false);
  const [confirmResetModalShow, setConfirmResetModalShow] = useState(false);

  const [teamChanged, setTeamChanged] = useState(false);
  const [teamLeadChanged, setTeamLeadChanged] = useState(false);
  const [roleChanged, setRoleChanged] = useState(false);

  const [agentData, setAgentData] = useState([]);

  const [roleData, setRoleData] = useState([]);
  const [role, setRole] = useState([]);

  const [teamData, setTeamData] = useState([]);
  const [team, setTeam] = useState([]);
  // const [agentStatuses, setAgentStatuses] = useState(new Map());

  const [selectedAgent, setSelectedAgent] = useState({});

  const [topCXRoles, setTopCXRoles] = useState([]);
  const [topCXTeams, setTopCXTeams] = useState([]);
  const [zendeskRoles, setZendeskRoles] = useState([]);
  const [zendeskGroups, setZendeskGroups] = useState([]);

  const [filterTopCXTeams, setFilterTopCXTeams] = useState("All");
  const [filterTopCXRoles, setFilterTopCXRoles] = useState("All");
  const [filterZendeskRoles, setFilterZendeskRoles] = useState("All");
  const [filterZendeskGroups, setFilterZendeskGroups] = useState("All");

  const [searchTerm, setSearchTerm] = useState("");
  const [searchTeam, setSearchTeam] = useState("");
  const [searchTeamLead, setSearchTeamLead] = useState("");
  const [searchRole, setSearchRole] = useState("");

  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [isLoadingUpdateTeam, setIsLoadingUpdateTeam] = useState(false);
  const [isLoadingUnassigneTeam, setIsLoadingUnassigneTeam] = useState(false);
  const [isLoadingUpdateTeamLead, setIsLoadingUpdateTeamLead] = useState(false);
  const [isLoadingUpdateRole, setIsLoadingUpdateRole] = useState(false);
  const { fetchPaymentStatus } = useContext(PaymentContext);

  const fetchUserData = async (type) => {
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };
    const agentData = {
      get_type: type,
    };
    try {
      setIsLoadingAgents(true);
      const response = await axios.post(
        ApiConfig.agentsDetailsRefresh,
        agentData,
        config
      );

      setConfirmFetchModalShow(false);
      setConfirmResetModalShow(false);

      setAgentData(
        response?.data?.AgentManagement.sort((a, b) => {
          // Prioritize active agents, assuming 'true' means active and should come first
          if (a.topcx_status && !b.topcx_status) {
            return -1;
          } else if (!a.topcx_status && b.topcx_status) {
            return 1;
          }
          return 0;
        })
      );

      const getUniqueRoles = () => {
        const roles = new Set(
          response?.data?.AgentManagement.map((agent) => agent.role)
        );
        return Array.from(roles);
      };
      setZendeskRoles(getUniqueRoles);

      const getUniqueGroups = () => {
        const groups = new Set(
          response?.data?.AgentManagement.flatMap((agent) => agent.groups)
        );
        return Array.from(groups);
      };
      console.log(getUniqueGroups());
      setZendeskGroups(getUniqueGroups);

      const mappedRoleData = Object.entries(
        response?.data?.RoleManagement?.topcx_roles || {}
      )
        .filter(([, value]) => !value.is_internal_role)
        .map(([key, value]) => {
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
          if (role !== "Explore Mode") {
            topCXRolesSet.add(role);
          }
        });
      });
      setTopCXRoles(Array.from(topCXRolesSet));
      setTopCXTeams(Array.from(topCXTeamsSet));
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error);
    } finally {
      setIsLoadingAgents(false);
    }
  };
  useEffect(() => {
    fetchUserData("fetch");
  }, []);

  // const filteredAgents = agentData.filter((agent) => {
  //   return (
  //     (filterTopCXRoles === "All" ||
  //       agent.topcx_roles.some((group) => group === filterTopCXRoles)) &&
  //     (filterTopCXTeams === "All" || agent.topcx_team === filterTopCXTeams)
  //   );
  // });

  // const filteredAgents = agentData.filter((agent) => {
  //   return (
  //     (filterTopCXRoles === "All" ||
  //       agent.topcx_roles.some((role) => role === filterTopCXRoles)) &&
  //     (filterTopCXTeams === "All" || agent.topcx_team === filterTopCXTeams) &&
  //     agent.name.toLowerCase().includes(searchTerm) // You can add more fields to search by
  //   );
  // });

  // const filteredAndSortedAgents = filteredAgents.sort((a, b) => {
  //   // Sort by status first (assuming true is 'active' and should come first)
  //   if (b.topcx_status === a.topcx_status) {
  //     // If statuses are equal, sort by name
  //     return a.name.localeCompare(b.name);
  //   }
  //   return b.topcx_status ? 1 : -1;
  // });

  useEffect(() => {
    resetPaginationAgent();
  }, [
    filterTopCXRoles,
    filterTopCXTeams,
    filterZendeskGroups,
    filterZendeskRoles,
    searchTerm,
  ]);

  const filteredAndSortedAgents = agentData.filter((agent) => {
    // Check if the agent's role matches the selected TopCX role (if specified)
    const matchesTopCXRoles =
      filterTopCXRoles === "All" ||
      agent.topcx_roles.includes(filterTopCXRoles);

    // Check if the agent belongs to any of the selected Zendesk groups (if specified)
    const matchesZendeskGroups =
      filterZendeskGroups === "All" ||
      agent?.groups?.some((group) => group === filterZendeskGroups);

    // Check if the agent's team matches the selected TopCX team (if specified)
    const matchesTopCXTeams =
      filterTopCXTeams === "All" || agent.topcx_team === filterTopCXTeams;

    // Check if the agent's Zendesk role matches the selected role (if specified)
    const matchesZendeskRoles =
      filterZendeskRoles === "All" || agent.role === filterZendeskRoles;

    // Check if the agent's name includes the search term (case insensitive)
    const matchesSearchTerm = agent.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Return true if all conditions are met
    return (
      matchesTopCXRoles &&
      matchesZendeskGroups &&
      matchesTopCXTeams &&
      matchesZendeskRoles &&
      matchesSearchTerm
    );
  });

  // const filteredAndSortedAgents = agentData.filter((agent) => {
  //   return (
  //     (filterTopCXRoles === "All" ||
  //       agent.topcx_roles.some((role) => role === filterTopCXRoles)) &&
  //     (filterZendeskGroups === "All" ||
  //       agent.groups.some((group) => group === filterZendeskGroups)) &&
  //     (filterTopCXTeams === "All" || agent.topcx_team === filterTopCXTeams) &&
  //     (filterZendeskRoles === "All" || agent.role === filterZendeskRoles) &&
  //     agent.name.toLowerCase().includes(searchTerm.toLowerCase())
  //   );
  // });
  // .sort((a, b) => {
  //   // Prioritize active agents, assuming 'true' means active and should come first
  //   if (a.topcx_status && !b.topcx_status) {
  //     return -1;
  //   } else if (!a.topcx_status && b.topcx_status) {
  //     return 1;
  //   }
  //   return 0;
  // });

  // Use sortedAgents for rendering in your component

  const updateAgent = async (isChecked, currentAgent) => {
    // const updatedAgentData = agentData.map((agent) =>
    //   agent.id === currentAgent.id
    //     ? { ...agent, topcx_status: isChecked }
    //     : agent
    // );
    // setAgentData(updatedAgentData);

    // setAgentData((prevData) =>
    //   prevData.map((agent) =>
    //     agent.id === currentAgent.id
    //       ? { ...agent, topcx_status: isChecked }
    //       : agent
    //   )
    // );

    setAgentData((prevData) =>
      prevData.map((agent) =>
        agent.id === currentAgent.id
          ? {
              ...agent,
              topcx_status: isChecked,
              // Add the "Agent" role if isChecked is true and the role is not already present
              topcx_roles: isChecked
                ? [...new Set([...agent.topcx_roles, "Agent"])]
                : // : agent.topcx_roles.filter((role) => role !== "Agent"),
                  agent.topcx_roles,
            }
          : agent
      )
    );
    // Keep track of the previous status in case we need to rollback
    // setAgentStatuses(currentAgent);

    const apiData = {
      agent_data: {
        email: currentAgent.email,
        id: currentAgent.id,
        name: currentAgent.name,
      },
      agent_status: isChecked,
      agent_role: "Agent",
    };

    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };

    try {
      await axios.post(ApiConfig.agentsDetailsSubmit, apiData, config);
      fetchPaymentStatus();
      toast.success("Agent status updated successfully!");
    } catch (error) {
      // const updatedAgentData = agentData.map((agent) =>
      //   agent.id === currentAgent.id
      //     ? { ...agent, topcx_status: !isChecked }
      //     : agent
      // );
      // setAgentData(updatedAgentData);
      // setAgentData((prevData) =>
      //   prevData.map((agent) =>
      //     agent.id === currentAgent.id
      //       ? { ...agent, topcx_status: agentStatuses.get(currentAgent.id) }
      //       : agent
      //   )
      // );

      // setAgentData((prevData) =>
      //   prevData.map((agent) =>
      //     agent.id === currentAgent.id
      //       ? {
      //           ...agent,
      //           topcx_status: !isChecked,
      //           topcx_roles: agentStatuses.get(currentAgent.id).roles,
      //         }
      //       : agent
      //   )

      // );

      setAgentData((prevData) => {
        // console.log("Previous agent data before revert:", prevData);
        // console.log(agentStatuses);
        return prevData.map((agent) => {
          if (agent.id === currentAgent.id) {
            // const previousStatus = agentStatuses.get(currentAgent.id);
            // const previousStatus = currentAgent;
            // console.log("Previous status for agent:", previousStatus);
            return currentAgent
              ? {
                  ...agent,
                  topcx_status: !isChecked,
                  topcx_roles: currentAgent.topcx_roles,
                }
              : agent; // If no previous status, return the agent as it is
          }
          return agent;
        });
      });

      toast.error(error.response?.data?.detail?.masked_error);
    }
  };

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
          checked={row?.original.topcx_status}
          onChange={(e) => {
            updateAgent(e.target.checked, row.original);
          }}
          // disabled={row?.original?.topcx_roles?.includes("Account Owner")}
          disabled={row.original.topcx_roles.includes("Account Owner")}
        />
      ),
    },
    {
      accessor: "role",
      Header: "Zendesk Role",
    },
    {
      accessor: "group",
      Header: "Zendesk Group",
      Cell: ({ row }) => (
        <p className="m-0 text-wrap" style={{ maxWidth: "20rem" }}>
          {row.original?.groups?.join(" | ")}
        </p>
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
            // Sorting teams inline to move the selected agent's current team to the top
            const sortedTeams = [...teamData].sort((a, b) => {
              const aMatch = a.team === row.original.topcx_team; // true if this is the selected agent's current team
              const bMatch = b.team === row.original.topcx_team;
              return bMatch - aMatch; // Sort to move the true value (current team) to the top
            });

            setTeamData(sortedTeams); // Set the sorted data to state
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
            // Sorting teams to move the teams where the agent is a team lead to the top
            const sortedTeams = [...teamData].sort((a, b) => {
              const aMatch = row.original.topcx_team_lead_of.includes(a.team); // true if the agent is a lead for this team
              const bMatch = row.original.topcx_team_lead_of.includes(b.team);
              return bMatch - aMatch; // Sort to move the true value (team lead) to the top
            });

            setTeamData(sortedTeams); // Update the team data with sorted results
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
            // Sorting roles to move the roles where the agent is already assigned to the top
            const sortedRoles = [...roleData].sort((a, b) => {
              const aMatch = row.original.topcx_roles.includes(a.role); // true if the agent has this role
              const bMatch = row.original.topcx_roles.includes(b.role);
              return bMatch - aMatch; // Sort to move the true value (assigned role) to the top
            });

            setRoleData(sortedRoles); // Update the role data with sorted results
            setEditRoleModalShow(true);
          }}
        >
          {row.original?.topcx_roles?.length > 0
            ? row.original.topcx_roles.includes("Explore Mode")
              ? row.original.topcx_roles.length - 1
              : row.original.topcx_roles.length
            : "+"}
        </Button>
      ),
    },
  ];

  const updateTeam = (team) => {
    // setSelectedAgent((previous) => ({ ...previous, topcx_team: team.team }));

    if (selectedAgent.topcx_team !== team.team) {
      setSelectedAgent((previous) => ({
        ...previous,
        topcx_team: team.team,
      }));
      setTeamChanged(true);
    }
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
      if (isChecked) {
        agentData.find((agent) => agent.id === selectedAgent.id).topcx_team =
          selectedAgent.topcx_team;
      } else {
        agentData.find((agent) => agent.id === selectedAgent.id).topcx_team =
          null;
      }

      toast.success("Team updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error);
    } finally {
      setEditTeamModalShow(false);
      resetPaginationTeams();
      setIsLoadingUnassigneTeam(false);
      setIsLoadingUpdateTeam(false);
      setTeamChanged(false);
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
          id={`radio-${row.original.team}`}
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
        <p className="m-0 text-wrap" style={{ maxWidth: "35rem" }}>
          {value}
        </p>
      ),
    },
  ];

  const updateTeamLead = (selectedTeam, isChecked) => {
    // setTeam((prevTeams) =>
    //   prevTeams.map((team) => {
    //     if (team.team === selectedTeam.team) {
    //       return { ...team, isChecked };
    //     }
    //     return team;
    //   })
    // );
    setTeam((prevTeams) =>
      prevTeams.map((team) => {
        if (team.team === selectedTeam.team) {
          if (team.isChecked !== isChecked) {
            // Check if the check status has changed
            setTeamLeadChanged(true); // Indicate that a change has occurred
          }
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
      agentData.find(
        (agent) => agent.id === selectedAgent.id
      ).topcx_team_lead_of.length = 0;
      agentData
        .find((agent) => agent.id === selectedAgent.id)
        .topcx_team_lead_of.push(
          ...team.filter((t) => t.isChecked).map((t) => t.team)
        );
      toast.success("Team lead updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error);
    } finally {
      setEditTeamLeadModalShow(false);
      resetPaginationTeamLead();
      setIsLoadingUpdateTeamLead(false);
      setTeamLeadChanged(false);
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
        <p className="m-0 text-wrap" style={{ maxWidth: "35rem" }}>
          {value}
        </p>
      ),
    },
  ];

  const updateRole = (selectedRole, isChecked) => {
    // setRole((prevRole) =>
    //   prevRole.map((role) => {
    //     if (role.role === selectedRole.role) {
    //       return { ...role, isChecked };
    //     }
    //     return role;
    //   })
    // );
    setRole((prevRole) =>
      prevRole.map((role) => {
        if (role.role === selectedRole.role) {
          if (role.isChecked !== isChecked) {
            // Check if the check status has changed
            setRoleChanged(true); // Indicate that a change has occurred
          }
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
      agentList: roleData,
    };

    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };

    try {
      setIsLoadingUpdateRole(true);
      await axios.post(ApiConfig.agentsDetailsRole, apiData, config);
      agentData.find(
        (agent) => agent.id === selectedAgent.id
      ).topcx_roles.length = 0;
      agentData.find((agent) => agent.id === selectedAgent.id).topcx_roles =
        role.filter((r) => r.isChecked).map((r) => r.role);
      toast.success("Roles updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error);
    } finally {
      setEditRoleModalShow(false);
      resetPaginationRoles();
      setIsLoadingUpdateRole(false);
      setRoleChanged(false);
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
          disabled={
            row.original.role === "Account Owner" ||
            (selectedAgent.topcx_roles.includes("Account Owner") &&
              row.original.role === "Billing Administrator")
          }
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

  // Handel Pagination
  const {
    currentPageData: currentPageAgents,
    setPageSize: setPageSizeAgents,
    nextPage: nextPageAgents,
    previousPage: previousPageAgents,
    canNextPage: canNextPageAgents,
    canPreviousPage: canPreviousPageAgents,
    resetPagination: resetPaginationAgent,
    pageIndex: pageIndexAgents,
    pageSize: pageSizeAgents,
  } = usePagination(filteredAndSortedAgents);

  const {
    currentPageData: currentPageTeams,
    setPageSize: setPageSizeTeams,
    nextPage: nextPageTeams,
    previousPage: previousPageTeams,
    canNextPage: canNextPageTeams,
    canPreviousPage: canPreviousPageTeams,
    resetPagination: resetPaginationTeams,
    pageIndex: pageIndexTeams,
    pageSize: pageSizeTeams,
  } = usePagination(
    teamData.filter((team) =>
      team.team.toLowerCase().includes(searchTeam.toLowerCase())
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
    teamData.filter((team) =>
      team.team.toLowerCase().includes(searchTeamLead.toLowerCase())
    )
  );

  const {
    currentPageData: currentPageRoles,
    setPageSize: setPageSizeRoles,
    nextPage: nextPageRoles,
    previousPage: previousPageRoles,
    canNextPage: canNextPageRoles,
    canPreviousPage: canPreviousPageRoles,
    resetPagination: resetPaginationRoles,
    pageIndex: pageIndexRoles,
    pageSize: pageSizeRoles,
  } = usePagination(
    roleData.filter((role) =>
      role.role.toLowerCase().includes(searchRole.toLowerCase())
    )
  );

  return (
    <>
      {isLoadingAgents ? (
        <Loader />
      ) : (
        <>
          {/* <AdvanceTableWrapper
            columns={agents}
            data={filteredAgents}
            sortable
            pagination
            perPage={5}
          > */}
          <AdvanceTableWrapper
            key={pageSizeAgents}
            columns={agents}
            data={currentPageAgents}
            sortable
            pagination
            perPage={pageSizeAgents}
          >
            {/* <Row className="mb-3">
              <Col xs={12} sm={6} lg={4}>
                <InputGroup size="sm">
                  <FormControl
                    aria-label="Search Agents"
                    aria-describedby="inputGroup-sizing-sm"
                    placeholder="Search agents..."
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(e.target.value.toLowerCase())
                    }
                  />
                  <InputGroup.Text id="inputGroup-sizing-sm">
                    <FontAwesomeIcon icon="search" />
                  </InputGroup.Text>
                </InputGroup>
              </Col>
              <Col xs="auto" sm={4} lg={2}>
                <Form.Select
                  size="sm"
                  aria-label="Default select example"
                  value={filterZendeskRoles}
                  onChange={(e) => setFilterZendeskRoles(e.target.value)}
                >
                  <option value="All">All Zendesk Roles</option>
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
                  value={filterZendeskGroups}
                  onChange={(e) => setFilterZendeskGroups(e.target.value)}
                >
                  <option value="All">All Zendesk Groups</option>
                  {zendeskGroups.map((team, index) => (
                    <option key={index} value={team}>
                      {team}
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
              <Col xs={12} sm={4} lg={2}>
                <div className="d-flex justify-content-end">
                  <Button
                    className="me-2"
                    size="sm"
                    variant="falcon-warning"
                    disabled={isLoadingAgents}
                    onClick={() => setConfirmFetchModalShow(true)}
                  >
                    Fetch Agents
                  </Button>
                   <Button
                    className="me-2"
                    size="sm"
                    variant="falcon-danger"
                    disabled={isLoadingAgents}
                    onClick={() => setConfirmResetModalShow(true)}
                  >
                    Reset
                  </Button> 
                </div>
              </Col>
            </Row> */}

            <Row className="mb-3">
              <Col xs={12} sm={6} md={3} lg={4}>
                <InputGroup size="sm">
                  <FormControl
                    placeholder="Search agents..."
                    aria-label="Search Agents"
                    aria-describedby="basic-addon2"
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(e.target.value.toLowerCase())
                    } // Case-insensitive matching
                  />
                  <InputGroup.Text id="basic-addon2">
                    <FontAwesomeIcon icon="search" />
                  </InputGroup.Text>
                </InputGroup>
              </Col>
              <Col xs={6} sm={3} md={2} lg={2}>
                <Form.Select
                  size="sm"
                  aria-label="Filter by Zendesk Role"
                  value={filterZendeskRoles}
                  onChange={(e) => setFilterZendeskRoles(e.target.value)}
                >
                  <option value="All">All Zendesk Roles</option>
                  {zendeskRoles.map((role, index) => (
                    <option key={index} value={role}>
                      {role}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={6} sm={3} md={2} lg={2}>
                <Form.Select
                  size="sm"
                  aria-label="Filter by Zendesk Group"
                  value={filterZendeskGroups}
                  onChange={(e) => setFilterZendeskGroups(e.target.value)}
                >
                  <option value="All">All Zendesk Groups</option>
                  {zendeskGroups.map((group, index) => (
                    <option key={index} value={group}>
                      {group}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={6} sm={3} md={2} lg={2}>
                <Form.Select
                  size="sm"
                  aria-label="Filter by TopCX Role"
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
              <Col xs={6} sm={3} md={2} lg={2}>
                <Form.Select
                  size="sm"
                  aria-label="Filter by TopCX Team"
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
            {filteredAndSortedAgents?.length > 0 ? (
              <div className="mt-3">
                {/* <AdvanceTableFooter
                  rowCount={filteredAgents.length}
                  table
                  rowInfo
                  navButtons
                  rowsPerPageSelection
                /> */}
                <AdvanceTableFooter
                  pageIndex={pageIndexAgents}
                  pageSize={pageSizeAgents}
                  nextPage={nextPageAgents}
                  previousPage={previousPageAgents}
                  canNextPage={canNextPageAgents}
                  canPreviousPage={canPreviousPageAgents}
                  page={currentPageAgents}
                  rowCount={filteredAndSortedAgents.length}
                  setPageSize={setPageSizeAgents}
                  rowInfo
                  rowsPerPageSelection
                  navButtons
                />
              </div>
            ) : (
              <h5 className="text-muted text-center my-5">No Data Found</h5>
            )}
          </AdvanceTableWrapper>

          <div className="d-flex justify-content-end mt-3">
            <Button
              className="me-2"
              size="sm"
              variant="falcon-warning"
              disabled={isLoadingAgents}
              onClick={() => setConfirmFetchModalShow(true)}
            >
              Fetch Agents
            </Button>
            {/* <Button
              className="me-2"
              size="sm"
              variant="falcon-danger"
              disabled={isLoadingAgents}
              onClick={() => setConfirmResetModalShow(true)}
            >
              Reset
            </Button> */}
          </div>
        </>
      )}
      <Modal
        show={editTeamModalShow}
        onHide={() => {
          setEditTeamModalShow(false);
          resetPaginationTeams();
          setTeamChanged(false);
        }}
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
                resetPaginationTeams();
                setTeamChanged(false);
              }}
            />
          </div>
          <AdvanceTableWrapper
            // columns={teams}
            // data={teamData}
            // sortable
            // pagination
            // perPage={5}
            key={pageSizeTeams}
            columns={teams}
            data={currentPageTeams}
            sortable
            pagination
            perPage={pageSizeTeams}
          >
            <Row className="mb-3">
              <Col xs={12} sm={6} lg={6}>
                <InputGroup size="sm">
                  <FormControl
                    aria-label="Search Agents"
                    aria-describedby="inputGroup-sizing-sm"
                    placeholder="Search teams..."
                    value={searchTeam}
                    onChange={(e) =>
                      setSearchTeam(e.target.value.toLowerCase())
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
            {teamData.length > 0 ? (
              <>
                <div className="mt-3">
                  <AdvanceTableFooter
                    // rowCount={teamData.length}
                    // table
                    // rowInfo
                    // navButtons
                    // rowsPerPageSelection
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
                <div
                  className="btn-group mx-auto d-flex justify-content-center w-50 mt-4 mb-3"
                  role="group"
                  aria-label="Basic mixed styles example"
                >
                  <Button
                    variant="falcon-success"
                    onClick={() => submitTeam(true)}
                    disabled={
                      isLoadingUpdateTeam ||
                      isLoadingUnassigneTeam ||
                      !teamChanged
                    }
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
              </>
            ) : (
              <h5 className="text-muted text-center my-5">No Data Found</h5>
            )}
          </AdvanceTableWrapper>
        </Modal.Body>
      </Modal>
      <Modal
        show={editTeamLeadModalShow}
        onHide={() => {
          setEditTeamLeadModalShow(false);
          resetPaginationTeamLead();
          setTeamLeadChanged(false);
        }}
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
                resetPaginationTeamLead();
                setTeamLeadChanged(false);
              }}
            />
          </div>
          <AdvanceTableWrapper
            // columns={teamLead}
            // data={teamData}
            // sortable
            // pagination
            // perPage={5}
            key={pageSizeTeamLead}
            columns={teamLead}
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
                    placeholder="Search team lead..."
                    value={searchTeamLead}
                    onChange={(e) =>
                      setSearchTeamLead(e.target.value.toLowerCase())
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
            {teamData.length > 0 ? (
              <>
                <div className="mt-3">
                  <AdvanceTableFooter
                    // rowCount={teamData.length}
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
                    rowCount={teamData.length}
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
                    disabled={
                      isLoadingUpdateTeamLead || !teamLeadChanged
                      // || !team.some((t) => t.isChecked)
                    }
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
        show={editRoleModalShow}
        onHide={() => {
          setEditRoleModalShow(false);
          resetPaginationRoles();
          setRoleChanged(false);
        }}
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
                resetPaginationRoles();
                setRoleChanged(false);
              }}
            />
          </div>
          <AdvanceTableWrapper
            // columns={roles}
            // data={roleData}
            // sortable
            // pagination
            // perPage={5}
            key={pageSizeRoles}
            columns={roles}
            data={currentPageRoles}
            sortable
            pagination
            perPage={pageSizeRoles}
          >
            <Row className="mb-3">
              <Col xs={12} sm={6} lg={6}>
                <InputGroup size="sm">
                  <FormControl
                    aria-label="Search Agents"
                    aria-describedby="inputGroup-sizing-sm"
                    placeholder="Search role..."
                    value={searchRole}
                    onChange={(e) =>
                      setSearchRole(e.target.value.toLowerCase())
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

            <p
              className="text-center text-muted m-0 mt-1"
              style={{ fontSize: " 0.8rem" }}
            >
              The account owner role cannot be reassigned.
            </p>

            {roleData.length > 0 ? (
              <>
                <div className="mt-3">
                  <AdvanceTableFooter
                    // rowCount={roleData.length}
                    // table
                    // rowInfo
                    // navButtons
                    // rowsPerPageSelection
                    pageIndex={pageIndexRoles}
                    pageSize={pageSizeRoles}
                    nextPage={nextPageRoles}
                    previousPage={previousPageRoles}
                    canNextPage={canNextPageRoles}
                    canPreviousPage={canPreviousPageRoles}
                    page={currentPageRoles}
                    rowCount={roleData.length}
                    setPageSize={setPageSizeRoles}
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
                    onClick={() => submitRole()}
                    disabled={
                      isLoadingUpdateRole || !roleChanged
                      // || !role.some((r) => r.isChecked)
                    }
                  >
                    {isLoadingUpdateRole ? "submitting..." : "submit"}
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
        show={confirmFetchModalShow}
        onHide={() => setConfirmFetchModalShow(false)}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to fetch agents from Zendesk?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="falcon-default"
            onClick={() => setConfirmFetchModalShow(false)}
          >
            Close
          </Button>
          <Button
            variant="falcon-warning"
            onClick={() => {
              fetchUserData("refresh");
            }}
            disabled={isLoadingAgents}
          >
            {isLoadingAgents ? "Loading..." : "Fetch"}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={confirmResetModalShow}
        onHide={() => setConfirmResetModalShow(false)}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to reset?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="falcon-default"
            onClick={() => setConfirmResetModalShow(false)}
          >
            Close
          </Button>
          <Button
            variant="falcon-danger"
            disabled={isLoadingAgents}
            onClick={() => {
              fetchUserData("reset");
            }}
          >
            {isLoadingAgents ? "Loading..." : "Reset"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Agents;

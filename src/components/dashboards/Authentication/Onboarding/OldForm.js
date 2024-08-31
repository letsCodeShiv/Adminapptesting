/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { Fragment } from "react";
import { useForm } from "react-hook-form";
import PropTypes from "prop-types";
import WizardInput from "./WizardInput";
import { Col, Row, Form } from "react-bootstrap";
import { Link } from "react-router-dom";

const Billing = () => {
  const {
    register,
    formState: { errors },
  } = useForm();
  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label>First Name*</Form.Label>
        <Form.Control
          type="text"
          placeholder="First Name"
          {...register("firstname", {
            required: "Name field is required",
            pattern: {
              value: /^[a-zA-ZÀ-ÿ'-]{3,}$/,
              message: "Name must be valid",
            },
          })}
          isValid={errors.firstname}
          isInvalid={!!errors.firstname}
        />
        <Form.Control.Feedback type="invalid">
          {errors.firstname?.message}
        </Form.Control.Feedback>
      </Form.Group>

      {/* <Row className="g-2 mb-3">
        <WizardInput
          type="password"
          errors={errors}
          label="Password*"
          name="password"
          formGroupProps={{ as: Col, sm: 6 }}
          formControlProps={{
            ...register('password', {
              required: 'You must specify a password',
              minLength: {
                value: 2,
                message: 'Password must have at least 2 characters'
              }
            })
          }}
        />
        <WizardInput
          type="password"
          errors={errors}
          label="Confirm Password*"
          name="confirmPassword"
          formGroupProps={{ as: Col, sm: 6 }}
          formControlProps={{
            ...register('confirmPassword', {
              required: 'Confirm Password field is required',
              validate: value =>
                value === watch('password') || 'The password do not match'
            })
          }}
        />
      </Row> */}
      <Form.Check
        type="checkbox"
        id={"agreedToTerms" + Math.floor(Math.random() * 100)}
      >
        <Form.Check.Input
          type="checkbox"
          {...register("agreedToTerms", {
            required: "You need to agree the terms and privacy policy.",
          })}
          isInvalid={errors.agreedToTerms}
          isValid={!!errors.agreedToTerms}
        />
        <Form.Check.Label className="ms-2">
          I accept the <Link to="#!"> terms</Link> and{" "}
          <Link to="#!"> privacy policy</Link>
        </Form.Check.Label>
        <Form.Control.Feedback type="invalid" className="mt-0">
          {errors.agreedToTerms?.message}
        </Form.Control.Feedback>
      </Form.Check>
    </>
  );
};

// export default Billing;
// /* eslint-disable react/prop-types */
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { ApiConfig } from 'config/ApiConfig';
// import { Row, Col, Form } from 'react-bootstrap';
// import AdvanceTableWrapper from 'components/common/advance-table/AdvanceTableWrapper';
// import AdvanceTable from 'components/common/advance-table/AdvanceTable';
// import AdvanceTableFooter from 'components/common/advance-table/AdvanceTableFooter';
// import AdvanceTableSearchBox from 'components/common/advance-table/AdvanceTableSearchBox';
// import Select from 'react-select';
// import makeAnimated from 'react-select/animated';

// const Agents = () => {
//   const [data, setData] = useState([]);
//   const [updatedData, setUpdatedData] = useState([]);

//   const [selectedAgents, setSelectedAgents] = useState([]);

//   // const [zendeskRoles, setZendeskRoles] = useState([]);
//   // const [filterZendeskRoles, setFilterZendeskRoles] = useState('All');

//   // const [zendeskGroups, setZendeskGroups] = useState([]);
//   // const [filterZendeskGroups, setFilterZendeskGroups] = useState('All');

//   const [topCXRoles, setTopCXRoles] = useState([]);
//   const [filterTopCXRoles, setFilterTopCXRoles] = useState('All');

//   const [topCXTeams, setTopCXTeams] = useState([]);
//   const [filterTopCXTeams, setFilterTopCXTeams] = useState('All');

//   useEffect(() => {
//     const fetchUserData = async () => {
//       // const config = {
//       //   headers: { 'Access-Control-Allow-Origin': '*' },
//       //   withCredentials: true
//       // };
//       const agentData = {
//         subdomain: sessionStorage.getItem('subdomain'),
//         get_type: 'fetch'
//       };
//       try {
//         const response = await axios.post(
//           ApiConfig.agentsDetailsRefresh,
//           agentData
//           // config
//         );
//         console.log(response);
//         setData(response?.data?.AgentManagement);
//         setUpdatedData(response?.data?.AgentManagement);

//         const enabledAgents = [];
//         response.data.AgentManagement.forEach(agent => {
//           if (agent.topcx_status) {
//             enabledAgents.push(agent);
//           }
//         });
//         setSelectedAgents(enabledAgents);

//         // const zendeskRolesSet = new Set();
//         // const zendeskGroupsSet = new Set();
//         const topCXRolesSet = new Set();
//         const topCXTeamsSet = new Set();

//         response.data.AgentManagement.forEach(user => {
//           // zendeskRolesSet.add(user.role);

//           if (user.topcx_team) {
//             topCXTeamsSet.add(user.topcx_team);
//           }

//           user.topcx_roles.forEach(role => {
//             topCXRolesSet.add(role);
//           });

//           // user.groups.forEach(group => {
//           //   zendeskGroupsSet.add(group);
//           // });
//         });

//         // setZendeskRoles(Array.from(zendeskRolesSet));
//         // setZendeskGroups(Array.from(zendeskGroupsSet));
//         setTopCXRoles(Array.from(topCXRolesSet));
//         setTopCXTeams(Array.from(topCXTeamsSet));
//       } catch (error) {
//         toast.error(error.response?.data?.detail?.masked_error, {
//           theme: 'colored'
//         });
//       }
//     };

//     fetchUserData();
//   }, []);

//   const filteredAgents = data.filter(agent => {
//     return (
//       // (filterZendeskRoles === 'All' || agent.role === filterZendeskRoles) &&
//       // (filterZendeskGroups === 'All' ||
//       //   agent.groups.some(group => group === filterZendeskGroups)) &&
//       (filterTopCXRoles === 'All' ||
//         agent.topcx_roles.some(group => group === filterTopCXRoles)) &&
//       (filterTopCXTeams === 'All' ||
//         agent.topcx_roles.some(group => group === filterTopCXTeams))
//     );
//   });

//   // const badgeStyles = [
//   //   'primary',
//   //   'secondary',
//   //   'success',
//   //   'danger',
//   //   'warning',
//   //   'info',
//   //   'light',
//   //   'dark'
//   // ];

//   // Function to map role to a badge style based on the role's hash code
//   // const getBadgeStyleForRole = role => {
//   //   let hash = 0;
//   //   for (let i = 0; i < role.length; i++) {
//   //     hash = role.charCodeAt(i) + ((hash << 5) - hash);
//   //   }
//   //   const index = Math.abs(hash) % badgeStyles.length;
//   //   return badgeStyles[index];
//   // };

//   // React select -----------------------------------------------------------------
//   const animatedComponents = makeAnimated();
//   const options = [
//     { value: 'option1', label: 'Option 1' },
//     { value: 'option2', label: 'Option 2' }
//   ];

//   // React select -----------------------------------------------------------------

//   const handleCheckboxChange = user => {
//     const userIndex = data.findIndex(item => item.email === user.email);
//     if (userIndex !== -1) {
//       const updatedUserDetails = data.map((item, index) =>
//         index === userIndex
//           ? { ...item, topcx_status: !item.topcx_status }
//           : item
//       );
//       if (updatedUserDetails[userIndex].topcx_status) {
//         setSelectedAgents([...selectedAgents, updatedUserDetails[userIndex]]);
//       } else {
//         setSelectedAgents(
//           selectedAgents.filter(
//             selectedAgent => selectedAgent.email !== user.email
//           )
//         );
//       }
//       setUpdatedData(updatedUserDetails);
//     }
//   };

//   const columns = [
//     {
//       accessor: 'name',
//       Header: 'Name',
//       Cell: ({ row }) => <p> {row.original.name} </p>
//     },
//     // {
//     //   accessor: 'role',
//     //   Header: 'Zendesk Role',
//     //   Cell: ({ row }) => <p> {row.original.role} </p>
//     // },
//     // {
//     //   accessor: 'groups',
//     //   Header: 'Zendesk Groups',
//     //   Cell: ({ row }) => <p> {row.original.groups.join(' | ')} </p>
//     // },
//     {
//       accessor: 'topcx_team',
//       Header: 'TopCX Team',
//       Cell: ({ row }) => <p> {row.original.topcx_team} </p>
//     },
//     {
//       accessor: 'topcx_team_lead_of',
//       Header: 'TopCX Team Lead of',
//       Cell: ({ row }) => <p> {row.original.topcx_team_lead_of.join(' | ')} </p>
//     },
//     // {
//     //   accessor: 'topcx_roles',
//     //   Header: 'TopCX Role',
//     //   Cell: ({ row }) => (
//     //     <p>
//     //       {row.original.topcx_roles.map((role, index) => (
//     //         <span
//     //           key={index}
//     //           className={`badge bg-${getBadgeStyleForRole(role)} me-1`}
//     //         >
//     //           {role.toUpperCase()}
//     //         </span>
//     //       ))}
//     //     </p>
//     //   )
//     // },
//     {
//       accessor: 'topcx_roles',
//       Header: 'TopCX Role',
//       Cell: ({ row }) => (
//         <Select
//           options={options}
//           components={animatedComponents}
//           isMulti
//           closeMenuOnSelect={false}
//           menuPortalTarget={document.body}
//         />
//       )
//     },
//     {
//       accessor: 'Status',
//       Header: 'Status',
//       Cell: ({ row }) => (
//         <div className="form-check form-switch">
//           <input
//             className="form-check-input"
//             type="checkbox"
//             role="switch"
//             checked={
//               !!updatedData.find(user => user.email === row.original.email)
//                 ?.topcx_status
//             }
//             onChange={() => handleCheckboxChange(row.original)}
//             style={{ minWidth: '2rem' }}
//           />
//         </div>
//       )
//     }
//     // ,{
//     //   accessor: 'time_zone',
//     //   Header: 'Time Zone',
//     //   Cell: ({ row }) => <p> {row.original.timezone} </p>
//     // }
//   ];
//   return (
//     <AdvanceTableWrapper
//       columns={columns}
//       data={filteredAgents}
//       sortable
//       pagination
//       perPage={5}
//     >
//       <Row className=" mb-3">
//         <Col xs="auto" sm={6} lg={4}>
//           <AdvanceTableSearchBox table />
//         </Col>
//         {/* <Col xs="auto" sm={6} lg={2}>
//           <Form.Select
//             size="sm"
//             aria-label="Default select example"
//             value={filterZendeskGroups}
//             onChange={e => setFilterZendeskGroups(e.target.value)}
//           >
//             <option value="All">All Groups</option>
//             {zendeskGroups.map((group, index) => (
//               <option key={index} value={group}>
//                 {group}
//               </option>
//             ))}
//           </Form.Select>
//         </Col> */}
//         {/* <Col xs="auto" sm={4} lg={2}>
//           <Form.Select
//             size="sm"
//             aria-label="Default select example"
//             value={filterZendeskRoles}
//             onChange={e => setFilterZendeskRoles(e.target.value)}
//           >
//             <option value="All">All Roles</option>
//             {zendeskRoles.map((role, index) => (
//               <option key={index} value={role}>
//                 {role}
//               </option>
//             ))}
//           </Form.Select>
//         </Col> */}
//         <Col xs="auto" sm={4} lg={2}>
//           <Form.Select
//             size="sm"
//             aria-label="Default select example"
//             value={filterTopCXRoles}
//             onChange={e => setFilterTopCXRoles(e.target.value)}
//           >
//             <option value="All">All TopCx Roles</option>
//             {topCXRoles.map((role, index) => (
//               <option key={index} value={role}>
//                 {role}
//               </option>
//             ))}
//           </Form.Select>
//         </Col>
//         <Col xs="auto" sm={4} lg={2}>
//           <Form.Select
//             size="sm"
//             aria-label="Default select example"
//             value={filterTopCXTeams}
//             onChange={e => setFilterTopCXTeams(e.target.value)}
//           >
//             <option value="All">All TopCx Teams</option>
//             {topCXTeams.map((team, index) => (
//               <option key={index} value={team}>
//                 {team}
//               </option>
//             ))}
//           </Form.Select>
//         </Col>
//       </Row>
//       <AdvanceTable
//         table
//         headerClassName="bg-200 text-900 text-nowrap align-middle"
//         rowClassName="align-middle white-space-nowrap"
//         tableProps={{
//           bordered: true,
//           striped: true,
//           className: 'fs--1 mb-0 overflow-hidden'
//         }}
//       />
//       <div className="mt-3">
//         <AdvanceTableFooter
//           rowCount={filteredAgents.length}
//           table
//           rowInfo
//           navButtons
//           rowsPerPageSelection
//         />
//       </div>
//     </AdvanceTableWrapper>
//   );
// };

// export default Agents;

/* eslint-disable react/prop-types */
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
  const [updatedAgentData, setUpdatedAgentData] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState([]);

  const [roleData, setRoleData] = useState({});
  const [teamData, setTeamData] = useState({});

  const [selectedAgent, setSelectedAgent] = useState({});

  const [topCXRoles, setTopCXRoles] = useState([]);
  const [filterTopCXRoles, setFilterTopCXRoles] = useState("All");

  const [topCXTeams, setTopCXTeams] = useState([]);
  const [filterTopCXTeams, setFilterTopCXTeams] = useState("All");

  useEffect(() => {
    const fetchUserData = async () => {
      const config = {
        headers: { "Access-Control-Allow-Origin": "*" },
        withCredentials: true,
      };
      const agentData = {
        subdomain: sessionStorage.getItem("subdomain"),
        get_type: "fetch",
      };
      try {
        const response = await axios.post(
          ApiConfig.agentsDetailsRefresh,
          agentData,
          config
        );
        console.log(response);
        setAgentData(response?.data?.AgentManagement);
        setUpdatedAgentData(response?.data?.AgentManagement);
        setRoleData(response?.data?.RoleManagement?.topcx_roles);
        setTeamData(response?.data?.RoleManagement?.topcx_teams);

        const enabledAgents = [];
        response.data.AgentManagement.forEach((agent) => {
          if (agent.topcx_status) {
            enabledAgents.push(agent);
          }
        });
        setSelectedAgents(enabledAgents);

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

  const handleCheckboxChange = (user) => {
    const userIndex = agentData.findIndex((item) => item.email === user.email);
    if (userIndex !== -1) {
      const updatedUserDetails = agentData.map((item, index) =>
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
      setUpdatedAgentData(updatedUserDetails);
    }
  };

  const columns = [
    {
      accessor: "name",
      Header: "Name",
      Cell: ({ row }) => <p> {row.original.name} </p>,
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
        >
          {row.original.topcx_team ? row.original.topcx_team : "+"}
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
            setEditTeamLeadModalShow(true);
          }}
        >
          {row.original.topcx_team_lead_of.length <= 0
            ? row.original.topcx_team_lead_of
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
            setEditRoleModalShow(true);
          }}
        >
          {row.original.topcx_roles.length <= 0
            ? row.original.topcx_roles
            : "+"}
        </Button>
      ),
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
            checked={
              !!updatedAgentData.find(
                (user) => user.email === row.original.email
              )?.topcx_status
            }
            onChange={() => handleCheckboxChange(row.original)}
            style={{ minWidth: "2rem" }}
          />
        </div>
      ),
    },
  ];
  return (
    <>
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
            <Modal.Title>Edit permissions for </Modal.Title>
            <CloseButton
              onClick={() => {
                setEditTeamModalShow(false);
                // fetchRoleData();
              }}
            />
          </div>
          <AdvanceTableWrapper
            // columns={createRole}
            // data={featureData}
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
                // rowCount={featureData.length}
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
              // onClick={handleCreateRole}
            >
              submit
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
            <Modal.Title>Edit permissions for </Modal.Title>
            <CloseButton
              onClick={() => {
                setEditTeamLeadModalShow(false);
                // fetchRoleData();
              }}
            />
          </div>
          <AdvanceTableWrapper
            // columns={createRole}
            // data={featureData}
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
                // rowCount={featureData.length}
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
              // onClick={handleCreateRole}
            >
              submit
            </Button>
          </div>
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
            <Modal.Title>Edit permissions for </Modal.Title>
            <CloseButton
              onClick={() => {
                setEditRoleModalShow(false);
                // fetchRoleData();
              }}
            />
          </div>
          <AdvanceTableWrapper
            // columns={createRole}
            // data={featureData}
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
                // rowCount={featureData.length}
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
              // onClick={handleCreateRole}
            >
              submit
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Agents;

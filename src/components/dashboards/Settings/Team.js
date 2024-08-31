import React, { useEffect, useState } from "react";
import FalconComponentCard from "components/common/FalconComponentCard";
import AdvanceTableWrapper from "components/common/advance-table/AdvanceTableWrapper";
import AdvanceTable from "components/common/advance-table/AdvanceTable";
import AdvanceTableFooter from "components/common/advance-table/AdvanceTableFooter";
import AdvanceTableSearchBox from "components/common/advance-table/AdvanceTableSearchBox";
import {
  Row,
  Col,
  Tab,
  Tabs,
  Form,
  Dropdown,
  DropdownButton,
  Button,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Modal from "react-bootstrap/Modal";
import axios from "axios";

const Team = () => {
  const [data, setData] = useState([]);
  const [invited, setInvited] = useState([]);
  const [formData, setFormData] = useState({});
  const [modalShow2, setModalShow2] = React.useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectroleupdate, setSelectRoleUpdate] = useState("");
  const [allRoles, setAllRoles] = useState(["Select Role"]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [deleteRole, setDeleteRole] = useState("");

  console.log(inputValue, "------inputValue---------");
  console.log(selectedOption, "------selectedOption---------");

  // ................................................................APIs

  const sendInviteEmail = () => {
    const apiUrl = "https://topcx.ai/api/backend/AddUsers_SendInviteEmail";

    const postData = {
      invitee_email: inputValue,
      allowed_roles: selectedOption,
    };

    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("API response:", data);
      })
      .catch((error) => {
        console.error("Error sending invite:", error);
      });
  };

  useEffect(() => {
    const fetchData = async () => {
      const apiUrl = "https://topcx.ai/api/backend/AddUsers_fetchUsers";

      const queryParams = new URLSearchParams({});

      fetch(`${apiUrl}?${queryParams}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.users_data?.Users) {
            setData(data.users_data?.Users?.current);
            setInvited(data.users_data?.Users?.invited);
          } else {
            console.error("Fetched data.Users is not an array:", data);
          }
          if (data.all_roles && Array.isArray(data.all_roles)) {
            setAllRoles(data.all_roles);
          } else {
            console.error("Fetched data.all_roles is not an array:", data);
          }
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    };
    fetchData();
  }, []);

  const sendUpdateRole = () => {
    const apiUrl = "https://topcx.ai/api/backend/AddUsers_updateRole_Users";
    const postData = {
      update_user: selectedUser,
      update_role: selectroleupdate,
    };

    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("API response:", data);
      })
      .catch((error) => {
        console.error("Error sending invite:", error);
      });
  };

  //   ........................................................functions

  const handleOptionChange = (selectedRole) => {
    setSelectedOption(selectedRole);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleZendeskTicketIngestion();
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
  const handleRoleUpdate = (e) => {
    setSelectRoleUpdate(e.target.value);
  };
  const handleUserDelete = (e) => {
    setDeleteRole(e.target.value);
  };
  const handleRoleClick = (id) => {
    setSelectedUser(id || {});
  };
  // ............................Table Column
  const currentcolumns = [
    {
      Header: "Member",
      accessor: "FirstName",
    },
    {
      Header: "Email",
      accessor: "email",
    },
    {
      Header: "Role",
      accessor: "roles",
    },
    {
      Header: "Status",
      accessor: "status",
    },
    {
      Header: "Options",
      Cell: ({ row }) => (
        <div
          className="fs-0 mb-0 text-700 "
          style={{
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-around",
          }}
        >
          <span
            onClick={() => (
              setModalShow2(true), handleRoleClick(row.original.email)
            )}
          >
            <FontAwesomeIcon icon="edit" />
          </span>
          <span
          //   onClick={e => handleUserDelete(row.original.email)}
          >
            <FontAwesomeIcon icon="trash-alt" />
          </span>
        </div>
      ),
    },
  ];
  const invitedcolumns = [
    {
      Header: "Member",
      accessor: "FirstName",
    },
    {
      Header: "Email",
      accessor: "email",
    },
    {
      Header: "Role",
      accessor: "roles",
    },
  ];
  return (
    <div>
      <FalconComponentCard>
        <FalconComponentCard.Header
          title="Role Management"
          light={false}
          className="border-bottom border-200"
        />
        <Row className="mb-3 g-3">
          <Col md={12}>
            <FalconComponentCard noGuttersBottom>
              <FalconComponentCard.Body>
                <div className="d-flex align-items-center gap-3">
                  <Form.Group
                    as={Col}
                    lg={4}
                    className="mb-4"
                    controlId="InviteMember"
                  >
                    <Form.Label>Invite Member</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter Email"
                      value={formData.firstName}
                      name="firstName"
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                  <DropdownButton
                    id="dropdown-basic-button"
                    variant="falcon-default"
                    title={selectedOption || "Select Role"}
                    onSelect={handleOptionChange}
                  >
                    {allRoles.map((role) => (
                      <Dropdown.Item key={role} eventKey={role}>
                        {role}
                      </Dropdown.Item>
                    ))}
                  </DropdownButton>
                  <Button
                    variant="falcon-primary"
                    className="me-2"
                    onClick={sendInviteEmail}
                  >
                    Send Invite
                  </Button>
                </div>
                <Tabs
                  defaultActiveKey="Current"
                  id="uncontrolled-tab-example"
                  transition={false}
                >
                  <Tab
                    eventKey="Current"
                    title={`Current (${data.length})`}
                    className="border-bottom border-x p-3"
                  >
                    <>
                      <AdvanceTableWrapper
                        columns={currentcolumns}
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
                  </Tab>
                  <Tab
                    eventKey="Invited"
                    title={`Invited (${invited.length})`}
                    className="border-bottom border-x p-3"
                  >
                    <>
                      <AdvanceTableWrapper
                        columns={invitedcolumns}
                        data={invited}
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
                  </Tab>
                </Tabs>
                <Modal
                  show={modalShow2}
                  size="sg"
                  aria-labelledby="contained-modal-title-vcenter"
                  centered
                >
                  <Modal.Header
                    closeButton
                    onClick={() => setModalShow2(false)}
                  >
                    <Modal.Title id="contained-modal-title-vcenter">
                      Role change
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <p>Are you sure you want to change the role?</p>
                      <select
                        value={selectroleupdate}
                        onChange={handleRoleUpdate}
                        style={{
                          padding: "5px",
                          width: "200px",
                          borderRadius: "8px",
                          border: "1px solid grey",
                          marginTop: "1rem",
                        }}
                      >
                        <option value="" disabled>
                          Select a Role
                        </option>
                        {allRoles.map((role) => (
                          <option placeholder="hello" key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-around",
                        marginTop: "4rem",
                      }}
                    >
                      <button
                        onClick={() => setModalShow2(false)}
                        type="button"
                        className="btn btn-primary"
                        style={{
                          width: "40%",
                          fontSize: "14px",
                          height: "40px",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => (sendUpdateRole(), setModalShow2(false))}
                        type="button"
                        className="btn btn-primary"
                        style={{
                          width: "40%",
                          fontSize: "14px",
                          height: "40px",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </Modal.Body>
                  <Modal.Footer></Modal.Footer>
                </Modal>
              </FalconComponentCard.Body>
            </FalconComponentCard>
          </Col>
        </Row>
      </FalconComponentCard>
    </div>
  );
};

export default Team;

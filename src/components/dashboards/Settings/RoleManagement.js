import React, { useEffect, useState } from "react";
import FalconComponentCard from "components/common/FalconComponentCard";
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
import TooltipBadge from "components/common/TooltipBadge";

const RoleManagement = () => {
  const [data, setData] = useState([]);
  const [invited, setInvited] = useState([]);
  const [modalShow, setModalShow] = React.useState(false);
  const [modalShow2, setModalShow2] = React.useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectroleupdate, setSelectRoleUpdate] = useState("");
  const [allRoles, setAllRoles] = useState(["Select Role"]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [formData, setFormData] = useState({
    showFollowers: true,
    showEmail: true,
    showExperience: false,
    numberVisibility: true,
    allowFollow: false,
  });
  console.log(inputValue, "------inputValue---------");
  console.log(selectedOption, "------selectedOption---------");

  // ................................................................APIs

  useEffect(() => {
    const fetchData = async () => {
      const apiUrl = "https://topcx.ai/api/backend/AddUsers_fetchUsers";

      fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
          if (data.FeatureSet && data.Roles) {
            setFeatureSet(data?.FeatureSet);
            setRolesData(data?.Roles);
          } else {
            console.error("Invalid data structure:", data);
          }
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    };
    fetchData();
  }, []);

  //   ........................................................functions

  const handleChange = (e) => {
    if (e.target.type === "checkbox") {
      setFormData({
        ...formData,
        [e.target.name]: e.target.checked,
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

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
                      placeholder="Enter Role"
                      value={formData.firstName}
                      name="firstName"
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                  <Button
                    variant="falcon-primary"
                    className="me-2"
                    onClick={() => setModalShow(true)}
                  >
                    Send Invite
                  </Button>
                </div>
                <Modal
                  show={modalShow}
                  size="lg"
                  aria-labelledby="contained-modal-title-vcenter"
                  centered
                >
                  <Modal.Header closeButton onClick={() => setModalShow(false)}>
                    <Modal.Title id="contained-modal-title-vcenter">
                      Add Role
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <div>
                      <Form style={{ display: "flex", gap: "10px" }}>
                        <Form.Group
                          controlId="formRoleInput"
                          className="mb-3"
                          style={{ width: "40%" }}
                        >
                          <Form.Control
                            type="text"
                            placeholder="Add New Role"
                            value={inputValue}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Form>
                      <h6 className="fw-bold">
                        Role Permissions
                        <TooltipBadge
                          tooltip="Set Role Permissions"
                          icon="question-circle"
                        />
                      </h6>
                    </div>

                    <div className="modal-body">
                      <div className="form-check">
                        <div className="ps-2">
                          <Form.Check
                            type="switch"
                            id="custom-switch"
                            label="Make your phone number visible"
                            className="form-label-nogutter"
                            name="numberVisibility"
                            onChange={handleChange}
                            checked={formData.numberVisibility}
                          />
                        </div>
                      </div>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <button
                      onClick={() => setModalShow(true)}
                      type="button"
                      className="btn btn-primary"
                      style={{
                        width: "100%",
                        fontSize: "14px",
                        height: "40px",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      Add Role
                    </button>
                  </Modal.Footer>
                </Modal>
                <Modal
                  show={modalShow2}
                  size="lg"
                  aria-labelledby="contained-modal-title-vcenter"
                  centered
                >
                  <Modal.Header
                    closeButton
                    onClick={() => setModalShow2(false)}
                  >
                    <Modal.Title id="contained-modal-title-vcenter">
                      Confirm Delete
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <p
                      className="mb-2"
                      style={{
                        fontSize: "22px",
                        fontWeight: "bold",
                        color: "black",
                      }}
                    >
                      Are you sure you want to delete this role?
                    </p>
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
                        onClick={() => (
                          handleRemoveRole(selectedRole), setModalShow2(false)
                          // sendRoles()
                        )}
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
                        Delete
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

export default RoleManagement;

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
const Roles = () => {
  const {
    register,
    watch,
    formState: { errors },
    reset,
  } = useForm();

  // Modal
  const [roleModalShow, setRoleModalShow] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [editFeaturesModalShow, setEditFeaturesModalShow] = useState(false);
  const [editAssignedToShow, setEditAssignedToShow] = useState(false);

  const [roleData, setRoleData] = useState([]);
  const [featureData, setFeatureData] = useState([]);
  const [agentData, setAgentData] = useState([]);
  const [agents, setAgents] = useState([]);

  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isLoadingCreateRoles, setIsLoadingCreateRoles] = useState(false);
  const [isLoadingUpdatePermissions, setIsLoadingUpdatePermissions] =
    useState(false);
  const [isLoadingUpdateAgents, setIsLoadingUpdateAgents] = useState(false);

  const fetchRoleData = async () => {
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };
    const agentData = {
      get_type: "fetch",
    };
    try {
      setIsLoadingRoles(true);
      const response = await axios.post(
        ApiConfig.agentsDetailsRefresh,
        agentData,
        config
      );
      const mappedData = Object.entries(
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
      setRoleData(mappedData);
      const featureData = Object.entries(
        response?.data?.RoleManagement?.topcx_features
      ).map(([key, value]) => ({
        feature: key,
        permissions: value,
      }));
      setFeatureData(featureData);
      setAgentData(response?.data?.AgentManagement);
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error, {
        theme: "colored",
      });
    } finally {
      setIsLoadingRoles(false);
    }
  };

  useEffect(() => {
    fetchRoleData();
  }, []);

  const handleDeleteRole = async (data) => {
    const deleteTeamAPIData = {
      role_name: data.role,
      role_origin: data.origin,
      delete_role: true,
    };
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };
    try {
      await axios.post(ApiConfig.deleteRole, deleteTeamAPIData, config);
      toast.success("Role deleted successfully", {
        theme: "colored",
      });
      fetchRoleData();
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error, {
        theme: "colored",
      });
    }
  };

  const handleEditFeatures = (role) => {
    setSelectedRole(role);
    setEditFeaturesModalShow(true);
  };

  const roles = [
    {
      accessor: "role",
      Header: "Role",
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
      accessor: "assigned_to",
      Header: "Assigned to",
      Cell: ({ row }) => (
        <Button
          variant="link"
          onClick={() => {
            setSelectedRole(row.original);
            setAgents(
              agentData.map((agent) => {
                const isInRole = row.original.assigned_to.some(
                  (member) => member.id === agent.id
                );
                return {
                  ...agent,
                  isChecked: isInRole,
                };
              })
            );
            setEditAssignedToShow(true);
          }}
        >
          {row.original.assigned_to.length}
        </Button>
      ),
    },
    {
      accessor: "features",
      Header: "Permissions",
      Cell: ({ row }) => (
        <Button
          variant="link"
          onClick={() => {
            if (row.original.origin === "default") {
              toast.error("You cannot edit the default role.", {
                theme: "colored",
              });
            } else {
              handleEditFeatures(row.original);
            }
          }}
        >
          {Object.keys(row.original.features).length}
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
            if (row.original.origin === "default") {
              toast.error("You cannot delete the default role.", {
                theme: "colored",
              });
            } else {
              handleDeleteRole(row.original);
            }
          }}
        >
          <FontAwesomeIcon icon={"trash"} />
        </Button>
      ),
    },
  ];

  const handleCreateRole = async () => {
    const name = watch("name");
    const desc = watch("desc");
    const roleFeatures = {};

    // Iterate over featureData to compile selected features and permissions.
    featureData.forEach((feature) => {
      const isSelected = watch(`selected_${feature.feature}`);
      const permission = watch(`permission_${feature.feature}`);
      if (isSelected) {
        roleFeatures[feature.feature] = permission;
      }
    });

    if (name && desc) {
      const createRoleAPIData = {
        role_name: name,
        role_desc: desc,
        role_features: roleFeatures,
      };

      const config = {
        headers: { "Access-Control-Allow-Origin": "*" },
        withCredentials: true,
      };

      try {
        setIsLoadingCreateRoles(true);
        await axios.post(ApiConfig.createRole, createRoleAPIData, config);
        setRoleModalShow(false);
        fetchRoleData();
        reset({ name: "", desc: "" });
        toast.success("Role created successfully", {
          theme: "colored",
        });
      } catch (error) {
        toast.error(error.response?.data?.detail?.masked_error, {
          theme: "colored",
        });
      } finally {
        setIsLoadingCreateRoles(false);
      }
    }
  };

  const createRole = [
    {
      Header: "Feature Name",
      accessor: "feature",
      Cell: ({ row }) => (
        <Form.Check
          type="checkbox"
          id={`checkbox-${row.original.feature}`}
          className="my-auto"
          label={<p className="m-0 ms-2">{row.original.feature}</p>}
          {...register(`selected_${row.original.feature}`)}
        />
      ),
    },
    {
      Header: "Permissions",
      accessor: "permissions",
      Cell: ({ row }) => {
        return (
          <Form.Select
            size="sm"
            {...register(`permission_${row.original.feature}`)}
          >
            {row.original.permissions.map((permission, index) => (
              <option key={index} value={permission}>
                {permission}
              </option>
            ))}
          </Form.Select>
        );
      },
    },
  ];

  const handleFeatureSelectionChange = (featureKey, isSelected) => {
    const updatedFeatures = isSelected
      ? {
          ...selectedRole.features,
          [featureKey]: featureData.find((f) => f.feature === featureKey)
            .permissions[0],
        }
      : Object.keys(selectedRole.features).reduce((acc, key) => {
          if (key !== featureKey) acc[key] = selectedRole.features[key];
          return acc;
        }, {});

    setSelectedRole({ ...selectedRole, features: updatedFeatures });
  };

  const handleFeaturePermissionChange = (featureKey, newPermission) => {
    const updatedFeatures = {
      ...selectedRole.features,
      [featureKey]: newPermission,
    };

    setSelectedRole({ ...selectedRole, features: updatedFeatures });
  };
  const handleUpdateRole = async () => {
    const roleFeatures = Object.keys(selectedRole.features).reduce(
      (acc, featureKey) => {
        acc[featureKey] = selectedRole.features[featureKey];
        return acc;
      },
      {}
    );

    // Prepare the API data
    const updateRoleAPIData = {
      role_name: selectedRole.role,
      role_origin: "custom",
      role_features: roleFeatures,
    };

    // Config remains the same
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };

    try {
      setIsLoadingUpdatePermissions(true);
      await axios.post(ApiConfig.updateRole, updateRoleAPIData, config);
      setEditFeaturesModalShow(false);
      fetchRoleData();
      toast.success("Role updated successfully", {
        theme: "colored",
      });
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error, {
        theme: "colored",
      });
    } finally {
      setIsLoadingUpdatePermissions(false);
    }
  };

  const updateRole = [
    {
      Header: "Feature Name",
      accessor: "feature",
      Cell: ({ row }) => (
        <Form.Check
          type="checkbox"
          id={`checkbox-${row.original.feature}`}
          className="my-auto"
          label={<p className="m-0 ms-2">{row.original.feature}</p>}
          checked={selectedRole?.features.hasOwnProperty(row.original.feature)}
          onChange={(e) =>
            handleFeatureSelectionChange(row.original.feature, e.target.checked)
          }
        />
      ),
    },
    {
      Header: "Permissions",
      accessor: "permissions",
      Cell: ({ row }) => {
        return (
          <Form.Select
            size="sm"
            value={selectedRole?.features[row.original.feature] || ""}
            onChange={(e) =>
              handleFeaturePermissionChange(
                row.original.feature,
                e.target.value
              )
            }
          >
            {row.original.permissions.map((permission, index) => (
              <option key={index} value={permission}>
                {permission}
              </option>
            ))}
          </Form.Select>
        );
      },
    },
  ];
  const updateAgents = (selectedAgent, isChecked) => {
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

  const submitUpdatedAgent = async () => {
    const agentsData = agents.map((agent) => ({
      assignee_email: agent.email,
      assignee_name: agent.name,
      assignee_id: agent.id,
      assignee_status: agent.topcx_status,
      assigned_role: selectedRole.role,
      isChecked: agent.isChecked,
    }));
    const apiData = {
      agentList: agentsData,
    };
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };
    try {
      setIsLoadingUpdateAgents(true);
      await axios.post(ApiConfig.updateAgent, apiData, config);
      toast.success("Role updated successfully", {
        theme: "colored",
      });
      fetchRoleData();
      setEditAssignedToShow(false);
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error, {
        theme: "colored",
      });
    } finally {
      setIsLoadingUpdateAgents(false);
    }
  };
  const agentColumns = [
    {
      Header: "Name",
      accessor: "name",
      Cell: ({ row }) => (
        <Form.Check
          type="checkbox"
          id={`checkbox-${row.original.name}`}
          className="my-auto"
          label={<p className="m-0 ms-2">{row.original.name}</p>}
          checked={
            agents.find((agent) => agent.id === row.original.id).isChecked
          }
          onChange={(e) => updateAgents(row.original, e.target.checked)}
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
      {isLoadingRoles ? (
        <div className="text-center my-2">
          <div className="lds-hourglass"></div>
        </div>
      ) : (
        <AdvanceTableWrapper
          columns={roles}
          data={roleData}
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
                  onClick={() => setRoleModalShow(true)}
                >
                  + Create custom role
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
              rowCount={roleData.length}
              table
              rowInfo
              navButtons
              rowsPerPageSelection
            />
          </div>
        </AdvanceTableWrapper>
      )}
      <Modal
        show={roleModalShow}
        onHide={() => setRoleModalShow(false)}
        backdrop="static"
        keyboard={false}
        size="lg"
        centered
      >
        <Modal.Body>
          <div className="d-flex justify-content-end mb-3">
            <CloseButton
              onClick={() => {
                setRoleModalShow(false);
                reset({ name: "", desc: "" });
              }}
            />
          </div>
          <h3 className="text-center">Create new Role</h3>

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

          <AdvanceTableWrapper
            columns={createRole}
            data={featureData}
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
                rowCount={featureData.length}
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
              onClick={handleCreateRole}
              disabled={isLoadingCreateRoles}
            >
              {isLoadingCreateRoles ? "submitting..." : "submit"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={editFeaturesModalShow}
        onHide={() => setEditFeaturesModalShow(false)}
        backdrop="static"
        keyboard={false}
        size="lg"
        centered
      >
        <Modal.Body>
          <div className="d-flex justify-content-between mb-3">
            <Modal.Title>Edit permissions for {selectedRole?.role}</Modal.Title>
            <CloseButton
              onClick={() => {
                setEditFeaturesModalShow(false);
              }}
            />
          </div>
          <AdvanceTableWrapper
            columns={updateRole}
            data={featureData}
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
                rowCount={featureData.length}
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
              onClick={handleUpdateRole}
              disabled={isLoadingUpdatePermissions}
            >
              {isLoadingUpdatePermissions ? "submitting..." : "submit"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={editAssignedToShow}
        onHide={() => setEditAssignedToShow(false)}
        backdrop="static"
        keyboard={false}
        size="lg"
        centered
      >
        <Modal.Body>
          <div className="d-flex justify-content-between mb-3">
            <Modal.Title>Edit permissions for {selectedRole?.role}</Modal.Title>
            <CloseButton
              onClick={() => {
                setEditAssignedToShow(false);
              }}
            />
          </div>
          <AdvanceTableWrapper
            columns={agentColumns}
            data={agentData}
            sortable
            pagination
            perPage={5}
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
              onClick={submitUpdatedAgent}
              disabled={isLoadingUpdateAgents}
            >
              {isLoadingUpdateAgents ? "submitting..." : "submit"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Roles;

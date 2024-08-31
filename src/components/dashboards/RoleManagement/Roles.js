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

const Roles = () => {
  const {
    register,
    watch,
    formState: { errors },
    trigger,
    reset,
    setError,
    clearErrors,
  } = useForm();

  // Modal
  const [roleModalShow, setRoleModalShow] = useState(false);
  const [editFeaturesModalShow, setEditFeaturesModalShow] = useState(false);
  const [editAssignedToShow, setEditAssignedToShow] = useState(false);
  const [confirmDeleteShow, setConfirmDeleteShow] = useState(false);

  const [selectedRole, setSelectedRole] = useState(null);
  const [deleteRole, setDeleteRole] = useState({});

  const [roleData, setRoleData] = useState([]);
  const [featureData, setFeatureData] = useState([]);
  const [agentData, setAgentData] = useState([]);
  const [agents, setAgents] = useState([]);

  const [agentsChanged, setAgentsChanged] = useState(false);
  const [permissionsChanged, setPermissionsChanged] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchMember, setSearchMember] = useState("");
  const [searchPermission, setSearchPermission] = useState("");

  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isLoadingCreateRoles, setIsLoadingCreateRoles] = useState(false);
  const [isLoadingUpdatePermissions, setIsLoadingUpdatePermissions] =
    useState(false);
  const [isLoadingUpdateAgents, setIsLoadingUpdateAgents] = useState(false);
  const [isLoadingDeleteRole, setIsLoadingDeleteRole] = useState(false);

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
      toast.error(error.response?.data?.detail?.masked_error);
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
      setIsLoadingDeleteRole(true);
      await axios.post(ApiConfig.deleteRole, deleteTeamAPIData, config);
      const updatedRoleData = roleData.filter(
        (role) => role.role !== data.role
      );
      setRoleData(updatedRoleData);
      toast.success("Role deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error);
    } finally {
      setConfirmDeleteShow(false);
      setIsLoadingDeleteRole(false);
    }
  };

  const filteredSortedRoles = useMemo(() => {
    const filtered = roleData.filter((role) => {
      return role?.role?.toLowerCase()?.includes(searchTerm);
    });
    return filtered;
  }, [roleData, searchTerm]);

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
        <p className="m-0 text-wrap" style={{ maxWidth: "35rem" }}>
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
            const sortedAgents = agentData
              .map((agent) => ({
                ...agent,
                isChecked: row.original.assigned_to.some(
                  (member) => member.id === agent.id
                ),
              }))
              .sort((a, b) => b.isChecked - a.isChecked);

            setAgentData(sortedAgents);
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
            setSelectedRole(row.original);
            const sortedFeatures = featureData
              .map((feature) => ({
                ...feature,
                isChecked: Object.prototype.hasOwnProperty.call(
                  row.original.features,
                  feature.feature
                ),
              }))
              .sort((a, b) => b.isChecked - a.isChecked);

            setFeatureData(sortedFeatures); // You might want to manage state differently if this affects other uses of featureData
            setEditFeaturesModalShow(true);
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
              toast.error("You cannot delete the default role.");
            } else {
              setDeleteRole(row.original);
              setConfirmDeleteShow(true);
            }
          }}
        >
          <FontAwesomeIcon icon={"trash"} />
        </Button>
      ),
    },
  ];

  const handleCreateRole = async () => {
    const name = await trigger("name");
    const desc = await trigger("desc");
    const roleFeatures = {};

    // Iterate over featureData to compile selected features and permissions.
    let isFeatureSelected = false;
    featureData.forEach((feature) => {
      const isSelected = watch(`selected_${feature.feature}`);
      const permission = watch(`permission_${feature.feature}`);
      if (isSelected) {
        roleFeatures[feature.feature] = permission;
        isFeatureSelected = true;
      }
    });

    if (!isFeatureSelected) {
      setError("features", {
        type: "manual",
        message: "At least one feature must be selected",
      });
    } else {
      clearErrors("features"); // Clear errors if validation passes.
    }
    if (name && desc & (Object.keys(roleFeatures).length > 0)) {
      const createRoleAPIData = {
        role_name: watch("name"),
        role_desc: watch("desc"),
        role_features: roleFeatures,
      };

      const config = {
        headers: { "Access-Control-Allow-Origin": "*" },
        withCredentials: true,
      };

      try {
        setIsLoadingCreateRoles(true);
        await axios.post(ApiConfig.createRole, createRoleAPIData, config);
        const newRole = {
          role: watch("name"),
          description: watch("desc"),
          assigned_to: [],
          origin: "custom",
          features: roleFeatures,
        };
        setRoleData((roles) => [...roles, newRole]);
        reset({ name: "", desc: "" });
        toast.success("Role created successfully");
      } catch (error) {
        toast.error(error.response?.data?.detail?.masked_error);
      } finally {
        setRoleModalShow(false);
        setIsLoadingCreateRoles(false);
      }
    }
  };

  const createRole = [
    {
      Header: "Feature Name",
      accessor: "feature",
      Cell: ({ row }) => (
        <>
          <Form.Check
            type="checkbox"
            id={`checkbox-${row.original.feature}`}
            className="my-auto"
            label={<p className="m-0 ms-2">{row.original.feature}</p>}
            {...register(`selected_${row.original.feature}`)}
          />
          {/* {errors.features && (
            <Form.Control.Feedback type="invalid" style={{ display: "block" }}>
              {errors.features.message}
            </Form.Control.Feedback>
          )} */}
        </>
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
    // const updatedFeatures = isSelected
    //   ? {
    //       ...selectedRole.features,
    //       [featureKey]: featureData.find((f) => f.feature === featureKey)
    //         .permissions[0],
    //     }
    //   : Object.keys(selectedRole.features).reduce((acc, key) => {
    //       if (key !== featureKey) acc[key] = selectedRole.features[key];
    //       return acc;
    //     }, {});

    // setSelectedRole({ ...selectedRole, features: updatedFeatures });
    const updatedFeatures = isSelected
      ? {
          ...selectedRole.features,
          [featureKey]: featureData.find((f) => f.feature === featureKey)
            .permissions[0], // Automatically select the first permission
        }
      : Object.keys(selectedRole.features).reduce((acc, key) => {
          if (key !== featureKey) acc[key] = selectedRole.features[key];
          return acc;
        }, {});

    setSelectedRole({ ...selectedRole, features: updatedFeatures });
    setPermissionsChanged(true);
  };

  const handleFeaturePermissionChange = (featureKey, newPermission) => {
    const updatedFeatures = {
      ...selectedRole.features,
      [featureKey]: newPermission,
    };

    setSelectedRole({ ...selectedRole, features: updatedFeatures });
    setPermissionsChanged(true);
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
      // roleData.find((role) => role.role === selectedRole.role).features = {};
      roleData.find((role) => role.role === selectedRole.role).features =
        roleFeatures;
      toast.success("Permissions updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error);
    } finally {
      setEditFeaturesModalShow(false);
      resetPaginationFeatures();
      setIsLoadingUpdatePermissions(false);
      setPermissionsChanged(false);
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
          // checked={selectedRole?.features.hasOwnProperty(row.original.feature)}
          checked={Object.prototype.hasOwnProperty.call(
            selectedRole?.features,
            row.original.feature
          )}
          onChange={(e) =>
            handleFeatureSelectionChange(row.original.feature, e.target.checked)
          }
          disabled={selectedRole.origin === "default"}
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
            disabled={selectedRole.origin === "default"}
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
            setAgentsChanged(true); // Set change detected to true
          }
          return { ...agent, isChecked };
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

      roleData.find(
        (role) => role.role === selectedRole.role
      ).assigned_to.length = 0;
      roleData
        .find((role) => role.role === selectedRole.role)
        .assigned_to.push(
          ...agents
            .filter((a) => a.isChecked)
            .map((a) => ({
              email: a.email,
              name: a.name,
              id: a.id,
            }))
        );
      toast.success("Agents updated successfully", {
        theme: "colored",
      });
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error);
    } finally {
      setEditAssignedToShow(false);
      resetPaginationAgents();
      setIsLoadingUpdateAgents(false);
      setAgentsChanged(false);
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
          disabled={
            selectedRole?.role === "Account Owner" ||
            row.original.topcx_roles.includes("Account Owner")
          }
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

  // Handel Pagination
  const {
    currentPageData: currentPageRoles,
    setPageSize: setPageSizeRoles,
    nextPage: nextPageRoles,
    previousPage: previousPageRoles,
    canNextPage: canNextPageRoles,
    canPreviousPage: canPreviousPageRoles,
    pageIndex: pageIndexRoles,
    pageSize: pageSizeRoles,
  } = usePagination(filteredSortedRoles);

  const {
    currentPageData: currentPageFeatures,
    setPageSize: setPageSizeFeatures,
    nextPage: nextPageFeatures,
    previousPage: previousPageFeatures,
    canNextPage: canNextPageFeatures,
    canPreviousPage: canPreviousPageFeatures,
    resetPagination: resetPaginationFeatures,
    pageIndex: pageIndexFeatures,
    pageSize: pageSizeFeatures,
  } = usePagination(
    featureData.filter((feature) =>
      feature.feature.toLowerCase().includes(searchPermission.toLowerCase())
    )
  );

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

  return (
    <>
      {isLoadingRoles ? (
        <Loader />
      ) : (
        <AdvanceTableWrapper
          key={pageSizeRoles}
          columns={roles}
          data={currentPageRoles}
          sortable
          pagination
          perPage={pageSizeRoles}
        >
          <Row className="mb-3">
            <Col xs={12} sm={8} lg={7}>
              <Row>
                <Col xs={12} sm={6} lg={8}>
                  <InputGroup size="sm">
                    <FormControl
                      aria-label="Search Agents"
                      aria-describedby="inputGroup-sizing-sm"
                      placeholder="Search roles..."
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
                  onClick={() => {
                    setRoleModalShow(true);
                  }}
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
          {roleData.length > 0 ? (
            <div className="mt-3">
              <AdvanceTableFooter
                pageIndex={pageIndexRoles}
                pageSize={pageSizeRoles}
                nextPage={nextPageRoles}
                previousPage={previousPageRoles}
                canNextPage={canNextPageRoles}
                canPreviousPage={canPreviousPageRoles}
                page={currentPageRoles}
                rowCount={filteredSortedRoles.length}
                setPageSize={setPageSizeRoles}
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

          {errors.features && (
            <Form.Control.Feedback type="invalid" style={{ display: "block" }}>
              {errors.features.message}
            </Form.Control.Feedback>
          )}
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
              {isLoadingCreateRoles ? "SUBMITTING..." : "SUBMIT"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
      <Modal
        show={editFeaturesModalShow}
        onHide={() => {
          setEditFeaturesModalShow(false);
          resetPaginationFeatures();
          setPermissionsChanged(false);
        }}
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
                resetPaginationFeatures();
                setPermissionsChanged(false);
              }}
            />
          </div>
          <AdvanceTableWrapper
            // columns={updateRole}
            // data={featureData}
            // sortable
            // pagination
            // perPage={5}
            key={pageSizeFeatures}
            columns={updateRole}
            data={currentPageFeatures}
            sortable
            pagination
            perPage={pageSizeFeatures}
          >
            <Row className="mb-3">
              <Col xs={12} sm={6} lg={6}>
                <InputGroup size="sm">
                  <FormControl
                    aria-label="Search Agents"
                    aria-describedby="inputGroup-sizing-sm"
                    placeholder="Search teams..."
                    value={searchPermission}
                    onChange={(e) =>
                      setSearchPermission(e.target.value.toLowerCase())
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
            {selectedRole?.origin === "default" ? (
              <p
                className="text-center text-muted m-0 mt-1"
                style={{ fontSize: " 0.8rem" }}
              >
                Default roles are not editable.
              </p>
            ) : (
              <></>
            )}
            {featureData.length > 0 ? (
              <>
                <div className="mt-3">
                  <AdvanceTableFooter
                    // rowCount={featureData.length}
                    // table
                    // rowInfo
                    // navButtons
                    // rowsPerPageSelection
                    pageIndex={pageIndexFeatures}
                    pageSize={pageSizeFeatures}
                    nextPage={nextPageFeatures}
                    previousPage={previousPageFeatures}
                    canNextPage={canNextPageFeatures}
                    canPreviousPage={canPreviousPageFeatures}
                    page={currentPageFeatures}
                    rowCount={filteredSortedRoles.length}
                    setPageSize={setPageSizeFeatures}
                    rowInfo
                    rowsPerPageSelection
                    navButtons
                  />
                </div>

                {selectedRole?.origin === "default" ? (
                  <></>
                ) : (
                  <div
                    className="btn-group mx-auto d-flex justify-content-center w-50 mt-4 mb-3"
                    role="group"
                    aria-label="Basic mixed styles example"
                  >
                    <Button
                      variant="falcon-success"
                      type="submit"
                      onClick={handleUpdateRole}
                      disabled={
                        isLoadingUpdatePermissions || !permissionsChanged
                      }
                    >
                      {isLoadingUpdatePermissions ? "submitting..." : "submit"}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <h5 className="text-muted text-center my-5">No Data Found</h5>
            )}
          </AdvanceTableWrapper>
        </Modal.Body>
      </Modal>
      <Modal
        show={editAssignedToShow}
        onHide={() => {
          setEditAssignedToShow(false);
          resetPaginationAgents();
          setAgentsChanged(false);
        }}
        backdrop="static"
        keyboard={false}
        size="lg"
        centered
      >
        <Modal.Body>
          <div className="d-flex justify-content-between mb-3">
            <Modal.Title>Edit members for {selectedRole?.role}</Modal.Title>
            <CloseButton
              onClick={() => {
                setEditAssignedToShow(false);
                resetPaginationAgents();
                setAgentsChanged(false);
              }}
            />
          </div>
          <AdvanceTableWrapper
            // columns={agentColumns}
            // data={agentData}
            // sortable
            // pagination
            // perPage={5}
            key={pageSizeAgents}
            columns={agentColumns}
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
            {selectedRole?.role === "Account Owner" ? (
              <p
                className="text-center text-muted m-0 mt-1"
                style={{ fontSize: " 0.8rem" }}
              >
                The account owner role is non-transferable.
              </p>
            ) : (
              <></>
            )}
            {agentData ? (
              <>
                <div className="mt-3">
                  <AdvanceTableFooter
                    // rowCount={agentData?.length}
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
                {selectedRole?.role === "Account Owner" ? (
                  <></>
                ) : (
                  <div
                    className="btn-group mx-auto d-flex justify-content-center w-50 mt-4 mb-3"
                    role="group"
                    aria-label="Basic mixed styles example"
                  >
                    <Button
                      variant="falcon-success"
                      type="submit"
                      onClick={submitUpdatedAgent}
                      disabled={isLoadingUpdateAgents || !agentsChanged}
                    >
                      {isLoadingUpdateAgents ? "submitting..." : "submit"}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <h5 className="text-muted text-center my-5">No Data Found</h5>
            )}
          </AdvanceTableWrapper>
        </Modal.Body>
      </Modal>
      <Modal
        show={confirmDeleteShow}
        onHide={() => setConfirmDeleteShow(false)}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete role?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="falcon-default"
            onClick={() => setConfirmDeleteShow(false)}
          >
            Close
          </Button>
          <Button
            variant="falcon-danger"
            disabled={isLoadingDeleteRole}
            onClick={() => {
              handleDeleteRole(deleteRole);
            }}
          >
            {isLoadingDeleteRole ? "Loading..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Roles;

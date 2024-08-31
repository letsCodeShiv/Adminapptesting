import React, { useState, useEffect } from "react";
import AdvanceTableWrapper from "components/common/advance-table/AdvanceTableWrapper";
import AdvanceTable from "components/common/advance-table/AdvanceTable";
import AdvanceTableFooter from "components/common/advance-table/AdvanceTableFooter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Dropdown,
  Form,
  Button,
  Modal,
  CloseButton,
  ButtonGroup,
} from "react-bootstrap";
import { ApiConfig } from "config/ApiConfig";
import axios from "axios";
import { toast } from "react-toastify";
import ResolutionModal from "./ResolutionModal";
import SurveyModal from "./SurveyModal";
import AnalyticsModal from "./AnalyticsModal";
import "./Modules.css";
const Modules = () => {
  const [data, setData] = useState([]);

  // Modal -----------------------------------------------------------------
  const [show, setShow] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);

  const handleClose = () => {
    setShow(false);
    setEditingFeature(null);
  };

  const handleShow = () => setShow(true);
  // Modal -----------------------------------------------------------------

  useEffect(() => {
    const fetchUserData = async () => {
      const config = {
        headers: { "Access-Control-Allow-Origin": "*" },
        withCredentials: true,
      };
      try {
        const response = await axios.get(ApiConfig.features, config);
        const modifiedData = response?.data?.topcx_app_modules.map(
          (module) => ({
            ...module,
            groups: [
              ...module.allowed_groups.map((group) => ({
                ...group,
                isChecked: true,
              })),
              ...module.remaining_groups.map((group) => ({
                ...group,
                isChecked: false,
              })),
            ],
            disableGroupSelection: module.disable_group_selection,
            subscriptionStatus: module.subscription_status,
          })
        );
        setData(modifiedData);
      } catch (error) {
        toast.error(error.response?.data?.detail?.masked_error);
      }
    };

    fetchUserData();
  }, []);

  // Bootstrap Dropdown -----------------------------------------------------------------
  const CustomToggle = React.forwardRef(({ children, onClick, count }, ref) => (
    <a
      href=""
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
    >
      {children} ({count}) &#x25bc;
    </a>
  ));

  const CustomMenu = React.forwardRef(
    (
      {
        children,
        style,
        className,
        customStyle,
        customClassName,
        "aria-labelledby": labeledBy,
      },
      ref
    ) => {
      const [value, setValue] = useState("");

      const filteredChildren = React.Children.toArray(children).filter(
        (child) => {
          const label = child?.props?.label;
          return label && label.toLowerCase().includes(value.toLowerCase());
        }
      );

      return (
        <div
          ref={ref}
          style={{ ...style, ...customStyle }}
          className={`${className} ${customClassName}`}
          aria-labelledby={labeledBy}
        >
          <Form.Control
            autoFocus
            className="mx-3 my-2 w-auto"
            placeholder="Type to filter..."
            onChange={(e) => setValue(e.target.value)}
            value={value}
          />
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            <ul className="list-unstyled">{filteredChildren}</ul>
          </div>
        </div>
      );
    }
  );

  // Bootstrap Dropdown -----------------------------------------------------------------

  const handleCheckChange = (e, module, groupIndex) => {
    // e.preventDefault();
    // e.stopPropagation();
    const newData = data.map((mod) => {
      if (mod.name === module.name) {
        const newGroups = [...mod.groups];
        newGroups[groupIndex].isChecked = !newGroups[groupIndex].isChecked;
        return { ...mod, groups: newGroups };
      }
      return mod;
    });
    setData(newData);
  };

  const handleUpdate = async (featureName) => {
    const featureData = data.find((feature) => feature.name === featureName);
    if (!featureData) {
      console.warn("Feature data not found for:", featureName);
      return;
    }

    const updatedAllowedGroups = featureData.groups.filter(
      (group) => group.isChecked
    );

    const featureAPIData = {
      feature_name: featureName,
      allowed_groups_all: updatedAllowedGroups,
    };
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };
    try {
      await axios.post(ApiConfig.featureUpdate, featureAPIData, config);
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error);
    }
  };

  const columns = [
    {
      accessor: "name",
      Header: "Feature",
      Cell: ({ value }) => <p>{value}</p>,
    },
    {
      accessor: "desc",
      Header: "Description",
      Cell: ({ value }) => (
        <p className="text-wrap text-break" style={{ maxWidth: "250px" }}>
          {value}
        </p>
      ),
    },
    {
      accessor: "group",
      Header: "Group",
      Cell: ({ row }) => (
        <Dropdown className="m-0" autoClose="outside">
          <Dropdown.Toggle
            as={CustomToggle}
            id={`dropdown-custom-components-${row.original.name}`}
            count={
              row.original.groups.filter((group) => group.isChecked).length
            }
          />

          <Dropdown.Menu
            customStyle={{ backgroundColor: "#f8f9fa" }}
            customClassName="myCustomClass"
            as={CustomMenu}
          >
            <Dropdown.Divider />
            {row.original.groups.map((group, index) => (
              <Dropdown.Item
                key={group.id}
                label={group.name}
                className="p-0 px-1"
              >
                {/* {group.name && ( */}
                <Form.Check
                  className="py-0"
                  type="checkbox"
                  label={<span className="m-0 ms-2">{group.name}</span>}
                  checked={group.isChecked}
                  onChange={(e) => handleCheckChange(e, row.original, index)}
                  disabled={
                    row.original.disableGroupSelection &&
                    row.original.allowed_groups.some(
                      (allowedGroup) => allowedGroup.id === group.id
                    )
                  }
                />

                {/* )} */}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      ),
    },
    {
      accessor: "edit",
      Header: "Edit",
      Cell: ({ row }) => (
        <Button
          variant="link"
          onClick={() => {
            setEditingFeature(row.original);
            handleShow();
          }}
        >
          <FontAwesomeIcon icon={"pencil-alt"} />
        </Button>
      ),
    },
    {
      accessor: "update",
      Header: "Update",
      Cell: ({ row }) =>
        row.original.subscriptionStatus ? (
          <ButtonGroup aria-label="Basic example">
            <Button
              variant="falcon-warning"
              onClick={() => handleUpdate(row.original.name)}
            >
              Update
            </Button>
            <Button variant="falcon-default">Deactivate</Button>
          </ButtonGroup>
        ) : (
          <Button
            variant="falcon-danger"
            onClick={() => handleUpdate(row.original.name)}
          >
            Activate
          </Button>
        ),
    },
  ];

  return (
    <>
      <AdvanceTableWrapper
        columns={columns}
        data={data}
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
            rowCount={data.length}
            table
            rowInfo
            navButtons
            rowsPerPageSelection
          />
        </div>
      </AdvanceTableWrapper>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        size="lg"
        centered
      >
        <Modal.Body>
          <div className="d-flex justify-content-end">
            <CloseButton onClick={handleClose} />
          </div>
          {editingFeature ? (
            <>
              {(() => {
                if (editingFeature.name === "Resolution Screen") {
                  return <ResolutionModal data={editingFeature} />;
                } else if (editingFeature.name === "Feedback Survey") {
                  return <SurveyModal data={editingFeature} />;
                } else if (editingFeature.name === "Analytics Dashboard") {
                  return <AnalyticsModal data={editingFeature} />;
                }
              })()}
            </>
          ) : (
            <h3>Ooopss... Something went worong..!!</h3>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Modules;

import React, { useEffect, useState, useContext, useRef } from "react";
import FalconComponentCard from "components/common/FalconComponentCard";
import FalconDropzone from "components/common/FalconDropzone";
import AdvanceTableWrapper from "components/common/advance-table/AdvanceTableWrapper";
import AdvanceTable from "components/common/advance-table/AdvanceTable";
import AdvanceTableFooter from "components/common/advance-table/AdvanceTableFooter";
import AdvanceTableSearchBox from "components/common/advance-table/AdvanceTableSearchBox";
import {
  Row,
  Col,
  Tab,
  Tabs,
  Card,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Label,
} from "react-bootstrap";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SoftBadge from "components/common/SoftBadge";
import CountUp from "react-countup";
import Avatar from "components/common/Avatar";
import { isIterableArray } from "helpers/utils";
import { AuthWizardContext } from "context/Context";
import avatarImg from "assets/img/team/avatar.png";
import Flex from "components/common/Flex";
import cloudUpload from "assets/img/icons/cloud-upload.svg";
const validFileTypes = [
  "text/plain",
  "text/markdown",
  "text/rtf",
  "text/csv",
  "text/tab-separated-values",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint.presentation.macroEnabled.12",
  "application/json",
];

const KnowledgeBase = () => {
  const { user } = useContext(AuthWizardContext);
  const [data, setData] = useState([]);
  const [rate, setRate] = useState([]);
  const [links, setLinks] = useState([]);
  const [files, setFiles] = useState([]);
  const [groups, setGroups] = useState({});
  const [allowedGroups, setAllowedGroups] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedGroups, setSelectedGroups] = useState({});
  // ................................................................ Drop Table start
  useEffect(() => {
    const fetchData = async () => {
      const config = {
        headers: { "Access-Control-Allow-Origin": "*" },
        withCredentials: true,
      };

      try {
        const response = await axios.get(
          "https://topcx.ai/api/backend/Admin_continue_registration",
          config
        );

        setGroups({
          ...response.data.groups,
          ...response.data.ingested_groups,
        });
      } catch (error) {
        if (error.response) {
          if (error.response.status === 401) {
          }
        } else {
        }
      }
    };

    fetchData();
  }, []);

  const bytesToMB = (bytes) => {
    const mb = bytes / 1048576;
    return mb.toFixed(2);
  };

  const handleCheckboxChange = (fileName, groupKey, groupName, isChecked) => {
    setAllowedGroups((prev) => {
      const currentSelectionGroupKeys = prev[fileName] || [];
      const currentSelectionGroupNames = prev[fileName + "Name"] || [];
      if (isChecked) {
        // Add the groupKey if the checkbox is checked
        return {
          ...prev,
          [fileName]: [...currentSelectionGroupKeys, groupKey],
          [fileName + "Name"]: [...currentSelectionGroupNames, groupName],
        };
      } else {
        // Remove the groupKey if the checkbox is unchecked
        return {
          ...prev,
          [fileName]: currentSelectionGroupKeys.filter(
            (key) => key !== groupKey
          ),
          [fileName + "Name"]: currentSelectionGroupNames.filter(
            (name) => name !== groupName
          ),
        };
      }
    });
  };

  const isFileTypeValid = (fileType) => {
    return validFileTypes.includes(fileType);
  };

  const handleSubmit = async (event) => {
    const fileDetails = files
      .filter((file) => file.type !== "link/url")
      .map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        allowedGroups: allowedGroups[file.name],
      }));
    const fileDetailsJson = JSON.stringify(fileDetails);

    const linkDetails = files
      .filter((link) => link.type === "link/url")
      .map((link) => ({
        name: link.name,
        allowedGroups: groups[link.name],
      }));
    const linkDetailsJson = JSON.stringify(linkDetails);

    const formData = new FormData();
    formData.append("subdomain", localStorage.getItem("subdomain"));
    formData.append("file_details", fileDetailsJson);
    formData.append("link_details", linkDetailsJson);
    if (files.length > 0) {
      files.forEach((file) => {
        if (file.type !== "link/url") {
          formData.append("files", file);
        }
      });
    }
    links.length > 0 &&
      links.forEach((link) => {
        formData.append("url_list", link);
      });

    event.preventDefault();
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };
    try {
      const response = await axios.post(
        `https://topcx.ai/api/backend/Admin_KnowledgeBase/`,

        formData,

        config
      );
      console.log(response.data);
      setFiles([]);
      setLinks([]);
    } catch (error) {
      console.log(error);
    } finally {
    }
  };

  const fileInputRef = useRef(null);

  const addFiles = (newFile) => {
    setFiles((prevFiles) => [...prevFiles, newFile]);
  };

  const handleSaveLinks = () => {
    const linkFiles = links.map((link) => ({ name: link, type: "link/url" }));
    setFiles([...files, ...linkFiles]);
  };

  const handleDeleteFile = (index) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);

    const updatedLinks = [...links];
    updatedLinks.splice(index, 1);
    setLinks(updatedLinks);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const items = e.dataTransfer.items;

    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === "file") {
        const file = items[i].getAsFile();

        if (!isFileTypeValid(file.type)) {
          alert("Invalid file format. File not supported.");
          continue;
        }

        if (file.size === 0) {
          alert("File is empty. Please select a valid file.");
          continue;
        }

        addFiles(file);
      }
    }
  };

  const handleFileInputChange = async (e) => {
    const inputFiles = e.target.files;

    for (let i = 0; i < inputFiles.length; i++) {
      const file = inputFiles[i];

      if (!isFileTypeValid(file.type)) {
        alert("Invalid file format. File not supported.");
        continue;
      }

      if (file.size === 0) {
        alert("File is empty. Please select a valid file.");
        continue;
      }

      addFiles(file);
    }
  };

  // ................................................................ Drop Table end

  const [avatar, setAvatar] = useState([
    ...(user.avater ? user.avater : []),
    { src: avatarImg },
  ]);
  useEffect(() => {
    const fetchData = async () => {
      const config = {
        headers: { "Access-Control-Allow-Origin": "*" },
        withCredentials: true,
      };

      try {
        const response = await axios.get(
          "https://topcx.ai/api/backend/ingestion_status",
          config
        );
        const filesArray = response.data.kb_status?.Files || [];
        const filesArray2 = response.data.kb_status || [];
        const filesArray3 = response.data.kb_status?.Links || [];

        setData(filesArray);
        setRate(filesArray2);
        setLinks(filesArray3);
      } catch (error) {
        if (error.response) {
          if (error.response.status === 401) {
          }
        } else {
        }
      }
    };

    fetchData();
  }, []);

  const columns = [
    {
      Header: "File Name",
      accessor: "name",
    },
    {
      Header: "File Type",
      accessor: "type",
    },
    {
      Header: "Status",
      accessor: "Status",
    },
  ];
  const columns2 = [
    {
      Header: "File Name",
      accessor: "name",
    },
    {
      Header: "Groups",
      accessor: "groups",
      Cell: ({ row }) => (
        <Dropdown
          isOpen={dropdownOpen && selectedGroup === row.original.name}
          toggle={() => setDropdownOpen(!dropdownOpen)}
        >
          <DropdownToggle caret>
            {selectedGroups[row.original.name] || "Select Groups"}
          </DropdownToggle>
          <DropdownMenu>
            {Object.entries(groups).map(([key, value]) => (
              <DropdownItem
                key={key}
                onClick={() =>
                  handleSelectGroup(row.original.name, key, value.name)
                }
              >
                {value.name}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      ),
    },
    {
      Header: "Selected Groups",
      accessor: "selectedGroups",
      Cell: ({ row }) => (
        <div>
          {selectedGroups[row.original.name] &&
            selectedGroups[row.original.name].map((groupName, index) => (
              <div key={index}>{groupName}</div>
            ))}
        </div>
      ),
    },
    {
      Header: "File Type",
      accessor: "type",
    },
    {
      Header: "File Size (MB)",
      accessor: "size",
      Cell: ({ value }) => bytesToMB(value),
    },
    {
      Header: "Edit",
      Cell: ({ row }) => (
        <div
          className="fs-0 mb-0 text-700 "
          style={{
            // backgroundColor: 'white',
            cursor: "pointer",
          }}
          onClick={() => handleDeleteFile(row.index)}
        >
          <FontAwesomeIcon icon="trash-alt" />
        </div>
      ),
    },
  ];

  const handleSelectGroup = (fileName, groupKey, groupName) => {
    setSelectedGroups((prev) => {
      const currentSelection = prev[fileName] || [];
      const updatedSelection = [...currentSelection, groupName];
      return { ...prev, [fileName]: updatedSelection };
    });
    setDropdownOpen(false);
  };
  return (
    <div>
      <FalconComponentCard>
        <FalconComponentCard.Header
          title="KnowledgeBase Ingestion"
          light={false}
          className="border-bottom border-200"
        />
        <Row className="mb-3 g-3">
          <Col md={12}>
            <FalconComponentCard.Body>
              <Tabs
                defaultActiveKey="Ingestion Status"
                id="uncontrolled-tab-example"
                transition={false}
              >
                <Tab
                  eventKey="Ingestion Status"
                  title="Ingestion Status"
                  className="border-bottom border-x p-3"
                >
                  <>
                    <Row className="mb-4">
                      <Col sm={6}>
                        <Card className="h-100 mb-4">
                          <Card.Body>
                            <Row className="flex-between-center">
                              <Col className="d-md-flex d-lg-block flex-between-center">
                                <h6 className="mb-md-0 mb-lg-2 text-primary fs-3">
                                  Success Rate
                                </h6>
                                <SoftBadge bg="primary">
                                  Ticket Ingestion
                                </SoftBadge>
                              </Col>
                              <Col xs="auto">
                                <h4 className="fs-3 fw-normal text-primary">
                                  <CountUp
                                    start={0}
                                    end={rate.success_percentage}
                                    suffix="%"
                                    duration={1}
                                    decimals={2}
                                    decimal="."
                                  />
                                </h4>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col sm={6}>
                        <Card className="h-100 mb-4">
                          <Card.Body>
                            <Row className="flex-between-center">
                              <Col className="d-md-flex d-lg-block flex-between-center">
                                <h6 className="mb-md-0 mb-lg-2 text-primary fs-3">
                                  Failure Rate
                                </h6>
                                <SoftBadge bg="primary">
                                  Ticket Ingestion
                                </SoftBadge>
                              </Col>
                              <Col xs="auto">
                                <h4 className="fs-3 fw-normal text-primary">
                                  <CountUp
                                    start={0}
                                    end={rate.failed_percentage}
                                    suffix="%"
                                    duration={1}
                                    decimals={2}
                                    decimal="."
                                  />
                                </h4>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <AdvanceTableWrapper
                      columns={columns}
                      data={data}
                      sortable
                      pagination
                      perPage={10}
                    >
                      <Row className=" mb-3">
                        <FalconComponentCard.Header
                          title="Files Ingestion Status"
                          light={false}
                          className="border-bottom border-200"
                        />
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
                  <FalconComponentCard className="mt-6">
                    {/* <FalconComponentCard.Body>  */}
                    <AdvanceTableWrapper
                      columns={columns}
                      data={links}
                      sortable
                      pagination
                      perPage={10}
                    >
                      <Row className=" mb-3">
                        <FalconComponentCard.Header
                          title="Links Ingestion Status"
                          light={false}
                          className="border-bottom border-200"
                        />
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
                    {/* </FalconComponentCard.Body> */}
                  </FalconComponentCard>
                </Tab>
                <Tab
                  eventKey="Ingest More"
                  title="Ingest More"
                  className="borde    r-bottom border-x p-3"
                >
                  <>
                    <Row className="mb-3">
                      <Col
                        md
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                      >
                        <FalconDropzone
                          files={avatar}
                          onChange={(files) => {
                            setAvatar(files);
                          }}
                          multiple={false}
                          accept="image/*"
                          placeholder={
                            <>
                              <Flex justifyContent="center">
                                <img
                                  src={cloudUpload}
                                  alt=""
                                  width={25}
                                  className="me-2"
                                />
                                <p className="fs-0 mb-0 text-700">
                                  Drag & drop files here, on click to select
                                  files
                                </p>
                              </Flex>
                              <p className="mb-0 w-75 mx-auto text-400">
                                Support All Formats of Texts, Docs, PDFs,
                                CSV/TSV, PPTs & JSON
                              </p>
                              <input
                                type="file"
                                multiple
                                onChange={handleFileInputChange}
                                className="d-none pb-3"
                                ref={fileInputRef}
                              />
                            </>
                          }
                        />
                      </Col>
                    </Row>
                    {files.length > 0 && (
                      <FalconComponentCard className="mt-6">
                        <AdvanceTableWrapper
                          columns={columns2}
                          data={files} // Assuming files contain the necessary data
                          sortable
                          pagination
                          perPage={10}
                        >
                          <Row className=" mb-3">
                            <FalconComponentCard.Header
                              title="Links Ingestion Status"
                              light={false}
                              className="border-bottom border-200"
                            />
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
                              rowCount={files.length}
                              table
                              rowInfo
                              navButtons
                              rowsPerPageSelection
                            />
                          </div>
                        </AdvanceTableWrapper>
                      </FalconComponentCard>
                    )}

                    {files.length > 0 && (
                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={handleSubmit}
                      >
                        submit
                      </button>
                    )}
                  </>
                </Tab>
              </Tabs>
            </FalconComponentCard.Body>
          </Col>
        </Row>
      </FalconComponentCard>
    </div>
  );
};

export default KnowledgeBase;

import React, { useEffect, useState } from "react";
import AdvanceTableWrapper from "../advance-table/AdvanceTableWrapper";
import AdvanceTable from "../advance-table/AdvanceTable";
import AdvanceTableFooter from "../advance-table/AdvanceTableFooter";
import usePagination from "../advance-table/usePagination";
import {
  Row,
  Col,
  Button,
  Form,
  InputGroup,
  Card,
  Badge,
  Spinner,
  Modal,
  CloseButton,
} from "react-bootstrap";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDropzone } from "react-dropzone";
import { IoCloudUploadOutline } from "react-icons/io5";
import { useForm } from "react-hook-form";
import { ApiConfig } from "config/ApiConfig";
import { toast } from "react-toastify";
import Loader from "components/Loader/Loader";
import SoftBadge from "components/common/SoftBadge";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "../Modules.css";
const ACCEPTED_FILE_TYPES = {
  "text/plain": [".txt"],
  "text/markdown": [".md"],
  "text/rtf": [".rtf"],
  "text/csv": [".csv"],
  "text/tab-separated-values": [".tsv"],
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
    ".xlsx",
  ],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [
    ".pptx",
  ],
  "application/vnd.ms-powerpoint.presentation.macroEnabled.12": [".pptm"],
  "application/json": [".json"],
  "application/epub+zip": [".epub"],
};

const MAX_FILE_SIZE = 500 * 1024 * 1024;

export default function BotX({
  // data,
  // allowedGroupsIngestion,
  // remainingGroupsIngestion,
  allGroups,
}) {
  //KB Ingestion----------------------
  const [links, setLinks] = useState([]);
  const [files, setFiles] = useState([]);
  const [files2, setFiles2] = useState([]);
  const [selectedFile, setSelectedFile] = useState({});

  const [showGroups, setShowGroups] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isLoadingSubmitKB, setIsLoadingSubmitKB] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const {
    register,
    watch,
    formState: { errors },
    trigger,
    reset,
  } = useForm();

  const bytesToMB = (bytes) => {
    const mb = bytes / 1048576;
    return mb.toFixed(2);
  };

  const handleAddUrl = async () => {
    const result = await trigger("url");
    if (result) {
      const urlValue = watch("url");
      const urlObject = {
        name: urlValue,
        type: "link/url",
        allowed_groups: [],
      };
      setFiles((prevFiles) => [...prevFiles, urlObject]);
      setLinks((prevLinks) => [...prevLinks, urlValue]);
      reset({ url: "" });
    }
  };

  const groupsTable = [
    {
      accessor: "name",
      Header: "Group Name",
      Cell: ({ row }) => (
        <Form.Check
          type="checkbox"
          name="groupSelection"
          id={`checkbox-${row.original.name}`}
          className="my-auto"
          label={<p className="m-0 ms-2">{row.original.name}</p>}
          checked={selectedFile.allowed_groups?.some(
            (group) => group.name === row.original.name
          )}
          onChange={(e) => handleGroupChange(e.target.checked, row.original)}
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

  const handleGroupChange = (isChecked, group) => {
    setSelectedFile((prevFile) => {
      const updatedGroups = isChecked
        ? [...prevFile.allowed_groups, group]
        : prevFile.allowed_groups.filter((g) => g.name !== group.name);
      return { ...prevFile, allowed_groups: updatedGroups };
    });
  };

  const handleSaveGroups = () => {
    setIsLoadingGroups(true);
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.name === selectedFile.name ? selectedFile : file
      )
    );

    setShowGroups(false);
    setIsLoadingGroups(false);
  };

  const {
    currentPageData: currentPageGroups,
    setPageSize: setPageSizeGroups,
    nextPage: nextPageGroups,
    previousPage: previousPageGroups,
    canNextPage: canNextPageGroups,
    canPreviousPage: canPreviousPageGroups,
    resetPagination: resetPaginationGroups,
    pageIndex: pageIndexGroups,
    pageSize: pageSizeGroups,
  } = usePagination(allGroups);

  const handleConfirmUpload = (e) => {
    setShowConfirmationModal(false);
    handleSubmitKB(e);
  };

  const handleCancelUpload = () => {
    setShowConfirmationModal(false);
  };

  const handleSubmitKB = async (event) => {
    const filesWithNoGroups = files.filter(
      (file) => file.allowed_groups.length === 0
    );

    if (filesWithNoGroups.length > 0) {
      toast.error("Select groups for all files/links before submitting");
      return;
    }

    const fileDetails = files
      .filter((file) => file.type !== "link/url")
      .map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        allowed_groups: file.allowed_groups,
      }));

    const fileDetailsJson = JSON.stringify(fileDetails);

    const linkDetails = files
      .filter((link) => link.type === "link/url")
      .map((link) => ({
        name: link.name,
        allowed_groups: link.allowed_groups,
      }));
    const linkDetailsJson = JSON.stringify(linkDetails);

    const formData = new FormData();
    formData.append("file_details", fileDetailsJson);
    formData.append("link_details", linkDetailsJson);

    if (files2.length > 0) {
      files2.forEach((files2) => {
        if (files2.type !== "link/url") {
          formData.append("files", files2);
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
      setIsLoadingSubmitKB(true);
      await axios.post(ApiConfig.KnowledgeBase, formData, config);
      if (fileDetails.length > 0 && linkDetails.length > 0) {
        toast.success("Files and Links Uploaded Successfully");
      } else if (fileDetails.length > 0) {
        toast.success("Files Uploaded Successfully");
      } else if (linkDetails.length > 0) {
        toast.success("Links Uploaded Successfully");
      }

      setFiles([]);
      setFiles2([]);
      setLinks([]);
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error);
    } finally {
      setIsLoadingSubmitKB(false);
    }
  };

  const handleDeleteFile = (index) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);

    const updatedLinks = [...links];
    updatedLinks.splice(index, 1);
    setLinks(updatedLinks);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    onDrop: (acceptedFiles, fileRejections) => {
      setFiles2((prevFiles) => [...prevFiles, ...acceptedFiles]);
      const newFiles = acceptedFiles.map((file) => {
        const newFile = {
          path: file.path,
          lastModified: file.lastModified,
          lastModifiedDate: file.lastModifiedDate,
          name: file.name,
          size: file.size,
          type: file.type,
          webkitRelativePath: file.webkitRelativePath,
          allowed_groups: [],
        };
        return newFile;
      });

      setFiles((prevFiles) => [...prevFiles, ...newFiles]);

      fileRejections.forEach((file) => {
        file.errors.forEach((error) => {
          if (error.code === "file-too-large") {
            toast.error(`File too large: ${file.file.name}`);
          } else if (error.code === "file-invalid-type") {
            toast.error(`File type not supported: ${file.file.name}`);
          } else {
            toast.error(`Error with file: ${file.file.name}`);
          }
        });
      });
    },
  });

  const kbColumns = [
    {
      Header: "File Name",
      accessor: "name",
    },
    {
      Header: "Groups",
      Cell: ({ row }) => (
        <Button
          variant="link"
          className="fs-0 mb-0 text-700"
          style={{ cursor: "pointer" }}
          onClick={() => {
            setSelectedFile(row.original);
            setShowGroups(true);
          }}
        >
          {row.original.allowed_groups.length}
        </Button>
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
        <Button
          variant="link"
          className="fs-0 mb-0 text-700 "
          style={{
            cursor: "pointer",
          }}
          onClick={() => handleDeleteFile(row.index)}
        >
          <FontAwesomeIcon icon="trash-alt" />
        </Button>
      ),
    },
  ];
  //KB Ingestion----------------------

  //KB Ingestion Status----------------------

  const [status, setStatus] = useState({});

  const [kbFiles, setKBFiles] = useState([]);
  const [kbLinks, setKBLinks] = useState([]);

  // Confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleteType, setDeleteType] = useState("");

  const [ingestionStatus, setIngestionStatus] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [hasErrorOccurred, setHasErrorOccurred] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (hasErrorOccurred && !isFirstLoad) return;
      const config = {
        headers: { "Access-Control-Allow-Origin": "*" },
        withCredentials: true,
      };

      try {
        setIsLoadingStatus(true);
        const res = await axios.get(ApiConfig.ingestionRunningStatus, config);
        setIngestionStatus(res.data.KB_ingestion_in_progress);
        const response = await axios.get(ApiConfig.kbIngestionStatus, config);
        setStatus(response?.data?.kb_status);
        setKBFiles(response?.data?.kb_status?.topcx_kb_files);
        setKBLinks(response?.data?.kb_status?.topcx_kb_links);
        setHasErrorOccurred(false);
      } catch (error) {
        toast.error(error.response?.data?.detail?.masked_error);
        setHasErrorOccurred(true);
      } finally {
        setIsLoadingStatus(false);
        if (isFirstLoad) setIsFirstLoad(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, [hasErrorOccurred, isFirstLoad]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Done":
        // return <Badge bg="success">{status}</Badge>;
        return <Badge bg="success">Success</Badge>;
      case "Error":
        return <Badge bg="danger">{status}</Badge>;
      case "In progress":
        return <Badge bg="warning">{status}</Badge>;
      case "Started":
        return <Badge bg="primary">{status}</Badge>;
      case "Not started":
        return <Badge bg="secondary">{status}</Badge>;
      case "protected":
        return (
          <>
            {/* <Badge
              bg="danger"
              data-tooltip-id="protected-tooltip"
              className="protected-badge"
            >
              {status}
            </Badge> */}
            <Badge
              bg="danger"
              data-tooltip-id="protected-tooltip"
              className="protected-badge"
            >
              Failed
            </Badge>
            <ReactTooltip
              id="protected-tooltip"
              place="bottom"
              content={
                "This file cannot be processed because it is password protected."
              }
              style={{ zIndex: 9999 }}
              delayShow={500}
            />
          </>
        );
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const handleDeleteFile1 = (file) => {
    setDeleteItem(file);
    setDeleteType("file");
    setShowDeleteModal(true);
  };

  const handleDeleteLink = (link) => {
    setDeleteItem(link);
    setDeleteType("link");
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deleteType === "file") {
      DeleteKB(deleteItem);
    } else if (deleteType === "link") {
      DeleteLink(deleteItem);
    }
    setShowDeleteModal(false);
    setDeleteItem(null);
  };

  const DeleteKB = async (kb) => {
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };

    const apiData = {
      file_name: kb?.name,
      file_type: kb?.type,
      folder_id: kb?.folder_id,
    };

    try {
      setIsDeleting(true);
      await axios.post(ApiConfig.kbDeletion, apiData, config);
      toast.success("File/Link deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error);
    } finally {
      setIsDeleting(false);
    }
  };
  const DeleteLink = async (url) => {
    const config = {
      headers: { "Access-Control-Allow-Origin": "*" },
      withCredentials: true,
    };

    const apiData = {
      file_name: url?.url,
      file_type: "Link",
      folder_id: url?.folder_id,
    };

    try {
      setIsDeleting(true);
      await axios.post(ApiConfig.kbDeletion, apiData, config);
      toast.success("File/Link deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error);
    } finally {
      setIsDeleting(false);
    }
  };

  const statusSection = (
    <Row className="my-3">
      <Col sm={6}>
        <Card className="h-100 mb-4">
          <Card.Body>
            <Row className="flex-between-center">
              <Col className="d-md-flex d-lg-block flex-between-center">
                <h6 className="mb-md-0 mb-lg-2 text-primary fs-3">
                  Success Rate
                </h6>
                <SoftBadge bg="primary">KB Ingestion</SoftBadge>
              </Col>
              <Col xs="auto">
                <h4 className="fs-3 fw-normal text-primary">
                  {status?.success_percentage?.toFixed(1)}%
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
                <SoftBadge bg="primary">KB Ingestion</SoftBadge>
              </Col>
              <Col xs="auto">
                <h4 className="fs-3 fw-normal text-primary">
                  {status?.failed_percentage?.toFixed(1)}%
                </h4>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
  const fileCard = (file) => (
    <>
      <Col md={6} lg={6} xl={4} className="mb-4" key={file.name}>
        <Card className="h-100">
          <Card.Body className="p-3">
            <div className="d-flex justify-content-between">
              <h5
                className="mb-3 text-primary overflow-hidden"
                style={{ whiteSpace: "nowrap", textOverflow: "ellipsis" }}
                title={file.name}
              >
                {file.name}
              </h5>
              <Button
                variant="link"
                onClick={() => handleDeleteFile1(file)}
                style={{ cursor: "pointer" }}
                disabled={
                  isDeleting ||
                  (file.status !== "Done" &&
                    file.status !== "protected" &&
                    file.status !== "Error")
                }
              >
                <FontAwesomeIcon icon="trash" className="text-muted" />
              </Button>
            </div>
            <p className="mb-1 text-muted" style={{ fontSize: "12px" }}>
              {file.type}
            </p>
            <p className="mb-0 text-muted" style={{ fontSize: "12px" }}>
              Size: {bytesToMB(file.size)} MB
            </p>
            <h6 className="mt-2">
              Status&nbsp;:&nbsp;&nbsp;&nbsp;{getStatusBadge(file.status)}
            </h6>
          </Card.Body>
        </Card>
      </Col>
    </>
  );

  const linkCard = (link) => (
    <Col md={6} lg={6} xl={4} className="mb-4" key={link.url}>
      <Card className="h-100">
        <Card.Body className="p-3">
          <div className="d-flex justify-content-between">
            <h5
              className="mb-3 text-primary overflow-hidden"
              style={{ whiteSpace: "nowrap", textOverflow: "ellipsis" }}
              title={link.url}
            >
              {link.url}
            </h5>
            <Button
              variant="link"
              onClick={() => handleDeleteLink(link)}
              disabled={
                isDeleting ||
                (link.status !== "Done" &&
                  link.status !== "protected" &&
                  link.status !== "Error")
              }
              style={{ cursor: "pointer" }}
            >
              <FontAwesomeIcon icon="trash" className="text-muted" />
            </Button>
          </div>
          <p className="mb-0 text-muted" style={{ fontSize: "12px" }}>
            Link
          </p>
          <h6 className="mt-2">
            Status&nbsp;:&nbsp;&nbsp;&nbsp;{getStatusBadge(link.status)}
          </h6>
        </Card.Body>
      </Card>
    </Col>
  );

  const tableSection = (
    <div className="mb-3">
      <h6 className="my-2">Ingested Files</h6>
      <Row>
        {kbFiles?.length > 0 ? (
          kbFiles.map((file) => fileCard(file))
        ) : (
          <Col>
            <h5 className="text-muted text-center my-3">No Data Found</h5>
          </Col>
        )}
      </Row>
      <h6 className="my-2">Ingested Links</h6>
      <Row>
        {kbLinks?.length > 0 ? (
          kbLinks.map((link) => linkCard(link))
        ) : (
          <Col>
            <h5 className="text-muted text-center my-3">No Data Found</h5>
          </Col>
        )}
      </Row>
    </div>
  );
  //KB Ingestion Status----------------------
  return (
    <>
      <div className="my-2">
        <h6 className="mb-2">Description</h6>
        <p className="text-muted">
          BotX, a specialized bot for your organization, answers agent queries
          using your internal technical or other knowledge bases in the form of
          documents, websites and many other formats
        </p>
      </div>
      {/* KB Ingestion---------------------- */}
      <div className="my-2">
        <hr />
        <h6>Upload your Files :</h6>
        <Row className="mb-3">
          <Col md {...getRootProps()}>
            <input {...getInputProps()} />
            <div
              style={{
                border: "2px dashed #000",
                padding: "20px",
                textAlign: "center",
              }}
            >
              {isDragActive ? (
                <p>Drop the files here ...</p>
              ) : (
                <>
                  <div>
                    <IoCloudUploadOutline className="mx-2" />
                  </div>
                  <p>Drag 'n' drop some files here, or click to select files</p>
                  <p>
                    Supports specific text, doc, pdf, csv/tsv, ppt, and json
                    formats up to 500MB
                  </p>
                </>
              )}
            </div>
          </Col>
        </Row>
        <Row className="mb-3">
          <Form.Label>Add Links</Form.Label>
          <InputGroup className="mb-3">
            <Form.Control
              type="url"
              placeholder="https://example.com"
              {...register("url", {
                required: "URL is required",
                pattern: {
                  value:
                    /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})$/,
                  message: "Please enter a valid URL",
                },
              })}
              isValid={errors.url}
              isInvalid={!!errors.url}
            />
            <Button variant="outline-secondary" onClick={handleAddUrl}>
              Add URL
            </Button>
            <Form.Control.Feedback type="invalid">
              {errors.url?.message}
            </Form.Control.Feedback>
          </InputGroup>
        </Row>
        {files.length > 0 && (
          <AdvanceTableWrapper
            columns={kbColumns}
            data={files}
            sortable
            pagination
            perPage={5}
          >
            <AdvanceTable
              table
              headerClassName="bg-200 text-900 text-nowrap align-middle"
              rowClassName="align-middle white-space-nowrap"
              tableProps={{
                // bordered: true,
                // striped: true,
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
        )}
        {files.length > 0 && (
          <div
            className="btn-group mx-auto d-flex justify-content-center w-25"
            role="group"
            aria-label="Basic mixed styles example"
          >
            <Button
              variant="falcon-success"
              onClick={() => setShowConfirmationModal(true)}
              disabled={isLoadingSubmitKB}
            >
              {isLoadingSubmitKB ? "Submitting" : "Submit"}
            </Button>
          </div>
        )}
      </div>
      <Modal
        show={showGroups}
        onHide={() => {
          setShowGroups(false);
          resetPaginationGroups();
        }}
        backdrop="static"
        keyboard={false}
        size="lg"
        centered
      >
        <Modal.Body>
          <div className="d-flex justify-content-between mt-2 mb-3">
            <Modal.Title>Edit Groups for {selectedFile?.name} </Modal.Title>
            <CloseButton
              onClick={() => {
                setShowGroups(false);
                resetPaginationGroups();
              }}
            />
          </div>
          <AdvanceTableWrapper
            key={pageSizeGroups}
            columns={groupsTable}
            data={currentPageGroups}
            sortable
            pagination
            perPage={pageSizeGroups}
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
                pageIndex={pageIndexGroups}
                pageSize={pageSizeGroups}
                nextPage={nextPageGroups}
                previousPage={previousPageGroups}
                canNextPage={canNextPageGroups}
                canPreviousPage={canPreviousPageGroups}
                page={currentPageGroups}
                rowCount={allGroups.length}
                setPageSize={setPageSizeGroups}
                rowInfo
                rowsPerPageSelection
                navButtons
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
              onClick={handleSaveGroups}
            >
              {isLoadingGroups ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
      {/* Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Body>
          <div className="d-flex justify-content-between mt-2 mb-3">
            <Modal.Title>Confirm Deletion</Modal.Title>
            <CloseButton onClick={() => setShowDeleteModal(false)} />
          </div>
          <p>
            Are you sure you want to delete{" "}
            {deleteItem?.name || deleteItem?.url}?
          </p>
          <div
            className="btn-group mx-auto d-flex justify-content-center w-50 mt-4 mb-3"
            role="group"
          >
            <Button
              variant="falcon-danger"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
            <Button
              variant="falcon-secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
          </div>
        </Modal.Body>
      </Modal>
      {/* confirmation for upload */}
      <Modal
        show={showConfirmationModal}
        onHide={handleCancelUpload}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Body>
          <div className="d-flex justify-content-between mt-2 mb-3">
            <Modal.Title>Confirm File Upload</Modal.Title>
            <CloseButton onClick={handleCancelUpload} />
          </div>
          <p>Are you sure the files are not duplicate or password-protected?</p>
          <div
            className="btn-group mx-auto d-flex justify-content-center w-50 mt-4 mb-3"
            role="group"
          >
            <Button
              variant="falcon-success"
              onClick={(e) => handleConfirmUpload(e)}
            >
              Yes, Upload
            </Button>
            <Button variant="falcon-secondary" onClick={handleCancelUpload}>
              Cancel
            </Button>
          </div>
        </Modal.Body>
      </Modal>
      {/* KB Ingestion---------------------- */}
      {/* KB Ingestion Status---------------------- */}
      <div className="my-2">
        <hr />
        {isLoadingStatus && isFirstLoad ? (
          <Loader />
        ) : (
          <>
            {ingestionStatus ? (
              <div className="mb-3">
                <p className="d-flex align-items-center text-danger fw-bold">
                  <Spinner
                    style={{ height: "10px", width: "10px" }}
                    animation="grow"
                    variant="danger"
                  />
                  &nbsp;&nbsp;LIVE &nbsp;
                  <h6 className="text-muted fw-bold d-flex align-items-center m-0">
                    (KnowledgeBase Processing)
                  </h6>
                </p>
              </div>
            ) : null}
            {ingestionStatus ? (
              <>
                {statusSection}
                {tableSection}
              </>
            ) : (
              <>
                {tableSection}
                {statusSection}
              </>
            )}
          </>
        )}
      </div>
      {/* KB Ingestion Status---------------------- */}
    </>
  );
}

import React, { useState } from "react";
import AdvanceTableWrapper from "components/common/advance-table/AdvanceTableWrapper";
import AdvanceTable from "components/common/advance-table/AdvanceTable";
import AdvanceTableFooter from "components/common/advance-table/AdvanceTableFooter";
import { Row, Col, Button, Form, InputGroup } from "react-bootstrap";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDropzone } from "react-dropzone";
import { IoCloudUploadOutline } from "react-icons/io5";
import { useForm } from "react-hook-form";
import { ApiConfig } from "config/ApiConfig";
import { toast } from "react-toastify";

const ACCEPTED_FILE_TYPES = [
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

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB

const ResolutionModal = (props) => {
  const {
    register,
    watch,
    formState: { errors },
    trigger,
    reset,
  } = useForm();

  const [links, setLinks] = useState([]);
  const [files, setFiles] = useState([]);

  const bytesToMB = (bytes) => {
    const mb = bytes / 1048576;
    return mb.toFixed(2);
  };

  const handleAddUrl = async () => {
    const result = await trigger("url");
    if (result) {
      const urlValue = watch("url");
      const urlObject = { name: urlValue, type: "link/url" };
      setFiles((prevFiles) => [...prevFiles, urlObject]);
      setLinks((prevLinks) => [...prevLinks, urlValue]);
      reset({ url: "" });
    }
  };

  const handleSubmitKB = async (event) => {
    const updatedAllowedGroups = props?.data?.groups?.filter(
      (group) => group.isChecked
    );

    const fileDetails = files
      .filter((file) => file.type !== "link/url")
      .map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        allowed_groups: updatedAllowedGroups,
      }));
    const fileDetailsJson = JSON.stringify(fileDetails);

    const linkDetails = files
      .filter((link) => link.type === "link/url")
      .map((link) => ({
        name: link.name,
        allowed_groups: updatedAllowedGroups,
      }));
    const linkDetailsJson = JSON.stringify(linkDetails);

    const formData = new FormData();
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
      await axios.post(ApiConfig.KnowledgeBase, formData, config);
      setFiles([]);
      setLinks([]);
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error);
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
    accept: ACCEPTED_FILE_TYPES.reduce(
      (acc, type) => ({ ...acc, [type]: [] }),
      {}
    ),
    maxSize: MAX_FILE_SIZE,
    onDrop: (acceptedFiles, fileRejections) => {
      setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);

      fileRejections.forEach((file) => {
        alert(`File not supported: ${file.file.name}`);
      });
    },
  });

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

  return (
    <>
      <h2 className="text-center mb-3">{props.data.name} Settings</h2>
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
          columns={columns}
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
        <div className="d-flex justify-content-end mt-3">
          <button
            type="button"
            className="btn btn-success"
            onClick={handleSubmitKB}
          >
            submit
          </button>
        </div>
      )}
    </>
  );
};

export default ResolutionModal;

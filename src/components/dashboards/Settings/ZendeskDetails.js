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

const ZendeskDetails = () => {
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const config = {
        headers: { "Access-Control-Allow-Origin": "*" },
        withCredentials: true,
      };

      try {
        const response = await axios.get(
          "https://topcx.ai/api/backend/Admin_view_credentials",
          config
        );
        setData(response.data);
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
  return (
    <div>
      <FalconComponentCard>
        <FalconComponentCard.Header
          title="Zendesk Details"
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
                    <Form.Label>Zendesk Subdomain</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter Email"
                      name="firstName"
                      value={data.subdomain}
                    />
                  </Form.Group>
                  <Form.Group
                    as={Col}
                    lg={4}
                    className="mb-4"
                    controlId="InviteMember"
                  >
                    <Form.Label>Zendesk Email</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter Email"
                      value={data.email}
                      name="firstName"
                    />
                  </Form.Group>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <Form.Group
                    as={Col}
                    lg={4}
                    className="mb-4"
                    controlId="InviteMember"
                  >
                    <Form.Label>Zendesk API Token</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter Email"
                      name="firstName"
                      value={data.token}
                    />
                  </Form.Group>
                  <Form.Group
                    as={Col}
                    lg={4}
                    className="mb-4"
                    controlId="InviteMember"
                  >
                    <Form.Label>Zendesk Application Token</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter Email"
                      name="firstName"
                      value={
                        data?.other_details?.Zendesk_app_installation_token
                      }
                    />
                  </Form.Group>
                </div>
                <Button variant="falcon-primary" className="me-2">
                  Edit
                </Button>
              </FalconComponentCard.Body>
            </FalconComponentCard>
          </Col>
        </Row>
      </FalconComponentCard>
    </div>
  );
};

export default ZendeskDetails;

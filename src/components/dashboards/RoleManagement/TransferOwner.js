import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ApiConfig } from "config/ApiConfig";
import { Row, Col } from "react-bootstrap";
import Loader from "components/Loader/Loader";

const TransferOwner = () => {
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

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
      console.log(response);
    } catch (error) {
      toast.error(error.response?.data?.detail?.masked_error);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  useEffect(() => {
    fetchRoleData();
  }, []);

  return (
    <>
      {isLoadingRoles ? (
        <Loader />
      ) : (
        <Row className="mb-3">
          <Col xs={12} sm={8} lg={7}>
            <p>hello</p>
          </Col>
        </Row>
      )}
    </>
  );
};
export default TransferOwner;

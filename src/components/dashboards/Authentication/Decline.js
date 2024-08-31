import React from "react";
import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function Decline() {
  const navigate = useNavigate();

  const handleRetry = () => {
    navigate("/");
  };

  return (
    <Card className="text-center my-auto">
      <Card.Body className="p-5">
        <p className="lead mt-4 text-800 font-sans-serif fw-semi-bold">
          You need to accept the terms and conditions to continue.
        </p>
        <hr />
        <p>
          Please try again by refreshing the page or clicking the button below.
        </p>
        <Button variant="primary" onClick={handleRetry}>
          Try Again
        </Button>
      </Card.Body>
    </Card>
  );
}

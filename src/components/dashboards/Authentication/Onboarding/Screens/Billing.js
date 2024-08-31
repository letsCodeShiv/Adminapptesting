/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import { Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";

const Billing = () => {
  const {
    register,
    formState: { errors },
  } = useForm();

  return (
    <>
      <Form.Check
        type="checkbox"
        id={"agreedToTerms" + Math.floor(Math.random() * 100)}
      >
        <Form.Check.Input
          type="checkbox"
          {...register("agreedToTerms", {
            required: "You need to agree the terms and privacy policy.",
          })}
          isInvalid={errors.agreedToTerms}
          isValid={!!errors.agreedToTerms}
        />
        <Form.Check.Label className="ms-2">
          I accept the <Link to="#!"> terms</Link> and{" "}
          <Link to="#!"> privacy policy</Link>
        </Form.Check.Label>
        <Form.Control.Feedback type="invalid" className="mt-0">
          {errors.agreedToTerms?.message}
        </Form.Control.Feedback>
      </Form.Check>
    </>
  );
};

export default Billing;

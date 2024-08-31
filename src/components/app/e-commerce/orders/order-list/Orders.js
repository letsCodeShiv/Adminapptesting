import React from "react";
import { Card, Dropdown } from "react-bootstrap";
import { orderList } from "data/ecommerce/orderList";
import CardDropdown from "components/common/CardDropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SoftBadge from "components/common/SoftBadge";
import classNames from "classnames";
import { Link } from "react-router-dom";
import OrdersTableHeader from "./OrdersTableHeader";
import AdvanceTableWrapper from "components/common/advance-table/AdvanceTableWrapper";
import AdvanceTable from "components/common/advance-table/AdvanceTable";
import AdvanceTablePagination from "components/common/advance-table/AdvanceTablePagination";

const columns = [
  {
    accessor: "name",
    Header: "Order",
    headerProps: { className: "pe-1" },
    cellProps: {
      className: "py-2",
    },
    Cell: (rowData) => {
      const { id, name, email } = rowData.row.original;
      return (
        <>
          <Link to="/e-commerce/orders/order-details">
            <strong>{id}</strong>
          </Link>{" "}
          by <strong>{name}</strong> <br />
          <a href={`mailto:${email}`}>{email}</a>
        </>
      );
    },
  },
  {
    accessor: "date",
    Header: "Date",
    headerProps: { className: "pe-7" },
  },
  {
    accessor: "none",
    Header: "",
    disableSortBy: true,
    cellProps: {
      className: "text-end",
    },
    Cell: () => {
      return (
        <CardDropdown>
          <div className="py-2">
            <Dropdown.Item href="#!">Completed</Dropdown.Item>
            <Dropdown.Item href="#!">Processing</Dropdown.Item>
            <Dropdown.Item href="#!">On Hold</Dropdown.Item>
            <Dropdown.Item href="#!">Pending</Dropdown.Item>
            <Dropdown.Divider as="div" />
            <Dropdown.Item href="#!" className="text-danger">
              Delete
            </Dropdown.Item>
          </div>
        </CardDropdown>
      );
    },
  },
];

const Orders = () => {
  return (
    <AdvanceTableWrapper
      columns={columns}
      data={orderList}
      selection
      sortable
      pagination
      perPage={10}
    >
      <Card className="mb-3">
        <Card.Header>
          <OrdersTableHeader table />
        </Card.Header>
        <Card.Body className="p-0">
          <AdvanceTable
            table
            headerClassName="bg-200 text-900 text-nowrap align-middle"
            rowClassName="align-middle white-space-nowrap"
            tableProps={{
              size: "sm",
              striped: true,
              className: "fs--1 mb-0 overflow-hidden",
            }}
          />
        </Card.Body>
        <Card.Footer>
          <AdvanceTablePagination table />
        </Card.Footer>
      </Card>
    </AdvanceTableWrapper>
  );
};

export default Orders;

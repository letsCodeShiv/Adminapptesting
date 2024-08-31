import React from "react";
import PropTypes from "prop-types";
import { Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const AdvanceTable = ({
  getTableProps,
  headers,
  page,
  prepareRow,
  headerClassName,
  bodyClassName,
  rowClassName,
  tableProps,
  handleCellClick,
}) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    handleCellClick(e.value);
    navigate("/analytics-dashboard/details");
  };

  return (
    <div className="table-responsive scrollbar">
      <Table {...getTableProps(tableProps)}>
        <thead className={headerClassName}>
          <tr>
            {headers.map((column, index) => (
              <th
                key={index}
                {...column.getHeaderProps(
                  column.getSortByToggleProps(column.headerProps)
                )}
              >
                {column.render("Header")}
                {column.canSort ? (
                  column.isSorted ? (
                    column.isSortedDesc ? (
                      <span className="sort desc" />
                    ) : (
                      <span className="sort asc" />
                    )
                  ) : (
                    <span className="sort" />
                  )
                ) : (
                  ""
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={bodyClassName}>
          {page.map((row, i) => {
            prepareRow(row);
            const isUserActive = row.original.status === "active";
            const rowClasses = `${rowClassName} ${
              isUserActive ? "cursor-pointer" : "cursor-pointer"
            }`;
            return (
              <tr key={i} className={rowClasses} {...row.getRowProps()}>
                {row?.cells?.map((cell, index) => {
                  return (
                    <td
                      key={index}
                      {...cell.getCellProps(cell?.column?.cellProps)}
                      // onClick={() => handleClick(cell?.value)}
                    >
                      {cell?.render("Cell")}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};
AdvanceTable.propTypes = {
  getTableProps: PropTypes.func,
  headers: PropTypes.array,
  page: PropTypes.array,
  prepareRow: PropTypes.func,
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  rowClassName: PropTypes.string,
  tableProps: PropTypes.object,
};

export default AdvanceTable;

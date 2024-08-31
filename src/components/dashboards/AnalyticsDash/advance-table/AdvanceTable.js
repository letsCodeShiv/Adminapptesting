import React from "react";
import PropTypes from "prop-types";
import { Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./table.css";

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
  handleCellClickName,
  handleCellKpiGroup,
  handleCellKpiIndex,
  handleCellKpiName,
}) => {
  const navigate = useNavigate();

  const handleClick = (id, value, index_1, index_2, kpiName) => {
    handleCellClick(id);
    handleCellClickName(value);
    handleCellKpiGroup(index_1);
    handleCellKpiIndex(index_2);
    handleCellKpiName(kpiName);
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
            const rowClasses = `${rowClassName} table-row-hover ${
              isUserActive ? "cursor-pointer" : "cursor-pointer"
            }`;

            return (
              <tr key={i} className={rowClasses} {...row.getRowProps()}>
                {row?.cells?.map((cell, index) => {
                  const id = row.original.id;
                  const index_1 = row.original.index_1;
                  const index_2 = row.original.index_2;
                  const kpi_name = row.original.kpi_name;
                  const name = row.original.name;
                  return (
                    <td
                      key={index}
                      {...cell.getCellProps(cell?.column?.cellProps)}
                      onClick={() =>
                        handleClick(id, name, index_1, index_2, kpi_name)
                      }
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
  handleCellClick: PropTypes.func,
};

export default AdvanceTable;

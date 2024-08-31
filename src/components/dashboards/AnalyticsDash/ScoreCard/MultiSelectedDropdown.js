// Dropdowns.js
import React, { useState } from "react";
import { MultiSelect } from "primereact/multiselect";
import { useFilters } from "context/Filter";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "./main.css";
const MultiSelectDropdown = ({
  options,
  selectedValues,
  onChange,
  filterKey,
}) => {
  const { updateFilter } = useFilters();

  const handleChange = (e) => {
    const values = e.value || [];
    onChange(values);
    updateFilter(filterKey, values);
  };

  return (
    <>
      <MultiSelect
        value={selectedValues}
        onChange={handleChange}
        options={options}
        placeholder="Select a value"
        maxSelectedLabels={1}
        className="custom-multiselect w-full md:w-20rem"
        style={{ fontSize: "14px" }}
      />
    </>
  );
};

export { MultiSelectDropdown };

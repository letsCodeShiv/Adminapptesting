// FilterContext.js
import React, { createContext, useContext, useState } from "react";
const FilterContext = createContext();

const initialFilters = {
  startDate: new Date(),
  endDate: new Date(),
  team: "",
  agent: "",
  channel: "",
};

const FilterProvider = ({ children }) => {
  const [filters, setFilters] = useState(initialFilters);

  const updateFilter = (filterName, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [filterName]: value }));
  };

  return (
    <FilterContext.Provider value={{ filters, updateFilter }}>
      {children}
    </FilterContext.Provider>
  );
};

const useFilters = () => {
  return useContext(FilterContext);
};

export { FilterProvider, useFilters };

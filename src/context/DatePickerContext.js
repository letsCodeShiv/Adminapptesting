import React, { createContext, useState, useEffect } from "react";
import { startOfMonth } from "date-fns";

const DateRangeContext = createContext();

const DateRangeProvider = ({ children }) => {
  const loadDateRange = () => {
    const storedStartDate = localStorage.getItem("startDate");
    const storedEndDate = localStorage.getItem("endDate");
    return {
      startDate: storedStartDate
        ? new Date(storedStartDate)
        : startOfMonth(new Date()),
      endDate: storedEndDate ? new Date(storedEndDate) : new Date(),
    };
  };

  const [dateRange, setDateRange] = useState(loadDateRange());

  useEffect(() => {
    localStorage.setItem("startDate", dateRange.startDate);
    localStorage.setItem("endDate", dateRange.endDate);
  }, [dateRange]);

  const updateDateRange = (start, end) => {
    setDateRange({ startDate: start, endDate: end });
  };
  console.log(dateRange, "------Date------");
  return (
    <DateRangeContext.Provider value={{ dateRange, updateDateRange }}>
      {children}
    </DateRangeContext.Provider>
  );
};

export { DateRangeContext, DateRangeProvider };

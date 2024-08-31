import React, { createContext, useState, useEffect } from "react";

const ClickedValueContext = createContext();

const ClickedValueProvider = ({ children }) => {
  const loadClickedValue = () => {
    return localStorage.getItem("clickedValue") || "";
  };

  const loadClickedTeam = () => {
    return localStorage.getItem("clickedTeam") || "";
  };
  const loadSelectedGroup = () => {
    return localStorage.getItem("selectedGroup") || "";
  };

  const loadSelectedKPI = () => {
    return localStorage.getItem("selectedKPI") || "";
  };
  const loadSelectedKPIName = () => {
    return localStorage.getItem("selectedKPIName") || "";
  };
  const loadFristCard = () => {
    return localStorage.getItem("firstCard") || "";
  };
  const loadSecondCard = () => {
    return localStorage.getItem("secondCard") || "";
  };
  const loadThirdCard = () => {
    return localStorage.getItem("thirdCard") || "";
  };

  const [clickedValue, setClickedValue] = useState([loadClickedValue]);
  const [clickedTeam, setClickedTeam] = useState(loadClickedTeam);
  const [selectedGroup, setSelectedGroup] = useState(loadSelectedGroup);
  const [selectedKPI, setSelectedKPI] = useState(loadSelectedKPI);
  const [selectedKPIName, setSelectedKPIName] = useState(loadSelectedKPIName);
  const [kpiIndex, setKpiIndex] = useState(null);
  // ..............................................First Page DropDown Kpi State

  const [firstCard, setFirstCard] = useState(loadFristCard);
  const [secondCard, setSecondCard] = useState(loadSecondCard);
  const [thirdCard, setThirdCard] = useState(loadThirdCard);

  useEffect(() => {
    localStorage.setItem("firstCard", firstCard);
  }, [firstCard]);
  useEffect(() => {
    localStorage.setItem("secondCard", secondCard);
  }, [secondCard]);
  useEffect(() => {
    localStorage.setItem("thirdCard", thirdCard);
  }, [thirdCard]);
  // ................................................End here
  useEffect(() => {
    localStorage.setItem("clickedValue", clickedValue);
  }, [clickedValue]);
  useEffect(() => {
    localStorage.setItem("clickedTeam", clickedTeam);
  }, [clickedTeam]);
  useEffect(() => {
    localStorage.setItem("selectedGroup", selectedGroup);
  }, [selectedGroup]);

  useEffect(() => {
    localStorage.setItem("selectedKPI", selectedKPI);
  }, [selectedKPI]);
  useEffect(() => {
    localStorage.setItem("selectedKPIName", selectedKPIName);
  }, [selectedKPIName]);

  return (
    <ClickedValueContext.Provider
      value={{
        clickedValue,
        setClickedValue,
        clickedTeam,
        setClickedTeam,
        selectedGroup,
        setSelectedGroup,
        selectedKPI,
        setSelectedKPI,
        kpiIndex,
        setKpiIndex,
        setSelectedKPIName,
        selectedKPIName,
        setFirstCard,
        firstCard,
        setSecondCard,
        secondCard,
        setThirdCard,
        thirdCard,
      }}
    >
      {children}
    </ClickedValueContext.Provider>
  );
};

export { ClickedValueContext, ClickedValueProvider };

import React from "react";
import { MultiSelect } from "primereact/multiselect";
import { Dropdown } from "primereact/dropdown";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import { Col } from "react-bootstrap";

const FilterControls = ({
  kpiList,
  selectedKPIs,
  handleKPIChange,
  groupe,
  setGroupe,
  groupby,
  dynamicFilter,
  dynamicFilterSet,
  setDynamicFilterSet,
  selectedTeams,
  selectedAgent,
  selectedChannels,
  startDate,
  endDate,
  teamData,
  topicData,
  groupData,
  cardData,
}) => {
  return (
    <React.Fragment>
      <Col md={6}>
        <Dropdown
          value={selectedKPIs}
          onChange={handleKPIChange}
          options={kpiList}
          optionLabel="label"
          optionValue="id"
          maxSelectedLabels={1}
          placeholder="Select KPI"
          className="w-full md:w-20rem"
        />
      </Col>
      <Col md={3}>
        <Dropdown
          value={groupe}
          onChange={(e) => {
            setGroupe(e.value);
          }}
          options={groupby}
          optionLabel="name"
          className="w-full md:w-14rem"
        />
      </Col>
      <Col md={3}>
        <MultiSelect
          value={dynamicFilterSet}
          onChange={(e) => {
            setDynamicFilterSet(e.value);
          }}
          options={dynamicFilter}
          optionLabel="value"
          optionValue="id"
          placeholder="Select Channels"
          maxSelectedLabels={1}
          className="w-full md:w-20rem"
          panelClassName={
            Object.keys(dynamicFilter).length > 0 ? "" : "hidden-checkbox"
          }
        />
      </Col>
    </React.Fragment>
  );
};

export default FilterControls;
